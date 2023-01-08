# sb2md

This repository was forked from [hogashi/sb2md](https://github.com/hogashi/sb2md).  
The original code transforms scrapbox to general-purpose markdown, using [scrapbox-parser](https://github.com/progfay/scrapbox-parser).

Though Obsidian accepts normal-flavored markdown files,
there are a few tips that make the notes look sophisticated.

With the aim of generating more Obsidian-friendly yet still valid markdown, I made slight modifications to the original code which include
- Updating some Markdown syntax for a better look in Obsidian (wiki link, TeX, tab indent, etc.)
- Relinking the image attachments (Links to image are replaced with links to `03_Attachments/<filename>`)
- Renaming notes so they don't cause an error in the file system (e.g., colon (`:`))

## Usage

1. Download your scrapbox data as a json file
1. Run `npm run build`
1. Run `node dist/index.js <your_file>.json`
1. The converted markdown files will be saved to `output/`
