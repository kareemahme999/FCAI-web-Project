
/* ── STORAGE KEYS ── */
const BOOKS_KEY   = 'folio_books';
const VISITS_KEY  = 'folio_visits';
const ORDERS_KEY  = 'folio_orders';

/* ── DEFAULT BOOKS ── */
const DEFAULT_BOOKS = [
    { id:1, title:'The Midnight Library', author:'Matt Haig',          genre:'Fiction',    price:18.99, stock:142, rating:4.9, status:'Active', imgUrl:'', color:'linear-gradient(145deg,#2d3142,#4f5d75)' },
    { id:2, title:'Lessons in Chemistry', author:'Bonnie Garmus',       genre:'Fiction',    price:22.00, stock:87,  rating:4.8, status:'Active', imgUrl:'', color:'linear-gradient(145deg,#3d2a2a,#6b4a4a)' },
    { id:3, title:'Atomic Habits',        author:'James Clear',         genre:'Psychology', price:19.99, stock:203, rating:4.9, status:'Active', imgUrl:'', color:'linear-gradient(145deg,#3d5a3e,#5e8b61)' },
    { id:4, title:'Dune',                 author:'Frank Herbert',       genre:'Sci-Fi',     price:16.99, stock:56,  rating:4.9, status:'Active', imgUrl:'', color:'linear-gradient(145deg,#5c4a1e,#8b6914)' },
    { id:5, title:'Foundation',           author:'Isaac Asimov',        genre:'Sci-Fi',     price:14.99, stock:34,  rating:4.8, status:'Active', imgUrl:'', color:'linear-gradient(145deg,#1a2a4a,#2a4a7a)' },
    { id:6, title:'Sapiens',              author:'Yuval Noah Harari',   genre:'History',    price:21.99, stock:8,   rating:4.5, status:'Active', imgUrl:'', color:'linear-gradient(145deg,#4a3020,#7a5035)' },
    { id:7, title:'The Alchemist',        author:'Paulo Coelho',        genre:'Fiction',    price:13.99, stock:178, rating:4.7, status:'Active', imgUrl:'', color:'linear-gradient(145deg,#7a5a10,#b08820)' },
    { id:8, title:'Think Again',          author:'Adam Grant',          genre:'Psychology', price:17.99, stock:5,   rating:4.4, status:'Active', imgUrl:'', color:'linear-gradient(145deg,#2a3a5a,#3a5a8a)' },
];

/* ── INIT ── */
function getBooks()        { return JSON.parse(localStorage.getItem(BOOKS_KEY) || 'null') || [...DEFAULT_BOOKS]; }
function saveBooks(books)  { localStorage.setItem(BOOKS_KEY, JSON.stringify(books)); }
function getVisits()       { return parseInt(localStorage.getItem(VISITS_KEY) || '0'); }
function getOrders()       { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); }

/* seed defaults once */
if (!localStorage.getItem(BOOKS_KEY)) saveBooks([...DEFAULT_BOOKS]);

/* ── HELPERS ── */
function statusBadge(s) {
    const map = { Active:'badge-green', Draft:'badge-yellow', 'Out of Stock':'badge-red' };
    return `<span class="badge ${map[s]||'badge-yellow'}"><span class="badge-dot"></span>${s}</span>`;
}
function stars(r) {
    const full = Math.floor(r), half = r % 1 >= 0.5;
    let s = '';
    for(let i=0;i<5;i++) s += i<full?'★':(i===full&&half?'½':'☆');
    return `<span class="rating-stars">${s}</span> <span class="rating-val">${r}</span>`;
}

function coverDiv(book) {
    if (book.imgUrl) {
        return `<div class="book-cover" style="background:#000;padding:0;overflow:hidden;">
            <img src="${book.imgUrl}" alt="${book.title}" style="width:100%;height:100%;object-fit:cover;border-radius:3px 5px 5px 3px;" onerror="this.parentElement.style.background='${book.color}';this.remove()"/>
        </div>`;
    }
    return `<div class="book-cover" style="background:${book.color}">${book.title.substring(0,6)}</div>`;
}

/* ── BOOK TABLE ── */
function renderBooks() {
    filterBooks();
}

