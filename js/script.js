// ===================== STUDENT WORK SLIDER =====================
// Add to js/script.js
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

  // ---------- Videos (play inside the card) ----------
  const stopCard = (card) => {
    const v = card.querySelector(".sw-video");
    v.pause();
    v.controls = false;
    card.classList.remove("is-playing");
  };
  const stopAll = (except) =>
    cards.forEach((c) => {
      if (c !== except) stopCard(c);
    });

  cards.forEach((card) => {
    const video = card.querySelector(".sw-video");
    const playBtn = card.querySelector(".sw-play");

    const start = () => {
      stopAll(card); // only one video at a time
      card.classList.add("is-playing");
      video.controls = true;
      video.play().catch(() => { });
    };

    playBtn.addEventListener("click", start);
    // click anywhere on the card (before playing) also starts the video
    card.addEventListener("click", (e) => {
      if (
        !card.classList.contains("is-playing") &&
        !e.target.closest(".sw-play")
      )
        start();
    });

    // when video finishes, go back to the poster state
    video.addEventListener("ended", () => stopCard(card));
  });

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
    stopAll();
    index = index >= getMax() ? 0 : index + 1;
    update();
  });
  prevBtn.addEventListener("click", () => {
    stopAll();
    index = index <= 0 ? getMax() : index - 1;
    update();
  });

  // Category pills jump to that video
  pills.forEach((p) =>
    p.addEventListener("click", () => {
      stopAll();
      index = Number(p.dataset.go);
      update();
    }),
  );

  // Touch swipe (ignored while a video is playing so seek bar still works)
  let startX = 0;
  viewport.addEventListener(
    "touchstart",
    (e) => (startX = e.touches[0].clientX),
    { passive: true },
  );
  viewport.addEventListener("touchend", (e) => {
    if (track.querySelector(".is-playing")) return;
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 50) (diff < 0 ? nextBtn : prevBtn).click();
  });

  window.addEventListener("resize", update);
  window.addEventListener("load", update);
  update();
});
