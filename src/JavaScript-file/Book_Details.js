
const BOOKS_KEY = 'folio_books';
const CART_KEY  = 'folio_cart';
const LIST_KEY  = 'folio-mylist';

/* ── DEFAULT BOOKS (same 8 from Books.html) ── */
const DEFAULT_BOOKS = [
    {title:'The Midnight Library',author:'Matt Haig',genre:'Fiction',price:18.99,oldPrice:24.00,badge:'Bestseller',pages:320,year:2020,lang:'EN',rating:4.8,reviews:2341,color:'linear-gradient(145deg,#2d3142,#4f5d75)',imgUrl:'../../Pictures/OIP.webp',
        description:'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices... Would you have done anything different, if you had the chance to undo your regrets? A philosophical and moving novel about the choices that go into a life well lived.',
        fullDesc:'Nora Seed finds herself in the Midnight Library. Faced with the possibility of changing her life for a new one, following a different career, undoing old breakups, realizing her dreams of becoming a glaciologist; she must search within herself as she travels through the Midnight Library to decide what is truly fulfilling in life, and what makes it worth living in the first place.'},
    {title:'Lessons in Chemistry',author:'Bonnie Garmus',genre:'Fiction',price:22.00,badge:'New',pages:390,year:2022,lang:'EN',rating:4.7,reviews:1890,color:'linear-gradient(145deg,#3d2a2a,#6b4a4a)',imgUrl:'../../Pictures/OIP (1).jpg',
        description:'A funny, smart, and sometimes shocking story about a female chemist in the 1960s who becomes a cooking show host and changes the lives of women across America.',
        fullDesc:'Elizabeth Zott is not your average woman. In fact, Elizabeth Zott would be the first to point out that there is no such thing. But it\'s the early 1960s and her all-male team at Hastings Research Institute takes a very different view. She is forced to take a job as a cooking show host to make ends meet. But her unique approach to cooking, treating it as the chemistry it is, grabs the nation\'s attention.'},
    {title:'Atomic Habits',author:'James Clear',genre:'Self-Help',price:19.99,oldPrice:27.00,badge:'Bestseller',pages:320,year:2018,lang:'EN',rating:4.9,reviews:5200,color:'linear-gradient(145deg,#3d5a3e,#5e8b61)',imgUrl:'../../Pictures/OIP (2).jpg',
        description:'A revolutionary system to get 1% better every day. No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear reveals practical strategies that will teach you exactly how to form good habits, break bad ones.',
        fullDesc:'If you\'re having trouble changing your habits, the problem isn\'t you. The problem is your system. Bad habits repeat themselves not because you don\'t want to change, but because you have the wrong system for change. You do not rise to the level of your goals. You fall to the level of your systems. This book will give you the systems you need.'},
    {title:'Dune',author:'Frank Herbert',genre:'Sci-Fi',price:16.99,badge:'New',pages:688,year:1965,lang:'EN',rating:4.8,reviews:8750,color:'linear-gradient(145deg,#5c4a1e,#8b6914)',imgUrl:'../../Pictures/download.jpg',
        description:'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the spice melange.',
        fullDesc:'A stunning blend of adventure and mysticism, environmentalism and politics, Dune won the first Nebula Award, shared the Hugo Award, and formed the basis of what is undoubtedly the grandest epic in science fiction. A sweeping tale of a future universe in which noble houses control planetary fiefs and the Emperor rules with a combination of military might and intrigue.'},
    {title:'Foundation',author:'Isaac Asimov',genre:'Sci-Fi',price:14.99,oldPrice:20.00,badge:'Classic',pages:255,year:1951,lang:'EN',rating:4.7,reviews:4300,color:'linear-gradient(145deg,#1a2a4a,#2a4a7a)',imgUrl:'../../Pictures/foundation.jpg',
        description:'The Foundation series is Isaac Asimov\'s iconic masterpiece. For twelve thousand years the Galactic Empire has ruled supreme. Now it is dying. Only Hari Seldon, creator of the revolutionary science of psychohistory, can see into the future.',
        fullDesc:'Hari Seldon has developed psychohistory, a new science that enables him to predict the future in probabilistic terms. He predicts the Empire will collapse within 300 years and foresees 30,000 years of barbarism. He creates the Foundation, a group of scientists and engineers, to shorten this interregnum to a mere thousand years.'},
    {title:'Sapiens',author:'Yuval Noah Harari',genre:'History',price:21.99,badge:'Bestseller',pages:443,year:2011,lang:'EN',rating:4.5,reviews:6100,color:'linear-gradient(145deg,#4a3020,#7a5035)',imgUrl:'../../Pictures/sapiens.jpg',
        description:'A brief history of humankind — from the Stone Age to the present. How did Homo sapiens come to rule the world? What made us so different from other animals? A wide-ranging, provocative look at the deep history of our species.',
        fullDesc:'One hundred thousand years ago, at least six human species inhabited the earth. Today there is just one. Us. Homo sapiens. How did our species succeed in the battle for dominance? Why did our foraging ancestors come together to create cities and kingdoms? How did we come to believe in gods, nations, and human rights? Harari answers these questions with sweeping scholarship.'},
    {title:'The Alchemist',author:'Paulo Coelho',genre:'Fiction',price:13.99,oldPrice:18.00,badge:'Sale',pages:208,year:1988,lang:'EN',rating:4.6,reviews:12400,color:'linear-gradient(145deg,#7a5a10,#b08820)',imgUrl:'../../Pictures/the-alchemist.jpg',
        description:'A magical story about following your dreams. The Alchemist is a classic tale of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure as extravagant as any ever found.',
        fullDesc:'Every few decades a book is published that changes the lives of its readers forever. The Alchemist is such a book. Paulo Coelho\'s masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure. His quest will lead him to riches far different — and far more satisfying — than he ever imagined.'},
    {title:'Think Again',author:'Adam Grant',genre:'Psychology',price:17.99,badge:'New',pages:307,year:2021,lang:'EN',rating:4.4,reviews:2800,color:'linear-gradient(145deg,#2a3a5a,#3a5a8a)',imgUrl:'../../Pictures/think-again.jpg',
        description:'The power of knowing what you don\'t know. Think Again is a book about the benefit of doubt and about how we can get better at embracing the unknown and the joy of being wrong.',
        fullDesc:'Intelligence is usually seen as the ability to think and learn, but in a rapidly changing world, there\'s another set of cognitive skills that might matter more: the ability to rethink and unlearn. Adam Grant examines the surprising fallacy of experience, the value of thinking like a scientist, and how to build organizations and societies that prize rethinking.'},
];

