const dialog = document.getElementById('contactDialog');
const openButton = document.getElementById('contactOpen');
const closeButton = document.getElementById('dialogClose');
const form = document.getElementById('contactForm');
const note = document.getElementById('dialogNote');
const submitButton = form.querySelector('[type="submit"]');
const isEnglish = document.documentElement.lang === 'en';

const status = document.createElement('p');
status.className = 'contact-status';
status.setAttribute('role', 'status');
status.setAttribute('aria-live', 'polite');
status.tabIndex = -1;
status.hidden = true;
openButton.after(status);

openButton.addEventListener('click', () => {
  status.hidden = true;
  note.textContent = isEnglish
    ? 'Send your message, and I’ll get back to you.'
    : 'Отправьте сообщение, и я свяжусь с вами';
  dialog.showModal();
});
closeButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => openButton.focus());

form.addEventListener('submit', async event => {
  event.preventDefault();
  const endpoint = window.CONTACT_API_URL;
  if (!endpoint) {
    note.textContent = isEnglish ? 'Telegram sending is not configured yet.' : 'Отправка в Telegram ещё не настроена.';
    return;
  }

  const fields = new FormData(form);
  const payload = {
    name: String(fields.get('name') || '').trim(),
    contact: String(fields.get('contact') || '').trim(),
    message: String(fields.get('question') || '').trim(),
    website: String(fields.get('website') || '').trim(),
  };

  submitButton.disabled = true;
  note.textContent = isEnglish ? 'Sending…' : 'Отправляю сообщение…';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    let result = null;
    try { result = await response.json(); } catch { /* Some endpoints return an empty body. */ }
    if (!response.ok || result?.ok === false) throw new Error('Telegram delivery failed');

    form.reset();
    dialog.close();
    status.textContent = isEnglish ? 'Message sent. Thank you!' : 'Сообщение отправлено. Спасибо!';
    status.hidden = false;
    status.focus({ preventScroll: true });
  } catch {
    note.textContent = isEnglish ? 'Could not send the message. Please try again.' : 'Не удалось отправить сообщение. Попробуйте ещё раз.';
  } finally {
    submitButton.disabled = false;
  }
});
