(() => {
  const config = window.QINGYUAN_CONFIG || {};

  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector("#mobile-nav");
  const setMenuOpen = (open) => {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    mobileNav.hidden = !open;
  };
  menuButton?.addEventListener("click", () => setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true"));
  mobileNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenuOpen(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

  const sachets = [
    { theme: "黄精根茎组", description: "以黄精根茎形态作为画面中心，呈现本系列的核心视觉元素。" },
    { theme: "黄精根茎组", description: "延续根茎主题，以同一组图形语言形成礼盒内的系列节奏。" },
    { theme: "山林组", description: "以山脉与森林层次构成画面，让地域意象在独立包装中延展。" },
    { theme: "山林组", description: "延续山林主题，在同一视觉系统中呈现另一款系列包装。" },
    { theme: "植物组", description: "以黄精植物轮廓为主要图形，呈现植物形态的版画表达。" },
    { theme: "植物组", description: "延续植物主题，与前五袋共同构成完整的六袋视觉序列。" }
  ];
  const cards = [...document.querySelectorAll(".sachet-card")];
  const track = document.querySelector(".sachet-track");
  const detailIndex = document.querySelector(".sachet-detail-index");
  const detailHeading = document.querySelector(".sachet-detail h3");
  const detailCopy = document.querySelector(".sachet-detail div p");
  const selectSachet = (index, scroll = false) => {
    const safeIndex = (index + cards.length) % cards.length;
    cards.forEach((card, cardIndex) => {
      const selected = cardIndex === safeIndex;
      card.classList.toggle("is-selected", selected);
      card.setAttribute("aria-pressed", String(selected));
    });
    if (detailIndex) detailIndex.innerHTML = `${String(safeIndex + 1).padStart(2, "0")} <span>/ 06</span>`;
    if (detailHeading) detailHeading.textContent = sachets[safeIndex].theme;
    if (detailCopy) detailCopy.textContent = sachets[safeIndex].description;
    if (scroll && cards[safeIndex]) cards[safeIndex].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };
  cards.forEach((card, index) => {
    card.addEventListener("click", () => selectSachet(index));
    card.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") { event.preventDefault(); selectSachet(index + 1, true); cards[(index + 1) % cards.length]?.focus(); }
      if (event.key === "ArrowLeft") { event.preventDefault(); selectSachet(index - 1, true); cards[(index - 1 + cards.length) % cards.length]?.focus(); }
    });
  });
  document.querySelectorAll(".carousel-arrow").forEach((button) => {
    button.addEventListener("click", () => {
      const activeIndex = Math.max(0, cards.findIndex((card) => card.classList.contains("is-selected")));
      const direction = button.dataset.direction === "next" ? 1 : -1;
      selectSachet(activeIndex + direction, true);
    });
  });

  const boxTabs = [...document.querySelectorAll(".box-tab")];
  const boxImages = [...document.querySelectorAll(".box-image")];
  const boxCaption = document.querySelector(".box-caption");
  const boxCaptions = {
    closed: "闭合礼盒 · 书型结构设计效果",
    open: "开启礼盒 · 六袋独立包装与内托设计效果"
  };
  boxTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const view = tab.dataset.view;
      boxTabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      boxImages.forEach((image) => {
        const active = image.dataset.boxImage === view;
        image.hidden = !active;
        image.classList.toggle("is-visible", active);
      });
      if (boxCaption) boxCaption.textContent = boxCaptions[view];
    });
  });

  const brandLinks = {
    brand: config.brandUrl || "",
    shop: config.shopUrl || ""
  };
  document.querySelectorAll("[data-brand-link]").forEach((link) => {
    const url = brandLinks[link.dataset.brandLink];
    if (url) {
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.removeAttribute("aria-disabled");
    } else {
      link.href = "#brand";
      link.setAttribute("aria-disabled", "true");
    }
  });

  const sections = document.querySelectorAll(".section-heading, .origin-content, .plant-layout, .timeline, .sachet-detail, .box-stage, .green-layout, .digital-flow, .brand-panel");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in-view");
          activeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -20px 0px" });
    sections.forEach((element) => {
      element.classList.add("reveal");
      observer.observe(element);
    });
  }

  document.title = config.projectTitle || document.title;
})();
