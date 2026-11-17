(() => {
  const currentPage = (window.location.pathname.split('/').pop() || 'Index.html').toLowerCase();
  const legacyProductCategory = {
    jersey: 'men.html',
    menshirt: 'men.html',
    menshoe: 'footwear.html',
    manblazer: 'footwear.html',
    manformal: 'footwear.html',
    mangolf: 'footwear.html'
  };
  const productContext = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('zm_product_context') || 'null');
    } catch (error) {
      console.error('Unable to read the current collection for site navigation.', error);
      return null;
    }
  })();
  const pageCategory = currentPage === 'product.html'
    ? (productContext?.collectionUrl || '').toLowerCase()
    : legacyProductCategory[currentPage.replace(/\.html$/, '')] || currentPage;
  const navigation = [
    { label: 'Home', href: 'Index.html', match: ['index.html'] },
    { label: 'Men', href: 'Men.html', match: ['men.html'] },
    { label: 'Women', href: 'Women.html', match: ['women.html'] },
    { label: 'Footwear', href: 'Footwear.html', match: ['footwear.html'] },
    { label: 'Accessories', href: 'Accessories.html', match: ['accessories.html'] },
    { label: 'Bag', href: 'bag.html', match: ['bag.html'] }
  ];

  function createHeader() {
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <div class="main-bar">
        <a href="Index.html" class="logo" aria-label="ZM Collective home">
          <span class="brand-logo-monogram">ZM</span>
          <span class="brand-logo-name">ZM COLLECTIVE</span>
          <span class="brand-logo-tagline">style in motion</span>
        </a>
        <nav class="icon-nav" id="mainNav" aria-label="Main navigation">
          <button class="sidebar-close" id="sidebarClose" type="button" aria-label="Close menu">&times;</button>
          ${navigation.map(item => {
            const isActive = item.match.includes(pageCategory);
            return `<a href="${item.href}" class="icon-nav-item${isActive ? ' active' : ''}"${isActive ? ' aria-current="page"' : ''}>${item.label}</a>`;
          }).join('')}
        </nav>
        <a class="site-sign-in" href="SignIn.html" aria-label="Sign in to your account">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"></circle><path d="M4.5 20a7.5 7.5 0 0 1 15 0"></path></svg>
          <span>Sign in</span>
        </a>
        <button class="hamburger" id="hamburgerBtn" type="button" aria-label="Toggle menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
      <div class="search-row">
        <form class="search-segmented" role="search">
          <div class="search-field">
            <label class="field-label" for="homeSearchInput">Search</label>
            <input class="field-value" id="homeSearchInput" name="search" type="search" placeholder="What are you looking for?" autocomplete="off">
          </div>
          <span class="field-divider"></span>
          <div class="search-field">
            <label class="field-label" for="homeSearchCategory">Shop</label>
            <select class="field-value" id="homeSearchCategory" name="category">
              <option value="all">All collections</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="footwear">Footwear</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
          <button class="search-submit" type="submit" aria-label="Search">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2.4" aria-hidden="true">
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>
        <p class="search-feedback" id="searchFeedback" aria-live="polite"></p>
      </div>
      <div class="nav-overlay" id="navOverlay"></div>`;

    if (currentPage === 'index.html') {
      header.querySelector('.search-segmented').id = 'siteSearchForm';
    }
    return header;
  }

  function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.id = 'contact';
    footer.innerHTML = `
      <div class="footer-container">
        <div class="footer-about">
          <a class="footer-brand" href="Index.html">ZMCOLLECTIVE</a>
          <p>Sportswear, sneakers and everyday essentials for movement and personal style.</p>
          <div class="socials" aria-label="Social media">
            <a href="#" aria-label="X"><i class="fa-brands fa-x-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
            <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="#" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
          </div>
          <button type="button" data-back-to-top>BACK TO TOP &#8593;</button>
        </div>
        <nav class="footer-links" aria-label="Shop">
          <h3>Shop</h3>
          <a href="Men.html">Men</a>
          <a href="Women.html">Women</a>
          <a href="Footwear.html">Footwear</a>
          <a href="Accessories.html">Accessories</a>
        </nav>
        <nav class="footer-links" aria-label="Help">
          <h3>Help</h3>
          <a href="Index.html#contact">Contact</a>
          <a href="bag.html">Your bag</a>
        </nav>
        <div class="footer-links">
          <h3>About ZM</h3>
          <span>Style in motion. Everyday essentials chosen for comfort, quality and personal expression.</span>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 ZMCOLLECTIVE. All Rights Reserved.</p>
      </div>`;
    footer.querySelector('[data-back-to-top]').addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    return footer;
  }

  const currentHeader = document.querySelector('header.site-header, header.zm-product-header');
  if (currentHeader) {
    const header = createHeader();
    currentHeader.replaceWith(header);

    const mainNav = header.querySelector('#mainNav');
    const hamburger = header.querySelector('#hamburgerBtn');
    const sidebarClose = header.querySelector('#sidebarClose');
    const overlay = header.querySelector('#navOverlay');

    function closeMenu() {
      mainNav.classList.remove('open');
      overlay.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      if (mainNav.classList.contains('open')) {
        closeMenu();
        return;
      }
      mainNav.classList.add('open');
      overlay.classList.add('open');
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    });
    sidebarClose.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  const currentFooter = document.querySelector('footer.footer');
  if (currentFooter) currentFooter.replaceWith(createFooter());
})();
