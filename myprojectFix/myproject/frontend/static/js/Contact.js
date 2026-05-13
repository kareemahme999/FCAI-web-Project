function clearErrors() {
    document.querySelectorAll('.input').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
}

function showError(fieldId, errorId) {
    document.getElementById(fieldId).classList.add('error');
    document.getElementById(errorId).classList.add('show');
}

async function sendMessage() {
    clearErrors();

    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let hasError = false;

    if (!name) {
        showError('name', 'name-error');
        hasError = true;
    }

    if (!email || !emailRegex.test(email)) {
        showError('email', 'email-error');
        hasError = true;
    }

    if (!message) {
        showError('message', 'message-error');
        hasError = true;
    }

    if (hasError) {
        showToast('⚠️ Please fix the errors before sending.', true);
        return;
    }

    try {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
        const response = await fetch('/contact/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrfToken
            },
            body: new URLSearchParams({ name, email, subject, message })
        });
        const data = await response.json();
        if (data.success) {
            showToast('✉️ ' + data.message);
            document.getElementById('name').value    = '';
            document.getElementById('email').value   = '';
            document.getElementById('message').value = '';
        } else {
            showToast('❌ ' + data.message, true);
        }
    } catch (error) {
        showToast('❌ Failed to send message. Please try again.', true);
    }
}

function showToast(msg, isError = false) {
    const box   = document.getElementById('toast-box');
    const toast = document.createElement('div');
    toast.className = 'toast' + (isError ? ' toast-error' : '');
    toast.textContent = msg;
    box.appendChild(toast);
    setTimeout(() => toast.remove(), 3100);
}
