from django.shortcuts import render

def recognize_digit(request):
    if request.method == 'POST':
        if 'canvas_data' in request.POST:
            # Get the base64 data from the POST request
            canvas_data = request.POST['canvas_data']
    # Render the template
    return render(request, 'recognition/draw.html')
