/* ══════════════════════════════════════════════
   FOLIO — my_list.js
   • Reads folio-mylist from localStorage
   • Tabs counts always correct
   • Supports books added from Books.html via bookmark
   ══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── DEFAULT BOOKS (fallback when storage is empty) ── */
  const DEFAULT_BOOKS = [
    { id:1, title:'The Midnight Library', author:'Matt Haig',          genre:'Fiction',         status:'reading',  progress:58,  progressLabel:'Page 187 of 320',  color:'linear-gradient(145deg,#2d3142,#4f5d75)' },
    { id:2, title:'Lessons in Chemistry', author:'Bonnie Garmus',      genre:'Literary Fiction', status:'want',     progress:0,   progressLabel:'',                  color:'linear-gradient(145deg,#6b2737,#9b4456)' },
    { id:3, title:'Atomic Habits',        author:'James Clear',        genre:'Self-Help',        status:'finished', progress:100, progressLabel:'100% complete',     color:'linear-gradient(145deg,#3d5a3e,#5e8b61)' },
    { id:4, title:'Dune',                 author:'Frank Herbert',      genre:'Sci-Fi',            status:'want',     progress:0,   progressLabel:'',                  color:'linear-gradient(145deg,#5c4a1e,#8b6914)' },
    { id:5, title:'Foundation',           author:'Isaac Asimov',       genre:'Sci-Fi',            status:'want',     progress:0,   progressLabel:'',                  color:'linear-gradient(145deg,#2f3f5b,#3d6b8a)' },
    { id:6, title:'Sapiens',              author:'Yuval Noah Harari',  genre:'History',           status:'finished', progress:100, progressLabel:'100% complete',     color:'linear-gradient(145deg,#4a3020,#7a5035)' },
  ];

  /* ── STATE ── */
  let books        = loadBooks();
  let activeFilter = 'all';
  let searchQuery  = '';
  let sortOrder    = 'default';

  /* ── STORAGE ── */
  function loadBooks() {
    try {
      const saved = localStorage.getItem('folio-mylist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    /* First visit: seed with defaults and save */
    const defaults = [...DEFAULT_BOOKS];
    localStorage.setItem('folio-mylist', JSON.stringify(defaults));
    return defaults;
  }

  function saveBooks() {
    localStorage.setItem('folio-mylist', JSON.stringify(books));
  }

  /* ── STATS ── */
  function renderStats() {
    document.getElementById('stats-row').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon"><i class="bi bi-journals"></i></div>
        <div class="stat-info">
          <div class="stat-num">${books.length}</div>
          <div class="stat-lbl">Total Books</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="bi bi-book-half"></i></div>
        <div class="stat-info">
          <div class="stat-num">${books.filter(b => b.status === 'reading').length}</div>
          <div class="stat-lbl">Currently Reading</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="bi bi-patch-check"></i></div>
        <div class="stat-info">
          <div class="stat-num">${books.filter(b => b.status === 'finished').length}</div>
          <div class="stat-lbl">Books Finished</div>
        </div>
      </div>
    `;
  }

  /* ── TAB COUNTS — always reflects real data ── */
  function updateCounts() {
    document.getElementById('count-all').textContent      = books.length;
    document.getElementById('count-reading').textContent  = books.filter(b => b.status === 'reading').length;
    document.getElementById('count-want').textContent     = books.filter(b => b.status === 'want').length;
    document.getElementById('count-finished').textContent = books.filter(b => b.status === 'finished').length;
  }

  /* ── FILTER + SORT ── */
  function getFilteredBooks() {
    let result = [...books];
    if (activeFilter !== 'all') result = result.filter(b => b.status === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
          b.title.toLowerCase().includes(q)  ||
          b.author.toLowerCase().includes(q) ||
          b.genre.toLowerCase().includes(q)
      );
    }
    if (sortOrder === 'title')    result.sort((a, b) => a.title.localeCompare(b.title));
    if (sortOrder === 'author')   result.sort((a, b) => a.author.localeCompare(b.author));
    if (sortOrder === 'progress') result.sort((a, b) => b.progress - a.progress);
    return result;
  }

  /* ── STATUS BADGE HTML ── */
  function statusLabel(status) {
    const map = { reading:'Reading', want:'Want to Read', finished:'Finished' };
    return `<span class="status ${status}">${map[status] || status}</span>`;
  }

  /* ── BUILD LIST ITEM ── */
  function buildItem(book, index) {
    const progressHTML = book.progress > 0 ? `
      <div class="progress-wrap">
        <div class="progress-bar" data-width="${book.progress}" style="width:0%;"></div>
      </div>
      <div class="progress-label">${book.progressLabel}</div>
    ` : '';

    return `
      <div class="list-item" data-id="${book.id}" style="animation-delay:${index * 50}ms;">
        <div class="book-cover" style="background:${book.color};">
          <div class="spine"></div>
          <span class="cover-title">${book.title}</span>
        </div>
        <div class="details">
          <div class="genre-tag">${book.genre}</div>
          <h4 title="${book.title}">${book.title}</h4>
          <p>${book.author}</p>
          ${statusLabel(book.status)}
          ${progressHTML}
        </div>
        <div class="actions">
          <button class="action-btn btn-status" data-id="${book.id}" title="Change status">
            <i class="bi bi-arrow-repeat"></i>
          </button>
          <a href="Cart.html" class="action-btn" title="Add to Cart">
            <i class="bi bi-bag-plus"></i>
          </a>
          <button class="action-btn danger btn-remove" data-id="${book.id}" title="Remove">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  /* ── RENDER ── */
  function renderList() {
    const filtered = getFilteredBooks();
    const listEl   = document.getElementById('book-list');
    const emptyEl  = document.getElementById('empty-state');

    if (filtered.length === 0) {
      listEl.innerHTML = '';
      emptyEl.style.display = 'block';
    } else {
      emptyEl.style.display = 'none';
      listEl.innerHTML = filtered.map((b, i) => buildItem(b, i)).join('');

      requestAnimationFrame(() => {
        listEl.querySelectorAll('.progress-bar[data-width]').forEach(bar => {
          const target = bar.getAttribute('data-width');
          setTimeout(() => { bar.style.width = target + '%'; }, 100);
        });
      });

      listEl.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', () => removeBook(+btn.dataset.id));
      });

      listEl.querySelectorAll('.btn-status').forEach(btn => {
        btn.addEventListener('click', () => cycleStatus(+btn.dataset.id));
      });
    }

    updateCounts();
    renderStats();
  }

  /* ── REMOVE ── */
  function removeBook(id) {
    const book = books.find(b => b.id === id);
    books = books.filter(b => b.id !== id);
    saveBooks();
    renderList();
    if (book) showToast(`Removed "${book.title}"`);
  }

  /* ── CYCLE STATUS ── */
  const CYCLE = { want:'reading', reading:'finished', finished:'want' };

  function cycleStatus(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;
    const prev   = book.status;
    book.status  = CYCLE[book.status] || 'want';
    if (book.status === 'finished') {
      book.progress = 100; book.progressLabel = '100% complete';
    } else if (prev === 'finished') {
      book.progress = 0; book.progressLabel = '';
    }
    saveBooks();
    renderList();
    const label = { want:'Want to Read', reading:'Reading', finished:'Finished' };
    showToast(`"${book.title}" → ${label[book.status]}`);
  }

  /* ── TABS ── */
  document.getElementById('tab-bar').addEventListener('click', e => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderList();
  });

  /* ── SEARCH ── */
  document.getElementById('list-search').addEventListener('input', e => {
    searchQuery = e.target.value;
    renderList();
  });

  /* ── SORT ── */
  document.getElementById('sort-select').addEventListener('change', e => {
    sortOrder = e.target.value;
    renderList();
  });

  /* ── TOAST ── */
  function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3100);
  }

  /* ── ACTIVE NAV LINK ── */
  const currentFile = window.location.pathname.split('/').pop();
  document.querySelectorAll('.F-header ul li a').forEach(link => {
    if (link.getAttribute('href') === currentFile) link.classList.add('active-link');
  });

  /* ── INIT ── */
  renderList();
});