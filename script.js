document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    const form = document.getElementById('figureForm');
    const steps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const progressFill = document.getElementById('progressFill');
    let currentStep = 1;
    window.formData = {
        photo: null,
        clothesDescription: '',
        pose: '',
        size: '',
        price: 0,
        preview: null,
        contact: {
            fullName: '',
            email: '',
            phone: '',
            address: '',
            country: '',
            city: '',
            postcode: ''
        }
    };

    // Initialize form
    initForm();

    function initForm() {
        // Step 1: Photo Upload
        const photoUpload = document.getElementById('photoUpload');
        const photoInput = document.getElementById('photoInput');
        const photoPreview = document.getElementById('photoPreview');
        const previewImage = document.getElementById('previewImage');
        const removePhoto = document.getElementById('removePhoto');
        const photoError = document.getElementById('photoError');
        const step1Next = document.getElementById('step1Next');

        photoUpload.addEventListener('click', () => {
            photoInput.click();
        });

        photoInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                
                // Validate file type and size
                if (!['image/jpeg', 'image/png'].includes(file.type)) {
                    showError(photoError, 'Моля, качете JPEG или PNG файл.');
                    return;
                }
                
                if (file.size > 10 * 1024 * 1024) { // 10MB
                    showError(photoError, 'Размерът на файла трябва да бъде по-малък от 10MB.');
                    return;
                }
                
                formData.photo = file;
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    previewImage.src = e.target.result;
                    photoUpload.style.display = 'none';
                    photoPreview.style.display = 'block';
                    hideError(photoError);
                };
                
                reader.readAsDataURL(file);
            }
        });

        removePhoto.addEventListener('click', (e) => {
            e.stopPropagation();
            photoInput.value = '';
            formData.photo = null;
            photoPreview.style.display = 'none';
            photoUpload.style.display = 'flex';
        });

        step1Next.addEventListener('click', () => {
            if (validateStep1()) {
                goToStep(2);
            }
        });

        // Step 2: Figure Details
        const clothesDescription = document.getElementById('clothesDescription');
        const clothesError = document.getElementById('clothesError');
        const step2Next = document.getElementById('step2Next');

        clothesDescription.addEventListener('input', () => {
            formData.clothesDescription = clothesDescription.value;
            if (clothesDescription.value.length >= 8) {
                hideError(clothesError);
            }
        });

        step2Next.addEventListener('click', () => {
            if (validateStep2()) {
                goToStep(3);
            }
        });

        // Step 3: Preview
        const generatePreview = document.getElementById('generatePreview');
        const previewPlaceholder = document.getElementById('previewPlaceholder');
        const previewLoading = document.getElementById('previewLoading');
        const previewResult = document.getElementById('previewResult');
        const figurePreview = document.getElementById('figurePreview');
        const previewErrorContainer = document.getElementById('previewErrorContainer');
        const previewError = document.getElementById('previewError');
        const retryPreview = document.getElementById('retryPreview');
        const step3Next = document.getElementById('step3Next');

        generatePreview.addEventListener('click', async () => {
            previewPlaceholder.style.display = 'none';
            previewLoading.style.display = 'flex';
            
            // Create and show loading animation
            const loadingAnimation = document.createElement('div');
            loadingAnimation.style.position = 'relative';
            loadingAnimation.style.width = '100%';
            loadingAnimation.style.height = '100%';
            
            const loadingImage = document.createElement('img');
            loadingImage.src = URL.createObjectURL(formData.photo);
            loadingImage.style.width = '100%';
            loadingImage.style.height = '100%';
            loadingImage.style.objectFit = 'contain';
            loadingImage.style.filter = 'blur(20px)';
            loadingImage.style.transition = 'filter 60s linear';
            
            loadingAnimation.appendChild(loadingImage);
            previewLoading.appendChild(loadingAnimation);
            
            // Start the unblur animation
            setTimeout(() => {
                loadingImage.style.filter = 'blur(0px)';
            }, 100);
            
            // Prepare form data for the API request
            const formDataToSend = new FormData();
            formDataToSend.append('PersonPhoto', formData.photo);
            formDataToSend.append('pose', formData.pose);
            formDataToSend.append('clothesDescription', formData.clothesDescription);

            try {
                const response = await fetch('https://hook.eu2.make.com/6nfz7nefo8iyxd22cnzi5gyk6ex7bdnv', {
                    method: 'POST',
                    body: formDataToSend
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();
                const imageUrl = `data:image/png;base64,${result.image}`;

                FormData.preview = imageUrl;
            
                // Update UI
                previewLoading.style.display = 'none';
                previewResult.style.display = 'flex';
            
                // Display image
                const img = document.getElementById("figurePreview");
                img.src = imageUrl;
                img.alt = 'Generated Preview';
            
            } catch (error) {
                console.error('Error generating preview:', error);
                previewLoading.style.display = 'none';
                previewErrorContainer.style.display = 'flex';
                previewError.textContent = 'Не успяхме да генерираме модел. Моля, опитайте отново.';
            }
        });

        retryPreview.addEventListener('click', () => {
            previewErrorContainer.style.display = 'none';
            previewPlaceholder.style.display = 'flex';
        });

        step3Next.addEventListener('click', () => {
            if (validateStep3()) {
                goToStep(4);
            }
        });

        // Step 4: Contact & Shipping
        const contactForm = {
            fullName: document.getElementById('fullName'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            address: document.getElementById('address'),
            country: document.getElementById('country'),
            city: document.getElementById('city'),
            postcode: document.getElementById('postcode')
        };

        const contactErrors = {
            nameError: document.getElementById('nameError'),
            emailError: document.getElementById('emailError'),
            phoneError: document.getElementById('phoneError'),
            addressError: document.getElementById('addressError'),
            countryError: document.getElementById('countryError'),
            cityError: document.getElementById('cityError'),
            postcodeError: document.getElementById('postcodeError')
        };

        for (const field in contactForm) {
            contactForm[field].addEventListener('input', (e) => {
                formData.contact[field] = e.target.value;
            });
        }

        // Previous buttons
        document.querySelectorAll('.btn-prev').forEach(button => {
            button.addEventListener('click', () => {
                const targetStep = parseInt(button.getAttribute('data-step'));
                goToStep(targetStep);
            });
        });

        // Form submission
        const submitForm = document.getElementById('submitForm');
        const formContainer = document.querySelector('.form-container form');
        const submissionContainer = document.getElementById('submissionContainer');
        const submissionLoading = document.getElementById('submissionLoading');
        const submissionSuccess = document.getElementById('submissionSuccess');
        const submissionError = document.getElementById('submissionError');
        const errorMessage = document.getElementById('errorMessage');
        const retrySubmission = document.getElementById('retrySubmission');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (validateStep4()) {
                formContainer.style.display = 'none';
                submissionContainer.style.display = 'block';
                submissionLoading.style.display = 'flex';
                
                // Simulate webhook submission with 3 second delay
                setTimeout(() => {
                    console.log('Form submission data:', formData);
                    
                    // In a real app, this would be a fetch call to a webhook
                    // fetch('https://hook.make.com/yourwebhook', {
                    //     method: 'POST',
                    //     headers: { 'Content-Type': 'application/json' },
                    //     body: JSON.stringify(formData)
                    // })
                    // .then(response => {
                    //     submissionLoading.style.display = 'none';
                    //     submissionSuccess.style.display = 'flex';
                    // })
                    // .catch(error => {
                    //     submissionLoading.style.display = 'none';
                    //     errorMessage.textContent = 'Error: ' + error.message;
                    //     submissionError.style.display = 'flex';
                    // });
                    
                    // For this demo, we'll simulate a success most of the time
                    const success = Math.random() > 0.2; // 80% success rate
                    
                    submissionLoading.style.display = 'none';
                    
                    if (success) {
                        submissionSuccess.style.display = 'flex';
                    } else {
                        errorMessage.textContent = 'Error connecting to server. Please try again.';
                        submissionError.style.display = 'flex';
                    }
                }, 3000);
            }
        });

        retrySubmission.addEventListener('click', () => {
            submissionError.style.display = 'none';
            submissionLoading.style.display = 'flex';
            
            // Retry submission simulation
            setTimeout(() => {
                submissionLoading.style.display = 'none';
                submissionSuccess.style.display = 'flex';
            }, 2000);
        });

        // Initialize step indicators click events
        stepIndicators.forEach((indicator) => {
            indicator.addEventListener('click', () => {
                const step = parseInt(indicator.getAttribute('data-step'));
                
                // Only allow going to previous steps or current step
                if (step < currentStep || step === currentStep) {
                    goToStep(step);
                }
            });
        });
    }

    // Validation functions
    function validateStep1() {
        const photoError = document.getElementById('photoError');
        
        if (!formData.photo) {
            showError(photoError, 'Моля, качете снимка.');
            return false;
        }
        
        return true;
    }

    function validateStep2() {
        const clothesDescription = document.getElementById('clothesDescription');
        const clothesError = document.getElementById('clothesError');
        const poseError = document.getElementById('poseError');
        const sizeError = document.getElementById('sizeError');
        let isValid = true;
        
        if (clothesDescription.value.length < 8) {
            showError(clothesError, 'Описанието трябва да е поне 8 символа.');
            isValid = false;
        }
        
        if (!formData.pose) {
            showError(poseError, 'Моля, изберете поза.');
            isValid = false;
        }
        
        return isValid;
    }

    function validateStep3() {
        // We could check if a preview was generated, but for this demo
        // we'll allow proceeding even without a preview
        return true;
    }

    function validateStep4() {
        const fields = [
            { value: formData.contact.fullName, errorElement: document.getElementById('nameError'), message: 'Моля, въведете пълното си име.' },
            { value: formData.contact.email, errorElement: document.getElementById('emailError'), message: 'Моля, въведете валиден имейл адрес.', validator: validateEmail },
            { value: formData.contact.phone, errorElement: document.getElementById('phoneError'), message: 'Моля, въведете валиден телефонен номер.', validator: validatePhone },
            { value: formData.contact.address, errorElement: document.getElementById('addressError'), message: 'Моля, въведете вашия адрес.' },
            { value: formData.contact.country, errorElement: document.getElementById('countryError'), message: 'Моля, въведете вашата страна.' },
            { value: formData.contact.city, errorElement: document.getElementById('cityError'), message: 'Моля, въведете вашия град.' },
            { value: formData.contact.postcode, errorElement: document.getElementById('postcodeError'), message: 'Моля, въведете вашия пощенски код.' }
        ];
        
        let isValid = true;
        
        fields.forEach(field => {
            if (!field.value) {
                showError(field.errorElement, field.message);
                isValid = false;
            } else if (field.validator && !field.validator(field.value)) {
                showError(field.errorElement, field.message);
                isValid = false;
            } else {
                hideError(field.errorElement);
            }
        });
        
        return isValid;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        // Simple phone validation - adjust as needed
        const re = /^\+?[\d\s-]{7,15}$/;
        return re.test(phone);
    }

    function showError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function hideError(errorElement) {
        errorElement.style.display = 'none';
    }

    // Step navigation
    function goToStep(step) {
        if (step < 1 || step > steps.length) return;
        
        // Update current step
        currentStep = step;
        
        // Update step indicators
        stepIndicators.forEach((indicator, index) => {
            const stepNum = index + 1;
            indicator.classList.remove('active', 'completed');
            
            if (stepNum < currentStep) {
                indicator.classList.add('completed');
            } else if (stepNum === currentStep) {
                indicator.classList.add('active');
            }
        });
        
        // Update progress bar
        progressFill.style.width = `${((currentStep - 1) / (steps.length - 1)) * 100}%`;
        
        // Show current step
        steps.forEach((stepEl, index) => {
            stepEl.classList.remove('active');
            if (index === currentStep - 1) {
                stepEl.classList.add('active');
            }
        });
        
        // Scroll to top of form
        document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    }
});