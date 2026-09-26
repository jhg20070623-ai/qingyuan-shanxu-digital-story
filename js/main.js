(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector("#mobile-nav");
  const setMenuOpen = (open) => {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    mobileNav.hidden = !open;
  };

  menuButton?.addEventListener("click", () => {
    setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
  });
  mobileNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  const viewer = document.querySelector(".board-viewer");
  const viewerImage = document.querySelector(".viewer-image");
  const viewerTitle = document.querySelector("#viewer-title");
  const zoomOutput = document.querySelector(".zoom-level");
  let zoom = 1;

  const applyZoom = () => {
    if (!viewerImage?.naturalWidth) return;
    const width = Math.round(viewerImage.naturalWidth * zoom);
    viewerImage.style.width = `${width}px`;
    if (zoomOutput) zoomOutput.value = `${Math.round(zoom * 100)}%`;
  };

  document.querySelectorAll("[data-board-open]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!viewer || !viewerImage) return;
      const source = button.dataset.boardSrc;
      const image = button.querySelector("img");
      viewerImage.alt = image?.alt || button.dataset.boardOpen || "设计版面原图";
      viewerTitle.textContent = button.dataset.boardOpen || "设计版面原图";
      zoom = 1;
      viewerImage.style.width = "1491px";
      viewerImage.src = source;
      if (viewerImage.complete) applyZoom();
      else viewerImage.addEventListener("load", applyZoom, { once: true });
      viewer.querySelector(".viewer-canvas")?.scrollTo(0, 0);
      viewer.showModal();
    });
  });

  viewer?.querySelectorAll("[data-zoom]").forEach((button) => {
    button.addEventListener("click", () => {
      zoom = Math.max(.75, Math.min(2.5, zoom + (button.dataset.zoom === "in" ? .25 : -.25)));
      applyZoom();
    });
  });

  viewer?.querySelector("[data-viewer-close]")?.addEventListener("click", () => viewer.close());
  viewer?.addEventListener("click", (event) => {
    if (event.target === viewer) viewer.close();
  });
  document.title = window.QINGYUAN_CONFIG?.projectTitle || document.title;
})();
