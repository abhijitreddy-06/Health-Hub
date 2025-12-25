

    const themeToggle = document.getElementById('themeToggle');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    const html = document.documentElement;


    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
        }

    function toggleTheme() {
            const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
        }

    function updateThemeIcon(theme) {
            const icon = theme === 'dark' ? 'fa-sun' : 'fa-moon';
    themeToggle.innerHTML = `<i class="fas ${icon}"></i>`;
    mobileThemeToggle.innerHTML = `<i class="fas ${icon}"></i>`;
        }

    themeToggle.addEventListener('click', toggleTheme);
    mobileThemeToggle.addEventListener('click', toggleTheme);


    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMenuBtn = document.getElementById('closeMenu');
    const mobileMenu = document.getElementById('mobileMenu');

        mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
        });

        closeMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
        });


        document.addEventListener('click', (e) => {
            if (mobileMenu.classList.contains('active') &&
    !mobileMenu.contains(e.target) &&
    e.target !== mobileMenuBtn) {
        mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
            }
        });

    // Chatbot functionality
    const chatBubble = document.getElementById('chat-bubble');
    const chatbot = document.getElementById('chatbot');

        // Show chat bubble after 3 seconds
        setTimeout(() => {
        chatBubble.classList.add('active');
        }, 3000);

        chatbot.addEventListener('click', () => {
        alert('Chatbot feature would open here. This is a frontend demonstration.');
        });

    // Form interactivity
    const radioOptions = document.querySelectorAll('.radio-option');
        radioOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options in the same group
            const group = option.closest('.radio-group');
            group.querySelectorAll('.radio-option').forEach(el => {
                el.classList.remove('selected');
            });

            // Add selected class to clicked option
            option.classList.add('selected');

            // Check the radio input
            const radioInput = option.querySelector('input[type="radio"]');
            radioInput.checked = true;
        });
        });

            predictForm.addEventListener('submit', async (e) => {
        e.preventDefault();

    // Show loading animation
    progressBar.style.width = '100%';

    const formData = new FormData(predictForm);
    const formJson = { };

    for (const [key, value] of formData.entries()) {
                    if (formJson[key]) continue; // avoid duplicates for radio
    formJson[key] = 1;
                }

    try {
                    const response = await fetch("/predict", {
        method: "POST",
    headers: {
        "Content-Type": "application/json"
                        },
    body: JSON.stringify(formJson)
                    });

    if (!response.ok) {
                        throw new Error("Prediction service is currently unavailable.");
                    }

    const result = await response.json();

    const isPositive = result.prediction === 1;

    if (isPositive) {
        resultIcon.innerHTML = '<i class="fas fa-virus"></i>';
    resultIcon.classList.add('positive');
    resultIcon.classList.remove('negative');
    resultTitle.textContent = 'High Risk of Infection';
    resultTitle.style.color = '#ef4444';
    resultDescription.textContent = 'Based on your symptoms and exposure history, there is a high likelihood of COVID-19 infection. Please self-isolate immediately and contact a healthcare provider for testing.';
                    } else {
        resultIcon.innerHTML = '<i class="fas fa-shield-virus"></i>';
    resultIcon.classList.add('negative');
    resultIcon.classList.remove('positive');
    resultTitle.textContent = 'Low Risk of Infection';
    resultTitle.style.color = '#10b981';
    resultDescription.textContent = 'Based on your symptoms and exposure history, your risk of COVID-19 infection appears low. Continue to monitor your health and follow public health guidelines.';
                    }

    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({behavior: 'smooth' });

                } catch (error) {
        alert("Prediction service is currently unavailable. Please try again later.");
    console.error("Prediction error:", error);
    progressBar.style.width = '0%';
                }
            });

