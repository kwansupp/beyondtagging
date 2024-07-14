document.addEventListener('DOMContentLoaded', () => {
    const imageSelect = document.getElementById('image-select');
    const selectedImage = document.getElementById('selected-image');
    const submitBtn = document.getElementById('image-select-btn');

    fetch('/getimages')
        .then(response => response.json())
        .then(images => {
            console.log(images.filenames);
            const gallery = document.getElementById('image-gallery');
            images.filenames.forEach(image => {
                // add image name as options in dropdown
                const option = document.createElement('option');
                option.value = image;
                option.textContent = image;
                imageSelect.appendChild(option);
                // const imgElement = document.createElement('img');
                // imgElement.src = `img/${image}`;
                // imgElement.alt = image;
                // gallery.appendChild(imgElement);
            });
        })
        .catch(error => {
            console.error('Error fetching images:', error);
        });

    // on change select, update image in container
    imageSelect.addEventListener('change', () => {
        const selectedImageValue = imageSelect.value;
        if(selectedImageValue) {
            selectedImage.src = '/img/'+selectedImageValue;
            selectedImage.alt = selectedImageValue;
            selectedImage.style.display = 'block';
        } else {
            selectedImage.style.display = 'none';
        }
    })

    // on submit, go to recording page for image
    submitBtn.addEventListener('click', () => {
        const selectedImageValue = imageSelect.value;
        // strip value of extension
        let dotLastIndex = selectedImageValue.lastIndexOf('.');
        let fileName = selectedImageValue.substring(0, dotLastIndex);

        if(selectedImageValue) {
            window.location.href = '/record/' + fileName +'?image=' +selectedImageValue;
        } else {
            alert('Please select an image to record before proceeding');
        }

    })
});