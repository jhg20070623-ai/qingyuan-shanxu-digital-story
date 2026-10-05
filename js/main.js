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

  const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-nav a[href^="#"]')];
  const navSections = [...new Set([...navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean), document.querySelector("#story")].filter(Boolean))]
    .sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
  const setActiveNav = (target) => navLinks.forEach((link) => {
    if (link.getAttribute("href") === target) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  const updateActiveNav = () => {
    if (!navSections.length) return;
    const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height || 0;
    const marker = headerHeight + Math.min(120, innerHeight * .2);
    const section = [...navSections].reverse().find((item) => item.getBoundingClientRect().top <= marker) || navSections[0];
    setActiveNav(section.id === "story" ? "#smart-experience" : `#${section.id}`);
  };
  let navFrame = 0;
  window.addEventListener("scroll", () => {
    if (navFrame) return;
    navFrame = requestAnimationFrame(() => { navFrame = 0; updateActiveNav(); });
  }, { passive: true });
  navLinks.forEach((link) => link.addEventListener("click", () => setActiveNav(link.getAttribute("href"))));
  updateActiveNav();

  const shopLink = document.querySelector("[data-shop-url-link]");
  const shopUrl = window.QINGYUAN_CONFIG?.shopUrl;
  if (shopLink && typeof shopUrl === "string") {
    try {
      const parsed = new URL(shopUrl);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        shopLink.href = parsed.href;
        shopLink.hidden = false;
      }
    } catch { /* A QR image alone does not provide a web URL. */ }
  }

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
