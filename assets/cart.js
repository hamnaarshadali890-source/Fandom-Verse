const FandomCart = {
  items: {},

  load() {
    try {
      this.items = JSON.parse(localStorage.getItem('fandomverse_cart') || '{}');
    } catch (e) {
      this.items = {};
    }
  },

  save() {
    try {
      localStorage.setItem('fandomverse_cart', JSON.stringify(this.items));
    } catch (e) {
      /* storage unavailable, cart stays in-memory for this session */
    }
  },

  add(product) {
    const id = String(product.id);
    if (this.items[id]) {
      this.items[id].qty += 1;
    } else {
      this.items[id] = {
        id,
        name: product.name,
        price: Number(product.price) || 0,
        img: product.img,
        qty: 1
      };
    }
    this.save();
    this.render();
  },

  setQty(id, qty) {
    id = String(id);
    if (!this.items[id]) return;
    if (qty <= 0) {
      delete this.items[id];
    } else {
      this.items[id].qty = qty;
    }
    this.save();
    this.render();
  },

  getQty(id) {
    const item = this.items[String(id)];
    return item ? item.qty : 0;
  },

  count() {
    return Object.values(this.items).reduce((sum, i) => sum + i.qty, 0);
  },

  total() {
    return Object.values(this.items).reduce((sum, i) => sum + i.qty * i.price, 0);
  },

  render() {
    const badge = document.getElementById('cartCountBadge');
    const count = this.count();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }

    const emptyState = document.getElementById('cartEmptyState');
    const container = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('cartTotalPrice');

    if (!container) return;

    const entries = Object.values(this.items);

    if (entries.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      container.innerHTML = '';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      container.innerHTML = entries.map(item => `
        <div class="cart-line-item" data-cart-id="${item.id}">
          <img src="${item.img}" alt="${item.name}">
          <div class="cart-line-info">
            <h6>${item.name}</h6>
            <div class="cart-line-price">$${(item.price * item.qty).toFixed(2)}</div>
          </div>
          <div class="cart-qty-control">
            <button type="button" onclick="FandomCart.setQty('${item.id}', ${item.qty - 1}); syncProductCard('${item.id}');">−</button>
            <span>${item.qty}</span>
            <button type="button" onclick="FandomCart.setQty('${item.id}', ${item.qty + 1}); syncProductCard('${item.id}');">+</button>
          </div>
        </div>
      `).join('');
    }

    if (totalEl) totalEl.textContent = `$${this.total().toFixed(2)}`;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  FandomCart.load();
  FandomCart.render();

  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      alert('Checkout is coming soon! This storefront is currently a front-end preview.');
    });
  }
});
