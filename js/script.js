// ===================== STUDENT WORK SLIDER =====================
document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("swTrack");
  if (!track) return;

  const viewport = track.parentElement;
  const cards = Array.from(track.children);
  const prevBtn = document.getElementById("swPrev");
  const nextBtn = document.getElementById("swNext");
  const pills = document.querySelectorAll(".sw-pill");
  let index = 0;

  const getGap = () => parseFloat(getComputedStyle(track).columnGap) || 0;
  const getVisible = () => {
    const w = cards[0].offsetWidth;
    return Math.max(
      1,
      Math.round((viewport.clientWidth + getGap()) / (w + getGap())),
    );
  };
  const getMax = () => Math.max(0, cards.length - getVisible());

  // ---------- Slider ----------
  function update() {
    const max = getMax();
    index = Math.min(Math.max(index, 0), max);
    const step = cards[0].offsetWidth + getGap();
    track.style.transform = `translateX(${-index * step}px)`;
    pills.forEach((p) =>
      p.classList.toggle("active", Number(p.dataset.go) === index),
    );
  }

  // Move ONE card at a time (loops at the ends)
  nextBtn.addEventListener("click", () => {
    index = index >= getMax() ? 0 : index + 1;
    update();
  });
  prevBtn.addEventListener("click", () => {
    index = index <= 0 ? getMax() : index - 1;
    update();
  });

  // Pills are decorative / clickable but do not navigate the slider

  // Touch swipe
  let startX = 0;
  viewport.addEventListener(
    "touchstart",
    (e) => (startX = e.touches[0].clientX),
    { passive: true },
  );
  viewport.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 50) (diff < 0 ? nextBtn : prevBtn).click();
  });

  window.addEventListener("resize", update);
  window.addEventListener("load", update);
  update();
});
