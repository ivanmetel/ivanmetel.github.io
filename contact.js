const dialog = document.getElementById('contactDialog');
const openButton = document.getElementById('contactOpen');
const closeButton = document.getElementById('dialogClose');
const form = document.getElementById('contactForm');
const note = document.getElementById('dialogNote');
const submitButton = form.querySelector('[type="submit"]');
const isEnglish = document.documentElement.lang === 'en';

openButton.addEventListener('click', () => {
  note.textContent = isEnglish ? 'Leave your contact details so I can reply.' : 'Оставьте контакт, чтобы я мог ответить.';
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
    if (!response.ok) throw new Error('Telegram delivery failed');
    form.reset();
    note.textContent = isEnglish ? 'Message sent. Thank you!' : 'Сообщение отправлено. Спасибо!';
    dialog.close();
  } catch {
    note.textContent = isEnglish ? 'Could not send the message. Please try again.' : 'Не удалось отправить сообщение. Попробуйте ещё раз.';
  } finally {
    submitButton.disabled = false;
  }
});
