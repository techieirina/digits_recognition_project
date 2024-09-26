let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let painting = false;

// Set initial canvas background color to white
function initCanvas() {
    ctx.fillStyle = 'white'; // Background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

function startPosition(e) {
    painting = true;
    draw(e);
}

function endPosition() {
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black'; // Drawing color

    // Adjust the drawing coordinates to the canvas size
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function clearCanvas() {
    ctx.fillStyle = 'white'; // Set background color to white
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function submitCanvas() {
    let dataURL = canvas.toDataURL('image/png');
    
    // Log the dataURL for debugging
    console.log('Canvas Data URL:', dataURL);

    // Create and display the image preview
    /*let previewImage = document.getElementById('previewImage');
    previewImage.src = dataURL;
    previewImage.style.display = 'block';  // Show the image*/

    // Create a download link and set the URL
    /*let downloadLink = document.getElementById('downloadLink');
    downloadLink.href = dataURL;
    downloadLink.style.display = 'block';  // Show the link
    downloadLink.click();  // Trigger download
    downloadLink.style.display = 'none';  // Hide the link again*/

    // Prepare the data to be sent
    let formData = new FormData();
    formData.append('canvas_data', dataURL);

    // Send the data to your Django view
    fetch('', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken') // Add CSRF token if using Django's CSRF protection
        }
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from Django
        console.log('Response Data:', data);
        document.getElementById('result').innerText = `Recognized Digit: ${data.digit}`;
    })
    .catch(error => console.error('Error:', error));
}

// Function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Initialize the canvas
initCanvas();