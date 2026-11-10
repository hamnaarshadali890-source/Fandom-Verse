let merchIsExpanded = false;
let merchProducts = [];
let merchActiveFilter = 'all';

const MERCH_FALLBACK_IMG = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="#0f1420"/><text x="150" y="160" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#c084fc">FandomVerse</text></svg>'
);

async function loadMerchProducts() {
  try {
    const res = await fetch('assets/merch/merch-products.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    merchProducts = await res.json();
    renderMerchProducts();
  } catch (err) {
    console.error('Could not load merch-products.json', err);
  }
}

function getFilteredMerchProducts() {
  if (merchActiveFilter === 'all') return merchProducts;
  return merchProducts.filter(p => String(p.category || '').toLowerCase() === merchActiveFilter.toLowerCase());
}

function renderMerchProducts() {
  const grid = document.getElementById('merchGrid');
  if (!grid) return;

  const visibleProducts = getFilteredMerchProducts();
  const shouldCollapse = merchActiveFilter === 'all' && !merchIsExpanded;

  grid.innerHTML = visibleProducts.map((p, index) => `
    <div class="col-12 col-sm-6 col-lg-3 merch-item-col">
      <div class="product-card ${shouldCollapse && index >= 4 ? 'hidden-card' : ''}"
           data-id="${p.id}"
           data-name="${p.name}"
           data-price="${p.price}"
           data-img="${p.img}"
           data-category="${p.category || 'Other'}">
        <div class="product-media">
          <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${MERCH_FALLBACK_IMG}'">
          <span class="price-tag">$${Number(p.price).toFixed(2)}</span>
        </div>
        <div class="product-info">
          <h4>${p.name}</h4>
          <div class="stars"><span class="star-icons">${p.stars || '☆☆☆☆☆'}</span> ${Number(p.rating).toFixed(1)} ( Item sold ${p.sold || 0})</div>
          <div class="action-container"></div>
        </div>
      </div>
    </div>
  `).join('');

  visibleProducts.forEach(p => syncProductCard(p.id));
  updateMerchViewAllButton();
}

function updateMerchViewAllButton() {
  const btn = document.getElementById('viewAllBtn');
  if (!btn) return;

  if (merchActiveFilter !== 'all') {
    btn.style.display = 'none';
    return;
  }

  btn.style.display = '';
  btn.textContent = merchIsExpanded ? 'Show Less' : 'View All';
}

function toggleMerchViewAll() {
  merchIsExpanded = !merchIsExpanded;
  renderMerchProducts();
}

function filterMerchProducts(category = 'all') {
  merchActiveFilter = String(category).toLowerCase();
  merchIsExpanded = false;
  renderMerchProducts();
}

function addMerchToCart(btn) {
  const card = btn.closest('.product-card');
  const id = card.dataset.id;
  FandomCart.add({
    id,
    name: card.dataset.name,
    price: parseFloat(card.dataset.price),
    img: card.dataset.img
  });
  syncProductCard(id);
}

function changeMerchQty(id, change) {
  const newQty = FandomCart.getQty(id) + change;
  FandomCart.setQty(id, newQty);
  syncProductCard(id);
}

function syncProductCard(id) {
  const card = document.querySelector(`.product-card[data-id="${id}"]`);
  if (!card) return;
  const container = card.querySelector('.action-container');
  if (!container) return;

  const qty = FandomCart.getQty(id);

  if (qty <= 0) {
    container.innerHTML = `<button class="add-cart-btn" onclick="addMerchToCart(this)">Add to Cart</button>`;
    return;
  }

  container.innerHTML = `
    <div class="qty-control">
      <button class="qty-btn" onclick="changeMerchQty('${id}', -1)" title="${qty === 1 ? 'Remove item' : 'Decrease quantity'}">
        ${qty === 1 ?
          `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>` :
          `-`}
      </button>
      <span class="qty-text">${qty} in cart</span>
      <button class="qty-btn" onclick="changeMerchQty('${id}', 1)" title="Increase quantity">+</button>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', loadMerchProducts);
