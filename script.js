document.addEventListener('DOMContentLoaded', function () {

  const searchInput = document.getElementById('searchInput');
  const wishlistBtn = document.getElementById('wishlistBtn');
  const bagBtn = document.getElementById('bagBtn');

  // Submit search on Enter
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && searchInput.value.trim() !== '') {
      console.log('Searching for:', searchInput.value.trim());
      // Hook this up to your real search/filter logic
    }
  });

  // Toggle wishlist active state
  wishlistBtn.addEventListener('click', function () {
    wishlistBtn.classList.toggle('active');
  });

  // Bag click placeholder
  bagBtn.addEventListener('click', function () {
    console.log('Bag clicked — open cart drawer here');
  });

});

document.addEventListener('DOMContentLoaded', function () {

  const ctaButtons = document.querySelectorAll('.cta-btn');

  ctaButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const label = btn.textContent.trim();
      console.log('Clicked:', label);
      // Hook this up to your real category page routing
    });
  });

});