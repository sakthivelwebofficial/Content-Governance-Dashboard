const originalText = document.getElementById('originalText');
const revisedText = document.getElementById('revisedText');
const compareSummary = document.getElementById('compareSummary');
const compareEmpty = document.getElementById('compareEmpty');
const diffTableWrap = document.getElementById('diffTableWrap');
const diffRows = document.getElementById('diffRows');

function getLineDiff(originalLines, revisedLines) {
  const distanceLimit = originalLines.length + revisedLines.length;
  const trace = [];
  const frontier = new Map([[1, 0]]);

  for (let distance = 0; distance <= distanceLimit; distance += 1) {
    trace.push(new Map(frontier));

    for (let diagonal = -distance; diagonal <= distance; diagonal += 2) {
      const down = frontier.get(diagonal + 1) ?? 0;
      const across = frontier.get(diagonal - 1) ?? 0;
      let originalIndex = diagonal === -distance || (diagonal !== distance && across < down)
        ? down
        : across + 1;
      let revisedIndex = originalIndex - diagonal;

      while (
        originalIndex < originalLines.length &&
        revisedIndex < revisedLines.length &&
        originalLines[originalIndex] === revisedLines[revisedIndex]
      ) {
        originalIndex += 1;
        revisedIndex += 1;
      }

      frontier.set(diagonal, originalIndex);

      if (originalIndex >= originalLines.length && revisedIndex >= revisedLines.length) {
        return backtrackLineDiff(trace, originalLines, revisedLines);
      }
    }
  }

  return [];
}

function backtrackLineDiff(trace, originalLines, revisedLines) {
  let originalIndex = originalLines.length;
  let revisedIndex = revisedLines.length;
  const operations = [];

  for (let distance = trace.length - 1; distance >= 0; distance -= 1) {
    const frontier = trace[distance];
    const diagonal = originalIndex - revisedIndex;
    const across = frontier.get(diagonal - 1) ?? Number.NEGATIVE_INFINITY;
    const down = frontier.get(diagonal + 1) ?? Number.NEGATIVE_INFINITY;
    const previousDiagonal = diagonal === -distance || (diagonal !== distance && across < down)
      ? diagonal + 1
      : diagonal - 1;
    const previousOriginal = frontier.get(previousDiagonal) ?? 0;
    const previousRevised = previousOriginal - previousDiagonal;

    while (originalIndex > previousOriginal && revisedIndex > previousRevised) {
      operations.push({ type: 'same', value: originalLines[originalIndex - 1] });
      originalIndex -= 1;
      revisedIndex -= 1;
    }

    if (distance === 0) break;

    if (originalIndex === previousOriginal) {
      operations.push({ type: 'added', value: revisedLines[revisedIndex - 1] });
      revisedIndex -= 1;
    } else {
      operations.push({ type: 'removed', value: originalLines[originalIndex - 1] });
      originalIndex -= 1;
    }
  }

  return operations.reverse();
}

function buildAlignedRows(operations) {
  const rows = [];
  let pendingRemoved = [];
  let pendingAdded = [];

  function flushChanges() {
    const rowCount = Math.max(pendingRemoved.length, pendingAdded.length);
    for (let index = 0; index < rowCount; index += 1) {
      rows.push({
        left: pendingRemoved[index] || null,
        right: pendingAdded[index] || null,
        changed: true
      });
    }
    pendingRemoved = [];
    pendingAdded = [];
  }

  operations.forEach(operation => {
    if (operation.type === 'same') {
      flushChanges();
      rows.push({ left: operation.value, right: operation.value, changed: false });
    } else if (operation.type === 'removed') {
      pendingRemoved.push(operation.value);
    } else {
      pendingAdded.push(operation.value);
    }
  });

  flushChanges();
  return rows;
}

function appendDiffCell(row, value, lineNumber, changeType) {
  const numberCell = document.createElement('td');
  numberCell.className = 'line-number';
  numberCell.textContent = value === null ? '' : String(lineNumber);

  const codeCell = document.createElement('td');
  codeCell.className = `diff-code ${changeType}`;
  codeCell.textContent = value === null ? '' : value;

  row.append(numberCell, codeCell);
}

function compareTexts() {
  const leftLines = originalText.value.split(/\r?\n/);
  const rightLines = revisedText.value.split(/\r?\n/);
  const operations = getLineDiff(leftLines, rightLines);
  const rows = buildAlignedRows(operations);
  let leftLine = 0;
  let rightLine = 0;
  let additions = 0;
  let removals = 0;

  diffRows.replaceChildren();

  rows.forEach(diff => {
    const row = document.createElement('tr');
    const leftType = diff.left === null ? '' : diff.changed ? 'removed' : 'unchanged';
    const rightType = diff.right === null ? '' : diff.changed ? 'added' : 'unchanged';

    if (diff.left !== null) leftLine += 1;
    if (diff.right !== null) rightLine += 1;
    if (diff.left === null) additions += 1;
    if (diff.right === null) removals += 1;
    if (diff.changed && diff.left !== null && diff.right !== null) {
      additions += 1;
      removals += 1;
    }

    appendDiffCell(row, diff.left, leftLine, leftType);
    appendDiffCell(row, diff.right, rightLine, rightType);
    diffRows.appendChild(row);
  });

  compareEmpty.hidden = true;
  diffTableWrap.hidden = false;
  compareSummary.textContent = additions === 0 && removals === 0
    ? 'The texts are identical.'
    : `${additions} addition${additions === 1 ? '' : 's'} · ${removals} removal${removals === 1 ? '' : 's'}`;
}

document.getElementById('compareButton').addEventListener('click', compareTexts);

document.getElementById('switchTextsButton').addEventListener('click', () => {
  const previousOriginal = originalText.value;
  originalText.value = revisedText.value;
  revisedText.value = previousOriginal;
  compareTexts();
});

document.getElementById('clearTextsButton').addEventListener('click', () => {
  originalText.value = '';
  revisedText.value = '';
  diffRows.replaceChildren();
  diffTableWrap.hidden = true;
  compareEmpty.hidden = false;
  compareSummary.textContent = 'Add text to compare.';
  originalText.focus();
});

document.getElementById('editTextsButton').addEventListener('click', () => {
  originalText.focus();
});

[originalText, revisedText].forEach(textarea => {
  textarea.addEventListener('keydown', event => {
    if (event.ctrlKey && event.key === 'Enter') compareTexts();
  });
});