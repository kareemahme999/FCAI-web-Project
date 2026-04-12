    function clearErrors() {
    document.querySelectorAll('.input').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
}

    function showError(fieldId, errorId) {
    document.getElementById(fieldId).classList.add('error');
    document.getElementById(errorId).classList.add('show');
}


    function sendMessage() {
    clearErrors();

    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
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

    showToast('✉️ Message sent! We\'ll get back to you within 24 hours.');
    document.getElementById('name').value    = '';
    document.getElementById('email').value   = '';
    document.getElementById('message').value = '';
}

    function showToast(msg, isError = false) {
    const box   = document.getElementById('toast-box');
    const toast = document.createElement('div');
    toast.className = 'toast' + (isError ? ' toast-error' : '');
    toast.textContent = msg;
    box.appendChild(toast);
    setTimeout(() => toast.remove(), 3100);
}
