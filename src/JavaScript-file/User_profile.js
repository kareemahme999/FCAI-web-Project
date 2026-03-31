document.addEventListener('DOMContentLoaded', () => {
 
  // ── SCROLL REVEAL ──────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger each reveal by 80ms
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
 
  revealEls.forEach(el => revealObserver.observe(el));
 
 
  // ── SAVE PROFILE ───────────────────────────────────────
  const saveBtn      = document.getElementById('save-btn');
  const saveFeedback = document.getElementById('save-feedback');
  const inputName    = document.getElementById('input-name');
  const inputEmail   = document.getElementById('input-email');
 
  saveBtn?.addEventListener('click', () => {
    const name  = inputName?.value.trim();
    const email = inputEmail?.value.trim();
 
    // Basic validation
    if (!name) {
      showFeedback('Please enter a display name.', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      showFeedback('Please enter a valid email address.', 'error');
      return;
    }
 
    // Update visible name & avatar
    const profileName    = document.getElementById('profile-name');
    const profileEmail   = document.getElementById('profile-email-text');
    const avatarInitials = document.getElementById('avatar-initials');
 
    if (profileName)    profileName.textContent    = name;
    if (profileEmail)   profileEmail.textContent   = email;
    if (avatarInitials) avatarInitials.textContent = name.charAt(0).toUpperCase();
 
    // Save to localStorage
    localStorage.setItem('folio-profile', JSON.stringify({ name, email }));
 
    // Animate button
    saveBtn.textContent = '✓ Saved!';
    saveBtn.style.background = 'linear-gradient(135deg, #3a9e62, #4cb877)';
    showFeedback('Changes saved successfully!', 'success');
 
    setTimeout(() => {
      saveBtn.innerHTML = '<i class="bi bi-check2-circle" style="margin-right:6px;"></i> Save Changes';
      saveBtn.style.background = '';
      clearFeedback();
    }, 2500);
  });
 
 
  // ── RESTORE SAVED PROFILE ──────────────────────────────
  const saved = localStorage.getItem('folio-profile');
  if (saved) {
    try {
      const { name, email } = JSON.parse(saved);
      const profileName    = document.getElementById('profile-name');
      const profileEmail   = document.getElementById('profile-email-text');
      const avatarInitials = document.getElementById('avatar-initials');
 
      if (inputName && name)    inputName.value = name;
      if (inputEmail && email)  inputEmail.value = email;
      if (profileName && name)  profileName.textContent = name;
      if (profileEmail && email) profileEmail.textContent = email;
      if (avatarInitials && name) avatarInitials.textContent = name.charAt(0).toUpperCase();
    } catch (_) { /* corrupted storage, ignore */ }
  }
 
 
  // ── ANIMATED READING PROGRESS BAR ─────────────────────
  const bar = document.getElementById('reading-progress');
  if (bar) {
    const target = parseFloat(bar.style.width) || 58;
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.width = target + '%';
    }, 500);
  }
 
 
  // ── ANIMATED STAT COUNTERS ─────────────────────────────
  animateCounter('stat-read',    17, 900);
  animateCounter('stat-wish',    12, 700);
  animateCounter('stat-reviews',  8, 600);
 
 
  // ── ACTIVE NAV LINK ────────────────────────────────────
  const currentFile = window.location.pathname.split('/').pop();
  document.querySelectorAll('.F-header ul li a').forEach(link => {
    if (link.getAttribute('href') === currentFile) {
      link.classList.add('active-link');
    }
  });
 
 
  // ── HELPERS ────────────────────────────────────────────
 
  /**
   * Animate a numeric counter from 0 to target
   * @param {string} id       - element id
   * @param {number} target   - final number
   * @param {number} duration - ms
   */
  function animateCounter(id, target, duration) {
    const el = document.getElementById(id);
    if (!el) return;
 
    const startTime = performance.now();
 
    function update(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    }
 
    // Delay until the banner is in view
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(update);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
 
    const banner = document.querySelector('.profile-header');
    if (banner) observer.observe(banner);
    else requestAnimationFrame(update); // fallback
  }
 
  /**
   * Show feedback message under Save button
   * @param {string} msg
   * @param {'success'|'error'} type
   */
  function showFeedback(msg, type) {
    if (!saveFeedback) return;
    saveFeedback.textContent = msg;
    saveFeedback.style.color = type === 'error'
      ? 'var(--danger)'
      : 'var(--success)';
    saveFeedback.style.opacity = '1';
  }
 
  function clearFeedback() {
    if (!saveFeedback) return;
    saveFeedback.style.opacity = '0';
    setTimeout(() => { saveFeedback.textContent = ''; }, 300);
  }
 
  /**
   * Basic email format check
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
 
});
