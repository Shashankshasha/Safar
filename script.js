document.getElementById("year").textContent = new Date().getFullYear();

(function () {
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const ZOOM_FACTOR = 2.4;

  document.querySelectorAll(".product-gallery").forEach((gallery) => {
    const mainWrap = gallery.querySelector(".gallery-main");
    const mainImg = gallery.querySelector(".gallery-main-img");
    const pane = gallery.querySelector(".gallery-zoom-pane");
    const thumbs = gallery.querySelectorAll(".gallery-thumb");

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        thumbs.forEach((t) => t.classList.remove("active"));
        thumb.classList.add("active");
        mainImg.src = thumb.dataset.full;
        pane.style.backgroundImage = `url(${thumb.dataset.full})`;
      });
    });

    if (!canHover || !mainWrap || !pane) return;

    pane.style.backgroundImage = `url(${mainImg.src})`;

    mainWrap.addEventListener("mouseenter", () => {
      mainWrap.classList.add("zoom-active");
    });

    mainWrap.addEventListener("mouseleave", () => {
      mainWrap.classList.remove("zoom-active");
    });

    mainWrap.addEventListener("mousemove", (event) => {
      const rect = mainImg.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      pane.style.backgroundSize = `${rect.width * ZOOM_FACTOR}px ${rect.height * ZOOM_FACTOR}px`;
      pane.style.backgroundPosition = `${x * 100}% ${y * 100}%`;
    });
  });
})();
