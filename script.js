(() => {
  "use strict";

  // === SHARE / QR FUNCTIONALITY ===
  function initShareButton() {
    const shareBtn = document.getElementById("share-btn");
    const dialog = document.getElementById("qr-dialog");
    const closeButton = document.getElementById("qr-close");
    const copyButton = document.getElementById("copy-link");
    if (!shareBtn || !dialog) return;

    closeButton?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    copyButton?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Card link copied");
      } catch {
        showToast("Copy isn’t available in this browser");
      }
    });

    shareBtn.addEventListener("click", async () => {
      const url = window.location.href;
      const title = "Simeon Sengco III | Digital Contact Card";
      const text = "Save my contact and connect with me.";

      if (navigator.share && navigator.canShare?.({ title, text, url })) {
        try {
          await navigator.share({ title, text, url });
        } catch (err) {
          if (err.name !== "AbortError") dialog.showModal();
        }
        return;
      }

      dialog.showModal();
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

  // === INIT ALL ===
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        initShareButton();
        initSaveContact();
        initFooterYear();
      }, { once: true });
    } else {
      initShareButton();
      initSaveContact();
      initFooterYear();
    }
  }

  init();
})();
