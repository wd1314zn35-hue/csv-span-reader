// Broken CSV uses the first record's width and reports each repair at its starting line.
export function run(input) {
  const text = String(input.text);
  const header = input.header === true;
  const rows = [];
  const errors = [];
  let columns = null;
  let width = -1;
  let pos = text.charCodeAt(0) === 0xfeff ? 1 : 0;
  let line = 1;

  while (pos < text.length) {
    const recordLine = line;
    const recordRow = header && width < 0 ? null : rows.length;
    const newline = text.indexOf('\n', pos);
    const physicalEnd = newline < 0 ? text.length : newline;
    const contentEnd = newline >= 0 && text.charCodeAt(newline - 1) === 13
      ? newline - 1 : physicalEnd;
    if (contentEnd === pos) {
      pos = physicalEnd + 1;
      line++;
      continue;
    }

    let fields;
    const physicalLine = text.slice(pos, contentEnd);
    if (!/["\r]/.test(physicalLine)) {
      fields = physicalLine.split(',');
      pos = physicalEnd + 1;
      line++;
    } else {
      fields = [];
      const firstQuoted = text.charCodeAt(pos) === 34;
      let more;
      do {
        let value = '';
        let closed = false;
        if (text.charCodeAt(pos) === 34) {
          let quote = text.indexOf('"', pos + 1);
          let doubled = false;
          while (quote >= 0 && text.charCodeAt(quote + 1) === 34) {
            doubled = true;
            quote = text.indexOf('"', quote + 2);
          }
          if (quote >= 0) {
            closed = true;
            value = text.slice(pos + 1, quote);
            if (doubled) value = value.replaceAll('""', '"');
            if (value.includes('\r')) value = value.replace(/\r\n?/g, '\n');
            for (let lf = value.indexOf('\n'); lf >= 0; lf = value.indexOf('\n', lf + 1)) line++;
            pos = quote + 1;
          } else {
            errors.push({code: 'unterminated_quote', line: recordLine, row: recordRow});
          }
        }

        // Append spans, dropping only lone CR. This also handles a closing quote's suffix.
        const suffix = pos;
        let mark = pos;
        let dropped = 0;
        let ch;
        for (; pos < text.length; pos++) {
          ch = text.charCodeAt(pos);
          if (ch === 44 || ch === 10 || (ch === 13 && text.charCodeAt(pos + 1) === 10)) break;
          if (ch === 13) {
            value += text.slice(mark, pos);
            mark = pos + 1;
            dropped++;
            errors.push({code: 'stray_cr', line: recordLine, row: recordRow});
          }
        }
        if (mark < pos) value += text.slice(mark, pos);
        if (closed && pos - suffix > dropped) {
          errors.push({code: 'quote_junk', line: recordLine, row: recordRow});
        }
        fields.push(value);
        more = pos < text.length && ch === 44;
        if (pos < text.length) {
          pos += ch === 13 ? 2 : 1;
          if (!more) line++;
        }
      } while (more);
      if (fields.length === 1 && !firstQuoted && fields[0] === '') continue;
    }

    if (width < 0) {
      width = fields.length;
      if (header) {
        columns = fields;
        continue;
      }
    }
    if (fields.length !== width) {
      if (fields.length < width) {
        errors.push({code: 'short_row', line: recordLine, row: recordRow, fields: fields.length});
        while (fields.length < width) fields.push('');
      } else {
        errors.push({code: 'long_row', line: recordLine, row: recordRow, extra: fields.splice(width)});
      }
    }
    rows.push(fields);
  }
  return {columns: header ? columns ?? [] : null, rows, errors};
}
