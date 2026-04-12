/* ══════════════════════════════════════════════
   FOLIO — Books_Link_Patch.js
   ضيف ده في آخر Books.js أو في Books.html
   بيخلي كل كارت كتاب يروح لصفحة Book_Details
   ══════════════════════════════════════════════ */

/* ── LINK HTML BOOK CARDS → Book_Details.html ── */
function linkBookCards() {
    document.querySelectorAll('.book-card').forEach(card => {
        const titleEl = card.querySelector('.title, h3.title');
        if (!titleEl) return;
        const title = titleEl.textContent.trim();

        /* اعمل الكارت قابل للضغط بكل مكان ماعدا الـ buttons */
        card.style.cursor = 'pointer';
        card.addEventListener('click', function (e) {
            /* لو الضغط على زرار أو bookmark icon متنقلش */
            if (e.target.closest('button') || e.target.closest('.icons')) return;
            location.href = `Book_Details.html?title=${encodeURIComponent(title)}`;
        });

        /* كمان زرار "Add to Cart" يفضل شغال زي ما هو */
    });
}

/* ── LINK ADMIN BOOK CARDS (بيتعمل بعد renderAdminBooks) ── */
const _origRenderAdminBooks = typeof renderAdminBooks === 'function' ? renderAdminBooks : null;
if (_origRenderAdminBooks) {
    window.renderAdminBooks = function (...args) {
        _origRenderAdminBooks(...args);
        /* بعد ما الـ admin cards اتعملت، wire الـ links */
        document.querySelectorAll('.admin-book-card').forEach(card => {
            const titleEl = card.querySelector('.title');
            if (!titleEl) return;
            const title = titleEl.textContent.trim();
            card.style.cursor = 'pointer';
            card.addEventListener('click', function (e) {
                if (e.target.closest('button') || e.target.closest('.icons')) return;
                location.href = `Book_Details.html?title=${encodeURIComponent(title)}`;
            });
        });
    };
}

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded', linkBookCards);