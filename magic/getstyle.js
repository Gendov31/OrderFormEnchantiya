document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('.style-scroll');
  
    try {
      const response = await fetch('https://custom-apis.vercel.app/api/airtable_getstyle');
      const data = await response.json();
  
      data.forEach(item => {
        const name = item.name || 'unknown';
        const imageUrl = "http://noco.enchantiya.com/" + item.image || '';
  
        if (imageUrl) {
          const div = document.createElement('div');
          div.className = 'style-option';
          div.dataset.name = name;
  
          const img = document.createElement('img');
          img.src = imageUrl;
  
          div.appendChild(img);
          container.appendChild(div);
        }
      });
    } catch (error) {
      console.error('Error loading styles:', error);
    }

    const styleOptions = document.querySelectorAll('.style-option');
    const styleError = document.getElementById('styleError');

    styleOptions.forEach(option => {
      option.addEventListener('click', () => {
          styleOptions.forEach(p => p.classList.remove('selected'));
          option.classList.add('selected');
          window.formData.imgStyle = option.dataset.name;
          if (styleError) {
              styleError.style.display = 'none';
          }
      });
    });
});