function buildBookRow(b) {
    const discLabel = b.discount > 0 ? `<span class="disc-badge ms-1">-${b.discount}%</span>` : '';
    return `<tr>
    <td><input type="checkbox" class="gold-check"/></td>
    <td class="bold">
      <div style="display:flex;align-items:center;gap:10px">
        ${coverDiv(b)}
        <div>
          <div style="font-weight:600;font-size:13px;color:var(--text)">${b.title}${discLabel}</div>
          <div style="font-size:11px;color:var(--text3)">#${b.id}</div>
        </div>
      </div>
    </td>
    <td>${b.author}</td>
    <td><span class="badge genre-badge">${b.genre}</span></td>
    <td class="bold">$${b.price.toFixed(2)}</td>
    <td class="${b.stock<10?'stock-low bold':''}">${b.stock}</td>
    <td>${stars(b.rating)}</td>
    <td>${statusBadge(b.status)}</td>
    <td>
      <div style="display:flex;gap:6px">
        <button class="btn-ghost" onclick="openEditModal(${b.id})" title="Edit"><i class="bi bi-pencil"></i></button>
        <button class="btn-red"   onclick="deleteBook(${b.id})"   title="Delete"><i class="bi bi-trash"></i></button>
      </div>
    </td>
  </tr>`;
}

/* ── FILTER / SEARCH BOOKS ── */
function filterBooks() {
    const q      = (document.getElementById('book-search')?.value||'').toLowerCase();
    const genre  = document.getElementById('book-genre')?.value  || '';
    const status = document.getElementById('book-status')?.value || '';
    const sort   = document.getElementById('book-sort')?.value   || '';
    let books    = getBooks();
    if (q)      books = books.filter(b=>b.title.toLowerCase().includes(q)||b.author.toLowerCase().includes(q));
    if (genre)  books = books.filter(b=>b.genre===genre);
    if (status) books = books.filter(b=>b.status===status);
    if (sort==='Sort: Price ↑') books.sort((a,b)=>a.price-b.price);
    if (sort==='Sort: Price ↓') books.sort((a,b)=>b.price-a.price);

    const body = document.getElementById('tbody-books');
    if (!body) return;
    if (!books.length) {
        body.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text3);">No books found</td></tr>';
        const countEl = document.querySelector('#page-books .tbl-count');
        if (countEl) countEl.textContent = '0 results';
        return;
    }
    body.innerHTML = books.map(b => buildBookRow(b)).join('');
    const countEl = document.querySelector('#page-books .tbl-count');
    if (countEl) countEl.textContent =
        `Showing 1–${Math.min(10,books.length)} of ${books.length.toLocaleString()} titles`;
}

/* ── DELETE ── */
function deleteBook(id) {
    if (!confirm('Delete this book? It will be removed from the store.')) return;
    const books = getBooks().filter(b => b.id !== id);
    saveBooks(books);
    renderBooks();
    renderTopSellers();
    renderGenreChart();
    renderRevenueChart();
    toast('🗑️ Book removed from catalogue');
}

/* ── CLEAR ALL ── */
function clearAllBooks() {
    if (!confirm('⚠️ This will remove ALL books from the store. Users will see an empty catalogue.\n\nContinue?')) return;
    localStorage.setItem(BOOKS_KEY, JSON.stringify([]));
    renderBooks();
    renderTopSellers();
    renderGenreChart();
    toast('🗑️ All books cleared from catalogue');
}

/* ── EDIT MODAL ── */
function openEditModal(id) {
    const book = getBooks().find(b => b.id === id);
    if (!book) return;
    document.getElementById('edit-id').value     = book.id;
    document.getElementById('edit-title').value  = book.title;
    document.getElementById('edit-author').value = book.author;
    document.getElementById('edit-genre').value  = book.genre;
    document.getElementById('edit-price').value  = book.price;
    document.getElementById('edit-stock').value  = book.stock;
    document.getElementById('edit-status').value = book.status;
    document.getElementById('edit-disc').value   = book.discount || 0;
    document.getElementById('edit-desc').value   = book.description || '';
    document.getElementById('edit-img').value    = book.imgUrl || '';
    openModal('modal-edit');
}

