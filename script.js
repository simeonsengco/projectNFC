(() => {
  "use strict";

  // Keep the footer current without making the page depend on JavaScript.
  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Escape text fields according to the vCard format.
  function escapeVCardText(value) {
    return String(value)
      .replace(/\\/g, "\\\\")
      .replace(/\r\n|\r|\n/g, "\\n")
      .replace(/[;,]/g, "\\$&");
  }

  // Read social links from the page so contact exports stay in sync.
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

  // The static contact.vcf link remains the fallback if export is unavailable.
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
      if (status) {
        status.textContent = "Contact file requested. Open it to save my details.";
      }
    } catch {
      // Preserve the original link if preparation fails; navigate if canceled.
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
})();
