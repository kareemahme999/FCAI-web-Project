// ── CART STATE from localStorage ──
let discountApplied = false;

function getCart() {
  return JSON.parse(localStorage.getItem('folio_cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('folio_cart', JSON.stringify(cart));
}

// ── RENDER CART ──
function renderCart() {
  const list = document.getElementById('cart-items-list');
  if (!list) return;

  const cartItems = getCart();

  if (cartItems.length === 0) {
    list.innerHTML = `
    <div class="empty-cart">
      <i class="bi bi-bag"></i>
      <p>Your cart is empty</p>
      <a href="Books.html" class="btn-ghost" style="display:inline-flex;border:1px solid var(--border2);border-radius:8px;margin-top:8px;">
        <i class="bi bi-grid"></i>&nbsp; Browse Books
      </a>
    </div>`;
    updateSummary(0);
    updateBadge(0);
    return;
  }

  list.innerHTML = cartItems.map((b, idx) => {
    const lineTotal = (b.price * b.qty).toFixed(2);
    return `
    <div class="cart-item" style="animation-delay:${idx * 0.07}s">
      <div class="book">
        <div class="book-cover" style="background:${b.color};" title="${b.title}">
          <div class="book-spine"></div>
          <span class="book-cover-title">${b.title}</span>
        </div>
        <div class="book-info">
          <div class="title">${b.title}</div>
          <div class="author">${b.author}</div>
          <div class="genre">${b.genre}</div>
        </div>
      </div>

      <div class="quantity">
        <button class="qty-btn" onclick="changeQty('${b.title}', -1)">−</button>
        <span class="qty-num">${b.qty}</span>
        <button class="qty-btn" onclick="changeQty('${b.title}', 1)">+</button>
      </div>

      <div class="price">$${lineTotal}</div>

      <button class="remove" onclick="removeFromCart('${b.title}')">
        <i class="bi bi-trash"></i>
      </button>
    </div>`;
  }).join('');

  const subtotal = cartItems.reduce((a, b) => a + b.price * b.qty, 0);
  updateSummary(subtotal);
  updateBadge(cartItems.reduce((a, b) => a + b.qty, 0));
}

// ── SUMMARY ──
function updateSummary(subtotal) {
  const discount = discountApplied ? subtotal * 0.10 : subtotal * 0.065;
  const total = subtotal - discount;
  document.getElementById('subtotal-val').textContent = '$' + subtotal.toFixed(2);
  document.getElementById('discount-val').textContent = '−$' + discount.toFixed(2);
  document.getElementById('total-val').textContent = '$' + total.toFixed(2);
}

// ── BADGE ──
function updateBadge(total) {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  if (total > 0) {
    badge.textContent = total;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// ── QUANTITY ──
function changeQty(title, delta) {
  const cart = getCart();
  const item = cart.find(x => x.title === title);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  renderCart();
  showToast(delta > 0 ? '📦 Quantity increased' : '📦 Quantity decreased');
}

// ── REMOVE ──
function removeFromCart(title) {
  let cart = getCart();
  cart = cart.filter(x => x.title !== title);
  saveCart(cart);
  renderCart();
  showToast(`🗑️ "${title}" removed`);
}

// ── CLEAR ──
function clearCart() {
  const cart = getCart();
  if (cart.length === 0) { showToast('🛒 Cart is already empty'); return; }
  saveCart([]);
  renderCart();
  showToast('🗑️ Cart cleared');
}

// ── PROMO ──
function applyPromo() {
  const input = document.getElementById('promo-input');
  const code = input.value.trim().toUpperCase();
  if (!code) { showToast('⚠️ Enter a promo code first'); return; }
  if (code === 'FOLIO10' || code === 'READ10') {
    discountApplied = true;
    renderCart();
    showToast('✅ Promo applied! 10% off');
    input.value = '';
  } else {
    showToast('❌ Invalid promo code');
  }
}

// ── TOAST ──
function showToast(msg) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast-folio';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3100);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', renderCart);