(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.innerWidth < 768;

  // === ENTRANCE CHOREOGRAPHY ===
  function runEntranceSequence() {
    if (prefersReducedMotion) {
      document.querySelectorAll(".entrance-element").forEach(el => el.classList.add("entrance-complete"));
      return;
    }

    const sequence = [
      { selector: ".site-header", delay: 0, class: "entrance-complete" },
      { selector: ".portrait-frame", delay: 100, class: "entrance-complete" },
      { selector: ".eyebrow", delay: 200, class: "entrance-complete" },
      { selector: "h1", delay: 280, class: "entrance-complete" },
      { selector: ".role", delay: 360, class: "entrance-complete" },
      { selector: ".intro", delay: 440, class: "entrance-complete" },
      { selector: ".button-primary", delay: 520, class: "entrance-complete" },
      { selector: ".button-share", delay: 580, class: "entrance-complete" },
      { selector: ".contact-hint", delay: 640, class: "entrance-complete" },
      { selector: ".section-heading", delay: 700, class: "entrance-complete" },
      { selector: ".section-description", delay: 760, class: "entrance-complete" },
    ];

    sequence.forEach(({ selector, delay, class: className }) => {
      const el = document.querySelector(selector);
      if (el) {
        setTimeout(() => el.classList.add(className), delay);
      }
    });

    // Staggered social cards
    const socialCards = document.querySelectorAll(".contact-link");
    socialCards.forEach((card, i) => {
      setTimeout(() => card.classList.add("entrance-complete"), 780 + i * 80);
    });

    // Resume card
    const resumeCard = document.querySelector(".resume-card");
    if (resumeCard) {
      setTimeout(() => resumeCard.classList.add("entrance-complete"), 1260);
    }
  }

  // === CURSOR SPOTLIGHT ===
  function initCursorSpotlight() {
    if (prefersReducedMotion || isMobile) return;

    const spotlight = document.querySelector(".cursor-spotlight");
    if (!spotlight) return;

    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    let rafId = null;

    function animate() {
      currentX += (mouseX - currentX) * 0.12;
      currentY += (mouseY - currentY) * 0.12;
      spotlight.style.transform = `translate(${currentX - 200}px, ${currentY - 200}px)`;
      rafId = requestAnimationFrame(animate);
    }

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      spotlight.classList.add("active");
      if (!rafId) animate();
    });

    document.addEventListener("mouseleave", () => {
      spotlight.classList.remove("active");
    });
  }

  // === 3D TILT EFFECT ON CARDS ===
  function init3DTilt() {
    if (prefersReducedMotion || isMobile) return;

    const cards = document.querySelectorAll(".contact-link");
    cards.forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.015)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  // === SHARE / QR FUNCTIONALITY ===
  function initShareButton() {
    const shareBtn = document.getElementById("share-btn");
    if (!shareBtn) return;

    shareBtn.addEventListener("click", async () => {
      const url = window.location.href;
      const title = "Simeon Sengco III | Digital Contact Card";
      const text = "Save my contact and connect with me.";

      if (navigator.share && navigator.canShare({ title, text, url })) {
        try {
          await navigator.share({ title, text, url });
        } catch (err) {
          if (err.name !== "AbortError") showToast("Share cancelled");
        }
        return;
      }

      // Fallback: copy to clipboard and show QR instruction
      try {
        await navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard!");
      } catch {
        showToast("Could not copy link");
      }
    });
  }

  // === TOAST NOTIFICATION ===
  function showToast(message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
        <span>${message}</span>
      `;
      document.body.appendChild(toast);
    } else {
      toast.querySelector("span").textContent = message;
    }

    // Force reflow then show
    toast.offsetHeight;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // === SAVE CONTACT WITH TOAST FEEDBACK ===
  function initSaveContact() {
    const saveButton = document.getElementById("save-contact");
    const status = document.getElementById("contact-status");

    saveButton?.addEventListener("click", (event) => {
      if (typeof Blob === "undefined" || !URL.createObjectURL) {
        return;
      }

      let objectUrl;
      let downloadLink;

      try {
        const file = new Blob([buildVCard()], {
          type: "text/vcard;charset=utf-8",
        });
        objectUrl = URL.createObjectURL(file);
        downloadLink = document.createElement("a");
        downloadLink.href = objectUrl;
        downloadLink.download = saveButton.download;
        downloadLink.hidden = true;
        document.body.appendChild(downloadLink);

        event.preventDefault();
        downloadLink.click();

        // Visual feedback on button
        saveButton.classList.add("pressed");
        setTimeout(() => saveButton.classList.remove("pressed"), 300);

        showToast("Contact saved to your device!");

        if (status) {
          status.textContent = "Contact file requested. Open it to save my details.";
        }
      } catch {
        if (event.defaultPrevented) {
          window.location.assign(saveButton.href);
        }
      } finally {
        downloadLink?.remove();
        if (objectUrl) {
          window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
        }
      }
    });
  }

  // === ESCAPE VCARD TEXT ===
  function escapeVCardText(value) {
    return String(value)
      .replace(/\\/g, "\\\\")
      .replace(/\r\n|\r|\n/g, "\\n")
      .replace(/[;,]/g, "\\$&");
  }

  // === BUILD VCARD ===
  function buildVCard() {
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:Sengco;Simeon;;;III",
      "FN:Simeon Sengco III",
      `TITLE:${escapeVCardText("BSIT Student")}`,
      "EMAIL;TYPE=INTERNET:sengcosimeon1106@gmail.com",
      "TEL;TYPE=CELL:+639205600975",
    ];

    document.querySelectorAll("a[data-social]").forEach((link, index) => {
      const item = `item${index + 1}`;
      lines.push(
        `${item}.URL:${link.href}`,
        `${item}.X-ABLabel:${escapeVCardText(link.dataset.social)}`,
      );
    });

    lines.push("END:VCARD");
    return `${lines.join("\r\n")}\r\n`;
  }

  // === FOOTER YEAR ===
  function initFooterYear() {
    const year = document.getElementById("year");
    if (year) {
      year.textContent = new Date().getFullYear();
    }
  }

  // === SCROLL REVEAL (fallback for elements that might need it) ===
  function initScrollReveal() {
    const revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length && "IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -80px 0px", threshold: 0.1 },
      );
      revealEls.forEach((el) => revealObserver.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }
  }

  // === INIT ALL ===
  function init() {
    // Mark elements that need entrance animation
    const entranceElements = document.querySelectorAll(
      ".site-header, .portrait-frame, .eyebrow, h1, .role, .intro, .button-primary, .button-share, .contact-hint, .section-heading, .section-description, .contact-link, .resume-card"
    );
    entranceElements.forEach(el => el.classList.add("entrance-element"));

    // Run entrance sequence
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        runEntranceSequence();
        initCursorSpotlight();
        init3DTilt();
        initShareButton();
        initSaveContact();
        initFooterYear();
        initScrollReveal();
      }, { once: true });
    } else {
      runEntranceSequence();
      initCursorSpotlight();
      init3DTilt();
      initShareButton();
      initSaveContact();
      initFooterYear();
      initScrollReveal();
    }
  }

  init();
})();