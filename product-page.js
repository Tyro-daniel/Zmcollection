document.addEventListener('DOMContentLoaded', () => {
  const contextValue = sessionStorage.getItem('zm_product_context');
  const productId = new URLSearchParams(window.location.search).get('item');

  if (!contextValue || !productId) {
    document.getElementById('productPage').innerHTML = `
      <div class="zm-product-missing">
        <h1>Product details unavailable</h1>
        <p>Please return to a collection and select a product again.</p>
        <a href="Index.html">Back to the store</a>
      </div>`;
    document.getElementById('browseSection').hidden = true;
    document.getElementById('relatedSection').hidden = true;
    return;
  }

  let context;
  try {
    context = JSON.parse(contextValue);
  } catch (error) {
    console.error('Unable to read the selected product details.', error);
    document.getElementById('productPage').textContent = 'Product details could not be loaded. Please return to a collection and try again.';
    document.getElementById('browseSection').hidden = true;
    document.getElementById('relatedSection').hidden = true;
    return;
  }

  const product = context.items?.find(item => item.id === productId);
  if (!product || !product.image) {
    document.getElementById('productPage').textContent = 'This product is no longer available. Please choose another item from the collection.';
    document.getElementById('browseSection').hidden = true;
    document.getElementById('relatedSection').hidden = true;
    return;
  }

  const image = document.getElementById('pdpMainImg');
  image.src = product.image;
  image.alt = product.title;
  document.getElementById('pdpTitle').textContent = product.title;
  document.getElementById('pdpSub').textContent = product.sub;
  document.getElementById('pdpPrice').textContent = product.price;
  document.getElementById('productCollection').textContent = context.collectionName;
  document.title = `${product.title} | ZM Collective`;

  const collectionLink = context.collectionUrl || 'Index.html';
  const productBackLink = document.getElementById('productBackLink');
  if (productBackLink) productBackLink.href = collectionLink;
  const getProductGroup = item => {
    const text = `${item.title} ${item.sub}`;
    const category = item.category?.toLocaleLowerCase() || '';

    if (category === 'footwear' || /shoe|trainer|sneaker|footwear|sandal|heel|boot|runner|campus/i.test(text)) return 'Footwear';
    if (category === 'accessories' || /watch|backpack|belt|cap|hat|sunglasses|wallet|socks|jewellery|jewelry|necklace|tie|bag/i.test(text)) return 'Accessories';
    if (category === 'jerseys' || /jersey|football kit|national team kit/i.test(text)) return 'Football Jerseys';
    if (/shirt|tee|hoodie|jacket|clothing|apparel|trouser|pants/i.test(text)) return 'Apparel';
    return context.collectionName;
  };
  const productGroup = getProductGroup(product);
  const itemIsFootwear = productGroup === 'Footwear';
  const itemIsAccessory = productGroup === 'Accessories';
  const itemIsJersey = productGroup === 'Football Jerseys';
  const itemIsApparel = productGroup === 'Apparel';
  const descriptionByGroup = {
    Footwear: `${product.title} is selected from the footwear collection. Explore the product image, choose your shoe size, and add it to your bag.`,
    Accessories: `${product.title} is selected from the accessories collection. Check the product image and add this finishing touch to your bag.`,
    'Football Jerseys': `${product.title} is selected from the football jersey collection. Choose your fit and add your match-day favourite to your bag.`,
    Apparel: `${product.title} is selected from the apparel collection. Choose your size and add this style to your bag.`
  };
  document.getElementById('pdpDescription').textContent = descriptionByGroup[productGroup]
    || `${product.title}, selected from the ${context.collectionName} collection. Explore the details and choose your option before adding it to your bag.`;

  const options = itemIsFootwear
    ? ['6', '7', '8', '9', '10', '11']
    : itemIsApparel || itemIsJersey
      ? ['S', 'M', 'L', 'XL', 'XXL']
      : ['One Size'];
  const optionTitle = document.getElementById('productOptionTitle');
  const optionGrid = document.getElementById('productOptions');
  const optionNote = document.getElementById('productOptionNote');
  optionTitle.textContent = itemIsFootwear
    ? 'Select Shoe Size'
    : itemIsApparel || itemIsJersey
      ? 'Select Size'
      : itemIsAccessory
        ? 'Select Option'
        : 'Product option';
  optionNote.textContent = itemIsFootwear ? 'US sizing' : '';

  options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = `pdp-size${index === 0 ? ' active' : ''}`;
    button.type = 'button';
    button.textContent = option;
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      optionGrid.querySelectorAll('.pdp-size').forEach(sizeButton => {
        sizeButton.classList.remove('active');
        sizeButton.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
    });
    optionGrid.appendChild(button);
  });

  const allRecommendations = context.items.filter(item => item.id !== product.id
    && item.image
    && getProductGroup(item) === productGroup);
  const imageKey = value => value.split(/[\\/]/).pop().toLocaleLowerCase();
  const uniqueRecommendations = [];
  const usedImages = new Set([imageKey(product.image)]);
  allRecommendations.forEach(item => {
    const key = imageKey(item.image);
    if (!usedImages.has(key)) {
      usedImages.add(key);
      uniqueRecommendations.push(item);
    }
  });

  const browseItems = uniqueRecommendations.slice(0, 3);
  const youMayLikeItems = uniqueRecommendations.slice(3, 9);
  const productLabel = context.collectionName || 'Collection';
  document.getElementById('browseRelatedTitle').textContent = `Browse More ${productGroup}`;
  document.getElementById('browseIntro').textContent = `More ${productGroup.toLocaleLowerCase()} from the ${productLabel} collection, each with its own product image and details.`;

  const createProductCard = (item, className) => {
    const card = document.createElement('a');
    card.className = className;
    card.href = `Product.html?item=${encodeURIComponent(item.id)}`;

    const imageContainer = document.createElement('div');
    imageContainer.className = className === 'bj-card' ? 'bj-card-image' : 'ymal-card-image';
    const cardImage = document.createElement('img');
    cardImage.src = item.image;
    cardImage.alt = item.title;
    imageContainer.appendChild(cardImage);
    card.appendChild(imageContainer);

    const brand = document.createElement('span');
    brand.className = 'plp-brand';
    brand.textContent = 'ZM Collective';
    card.appendChild(brand);

    const title = document.createElement('h3');
    title.textContent = item.title;
    card.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.className = className === 'bj-card' ? 'bj-sub' : 'ymal-sub';
    subtitle.textContent = item.sub;
    card.appendChild(subtitle);

    const price = document.createElement('p');
    price.className = className === 'bj-card' ? 'bj-price' : 'ymal-price';
    price.textContent = item.price;
    card.appendChild(price);
    return card;
  };

  const browseGrid = document.getElementById('browseRelatedGrid');
  browseItems.forEach(item => browseGrid.appendChild(createProductCard(item, 'bj-card')));

  const browseMore = document.createElement('a');
  browseMore.className = 'bj-browse-more';
  browseMore.href = collectionLink;
  browseMore.innerHTML = '<span class="bj-browse-text"><span class="bj-browse-kicker">THE FULL COLLECTION</span><span class="bj-browse-title">Browse more<br>items</span><span class="browse-arrow" aria-hidden="true">&#10095;</span></span>';
  browseGrid.appendChild(browseMore);

  const relatedSection = document.getElementById('relatedSection');
  if (!youMayLikeItems.length) {
    relatedSection.hidden = true;
  } else {
    const relatedTitle = document.getElementById('relatedTitle');
    relatedTitle.textContent = `More ${productGroup} to Explore`;
    const track = document.getElementById('ymalTrack');
    youMayLikeItems.forEach(item => track.appendChild(createProductCard(item, 'ymal-card')));

    const scrollTrack = distance => track.scrollBy({ left: distance, behavior: 'smooth' });
    document.querySelector('.ymal-prev').addEventListener('click', () => scrollTrack(-track.clientWidth * 0.8));
    document.querySelector('.ymal-next').addEventListener('click', () => scrollTrack(track.clientWidth * 0.8));
  }

  document.getElementById('addProductToBag').addEventListener('click', () => {
    const selectedOption = optionGrid.querySelector('.pdp-size.active');
    if (!selectedOption) {
      document.getElementById('productError').textContent = 'Choose an option before adding this item to your bag.';
      return;
    }

    const price = Number.parseFloat(product.price.replace(/[^\d.]/g, ''));
    if (!Number.isFinite(price)) {
      document.getElementById('productError').textContent = 'The price for this product is unavailable. Please choose another item.';
      return;
    }

    zmAddToCart({
      key: product.id,
      title: product.title,
      price,
      size: selectedOption.textContent,
      qty: 1,
      img: image.getAttribute('src')
    });
    window.location.assign('bag.html');
  });
});
