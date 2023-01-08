# sb2md

This repository was forked from (hogashi/sb2md)[https://github.com/hogashi/sb2md].
The original code transforms scrapbox to markdown, using (scrapbox-parser)[https://github.com/progfay/scrapbox-parser].

Though Obsidian accepts normal-flavored markdown files as they are,
there are a few tips that make the notes look better fit in Obsidian.

For this purpose, I made a slight modifications to the original code which include
- Updating some Markdown syntax for a better look in Obsidian (wiki link, TeX, tab indent, etc.)
- Relink the image attachments (Links to image are replaced with links to `03_Attachments/<filename>`)
- Rename notes so they don't cause an error in the file system (e.g., colon (:))

## Usage

1. Download your scrapbox data as a json file
1. Run `npm run build && node dist/index.js <your_file>.json`
1. The converted markdown files will be saved to `output/`
