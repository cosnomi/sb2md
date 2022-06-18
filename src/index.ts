import { parse } from '@progfay/scrapbox-parser';
import { pageToMarkdown } from './pageToMarkdown';

process.stdin.setEncoding('utf8');

const lines: string[] = [];
const reader = require('readline').createInterface({
  input: process.stdin,
});

reader.on('line', (line: string) => {
  lines.push(line);
});
reader.on('close', () => {
  const markdown = pageToMarkdown(parse(lines.join('\n'), { hasTitle: false }));
  console.log(markdown);
});
