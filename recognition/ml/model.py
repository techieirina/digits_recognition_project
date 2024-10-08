import tensorflow as tf
from tensorflow import keras
from keras import layers, models, datasets
import numpy as np
import matplotlib.pyplot as plt

# Load and preprocess the data
(x_train, y_train), (x_test, y_test) = datasets.mnist.load_data()

# Normalize the data
x_train, x_test = x_train / 255.0, x_test / 255.0

# Build the model
model = models.Sequential([
    layers.Flatten(input_shape=(28, 28)),
    layers.Dense(128, activation='relu'),
    layers.Dense(10, activation='softmax')
])

# Compile the model
model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

# Train the model
model.fit(x_train, y_train, epochs=10)

# Save the model
model.save('recognition/ml/mnist_model.h5')

# Evaluate the model
loss, accuracy = model.evaluate(x_test, y_test)
print(f"Model accuracy on test data: {accuracy:.2f}")

# Make predictions on some test images
def plot_image(img, label, prediction):
    plt.figure(figsize=(2,2))
    plt.imshow(img, cmap='gray')
    plt.title(f"True label: {label}, Predicted: {prediction}")
    plt.axis('off')
    plt.show()

# Take a few test images and make predictions
num_samples = 2
for i in range(num_samples):
    img = x_test[i]
    true_label = y_test[i]
    
    # Make prediction
    img_array = img.reshape(1, 28, 28)  # Reshape for prediction
    prediction = model.predict(img_array)
    predicted_label = np.argmax(prediction)
    
    # Plot the image with its true label and predicted label
    plot_image(img, true_label, predicted_label)
