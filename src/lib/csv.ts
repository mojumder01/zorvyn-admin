/** Builds a CSV file (opens in Excel and Google Sheets) and downloads it. */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const escape = (value: string | number) => {
    let text = String(value);
    // Stop spreadsheet apps from running a cell as a formula
    if (/^[=+\-@]/.test(text)) text = `'${text}`;
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = '﻿' + rows.map((row) => row.map(escape).join(',')).join('\r\n'); // BOM so Excel reads ৳ correctly
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