/* ── HELPERS ── */
function getAdminBooks(){try{return JSON.parse(localStorage.getItem(BOOKS_KEY)||'[]')}catch(e){return[]}}
function getCart(){return JSON.parse(localStorage.getItem(CART_KEY)||'[]')}
function saveCart(c){localStorage.setItem(CART_KEY,JSON.stringify(c));updateBadge()}
function getMyList(){return JSON.parse(localStorage.getItem(LIST_KEY)||'[]')}
function saveList(l){localStorage.setItem(LIST_KEY,JSON.stringify(l))}

function updateBadge(){
    const total=getCart().reduce((a,c)=>a+c.qty,0);
    const b=document.getElementById('cart-badge');
    if(!b)return;
    b.textContent=total;
    b.style.display=total>0?'flex':'none';
}

function showToast(msg){
    const c=document.getElementById('toast-container');
    const t=document.createElement('div');
    t.className='toast-folio';t.textContent=msg;
    c.appendChild(t);setTimeout(()=>t.remove(),3100);
}

function starsHTML(r){
    const full=Math.floor(r),half=r%1>=0.5;
    let s='';
    for(let i=0;i<full;i++)s+='★';
    if(half)s+='☆';
    while(s.length<5)s+='☆';
    return s;
}

/* ── GET BOOK FROM URL ── */
function getParam(key){return new URLSearchParams(location.search).get(key)}

function findBook(){
    const titleParam=getParam('title');
    if(!titleParam)return null;
    const t=decodeURIComponent(titleParam).toLowerCase();
    const adminBooks=getAdminBooks();
    const all=[...DEFAULT_BOOKS,...adminBooks.filter(b=>!DEFAULT_BOOKS.find(d=>d.title===b.title))];
    return all.find(b=>b.title.toLowerCase()===t)||null;
}

