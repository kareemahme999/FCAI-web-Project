

const BOOKS_KEY  = 'folio_books';
const VISITS_KEY = 'folio_visits';

/* ── INCREMENT VISITOR COUNT ── */
(function trackVisit() {
    const current = parseInt(localStorage.getItem(VISITS_KEY) || '0');
    localStorage.setItem(VISITS_KEY, current + 1);
})();

const DEFAULT_TITLES = [
    'The Midnight Library', 'Lessons in Chemistry', 'Atomic Habits', 'Dune',
    'Foundation', 'Sapiens', 'The Alchemist', 'Think Again'
];


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

/* ════════════════ PAGINATION STATE ════════════════ */
let currentPage = 1;

function getAdminBooks() {
    try { return JSON.parse(localStorage.getItem(BOOKS_KEY) || '[]'); }
    catch(e) { return []; }
}


function syncDeletedBooks() {
    const stored = localStorage.getItem(BOOKS_KEY);
    if (stored === null) return;

    const adminBooks   = getAdminBooks();
    const activeTitles = adminBooks.map(b => b.title);

    htmlCards.forEach(card => {
        const titleEl = card.querySelector('.title');
        if (!titleEl) return;
        const title = titleEl.textContent.trim();

        if (DEFAULT_TITLES.includes(title) && !activeTitles.includes(title)) {
            card.style.display       = 'none';
            card.dataset.adminHidden = 'true';
        }
    });

    if (adminBooks.length === 0) {
        htmlCards.forEach(c => {
            c.style.display       = 'none';
            c.dataset.adminHidden = 'true';
        });
        noResults.textContent   = '📚 No books available right now. Check back soon!';
        noResults.style.display = 'block';
    }
}

/* ════════════════ SEARCH ════════════════ */
const searchInput = document.getElementById('search');
const htmlCards   = document.querySelectorAll('.book-card');
const grid        = document.querySelector('.books-grid');

const noResults = document.createElement('p');
noResults.textContent = 'No books found.';
noResults.style.cssText = 'grid-column:1/-1;color:var(--text3);font-size:14px;padding:20px 0;display:none;';
grid.appendChild(noResults);

if (searchInput) {
    searchInput.addEventListener('input', function () {
        const q = this.value.trim().toLowerCase();

        let visible = 0;
        htmlCards.forEach(card => {
            if (card.dataset.adminHidden === 'true') return;
            const title  = card.querySelector('.title').textContent.toLowerCase();
            const author = card.querySelector('.author').textContent.toLowerCase();
            const show   = !q || title.includes(q) || author.includes(q);
            card.style.display = show ? '' : 'none';
            if (show) visible++;
        });

        renderAdminBooks(q);

        const adminVisible = document.querySelectorAll('.admin-book-card').length;
        noResults.style.display = (visible + adminVisible) === 0 ? 'block' : 'none';
    });
}


function renderAdminBooks(filterQ = '') {
    // امسح أي admin cards قديمة
    document.querySelectorAll('.admin-book-card').forEach(c => c.remove());
    noResults.style.display = 'none';

    const adminBooks = getAdminBooks();
    let newBooks = adminBooks.filter(b => !DEFAULT_TITLES.includes(b.title) && b.status !== 'Draft');

    if (filterQ) {
        newBooks = newBooks.filter(b =>
            b.title.toLowerCase().includes(filterQ) ||
            b.author.toLowerCase().includes(filterQ)
        );
    }

    if (!newBooks.length) return;

    const COLORS_FALLBACK = [
        'linear-gradient(145deg,#2d3142,#4f5d75)',
        'linear-gradient(145deg,#3d5a3e,#5e8b61)',
        'linear-gradient(145deg,#5c4a1e,#8b6914)',
        'linear-gradient(145deg,#3a1a4a,#6a3a8a)',
        'linear-gradient(145deg,#1a4a3a,#3a8a6a)',
    ];

    newBooks.forEach((book, i) => {
        const color      = book.color || COLORS_FALLBACK[i % COLORS_FALLBACK.length];
        const finalPrice = book.discount > 0 ? book.price * (1 - book.discount / 100) : book.price;
        const discPrice  = book.discount > 0
            ? `<s style="color:var(--text3);font-size:12px;margin-right:4px;">$${book.price.toFixed(2)}</s>
               <span style="font-weight:700;color:var(--gold);">$${finalPrice.toFixed(2)}</span>`
            : `<span style="font-weight:700;color:var(--gold);">$${book.price.toFixed(2)}</span>`;
        const badgeLabel = book.discount > 0 ? `Sale -${book.discount}%` : 'New';

        const coverHtml = book.imgUrl
            ? `<img src="${book.imgUrl}" alt="${book.title}"
                    style="width:100%;height:210px;border-radius:10px;object-fit:cover;display:block;"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
               <div style="display:none;width:100%;height:210px;border-radius:10px;background:${color};
                           align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;
                           font-size:18px;font-weight:700;color:rgba(255,255,255,0.9);text-align:center;padding:16px;line-height:1.3;">
                 ${book.title}
               </div>`
            : `<div style="width:100%;height:210px;border-radius:10px;background:${color};
                           display:flex;align-items:center;justify-content:center;
                           font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:700;
                           color:rgba(255,255,255,0.9);text-align:center;padding:16px;line-height:1.3;">
                 ${book.title}
               </div>`;

        const li = document.createElement('li');
        li.className = 'book-card admin-book-card';
        li.innerHTML = `
      <div class="book-img">
        ${coverHtml}
        <span class="badge">${badgeLabel}</span>
      </div>
      <div class="book-info">
        <span class="category">${book.genre}</span>
        <h3 class="title">${book.title}</h3>
        <p class="author">${book.author}</p>
        <div class="rating">★★★★☆</div>
        <div class="book-footer">
          <div class="price">${discPrice}</div>
          <div class="icons">
            <i class="bi bi-bookmark"
               data-title="${book.title}"
               data-author="${book.author}"
               data-genre="${book.genre}"
               data-color="${color}"></i>
          </div>
        </div>
        <button class="add-to-cart"
          onclick="addToCart('${book.title.replace(/'/g,"\\'")}','${book.author.replace(/'/g,"\\'")}','${book.genre}',${finalPrice.toFixed(2)},'${color}',this)">
          <i class="bi bi-bag-plus"></i> Add to Cart
        </button>
      </div>`;

        // ★ بنضيف في grid Page 1 مباشرة (قبل noResults)
        grid.insertBefore(li, noResults);

        // wire bookmark
        const iconEl = li.querySelector('.icons i');
        if (getMyList().map(b => b.title).includes(book.title)) {
            iconEl.classList.replace('bi-bookmark', 'bi-bookmark-fill');
            iconEl.classList.add('bookmarked');
        }
        iconEl.addEventListener('click', () =>
            toggleBookmark(book.title, book.author, book.genre, color, iconEl)
        );
    });
}

