import traceback
import json
import cv2
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Response
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import uuid
from pathlib import Path

from starlette.responses import StreamingResponse
from starlette.staticfiles import StaticFiles

from face_detector.detector import FaceDetector
from object_detection import YOLODetector
from mediapipe_face_mesh import main
import requests
from io import BytesIO


# Paths to the YOLO files
weights_path = "object_detection/config/yolov3.weights"
config_path = "object_detection/config/yolov3.cfg"
names_path = "object_detection/config/coco.names"

# Initialize the YOLO detector
yolo = YOLODetector(weights_path, config_path, names_path)
headPose = main

# Initialize face detector
face_detector = FaceDetector()

# Initialize FastAPI app
app = FastAPI()

# Directory where images will be saved
uploaded_base_dir = "uploaded"

# Ensure the base directory exists
os.makedirs(uploaded_base_dir, exist_ok=True)

# Set up CORS
origins = [
    "http://localhost",  # Add your frontend URL here
    "http://localhost:5500",
    "http://localhost:63342",
    "http://localhost:5173"  # Add any other URLs that will access your backend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# folder_path should be set to a meaningful value if you are going to use it
app.mount("/sus", StaticFiles(directory="sus"), name="sus")

@app.get("/health")
async def health_check():
    return {"status": "ok"}


def unique_id():
    return str(uuid.uuid4())


@app.post("/upload-image/{exam_id}/{student_id}")
async def upload_image(exam_id: str, student_id: str, file: UploadFile = File(...)):
    try:
        file_path = save_file(file, student_id, exam_id)
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    return {
        "isImageReceived": "YES",
        "image_path": file_path
    }


def save_file(file, student_id, exam_id):
    # Check if exam_id is valid and not empty
    if not exam_id or exam_id.strip() == '':
        raise ValueError("Exam ID must be provided and cannot be empty")

    # Ensure student_id is also not empty or invalid
    if not student_id or student_id.strip() == '':
        raise ValueError("Student ID must be provided and cannot be empty")

    # Generate unique filename using student_id and a unique identifier

    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{student_id}_{unique_id()}.{file_extension}"

    # Directory to save the uploaded files
    uploaded_dir = os.path.join(uploaded_base_dir, exam_id, student_id)
    os.makedirs(uploaded_dir, exist_ok=True)

    # Path to save the file
    file_path = os.path.join(uploaded_dir, unique_filename)

    # Save the file to the specified path
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path


def get_images_from_folder(folder_path):
    image_files = []
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(root, file)
            image_files.append(file_path)
    return image_files


folder_path = uploaded_base_dir

images = get_images_from_folder(folder_path)


def analyze_images(images):
    sus_dict = {
        "direction": [],
        "face_count": [],
        "phone_detected": [],
        "all_images": []
    }
    for image in images:
        direction, head_posed_img = headPose.process_image(image)
        face_count, labeled_image = face_detector.detect_faces(image)
        cell_phone_detect, susimage = yolo.image_detect(image)
        if direction != "Forward":
            image_path = save_image(head_posed_img, "sus", "headPose")
            sus_dict["direction"].append(image_path)
            sus_dict["all_images"].append(image_path)

        if face_count > 1:
            image_path = save_image(labeled_image, "sus", "face_count")
            sus_dict["face_count"].append(image_path)
            sus_dict["all_images"].append(image_path)

        if cell_phone_detect:
            image_path = save_image(susimage, "sus", "phoneDetect")
            sus_dict["phone_detected"].append(image_path)
            sus_dict["all_images"].append(image_path)
    return sus_dict


def save_image(image, base_dir, sub_dir):
    # Ensure the base directory exists, create if not
    if not os.path.exists(base_dir):
        os.makedirs(base_dir)

    # Ensure the sub directory exists, create if not
    sub_dir_path = os.path.join(base_dir, sub_dir)
    if not os.path.exists(sub_dir_path):
        os.makedirs(sub_dir_path)

    # Generate a unique filename for each image
    image_name = f"image_{len(os.listdir(sub_dir_path)) + 1}.jpg"
    image_path = os.path.join(sub_dir_path, image_name)

    # Save the image to the specified path
    cv2.imwrite(image_path, image)
    print(f"Image saved: {image_path}")
    return image_path


@app.get("/trigger/{exam_id}/{student_id}")
async def analyzeImage(exam_id, student_id):
    print("hit analyze")
    folder = "uploaded/" + exam_id + "/" + student_id
    dict = analyze_images(get_images_from_folder(folder))
    json_data = json.dumps(dict)
    print(json_data)
    return Response(content=json_data, media_type="application/json")

images_dir = Path("static/images")



if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