/* ── RENDER BOOK ── */
function renderBook(book){
    const root=document.getElementById('book-detail-root');
    const isSaved=getMyList().some(b=>b.title===book.title);
    const finalPrice=book.discount>0?book.price*(1-book.discount/100):book.price;
    const displayPrice=finalPrice||book.price;

    const badgeClass={Bestseller:'badge-gold',New:'badge-new',Sale:'badge-sale',Classic:'badge-classic'}[book.badge]||'badge-gold';
    const badgeLabel=book.discount>0?`Sale -${book.discount}%`:(book.badge||'New');

    const coverHTML=book.imgUrl
        ?`<img class="cover-img" src="${book.imgUrl}" alt="${book.title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="cover-fallback" style="display:none;background:${book.color||'linear-gradient(145deg,#2d3142,#4f5d75)'}">
         <span class="cover-fallback-text">${book.title}</span>
       </div>`
        :`<div class="cover-fallback" style="background:${book.color||'linear-gradient(145deg,#2d3142,#4f5d75)'}">
        <span class="cover-fallback-text">${book.title}</span>
      </div>`;

    const oldPriceHTML=book.oldPrice?`<span class="price-old">$${book.oldPrice.toFixed(2)}</span>`:'';

    root.innerHTML=`
  <div class="detail-grid">
 
    <div class="cover-col">
      <div class="detail-cover" id="detail-cover-el" style="background:${book.color||'#12121e'}">
        <div class="cover-spine"></div>
        ${coverHTML}
        <div class="cover-author-label">${book.author}</div>
      </div>
      <div class="cover-actions">
        <button class="ghost-btn ${isSaved?'saved':''}" id="save-btn">
          <i class="bi bi-bookmark${isSaved?'-fill':''}"></i>
          ${isSaved?'Saved':'Save'}
        </button>
        <button class="ghost-btn" onclick="shareBook()">
          <i class="bi bi-share"></i> Share
        </button>
      </div>
    </div>
 
    <div class="info-col">
      <div class="badges-row">
        <span class="${badgeClass}">${badgeLabel}</span>
        <span class="genre-tag">${book.genre||''}</span>
      </div>
      <h1 class="detail-title">${book.title}</h1>
      <div class="detail-author">by ${book.author}</div>
      <div class="rating-row">
        <span class="stars">${starsHTML(book.rating||4.5)}</span>
        <span class="rating-count">${(book.rating||4.5).toFixed(1)} · ${(book.reviews||0).toLocaleString()} reviews</span>
      </div>
      <div class="price-row">
        ${oldPriceHTML}
        <span class="price-new">$${displayPrice.toFixed(2)}</span>
      </div>
      <p class="detail-desc">${book.description||'A great book waiting to be discovered.'}</p>
      <div class="cta-row">
        <button class="btn-primary" id="cart-btn-main">
          <i class="bi bi-bag-plus"></i> Add to Cart
        </button>
        <button class="btn-outline ${isSaved?'saved':''}" id="list-btn">
          <i class="bi bi-bookmark${isSaved?'-fill':''}"></i>
          ${isSaved?'Saved to List':'Save to List'}
        </button>
      </div>
      <div class="meta-grid">
        <div class="meta-item">
          <div class="meta-val">${book.pages||'—'}</div>
          <div class="meta-key">Pages</div>
        </div>
        <div class="meta-item">
          <div class="meta-val">${book.year||'—'}</div>
          <div class="meta-key">Published</div>
        </div>
        <div class="meta-item">
          <div class="meta-val">${book.lang||'EN'}</div>
          <div class="meta-key">Language</div>
        </div>
      </div>
    </div>
  </div>
 
  <!-- TABS -->
  <div class="tabs-wrap">
    <div class="tabs">
      <button class="tab-btn active" data-tab="desc">Description</button>
      <button class="tab-btn" data-tab="reviews">Reviews</button>
      <button class="tab-btn" data-tab="related">Related Books</button>
    </div>
  </div>
 
  <!-- DESC TAB -->
  <div class="tab-content active" id="tab-desc">
    <p class="tab-desc-text">${book.fullDesc||book.description||''}</p>
  </div>
 
  <!-- REVIEWS TAB -->
  <div class="tab-content" id="tab-reviews">
    <div class="review-card">
      <div class="reviewer-header">
        <div class="reviewer-avatar">S</div>
        <div>
          <div class="reviewer-name">Sarah M.</div>
          <div class="stars" style="font-size:13px">★★★★★</div>
        </div>
        <span class="reviewer-date">2 days ago</span>
      </div>
      <p class="review-text">Absolutely beautiful. One of those books that makes you think about all the choices you've made in life. Highly recommend.</p>
    </div>
    <div class="review-card">
      <div class="reviewer-header">
        <div class="reviewer-avatar">J</div>
        <div>
          <div class="reviewer-name">James K.</div>
          <div class="stars" style="font-size:13px">★★★★★</div>
        </div>
        <span class="reviewer-date">1 week ago</span>
      </div>
      <p class="review-text">Read it in one sitting. The writing is extraordinary — empathetic and wise. A must-read for anyone going through a difficult time.</p>
    </div>
    <div class="write-review">
      <h4>Write a Review</h4>
      <div class="star-selector" id="star-sel">
        <span data-v="1">☆</span><span data-v="2">☆</span><span data-v="3">☆</span><span data-v="4">☆</span><span data-v="5">☆</span>
      </div>
      <textarea class="folio-textarea" id="review-text" placeholder="Share your thoughts on this book…"></textarea>
      <button class="btn-primary" onclick="submitReview()"><i class="bi bi-send"></i> Submit Review</button>
    </div>
  </div>
 
  <!-- RELATED TAB -->
  <div class="tab-content" id="tab-related">
    <div class="related-grid" id="related-grid"></div>
  </div>
  `;

    /* Wire tabs */
    document.querySelectorAll('.tab-btn').forEach(btn=>{
        btn.addEventListener('click',()=>{
            document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
            if(btn.dataset.tab==='related') renderRelated(book);
        });
    });

    /* Wire cart button */
    document.getElementById('cart-btn-main').addEventListener('click',()=>addToCart(book,displayPrice));

    /* Wire save/list buttons */
    document.getElementById('save-btn').addEventListener('click',()=>toggleSave(book));
    document.getElementById('list-btn').addEventListener('click',()=>toggleSave(book));

    /* Wire stars */
    let selectedStar=0;
    const stars=document.querySelectorAll('#star-sel span');
    stars.forEach(s=>{
        s.addEventListener('mouseenter',()=>{
            const v=+s.dataset.v;
            stars.forEach(x=>x.textContent=+x.dataset.v<=v?'★':'☆');
            stars.forEach(x=>x.classList.toggle('lit',+x.dataset.v<=v));
        });
        s.addEventListener('mouseleave',()=>{
            stars.forEach(x=>x.textContent=+x.dataset.v<=selectedStar?'★':'☆');
            stars.forEach(x=>x.classList.toggle('lit',+x.dataset.v<=selectedStar));
        });
        s.addEventListener('click',()=>{selectedStar=+s.dataset.v;});
    });

    document.title=`FOLIO — ${book.title}`;
    updateBadge();
}

