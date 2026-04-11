const booksData = [
  { id: 1, title: "The Midnight Library", author: "Matt Haig",         category: "fiction",    price: 18.99, oldPrice: 21,   rating: 5, badge: "Bestseller", img: "38.TheMidnightLibrary.jpg", inStock: true  },
  { id: 2, title: "Lessons in Chemistry",  author: "Bonnie Garmus",    category: "fiction",    price: 22.00, oldPrice: null, rating: 5, badge: "New",        img: "lessons.jpg",                inStock: true  },
  { id: 3, title: "Atomic Habits",         author: "James Clear",      category: "self-help",  price: 19.99, oldPrice: 27,   rating: 5, badge: "Bestseller", img: "atomic-habits-james-clear-irustima.jpg", inStock: true },
  { id: 4, title: "Dune",                  author: "Frank Herbert",    category: "sci-fi",     price: 16.99, oldPrice: null, rating: 5, badge: "New",        img: "Dune.jpg",                   inStock: true  },
  { id: 5, title: "Foundation",            author: "Isaac Asimov",     category: "sci-fi",     price: 14.99, oldPrice: 20,   rating: 5, badge: "Classic",    img: "foundation.jpg",             inStock: false },
  { id: 6, title: "Sapiens",               author: "Yuval Noah Harari",category: "history",    price: 21.99, oldPrice: null, rating: 4, badge: "Bestseller", img: "sapiens.jpg",                inStock: true  },
  { id: 7, title: "The Alchemist",         author: "Paulo Coelho",     category: "fiction",    price: 13.99, oldPrice: 18,   rating: 5, badge: "Sale",       img: "the alchemist.jpg",          inStock: true  },
  { id: 8, title: "Think Again",           author: "Adam Grant",       category: "psychology", price: 17.99, oldPrice: null, rating: 4, badge: "New",        img: "think again.jpg",            inStock: true  },
];
const BOOKS_PER_PAGE = 8;
const state = {
  cart:      JSON.parse(localStorage.getItem("cart"))      || [],
  bookmarks: JSON.parse(localStorage.getItem("bookmarks")) || [],
  currentPage: 1,
  filters: {
    genres:       [],
    maxPrice:     40,
    minRating:    0,
    availability: [],
  },
  sortBy: "featured",
  searchQuery: "",
};
function saveState() {
  localStorage.setItem("cart",      JSON.stringify(state.cart));
  localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
}
function starsHTML(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}
function notify(msg, type = "success") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="bi bi-${type === "success" ? "check-circle" : "info-circle"}"></i> ${msg}`;
  toast.style.cssText = `
    position: fixed; bottom: 30px; right: 30px; z-index: 9999;
    background: ${type === "success" ? "#b8842a" : "#555"};
    color: #fff; padding: 12px 20px; border-radius: 10px;
    font-size: 13px; box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    display: flex; align-items: center; gap: 8px;
    animation: slideIn 0.3s ease;
  `;
  if (!document.getElementById("toast-style")) {
    const s = document.createElement("style");
    s.id = "toast-style";
    s.textContent = `
      @keyframes slideIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      @keyframes slideOut{ from { opacity:1; transform:translateY(0); } to { opacity:0; transform:translateY(20px); } }
    `;
    document.head.appendChild(s);
  }
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
function updateCounters() {
  let cartBtn = document.querySelector(".L-header .btn-bag");
  if (!cartBtn) {
    cartBtn = document.querySelectorAll(".L-header button")[1];
  }
  updateBadge(cartBtn, state.cart.length);
  let bmBtn = document.querySelector(".L-header .btn-bookmark");
  if (!bmBtn) {
    bmBtn = document.querySelectorAll(".L-header button")[0];
  }
  updateBadge(bmBtn, state.bookmarks.length);
}
function updateBadge(btn, count) {
  if (!btn) return;
  btn.style.position = "relative";
  let badge = btn.querySelector(".btn-counter");
  if (count === 0) {
    if (badge) badge.remove();
    return;
  }
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "btn-counter";
    badge.style.cssText = `
      position:absolute; top:-6px; right:-6px;
      background:#b8842a; color:#fff;
      font-size:10px; font-weight:700;
      width:16px; height:16px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      pointer-events:none;
    `;
    btn.appendChild(badge);
  }
  badge.textContent = count;
}
function getFilteredBooks() {
  let books = [...booksData];
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    books = books.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    );
  }
  if (state.filters.genres.length > 0) {
    books = books.filter(b => state.filters.genres.includes(b.category));
  }
  books = books.filter(b => b.price <= state.filters.maxPrice);
  if (state.filters.minRating > 0) {
    books = books.filter(b => b.rating >= state.filters.minRating);
  }
  if (state.filters.availability.includes("in-stock")) {
    books = books.filter(b => b.inStock);
  }
  if (state.filters.availability.includes("pre-order")) {
    books = books.filter(b => !b.inStock);
  }
  if (state.sortBy === "price-asc")  books.sort((a, b) => a.price - b.price);
  if (state.sortBy === "price-desc") books.sort((a, b) => b.price - a.price);
  if (state.sortBy === "newest")     books.sort((a, b) => (b.badge === "New") - (a.badge === "New"));
  return books;
}
function renderBooks() {
  const grid = document.querySelector(".books-grid");
  const filtered = getFilteredBooks();
  const start = (state.currentPage - 1) * BOOKS_PER_PAGE;
  const pageBooks = filtered.slice(start, start + BOOKS_PER_PAGE);
  if (pageBooks.length === 0) {
    grid.innerHTML = `
      <li style="grid-column:1/-1; text-align:center; padding:60px 0; color:#a89880;">
        <i class="bi bi-search" style="font-size:40px; display:block; margin-bottom:12px;"></i>
        No books match your filters.
      </li>`;
    renderPagination(0);
    return;
  }
  grid.innerHTML = pageBooks.map(book => {
    const isBookmarked = state.bookmarks.includes(book.id);
    const inCart       = state.cart.includes(book.id);
    return `
    <li class="book-card" data-id="${book.id}">
      <div class="book-img">
        <img src="${book.img}" alt="${book.title}" loading="lazy">
        <span class="badge">${book.badge}</span>
        ${!book.inStock ? `<span class="out-badge">Out of Stock</span>` : ""}
      </div>
      <div class="book-info">
        <span class="category">${book.category.toUpperCase()}</span>
        <h3>${book.title}</h3>
        <p>${book.author}</p>
        <div class="rating">${starsHTML(book.rating)}</div>
        <div class="book-footer">
          <div>
            ${book.oldPrice ? `<s>$${book.oldPrice}</s> ` : ""}
            <strong>$${book.price.toFixed(2)}</strong>
          </div>
          <div>
            <i class="${isBookmarked ? "bi bi-bookmark-fill" : "bi bi-bookmark"} icon-bookmark"
               title="${isBookmarked ? "Remove bookmark" : "Bookmark"}"></i>
            <i class="${inCart ? "bi bi-bag-fill" : "bi bi-bag"} icon-bag"
               title="${inCart ? "Remove from cart" : "Add to cart"}"></i>
          </div>
        </div>
      </div>
    </li>`;
  }).join("");
  renderPagination(filtered.length);
  attachCardListeners();
}
function renderPagination(total) {
  const pagination = document.querySelector(".pagination");
  const totalPages = Math.ceil(total / BOOKS_PER_PAGE);
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }
  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    html += `<span class="page ${i === state.currentPage ? "active" : ""}" data-page="${i}">${i}</span>`;
  }
  pagination.innerHTML = html;
  pagination.querySelectorAll(".page").forEach(btn => {
    btn.addEventListener("click", () => {
      state.currentPage = parseInt(btn.dataset.page);
      renderBooks();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}
function attachCardListeners() {
  document.querySelectorAll(".icon-bookmark").forEach(icon => {
    icon.addEventListener("click", () => {
      const card = icon.closest(".book-card");
      const id   = parseInt(card.dataset.id);
      const book = booksData.find(b => b.id === id);
      if (state.bookmarks.includes(id)) {
        state.bookmarks.splice(state.bookmarks.indexOf(id), 1);
        icon.className = "bi bi-bookmark icon-bookmark";
        notify(`"${book.title}" removed from bookmarks`, "info");
      } else {
        state.bookmarks.push(id);
        icon.className = "bi bi-bookmark-fill icon-bookmark";
        notify(`"${book.title}" bookmarked!`);
      }
      saveState();
      updateCounters();
    });
  });
  document.querySelectorAll(".icon-bag").forEach(icon => {
    icon.addEventListener("click", () => {
      const card = icon.closest(".book-card");
      const id   = parseInt(card.dataset.id);
      const book = booksData.find(b => b.id === id);
      if (!book.inStock) {
        notify("This book is out of stock", "info");
        return;
      }
      if (state.cart.includes(id)) {
        state.cart.splice(state.cart.indexOf(id), 1);
        icon.className = "bi bi-bag icon-bag";
        notify(`"${book.title}" removed from cart`, "info");
      } else {
        state.cart.push(id);
        icon.className = "bi bi-bag-fill icon-bag";
        notify(`"${book.title}" added to cart!`);
      }
      saveState();
      updateCounters();
    });
  });
}
function initHeaderButtons() {
  const btns = document.querySelectorAll(".L-header button");
  if (btns[0]) {
    btns[0].title = "My Bookmarks";
    btns[0].addEventListener("click", () => {
      window.location.href = "my_list.html";
    });
  }
  if (btns[1]) {
    btns[1].title = "My Cart";
    btns[1].addEventListener("click", () => {
      window.location.href = "Cart.html";
    });
  }
  if (btns[2]) {
    btns[2].title = "User Profile";
    btns[2].addEventListener("click", () => {
      window.location.href = "UserProfile.html";
    });
  }
}
function initSearch() {
  const input = document.querySelector(".L-header form input[type='search']");
  if (!input) return;
  input.addEventListener("input", () => {
    state.searchQuery = input.value.trim();
    state.currentPage = 1;
    renderBooks();
  });
  input.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      input.value = "";
      state.searchQuery = "";
      state.currentPage = 1;
      renderBooks();
    }
  });
}
function initSort() {
  const select = document.querySelector(".sort-select");
  if (!select) return;
  select.addEventListener("change", () => {
    const map = {
      "Sort: Featured":     "featured",
      "Price: Low to High": "price-asc",
      "Price: High to Low": "price-desc",
      "Newest":             "newest",
    };
    state.sortBy = map[select.value] || "featured";
    state.currentPage = 1;
    renderBooks();
  });
}
function initFilters() {
  const genreLabels = ["all books", "fiction", "science", "history", "psychology", "sci-fi"];
  document.querySelectorAll(".filters ul:first-of-type li input[type='checkbox']").forEach((cb, i) => {
    cb.addEventListener("change", () => {
      if (i === 0) {
        state.filters.genres = [];
        document.querySelectorAll(".filters ul:first-of-type li input[type='checkbox']").forEach((c, j) => {
          if (j !== 0) c.checked = false;
        });
      } else {
        const genre = genreLabels[i];
        if (cb.checked) {
          state.filters.genres.push(genre);
          document.querySelector(".filters ul:first-of-type li input[type='checkbox']").checked = false;
        } else {
          state.filters.genres = state.filters.genres.filter(g => g !== genre);
        }
      }
    });
  });
  const rangeInput  = document.querySelector(".filters input[type='range']");
  const priceLabels = document.querySelectorAll(".price-labels span");
  if (rangeInput && priceLabels.length >= 2) {
    rangeInput.addEventListener("input", () => {
      const val = rangeInput.value;
      priceLabels[1].textContent = `Up to $${val}`;
      state.filters.maxPrice = parseInt(val);
      updateRangeTrack(rangeInput);
    });
    updateRangeTrack(rangeInput); 
  }
  document.querySelectorAll(".rating-row input[type='checkbox']").forEach((cb, i) => {
    const ratings = [5, 4, 3];
    cb.addEventListener("change", () => {
      if (cb.checked) {
        state.filters.minRating = ratings[i];
        document.querySelectorAll(".rating-row input[type='checkbox']").forEach((c, j) => {
          if (j !== i) c.checked = false;
        });
      } else {
        state.filters.minRating = 0;
      }
    });
  });
  const availLabels = ["in-stock", "pre-order"];
  document.querySelectorAll(".filters ul:last-of-type li input[type='checkbox']").forEach((cb, i) => {
    cb.addEventListener("change", () => {
      const val = availLabels[i];
      if (cb.checked) {
        if (!state.filters.availability.includes(val))
          state.filters.availability.push(val);
      } else {
        state.filters.availability = state.filters.availability.filter(v => v !== val);
      }
    });
  });
  const applyBtn = document.querySelector(".apply-btn");
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      state.currentPage = 1;
      renderBooks();
      notify("Filters applied!");
    });
  }
  const clearBtn = document.querySelector(".clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      document.querySelectorAll(".filters input[type='checkbox']").forEach(cb => cb.checked = false);
      if (rangeInput) {
        rangeInput.value = 40;
        if (priceLabels.length >= 2) priceLabels[1].textContent = "Up to $40";
        updateRangeTrack(rangeInput);
      }
      state.filters = { genres: [], maxPrice: 40, minRating: 0, availability: [] };
      state.currentPage = 1;
      renderBooks();
      notify("Filters cleared", "info");
    });
  }
}
function updateRangeTrack(input) {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.background = `linear-gradient(to right, #b8842a ${pct}%, #ddd ${pct}%)`;
}
function injectExtraStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .out-badge {
      position: absolute;
      bottom: 18px; left: 18px;
      background: rgba(0,0,0,0.55);
      color: #fff;
      font-size: 10px;
      padding: 4px 10px;
      border-radius: 20px;
    }
    .icon-bookmark, .icon-bag {
      font-size: 14px;
      margin-left: 6px;
      padding: 6px;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 8px;
      cursor: pointer;
      transition: 0.2s;
    }
    .icon-bookmark:hover, .icon-bag:hover {
      background: #b8842a;
      color: white;
      border-color: #b8842a;
    }
    .bi-bookmark-fill { color: #b8842a; }
    .bi-bag-fill      { color: #b8842a; }
  `;
  document.head.appendChild(style);
}
document.addEventListener("DOMContentLoaded", () => {
  injectExtraStyles();
  renderBooks();
  initHeaderButtons();
  initSearch();
  initSort();
  initFilters();
  updateCounters();
});
