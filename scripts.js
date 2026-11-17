document.addEventListener('DOMContentLoaded', function () {

  // ================= SEARCH / WISHLIST / BAG =================
  const searchInput = document.getElementById('searchInput');
  const wishlistBtn = document.getElementById('wishlistBtn');
  const bagBtn = document.getElementById('bagBtn');

  if (searchInput) {
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && searchInput.value.trim() !== '') {
        console.log('Searching for:', searchInput.value.trim());
        // Hook this up to your real search/filter logic
      }
    });
  }

  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', function () {
      wishlistBtn.classList.toggle('active');
    });
  }

  if (bagBtn) {
    bagBtn.addEventListener('click', function () {
      console.log('Bag clicked — open cart drawer here');
    });
  }

  // ================= CTA BUTTONS =================
  const ctaButtons = document.querySelectorAll('.cta-btn');

  ctaButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const label = btn.textContent.trim();
      console.log('Clicked:', label);
      // Hook this up to your real category page routing
    });
  });

  // ================= SHOE CAROUSEL (.shoe-carousel section, uses .slides/.dot) =================
  const shoeCarouselSlides = document.querySelectorAll('.shoe-carousel .slides');
  const shoeCarouselDots = document.querySelectorAll('.shoe-carousel .dot');
  let shoeCarouselIndex = 0;

  function showShoeCarouselSlide(n) {
    if (!shoeCarouselSlides.length) return;

    shoeCarouselSlides.forEach(slide => slide.classList.remove('active'));
    shoeCarouselDots.forEach(dot => dot.classList.remove('active'));

    if (n >= shoeCarouselSlides.length) {
      shoeCarouselIndex = 0;
    } else if (n < 0) {
      shoeCarouselIndex = shoeCarouselSlides.length - 1;
    } else {
      shoeCarouselIndex = n;
    }

    shoeCarouselSlides[shoeCarouselIndex].classList.add('active');
    if (shoeCarouselDots[shoeCarouselIndex]) {
      shoeCarouselDots[shoeCarouselIndex].classList.add('active');
    }
  }

  const shoeCarouselNext = document.querySelector('.shoe-carousel .next');
  const shoeCarouselPrev = document.querySelector('.shoe-carousel .prev');

  if (shoeCarouselNext) {
    shoeCarouselNext.addEventListener('click', () => {
      showShoeCarouselSlide(shoeCarouselIndex + 1);
    });
  }

  if (shoeCarouselPrev) {
    shoeCarouselPrev.addEventListener('click', () => {
      showShoeCarouselSlide(shoeCarouselIndex - 1);
    });
  }

  shoeCarouselDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showShoeCarouselSlide(i);
    });
  });

  if (shoeCarouselSlides.length) {
    setInterval(() => {
      showShoeCarouselSlide(shoeCarouselIndex + 1);
    }, 5000);
  }

  // ================= TRENDING SHOE SLIDER (horizontal scroll) =================
  const shoeSlider = document.getElementById('shoeSlider');

  window.slideRight = function () {
    if (shoeSlider) {
      shoeSlider.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  window.slideLeft = function () {
    if (shoeSlider) {
      shoeSlider.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  // ================= HERO CAROUSEL (.hero-carousel section, uses .slide) =================
  const heroSlides = document.querySelectorAll('.hero-carousel .slide');
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');
  const pauseBtn = document.getElementById('pauseBtn');

  let heroCurrent = 0;
  let heroPlaying = true;
  let heroAutoSlide;

  function showHeroSlide(index) {
    heroSlides.forEach(slide => slide.classList.remove('active'));
    heroSlides[index].classList.add('active');
  }

  function nextHeroSlide() {
    heroCurrent = (heroCurrent + 1) % heroSlides.length;
    showHeroSlide(heroCurrent);
  }

  function prevHeroSlide() {
    heroCurrent = (heroCurrent - 1 + heroSlides.length) % heroSlides.length;
    showHeroSlide(heroCurrent);
  }

  function restartHeroAuto() {
    if (!heroPlaying) return;
    clearInterval(heroAutoSlide);
    heroAutoSlide = setInterval(nextHeroSlide, 5000);
  }

  if (heroSlides.length) {
    heroAutoSlide = setInterval(nextHeroSlide, 5000);

    if (nextBtn) {
      nextBtn.onclick = () => {
        nextHeroSlide();
        restartHeroAuto();
      };
    }

    if (prevBtn) {
      prevBtn.onclick = () => {
        prevHeroSlide();
        restartHeroAuto();
      };
    }

    if (pauseBtn) {
      pauseBtn.onclick = () => {
        if (heroPlaying) {
          clearInterval(heroAutoSlide);
          pauseBtn.innerHTML = '▶';
        } else {
          heroAutoSlide = setInterval(nextHeroSlide, 5000);
          pauseBtn.innerHTML = '❚❚';
        }
        heroPlaying = !heroPlaying;
      };
    }
  }

  // ================= FASHION HERO CAROUSEL (.fashion-hero section, uses #fhTrack/.fh-dot) =================
  const fhTrack = document.getElementById('fhTrack');
  const fhDots = document.querySelectorAll('#fhDots .fh-dot');
  const fhNextBtn = document.getElementById('fhNext');
  const fhPrevBtn = document.getElementById('fhPrev');

  if (fhTrack && fhDots.length) {
    const fhSlideCount = fhDots.length;
    let fhCurrent = 1; // starts on the middle/active dot to match markup

    function fhGoTo(n) {
      fhCurrent = (n + fhSlideCount) % fhSlideCount;
      fhTrack.style.transform = `translateX(-${fhCurrent * (100 / fhSlideCount)}%)`;
      fhDots.forEach(d => d.classList.remove('active'));
      fhDots[fhCurrent].classList.add('active');
    }

    if (fhNextBtn) {
      fhNextBtn.addEventListener('click', () => fhGoTo(fhCurrent + 1));
    }

    if (fhPrevBtn) {
      fhPrevBtn.addEventListener('click', () => fhGoTo(fhCurrent - 1));
    }

    fhDots.forEach((dot, i) => {
      dot.addEventListener('click', () => fhGoTo(i));
    });

    fhGoTo(fhCurrent); // sync position on load
  }

});

// ============================================================
// SHARED CART SYSTEM
// Used by every product detail page (Menshirt.html, Menshoe.html,
// Manblazer.html, Mangolf.html, Manformal.html) and by bag.html.
// Cart is stored in the browser's localStorage under one key,
// so it persists across pages/reloads until cleared. There's no
// backend here — this is purely a client-side cart. Delivery is
// a flat fee applied once whenever the cart isn't empty.
// ============================================================
/* ============================================================
   ZM COLLECTIVE — SHARED CART LOGIC
   Include this ONE file (with this exact filename) on every
   page that touches the cart: product pages, bag.html, etc.

   Storage: localStorage under the key "zm_cart"
   Cart item shape:
   {
     key:   "michigan",        // product key
     title: "Michigan Victory Primary Logo",
     price: 699,                // number, not "P699.00"
     size:  "L",
     qty:   1,
     img:   "Mm.avif"
   }
============================================================= */

const ZM_CART_KEY = 'zm_cart';
const ZM_DELIVERY_FEE = 50; // adjust as needed, or set to 0

// ---------- Core read/write helpers ----------

function zmGetCart() {
  try {
    const raw = localStorage.getItem(ZM_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('zmGetCart: failed to read cart', e);
    return [];
  }
}

function zmSaveCart(cart) {
  try {
    localStorage.setItem(ZM_CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('zmSaveCart: failed to save cart', e);
  }
}

// ---------- Mutations ----------

// Adds an item. If the same product + same size is already in the
// cart, it increases the quantity instead of adding a duplicate row.
function zmAddToCart(newItem) {
  const cart = zmGetCart();

  const existingIndex = cart.findIndex(
    item => item.key === newItem.key && item.size === newItem.size
  );

  if (existingIndex > -1) {
    cart[existingIndex].qty += newItem.qty || 1;
  } else {
    cart.push({
      key: newItem.key,
      title: newItem.title,
      price: Number(newItem.price),
      size: newItem.size,
      qty: newItem.qty || 1,
      img: newItem.img
    });
  }

  zmSaveCart(cart);
  return cart;
}

function zmUpdateQty(index, newQty) {
  const cart = zmGetCart();
  if (!cart[index]) return cart;

  cart[index].qty = Math.max(1, newQty);
  zmSaveCart(cart);
  return cart;
}

function zmRemoveFromCart(index) {
  const cart = zmGetCart();
  if (!cart[index]) return cart;

  cart.splice(index, 1);
  zmSaveCart(cart);
  return cart;
}

function zmClearCart() {
  zmSaveCart([]);
}

// ---------- Totals ----------

function zmCartTotals(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = cart.length > 0 ? ZM_DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  return { subtotal, delivery, total };
}