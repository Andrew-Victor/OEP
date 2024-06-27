import os

import cv2
import numpy as np


class FaceDetector:
    MODEL_PATH = "face_detector/opencv_face_detector_uint8.pb"
    PBTXT_PATH = "face_detector/opencv_face_detector.pbtxt"

    def __init__(self):
        # Check if the model files exist
        if not os.path.exists(self.MODEL_PATH):
            raise FileNotFoundError(f"The model path '{self.MODEL_PATH}' does not exist.")
        if not os.path.exists(self.PBTXT_PATH):
            raise FileNotFoundError(f"The pbtxt path '{self.PBTXT_PATH}' does not exist.")

        try:
            self.net = cv2.dnn.readNetFromTensorflow(self.MODEL_PATH, self.PBTXT_PATH)
        except cv2.error as e:
            raise RuntimeError(f"Failed to load the model files. Error: {str(e)}")
    def detect_faces(self, frame):
        image = cv2.imread(frame)  # This returns a NumPy array
        blob = cv2.dnn.blobFromImage(image, 1.0, (300, 300), [104., 177., 123.], False, False)
        self.net.setInput(blob)
        detections = self.net.forward()
        face_count = 0

        for i in range(0, detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            if confidence > 0.7:
                face_count += 1
                box = detections[0, 0, i, 3:7] * np.array([image.shape[1], image.shape[0], image.shape[1], image.shape[0]])
                (startX, startY, endX, endY) = box.astype("int")
                text = "{:.3f}%".format(confidence * 100)
                y = startY - 10 if startY - 10 > 10 else startY + 10
                cv2.rectangle(image, (startX, startY), (endX, endY), (255, 0, 0), 3)
                cv2.putText(image, text, (startX, y), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)

        return face_count, image