function saveEdit() {
    const id    = parseInt(document.getElementById('edit-id').value);
    const books = getBooks();
    const idx   = books.findIndex(b => b.id === id);
    if (idx < 0) return;
    books[idx] = {
        ...books[idx],
        title:       document.getElementById('edit-title').value.trim()  || books[idx].title,
        author:      document.getElementById('edit-author').value.trim() || books[idx].author,
        genre:       document.getElementById('edit-genre').value,
        price:       parseFloat(document.getElementById('edit-price').value) || books[idx].price,
        stock:       parseInt(document.getElementById('edit-stock').value)   || books[idx].stock,
        status:      document.getElementById('edit-status').value,
        discount:    parseFloat(document.getElementById('edit-disc').value)  || 0,
        description: document.getElementById('edit-desc').value,
        imgUrl:      document.getElementById('edit-img').value.trim(),
    };
    saveBooks(books);
    closeModal('modal-edit');
    renderBooks();
    renderTopSellers();
    toast('✅ Book updated successfully');
}

/* ── ADD BOOK ── */
function addBook() {
    const title  = document.getElementById('nb-title').value.trim();
    const author = document.getElementById('nb-author').value.trim();
    const isbn   = document.getElementById('nb-isbn').value.trim();
    const genre  = document.getElementById('nb-genre').value;
    const price  = parseFloat(document.getElementById('nb-price').value) || 0;
    const stock  = parseInt(document.getElementById('nb-stock').value)   || 0;
    const status = document.getElementById('nb-status').value;
    const disc   = parseFloat(document.getElementById('nb-disc').value)  || 0;
    const desc   = document.getElementById('nb-desc').value;
    const imgUrl = document.getElementById('nb-img').value.trim();

    if (!title || !author) { toast('⚠️ Title and Author are required', true); return; }

    const books = getBooks();
    const maxId = books.reduce((m,b)=>Math.max(m,b.id),0);
    const COLORS = [
        'linear-gradient(145deg,#2d3142,#4f5d75)',
        'linear-gradient(145deg,#3d5a3e,#5e8b61)',
        'linear-gradient(145deg,#5c4a1e,#8b6914)',
        'linear-gradient(145deg,#1a2a4a,#2a4a7a)',
        'linear-gradient(145deg,#4a3020,#7a5035)',
        'linear-gradient(145deg,#7a5a10,#b08820)',
        'linear-gradient(145deg,#3a1a4a,#6a3a8a)',
        'linear-gradient(145deg,#1a4a3a,#3a8a6a)',
    ];
    books.push({
        id: maxId+1, title, author, isbn, genre, price, stock,
        status, discount: disc, description: desc, rating: 4.0,
        imgUrl: imgUrl,
        color: COLORS[maxId % COLORS.length]
    });
    saveBooks(books);
    closeModal('modal-book');
    renderBooks();
    renderTopSellers();
    renderGenreChart();
    toast(`✅ "${title}" added to catalogue`);

    /* clear form */
    ['nb-title','nb-author','nb-isbn','nb-price','nb-stock','nb-disc','nb-desc','nb-img'].forEach(id=>{
        document.getElementById(id).value='';
    });
}

/* ── TOP SELLERS ── */
function renderTopSellers() {
    const books = getBooks().slice(0,5);
    const el    = document.getElementById('list-top-sellers');
    if (!el) return;
    el.innerHTML = books.map((b,i) => `
    <div class="top-seller-row ${i<4?'top-seller-border':''}">
      <div class="top-seller-rank">${i+1}</div>
      ${coverDiv(b)}
      <div class="top-seller-info">
        <div class="top-seller-title">${b.title}</div>
        <div class="top-seller-author">${b.author}</div>
      </div>
      <div class="top-seller-price">$${b.price.toFixed(2)}</div>
    </div>`).join('');
}

/* ── RECENT ORDERS ── */
const SAMPLE_ORDERS = [
    { id:'#4821', customer:'Lena Fischer',  books:3, total:'$54.97', status:'Delivered' },
    { id:'#4820', customer:'Omar Hassan',   books:1, total:'$18.99', status:'Shipped'   },
    { id:'#4819', customer:'Sara Kimura',   books:2, total:'$36.98', status:'Pending'   },
    { id:'#4818', customer:'James Okafor',  books:4, total:'$79.96', status:'Delivered' },
    { id:'#4817', customer:'Priya Nair',    books:1, total:'$21.99', status:'Cancelled' },
];
function renderRecentOrders() {
    const body = document.getElementById('tbody-orders-recent');
    if (!body) return;
    const statusMap = { Delivered:'badge-green', Shipped:'badge-blue', Pending:'badge-yellow', Cancelled:'badge-red' };
    body.innerHTML = SAMPLE_ORDERS.map(o=>`
    <tr>
      <td class="bold">${o.id}</td>
      <td>${o.customer}</td>
      <td>${o.books}</td>
      <td class="bold">${o.total}</td>
      <td><span class="badge ${statusMap[o.status]||'badge-yellow'}"><span class="badge-dot"></span>${o.status}</span></td>
    </tr>`).join('');
}

