const urlInput = document.getElementById('urlInput');
const urlOutput = document.getElementById('urlOutput');
const urlStatus = document.getElementById('urlStatus');

function convertUrlText(operation) {
  if (!urlInput.value) {
    urlOutput.value = '';
    urlStatus.textContent = 'Enter text to convert.';
    return;
  }

  try {
    urlOutput.value = operation === 'encode'
      ? encodeURIComponent(urlInput.value)
      : decodeURIComponent(urlInput.value);
    urlStatus.textContent = operation === 'encode' ? 'Encoded.' : 'Decoded.';
  } catch {
    urlOutput.value = '';
    urlStatus.textContent = 'Could not decode: check the percent-encoded input.';
  }
}

document.getElementById('encodeButton').addEventListener('click', () => convertUrlText('encode'));
document.getElementById('decodeButton').addEventListener('click', () => convertUrlText('decode'));

document.getElementById('clearUrlButton').addEventListener('click', () => {
  urlInput.value = '';
  urlOutput.value = '';
  urlStatus.textContent = '';
  urlInput.focus();
});

document.getElementById('copyUrlButton').addEventListener('click', async () => {
  if (!urlOutput.value) {
    urlStatus.textContent = 'Convert some text before copying.';
    return;
  }

  try {
    await navigator.clipboard.writeText(urlOutput.value);
    urlStatus.textContent = 'Copied to clipboard.';
  } catch {
    urlOutput.select();
    document.execCommand('copy');
    urlStatus.textContent = 'Copied to clipboard.';
  }
});

urlInput.addEventListener('keydown', event => {
  if (event.ctrlKey && event.key === 'Enter') {
    convertUrlText('encode');
  }
});