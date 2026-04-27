export async function copyText(value) {
  if (!value) return false;

  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  const input = document.createElement('textarea');
  input.value = String(value);
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();

  const copied = document.execCommand('copy');
  document.body.removeChild(input);
  return copied;
}