/* ════════════════ PAGINATION ════════════════ */
function setupPagination() {
    const pages = document.querySelectorAll('.pagination .page');
    pages.forEach(p => {
        p.addEventListener('click', function () {
            pages.forEach(x => x.classList.remove('active'));
            this.classList.add('active');
            currentPage = parseInt(this.textContent) || 1;

            // أعد تهيئة الـ HTML cards
            htmlCards.forEach(c => {
                c.style.display       = '';
                c.dataset.adminHidden = 'false';
            });
            noResults.style.display = 'none';
            noResults.textContent   = 'No books found.';
            if (searchInput) searchInput.value = '';

            syncDeletedBooks();
            renderAdminBooks();
        });
    });
}

/* ════════════════ CART HELPERS ════════════════ */
function getCart()      { return JSON.parse(localStorage.getItem('folio_cart') || '[]'); }
function saveCart(cart) { localStorage.setItem('folio_cart', JSON.stringify(cart)); updateCartBadge(); }

function updateCartBadge() {
    const total = getCart().reduce((a, c) => a + c.qty, 0);
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    badge.textContent   = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
}

function addToCart(title, author, genre, price, color, btn) {
    const cart     = getCart();
    const existing = cart.find(x => x.title === title);
    if (existing) { existing.qty++; }
    else          { cart.push({ title, author, genre, price, color, qty: 1 }); }
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
function getMyList()      { return JSON.parse(localStorage.getItem('folio-mylist') || '[]'); }
function saveMyList(list) { localStorage.setItem('folio-mylist', JSON.stringify(list)); }

function toggleBookmark(title, author, genre, color, iconEl) {
    const list     = getMyList();
    const existing = list.find(b => b.title === title);
    if (existing) {
        saveMyList(list.filter(b => b.title !== title));
        iconEl.classList.remove('bi-bookmark-fill', 'bookmarked');
        iconEl.classList.add('bi-bookmark');
        showToast(`"${title}" removed from My List`);
    } else {
        const maxId = list.reduce((m, b) => Math.max(m, b.id || 0), 0);
        list.push({ id:maxId+1, title, author, genre, status:'want', progress:0, progressLabel:'',
            color: color || BOOK_COLORS[title] || 'linear-gradient(145deg,#2d3142,#4f5d75)' });
        saveMyList(list);
        iconEl.classList.remove('bi-bookmark');
        iconEl.classList.add('bi-bookmark-fill', 'bookmarked');
        showToast(`"${title}" saved to My List ★`);
    }
}

function initBookmarkIcons() {
    const saved = getMyList().map(b => b.title);
    document.querySelectorAll('.book-card:not(.admin-book-card)').forEach(card => {
        const iconEl = card.querySelector('.icons i[class*="bi-bookmark"]');
        if (!iconEl) return;
        const title  = iconEl.dataset.title  || card.querySelector('.title').textContent.trim();
        const author = iconEl.dataset.author || card.querySelector('.author').textContent.trim();
        const genre  = iconEl.dataset.genre  || card.querySelector('.category').textContent.trim();
        const color  = iconEl.dataset.color  || BOOK_COLORS[title] || 'linear-gradient(145deg,#2d3142,#4f5d75)';
        if (saved.includes(title)) {
            iconEl.classList.remove('bi-bookmark');
            iconEl.classList.add('bi-bookmark-fill', 'bookmarked');
        }
        iconEl.addEventListener('click', () => toggleBookmark(title, author, genre, color, iconEl));
    });
}

/* ════════════════ TOAST ════════════════ */
function showToast(msg) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed;bottom:28px;right:28px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.style.cssText = 'background:#fff;border:1px solid rgba(0,0,0,0.1);border-left:3px solid var(--gold);border-radius:10px;padding:12px 18px;font-size:13px;color:var(--text);box-shadow:0 6px 24px rgba(0,0,0,0.1);animation:slideInToast 0.3s ease;min-width:220px;';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
}

