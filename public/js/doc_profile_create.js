
    function nextStep(n) {
        document.querySelectorAll('.form-step').forEach(s => s.style.display = 'none');
    document.getElementById('step' + n).style.display = 'block';
    updateProgress(n);
    }

    function prevStep(n) {
        nextStep(n);
    }

    function updateProgress(step) {
        document.querySelectorAll('.step-icon').forEach((icon, i) => {
            icon.classList.toggle('active', i < step);
        });
        document.querySelectorAll('.step-text').forEach((text, i) => {
        text.classList.toggle('active', i < step);
        });
    }
