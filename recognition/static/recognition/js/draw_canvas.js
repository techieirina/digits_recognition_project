// JavaScript to display the selected file name

// Get references to the image upload input and the display area for the chosen file name
const imageUpload = document.getElementById('image-upload');
const fileChosen = document.getElementById('file-chosen');

// Event listener to update the fileChosen element with the name of the selected file
imageUpload.addEventListener('change', function() {
    // Update text content based on whether a file is chosen
    fileChosen.textContent = this.files.length > 0 ? this.files[0].name : 'No file chosen';
});

// Get the canvas element and its 2D drawing context
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let painting = false; // Flag to indicate if the user is currently drawing

// Function to initialize the canvas with a white background
function initCanvas() {
    ctx.fillStyle = 'white'; // Set the background color
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with the background color
}

// Event listeners to handle mouse and touch events for drawing on the canvas
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

// Add touch event listeners for mobile devices
canvas.addEventListener('touchstart', startPosition);
canvas.addEventListener('touchend', endPosition);
canvas.addEventListener('touchmove', draw);

// Function to start drawing when the mouse or touch is detected
function startPosition(e) {
    painting = true; // Set painting flag to true
    draw(e); // Call draw function to register the starting point
}

// Function to stop drawing when the mouse or touch is released
function endPosition() {
    painting = false; // Set painting flag to false
    ctx.beginPath(); // Start a new path to avoid connecting lines
}

// Function to draw on the canvas based on mouse/touch movement
function draw(e) {
    if (!painting) return; // Exit if not currently painting

    // Set the properties for the drawing
    ctx.lineWidth = 10; // Line thickness
    ctx.lineCap = 'round'; // Round end cap for lines
    ctx.strokeStyle = 'black'; // Set the drawing color

    // Get the canvas's bounding rectangle to adjust coordinates
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left; // Get the X coordinate
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top; // Get the Y coordinate

    // Draw the line to the current position
    ctx.lineTo(x, y);
    ctx.stroke(); // Render the line
    ctx.beginPath(); // Start a new path for the next segment
    ctx.moveTo(x, y); // Move to the current position for the next segment
}

// Function to clear the canvas
function clearCanvas() {
    ctx.fillStyle = 'white'; // Set background color to white
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas with white

    // Reset the prediction result displayed
    document.getElementById('result').innerText = 'NONE'; // Reset prediction text
}

// Function to submit the canvas drawing for recognition
function submitCanvas() {
    let dataURL = canvas.toDataURL('image/png'); // Convert canvas to a data URL

    // Log the data URL for debugging purposes
    console.log('Canvas Data URL:', dataURL);

    // Validate the data URL
    if (!dataURL || !dataURL.startsWith('data:image/png;base64,' )) {
        console.error("Invalid data URL");
        return;
    }

    // Prepare the data to be sent to the server
    let formData = new FormData();
    formData.append('canvas_data', dataURL); // Append the canvas data to the form data

    // Send the data to the Django view using fetch API
    fetch('/', {  // Update to your correct endpoint
        method: 'POST', // Set the request method to POST
        body: formData, // Include the form data in the body
        headers: {
            'X-CSRFToken': getCookie('csrftoken') // Add CSRF token for security
        }
    })
    .then(response => {
        return response.text(); // Read as text first
    })
    .then(data => {
        console.log('Raw Response Data:', data); // Log the raw response
        try {
            const jsonData = JSON.parse(data); // Try to parse JSON
            console.log('Parsed JSON Data:', jsonData);
            document.getElementById('result').innerText = `${jsonData.digit}`; // Update displayed digit
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    })
    .catch(error => console.error('Fetch error:', error)); // Log any errors that occur
}

// Function to upload an image for recognition
function uploadImage() {
    const fileInput = document.getElementById('image-upload'); // Get the file input element
    const file = fileInput.files[0]; // Get the first selected file

    if (file) {
        const reader = new FileReader(); // Create a new FileReader to read the file
        reader.onload = function(event) {
            const canvasData = event.target.result; // Get the base64 string of the image

            // Send the image data to the server for recognition
            fetch('', {
                method: 'POST', // Set the request method to POST
                body: new URLSearchParams({
                    'canvas_data': canvasData // Send the image data
                }),
                headers: {
                    'X-CSRFToken': getCookie('csrftoken') // Ensure CSRF token is sent
                }
            })
            .then(response => response.json()) // Parse the JSON response
            .then(data => {
                document.getElementById('result').innerText = `${data.digit}`; // Update the displayed recognized digit
                // Reset the displayed file name after prediction
                document.getElementById('file-chosen').innerText = 'No file chosen'; // Reset prediction text
            })
            .catch(error => console.error('Error:', error)); // Log any errors that occur
        };

        reader.readAsDataURL(file); // Convert the image to a base64 string
    } else {
        alert('Please select an image file.'); // Alert the user if no file is selected
    }
}

// Function to get the CSRF token from cookies for secure requests
function getCookie(name) {
    let cookieValue = null;
    // Check if cookies are available
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';'); // Split cookies into an array
        // Loop through cookies to find the desired one
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1)); // Decode and return the cookie value
                break; // Exit the loop once the cookie is found
            }
        }
    }
    return cookieValue; // Return the cookie value or null
}

// Initialize the canvas when the script loads
initCanvas();
