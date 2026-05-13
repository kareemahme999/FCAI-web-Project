/* ── TRACK VISIT ── */
(function trackPageVisit() {
    if (!sessionStorage.getItem('folio_visit_counted')) {
        sessionStorage.setItem('folio_visit_counted', '1');
        const current = parseInt(localStorage.getItem('folio_visits') || '0');
        localStorage.setItem('folio_visits', current + 1);
    }
})();

/**
 * CSRF TOKEN EXTRACTION - Multiple fallback methods
 * Ensures CSRF token is always retrieved for authentication
 */
function getCsrfToken() {
    // Method 1: Try to get from meta tag (common in Django templates)
    let token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) return token;
    
    // Method 2: Try to get from hidden input with name="csrfmiddlewaretoken"
    token = document.querySelector('input[name="csrfmiddlewaretoken"]')?.value;
    if (token) return token;
    
    // Method 3: Try to get from cookie
    const name = 'csrftoken';
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
    if (cookieValue) return cookieValue;
    
    // If all methods fail, log error
    console.error('CSRF Token not found! This will cause authentication to fail.');
    return '';
}

/* ── SHOW / HIDE ADMIN FIELDS ── */
function toggleAdminFields() {
    const isChecked   = document.getElementById('is-admin').checked;
    const adminFields = document.getElementById('admin-fields');
    const mainForm    = document.getElementById('main-form');
    if (isChecked) {
        adminFields.classList.add('show');
        mainForm.classList.add('admin-mode');
    } else {
        adminFields.classList.remove('show');
        mainForm.classList.remove('admin-mode');
        document.getElementById('admin-username').value = '';
        document.getElementById('admin-password').value = '';
    }
}

/**
 * IMPROVED LOGIN HANDLER
 * - Better error handling
 * - CSRF token validation
 * - Form validation
 */
function handleLogin() {
    const isAdminMode = document.getElementById('is-admin').checked;

    if (isAdminMode) {
        const adminUser = document.getElementById('admin-username').value.trim();
        const adminPass = document.getElementById('admin-password').value.trim();

        if (!adminUser || !adminPass) {
            showToast('⚠️ Please enter admin credentials.', true);
            return;
        }

        performLogin(adminUser, adminPass);
        return;
    }

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        showToast('⚠️ Please fill in all fields.', true);
        return;
    }

    performLogin(username, password);
}

/**
 * ACTUAL LOGIN REQUEST
 * Sends credentials to backend with proper CSRF protection
 */
function performLogin(username, password) {
    const csrfToken = getCsrfToken();
    
    // Create form data
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    console.log('Attempting login for user:', username);
    console.log('CSRF token present:', csrfToken ? 'Yes' : 'No');

    fetch('/login/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
        },
        body: formData,
        credentials: 'same-origin'  // Ensure cookies are sent
    })
    .then(response => {
        console.log('Login response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Login response:', data);
        if (data.success) {
            showToast('✅ Welcome back, ' + username + '!');
            setTimeout(() => { 
                window.location.href = data.redirect || '/home/'; 
            }, 1400);
        } else {
            const errorMsg = data.error || data.message || 'Login failed. Please try again.';
            showToast('❌ ' + errorMsg, true);
            console.error('Login error:', errorMsg);
        }
    })
    .catch(error => {
        console.error('Login fetch error:', error);
        showToast('❌ Network error. Please check your connection and try again.', true);
    });
}

/**
 * IMPROVED REGISTER HANDLER
 * - Better validation
 * - Improved error messages
 */
function handleRegister() {
    const email    = document.getElementById('reg-email').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const password_confirm = document.getElementById('reg-password-confirm').value.trim();

    // Validation
    if (!email || !username || !password || !password_confirm) { 
        showToast('⚠️ Please fill in all fields.', true); 
        return; 
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { 
        showToast('⚠️ Please enter a valid email address.', true); 
        return; 
    }

    if (username.length < 3) { 
        showToast('⚠️ Username must be at least 3 characters long.', true); 
        return; 
    }

    if (password.length < 6) { 
        showToast('⚠️ Password must be at least 6 characters long.', true); 
        return; 
    }

    if (password !== password_confirm) { 
        showToast('⚠️ Passwords do not match.', true); 
        return; 
    }

    performRegister(username, email, password, password_confirm);
}

/**
 * ACTUAL REGISTER REQUEST
 * Sends registration data to backend
 */
function performRegister(username, email, password, password_confirm) {
    const csrfToken = getCsrfToken();

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('password_confirm', password_confirm);

    console.log('Attempting registration for user:', username);
    console.log('CSRF token present:', csrfToken ? 'Yes' : 'No');

    fetch('/register/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
        },
        body: formData,
        credentials: 'same-origin'
    })
    .then(response => {
        console.log('Register response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Register response:', data);
        if (data.success) {
            showToast('🎉 Account created! Logging you in...');
            setTimeout(() => { 
                window.location.href = data.redirect || '/home/'; 
            }, 1600);
        } else {
            const errorMsg = data.error || data.message || 'Registration failed. Please try again.';
            showToast('⚠️ ' + errorMsg, true);
            console.error('Register error:', errorMsg);
        }
    })
    .catch(error => {
        console.error('Register fetch error:', error);
        showToast('❌ Network error. Please check your connection and try again.', true);
    });
}

/* ── SWITCH FORMS ── */
function switchToRegister() {
    document.getElementById('box-login').classList.add('hidden');
    document.getElementById('box-register').classList.add('active');
}

function switchToLogin() {
    document.getElementById('box-login').classList.remove('hidden');
    document.getElementById('box-register').classList.remove('active');
}

function forgotPass() { 
    showToast('📧 Password reset link sent (demo).'); 
}

/**
 * TOAST NOTIFICATION
 * Displays temporary messages to user
 */
function showToast(msg, isError = false) {
    const box   = document.getElementById('toast-box');
    if (!box) {
        console.error('Toast box element not found!');
        alert(msg);  // Fallback to alert if toast box doesn't exist
        return;
    }
    
    const toast = document.createElement('div');
    toast.className   = 'toast' + (isError ? ' toast-error' : '');
    toast.textContent = msg;
    box.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3100);
}

/* ── KEYBOARD NAVIGATION ── */
document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const loginVisible = !document.getElementById('box-login').classList.contains('hidden');
    if (loginVisible) handleLogin(); else handleRegister();
});

/* ── PAGE LOAD VERIFICATION ── */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    console.log('CSRF token available:', getCsrfToken() ? 'Yes' : 'No');
    console.log('Toast box exists:', document.getElementById('toast-box') ? 'Yes' : 'No');
});