/* ── CART ── */
function addToCart(book,price){
    const cart=getCart();
    const ex=cart.find(x=>x.title===book.title);
    if(ex)ex.qty++;else cart.push({title:book.title,author:book.author,genre:book.genre,price,color:book.color,qty:1});
    saveCart(cart);
    const btn=document.getElementById('cart-btn-main');
    btn.classList.add('added');
    btn.innerHTML='<i class="bi bi-check-lg"></i> Added!';
    setTimeout(()=>{btn.classList.remove('added');btn.innerHTML='<i class="bi bi-bag-plus"></i> Add to Cart';},1600);
    showToast(`"${book.title}" added to cart`);
}

/* ── SAVE / MY LIST ── */
function toggleSave(book){
    const list=getMyList();
    const ex=list.find(b=>b.title===book.title);
    const saveBtn=document.getElementById('save-btn');
    const listBtn=document.getElementById('list-btn');
    if(ex){
        saveList(list.filter(b=>b.title!==book.title));
        if(saveBtn){saveBtn.classList.remove('saved');saveBtn.innerHTML='<i class="bi bi-bookmark"></i> Save';}
        if(listBtn){listBtn.classList.remove('saved');listBtn.innerHTML='<i class="bi bi-bookmark"></i> Save to List';}
        showToast(`"${book.title}" removed from My List`);
    }else{
        const maxId=list.reduce((m,b)=>Math.max(m,b.id||0),0);
        list.push({id:maxId+1,title:book.title,author:book.author,genre:book.genre,status:'want',progress:0,progressLabel:'',color:book.color||''});
        saveList(list);
        if(saveBtn){saveBtn.classList.add('saved');saveBtn.innerHTML='<i class="bi bi-bookmark-fill"></i> Saved';}
        if(listBtn){listBtn.classList.add('saved');listBtn.innerHTML='<i class="bi bi-bookmark-fill"></i> Saved to List';}
        showToast(`"${book.title}" saved to My List ★`);
    }
}

