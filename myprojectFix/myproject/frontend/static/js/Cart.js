// ── CART STATE ──
let discountApplied = false;
let cartData = { items: [], total_price: 0 };

// ── GET CSRF TOKEN ──
function getCSRFToken() {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue;
}

// ── FETCH CART ──
async function fetchCart() {
  try {
    const response = await fetch('/api/cart/');
    if (response.ok) {
      cartData = await response.json();
    } else {
      cartData = { items: [], total_price: 0 };
    }
  } catch (error) {
    cartData = { items: [], total_price: 0 };
  }
}

// ── RENDER CART ──
async function renderCart() {
  await fetchCart();
  const list = document.getElementById('cart-items-list');
  if (!list) return;

  const cartItems = cartData.items;

  if (cartItems.length === 0) {
    list.innerHTML = `
    <div class="empty-cart">
      <i class="bi bi-bag"></i>
      <p>Your cart is empty</p>
      <a href="/books/" class="btn-ghost" style="display:inline-flex;border:1px solid var(--border2);border-radius:8px;margin-top:8px;">
        <i class="bi bi-grid"></i>&nbsp; Browse Books
      </a>
    </div>`;
    updateSummary(0);
    updateBadge(0);
    return;
  }

  list.innerHTML = cartItems.map((item, idx) => {
    const book = item.book;
    const lineTotal = item.total_price;
    return `
    <div class="cart-item" style="animation-delay:${idx * 0.07}s">
      <div class="book">
        <div class="book-cover" style="background:${book.color};" title="${book.title}">
          <div class="book-spine"></div>
          <span class="book-cover-title">${book.title}</span>
        </div>
        <div class="book-info">
          <div class="title">${book.title}</div>
          <div class="author">${book.author}</div>
          <div class="genre">${book.genre}</div>
        </div>
      </div>

      <div class="quantity">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span class="qty-num">${item.quantity}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
      </div>

      <div class="price">$${lineTotal}</div>

      <button class="remove" onclick="removeFromCart(${item.id})">
        <i class="bi bi-trash"></i>
      </button>
    </div>`;
  }).join('');

  const subtotal = cartData.total_price;
  updateSummary(subtotal);
  updateBadge(cartItems.reduce((a, b) => a + b.quantity, 0));
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
async function changeQty(itemId, delta) {
  const newQty = cartData.items.find(i => i.id === itemId).quantity + delta;
  if (newQty < 1) return;

  try {
    const response = await fetch('/api/cart/update/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
      },
      body: JSON.stringify({ item_id: itemId, quantity: newQty })
    });
    const data = await response.json();
    if (data.success) {
      await renderCart();
      showToast(delta > 0 ? '📦 Quantity increased' : '📦 Quantity decreased');
    } else {
      showToast('❌ Error updating quantity');
    }
  } catch (error) {
    showToast('❌ Error updating quantity');
  }
}

// ── REMOVE ──
async function removeFromCart(itemId) {
  try {
    const response = await fetch('/api/cart/remove/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
      },
      body: JSON.stringify({ item_id: itemId })
    });
    const data = await response.json();
    if (data.success) {
      await renderCart();
      showToast('🗑️ Item removed');
    } else {
      showToast('❌ Error removing item');
    }
  } catch (error) {
    showToast('❌ Error removing item');
  }
}

// ── CLEAR ──
async function clearCart() {
  if (cartData.items.length === 0) { showToast('🛒 Cart is already empty'); return; }
  // To clear, remove all items
  for (const item of cartData.items) {
    await removeFromCart(item.id);
  }
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
document.addEventListener('DOMContentLoaded', () => renderCart());