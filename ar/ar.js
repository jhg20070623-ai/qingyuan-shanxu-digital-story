(() => {
  const scanner = document.querySelector("[data-ar-scanner]");
  const forest = document.querySelector("[data-forest-experience]");
  const stage = document.querySelector("[data-ar-stage]");
  const scene = document.querySelector("#ar-scene");
  const target = document.querySelector("#giftbox-target");
  const startPanel = document.querySelector("[data-ar-start-panel]");
  const scanOverlay = document.querySelector("[data-ar-scan-overlay]");
  const status = document.querySelector("[data-ar-status]");
  const foundPanel = document.querySelector("[data-ar-found-panel]");
  const videoHud = document.querySelector("[data-ar-video-hud]");
  const toast = document.querySelector("[data-ar-toast]");
  const growthVideo = document.querySelector("#ar-growth-video");
  const videoPlane = document.querySelector("#ar-video-plane");
  const harvestVideo = document.querySelector("#ar-harvest-video");
  const harvestVideoPlane = document.querySelector("#ar-harvest-video-plane");
  const videoPlanes = [videoPlane, harvestVideoPlane].filter(Boolean);
  const visualLayers = [...(target?.querySelectorAll("a-plane") || [])];
  if (!scanner || !forest || !stage || !scene || !target) return;

  let arStarted = false;
  let hasFoundTarget = false;
  let fallbackTimer = 0;
  let toastTimer = 0;

  const setToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 4200);
  };

  const stopGrowthVideo = () => {
    growthVideo?.pause();
    harvestVideo?.pause();
    videoPlanes.forEach((plane) => plane.setAttribute("visible", "false"));
    visualLayers.forEach((layer) => layer.setAttribute("visible", "true"));
    if (videoHud) videoHud.hidden = true;
  };

  const showForest = (replaceUrl = true) => {
    window.clearTimeout(fallbackTimer);
    stopGrowthVideo();
    if (arStarted) {
      try { scene.systems["mindar-image-system"]?.stop(); } catch { /* camera may already be closed */ }
      arStarted = false;
    }
    scanner.hidden = true;
    forest.hidden = false;
    document.body.classList.add("is-forest-mode");
    if (replaceUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", "forest");
      window.history.replaceState({}, "", url);
    }
    requestAnimationFrame(updateParallax);
  };

  const showScanner = () => {
    forest.hidden = true;
    scanner.hidden = false;
    document.body.classList.remove("is-forest-mode");
    const url = new URL(window.location.href);
    url.searchParams.delete("mode");
    window.history.replaceState({}, "", url);
    if (startPanel) startPanel.hidden = false;
    if (scanOverlay) scanOverlay.hidden = true;
    if (foundPanel) foundPanel.hidden = true;
    if (status) status.textContent = "正在准备图像识别…";
  };

  function updateParallax() {
    const scenes = document.querySelectorAll("[data-parallax-scene]");
    const viewportHeight = window.innerHeight || 1;
    scenes.forEach((root) => {
      const bounds = root.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > viewportHeight) return;
      const progress = (viewportHeight - bounds.top) / (viewportHeight + bounds.height);
      root.querySelectorAll("[data-parallax-layer]").forEach((layer) => {
        const speed = layer.dataset.parallaxLayer === "plant" ? 28 : layer.dataset.parallaxLayer === "trees" ? 19 : 10;
        layer.style.setProperty("--parallax-shift", `${Math.round((progress - .45) * speed)}px`);
      });
    });
  }

  const armFallbackTimer = (delay, message) => {
    window.clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(() => {
      if (!hasFoundTarget) {
        setToast(message);
        window.setTimeout(() => showForest(), 1800);
      }
    }, delay);
  };

  const startAR = async () => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setToast("此浏览器无法调用相机，正在切换到清原山林沉浸模式。");
      window.setTimeout(() => showForest(), 1100);
      return;
    }
    const mindarSystem = scene.systems["mindar-image-system"];
    if (!window.AFRAME || !mindarSystem?.start) {
      setToast("相机识别组件未能载入，已为你打开沉浸模式。");
      window.setTimeout(() => showForest(), 1100);
      return;
    }

    if (startPanel) startPanel.hidden = true;
    if (scanOverlay) scanOverlay.hidden = false;
    if (foundPanel) foundPanel.hidden = true;
    if (status) status.textContent = "正在请求相机权限…";
    armFallbackTimer(42000, "暂未识别礼盒正面图案，已切换到沉浸模式。");
    try {
      await mindarSystem.start();
      arStarted = true;
      if (status && !hasFoundTarget) status.textContent = "请将镜头对准清原山序礼盒正面主视觉";
    } catch (error) {
      console.warn("AR camera startup failed", error);
      setToast("相机未能开启或权限未授权，已切换到清原山林沉浸模式。");
      window.clearTimeout(fallbackTimer);
      window.setTimeout(() => showForest(), 1300);
    }
  };

  const chooseARVideo = async (kind) => {
    const isHarvest = kind === "harvest";
    const path = isHarvest
      ? "../edited_videos/huangjing_harvest_ar_loop.mp4"
      : "../edited_videos/huangjing_growth_ar_loop.mp4";
    const activeVideo = isHarvest ? harvestVideo : growthVideo;
    const activePlane = isHarvest ? harvestVideoPlane : videoPlane;
    let source = "";
    try {
      const response = await fetch(path, { method: "HEAD", cache: "no-store" });
      if (response.ok) source = new URL(path, document.baseURI).href;
    } catch { /* report using the same non-tracking fallback */ }
    if (!source || !activeVideo || !activePlane) {
      setToast("企业影像待接入");
      return;
    }
    stopGrowthVideo();
    activeVideo.muted = true;
    activeVideo.playsInline = true;
    activeVideo.loop = true;
    const playOnReady = async () => {
      visualLayers.forEach((layer) => layer.setAttribute("visible", "false"));
      activePlane.setAttribute("visible", "true");
      if (videoHud) {
        videoHud.hidden = false;
        const message = videoHud.querySelector("[data-ar-video-message]");
        if (message) message.textContent = isHarvest ? "黄精采挖影像 · 静音循环" : "黄精生长影像 · 静音循环";
      }
      try { await activeVideo.play(); }
      catch {
        stopGrowthVideo();
        setToast("影像已载入，请轻触视频区域开始播放。");
      }
    };
    activeVideo.addEventListener("canplay", playOnReady, { once: true });
    activeVideo.addEventListener("error", () => {
      stopGrowthVideo();
      setToast("企业影像待接入");
    }, { once: true });
    if (activeVideo.readyState >= 2) playOnReady();
    else activeVideo.load();
  };

  document.querySelector("[data-ar-start]")?.addEventListener("click", startAR);
  document.querySelectorAll("[data-ar-fallback], [data-ar-explore]").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (button.matches("a")) event.preventDefault();
      showForest();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  document.querySelector("[data-ar-watch]")?.addEventListener("click", () => chooseARVideo("growth"));
  document.querySelector("[data-ar-watch-harvest]")?.addEventListener("click", () => chooseARVideo("harvest"));
  document.querySelector("[data-ar-video-close]")?.addEventListener("click", stopGrowthVideo);
  document.querySelector("[data-ar-fullscreen]")?.addEventListener("click", async () => {
    try {
      if (stage.requestFullscreen) await stage.requestFullscreen();
      else if (stage.webkitRequestFullscreen) stage.webkitRequestFullscreen();
    } catch { setToast("此浏览器暂不支持全屏模式。"); }
  });
  growthVideo?.addEventListener("ended", stopGrowthVideo);
  harvestVideo?.addEventListener("ended", stopGrowthVideo);

  target.addEventListener("targetFound", () => {
    hasFoundTarget = true;
    window.clearTimeout(fallbackTimer);
    if (scanOverlay) scanOverlay.hidden = true;
    if (foundPanel) foundPanel.hidden = false;
    if (status) status.textContent = "已识别礼盒正面";
    stopGrowthVideo();
  });
  target.addEventListener("targetLost", () => {
    hasFoundTarget = false;
    stopGrowthVideo();
    if (foundPanel) foundPanel.hidden = true;
    if (scanOverlay) scanOverlay.hidden = false;
    if (status) status.textContent = "礼盒暂时离开画面，请重新对准";
    armFallbackTimer(26000, "图案暂未重新识别，已切换到沉浸模式。");
  });
  scene.addEventListener("arError", (event) => {
    console.warn("MindAR reported an error", event.detail);
    setToast("相机或图像识别启动失败，正在进入沉浸模式。");
    window.clearTimeout(fallbackTimer);
    window.setTimeout(() => showForest(), 1000);
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get("mode") === "forest") showForest(false);
  else {
    scanner.hidden = false;
    forest.hidden = true;
    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax, { passive: true });
  }
})();
