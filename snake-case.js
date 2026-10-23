const snakeInput = document.getElementById('snakeInput');
const snakeOutput = document.getElementById('snakeOutput');
const snakeStatus = document.getElementById('snakeStatus');

function convertToSnakeCase(text) {
  return text
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .join('_');
}

document.getElementById('convertButton').addEventListener('click', () => {
  snakeOutput.value = convertToSnakeCase(snakeInput.value);
  snakeStatus.textContent = snakeInput.value.trim() ? 'Converted.' : 'Enter some text to convert.';
});

document.getElementById('copyButton').addEventListener('click', async () => {
  if (!snakeOutput.value) {
    snakeStatus.textContent = 'Convert some text before copying.';
    return;
  }

  try {
    await navigator.clipboard.writeText(snakeOutput.value);
    snakeStatus.textContent = 'Copied to clipboard.';
  } catch {
    snakeOutput.select();
    document.execCommand('copy');
    snakeStatus.textContent = 'Copied to clipboard.';
  }
});

snakeInput.addEventListener('keydown', event => {
  if (event.ctrlKey && event.key === 'Enter') {
    document.getElementById('convertButton').click();
  }
});