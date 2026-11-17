document.addEventListener('DOMContentLoaded', function () {

  // Preserve the exact listing image and product details when opening a product.
  document.addEventListener('click', function (event) {
    const card = event.target.closest('.plp-grid .plp-card, .product-grid .product-card');
    if (!card) return;

    event.preventDefault();

    const cards = Array.from(document.querySelectorAll('.plp-grid .plp-card, .product-grid .product-card'));
    const pageUrl = window.location.pathname.split('/').pop() || 'Index.html';
    const categoryDestinations = {
      men: ['Men.html', 'Men'],
      women: ['Women.html', 'Women'],
      footwear: ['Footwear.html', 'Footwear'],
      accessories: ['Accessories.html', 'Accessories']
    };
    const cardCategory = card.dataset.category;
    const [collectionUrl, homeCollectionName] = categoryDestinations[cardCategory] || [pageUrl, 'New Arrivals'];
    const collectionName = document.querySelector('.plp-header h1')?.textContent.replace(/\s+\(\d+\)$/, '').trim()
      || (pageUrl.toLowerCase() === 'index.html' ? homeCollectionName : pageUrl.replace(/\.html$/i, ''));
    const items = cards.map((item, index) => {
      const title = item.querySelector('h3')?.textContent.trim() || item.querySelector('img')?.alt.trim() || 'Product';
      const image = item.querySelector('.plp-card-image img, img')?.getAttribute('src');
      const price = item.querySelector('.plp-price, .price')?.textContent.trim() || '';
      const itemCategory = item.dataset.category || (pageUrl.toLowerCase() === 'footwear.html'
        ? 'footwear'
        : pageUrl.toLowerCase() === 'accessories.html'
          ? 'accessories'
          : /menshoe|manblazer|mangolf|manformal/i.test(item.getAttribute('href') || '')
            ? 'footwear'
            : /jersey\.html/i.test(item.getAttribute('href') || '')
              ? 'jerseys'
              : '');
      const sub = item.querySelector('.plp-sub')?.textContent.trim()
        || categoryDestinations[itemCategory]?.[1]
        || collectionName;
      const slug = title.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      return {
        id: `${slug}-${index}`,
        title,
        image,
        price,
        sub,
        category: itemCategory
      };
    }).filter(item => item.image);

    const selectedIndex = cards.indexOf(card);
    const selectedProduct = items.find(item => item.id.endsWith(`-${selectedIndex}`));
    if (!selectedProduct) {
      console.error('Unable to open product: the selected listing card has no image.');
      return;
    }

    try {
      sessionStorage.setItem('zm_product_context', JSON.stringify({
        collectionName,
        collectionUrl,
        items
      }));
    } catch (error) {
      console.error('Unable to save the selected product details.', error);
      window.alert('This product could not be opened. Please check your browser storage settings and try again.');
      return;
    }
    window.location.assign(`Product.html?item=${encodeURIComponent(selectedProduct.id)}`);
  });

  // ================= SITE-WIDE PRODUCT SEARCH =================
  let siteSearchForm = document.querySelector('.search-segmented');

  if (siteSearchForm) {
    if (siteSearchForm.tagName !== 'FORM') {
      const form = document.createElement('form');
      form.className = siteSearchForm.className;
      form.setAttribute('role', 'search');
      siteSearchForm.replaceWith(form);
      while (siteSearchForm.firstChild) form.appendChild(siteSearchForm.firstChild);
      siteSearchForm = form;

      const fields = Array.from(siteSearchForm.querySelectorAll('.search-field'));
      const searchLabel = fields[0]?.querySelector('.field-label');
      const searchValue = fields[0]?.querySelector('.field-value');
      if (searchLabel) {
        const label = document.createElement('label');
        label.className = searchLabel.className;
        label.htmlFor = 'homeSearchInput';
        label.textContent = 'Search';
        searchLabel.replaceWith(label);
      }
      if (searchValue) {
        const input = document.createElement('input');
        input.className = searchValue.className;
        input.id = 'homeSearchInput';
        input.type = 'search';
        input.name = 'search';
        input.placeholder = 'What are you looking for?';
        input.autocomplete = 'off';
        searchValue.replaceWith(input);
      }

      const categoryLabel = fields[1]?.querySelector('.field-label');
      const categoryValue = fields[1]?.querySelector('.field-value');
      if (categoryLabel) {
        const label = document.createElement('label');
        label.className = categoryLabel.className;
        label.htmlFor = 'homeSearchCategory';
        label.textContent = 'Shop';
        categoryLabel.replaceWith(label);
      }
      if (categoryValue) {
        const select = document.createElement('select');
        select.className = categoryValue.className;
        select.id = 'homeSearchCategory';
        select.name = 'category';
        select.innerHTML = '<option value="all">All collections</option><option value="men">Men</option><option value="women">Women</option><option value="footwear">Footwear</option><option value="accessories">Accessories</option>';
        categoryValue.replaceWith(select);
      }

      if (fields[2]) {
        const sizeField = fields[2];
        const precedingDivider = sizeField.previousElementSibling;
        if (precedingDivider?.classList.contains('field-divider')) precedingDivider.remove();
        sizeField.remove();
      }
    }

    const searchInput = siteSearchForm.querySelector('#homeSearchInput');
    const searchCategory = siteSearchForm.querySelector('#homeSearchCategory');
    let searchFeedback = document.getElementById('searchFeedback');
    if (!searchFeedback) {
      searchFeedback = document.createElement('p');
      searchFeedback.className = 'search-feedback';
      searchFeedback.id = 'searchFeedback';
      searchFeedback.setAttribute('aria-live', 'polite');
      siteSearchForm.insertAdjacentElement('afterend', searchFeedback);
    }

    if (searchInput && searchCategory) {
      const params = new URLSearchParams(window.location.search);
      const initialQuery = params.get('search') || '';
      const initialCategory = params.get('category') || 'all';
      if (initialQuery) searchInput.value = initialQuery;
      if (Array.from(searchCategory.options).some(option => option.value === initialCategory)) {
        searchCategory.value = initialCategory;
      }

      const destinations = {
        men: 'Men.html',
        women: 'Women.html',
        footwear: 'Footwear.html',
        accessories: 'Accessories.html'
      };
      const currentPage = decodeURIComponent(window.location.pathname.split('/').pop() || 'Index.html').toLowerCase();

      function runProductSearch(query, category) {
        const cards = document.querySelectorAll('.plp-card, .product-card, .category-card, .bj-card');
        const isHomePage = document.getElementById('siteSearchForm') !== null;
        const normalizedQuery = query.trim().toLocaleLowerCase();
        let visibleCount = 0;

        cards.forEach(card => {
          const searchableText = `${card.textContent} ${card.querySelector('img')?.alt || ''}`.toLocaleLowerCase();
          const cardCategory = card.dataset.category || '';
          const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
          const matchesCategory = category === 'all'
            || cardCategory === category
            || ((card.classList.contains('plp-card') || card.classList.contains('bj-card'))
              && currentPage === destinations[category]?.toLowerCase());
          card.hidden = !(matchesQuery && matchesCategory);
          if (!card.hidden) visibleCount += 1;
        });

        if (!normalizedQuery && category === 'all') {
          cards.forEach(card => { card.hidden = false; });
        }

        if (!isHomePage && document.querySelector('.plp-grid')) {
          selectedSearchQuery = normalizedQuery;
          applyListingFilters();
        }

        if (isHomePage && normalizedQuery && category === 'all' && visibleCount === 0) {
          window.location.assign(`Men.html?search=${encodeURIComponent(query)}&category=men`);
          return;
        }

        const hasSearch = normalizedQuery.length > 0 || category !== 'all';
        if (!hasSearch) {
          searchFeedback.textContent = '';
        } else if (visibleCount) {
          searchFeedback.textContent = `${visibleCount} ${visibleCount === 1 ? 'result' : 'results'} found.`;
        } else {
          searchFeedback.textContent = `No results for "${query.trim()}". Try another search or collection.`;
        }

        if (isHomePage && normalizedQuery) {
          const arrivals = document.getElementById('new-arrivals');
          if (arrivals) arrivals.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (isHomePage && category !== 'all') {
          const categories = document.getElementById('shop-by-category');
          if (categories) categories.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      siteSearchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const query = searchInput.value.trim();
        const category = searchCategory.value;
        const destination = destinations[category];
        const currentResults = document.querySelector('.plp-grid, .product-grid, .browse-jersey-grid');

        if (destination && currentPage !== destination.toLowerCase()) {
          const params = new URLSearchParams();
          if (query) params.set('search', query);
          params.set('category', category);
          window.location.assign(`${destination}?${params.toString()}`);
          return;
        }

        if (query && category === 'all' && !currentResults) {
          window.location.assign(`Men.html?search=${encodeURIComponent(query)}&category=men`);
          return;
        }

        runProductSearch(query, category);
      });

      if (initialQuery || initialCategory !== 'all') {
        window.setTimeout(() => runProductSearch(initialQuery, initialCategory), 0);
      }
    }
  }

  // ================= PRODUCT LISTING FILTERS / SORT =================
  const productGrid = document.querySelector('.plp-grid');
  const listingLayout = document.querySelector('.plp-layout');
  const listingCards = productGrid ? Array.from(productGrid.querySelectorAll('.plp-card')) : [];
  const filterToggle = document.querySelector('[data-filter-toggle]');
  const filterToggleLabel = filterToggle?.querySelector('[data-filter-label]');
  const productSort = document.getElementById('productSort');
  const categoryLinks = document.querySelectorAll('.plp-category-list a');
  const listingHeading = document.querySelector('.plp-header h1');
  const listingTitle = listingHeading?.textContent.replace(/\s+\(\d+\)$/, '').trim() || '';
  let selectedProductCategory = '';
  let selectedSearchQuery = new URLSearchParams(window.location.search).get('search')?.trim().toLocaleLowerCase() || '';

  function applyListingFilters() {
    if (!listingCards.length) return;

    const selectedPriceRanges = Array.from(document.querySelectorAll('.plp-filter'))
      .filter(filter => filter.querySelector('summary')?.textContent.toLowerCase().includes('price'))
      .flatMap(filter => Array.from(filter.querySelectorAll('input:checked')).map(input => input.closest('label')?.textContent || ''));
    const selectedGender = Array.from(document.querySelectorAll('.plp-filter'))
      .filter(filter => filter.querySelector('summary')?.textContent.toLowerCase().includes('gender'))
      .flatMap(filter => Array.from(filter.querySelectorAll('input:checked')).map(input => input.closest('label')?.textContent.trim().toLowerCase() || ''));
    const selectedOffers = Array.from(document.querySelectorAll('.plp-filter'))
      .filter(filter => filter.querySelector('summary')?.textContent.toLowerCase().includes('sale'))
      .flatMap(filter => Array.from(filter.querySelectorAll('input:checked')).map(input => input.closest('label')?.textContent.toLowerCase() || ''));
    const listingGender = /women/i.test(listingTitle)
      ? 'women'
      : /\bmen/i.test(listingTitle)
        ? 'men'
        : /footwear|accessories/i.test(listingTitle)
          ? 'unisex'
          : '';

    listingCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const cardDetails = `${text} ${card.querySelector('img')?.alt || ''}`.toLowerCase();
      const priceText = card.querySelector('.plp-price')?.textContent || '';
      const price = Number.parseFloat(priceText.replace(/[^\d.]/g, ''));
      const tag = card.querySelector('.plp-tag')?.textContent.toLowerCase() || '';
      const matchesSearch = !selectedSearchQuery || `${text} ${card.querySelector('img')?.alt || ''}`.toLocaleLowerCase().includes(selectedSearchQuery);
      const cardGender = card.dataset.gender
        || (/\bunisex\b/.test(cardDetails) ? 'unisex'
          : /\b(women|womens|female)\b/.test(cardDetails) ? 'women'
            : /\b(men|mens|male)\b/.test(cardDetails) ? 'men'
              : listingGender);
      const genderMatches = !selectedGender.length || selectedGender.some(gender =>
        gender === cardGender || (cardGender === 'unisex' && gender !== '')
      );
      const categoryMatches = !selectedProductCategory || (card.querySelector('.plp-sub')?.textContent.toLowerCase().includes(selectedProductCategory) ?? false);
      const priceMatches = !selectedPriceRanges.length || selectedPriceRanges.some(range => {
        const limits = range.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
        if (/under/i.test(range)) return limits.length > 0 && price < limits[0];
        if (/over/i.test(range)) return limits.length > 0 && price > limits[0];
        return limits.length > 1 && price >= limits[0] && price <= limits[1];
      });
      const offerMatches = !selectedOffers.length || selectedOffers.some(offer => {
        if (offer.includes('sale')) return tag.includes('sale');
        return tag.includes('markdown');
      });

      card.hidden = !(matchesSearch && genderMatches && categoryMatches && priceMatches && offerMatches);
    });

    if (listingHeading) {
      listingHeading.textContent = `${listingTitle} (${listingCards.filter(card => !card.hidden).length})`;
    }
  }

  if (filterToggle && listingLayout) {
    filterToggle.addEventListener('click', function () {
      const filtersVisible = filterToggle.getAttribute('aria-expanded') === 'true';
      filterToggle.setAttribute('aria-expanded', String(!filtersVisible));
      if (filterToggleLabel) {
        filterToggleLabel.textContent = filtersVisible ? 'Show Filters' : 'Hide Filters';
      }
      listingLayout.classList.toggle('filters-hidden', filtersVisible);
    });
  }

  if (productSort && productGrid) {
    productSort.addEventListener('change', function () {
      const sortedCards = [...listingCards];
      if (productSort.value === 'price-low' || productSort.value === 'price-high') {
        sortedCards.sort((a, b) => {
          const priceA = Number.parseFloat(a.querySelector('.plp-price')?.textContent.replace(/[^\d.]/g, '') || '0');
          const priceB = Number.parseFloat(b.querySelector('.plp-price')?.textContent.replace(/[^\d.]/g, '') || '0');
          return productSort.value === 'price-low' ? priceA - priceB : priceB - priceA;
        });
      } else if (productSort.value === 'name') {
        sortedCards.sort((a, b) => a.querySelector('h3')?.textContent.localeCompare(b.querySelector('h3')?.textContent || '') || 0);
      }
      sortedCards.forEach(card => productGrid.appendChild(card));
      applyListingFilters();
    });
  }

  const initialSearchParams = new URLSearchParams(window.location.search);
  const initialListingQuery = initialSearchParams.get('search')?.trim().toLocaleLowerCase() || '';
  if (initialListingQuery) {
    selectedSearchQuery = initialListingQuery;
  }
  applyListingFilters();

  categoryLinks.forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      selectedProductCategory = selectedProductCategory === link.textContent.trim().toLowerCase()
        ? ''
        : link.textContent.trim().toLowerCase();
      categoryLinks.forEach(category => category.classList.toggle('active', category === link && selectedProductCategory !== ''));
      applyListingFilters();
    });
  });

  document.querySelectorAll('.plp-filter input').forEach(input => {
    input.addEventListener('change', applyListingFilters);
  });

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

  if (fhTrack && fhDots.length) {
    const fhSlideCount = fhDots.length;
    let fhCurrent = 0;

    function fhGoTo(n) {
      fhCurrent = (n + fhSlideCount) % fhSlideCount;
      fhTrack.style.transform = `translateX(-${fhCurrent * (100 / fhSlideCount)}%)`;
      fhDots.forEach((dot, index) => {
        const isActive = index === fhCurrent;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-pressed', String(isActive));
      });
    }

    fhDots.forEach((dot, i) => {
      dot.addEventListener('click', () => fhGoTo(i));
    });

    fhGoTo(fhCurrent);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInterval(() => fhGoTo(fhCurrent + 1), 6000);
    }
  }

});

document.querySelectorAll('.plp-card').forEach(card => {
  const mainImg = card.querySelector('.plp-main-img');
  const thumbs = card.querySelectorAll('.plp-thumb');

  thumbs.forEach(thumb => {
    thumb.addEventListener('mouseenter', () => {
      mainImg.src = thumb.dataset.full;
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });

    // Stop clicking a thumbnail from triggering the card's link
    thumb.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
});
