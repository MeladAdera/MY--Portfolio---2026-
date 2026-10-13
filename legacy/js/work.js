/* Work page: copy the email, and show the time in Lattakia. Nothing else moves. */
function startWork2(opts) {
  const doc = document;
  const copy = doc.querySelector('[data-copy]');
  const email = doc.querySelector('[data-email]');
  const status = doc.querySelector('[data-status]');
  const clock = doc.querySelector('[data-clock]');

  let reset = 0;
  const onCopy = () => {
    navigator.clipboard.writeText(email.textContent.trim()).then(() => {
      copy.textContent = 'Copied';
      status.textContent = 'Email address copied.';
    }, () => {
      copy.textContent = 'Copy failed';
      status.textContent = 'Could not copy the email address.';
    });
    clearTimeout(reset);
    reset = setTimeout(() => { copy.textContent = 'Copy'; status.textContent = ''; }, 2400);
  };
  copy.addEventListener('click', onCopy);

  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Damascus', hour: '2-digit', minute: '2-digit', timeZoneName: 'shortOffset' });
  let tick = 0;
  const show = () => {
    const parts = fmt.formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    clock.textContent = '. It’s ' + get('hour') + ':' + get('minute') + ' there now (' + get('timeZoneName') + ').';
    tick = setTimeout(show, 60000 - (Date.now() % 60000) + 50);
  };
  show();

  return {
    dispose() {
      clearTimeout(reset); clearTimeout(tick);
      copy.removeEventListener('click', onCopy);
    }
  };
}

startWork2();