/* ── SHARE ── */
function shareBook(){
    if(navigator.share){
        navigator.share({title:document.title,url:location.href});
    }else{
        navigator.clipboard.writeText(location.href).then(()=>showToast('Link copied to clipboard!'));
    }
}

/* ── SUBMIT REVIEW ── */
function submitReview(){
    const txt=document.getElementById('review-text').value.trim();
    if(!txt){showToast('Please write your review first.');return;}
    const card=document.createElement('div');
    card.className='review-card';
    card.style.animation='slideInRight 0.4s ease';
    card.innerHTML=`
    <div class="reviewer-header">
      <div class="reviewer-avatar">Y</div>
      <div><div class="reviewer-name">You</div><div class="stars" style="font-size:13px">★★★★★</div></div>
      <span class="reviewer-date">Just now</span>
    </div>
    <p class="review-text">${txt}</p>`;
    document.querySelector('.write-review').before(card);
    document.getElementById('review-text').value='';
    showToast('Review submitted! Thank you.');
}

/* ── RENDER RELATED ── */
function renderRelated(currentBook){
    const grid=document.getElementById('related-grid');
    if(grid.dataset.loaded)return;
    grid.dataset.loaded='1';
    const adminBooks=getAdminBooks();
    const all=[...DEFAULT_BOOKS,...adminBooks.filter(b=>!DEFAULT_BOOKS.find(d=>d.title===b.title))];
    const related=all.filter(b=>b.title!==currentBook.title&&(b.genre===currentBook.genre||b.author===currentBook.author)).slice(0,8);
    if(!related.length){grid.innerHTML='<p style="color:var(--text3);font-size:14px;grid-column:1/-1">No related books found.</p>';return;}
    related.forEach(b=>{
        const price=(b.discount>0?b.price*(1-b.discount/100):b.price)||b.price;
        const coverInner=b.imgUrl
            ?`<img class="related-cover-img" src="${b.imgUrl}" alt="${b.title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
         <div class="related-cover-fallback" style="display:none;background:${b.color}"><span>${b.title}</span></div>`
            :`<div class="related-cover-fallback" style="background:${b.color}"><span>${b.title}</span></div>`;
        const card=document.createElement('div');
        card.className='related-card';
        card.innerHTML=`
      <div class="related-cover" style="background:${b.color}">
        <div class="related-spine"></div>
        ${coverInner}
      </div>
      <div class="related-info">
        <div class="related-title">${b.title}</div>
        <div class="related-author">${b.author}</div>
        <div class="related-price">$${price.toFixed(2)}</div>
      </div>`;
        card.addEventListener('click',()=>{location.href=`Book_Details.html?title=${encodeURIComponent(b.title)}`});
        grid.appendChild(card);
    });
}

/* ── BACK BUTTON ── */
document.getElementById('back-btn').addEventListener('click',()=>{
    if(document.referrer&&document.referrer.includes(location.hostname))history.back();
    else location.href='Books.html';
});

/* ── BOOT ── */
updateBadge();
const book=findBook();
if(book){
    renderBook(book);
}else{
    document.getElementById('book-detail-root').innerHTML=`
    <div class="not-found">
      <h2>Book not found</h2>
      <p>We couldn't find this book. <a href="../Html-file/Books.html" style="color:var(--gold)">Browse all books</a></p>
    </div>`;
}