document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1000,
        easing: 'ease-out-cubic',
        offset: 80,
        mirror: true,
        anchorPlacement: 'top-bottom',
    });

    // Load Razorpay checkout script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

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
        alertBox.className = 'show';
        alertBox.classList.remove('form-success', 'form-error');
        if (type === 'success') {
            alertBox.classList.add('form-success');
        } else if (type === 'error') {
            alertBox.classList.add('form-error');
        }
        setTimeout(() => {
            alertBox.className = '';
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
        customAmountInputDiv.classList.add('hidden');
        customAmountInput.removeAttribute('required');
        customAmountInput.value = '';
        selectedAmountInput.value = '';
        if (selectedAmountBox) {
            selectedAmountBox.classList.remove('visible');
            selectedAmountDisplay.textContent = '₹0';
        }
    }

    function scrollToDonateForm() {
        const donateForm = document.getElementById('donate-form');
        if (donateForm) {
            const headerOffset = header ? header.offsetHeight : 0;
            const elementPosition = donateForm.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerOffset - 20;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    function updateSelectedAmountDisplay(amount) {
        if (selectedAmountBox && selectedAmountDisplay) {
            selectedAmountDisplay.textContent = `₹${amount}`;
            selectedAmountBox.classList.add('visible');
        }
    }

    packageCards.forEach(card => {
        card.addEventListener('click', () => {
            deselectAllAmounts();
            card.classList.add('selected');
            const amount = card.getAttribute('data-amount');
            selectedAmountInput.value = amount;
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
                customAmountInputDiv.classList.remove('hidden');
                customAmountInput.setAttribute('required', 'true');
            } else {
                selectedAmountInput.value = amountType;
                updateSelectedAmountDisplay(amountType);
                scrollToDonateForm();
            }
        });
    });

    if (customAmountInput) {
        customAmountInput.addEventListener('input', () => {
            if (!customSelectButton.classList.contains('selected')) {
                deselectAllAmounts();
                customSelectButton.classList.add('selected');
                customAmountInputDiv.classList.remove('hidden');
                customAmountInput.setAttribute('required', 'true');
            }
            const amount = customAmountInput.value;
            selectedAmountInput.value = amount;
            updateSelectedAmountDisplay(amount || '0');
            if (amount && parseFloat(amount) >= 100) {
                scrollToDonateForm();
            }
        });
    }

    const donationForm = document.getElementById('donation-form');
    if (donationForm) {
        donationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            let finalAmount = selectedAmountInput.value;
            const donorName = document.getElementById('donor_name').value;
            if (!finalAmount || parseFloat(finalAmount) < 100) {
                showCustomAlert('Please enter or select a valid donation amount (minimum ₹100).', 'error');
                return;
            }
            if (!donorName) {
                showCustomAlert('Please enter your name.', 'error');
                return;
            }
            modalAmountDisplay.textContent = `₹${finalAmount}`;
            paymentModal.classList.add('visible');
            paymentModal.dataset.donorName = donorName;
            paymentModal.dataset.donationAmount = finalAmount;
        });
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            paymentModal.classList.remove('visible');
        });
    }

    if (paymentModal) {
        paymentModal.addEventListener('click', (event) => {
            if (event.target === paymentModal) {
                paymentModal.classList.remove('visible');
            }
        });
    }

    if (paymentCompleteButton) {
        paymentCompleteButton.addEventListener('click', () => {
            const donorName = paymentModal.dataset.donorName;
            const donationAmount = paymentModal.dataset.donationAmount;
            if (donorName && donationAmount) {
                // Initialize Razorpay payment
                const options = {
                    key: 'rzp_test_6scZJgdRJOWfry', // Replace with your Razorpay key ID
                    amount: parseFloat(donationAmount) * 100, // Amount in paisa
                    currency: 'INR',
                    name: 'Sahajshakti Sarvakalyaan Trust',
                    description: 'Donation',
                    handler: function (response) {
                        showCustomAlert('Thank you for your donation! Redirecting to certificate...', 'success');
                        const encodedName = encodeURIComponent(donorName);
                        const encodedAmount = encodeURIComponent(`₹${donationAmount}`);
                        setTimeout(() => {
                            window.location.href = `certificate.html?donorName=${encodedName}&donationAmount=${encodedAmount}`;
                        }, 1000);
                        donationForm.reset();
                        deselectAllAmounts();
                        paymentModal.classList.remove('visible');
                    },
                    prefill: {
                        name: donorName,
                        email: document.getElementById('donor_email').value || '',
                        contact: document.getElementById('donor_phone').value || ''
                    },
                    theme: {
                        color: '#FF6F00'
                    }
                };
                const rzp = new Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    showCustomAlert('Payment failed. Please try again.', 'error');
                    paymentModal.classList.remove('visible');
                });
                rzp.open();
            } else {
                showCustomAlert('Donor details or amount not found. Please try again.', 'error');
                paymentModal.classList.remove('visible');
            }
        });
    }

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showCustomAlert('Thank you for subscribing to our newsletter!', 'success');
            newsletterForm.reset();
        });
    }

    const currentYearElements = document.querySelectorAll('#currentYear');
    currentYearElements.forEach(el => {
        if (el) el.textContent = new Date().getFullYear();
    });

    document.querySelectorAll('img').forEach(img => {
        if (img.getAttribute('onerror') && img.getAttribute('onerror').includes("placehold.co/150x50")) {
            return;
        }
        if (img.getAttribute('data-error-handled')) {
            return;
        }
        const altText = encodeURIComponent(img.alt || "Image");
        const width = img.naturalWidth > 0 ? img.naturalWidth : (img.offsetWidth > 0 ? img.offsetWidth : (img.width > 0 ? img.width : 300));
        const height = img.naturalHeight > 0 ? img.naturalHeight : (img.offsetHeight > 0 ? img.offsetHeight : (img.height > 0 ? img.height : 200));
        const placeholderSrc = `https://placehold.co/${width}x${height}/E2E8F0/4A5568?text=${altText.replace(/\+/g, '%20')}`;
        img.onerror = function() {
            if (this.src !== placeholderSrc) {
                this.src = placeholderSrc;
                this.alt = `Placeholder: ${img.alt || 'Image'}`;
                console.warn(`Image failed to load: ${img.getAttribute('src')}. Replaced with ${this.src}`);
            }
            this.setAttribute('data-error-handled', 'true');
        };
        if (img.complete && (img.naturalWidth === 0 || !img.src || img.src === window.location.href) && img.src !== placeholderSrc) {
            img.dispatchEvent(new Event('error'));
        }
    });
});