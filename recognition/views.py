# views.py
from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
import base64
from PIL import Image
from io import BytesIO
import numpy as np
import tensorflow as tf
import os
import logging

# Setup logger
logger = logging.getLogger(__name__)

# Load model once during startup
model = None

def get_model():
    global model
    if model is None:
        model_path = os.path.join(settings.BASE_DIR, 'recognition', 'ml', 'mnist_model.h5')
        try:
            model = tf.keras.models.load_model(model_path)
        except FileNotFoundError as e:
            logger.error(f"Model file not found: {e}")
            raise e  # Reraise to handle it in the view
    return model

def process_image(canvas_data):
    """Convert base64 image data to a numpy array suitable for the model."""
    header, encoded = canvas_data.split(',', 1)
    img_str = base64.b64decode(encoded)
    img = Image.open(BytesIO(img_str)).convert('L')
    img = img.resize((28, 28))  # Resize to 28x28 pixels
    img_array = np.array(img)
    img_array = 255 - img_array  # Invert colors
    img_array = img_array / 255.0  # Normalize
    return img_array.reshape(1, 28, 28, 1)  # Add channel dimension

def recognize_digit(request):
    logger.debug(f"Request method: {request.method}")
    if request.method == 'POST' and 'canvas_data' in request.POST:
        canvas_data = request.POST['canvas_data']
        
        # Check for valid canvas data
        if not canvas_data or not canvas_data.startswith('data:image/png;base64,'):
            logger.error("Invalid canvas data received.")
            return JsonResponse({'error': 'Invalid canvas data'}, status=400)
        
        logger.debug(f"Canvas data received: {canvas_data[:50]}...")  # Log first 50 chars
        
        try:
            img_array = process_image(canvas_data)
            model = get_model()
            prediction = model.predict(img_array)
            digit = int(np.argmax(prediction))
            confidence = float(np.max(prediction)) * 100  # Extract confidence (probability) and convert to percentage
            logger.debug(f"Recognized digit: {digit}, Confidence: {confidence:.2f}%")
            return JsonResponse({'digit': digit, 'confidence': confidence})
        except ValueError as e:
            logger.error(f"Invalid image data: {e}")
            return JsonResponse({'error': 'Invalid image data'}, status=400)
        except Exception as e:
            logger.error(f"An error occurred: {e}")
            return JsonResponse({'error': 'An error occurred'}, status=500)
    
    return render(request, 'recognition/draw.html')

