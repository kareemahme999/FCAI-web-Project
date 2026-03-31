// ── BOOK DATA ──
const BOOKS = [
  { id: 1, title: 'The Midnight Library', author: 'Matt Haig', genre: 'Fiction', price: 18.99, color: 'linear-gradient(145deg,#2d3142,#4f5d75)' },
  { id: 2, title: 'Atomic Habits', author: 'James Clear', genre: 'Self-Help', price: 19.99, color: 'linear-gradient(145deg,#3d5a3e,#5e8b61)' },
  { id: 3, title: 'Dune', author: 'Frank Herbert', genre: 'Sci-Fi', price: 16.99, color: 'linear-gradient(145deg,#5c4a1e,#8b6914)' },
  { id: 4, title: 'Sapiens', author: 'Yuval Harari', genre: 'History', price: 21.99, color: 'linear-gradient(145deg,#4a3020,#7a5035)' },
  { id: 5, title: 'The Alchemist', author: 'Paulo Coelho', genre: 'Fiction', price: 13.99, color: 'linear-gradient(145deg,#7a5a10,#b08820)' },
];

// ── CART STATE ──
let cartItems = [
  { bookId: 1, qty: 2 },
  { bookId: 2, qty: 1 },
];

let discountApplied = false;

// ── RENDER CART ──
function renderCart() {
  const list = document.getElementById('cart-items-list');
  if (!list) return;

  if (cartItems.length === 0) {
    list.innerHTML = `
    <div class="empty-cart">
      <i class="bi bi-bag"></i>
      <p>Your cart is empty</p>
      <a href="#" class="btn-ghost" style="display:inline-flex;border:1px solid var(--border2);border-radius:8px;">
        <i class="bi bi-grid"></i> Browse Books
      </a>
    </div>`;
    updateSummary(0);
    updateBadge();
    return;
  }

  list.innerHTML = cartItems.map((c, idx) => {
    const b = BOOKS.find(x => x.id === c.bookId);
    if (!b) return '';
    const lineTotal = (b.price * c.qty).toFixed(2);

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
        <button class="qty-btn" onclick="changeQty(${b.id}, -1)">−</button>
        <span class="qty-num">${c.qty}</span>
        <button class="qty-btn" onclick="changeQty(${b.id}, 1)">+</button>
      </div>

      <div class="price">$${lineTotal}</div>

      <button class="remove" onclick="removeFromCart(${b.id})">
        <i class="bi bi-trash"></i>
      </button>
    </div>`;
  }).join('');

  const subtotal = cartItems.reduce((a, c) => {
    const b = BOOKS.find(x => x.id === c.bookId);
    return a + (b ? b.price * c.qty : 0);
  }, 0);

  updateSummary(subtotal);
  updateBadge();
}

// ── SUMMARY ──
function updateSummary(subtotal) {
  const discount = discountApplied ? subtotal * 0.1 : subtotal * 0.065;
  const total = subtotal - discount;

  document.getElementById('subtotal-val').textContent = '$' + subtotal.toFixed(2);
  document.getElementById('discount-val').textContent = '−$' + discount.toFixed(2);
  document.getElementById('total-val').textContent = '$' + total.toFixed(2);
}

// ── BADGE ──
function updateBadge() {
  const total = cartItems.reduce((a, c) => a + c.qty, 0);
  const badge = document.getElementById('cart-badge');
  if (badge) badge.textContent = total;
}

// ── QUANTITY ──
function changeQty(id, delta) {
  const item = cartItems.find(x => x.bookId === id);
  if (!item) return;

  item.qty = Math.max(1, item.qty + delta);
  renderCart();
  showToast(delta > 0 ? '📦 Quantity increased' : '📦 Quantity decreased');
}

// ── REMOVE ITEM ──
function removeFromCart(id) {
  const b = BOOKS.find(x => x.id === id);
  cartItems = cartItems.filter(x => x.bookId !== id);

  renderCart();
  showToast(`🗑️ "${b ? b.title : 'Item'}" removed`);
}

// ── CLEAR CART ──
function clearCart() {
  if (cartItems.length === 0) {
    showToast('🛒 Cart is already empty');
    return;
  }

  cartItems = [];
  renderCart();
  showToast('🗑️ Cart cleared');
}

// ── PROMO ──
function applyPromo() {
  const input = document.getElementById('promo-input');
  const code = input.value.trim().toUpperCase();

  if (!code) {
    showToast('⚠️ Enter a promo code first');
    return;
  }

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

  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 3100);
}

// ── INIT ──
document.addEventListener("DOMContentLoaded", renderCart);
