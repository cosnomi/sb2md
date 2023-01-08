import { parse } from '@progfay/scrapbox-parser';
import { pageToMarkdown } from './pageToMarkdown';
import * as fs from 'fs';
import { escapePageName, downloadImages } from './util';

export async function run() {
  console.info('Starting...');
  process.stdin.setEncoding('utf8');

  const file = fs.readFileSync(process.argv[2], 'utf8');
  const data = JSON.parse(file);

  fs.mkdirSync('output', { recursive: true });
  fs.mkdirSync('output/assets', { recursive: true });
  for (const page of data.pages) {
    const parsed = parse(page.lines.join('\n'), {
      hasTitle: true,
    });
    // console.log(parsed);
    const markdown = pageToMarkdown(parsed);
    const newTitle = escapePageName(page.title);
    fs.writeFileSync(`./output/${newTitle}.md`, markdown);
    console.log(`Created ${newTitle}.md`);
  }
  console.info('Downloading images');
  await downloadImages();
};

run();
