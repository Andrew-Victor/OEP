import cv2

import os

# Load the pre-trained face detection model
cascade_path = os.path.join(os.path.dirname(__file__), 'haarcascade_frontalface_default.xml')
if not os.path.exists(cascade_path):
    raise FileNotFoundError(f"The cascade file {cascade_path} does not exist.")
face_cascade = cv2.CascadeClassifier(cascade_path)


def detect_faces(image_path, save_path):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"The image path {image_path} does not exist.")

    # Read the image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Failed to load image from {image_path}.")

    # Convert the image to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Apply Gaussian blur to reduce noise and improve detection
    gray = cv2.GaussianBlur(gray, (5, 5), 0)

    # Detect faces in the image
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    print(faces)

    # Draw rectangles around detected faces
    for (x, y, w, h) in faces:
        cv2.rectangle(img, (x, y), (x + w, y + h), (255, 0, 0), 3)

    # Resize the image to a smaller size
    scale_percent = 50  # percent of original size
    width = int(img.shape[1] * scale_percent / 100)
    height = int(img.shape[0] * scale_percent / 100)
    dim = (width, height)
    resized_img = cv2.resize(img, dim, interpolation=cv2.INTER_AREA)

    # Display the output
    # cv2.imshow('Detected Faces', resized_img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    print("number of faces is : " + str(len(faces)))