function renderOrdersTable() {
    const body = document.getElementById('tbody-orders');
    if (!body) return;
    const allOrders = [
        ...SAMPLE_ORDERS,
        { id:'#4816', customer:'Fatima Al-Rashid', books:2, total:'$41.98', status:'Shipped'   },
        { id:'#4815', customer:'Carlos Rivera',    books:1, total:'$16.99', status:'Delivered' },
        { id:'#4814', customer:'Anna Bergström',   books:3, total:'$63.97', status:'Pending'   },
        { id:'#4813', customer:'David Park',       books:2, total:'$39.98', status:'Delivered' },
        { id:'#4812', customer:'Mei Lin',          books:1, total:'$22.00', status:'Cancelled' },
    ];
    const dates = ['Apr 12','Apr 12','Apr 11','Apr 11','Apr 11','Apr 10','Apr 10','Apr 10','Apr 09','Apr 09'];
    const statusMap = { Delivered:'badge-green', Shipped:'badge-blue', Pending:'badge-yellow', Cancelled:'badge-red' };
    body.innerHTML = allOrders.map((o,i)=>`
    <tr>
      <td class="bold">${o.id}</td>
      <td>${o.customer}</td>
      <td>${dates[i]}</td>
      <td>${o.books}</td>
      <td class="bold">${o.total}</td>
      <td><span class="badge ${statusMap[o.status]||'badge-yellow'}"><span class="badge-dot"></span>${o.status}</span></td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn-ghost" onclick="toast('📋 Order ${o.id} details')">View</button>
          <button class="btn-green" onclick="toast('✅ Order ${o.id} confirmed')">Confirm</button>
        </div>
      </td>
    </tr>`).join('');
}

/* ── USERS TABLE ── */
const SAMPLE_USERS = [
    { name:'Lena Fischer',    email:'lena@example.com',  role:'Customer', orders:12, spent:'$348', joined:'Jan 2025', status:'Active'    },
    { name:'Omar Hassan',     email:'omar@example.com',  role:'Customer', orders:7,  spent:'$189', joined:'Feb 2025', status:'Active'    },
    { name:'Sara Kimura',     email:'sara@example.com',  role:'Editor',   orders:3,  spent:'$67',  joined:'Mar 2025', status:'Active'    },
    { name:'James Okafor',    email:'james@example.com', role:'Customer', orders:21, spent:'$612', joined:'Dec 2024', status:'Active'    },
    { name:'Priya Nair',      email:'priya@example.com', role:'Customer', orders:4,  spent:'$94',  joined:'Mar 2025', status:'Suspended' },
    { name:'Fatima Al-Rashid',email:'fatima@example.com',role:'Customer', orders:9,  spent:'$241', joined:'Nov 2024', status:'Active'    },
    { name:'Carlos Rivera',   email:'carlos@example.com',role:'Admin',    orders:0,  spent:'$0',   joined:'Oct 2024', status:'Active'    },
    { name:'Anna Bergström',  email:'anna@example.com',  role:'Customer', orders:16, spent:'$487', joined:'Sep 2024', status:'Active'    },
    { name:'David Park',      email:'david@example.com', role:'Customer', orders:5,  spent:'$143', joined:'Apr 2025', status:'Active'    },
    { name:'Mei Lin',         email:'mei@example.com',   role:'Editor',   orders:2,  spent:'$44',  joined:'Apr 2025', status:'Active'    },
];
function renderUsersTable() {
    const body = document.getElementById('tbody-users');
    if (!body) return;
    body.innerHTML = SAMPLE_USERS.map(u=>`
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="user-avatar">${u.name[0]}</div>
          <span class="bold">${u.name}</span>
        </div>
      </td>
      <td>${u.email}</td>
      <td><span class="badge badge-blue">${u.role}</span></td>
      <td>${u.orders}</td>
      <td class="bold">${u.spent}</td>
      <td>${u.joined}</td>
      <td>${statusBadge(u.status)}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn-ghost" onclick="toast('👤 Viewing ${u.name}')">View</button>
          <button class="btn-red"   onclick="toast('🚫 ${u.name} suspended')">Suspend</button>
        </div>
      </td>
    </tr>`).join('');
}

