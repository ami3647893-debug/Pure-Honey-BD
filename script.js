(() => {
  const body = document.body;
  const languageButtons = document.querySelectorAll("[data-language]");
  const cartDrawer = document.querySelector(".cart-drawer");
  const drawerBackdrop = document.querySelector(".drawer-backdrop");
  const checkoutModal = document.querySelector(".checkout-modal");
  const modalBackdrop = document.querySelector(".modal-backdrop");
  const cartItems = document.querySelector(".cart-items");
  const cartEmpty = document.querySelector(".cart-empty");
  const cartCount = document.querySelector(".cart-count");
  const toast = document.querySelector(".toast");
  const cart = new Map();
  let currentLanguage = localStorage.getItem("pureHoneyLanguage") === "en" ? "en" : "bn";
  let toastTimer;

  const messages = {
    bn: {
      added: "আপনার ব্যাগে মধু যোগ হয়েছে।",
      removed: "মধু আপনার ব্যাগ থেকে সরানো হয়েছে।",
      newsletter: "ধন্যবাদ! মধুর খবরের তালিকায় আপনার নাম যোগ হয়েছে।",
      order: "ধন্যবাদ! আপনার অর্ডারটি জমা হয়েছে। আমরা শিগগিরই যোগাযোগ করব।",
      empty: "চেকআউটের আগে ব্যাগে মধু যোগ করুন।",
      currency: "৳ ",
      quantity: "পরিমাণ",
      menu: "মেনু খুলুন",
      closeMenu: "মেনু বন্ধ করুন"
    },
    en: {
      added: "Honey added to your basket.",
      removed: "Honey removed from your basket.",
      newsletter: "Thank you! You're on the list for a little sweetness.",
      order: "Thank you! Your order is in. We'll be in touch soon.",
      empty: "Add some honey to your basket before checkout.",
      currency: "৳ ",
      quantity: "items",
      menu: "Open menu",
      closeMenu: "Close menu"
    }
  };

  function localizeNumber(value) {
    return currentLanguage === "bn"
      ? String(value).replace(/\d/g, digit => "০১২৩৪৫৬৭৮৯"[Number(digit)])
      : String(value);
  }

  function setLanguage(language) {
    currentLanguage = language;
    localStorage.setItem("pureHoneyLanguage", language);
    body.lang = language;
    document.documentElement.lang = language;
    document.title = language === "bn"
      ? "Pure Honey BD — প্রকৃতির মধুর উপহার"
      : "Pure Honey BD — Nature's sweetest gift";
    document.querySelector('meta[name="description"]').content = language === "bn"
      ? "বাংলাদেশের বিশুদ্ধ, প্রাকৃতিক ও খাঁটি মধু — Pure Honey BD"
      : "Pure, natural Bangladeshi honey from Pure Honey BD.";
    document.querySelectorAll("[data-bn][data-en]").forEach(element => {
      element.innerHTML = element.dataset[language];
    });
    document.querySelectorAll("[data-alt-bn][data-alt-en]").forEach(image => {
      image.alt = image.dataset[`alt${language === "bn" ? "Bn" : "En"}`];
    });
    document.querySelectorAll("[data-placeholder-bn][data-placeholder-en]").forEach(element => {
      element.placeholder = element.dataset[`placeholder${language === "bn" ? "Bn" : "En"}`];
    });
    languageButtons.forEach(button => {
      const active = button.dataset.language === language;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelector(".menu-toggle").setAttribute("aria-label", messages[language].menu);
    document.querySelector("[data-cart-open]").setAttribute("aria-label", language === "bn" ? "শপিং ব্যাগ খুলুন" : "Open shopping cart");
    document.querySelector(".cart-drawer").setAttribute("aria-label", language === "bn" ? "শপিং ব্যাগ" : "Shopping basket");
    document.querySelectorAll(".quick-add").forEach(button => {
      const id = button.closest("[data-product-id]").dataset.productId;
      button.setAttribute("aria-label", `${productName(id)} ${language === "bn" ? "ব্যাগে যোগ করুন" : "Add to basket"}`);
    });
    renderCart();
  }

  function money(amount) {
    return `${messages[currentLanguage].currency}${localizeNumber(amount)}`;
  }

  function productName(id) {
    const name = document.querySelector(`[data-product-id="${id}"] h3`);
    return name.dataset[currentLanguage];
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  function updateCartCount() {
    const total = [...cart.values()].reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = localizeNumber(total);
    cartCount.setAttribute("aria-label", `${total} ${messages[currentLanguage].quantity}`);
    return total;
  }

  function renderCart() {
    cartItems.replaceChildren();
    const hasItems = cart.size > 0;
    cartEmpty.classList.toggle("is-visible", !hasItems);
    cartItems.hidden = !hasItems;
    let subtotal = 0;

    cart.forEach((item, id) => {
      const row = document.createElement("article");
      row.className = "cart-row";
      const info = document.createElement("div");
      const name = document.createElement("h3");
      name.textContent = productName(id);
      const price = document.createElement("span");
      price.className = "cart-row__price";
      price.textContent = `${money(item.price)} · ${localizeNumber(500)} ${currentLanguage === "bn" ? "গ্রাম" : "g"}`;
      info.append(name, price);

      const right = document.createElement("div");
      right.className = "cart-row__right";
      const lineTotal = document.createElement("span");
      lineTotal.className = "cart-row__total";
      lineTotal.textContent = money(item.price * item.quantity);
      const controls = document.createElement("div");
      controls.className = "quantity-control";
      const decrease = document.createElement("button");
      decrease.type = "button";
      decrease.textContent = "−";
      decrease.setAttribute("aria-label", currentLanguage === "bn" ? "একটি কমান" : "Decrease quantity");
      decrease.addEventListener("click", () => changeQuantity(id, -1));
      const quantity = document.createElement("span");
      quantity.textContent = localizeNumber(item.quantity);
      const increase = document.createElement("button");
      increase.type = "button";
      increase.textContent = "+";
      increase.setAttribute("aria-label", currentLanguage === "bn" ? "একটি বাড়ান" : "Increase quantity");
      increase.addEventListener("click", () => changeQuantity(id, 1));
      controls.append(decrease, quantity, increase);
      right.append(lineTotal, controls);
      row.append(info, right);
      cartItems.append(row);
      subtotal += item.price * item.quantity;
    });

    updateCartCount();
    document.querySelector(".cart-total").textContent = money(subtotal);
    document.querySelector(".checkout-total__amount").textContent = money(subtotal);
    document.querySelector(".checkout-button").disabled = !hasItems;
  }

  function changeQuantity(id, amount) {
    const item = cart.get(id);
    if (!item) return;
    item.quantity += amount;
    if (item.quantity <= 0) {
      cart.delete(id);
      showToast(messages[currentLanguage].removed);
    }
    renderCart();
  }

  function closeMenu() {
    const menu = document.querySelector(".main-nav");
    const toggle = document.querySelector(".menu-toggle");
    menu.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", messages[currentLanguage].menu);
  }

  function openCart() {
    cartDrawer.classList.add("is-open");
    cartDrawer.setAttribute("aria-hidden", "false");
    drawerBackdrop.classList.add("is-open");
    body.classList.add("has-overlay");
    closeMenu();
  }

  function closeCart() {
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    drawerBackdrop.classList.remove("is-open");
    if (!checkoutModal.classList.contains("is-open")) body.classList.remove("has-overlay");
  }

  function closeCheckout() {
    checkoutModal.classList.remove("is-open");
    checkoutModal.setAttribute("aria-hidden", "true");
    modalBackdrop.classList.remove("is-open");
    if (!cartDrawer.classList.contains("is-open")) body.classList.remove("has-overlay");
  }

  languageButtons.forEach(button => button.addEventListener("click", () => setLanguage(button.dataset.language)));
  document.querySelectorAll("[data-add-product]").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-product-id]");
      const id = card.dataset.productId;
      const existing = cart.get(id);
      cart.set(id, { price: Number(card.dataset.price), quantity: existing ? existing.quantity + 1 : 1 });
      renderCart();
      showToast(messages[currentLanguage].added);
    });
  });

  document.querySelector("[data-cart-open]").addEventListener("click", openCart);
  document.querySelectorAll("[data-cart-close]").forEach(button => button.addEventListener("click", closeCart));
  drawerBackdrop.addEventListener("click", closeCart);
  document.querySelector("[data-checkout]").addEventListener("click", () => {
    if (!cart.size) {
      showToast(messages[currentLanguage].empty);
      return;
    }
    closeCart();
    checkoutModal.classList.add("is-open");
    checkoutModal.setAttribute("aria-hidden", "false");
    modalBackdrop.classList.add("is-open");
    body.classList.add("has-overlay");
    checkoutModal.querySelector("input").focus();
  });
  document.querySelectorAll("[data-modal-close]").forEach(button => button.addEventListener("click", closeCheckout));
  modalBackdrop.addEventListener("click", closeCheckout);

  document.querySelector("#checkout-form").addEventListener("submit", event => {
    event.preventDefault();
    cart.clear();
    renderCart();
    closeCheckout();
    event.currentTarget.reset();
    showToast(messages[currentLanguage].order);
  });
  document.querySelector("#newsletter-form").addEventListener("submit", event => {
    event.preventDefault();
    event.currentTarget.reset();
    showToast(messages[currentLanguage].newsletter);
  });

  const menuToggle = document.querySelector(".menu-toggle");
  menuToggle.addEventListener("click", () => {
    const menu = document.querySelector(".main-nav");
    const isOpen = menu.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? messages[currentLanguage].closeMenu : messages[currentLanguage].menu);
  });
  document.querySelectorAll(".main-nav a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeCart();
      closeCheckout();
      closeMenu();
    }
  });

  document.querySelector("#current-year").textContent = new Date().getFullYear();
  setLanguage(currentLanguage);
})();
