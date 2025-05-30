document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1000,
        easing: 'ease-out-cubic',
        offset: 80,
        mirror: true,
        anchorPlacement: 'top-bottom',
    });

    // IMPORTANT: Replace "YOUR_KEY_ID" with your actual Razorpay Key ID
    // For testing, you can use a test key from your Razorpay dashboard.
    const RAZORPAY_KEY_ID = "rzp_test_6scZJgdRJOWfry"; // e.g., rzp_test_xxxxxxxxxxxxxx

    function throttle(fn, wait) {
        let lastTime = 0;
        let timeoutId = null;
        return function (...args) {
            const now = Date.now();
            const remaining = wait - (now - lastTime);
            clearTimeout(timeoutId);
            if (remaining <= 0) {
                fn.apply(this, args);
                lastTime = now;
            } else {
                timeoutId = setTimeout(() => {
                    fn.apply(this, args);
                    lastTime = Date.now();
                }, remaining);
            }
        };
    }

    const alertBox = document.getElementById('custom-alert-box');
    function showCustomAlert(message, type = 'info', duration = 3500) {
        if (!alertBox) return;
        alertBox.textContent = message;
        alertBox.className = 'show'; // Base class to show
        // Remove previous type classes then add current type
        alertBox.classList.remove('form-success', 'form-error');
        if (type === 'success') {
            alertBox.classList.add('form-success');
        } else if (type === 'error') {
            alertBox.classList.add('form-error');
        }
        // Ensure it's visible before timeout starts to hide it
        setTimeout(() => {
            alertBox.className = ''; // Hide by removing 'show' and type classes
        }, duration);
    }

    const header = document.getElementById('header');
    const backToTopButton = document.getElementById('back-to-top');
    const handleScroll = () => {
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }
        if (backToTopButton) {
            const isScrolledEnough = window.scrollY > 300;
            backToTopButton.style.opacity = isScrolledEnough ? '1' : '0';
            backToTopButton.style.visibility = isScrolledEnough ? 'visible' : 'hidden';
            backToTopButton.style.transform = isScrolledEnough ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)';
        }
    };
    window.addEventListener('scroll', throttle(handleScroll, 100));
    if (backToTopButton) {
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
            mobileMenu.classList.toggle('hidden');
            mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.setAttribute('aria-hidden', isExpanded);
            mobileMenuButton.querySelector('svg').classList.toggle('rotate-90', !isExpanded);
        });
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
                mobileMenuButton.querySelector('svg').classList.remove('rotate-90');
            });
        });
    }

    const packageCards = document.querySelectorAll('.package-card');
    const amountButtons = document.querySelectorAll('.amount-button');
    const customAmountInputDiv = document.getElementById('custom-amount-input');
    const customAmountInput = document.getElementById('custom_amount');
    const selectedAmountInput = document.getElementById('selected_amount');
    const customSelectButton = document.querySelector('.custom-select-button');
    const paymentModal = document.getElementById('paymentModal');
    const closeModalButton = document.getElementById('closeModalButton');
    const modalAmountDisplay = document.getElementById('modalAmountDisplay');
    const paymentCompleteButton = document.getElementById('paymentCompleteButton');
    const selectedAmountBox = document.getElementById('selected-amount-box');
    const selectedAmountDisplay = document.getElementById('selected-amount-display');

    function deselectAllAmounts() {
        amountButtons.forEach(btn => btn.classList.remove('selected'));
        packageCards.forEach(card => card.classList.remove('selected'));
        if (customAmountInputDiv) customAmountInputDiv.classList.add('hidden');
        if (customAmountInput) {
            customAmountInput.removeAttribute('required');
            customAmountInput.value = '';
        }
        if (selectedAmountInput) selectedAmountInput.value = '';
        if (selectedAmountBox) {
            selectedAmountBox.classList.remove('visible');
            if(selectedAmountDisplay) selectedAmountDisplay.textContent = '₹0';
        }
    }

    function scrollToDonateForm() {
        const donateFormElement = document.getElementById('selected-amount-box'); // Changed variable name to avoid conflict
        if (donateFormElement) {
            const headerOffset = header ? header.offsetHeight : 0;
            const elementPosition = donateFormElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerOffset - 20; // 20px buffer
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    function updateSelectedAmountDisplay(amount) {
        if (selectedAmountBox && selectedAmountDisplay) {
            selectedAmountDisplay.textContent = `₹${amount || 0}`;
            selectedAmountBox.classList.add('visible');
        }
    }

    packageCards.forEach(card => {
        card.addEventListener('click', () => {
            deselectAllAmounts();
            card.classList.add('selected');
            const amount = card.getAttribute('data-amount');
            if (selectedAmountInput) selectedAmountInput.value = amount;
            updateSelectedAmountDisplay(amount);
            scrollToDonateForm();
        });
    });

    amountButtons.forEach(button => {
        button.addEventListener('click', () => {
            deselectAllAmounts();
            button.classList.add('selected');
            const amountType = button.getAttribute('data-amount');
            if (amountType === 'custom') {
                if (customAmountInputDiv) customAmountInputDiv.classList.remove('hidden');
                if (customAmountInput) {
                    customAmountInput.setAttribute('required', 'true');
                    customAmountInput.focus();
                }
            } else {
                if (selectedAmountInput) selectedAmountInput.value = amountType;
                updateSelectedAmountDisplay(amountType);
                scrollToDonateForm();
            }
        });
    });

    if (customAmountInput) {
        customAmountInput.addEventListener('input', () => {
            if (customSelectButton && !customSelectButton.classList.contains('selected')) {
                deselectAllAmounts();
                customSelectButton.classList.add('selected');
                if (customAmountInputDiv) customAmountInputDiv.classList.remove('hidden');
                customAmountInput.setAttribute('required', 'true');
            }
            const amount = customAmountInput.value;
            if (selectedAmountInput) selectedAmountInput.value = amount;
            updateSelectedAmountDisplay(amount);
            if (amount && parseFloat(amount) >= 100) {
                // Only scroll if a valid amount is entered
                 // scrollToDonateForm(); // Optional: decide if you want to scroll on custom input change
            }
        });
    }

    const donationForm = document.getElementById('donation-form');
    if (donationForm) {
        donationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            let finalAmount = selectedAmountInput ? selectedAmountInput.value : '';
            const donorNameInput = document.getElementById('donor_name');
            const donorEmailInput = document.getElementById('donor_email');
            const donorPhoneInput = document.getElementById('donor_phone');

            const donorName = donorNameInput ? donorNameInput.value : '';
            const donorEmail = donorEmailInput ? donorEmailInput.value : '';
            const donorPhone = donorPhoneInput ? donorPhoneInput.value : '';


            if (!finalAmount || parseFloat(finalAmount) < 100) {
                showCustomAlert('Please enter or select a valid donation amount (minimum ₹100).', 'error');
                // Highlight the amount selection area or custom input if possible
                if (parseFloat(finalAmount) < 100 && customAmountInput && customSelectButton.classList.contains('selected')) {
                    customAmountInput.focus();
                }
                return;
            }
            if (!donorName) {
                showCustomAlert('Please enter your name.', 'error');
                if (donorNameInput) donorNameInput.focus();
                return;
            }
            if (!donorEmail || !/^\S+@\S+\.\S+$/.test(donorEmail)) { // Basic email format check
                showCustomAlert('Please enter a valid email address.', 'error');
                if (donorEmailInput) donorEmailInput.focus();
                return;
            }
            // Phone validation can be added here if necessary

            if (modalAmountDisplay) modalAmountDisplay.textContent = `₹${finalAmount}`;
            if (paymentModal) {
                paymentModal.classList.add('visible');
                paymentModal.dataset.donorName = donorName;
                paymentModal.dataset.donationAmount = finalAmount;
                paymentModal.dataset.donorEmail = donorEmail;
                paymentModal.dataset.donorPhone = donorPhone;
            }
        });
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            if (paymentModal) paymentModal.classList.remove('visible');
        });
    }

    if (paymentModal) {
        paymentModal.addEventListener('click', (event) => {
            if (event.target === paymentModal) { // Click on overlay closes modal
                paymentModal.classList.remove('visible');
            }
        });
    }

    // MODIFIED paymentCompleteButton Event Listener for RAZORPAY
    if (paymentCompleteButton) {
        paymentCompleteButton.addEventListener('click', () => {
            if (!paymentModal) return;

            const donorName = paymentModal.dataset.donorName;
            const donationAmount = paymentModal.dataset.donationAmount;
            const donorEmail = paymentModal.dataset.donorEmail;
            const donorPhone = paymentModal.dataset.donorPhone;

            if (!donorName || !donationAmount || parseFloat(donationAmount) < 100) {
                showCustomAlert('Donor details or amount are invalid. Please close this pop-up and correct the form.', 'error', 5000);
                return;
            }

            if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === "YOUR_KEY_ID" || RAZORPAY_KEY_ID.trim() === "") {
                showCustomAlert('Payment gateway is not configured correctly. Please contact support.', 'error', 5000);
                console.error("Razorpay Key ID is not configured. Please replace 'YOUR_KEY_ID' in donate.js with your actual Razorpay Key ID.");
                return;
            }

            const amountInPaise = parseFloat(donationAmount) * 100;

            const options = {
                "key": RAZORPAY_KEY_ID,
                "amount": amountInPaise,
                "currency": "INR",
                "name": "Sahajshakti Sarvakalyaan Trust", // Your organization's name
                "description": "Donation for NGO Causes", // A brief description
                "image": "images/logo.png", // URL to your logo (ensure this path is correct)
                "handler": function (response){
                    // This function is called on successful payment
                    showCustomAlert('Thank you for your donation! Payment successful. Redirecting to certificate...', 'success', 4000);
                    
                    const encodedName = encodeURIComponent(donorName);
                    const encodedAmount = encodeURIComponent(`₹${donationAmount}`); // Use the original Rupee amount
                    
                    if(donationForm) {
                        donationForm.reset(); // Reset the main donation form
                    }
                    deselectAllAmounts(); // Clear selected amounts and highlights
                    if (paymentModal) paymentModal.classList.remove('visible'); // Hide your custom modal

                    // Redirect to certificate page
                    setTimeout(() => {
                        window.location.href = `certificate.html?donorName=${encodedName}&donationAmount=${encodedAmount}&paymentId=${response.razorpay_payment_id}`;
                    }, 2500); // Delay to allow user to read success message
                },
                "prefill": { // Prefill customer information on Razorpay checkout
                    "name": donorName,
                    "email": donorEmail,
                    "contact": donorPhone // Optional, if collected
                },
                "notes": {
                    // You can add any custom notes here, e.g., internal reference number
                    "donation_reference_id": "USER_DONATION_" + Date.now()
                },
                "theme": {
                    "color": "#FF6F00" // Your brand color (orange)
                },
                "modal": {
                    "ondismiss": function(){
                        // This function is called when the Razorpay checkout modal is closed by the user
                        showCustomAlert('Payment was cancelled or the window was closed. You can try again.', 'info', 4000);
                        // Keep your custom modal (paymentModal) visible, so the user can click "Proceed to Secure Payment" again or close it.
                    }
                }
            };

            try {
                const rzp1 = new Razorpay(options);
                rzp1.on('payment.failed', function (response){
                    console.error("Razorpay Payment Failed:", response.error);
                    let errorMessage = `Payment failed: ${response.error.description || 'An unknown error occurred'}.`;
                    if (response.error.reason) {
                         errorMessage += ` Reason: ${response.error.reason}.`;
                    }
                    // You can provide specific instructions based on response.error.source, response.error.step etc.
                    showCustomAlert(errorMessage, 'error', 6000); // Show error for a longer duration
                    // Keep your custom modal (paymentModal) visible
                });
                rzp1.open(); // This opens the Razorpay checkout modal
            } catch (error) {
                console.error("Error initializing Razorpay checkout: ", error);
                showCustomAlert("Could not initiate payment. Please check your internet connection or contact support.", "error", 5000);
            }
        });
    }
    // END MODIFIED paymentCompleteButton

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Add actual newsletter subscription logic here if needed
            showCustomAlert('Thank you for subscribing to our newsletter!', 'success');
            newsletterForm.reset();
        });
    }

    const currentYearElements = document.querySelectorAll('#currentYear');
    currentYearElements.forEach(el => {
        if (el) el.textContent = new Date().getFullYear();
    });

    // Image placeholder logic
    document.querySelectorAll('img').forEach(img => {
        // Skip if already has placehold.co in onerror or if data-error-handled is true
        if ((img.getAttribute('onerror') && img.getAttribute('onerror').includes("placehold.co")) || img.getAttribute('data-error-handled')) {
            return;
        }

        const originalSrc = img.src; // Store original src for check
        const altText = encodeURIComponent(img.alt || "Image");
        // Determine width and height more robustly
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        if (width === 0 && img.offsetWidth > 0) width = img.offsetWidth;
        else if (width === 0 && img.width > 0) width = img.width;
        else if (width === 0) width = 300; // Default width

        if (height === 0 && img.offsetHeight > 0) height = img.offsetHeight;
        else if (height === 0 && img.height > 0) height = img.height;
        else if (height === 0) height = 200; // Default height
        
        const placeholderSrc = `https://placehold.co/${width}x${height}/E2E8F0/4A5568?text=${altText.replace(/\+/g, '%20')}`;

        img.onerror = function() {
            if (this.src !== placeholderSrc) { // Prevent infinite loop if placeholder also fails
                this.src = placeholderSrc;
                this.alt = `Placeholder: ${img.alt || 'Image'}`; // Update alt text for clarity
                // console.warn(`Image failed to load: ${originalSrc}. Replaced with placeholder: ${this.src}`);
            }
            this.setAttribute('data-error-handled', 'true'); // Mark as handled
        };

        // Check for broken images that might not trigger onerror immediately (e.g. if src is empty or points to the page itself)
        if (img.complete && (img.naturalWidth === 0 || !img.src || img.src === window.location.href) && img.src !== placeholderSrc) {
             // console.warn(`Image already broken or invalid src: ${originalSrc}. Triggering error handler.`);
            img.dispatchEvent(new Event('error'));
        } else if (!img.src) { // If src attribute is missing
            // console.warn(`Image missing src attribute. Triggering error handler for alt: ${img.alt}`);
            img.dispatchEvent(new Event('error'));
        }
    });
});