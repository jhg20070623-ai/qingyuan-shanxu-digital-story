(() => {
  document.querySelectorAll("[data-story-video]").forEach((video) => {
    const card = video.closest(".video-story-card");
    const fallback = card?.querySelector("[data-video-fallback]");
    video.addEventListener("error", () => {
      if (fallback) fallback.hidden = false;
    });
    video.addEventListener("loadedmetadata", () => {
      if (fallback) fallback.hidden = true;
    });
  });

  document.querySelectorAll("[data-video-play]").forEach((button) => {
    button.addEventListener("click", async () => {
      const video = button.closest(".video-story-card")?.querySelector("[data-story-video]");
      if (!video) return;
      video.muted = true;
      try {
        await video.play();
        video.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch {
        const fallback = button.closest(".video-story-card")?.querySelector("[data-video-fallback]");
        if (fallback) { fallback.hidden = false; fallback.textContent = "企业原始影像待接入，请稍后重试。"; }
      }
    });
  });

  document.querySelectorAll("[data-story-chapter]").forEach((button) => {
    button.addEventListener("click", async () => {
      const story = button.dataset.storyChapter;
      const video = document.querySelector(`[data-story-video="${story}"]`);
      if (!video) return;

      document.querySelectorAll("[data-story-video]").forEach((item) => item.pause());
      document.querySelectorAll("[data-story-chapter]").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      video.muted = true;

      const playFromChapter = async () => {
        const duration = Number.isFinite(video.duration) ? video.duration : 0;
        const requested = Number(button.dataset.storyTime) || 0;
        video.currentTime = duration ? Math.min(requested, Math.max(0, duration - 0.25)) : requested;
        try {
          await video.play();
          video.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch {
          const fallback = video.closest(".video-story-card")?.querySelector("[data-video-fallback]");
          if (fallback) { fallback.hidden = false; fallback.textContent = "企业原始影像待接入，请稍后重试。"; }
        }
      };

      if (video.readyState >= 1) await playFromChapter();
      else video.addEventListener("loadedmetadata", playFromChapter, { once: true });
    });
  });
})();
