document.addEventListener('DOMContentLoaded', function() {
    // Initialize translations
    window.i18n.updateLanguage();

    // Global variables
    const form = document.getElementById('figureForm');
    const steps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const progressFill = document.getElementById('progressFill');
    let currentStep = 1;
    let PreviewFile = '';
    window.formData = {
        personPhoto:{
            file:'',
            name:'',
            file_b64:''
        },
        clothesDescription: '',
        pose: '',
        imgStyle: '',
        size: '',
        price: 0,
        paymentType:'',
        currency:"",
        previewPhoto: {
            file_b64:"",
            file:'',
            name:""
        },
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

    // Set currency based on language
    const currentLang = window.i18n.getCurrentLanguage();
    switch(currentLang) {
        case 'de':
            formData.currency = 'EUR';
            break;
        case 'en': 
            formData.currency = 'GBP';
            break;
        default:
            formData.currency = 'BGN'; // Default Bulgarian currency
            break;
    }


    const getUserIP = async () => {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        return data.ip;
      };


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
                    showError(photoError, 'photoError');
                    return;
                }
                
                if (file.size > 10 * 1024 * 1024) { // 10MB
                    showError(photoError, 'photoError');
                    return;
                }
                
                PreviewFile = file;
               
                const reader = new FileReader();
                
                
                reader.onload = (e) => {
                    
                    const base64DataUrl = e.target.result;
                    formData.personPhoto.file = file;
                    formData.personPhoto.file_b64 = base64DataUrl;
                    formData.personPhoto.name = file.name;
        
                    previewImage.src = base64DataUrl;
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
            formData.personPhoto = {
                file: '',
                name: ''
            };
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
        const previewInfo = document.getElementById('previewInfo');

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
            loadingImage.src = URL.createObjectURL(PreviewFile);
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

            const ip = await getUserIP();
            
            // Prepare form data for the API request
            const formDataToSend = new FormData();
            formDataToSend.append('PersonPhoto', formData.personPhoto.file);
            formDataToSend.append('pose', formData.pose);
            formDataToSend.append('clothesDescription', formData.clothesDescription);
            formDataToSend.append('imgStyle', formData.imgStyle);
            formDataToSend.append("ip", ip);


            try {
                const response = await fetch('https://primary-production-5c317.up.railway.app/webhook/3353e23f-ec6e-4eae-8cee-e25e8d254f8b', {
                    method: 'POST',
                    body: formDataToSend
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();
                
                // Check if user is banned
                if (result.banned === "true") {
                    previewLoading.style.display = 'none';
                    previewErrorContainer.style.display = 'flex';
                    previewError.textContent = window.i18n.t('bannedMessage');
                    return;
                }

                const imageUrl = `data:image/png;base64,${result.image}`;

                // Convert base64 to File object
                const base64Response = await fetch(imageUrl);
                const blob = await base64Response.blob();
                const file = new File([blob], Math.random().toString(36).substring(7)+".png", { type: 'image/png' });

                formData.previewPhoto.file_b64 = imageUrl;
                formData.previewPhoto.name = file.name;
                formData.previewPhoto.file = file;
            
                // Update UI
                previewLoading.style.display = 'none';
                previewResult.style.display = 'flex';
                previewInfo.style.display = "flex";
            
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
//payment options 




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
               submitForm.disabled = true;
               let loadingPercent = 1;
               const loadingInterval = setInterval(() => {
                   loadingPercent++;
                   submitForm.textContent = `Loading ${loadingPercent}%`;
                   if (loadingPercent >= 100) {
                       clearInterval(loadingInterval);
                   }
               }, 50); // 5000ms / 100 steps = 50ms per step


              async function submitFinalOrder() {
                try {
                    const fd = new FormData();
                    fd.append('PersonPhoto', formData.personPhoto.file); // the raw File object
                    fd.append('FileName_PersonPhoto', formData.personPhoto.name);
                    fd.append('pose', formData.pose);
                    fd.append('clothesDescription', formData.clothesDescription);
                    fd.append('size', formData.size);
                    fd.append('price', formData.price);
                    fd.append('fullName', formData.contact.fullName);
                    fd.append('email', formData.contact.email);
                    fd.append('phone', formData.contact.phone);
                    fd.append('address', formData.contact.address);
                    fd.append('country', formData.contact.country);
                    fd.append('city', formData.contact.city);
                    fd.append('postcode', formData.contact.postcode);
                    fd.append('PreviewImage', formData.previewPhoto.file);
                    fd.append('currency', formData.currency);
                    fd.append('paymentType', formData.paymentType);

                     // the raw File object
              
                  // Send to Make
                  const response = await fetch('https://primary-production-5c317.up.railway.app/webhook/fa49284e-20c0-46d9-931a-d3f52867ebcb', {
                    method: 'POST',
                    body: fd,
                  });
              
                  if (!response.ok) {
                    throw new Error('Network response was not ok');
                  }
              
                  const result = await response.json()
                  if (result.checkoutUrl) {
                    window.location.href = result.checkoutUrl;
                  }
              
                  // UI feedback
                  submissionLoading.style.display = 'none';
                  submissionSuccess.style.display = 'flex';
                } catch (error) {
                  console.error('Order submission failed:', error);
                  submissionLoading.style.display = 'none';
                  submissionError.style.display = 'flex';
                  errorMessage.textContent = 'Something went wrong while placing your order.';
                }
              }
              
              submitFinalOrder()



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
        
        if (!formData.personPhoto.file) {
            showError(photoError, 'photoError');
            return false;
        }
        
        return true;
    }

    function validateStep2() {
        const clothesDescription = document.getElementById('clothesDescription');
        const clothesError = document.getElementById('clothesError');
        const poseError = document.getElementById('poseError');
        const styleError = document.getElementById('styleError');
        let isValid = true;
        
        if (clothesDescription.value.length < 8) {
            showError(clothesError, 'clothesError');
            isValid = false;
        }
        
        if (!formData.pose) {
            showError(poseError, 'poseError');
            isValid = false;
        }
        if (!formData.imgStyle) {
            showError(styleError, 'styleError');
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
            { value: formData.contact.fullName, errorElement: document.getElementById('nameError'), message: 'nameError' },
            { value: formData.contact.email, errorElement: document.getElementById('emailError'), message: 'emailError', validator: validateEmail },
            { value: formData.contact.phone, errorElement: document.getElementById('phoneError'), message: 'phoneError', validator: validatePhone },
            { value: formData.contact.address, errorElement: document.getElementById('addressError'), message: 'addressError' },
            { value: formData.contact.country, errorElement: document.getElementById('countryError'), message: 'countryError' },
            { value: formData.contact.city, errorElement: document.getElementById('cityError'), message: 'cityError' },
            { value: formData.contact.postcode, errorElement: document.getElementById('postcodeError'), message: 'postcodeError' },
            { value: formData.contact.postcode, errorElement: document.getElementById('sizeError'), message: 'sizeError' },
            { value: formData.paymentType, errorElement: document.getElementById('paymentError'), message: 'paymentTypeError' }
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
        errorElement.textContent = window.i18n.t(message);
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


isCodChosen = false

function selectPaymentMethod(method) {
    const options = document.querySelectorAll('.payment-options .payment-option');

    options.forEach(option => {
        option.classList.remove('selected');
    });

    if (method === 'card') {
        document.getElementById('paymentCard').classList.add('selected');

        formData.paymentType = "card"
        if(isCodChosen==true){
            formData.price-=19.90
            isCodChosen = false
        }

    } else if (method === 'cod') {
        formData.paymentType = "cod"

        document.getElementById('paymentCOD').classList.add('selected');
    }

    const hiddenInput = document.getElementById('selectedPaymentMethod');
    if (hiddenInput) {
        hiddenInput.value = method;
    }
    if (typeof updateTotalPrice === 'function') {
        updateTotalPrice();
    }
}


function updateTotalPrice() {
    const totalBox = document.getElementById('totalPriceBox');
    const totalAmount = document.getElementById('totalAmount');

    const basePrice = parseFloat(window.formData.price || 0);
    const paymentMethod = document.getElementById('selectedPaymentMethod')?.value;

    if (!basePrice || isNaN(basePrice)) {
        totalBox.style.display = 'none';
        return;
    }

    let finalPrice = basePrice;

    // Only add COD fee if it hasn't been added before
    if (paymentMethod === 'cod' && isCodChosen==false) {
        finalPrice += 19.90;
        formData.price += 19.90
        isCodChosen = true

    }

    totalAmount.textContent = `${finalPrice.toFixed(2)} лв.`;
    totalBox.style.display = 'flex';

}

// Optional: auto-select the first size on page load
window.addEventListener('DOMContentLoaded', () => {
    const firstSize = document.querySelector('.size-option[data-price]');
    if (firstSize) {
        firstSize.click();
    }
});

