/* ── ADMIN CREDENTIALS — change these ── */
const ADMIN_USERNAME = 'Kareem';
const ADMIN_PASSWORD = '66200660K';


(function trackPageVisit() {
    /* Use sessionStorage to avoid counting the same tab twice on refresh */
    if (!sessionStorage.getItem('folio_visit_counted')) {
        sessionStorage.setItem('folio_visit_counted', '1');
        const current = parseInt(localStorage.getItem('folio_visits') || '0');
        localStorage.setItem('folio_visits', current + 1);
    }
})();


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

/* ── LOGIN ── */
function handleLogin() {
    const isAdminMode = document.getElementById('is-admin').checked;

    if (isAdminMode) {
        const adminUser = document.getElementById('admin-username').value.trim();
        const adminPass = document.getElementById('admin-password').value.trim();
        if (!adminUser || !adminPass) {
            showToast('⚠️ Please enter admin credentials.', true);
            return;
        }
        if (adminUser === ADMIN_USERNAME && adminPass === ADMIN_PASSWORD) {
            showToast('🛡️ Welcome, Admin! Opening dashboard...');
            setTimeout(() => { window.location.href = 'admin.html'; }, 1200);
        } else {
            showToast('❌ Incorrect admin credentials.', true);
        }
        return;
    }

    /* Normal user */
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!username || !password) {
        showToast('⚠️ Please fill in all fields.', true);
        return;
    }
    showToast('✅ Welcome back, ' + username + '!');
    setTimeout(() => { window.location.href = 'User_profile.html'; }, 1400);
}

/* ── REGISTER ── */
function handleRegister() {
    const email    = document.getElementById('reg-email').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const emailOk  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email || !username || !password) { showToast('⚠️ Please fill in all fields.', true); return; }
    if (!emailOk) { showToast('⚠️ Please enter a valid email.', true); return; }
    if (password.length < 6) { showToast('⚠️ Password must be at least 6 characters.', true); return; }
    showToast('🎉 Account created! You can now log in.');
    setTimeout(() => switchToLogin(), 1600);
}

/* ── SWITCH ── */
function switchToRegister() {
    document.getElementById('box-login').classList.add('hidden');
    document.getElementById('box-register').classList.add('active');
}
function switchToLogin() {
    document.getElementById('box-login').classList.remove('hidden');
    document.getElementById('box-register').classList.remove('active');
}

function forgotPass() { showToast('📧 Password reset link sent (demo).'); }

/* ── TOAST ── */
function showToast(msg, isError = false) {
    const box   = document.getElementById('toast-box');
    const toast = document.createElement('div');
    toast.className   = 'toast' + (isError ? ' toast-error' : '');
    toast.textContent = msg;
    box.appendChild(toast);
    setTimeout(() => toast.remove(), 3100);
}

/* ── ENTER KEY ── */
document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const loginVisible = !document.getElementById('box-login').classList.contains('hidden');
    if (loginVisible) handleLogin(); else handleRegister();
});