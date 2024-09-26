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
        model = tf.keras.models.load_model(model_path)
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
    return img_array.reshape(1, 28, 28)

def recognize_digit(request):
    if request.method == 'POST' and 'canvas_data' in request.POST:
        canvas_data = request.POST['canvas_data']
        try:
            img_array = process_image(canvas_data)
            model = get_model()
            prediction = model.predict(img_array)
            digit = int(np.argmax(prediction))
            logger.debug(f"Recognized digit: {digit}")
            return JsonResponse({'digit': digit})
        except ValueError as e:
            logger.error(f"Invalid image data: {e}")
            return JsonResponse({'error': 'Invalid image data'}, status=400)
        except Exception as e:
            logger.error(f"An error occurred: {e}")
            return JsonResponse({'error': 'An error occurred'}, status=500)
    return render(request, 'recognition/draw.html')
