/** Convert an array of records to CSV and trigger a browser download.
 *  Values are quote-escaped to stay safe with commas and quotes. */
export function exportToCsv<T>(
  filename: string,
  rows: T[],
  columns: { key: keyof T; header: string }[],
): void {
  const escape = (value: unknown) => {
    const str = value == null ? '' : String(value);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const header = columns.map((c) => escape(c.header)).join(',');
  const body = rows
    .map((row) => columns.map((c) => escape(row[c.key])).join(','))
    .join('\n');
  const csv = `${header}\n${body}`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
