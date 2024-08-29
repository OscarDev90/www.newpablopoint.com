document.addEventListener('DOMContentLoaded', () => {
    const slidesPreview = document.getElementById('slidesPreview');
    const activeSlide = document.getElementById('activeSlide');
    let slides = [];
    let currentSlideIndex = -1;
    let selectedElement = null;
    let isMoving = false;
    let isResizing = false;

    function createSlide() {
        const slide = document.createElement('div');
        slide.className = 'slidePreview';
        slide.innerHTML = `Diapositiva ${slides.length + 1}`;
        slide.addEventListener('click', () => selectSlide(slide));
        slidesPreview.appendChild(slide);
        slides.push({ elements: [] });
        selectSlide(slide);
    }

    function selectSlide(slide) {
        const index = Array.from(slidesPreview.children).indexOf(slide);
        if (index !== currentSlideIndex) {
            saveCurrentSlideElements();
            currentSlideIndex = index;
            activeSlide.innerHTML = '';
            slides[currentSlideIndex].elements.forEach(element => {
                activeSlide.appendChild(element.cloneNode(true));
            });
            playAudioInSlide(activeSlide);
        }
    }

    function saveCurrentSlideElements() {
        const elements = Array.from(activeSlide.children).map(child => {
            return child.cloneNode(true);
        });
        slides[currentSlideIndex].elements = elements;
    }

    function addImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/png, image/jpeg';
        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.position = 'absolute';
                    img.style.left = '10px';
                    img.style.top = '10px';
                    img.className = 'draggable';
                    img.addEventListener('mousedown', onMouseDown);
                    img.addEventListener('dblclick', onDoubleClickResize);
                    activeSlide.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
        input.click();
    }

    function addText() {
        const text = document.createElement('div');
        text.innerHTML = 'Texto';
        text.style.position = 'absolute';
        text.style.left = '10px';
        text.style.top = '10px';
        text.className = 'draggable';
        text.contentEditable = false;
        text.addEventListener('mousedown', onMouseDown);
        text.addEventListener('dblclick', () => {
            text.contentEditable = true;
            text.focus();
        });
        text.addEventListener('blur', () => {
            text.contentEditable = false;
        });
        text.addEventListener('dblclick', onDoubleClickResize);
        activeSlide.appendChild(text);
    }

    function addVideo() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/mp4';
        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const video = document.createElement('video');
                    video.src = e.target.result;
                    video.style.position = 'absolute';
                    video.style.left = '0';
                    video.style.top = '0';
                    video.style.width = '100%';  // Ajustar ancho del video al ancho de la diapositiva
                    video.style.height = '100%'; // Ajustar alto del video al alto de la diapositiva
                    video.className = 'draggable';
                    video.controls = true;
                    video.addEventListener('mousedown', onMouseDown);
                    video.addEventListener('dblclick', onDoubleClickResize);
                    activeSlide.appendChild(video);
                };
                reader.readAsDataURL(file);
            }
        });
        input.click();
    }

    function addAudio() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/mp3';
        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const audio = document.createElement('audio');
                    audio.src = e.target.result;
                    audio.style.position = 'absolute';
                    audio.style.left = '10px';
                    audio.style.top = '10px';
                    audio.className = 'draggable';
                    audio.controls = true;
                    audio.autoplay = false;
                    audio.dataset.autoplay = "true";
                    audio.addEventListener('mousedown', onMouseDown);
                    activeSlide.appendChild(audio);
                };
                reader.readAsDataURL(file);
            }
        });
        input.click();
    }

    function playAudioInSlide(slide) {
        const audios = slide.querySelectorAll('audio');
        audios.forEach(audio => {
            if (audio.dataset.autoplay === "true") {
                audio.play();
            }
        });
    }

    function onMouseDown(event) {
        selectedElement = event.target;
        startX = event.clientX;
        startY = event.clientY;
        isMoving = true;
        startLeft = parseInt(selectedElement.style.left) || 0;
        startTop = parseInt(selectedElement.style.top) || 0;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(event) {
        if (isMoving) {
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;
            selectedElement.style.left = startLeft + dx + 'px';
            selectedElement.style.top = startTop + dy + 'px';
        }
    }

    function onMouseUp() {
        isMoving = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    function onDoubleClickResize(event) {
        const element = event.target;
        if (!isResizing) {
            const resizer = document.createElement('div');
            resizer.className = 'resizer bottom-right';
            element.appendChild(resizer);
            resizer.addEventListener('mousedown', startResizing);
        }
    }

    function startResizing(event) {
        event.preventDefault();
        isResizing = true;
        const resizer = event.target;
        const element = resizer.parentElement;

        startX = event.clientX;
        startY = event.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
        startLeft = parseInt(element.style.left) || 0;
        startTop = parseInt(element.style.top) || 0;

        document.addEventListener('mousemove', resizeElement);
        document.addEventListener('mouseup', stopResizing);
    }

    function resizeElement(event) {
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        selectedElement.style.width = startWidth + dx + 'px';
        selectedElement.style.height = startHeight + dy + 'px';
    }

    function stopResizing() {
        isResizing = false;
        document.removeEventListener('mousemove', resizeElement);
        document.removeEventListener('mouseup', stopResizing);
    }

    // Event listeners for the buttons
    document.getElementById('newSlideBtn').addEventListener('click', createSlide);
    document.getElementById('addImageBtn').addEventListener('click', addImage);
    document.getElementById('addTextBtn').addEventListener('click', addText);
    document.getElementById('addVideoBtn').addEventListener('click', addVideo);
    document.getElementById('addAudioBtn').addEventListener('click', addAudio);
    document.getElementById('exportPptxBtn').addEventListener('click', () => {
        alert('En desarrollo');
    });

    // Create the first slide by default
    createSlide();
});
