document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const imageUpload = document.getElementById('imageUpload');
    const grayscaleSlider = document.getElementById('grayscale');
    const sepiaSlider = document.getElementById('sepia');
    const blurSlider = document.getElementById('blur');
    const brightnessSlider = document.getElementById('brightness');
    const contrastSlider = document.getElementById('contrast');
    const resetBtn = document.getElementById('reset');
    const removeBtn = document.getElementById('remove');
    const saveBtn = document.getElementById('save');
    const noImageMessage = document.getElementById('no-image-message');
    
    // Get all value display elements
    const valueDisplays = document.querySelectorAll('.value-display');

    // Variables to store the original image and current filter settings
    let originalImage = null;
    let currentSettings = {
        grayscale: 0,
        sepia: 0,
        blur: 0,
        brightness: 100,
        contrast: 100
    };

    // Initial state - disable controls
    updateControlsState(false);
    
    // Load image when file is selected
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Set canvas dimensions to match the image
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // Draw the original image
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // Store the original image data
                    originalImage = new Image();
                    originalImage.src = canvas.toDataURL();
                    
                    // Make canvas visible
                    canvas.style.display = 'block';
                    noImageMessage.style.display = 'none';
                    
                    // Enable controls
                    updateControlsState(true);
                    
                    // Reset all filters and adjustments
                    resetFilters();
                    
                    // Add animation to the canvas
                    canvas.classList.add('loaded');
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Apply grayscale filter
    grayscaleSlider.addEventListener('input', () => {
        if (!originalImage) return;
        
        currentSettings.grayscale = parseInt(grayscaleSlider.value);
        updateValueDisplay(grayscaleSlider, grayscaleSlider.value + '%');
        applyFilters();
    });

    // Apply sepia filter
    sepiaSlider.addEventListener('input', () => {
        if (!originalImage) return;
        
        currentSettings.sepia = parseInt(sepiaSlider.value);
        updateValueDisplay(sepiaSlider, sepiaSlider.value + '%');
        applyFilters();
    });

    // Apply blur filter
    blurSlider.addEventListener('input', () => {
        if (!originalImage) return;
        
        currentSettings.blur = parseInt(blurSlider.value);
        updateValueDisplay(blurSlider, blurSlider.value + 'px');
        applyFilters();
    });

    // Apply brightness adjustment
    brightnessSlider.addEventListener('input', () => {
        if (!originalImage) return;
        
        currentSettings.brightness = parseInt(brightnessSlider.value);
        updateValueDisplay(brightnessSlider, brightnessSlider.value + '%');
        applyFilters();
    });

    // Apply contrast adjustment
    contrastSlider.addEventListener('input', () => {
        if (!originalImage) return;
        
        currentSettings.contrast = parseInt(contrastSlider.value);
        updateValueDisplay(contrastSlider, contrastSlider.value + '%');
        applyFilters();
    });

    // Reset all filters
    resetBtn.addEventListener('click', resetFilters);
    
    // Remove the image
    removeBtn.addEventListener('click', () => {
        if (!originalImage) return;
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Reset variables
        originalImage = null;
        canvas.style.display = 'none';
        noImageMessage.style.display = 'flex';
        imageUpload.value = '';
        
        // Disable controls
        updateControlsState(false);
        
        // Reset all sliders
        resetFilters();
        
        // Remove loaded animation class
        canvas.classList.remove('loaded');
    });

    // Save the edited image
    saveBtn.addEventListener('click', () => {
        if (!originalImage) return;
        
        // Temporarily add a class for animation
        saveBtn.classList.add('saving');
        
        // Create a temporary link element
        const downloadLink = document.createElement('a');
        downloadLink.download = 'edited-image.png';
        downloadLink.href = canvas.toDataURL('image/png');
        downloadLink.click();
        
        // Remove animation class after a short delay
        setTimeout(() => {
            saveBtn.classList.remove('saving');
        }, 1000);
    });

    // Reset all filters and adjustments
    function resetFilters() {
        if (!originalImage && !noImageMessage.style.display === 'none') return;
        
        // Reset all settings to default
        currentSettings = {
            grayscale: 0,
            sepia: 0,
            blur: 0,
            brightness: 100,
            contrast: 100
        };
        
        // Reset UI elements
        grayscaleSlider.value = 0;
        sepiaSlider.value = 0;
        blurSlider.value = 0;
        brightnessSlider.value = 100;
        contrastSlider.value = 100;
        
        // Update value displays
        updateValueDisplay(grayscaleSlider, '0%');
        updateValueDisplay(sepiaSlider, '0%');
        updateValueDisplay(blurSlider, '0px');
        updateValueDisplay(brightnessSlider, '100%');
        updateValueDisplay(contrastSlider, '100%');
        
        // If we have an original image, clear and redraw
        if (originalImage) {
            // Clear the canvas and redraw the original image
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
            
            // Add animation for reset action
            canvas.classList.add('reset-animation');
            setTimeout(() => {
                canvas.classList.remove('reset-animation');
            }, 500);
        }
    }

    // Apply all current filters to the image
    function applyFilters() {
        if (!originalImage) return;
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the original image
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        
        // Apply filters using CSS filter property via a temporary canvas
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        
        // Build the CSS filter string
        let filterString = '';
        
        if (currentSettings.grayscale > 0) {
            filterString += `grayscale(${currentSettings.grayscale / 100}) `;
        }
        if (currentSettings.sepia > 0) {
            filterString += `sepia(${currentSettings.sepia / 100}) `;
        }
        if (currentSettings.blur > 0) {
            filterString += `blur(${currentSettings.blur}px) `;
        }
        if (currentSettings.brightness !== 100) {
            filterString += `brightness(${currentSettings.brightness / 100}) `;
        }
        if (currentSettings.contrast !== 100) {
            filterString += `contrast(${currentSettings.contrast / 100}) `;
        }
        
        // Apply the filters
        if (filterString !== '') {
            tempCtx.filter = filterString;
            tempCtx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(tempCanvas, 0, 0);
        }
    }
    
    // Helper function to update the value display next to a slider
    function updateValueDisplay(slider, text) {
        const display = slider.nextElementSibling;
        if (display && display.classList.contains('value-display')) {
            display.textContent = text;
        }
    }
    
    // Helper function to enable/disable controls based on image availability
    function updateControlsState(enabled) {
        const sliders = document.querySelectorAll('input[type="range"]');
        const buttons = document.querySelectorAll('.action-buttons button');
        
        sliders.forEach(slider => {
            slider.disabled = !enabled;
        });
        
        buttons.forEach(button => {
            button.disabled = !enabled;
        });
        
        // Update opacity of the controls container to provide visual feedback
        document.querySelector('.filter-controls').style.opacity = enabled ? '1' : '0.7';
    }
}); 