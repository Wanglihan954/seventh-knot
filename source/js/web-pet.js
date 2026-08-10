(() => {
  const PET_ID = "xiaolemi-pet";
  const POSITION_KEY = "xiaolemi-pet-position-v1";
  const states = {
    idle: { row: 0, frames: 7, interval: 620, loops: Infinity },
    wave: { row: 3, frames: 4, interval: 190, loops: 2 },
    reading: { row: 4, frames: 5, interval: 260, loops: 2 },
    review: { row: 8, frames: 6, interval: 230, loops: 2 },
  };
  const interactions = [
    ["wave", "你好呀，我是小蕾米～"],
    ["reading", "让我看看这篇文章……"],
    ["review", "嗯，正在认真检查！"],
    ["wave", "今天也要开心写博客哦。"],
  ];

  function mountPet() {
    if (document.getElementById(PET_ID)) return;

    const pet = document.createElement("aside");
    pet.id = PET_ID;
    pet.setAttribute("aria-label", "网页宠物小蕾米，可以点击互动或拖动位置");
    pet.innerHTML = `
      <div class="xiaolemi-pet__bubble" role="status" aria-live="polite"></div>
      <button class="xiaolemi-pet__actor" type="button" aria-label="和小蕾米互动" title="点击互动 · 拖动移动">
        <span class="xiaolemi-pet__sprite" aria-hidden="true"></span>
      </button>`;
    document.body.appendChild(pet);

    const actor = pet.querySelector(".xiaolemi-pet__actor");
    const sprite = pet.querySelector(".xiaolemi-pet__sprite");
    const bubble = pet.querySelector(".xiaolemi-pet__bubble");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationTimer = 0;
    let bubbleTimer = 0;
    let interactionIndex = 0;
    let suppressClickUntil = 0;
    let drag = null;

    function showFrame(row, column) {
      const x = (column / 7) * 100;
      const y = (row / 10) * 100;
      sprite.style.backgroundPosition = `${x}% ${y}%`;
    }

    function playState(name) {
      window.clearTimeout(animationTimer);
      const state = states[name] || states.idle;
      let frame = 0;
      let completedLoops = 0;
      showFrame(state.row, frame);
      if (reducedMotion.matches) return;

      const tick = () => {
        frame += 1;
        if (frame >= state.frames) {
          frame = 0;
          completedLoops += 1;
          if (completedLoops >= state.loops) {
            playState("idle");
            return;
          }
        }
        showFrame(state.row, frame);
        animationTimer = window.setTimeout(tick, state.interval);
      };
      animationTimer = window.setTimeout(tick, state.interval);
    }

    function speak(message) {
      window.clearTimeout(bubbleTimer);
      bubble.textContent = message;
      bubble.classList.add("is-visible");
      bubbleTimer = window.setTimeout(() => bubble.classList.remove("is-visible"), 2600);
    }

    function clampPosition(left, top) {
      const rect = pet.getBoundingClientRect();
      return {
        left: Math.max(4, Math.min(left, window.innerWidth - rect.width - 4)),
        top: Math.max(72, Math.min(top, window.innerHeight - rect.height - 4)),
      };
    }

    function savePosition() {
      try {
        const rect = pet.getBoundingClientRect();
        localStorage.setItem(POSITION_KEY, JSON.stringify({ left: rect.left, top: rect.top }));
      } catch (_) {
        // The pet still works when storage is unavailable.
      }
    }

    function restorePosition() {
      try {
        const saved = JSON.parse(localStorage.getItem(POSITION_KEY));
        if (!saved || !Number.isFinite(saved.left) || !Number.isFinite(saved.top)) return;
        const position = clampPosition(saved.left, saved.top);
        pet.style.left = `${position.left}px`;
        pet.style.top = `${position.top}px`;
        pet.style.right = "auto";
        pet.style.bottom = "auto";
      } catch (_) {
        // Ignore malformed or unavailable storage.
      }
    }

    actor.addEventListener("click", () => {
      if (Date.now() < suppressClickUntil) return;
      const [state, message] = interactions[interactionIndex % interactions.length];
      interactionIndex += 1;
      playState(state);
      speak(message);
    });

    actor.addEventListener("pointerdown", (event) => {
      const rect = pet.getBoundingClientRect();
      drag = {
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
      };
      actor.setPointerCapture(event.pointerId);
    });

    actor.addEventListener("pointermove", (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 4) {
        drag.moved = true;
        pet.classList.add("is-dragging");
      }
      if (!drag.moved) return;
      const position = clampPosition(event.clientX - drag.offsetX, event.clientY - drag.offsetY);
      pet.style.left = `${position.left}px`;
      pet.style.top = `${position.top}px`;
      pet.style.right = "auto";
      pet.style.bottom = "auto";
    });

    const finishDrag = (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (drag.moved) {
        suppressClickUntil = Date.now() + 250;
        savePosition();
      }
      pet.classList.remove("is-dragging");
      drag = null;
    };
    actor.addEventListener("pointerup", finishDrag);
    actor.addEventListener("pointercancel", finishDrag);

    window.addEventListener("resize", () => {
      if (!pet.style.left) return;
      const rect = pet.getBoundingClientRect();
      const position = clampPosition(rect.left, rect.top);
      pet.style.left = `${position.left}px`;
      pet.style.top = `${position.top}px`;
    });

    reducedMotion.addEventListener?.("change", () => playState("idle"));
    restorePosition();
    playState("idle");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountPet, { once: true });
  } else {
    mountPet();
  }
})();
