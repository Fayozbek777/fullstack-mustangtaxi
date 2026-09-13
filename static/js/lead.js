(() => {
  const BOT_TOKEN = "8949662533:AAFgFxwOowuFQRSgFUKVZQWcA4yyzECa3wQ";
  const CHAT_ID = "8731770182";

  const form = document.getElementById("leadForm");
  const submitBtn = document.getElementById("submitBtn");
  const statusEl = document.getElementById("formStatus");
  const phoneInput = form.querySelector("#phone");

  function getCookie(name) {
    const m = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[2]) : "";
  }

  phoneInput.addEventListener("focus", () => {
    if (!phoneInput.value) phoneInput.value = "+998 ";
  });

  phoneInput.addEventListener("input", (e) => {
    let d = e.target.value.replace(/\D/g, "");
    if (d.startsWith("998")) d = d.slice(3);
    d = d.slice(0, 9);

    let out = "+998";
    if (d.length > 0) out += " " + d.slice(0, 2);
    if (d.length > 2) out += " " + d.slice(2, 5);
    if (d.length > 5) out += " " + d.slice(5, 7);
    if (d.length > 7) out += " " + d.slice(7, 9);

    e.target.value = out;
  });

  function showStatus(text, type = "info") {
    const colors = {
      info: "bg-blue-50 text-blue-700",
      success: "bg-green-50 text-green-700",
      error: "bg-red-50 text-red-700",
    };
    statusEl.className =
      "rounded-2xl px-5 py-4 text-sm font-medium " + colors[type];
    statusEl.textContent = text;
    statusEl.classList.remove("hidden");
  }
  function hideStatus() {
    statusEl.classList.add("hidden");
    statusEl.textContent = "";
  }

  function setFieldError(fieldId, message) {
    const el = form.querySelector(`[data-error="${fieldId}"]`);
    if (!el) return;
    if (message) {
      el.textContent = message;
      el.classList.remove("hidden");
    } else {
      el.textContent = "";
      el.classList.add("hidden");
    }
  }
  function clearErrors() {
    ["firstName", "phone"].forEach((id) => setFieldError(id, ""));
  }

  // ---------------- Валидация ----------------
  function validate() {
    clearErrors();
    let ok = true;

    if (form.first_name.value.trim().length < 2) {
      setFieldError("firstName", "Ismingizni kiriting (kamida 2 harf).");
      ok = false;
    }

    const d = form.phone.value.replace(/\D/g, "");
    if (d.length !== 12 || !d.startsWith("998")) {
      setFieldError(
        "phone",
        "Telefon raqamni to'liq kiriting: +998 ## ### ## ##",
      );
      ok = false;
    }

    return ok;
  }

  // ---------------- Хелперы ----------------
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function nowStr() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  // ---------------- Отправка в Telegram ----------------
  async function sendToTelegram(payload) {
    const text =
      "🟡 <b>Yangi so'rov — Drongo</b>\n\n" +
      `👤 <b>Ism:</b> ${escapeHtml(payload.first_name)}\n` +
      `👥 <b>Familiya:</b> ${escapeHtml(payload.last_name || "—")}\n` +
      `📞 <b>Telefon:</b> <code>${escapeHtml(payload.phone)}</code>\n` +
      `💬 <b>Savol:</b> ${escapeHtml(payload.question || "—")}\n\n` +
      `🕒 <i>${nowStr()}</i>`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.description || `HTTP ${res.status}`);
    }
    return data;
  }

  // ---------------- Submit ----------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideStatus();

    if (!validate()) {
      showStatus(
        "Iltimos, belgilangan maydonlarni to'g'ri to'ldiring.",
        "error",
      );
      return;
    }

    const payload = {
      first_name: form.first_name.value.trim(),
      last_name: form.last_name.value.trim(),
      phone: form.phone.value.trim(),
      question: form.question.value.trim(),
    };

    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.classList.add("opacity-70", "cursor-not-allowed");
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Yuborilmoqda...</span>`;

    try {
      await sendToTelegram(payload);
      showStatus(
        "✅ Rahmat! So'rovingiz yuborildi. Tez orada bog'lanamiz.",
        "success",
      );
      form.reset();
      phoneInput.value = "";
    } catch (err) {
      console.error(err);
      showStatus(
        "❌ Xatolik yuz berdi. Keyinroq urinib ko'ring yoki telefon orqali bog'laning.",
        "error",
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove("opacity-70", "cursor-not-allowed");
      submitBtn.innerHTML = originalHTML;
    }
  });
})();
