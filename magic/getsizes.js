window.addEventListener('load', async function () {
  const container = document.querySelector('.size-options');

  try {
    const response = await fetch('https://custom-apis.vercel.app/api/airtable_getsizes');
    const data = await response.json();

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
        p.textContent = `${parseFloat(price).toFixed(2)} лв`;

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
                window.formData.price = parseFloat(option.getAttribute('data-price'));
                hideError(sizeError);
            });
        });


});
