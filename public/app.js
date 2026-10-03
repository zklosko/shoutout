// For confirmation dialogs

document.body.addEventListener('htmx:confirm', (e) => {
    const question = e.detail.ctx?.confirm
    if (!question) return

    e.preventDefault()

    const dialog = document.getElementById('confirm-dialog')
    const message = document.getElementById('confirm-message')

    message.textContent = e.detail.ctx.confirm
    dialog.returnValue = ''
    dialog.showModal()

    dialog.addEventListener('close', () => {
        if (dialog.returnValue === 'ok') e.detail.issueRequest()
        else e.detail.dropRequest()
    }, { once: true })
})

// For toast notifications
function showToast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = `notification is-${type}`;
  el.setAttribute('role', type === 'danger' ? 'alert' : 'status');

  const close = document.createElement('button');
  close.className = 'delete';
  close.setAttribute('aria-label', 'Dismiss');

  const text = document.createElement('span');
  text.textContent = message;

  el.append(close, text);
  document.getElementById('toasts').append(el);

  const dismiss = () => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 300);
  };
  close.addEventListener('click', dismiss);
  setTimeout(dismiss, 4000);
}

document.addEventListener('toast', (e) => {
  console.log('toast event detail:', e.detail); // remove once it works
  const d = e.detail?.value ?? e.detail ?? {};
  showToast(d.message, d.type);
});