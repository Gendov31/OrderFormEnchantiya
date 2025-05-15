document.getElementById("generatePreview").addEventListener("click", async () => {
  const sliderContainer = document.getElementById("reviewsSlider");
  const container = document.getElementById('testimonialWrapper');

  // Show the slider
  sliderContainer.style.display = "block";

  // Check if already loaded
  if (sliderContainer.dataset.loaded === "true") return;

  try {
    const response = await fetch('https://custom-apis.vercel.app/api/airtable_getreviews'); // your actual API
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const testimonials = data.list;

    testimonials.forEach(t => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.innerHTML = `
        <h4>${t.name} <span style="font-weight:normal; color:gray;">${t.username}</span></h4>
        <p>${t.text}</p>
      `;
      container.appendChild(slide);
    });

    new Swiper('.testimonial-slider', {
      slidesPerView: 'auto',
      spaceBetween: 16,
      grabCursor: true,
    });

    // Mark as loaded after a tiny delay for safety
    setTimeout(() => sliderContainer.setAttribute("data-loaded", "true"), 50);
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
});