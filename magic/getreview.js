document.getElementById("generatePreview").addEventListener("click", () => {
    const sliderContainer = document.getElementById("reviewsSlider");
  
    // Покажи слайдъра
    sliderContainer.style.display = "block";
setTimeout(() => sliderContainer.setAttribute("data-loaded", "true"), 50);
  
    // Зареди мнения само веднъж (ако вече не са заредени)
    if (!sliderContainer.dataset.loaded) {
      const testimonials = [
        {
          name: "Станислава",
          handle: "@stani_stan",
          text: "Не знам как го направихте, но като си видях фигурката... направо ми падна ченето 😂 1:1 с мен е! Супер сте!"
        },
        {
          name: "Георги",
          handle: "@Georgi95",
          text: "Поръчах го като подарък за гаджето ми и честно казано мислех че ще е нещо пластмасово и тъпо... ама като го видях на живо... Брутално!"
        },
        {
          name: "Ива",
          handle: "@ivaaaaaaa",
          text: "Това е най-якия подарък който съм правила!! Той още не вярва че са го направили по снимка 😂"
        }
      ];
  
      const container = document.getElementById('testimonialWrapper');
  
      testimonials.forEach(t => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `
          <h4>${t.name} <span style="font-weight:normal; color:gray;">${t.handle}</span></h4>
          <p>${t.text}</p>
        `;
        container.appendChild(slide);
      });
  
      new Swiper('.testimonial-slider', {
        slidesPerView: 'auto',
        spaceBetween: 16,
        grabCursor: true,
      });
  
      // Бележим, че е зареден
      sliderContainer.dataset.loaded = "true";
    }
  });