const ACTIVITIES = [
    { icon:'bi-bag-check', cls:'',      text:'<strong>Lena Fischer</strong> placed a new order — 3 books — $54.97',  time:'2 min ago' },
    { icon:'bi-person-plus',cls:'blue', text:'<strong>David Park</strong> created a new account',                    time:'8 min ago' },
    { icon:'bi-star',      cls:'',      text:'<strong>Omar Hassan</strong> left a 5-star review on <em>Dune</em>',   time:'14 min ago'},
    { icon:'bi-exclamation-triangle',cls:'red', text:'<strong>Sapiens</strong> stock dropped below 10 units',        time:'1 hr ago'  },
    { icon:'bi-arrow-return-left',cls:'blue',text:'<strong>Priya Nair</strong> requested a return for order #4817',  time:'2 hr ago'  },
    { icon:'bi-bag-check', cls:'green', text:'<strong>James Okafor</strong> order #4818 delivered successfully',     time:'3 hr ago'  },
];
function renderActivity() {
    const el = document.getElementById('feed-activity');
    if (!el) return;
    el.innerHTML = ACTIVITIES.map(a=>`
    <div class="act-item">
      <div class="act-icon ${a.cls}"><i class="bi ${a.icon}"></i></div>
      <div>
        <div class="act-text">${a.text}</div>
        <div class="act-time">${a.time}</div>
      </div>
    </div>`).join('');
}

function buildBars(containerId, data, max) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = data.map(d=>`
    <div class="bar-col">
      <div class="bar-fill" style="height:${Math.round((d.v/max)*120)}px" title="$${d.v.toLocaleString()}"></div>
      <div class="bar-lbl">${d.l}</div>
    </div>`).join('');
}

function renderRevenueChart() {
    buildBars('chart-revenue', [
        {l:'Jan',v:32000},{l:'Feb',v:41000},{l:'Mar',v:48000}
    ], 60000);
}

function renderAnalyticsChart() {
    buildBars('chart-analytics', [
        {l:'Apr',v:28000},{l:'May',v:31000},{l:'Jun',v:29000},{l:'Jul',v:35000},
        {l:'Aug',v:38000},{l:'Sep',v:33000},{l:'Oct',v:40000},{l:'Nov',v:45000},
        {l:'Dec',v:52000},{l:'Jan',v:32000},{l:'Feb',v:41000},{l:'Mar',v:48000}
    ], 60000);
}

function renderGenreChart() {
    const books  = getBooks();
    const total  = books.length || 1;
    const genres = {};
    books.forEach(b=>{ genres[b.genre] = (genres[b.genre]||0)+1; });
    const fiction = Math.round(((genres['Fiction']||0)/total)*100);
    const sci     = Math.round(((genres['Science']||0)/total)*100);
    const history = Math.round(((genres['History']||0)/total)*100);
    const scifi   = Math.round(((genres['Sci-Fi']||0)/total)*100);
    const other   = 100 - fiction - sci - history - scifi;
    const circ    = 2*Math.PI*46;

    const svg = document.querySelector('#page-dashboard .donut svg');
    if (!svg) return;
    const circles = svg.querySelectorAll('circle');
    function seg(pct) { return (pct/100)*circ; }
    let offset = 0;
    const segs = [
        { pct:fiction, stroke:'var(--gold)',    el:circles[1] },
        { pct:sci,     stroke:'var(--blue)',    el:circles[2] },
        { pct:history, stroke:'#52c07a',        el:circles[3] },
        { pct:other,   stroke:'var(--text3)',   el:circles[4] },
    ];
    segs.forEach(s=>{
        if (!s.el) return;
        s.el.setAttribute('stroke-dasharray', `${seg(s.pct).toFixed(1)} ${(circ-seg(s.pct)).toFixed(1)}`);
        s.el.setAttribute('stroke-dashoffset', (-offset).toFixed(1));
        offset += seg(s.pct);
    });

    const legPcts = document.querySelectorAll('.leg-pct');
    if (legPcts.length >= 4) {
        legPcts[0].textContent = fiction+'%';
        legPcts[1].textContent = sci+'%';
        legPcts[2].textContent = history+'%';
        legPcts[3].textContent = (scifi+other)+'%';
    }
    document.querySelector('.donut-val').textContent = books.length.toLocaleString();
}

/* ── VISITOR COUNT ── */
function renderVisitorStat() {
    const visits = getVisits();
    const el = document.getElementById('visitor-count');
    if (el) el.textContent = visits.toLocaleString();
}

