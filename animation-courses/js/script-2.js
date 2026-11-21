// ===== Custom campus video (no native controls) =====
(function () {
  const wrap = document.getElementById("campusVideoWrap");
  const video = document.getElementById("campusVideo");
  const playBtn = document.getElementById("campusPlay");
  const timeEl = document.getElementById("campusTime");
  if (!wrap || !video || !playBtn) return;

  const fmt = (s) => {
    s = Math.max(0, Math.round(s));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  };

  video.addEventListener("loadedmetadata", () => {
    if (timeEl && isFinite(video.duration)) timeEl.textContent = fmt(video.duration);
  });

  // countdown while playing
  video.addEventListener("timeupdate", () => {
    if (timeEl && isFinite(video.duration)) {
      timeEl.textContent = fmt(video.duration - video.currentTime);
    }
  });

  const play = () => {
    video.play();
    wrap.classList.add("is-playing");
  };
  const pause = () => {
    video.pause();
    wrap.classList.remove("is-playing");
  };

  playBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    play();
  });

  // click on the video itself pauses it (brings the button back)
  wrap.addEventListener("click", () => {
    if (!video.paused) pause();
  });

  video.addEventListener("ended", () => {
    wrap.classList.remove("is-playing");
    video.currentTime = 0;
    if (timeEl && isFinite(video.duration)) timeEl.textContent = fmt(video.duration);
  });

  // pause when the user scrolls away from the section
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting && !video.paused) pause();
        });
      },
      { threshold: 0.25 }
    ).observe(wrap);
  }
})();

// ===== Career list: click sets active (hover is handled in CSS) =====
(function () {
  const items = document.querySelectorAll("#careerList .career-item");
  items.forEach((item) => {
    item.addEventListener("click", () => {
      items.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
    });
  });
}
)();// ===== Testimonials: Swiper + custom video =====
(function () {
  const sliderEl = document.querySelector(".tm-swiper");
  if (!sliderEl || typeof Swiper === "undefined") return;

  const cards = sliderEl.querySelectorAll(".tm-card");

  const fmt = (s) => {
    s = Math.max(0, Math.round(s));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  };

  const pauseAll = (except) => {
    cards.forEach((c) => {
      if (c === except) return;
      const v = c.querySelector("video");
      if (!v.paused) v.pause();
      c.classList.remove("is-playing");
    });
  };

  // pause autoplay while a video is playing, resume when it ends/stops
  const pauseAutoplay = () => {
    const s = sliderEl.swiper;
    if (s && s.autoplay) s.autoplay.stop();
  };
  const resumeAutoplay = () => {
    const s = sliderEl.swiper;
    if (s && s.autoplay) s.autoplay.start();
  };

  cards.forEach((card) => {
    const video = card.querySelector("video");
    const time = card.querySelector(".tm-time");

    video.addEventListener("loadedmetadata", () => {
      if (isFinite(video.duration)) time.textContent = fmt(video.duration);
    });
    video.addEventListener("timeupdate", () => {
      if (isFinite(video.duration)) time.textContent = fmt(video.duration - video.currentTime);
    });
    video.addEventListener("ended", () => {
      card.classList.remove("is-playing");
      video.currentTime = 0;
      time.textContent = fmt(video.duration);
      resumeAutoplay();
    });

    card.addEventListener("click", () => {
      if (video.paused) {
        pauseAll(card); // only one video plays at a time
        video.play();
        card.classList.add("is-playing");
        pauseAutoplay();
      } else {
        video.pause();
        card.classList.remove("is-playing");
        resumeAutoplay();
      }
    });
  });

  new Swiper(sliderEl, {
    slidesPerView: 1.12, // mobile: 1 card + a peek of the next
    spaceBetween: 14,
    speed: 600,
    loop: true,
    grabCursor: true,
    autoplay: {
      delay: 4000, // 4s between slides
      disableOnInteraction: false, // keep autoplaying after user swipes/clicks
      pauseOnMouseEnter: true, // pause when hovering (let them watch the video)
    },
    navigation: {
      prevEl: ".tm-prev",
      nextEl: ".tm-next",
    },
    pagination: {
      el: ".tm-pagination",
      clickable: true,
    },
    breakpoints: {
      576: { slidesPerView: 1.5, spaceBetween: 18 },
      768: { slidesPerView: 2, spaceBetween: 20 },
      992: { slidesPerView: 3, spaceBetween: 24 }, // default desktop: 3 videos
    },
    on: {
      slideChange: () => {
        pauseAll(null); // pause when sliding away
        resumeAutoplay(); // make sure autoplay keeps running after manual nav
      },
    },
  });
})();

// ===== Partners: seamless infinite logo marquee =====
(function () {
  const rows = document.querySelectorAll(".logo-row");
  if (!rows.length) return;

  const SPEED = 55; // px per second (lower = slower)

  const build = (row) => {
    const track = row.querySelector(".logo-track");
    const group = track.querySelector(".logo-group");

    // reset (in case of resize)
    track.querySelectorAll(".logo-group[data-clone]").forEach((g) => g.remove());
    group.querySelectorAll("[data-repeat]").forEach((el) => el.remove());

    const originals = Array.from(group.children);
    const needed = row.clientWidth * 1.2;

    // repeat tiles inside the group until one group is wider than the row
    let guard = 0;
    while (group.scrollWidth < needed && guard < 20) {
      originals.forEach((el) => {
        const c = el.cloneNode(true);
        c.setAttribute("data-repeat", "");
        c.setAttribute("aria-hidden", "true");
        group.appendChild(c);
      });
      guard++;
    }

    // one identical copy of the group => translateX(-50%) loops with no jump
    const clone = group.cloneNode(true);
    clone.setAttribute("data-clone", "");
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);

    track.style.setProperty("--dur", group.scrollWidth / SPEED + "s");
  };

  const init = () => rows.forEach(build);

  if (document.readyState === "complete") init();
  else window.addEventListener("load", init);

  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(init, 250);
  });
})();