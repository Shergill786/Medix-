(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};

  const MEDICINES = [
    { id: 'med-para', name: 'Paracetamol 500mg', category: 'Fever and pain', price: 35 },
    { id: 'med-vitd', name: 'Vitamin D3', category: 'Supplements', price: 120 },
    { id: 'med-ors', name: 'ORS Sachets', category: 'Hydration', price: 45 },
    { id: 'med-cet', name: 'Cetirizine 10mg', category: 'Allergy', price: 28 },
    { id: 'med-glu', name: 'Glucometer Strips', category: 'Diabetes care', price: 420 },
    { id: 'med-bp', name: 'Digital BP Monitor', category: 'Home care', price: 1499 },
  ];

  SH.initializePharmacyPage = function initializePharmacyPage() {
    SH.initializeAppShell({
      pageId: 'pharmacy',
      title: 'Buy Medicines',
      description: 'Add medicines to a demo cart and track a receipt-like summary locally.',
    });

    renderCatalog();
    renderCart();
    document.getElementById('medicineCatalog').addEventListener('click', addToCart);
    document.getElementById('cartSummary').addEventListener('click', handleCartAction);
  };

  function renderCatalog() {
    document.getElementById('medicineCatalog').innerHTML = MEDICINES.map((item) => [
      '<article class="medicine-card">',
      '  <div class="medicine-photo" aria-hidden="true"></div>',
      `  <h3>${item.name}</h3>`,
      `  <p class="muted">${item.category}</p>`,
      `  <strong>Rs. ${item.price}</strong>`,
      `  <button class="btn btn-primary" type="button" data-add-medicine="${item.id}">Add to Cart</button>`,
      '</article>',
    ].join('')).join('');
  }

  function addToCart(event) {
    const trigger = event.target.closest('[data-add-medicine]');
    if (!trigger) return;
    const medicine = MEDICINES.find((item) => item.id === trigger.dataset.addMedicine);
    const cart = SH.readCollection('cart');
    const existing = cart.find((item) => item.id === medicine.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...medicine, quantity: 1 });
    SH.saveCollection('cart', cart);
    SH.showToast('Medicine added to cart.', 'success');
    renderCart();
  }

  function renderCart() {
    const mount = document.getElementById('cartSummary');
    const cart = SH.readCollection('cart');
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    mount.innerHTML = cart.length
      ? [
          ...cart.map((item) => `<article class="list-item"><div class="list-item-head"><div><h3>${item.name}</h3><p class="muted">${item.category}</p></div><span class="badge">x${item.quantity}</span></div><p class="helper">Rs. ${item.price * item.quantity}</p><div class="item-actions"><button class="btn btn-secondary" type="button" data-cart-plus="${item.id}">+</button><button class="btn btn-danger" type="button" data-cart-remove="${item.id}">Remove</button></div></article>`),
          `<article class="payment-summary"><strong>Total: Rs. ${total}</strong><button class="btn btn-primary" type="button" data-checkout>Save Demo Order</button></article>`,
        ].join('')
      : SH.createEmptyState('Your medicine cart is empty.');
  }

  function handleCartAction(event) {
    const plus = event.target.closest('[data-cart-plus]');
    const remove = event.target.closest('[data-cart-remove]');
    const checkout = event.target.closest('[data-checkout]');
    let cart = SH.readCollection('cart');

    if (plus) {
      const item = cart.find((entry) => entry.id === plus.dataset.cartPlus);
      if (item) item.quantity += 1;
      SH.saveCollection('cart', cart);
      renderCart();
    }

    if (remove) {
      cart = cart.filter((entry) => entry.id !== remove.dataset.cartRemove);
      SH.saveCollection('cart', cart);
      renderCart();
    }

    if (checkout) {
      SH.showToast('Demo medicine order saved locally.', 'success');
    }
  }
})();
