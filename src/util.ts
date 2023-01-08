import { randomInt } from 'crypto';
import * as download from 'image-downloader';
import * as fs from 'fs';
import * as path from 'path';

export function escapePageName(pageName: string): string {
  return pageName.replaceAll('/', ' ').replaceAll(':', ' ');
}


let downloadList: { url: string, dest: string }[] = [];

export function enqueueGyazo(url: string) {
  const gyazoId = url.match(/https:\/\/gyazo.com\/([0-9a-f]+)/)![1];
  const originalUrl = `https://i.gyazo.com/${gyazoId}.png`;
  const filename = 'gyazo-' + gyazoId + '.png';
  const filepath = path.join(process.cwd(), 'output/assets/' + filename);
  downloadList.push({ url: originalUrl, dest: filepath });
  return filename;
}
export function enqueueImage(url: string) {
  const filename = url.split('/').pop();
  const filepath = path.join(process.cwd(), 'output/assets/' + filename);
  console.error('Skip downloading' + url + ' to ' + filepath);
  downloadList.push({ url: url, dest: filepath });
  return filename;
}

export async function downloadImages() {
  return;
  // console.info(`Downloading images... (total: ${downloadList.length})`);
  // let count = 0;
  // for (const item of downloadList) {
  //   count++;
  //   try {
  //     if (fs.existsSync(item.dest)) {
  //       console.info(`Skip downloading ${item.url} to ${item.dest}`);
  //       continue;
  //     }
  //     await download.image({ url: item.url, dest: item.dest });
  //     console.log(`Downloaded ${item.url} to ${item.dest} (${count}/${downloadList.length})`);
  //     await new Promise(s => setTimeout(s, 200 + randomInt(2500)));
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }
}
