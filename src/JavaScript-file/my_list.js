


document.addEventListener('DOMContentLoaded', () => {
 
  // ── BOOK DATA ──────────────────────────────────────────
  const BOOKS = [
    {
      id: 1,
      title: 'The Midnight Library',
      author: 'Matt Haig',
      genre: 'Fiction',
      status: 'reading',
      progress: 58,
      progressLabel: 'Page 187 of 320',
      color: 'linear-gradient(145deg,#2d3142,#4f5d75)',
    },
    {
      id: 2,
      title: 'Lessons in Chemistry',
      author: 'Bonnie Garmus',
      genre: 'Literary Fiction',
      status: 'want',
      progress: 0,
      progressLabel: '',
      color: 'linear-gradient(145deg,#6b2737,#9b4456)',
    },
    {
      id: 3,
      title: 'Atomic Habits',
      author: 'James Clear',
      genre: 'Self-Help',
      status: 'finished',
      progress: 100,
      progressLabel: '100% complete',
      color: 'linear-gradient(145deg,#3d5a3e,#5e8b61)',
    },
    {
      id: 4,
      title: 'Dune',
      author: 'Frank Herbert',
      genre: 'Sci-Fi',
      status: 'want',
      progress: 0,
      progressLabel: '',
      color: 'linear-gradient(145deg,#5c4a1e,#8b6914)',
    },
    {
      id: 5,
      title: 'Foundation',
      author: 'Isaac Asimov',
      genre: 'Sci-Fi',
      status: 'want',
      progress: 0,
      progressLabel: '',
      color: 'linear-gradient(145deg,#2f3f5b,#3d6b8a)',
    },
    {
      id: 6,
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      genre: 'History',
      status: 'finished',
      progress: 100,
      progressLabel: '100% complete',
      color: 'linear-gradient(145deg,#4a3020,#7a5035)',
    },
  ];
 
  // ── STATE ──────────────────────────────────────────────
  let books        = loadBooks();
  let activeFilter = 'all';
  let searchQuery  = '';
  let sortOrder    = 'default';
 
  // Load from localStorage or fall back to defaults
  function loadBooks() {
    try {
      const saved = localStorage.getItem('folio-mylist');
      return saved ? JSON.parse(saved) : [...BOOKS];
    } catch (_) {
      return [...BOOKS];
    }
  }
 
  function saveBooks() {
    localStorage.setItem('folio-mylist', JSON.stringify(books));
  }
 
 
  // ── RENDER STATS ───────────────────────────────────────
  function renderStats() {
    const total    = books.length;
    const reading  = books.filter(b => b.status === 'reading').length;
    const finished = books.filter(b => b.status === 'finished').length;
 
    document.getElementById('stats-row').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon"><i class="bi bi-journals"></i></div>
        <div class="stat-info">
          <div class="stat-num">${total}</div>
          <div class="stat-lbl">Total Books</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="bi bi-book-half"></i></div>
        <div class="stat-info">
          <div class="stat-num">${reading}</div>
          <div class="stat-lbl">Currently Reading</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="bi bi-patch-check"></i></div>
        <div class="stat-info">
          <div class="stat-num">${finished}</div>
          <div class="stat-lbl">Books Finished</div>
        </div>
      </div>
    `;
  }
 
 
  // ── UPDATE TAB COUNTS ──────────────────────────────────
  function updateCounts() {
    document.getElementById('count-all').textContent     = books.length;
    document.getElementById('count-reading').textContent = books.filter(b => b.status === 'reading').length;
    document.getElementById('count-want').textContent    = books.filter(b => b.status === 'want').length;
    document.getElementById('count-finished').textContent= books.filter(b => b.status === 'finished').length;
  }
 
 
  // ── FILTER + SORT ──────────────────────────────────────
  function getFilteredBooks() {
    let result = [...books];
 
    // Filter by tab
    if (activeFilter !== 'all') {
      result = result.filter(b => b.status === activeFilter);
    }
 
    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q)
      );
    }
 
    // Sort
    if (sortOrder === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOrder === 'author') {
      result.sort((a, b) => a.author.localeCompare(b.author));
    } else if (sortOrder === 'progress') {
      result.sort((a, b) => b.progress - a.progress);
    }
 
    return result;
  }
 
 
  // ── BUILD STATUS HTML ──────────────────────────────────
  function statusLabel(status) {
    const map = {
      reading:  'Reading',
      want:     'Want to Read',
      finished: 'Finished',
    };
    return `<span class="status ${status}">${map[status] || status}</span>`;
  }
 
 
  // ── BUILD SINGLE LIST ITEM ─────────────────────────────
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
 
 
  // ── RENDER LIST ────────────────────────────────────────
  function renderList() {
    const filtered   = getFilteredBooks();
    const listEl     = document.getElementById('book-list');
    const emptyEl    = document.getElementById('empty-state');
 
    if (filtered.length === 0) {
      listEl.innerHTML = '';
      emptyEl.style.display = 'block';
    } else {
      emptyEl.style.display = 'none';
      listEl.innerHTML = filtered.map((b, i) => buildItem(b, i)).join('');
 
      // Animate progress bars after paint
      requestAnimationFrame(() => {
        listEl.querySelectorAll('.progress-bar[data-width]').forEach(bar => {
          const target = bar.getAttribute('data-width');
          setTimeout(() => { bar.style.width = target + '%'; }, 100);
        });
      });
 
      // Attach action listeners
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
 
 
  // ── REMOVE BOOK ────────────────────────────────────────
  function removeBook(id) {
    const book = books.find(b => b.id === id);
    books = books.filter(b => b.id !== id);
    saveBooks();
    renderList();
    if (book) showToast(` Removed "${book.title}"`);
  }
 
 
  // ── CYCLE STATUS ───────────────────────────────────────
  const CYCLE = { want: 'reading', reading: 'finished', finished: 'want' };
 
  function cycleStatus(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;
 
    const prev = book.status;
    book.status = CYCLE[book.status] || 'want';
 
    // Reset or set progress when moving to/from finished
    if (book.status === 'finished') {
      book.progress = 100;
      book.progressLabel = '100% complete';
    } else if (prev === 'finished') {
      book.progress = 0;
      book.progressLabel = '';
    }
 
    saveBooks();
    renderList();
    showToast(`📚 "${book.title}" → ${book.status === 'want' ? 'Want to Read' : book.status === 'reading' ? 'Reading' : 'Finished'}`);
  }
 
 
  // ── TABS ───────────────────────────────────────────────
  document.getElementById('tab-bar').addEventListener('click', e => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderList();
  });
 
 
  // ── LIVE SEARCH ────────────────────────────────────────
  document.getElementById('list-search').addEventListener('input', e => {
    searchQuery = e.target.value;
    renderList();
  });
 
 
  // ── SORT ───────────────────────────────────────────────
  document.getElementById('sort-select').addEventListener('change', e => {
    sortOrder = e.target.value;
    renderList();
  });
 
 
  // ── TOAST ──────────────────────────────────────────────
  function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3100);
  }
 
 
  // ── ACTIVE NAV ─────────────────────────────────────────
  const currentFile = window.location.pathname.split('/').pop();
  document.querySelectorAll('.F-header ul li a').forEach(link => {
    if (link.getAttribute('href') === currentFile) {
      link.classList.add('active-link');
    }
  });
 
 
  // ── INIT ───────────────────────────────────────────────
  renderList();
 
});
