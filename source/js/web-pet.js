(() => {
  const PET_ID = "xiaolemi-pet";
  const POSITION_KEY = "xiaolemi-pet-position-v1";
  const SETTINGS_KEY = "xiaolemi-pet-settings-v1";
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
      <button class="xiaolemi-pet__actor" type="button" aria-label="和小蕾米互动" title="点击互动 · 拖动或方向键移动">
        <span class="xiaolemi-pet__sprite" aria-hidden="true"></span>
      </button>
      <button class="xiaolemi-pet__menu" type="button" aria-label="宠物设置" aria-expanded="false" aria-controls="xiaolemi-pet-tools">···</button>
      <div class="xiaolemi-pet__tools" id="xiaolemi-pet-tools" hidden>
        <button type="button" data-action="pause" aria-pressed="false">暂停动画</button>
        <button type="button" data-action="reset">位置复原</button>
        <button type="button" data-action="minimize">收起宠物</button>
      </div>
      <button class="xiaolemi-pet__restore" type="button" hidden aria-label="展开小蕾米">小蕾米 <span aria-hidden="true">↗</span></button>`;
    document.body.appendChild(pet);

    const actor = pet.querySelector(".xiaolemi-pet__actor");
    const sprite = pet.querySelector(".xiaolemi-pet__sprite");
    const bubble = pet.querySelector(".xiaolemi-pet__bubble");
    const menu = pet.querySelector(".xiaolemi-pet__menu");
    const tools = pet.querySelector(".xiaolemi-pet__tools");
    const pauseButton = tools.querySelector('[data-action="pause"]');
    const restore = pet.querySelector(".xiaolemi-pet__restore");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationTimer = 0;
    let bubbleTimer = 0;
    let interactionIndex = 0;
    let suppressClickUntil = 0;
    let drag = null;
    let paused = false;
    let minimized = false;
    let inView = true;

    function closeMenu() {
      tools.hidden = true;
      menu.setAttribute("aria-expanded", "false");
    }

    function saveSettings() {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ paused, minimized }));
      } catch (_) { /* Storage is optional. */ }
    }

    function applySettings() {
      pet.classList.toggle("is-paused", paused || reducedMotion.matches);
      pet.classList.toggle("is-minimized", minimized);
      actor.hidden = minimized;
      menu.hidden = minimized;
      restore.hidden = !minimized;
      pauseButton.textContent = paused ? "继续动画" : "暂停动画";
      pauseButton.setAttribute("aria-pressed", String(paused));
      closeMenu();
      bubble.classList.remove("is-visible");
      playState("idle");
    }

    function placeBubble() {
      const rect = pet.getBoundingClientRect();
      const width = bubble.offsetWidth;
      const height = bubble.offsetHeight;
      bubble.style.left = `${Math.max(8 - rect.left, Math.min((rect.width - width) / 2, window.innerWidth - 8 - width - rect.left))}px`;
      bubble.style.top = `${rect.top >= height + 12 ? -height - 8 : rect.height + 8}px`;
    }

    function showFrame(row, column) {
      const x = (column / 7) * 100;
      const y = (row / 10) * 100;
      sprite.style.backgroundPosition = `${x}% ${y}%`;
    }

    function playState(name) {
      window.clearTimeout(animationTimer);
      pet.classList.toggle("is-inactive", document.hidden || !inView);
      const state = states[name] || states.idle;
      let frame = 0;
      let completedLoops = 0;
      showFrame(state.row, frame);
      if (reducedMotion.matches || paused || minimized || document.hidden || !inView) return;

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
      placeBubble();
      bubble.classList.add("is-visible");
      bubbleTimer = window.setTimeout(() => bubble.classList.remove("is-visible"), 2600);
    }

    function clampPosition(left, top) {
      const rect = pet.getBoundingClientRect();
      const maxTop = Math.max(4, window.innerHeight - rect.height - 4);
      return {
        left: Math.max(4, Math.min(left, window.innerWidth - rect.width - 4)),
        top: Math.max(Math.min(72, maxTop), Math.min(top, maxTop)),
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
      const heading = document.querySelector('h1.post-title[itemprop="name headline"]');
      const title = heading?.textContent.trim();
      speak(state === "reading" && title ? `一起读《${title.length > 32 ? `${title.slice(0, 32)}…` : title}》吧。` : message);
    });

    menu.addEventListener("click", () => {
      tools.hidden = !tools.hidden;
      menu.setAttribute("aria-expanded", String(!tools.hidden));
      const rect = pet.getBoundingClientRect();
      pet.classList.toggle("tools-below", rect.top < 150);
      pet.classList.toggle("tools-right", rect.left < 120);
    });
    tools.addEventListener("click", (event) => {
      const action = event.target.closest("button")?.dataset.action;
      if (!action) return;
      if (action === "pause") paused = !paused;
      if (action === "reset") {
        pet.style.left = pet.style.top = pet.style.right = pet.style.bottom = "";
        try { localStorage.removeItem(POSITION_KEY); } catch (_) { /* Storage is optional. */ }
      }
      if (action === "minimize") minimized = true;
      applySettings();
      saveSettings();
      (minimized ? restore : menu).focus();
    });
    restore.addEventListener("click", () => {
      minimized = false;
      applySettings();
      restorePosition();
      saveSettings();
      actor.focus();
    });
    document.addEventListener("pointerdown", (event) => {
      if (!pet.contains(event.target)) closeMenu();
    });
    pet.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { closeMenu(); menu.focus(); }
      if (event.target !== actor || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const rect = pet.getBoundingClientRect();
      const step = event.shiftKey ? 30 : 10;
      const position = clampPosition(rect.left + (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0), rect.top + (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0));
      pet.style.left = `${position.left}px`;
      pet.style.top = `${position.top}px`;
      pet.style.right = pet.style.bottom = "auto";
      placeBubble();
      savePosition();
    });

    actor.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      closeMenu();
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
      placeBubble();
    });

    const finishDrag = (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (drag.moved) {
        suppressClickUntil = Date.now() + 250;
        savePosition();
      }
      pet.classList.remove("is-dragging");
      drag = null;
      if (actor.hasPointerCapture(event.pointerId)) actor.releasePointerCapture(event.pointerId);
    };
    actor.addEventListener("pointerup", finishDrag);
    actor.addEventListener("pointercancel", finishDrag);
    actor.addEventListener("lostpointercapture", finishDrag);

    window.addEventListener("resize", () => {
      closeMenu();
      if (pet.style.left && !minimized) {
        const rect = pet.getBoundingClientRect();
        const position = clampPosition(rect.left, rect.top);
        pet.style.left = `${position.left}px`;
        pet.style.top = `${position.top}px`;
      }
      placeBubble();
    });

    reducedMotion.addEventListener?.("change", applySettings);
    document.addEventListener("visibilitychange", () => playState("idle"));
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        playState("idle");
      }).observe(pet);
    }
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      paused = saved?.paused === true;
      minimized = saved?.minimized === true;
    } catch (_) { /* Ignore malformed settings. */ }
    restorePosition();
    applySettings();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountPet, { once: true });
  } else {
    mountPet();
  }
})();