const toastStyle = document.createElement('style');
toastStyle.textContent =
    '@keyframes slideInToast{from{transform:translateX(50px);opacity:0}to{transform:translateX(0);opacity:1}}' +
    '.icons i.bookmarked{background:var(--gold);color:#fff !important;border-color:var(--gold) !important;}';
document.head.appendChild(toastStyle);





/* ════════════════ SORT & FILTER LOGIC ════════════════ */

function getAllVisibleCards() {
    return [...document.querySelectorAll('.book-card:not(.admin-book-card)')];
}

function getCardData(card) {
    const title  = card.querySelector('.title')?.textContent.trim() || '';
    const author = card.querySelector('.author')?.textContent.trim() || '';
    const genre  = card.querySelector('.category')?.textContent.trim() || '';
    const priceEl = card.querySelector('.price span');
    const price  = priceEl ? parseFloat(priceEl.textContent.replace('$','')) : 0;
    const stars  = card.querySelector('.rating')?.textContent.trim().split('★').length - 1 || 0;
    return { title, author, genre, price, stars };
}

function applyFiltersAndSort() {
    // قيم الـ sort
    const sortVal = document.querySelector('.sort-select')?.value || '';

    // قيم الـ genre checkboxes
    const genreChecks = [...document.querySelectorAll('.filters ul:first-of-type input[type=checkbox]:checked')]
        .map(cb => cb.parentElement.textContent.trim().toLowerCase());
    const allBooksChecked = genreChecks.includes('all books') || genreChecks.length === 0;

    // قيم الـ rating checkboxes
    const ratingChecks = [...document.querySelectorAll('.rating-row input[type=checkbox]:checked')]
        .map(cb => {
            const stars = cb.parentElement.querySelector('.stars')?.textContent.trim();
            return stars ? stars.split('★').length - 1 : 0;
        });
    const anyRating = ratingChecks.length === 0;

    // قيمة الـ price range
    const maxPrice = parseFloat(document.querySelector('.filters input[type=range]')?.value || 500);

    // اجمع كل الكروت (HTML + admin)
    const allCards = [...document.querySelectorAll('.book-card')];

    allCards.forEach(card => {
        if (card.dataset.adminHidden === 'true') return;
        const data = getCardData(card);

        // فلتر genre
        const genreMatch = allBooksChecked || genreChecks.includes(data.genre.toLowerCase());

        // فلتر rating
        const ratingMatch = anyRating || ratingChecks.some(r => data.stars >= r);

        // فلتر price
        const priceMatch = data.price <= maxPrice;

        card.style.display = (genreMatch && ratingMatch && priceMatch) ? '' : 'none';
    });

    // Sort — بنعمل sort للـ grid
    const grid = document.querySelector('.books-grid');
    const visibleCards = [...document.querySelectorAll('.book-card')]
        .filter(c => c.style.display !== 'none' && c.dataset.adminHidden !== 'true');

    if (sortVal.includes('Low to High')) {
        visibleCards.sort((a, b) => getCardData(a).price - getCardData(b).price);
    } else if (sortVal.includes('High to Low')) {
        visibleCards.sort((a, b) => getCardData(b).price - getCardData(a).price);
    } else if (sortVal.includes('Newest')) {
        visibleCards.reverse();
    }

    visibleCards.forEach(card => grid.insertBefore(card, noResults));
}

/* Wire الـ controls */
document.querySelector('.sort-select')?.addEventListener('change', applyFiltersAndSort);
document.querySelector('.apply-btn')?.addEventListener('click', applyFiltersAndSort);
document.querySelector('.filters input[type=range]')?.addEventListener('input', function() {
    document.querySelector('.price-labels span:last-child').textContent = `Up to $${this.value}`;
    applyFiltersAndSort();
});
document.querySelector('.clear')?.addEventListener('click', () => {
    document.querySelectorAll('.filters input[type=checkbox]').forEach(cb => cb.checked = false);
    const range = document.querySelector('.filters input[type=range]');
    if (range) { range.value = 500; document.querySelector('.price-labels span:last-child').textContent = 'Up to $500'; }
    document.querySelector('.sort-select').value = 'Sort: Featured';
    document.querySelectorAll('.book-card').forEach(c => { if (c.dataset.adminHidden !== 'true') c.style.display = ''; });
});

/* ════════════════ BOOT ════════════════ */
updateCartBadge();
initBookmarkIcons();
setupPagination();
syncDeletedBooks();
renderAdminBooks();