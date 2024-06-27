import time

import cv2
import numpy as np
from base64 import b64decode

model_path = "opencv_face_detector_uint8.pb"
pbtxt_path = "opencv_face_detector.pbtxt"

net = cv2.dnn.readNetFromTensorflow(model_path, pbtxt_path)


def detect_faces(frame):
    start_time = time.time()
    # Perform face detection
    blob = cv2.dnn.blobFromImage(frame, 1.0, (300, 300), [104., 177., 123.], False, False)
    net.setInput(blob)
    detections = net.forward()
    face_count = 0

    # Process the detections
    for i in range(0, detections.shape[2]):
        # Get the confidence (probability) of the current detection:
        confidence = detections[0, 0, i, 2]
        # Only consider detections if confidence is greater than a fixed minimum confidence:
        if confidence > 0.7:
            face_count += 1
            # Get the coordinates of the current detection:
            box = detections[0, 0, i, 3:7] * np.array([frame.shape[1], frame.shape[0], frame.shape[1], frame.shape[0]])
            (startX, startY, endX, endY) = box.astype("int")
            # Draw the detection and the confidence:
            text = "{:.3f}%".format(confidence * 100)
            y = startY - 10 if startY - 10 > 10 else startY + 10
            cv2.rectangle(frame, (startX, startY), (endX, endY), (255, 0, 0), 3)
            cv2.putText(frame, text, (startX, y), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)

    # Display the result
    cv2.imshow("frame", frame)
    cv2.waitKey(0)  # Wait for a key press to close the window
    cv2.destroyAllWindows()
    end_time = time.time()
    elapsed_time = end_time - start_time

    print("time taken to get photo is " ,elapsed_time )
    return face_count
