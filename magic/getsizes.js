window.addEventListener('load', async function () {
  const container = document.querySelector('.size-options');

  // Function to get currency symbol based on language
  function getCurrencySymbol() {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang');
    
    switch(lang) {
      case 'de':
        return '€';
      case 'bg':
        return 'лв';
      default:
        return 'лв'; // Default to Bulgarian currency
    }
  }

  // Function to format price based on currency
  function formatPrice(price, currency) {
    const numPrice = parseFloat(price);
    return numPrice.toFixed(2);
  }

  try {
    const response = await fetch('https://custom-apis.vercel.app/api/airtable_getsizes');
    const data = await response.json();
    const currencySymbol = getCurrencySymbol();

    data.forEach(item => {
      const name = item.fields?.Name || '';
      const price = item.fields?.Price || '';
      const numericSize = name.replace(/\D/g, ''); // e.g., "10cm" → "10"

      if (name && price) {
        const div = document.createElement('div');
        div.className = 'size-option';
        div.dataset.size = numericSize;
        div.dataset.price = price;

        const h3 = document.createElement('h3');
        h3.textContent = name;

        const p = document.createElement('p');
        p.textContent = `${formatPrice(price, currencySymbol)} ${currencySymbol}`;

        div.appendChild(h3);
        div.appendChild(p);
        container.appendChild(div);
      }
    });
  } catch (err) {
    console.error('Error loading sizes:', err);
  }

  const sizeOptions = document.querySelectorAll('.size-option');
  const sizeError = document.getElementById('sizeError');

  sizeOptions.forEach(option => {
    option.addEventListener('click', () => {
      sizeOptions.forEach(s => s.classList.remove('selected'));
      option.classList.add('selected');
      window.formData.size = option.getAttribute('data-size');
      window.formData.price = Number(option.getAttribute('data-price'));
      if (sizeError) {
        sizeError.style.display = 'none';
      }
    });
  });
});
