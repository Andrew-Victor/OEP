from typing import NamedTuple
import numpy as np
from mediapipe.python.solution_base import SolutionBase
from .constants import BINARYPB_FILE_PATH

class FaceMesh(SolutionBase):
    """MediaPipe Face Mesh.

    MediaPipe Face Mesh processes an RGB image and returns the face landmarks on
    each detected face.
    """

    def __init__(self,
                 static_image_mode=False,
                 max_num_faces=1,
                 refine_landmarks=False,
                 min_detection_confidence=0.5,
                 min_tracking_confidence=0.5):
        """Initializes a MediaPipe Face Mesh object."""
        super().__init__(
            binary_graph_path=BINARYPB_FILE_PATH,
            side_inputs={
                'num_faces': max_num_faces,
                'with_attention': refine_landmarks,
                'use_prev_landmarks': not static_image_mode,
            },
            calculator_params={
                'facedetectionshortrangecpu__facedetectionshortrange__facedetection__TensorsToDetectionsCalculator.min_score_thresh':
                    min_detection_confidence,
                'facelandmarkcpu__ThresholdingCalculator.threshold':
                    min_tracking_confidence,
            },
            outputs=['multi_face_landmarks'])

    def process(self, image: np.ndarray) -> NamedTuple:
        """Processes an RGB image and returns the face landmarks on each detected face."""
        return super().process(input_data={'image': image})
