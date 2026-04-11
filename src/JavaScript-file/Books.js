/* ══════════════════════════════════════════════
   FOLIO — Books.js
   • Search
   • Cart (localStorage: folio_cart)
   • Bookmark → saves to My List (localStorage: folio-mylist)
   • Badge counters on load
   ══════════════════════════════════════════════ */

/* ── BOOK COLOUR MAP (same colours used in my_list.js) ── */
const BOOK_COLORS = {
    'The Midnight Library':  'linear-gradient(145deg,#2d3142,#4f5d75)',
    'Lessons in Chemistry':  'linear-gradient(145deg,#3d2a2a,#6b4a4a)',
    'Atomic Habits':         'linear-gradient(145deg,#3d5a3e,#5e8b61)',
    'Dune':                  'linear-gradient(145deg,#5c4a1e,#8b6914)',
    'Foundation':            'linear-gradient(145deg,#1a2a4a,#2a4a7a)',
    'Sapiens':               'linear-gradient(145deg,#4a3020,#7a5035)',
    'The Alchemist':         'linear-gradient(145deg,#7a5a10,#b08820)',
    'Think Again':           'linear-gradient(145deg,#2a3a5a,#3a5a8a)',
};

/* ── GENRE → used as "status: want" when first saved ─── */

/* ════════════════ SEARCH ════════════════ */
const searchInput = document.querySelector('.L-header form input[type="search"]');
const cards       = document.querySelectorAll('.book-card');
const grid        = document.querySelector('.books-grid');

const noResults = document.createElement('p');
noResults.textContent = 'No books found.';
noResults.style.cssText =
    'grid-column:1/-1;color:var(--text3);font-size:14px;padding:20px 0;display:none;';
grid.appendChild(noResults);

if (searchInput) {
    searchInput.addEventListener('input', function () {
        const q = this.value.trim().toLowerCase();
        let visible = 0;
        cards.forEach(card => {
            const title  = card.querySelector('.title').textContent.toLowerCase();
            const author = card.querySelector('.author').textContent.toLowerCase();
            const show   = !q || title.includes(q) || author.includes(q);
            card.style.display = show ? '' : 'none';
            if (show) visible++;
        });
        noResults.style.display = visible === 0 ? 'block' : 'none';
    });
}

/* ════════════════ CART HELPERS ════════════════ */
function getCart()      { return JSON.parse(localStorage.getItem('folio_cart') || '[]'); }
function saveCart(cart) { localStorage.setItem('folio_cart', JSON.stringify(cart)); updateCartBadge(); }

function updateCartBadge() {
    const total = getCart().reduce((a, c) => a + c.qty, 0);
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
}

function addToCart(title, author, genre, price, color, btn) {
    const cart     = getCart();
    const existing = cart.find(x => x.title === title);
    if (existing) { existing.qty++; }
    else           { cart.push({ title, author, genre, price, color, qty: 1 }); }
    saveCart(cart);

    btn.classList.add('added');
    btn.innerHTML = '<i class="bi bi-check-lg"></i> Added!';
    setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = '<i class="bi bi-bag-plus"></i> Add to Cart';
    }, 1500);

    showToast(`"${title}" added to cart`);
}

/* ════════════════ MY LIST HELPERS ════════════════ */
function getMyList()       { return JSON.parse(localStorage.getItem('folio-mylist') || '[]'); }
function saveMyList(list)  { localStorage.setItem('folio-mylist', JSON.stringify(list)); }

/**
 * Called when user clicks the bookmark icon on a book card.
 * Adds the book to folio-mylist with status:"want" if not already there.
 * Toggles the icon fill + gold colour as visual feedback.
 */
function toggleBookmark(title, author, genre, color, iconEl) {
    const list     = getMyList();
    const existing = list.find(b => b.title === title);

    if (existing) {
        /* already saved → remove it */
        const updated = list.filter(b => b.title !== title);
        saveMyList(updated);
        iconEl.classList.remove('bi-bookmark-fill', 'bookmarked');
        iconEl.classList.add('bi-bookmark');
        showToast(`"${title}" removed from My List`);
    } else {
        /* not saved yet → add with status "want" */
        const maxId = list.reduce((m, b) => Math.max(m, b.id || 0), 0);
        list.push({
            id:            maxId + 1,
            title,
            author,
            genre,
            status:        'want',
            progress:      0,
            progressLabel: '',
            color:         color || BOOK_COLORS[title] || 'linear-gradient(145deg,#2d3142,#4f5d75)',
        });
        saveMyList(list);
        iconEl.classList.remove('bi-bookmark');
        iconEl.classList.add('bi-bookmark-fill', 'bookmarked');
        showToast(`"${title}" saved to My List ★`);
    }
}

/* ════════════════ INIT BOOKMARK STATES ════════════════ */
/* On page load, fill the bookmark icons for already-saved books */
function initBookmarkIcons() {
    const saved = getMyList().map(b => b.title);

    document.querySelectorAll('.book-card').forEach(card => {
        const iconEl = card.querySelector('.icons i[class*="bi-bookmark"]');
        if (!iconEl) return;

        /* Read data attributes (preferred) OR fall back to DOM text */
        const title  = iconEl.dataset.title  || card.querySelector('.title').textContent.trim();
        const author = iconEl.dataset.author || card.querySelector('.author').textContent.trim();
        const genre  = iconEl.dataset.genre  || card.querySelector('.category').textContent.trim();
        const color  = iconEl.dataset.color  || BOOK_COLORS[title] || 'linear-gradient(145deg,#2d3142,#4f5d75)';

        /* Restore saved state */
        if (saved.includes(title)) {
            iconEl.classList.remove('bi-bookmark');
            iconEl.classList.add('bi-bookmark-fill', 'bookmarked');
        }

        /* Wire up click */
        iconEl.addEventListener('click', () => toggleBookmark(title, author, genre, color, iconEl));
    });
}

/* ════════════════ TOAST ════════════════ */
function showToast(msg) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText =
            'position:fixed;bottom:28px;right:28px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.style.cssText =
        'background:#fff;border:1px solid rgba(0,0,0,0.1);border-left:3px solid var(--gold);' +
        'border-radius:10px;padding:12px 18px;font-size:13px;color:var(--text);' +
        'box-shadow:0 6px 24px rgba(0,0,0,0.1);animation:slideInToast 0.3s ease;min-width:220px;';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
}

/* Inject toast animation once */
const toastStyle = document.createElement('style');
toastStyle.textContent =
    '@keyframes slideInToast{from{transform:translateX(50px);opacity:0}to{transform:translateX(0);opacity:1}}' +
    '.icons i.bookmarked{background:var(--gold);color:#fff !important;border-color:var(--gold) !important;}';
document.head.appendChild(toastStyle);

/* ════════════════ BOOT ════════════════ */
updateCartBadge();
initBookmarkIcons();