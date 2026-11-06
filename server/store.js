import { mkdir, appendFile, readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import path from 'node:path';

// Registrations are appended to a JSON Lines file. That is plenty for a
// community event of a few hundred people, needs no database server, and is
// trivial to back up or open in a text editor. Swap this module out for
// SQLite/Postgres if the site ever outgrows it.

// No 0/O/1/I so references are easy to read out over the phone or type into a bank transfer.
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function makeReference(prefix) {
  const bytes = randomBytes(6);
  let code = '';
  for (const b of bytes) code += ALPHABET[b % ALPHABET.length];
  return `${prefix}-${code}`;
}

export function createStore(dataDir) {
  const file = path.join(dataDir, 'registrations.jsonl');
  let queue = Promise.resolve();

  return {
    file,
    /** Writes are serialised so concurrent requests never interleave lines. */
    add(record) {
      const write = queue.then(async () => {
        await mkdir(dataDir, { recursive: true });
        await appendFile(file, JSON.stringify(record) + '\n', 'utf8');
        return record;
      });
      queue = write.catch(() => {});
      return write;
    },
    async all() {
      try {
        const raw = await readFile(file, 'utf8');
        return raw
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line));
      } catch (err) {
        if (err.code === 'ENOENT') return [];
        throw err;
      }
    },
  };
}

const CSV_COLUMNS = [
  'createdAt', 'reference', 'eventId', 'name', 'email', 'phone',
  'adults', 'children', 'infants', 'fee', 'currency', 'dietary', 'notes', 'lang',
];

const csvCell = (v) => {
  let s = v === undefined || v === null ? '' : String(v);
  // Neutralise spreadsheet formula injection (=, +, -, @ at the start of a cell).
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCsv(records) {
  const rows = [CSV_COLUMNS.join(',')];
  for (const r of records) rows.push(CSV_COLUMNS.map((c) => csvCell(r[c])).join(','));
  // BOM so Excel opens Hungarian accented characters correctly.
  return '﻿' + rows.join('\r\n') + '\r\n';
}
