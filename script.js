
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
                    showError(photoError, 'Please upload a JPEG or PNG file');
                    return;
                }
                
                if (file.size > 10 * 1024 * 1024) { // 10MB
                    showError(photoError, 'File size must be less than 10MB');
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

        generatePreview.addEventListener('click', () => {
            previewPlaceholder.style.display = 'none';
            previewLoading.style.display = 'flex';
            
            // Simulate API call with 2 second delay
            setTimeout(() => {
                // In a real app, this would be a fetch call to generate a preview
                const success = Math.random() > 0.3; // 70% success rate for simulation
                
                previewLoading.style.display = 'none';
                
                if (success) {
                    // For demo, we'll use the uploaded photo as the "preview"
                    if (formData.photo) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            figurePreview.src = e.target.result;
                            formData.preview = e.target.result;
                        };
                        reader.readAsDataURL(formData.photo);
                    }
                    previewResult.style.display = 'block';
                } else {
                    previewError.textContent = 'Unable to generate preview. Please try again.';
                    previewErrorContainer.style.display = 'flex';
                }
            }, 2000);
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
            showError(photoError, 'Please upload a photo');
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
            showError(clothesError, 'Description must be at least 8 characters');
            isValid = false;
        }
        
        if (!formData.pose) {
            showError(poseError, 'Please select a pose');
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
            { value: formData.contact.fullName, errorElement: document.getElementById('nameError'), message: 'Please enter your full name' },
            { value: formData.contact.email, errorElement: document.getElementById('emailError'), message: 'Please enter a valid email address', validator: validateEmail },
            { value: formData.contact.phone, errorElement: document.getElementById('phoneError'), message: 'Please enter a valid phone number', validator: validatePhone },
            { value: formData.contact.address, errorElement: document.getElementById('addressError'), message: 'Please enter your address' },
            { value: formData.contact.country, errorElement: document.getElementById('countryError'), message: 'Please enter your country' },
            { value: formData.contact.city, errorElement: document.getElementById('cityError'), message: 'Please enter your city' },
            { value: formData.contact.postcode, errorElement: document.getElementById('postcodeError'), message: 'Please enter your postcode' }
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