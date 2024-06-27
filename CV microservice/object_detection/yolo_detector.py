import cv2
import numpy as np
import os


class YOLODetector:
    def __init__(self, weights_path, config_path, names_path):
        if not os.path.exists(weights_path):
            raise FileNotFoundError(f"Weights file not found: {weights_path}")
        if not os.path.exists(config_path):
            raise FileNotFoundError(f"Config file not found: {config_path}")
        if not os.path.exists(names_path):
            raise FileNotFoundError(f"Names file not found: {names_path}")

        self.net = cv2.dnn.readNet(weights_path, config_path)
        with open(names_path, "r") as f:
            self.classes = [line.strip() for line in f.readlines()]
        self.output_layers = [layer_name for layer_name in self.net.getUnconnectedOutLayersNames()]
        self.colors = np.random.uniform(0, 255, size=(len(self.classes), 3))

    def detect_objects(self, frame):
        blob = cv2.dnn.blobFromImage(frame, scalefactor=0.00392, size=(320, 320), mean=(0, 0, 0), swapRB=True,
                                     crop=False)
        self.net.setInput(blob)
        outputs = self.net.forward(self.output_layers)

        boxes = []
        confs = []
        class_ids = []

        for output in outputs:
            for detect in output:
                scores = detect[5:]
                class_id = np.argmax(scores)
                conf = scores[class_id]
                if class_id == 0 or class_id == 67:  # Only detect person and cell phone
                    center_x = int(detect[0] * frame.shape[1])
                    center_y = int(detect[1] * frame.shape[0])
                    w = int(detect[2] * frame.shape[1])
                    h = int(detect[3] * frame.shape[0])
                    x = int(center_x - w / 2)
                    y = int(center_y - h / 2)
                    boxes.append([x, y, w, h])
                    confs.append(float(conf))
                    class_ids.append(class_id)
        return boxes, confs, class_ids

    def draw_labels(self, boxes, confs, class_ids, frame):
        font = cv2.FONT_HERSHEY_PLAIN
        indexes = cv2.dnn.NMSBoxes(boxes, confs, 0.5, 0.4)
        for i in range(len(boxes)):
            if i in indexes:
                x, y, w, h = boxes[i]
                label = "person" if class_ids[i] == 0 else "cell phone"

                color = self.colors[class_ids[i]]
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                cv2.putText(frame, label, (x, y - 5), font, 1, color, 1)

        # Resizing the image to a smaller size
        resized_frame = cv2.resize(frame, (900, 700))  # Change dimensions as needed
        # cv2.imshow("Image", resized_frame)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
        return frame

    def image_detect(self, image_path):
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not read the image: {image_path}")

        boxes, confs, class_ids = self.detect_objects(image)

        # Check if a cell phone is detected
        cell_phone_detected = 67 in class_ids
        print(f"Cell phone detected: {cell_phone_detected}")

        # Draw labels on the image
        image_with_labels = self.draw_labels(boxes, confs, class_ids, image)

        return cell_phone_detected, image_with_labels
