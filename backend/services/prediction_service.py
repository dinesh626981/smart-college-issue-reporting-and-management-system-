import os
import joblib
from backend.ai.train_model import train

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, '..', 'ai', 'model.joblib')

class PredictionService:
    _model = None

    @classmethod
    def get_model(cls):
        """Loads and returns the model, training it first if not found."""
        if cls._model is None:
            # Check if model file exists
            if not os.path.exists(MODEL_PATH):
                print("AI Model not found. Training model on startup...")
                train()
            
            # Load the model pipeline
            try:
                cls._model = joblib.load(MODEL_PATH)
            except Exception as e:
                print(f"Error loading model: {str(e)}. Retraining...")
                train()
                cls._model = joblib.load(MODEL_PATH)
                
        return cls._model

    @classmethod
    def predict_category(cls, text):
        """Predicts the category of a complaint given its text description."""
        if not text or not text.strip():
            return "Other"
            
        model = cls.get_model()
        if model is None:
            return "Other"
            
        try:
            # Run prediction on text
            prediction = model.predict([text.lower()])[0]
            return prediction
        except Exception as e:
            print(f"AI prediction error: {str(e)}")
            return "Other"
