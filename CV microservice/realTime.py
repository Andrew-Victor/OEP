import traceback
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import uuid
from datetime import datetime
from face_detector.detector import FaceDetector
from object_detection import YOLODetector
from mediapipe_face_mesh import main

# Paths to the YOLO files
weights_path = "object_detection/config/yolov3.weights"
config_path = "object_detection/config/yolov3.cfg"
names_path = "object_detection/config/coco.names"

# initialize the YOLO detector
yolo = YOLODetector(weights_path, config_path, names_path)
headPose = main
# initialize face detector
app = FastAPI()

# directory where images will be saved
UPLOAD_DIRECTORY = "uploaded_images"

# ensure the directory exists
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

# et up CORS
origins = [
    "http://localhost",  # Add your frontend URL here
    "http://localhost:5500",
    "http://localhost:63342",
    ""  # Add any other URLs that will access your backend
]
face_detector = FaceDetector()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/upload-image/")
async def upload_image(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    print("hit server")
    try:
        # generating file name
        # TODO refactor later to take student name and id
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_id = str(uuid.uuid4())
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{timestamp}_{unique_id}.{file_extension}"

        # path of saved files
        file_path = os.path.join(UPLOAD_DIRECTORY, unique_filename)
        # saving file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            cellPhoneDetected, susimage = yolo.image_detect(file_path, "suspics")
            face_count, labeled_image = face_detector.detect_faces(file_path)
            direction = headPose.process_image(file_path)
            print("direction", direction)
        return {
                "filename": unique_filename,
                "file_path": file_path,
                "cellPhoneDetected": cellPhoneDetected,
                "face_count": face_count,
                "direction": direction

                }
    except Exception as e:
        print(traceback.format_exc())  # Print the full traceback
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