function updateVisitorStatUsers() {
    const v = getVisits();
    const el = document.getElementById('visitor-stat-users');
    if (el) el.textContent = v.toLocaleString();
}

/* ── DASHBOARD STATS live ── */
function updateDashStats() {
    const books = getBooks();
    const lowStock = books.filter(b=>b.stock<10).length;
    const el = document.getElementById('low-stock-num');
    if (el) el.textContent = lowStock;
}

/* ── NAVIGATION ── */
function goTo(page) {
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));
    document.querySelectorAll('.nav-link').forEach(a=>a.classList.remove('on'));
    const pg = document.getElementById('page-'+page);
    if (pg) pg.classList.add('on');
    const titleMap = {
        dashboard:'Dashboard <span>Overview</span>',
        books:'Books <span>Catalogue</span>',
        orders:'Orders <span>Commerce</span>',
        users:'Users <span>Management</span>',
        analytics:'Analytics <span>Reports</span>',
        settings:'Settings <span>Config</span>',
        media:'Media <span>Gallery</span>',
    };
    document.getElementById('top-title').innerHTML = titleMap[page] || page;
    document.querySelectorAll('.nav-link').forEach(a=>{
        if (a.getAttribute('onclick') && a.getAttribute('onclick').includes("'"+page+"'")) a.classList.add('on');
    });
    if (page==='books')     renderBooks();
    if (page==='orders')    { renderRecentOrders(); renderOrdersTable(); }
    if (page==='users')     { renderUsersTable(); updateVisitorStatUsers(); }
    if (page==='analytics') renderAnalyticsChart();
    if (page==='media')     renderMediaPage();
}


function renderMediaPage() {
    const el = document.getElementById('page-media');
    if (!el) return;

    let grid = document.getElementById('media-grid');

    if (!grid) {
        grid = document.createElement('div');
        grid.id        = 'media-grid';
        grid.className = 'media-grid';
        grid.style.cssText =
            'display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;padding:24px 0;';
        el.appendChild(grid);
    }

    if (el.dataset.loaded === 'true') return;
    el.dataset.loaded = 'true';

    const images = [
        { label:'Hero Banner',   tag:'Banner',   src:'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=200&fit=crop' },
        { label:'Store Front',   tag:'Promo',    src:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=200&fit=crop' },
        { label:'Reading Nook',  tag:'Lifestyle',src:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop' },
        { label:'Book Stack',    tag:'Product',  src:'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=200&fit=crop' },
        { label:'Library',       tag:'Lifestyle',src:'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=200&fit=crop' },
        { label:'Coffee & Book', tag:'Lifestyle',src:'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=200&fit=crop' },
    ];

    grid.innerHTML = images.map(img => `
    <div class="media-card">
      <div class="media-img-wrap">
        <img src="${img.src}"
             alt="${img.label}"
             loading="lazy"
             onerror="this.style.display='none';this.insertAdjacentHTML('afterend',
               '<div style=\'width:100%;height:160px;background:linear-gradient(145deg,#2d3142,#4f5d75);border-radius:8px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.6);font-size:13px;\'>${img.label}</div>')"
        />
        <div class="media-overlay">
          <button class="btn-ghost" onclick="toast('🔗 Link copied')"><i class="bi bi-link-45deg"></i></button>
          <button class="btn-red"   onclick="this.closest('.media-card').remove();toast('🗑️ Image deleted')"><i class="bi bi-trash"></i></button>
        </div>
      </div>
      <div class="media-info">
        <span class="media-label">${img.label}</span>
        <span class="badge badge-blue">${img.tag}</span>
      </div>
    </div>`).join('');
}

/* ── MODALS ── */
function openModal(id)  { document.getElementById(id).classList.add('on'); }
function closeModal(id) { document.getElementById(id).classList.remove('on'); }

/* ── TOAST ── */
function toast(msg, isErr=false) {
    const box   = document.getElementById('toasts');
    const t     = document.createElement('div');
    t.className = 'toast';
    if (isErr) t.style.borderLeftColor = 'var(--danger)';
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(()=>t.remove(), 3000);
}

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded', ()=>{
    renderRecentOrders();
    renderTopSellers();
    renderActivity();
    renderRevenueChart();
    renderGenreChart();
    updateDashStats();
    renderVisitorStat();
    renderBooks();
});