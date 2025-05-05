window.onload = async function () {
    const container = document.querySelector('.pose-scroll');
  
    try {
      const response = await fetch('https://custom-apis.vercel.app/api/airtable_getposes');
      const data = await response.json();
  
      data.forEach(item => {
        const name = item.fields?.Name || 'unknown';
        const prompt = item.fields?.Prompt || '';
        const imageUrl = item.fields?.Image?.[0]?.url || '';
  
        if (imageUrl) {
          const div = document.createElement('div');
          div.className = 'pose-option';
          div.dataset.pose = name;
  
          const img = document.createElement('img');
          img.src = imageUrl;
          img.dataset.prompt = prompt;
  
          div.appendChild(img);
          container.appendChild(div);
        }
      });
    } catch (error) {
      console.error('Error loading poses:', error);
    }

    const poseOptions = document.querySelectorAll('.pose-option');
    const poseError = document.getElementById('poseError');

    poseOptions.forEach(option => {
      option.addEventListener('click', () => {
          poseOptions.forEach(p => p.classList.remove('selected'));
          option.classList.add('selected');
          window.formData.pose = option.querySelector('img').dataset.prompt;
          hideError(poseError);
      });
  });

  };