import type { Node, Page } from '@progfay/scrapbox-parser';
import { escapePageName, enqueueGyazo, enqueueImage } from './util';

function nodeToMarkdown(node: Node): string {
  if (node.type === 'blank') {
    return node.text;
  }
  if (node.type === 'code') {
    return `\`${node.text}\``;
  }
  if (node.type === 'commandLine') {
    return `\`${node.raw}\``;
  }
  if (node.type === 'decoration') {
    const prefix = '';
    const tags: string[] = [];
    node.decos.forEach((deco) => {
      if (deco[0] === '*') {
        const decoLevel = parseInt(deco.substring(2), 10);
        prefix.concat('#'.repeat(Math.max(6 - decoLevel + 1, 1)));
        for (let i = 0; i < decoLevel - 6; i += 1) {
          tags.push('strong');
        }
      } else if (deco === '-') {
        tags.push('s');
      } else if (deco === '_') {
        tags.push('u');
      } else if (deco === '/') {
        tags.push('i');
      }
    });
    return node.nodes.map((childNode) => nodeToMarkdown(childNode)).join('');
  }
  if (node.type === 'formula') {
    return `$${node.formula}$`;
  }
  if (node.type === 'googleMap') {
    return node.url;
  }
  if (node.type === 'hashTag') {
    return `[${node.raw}](${node.href})`;
  }
  if (node.type === 'helpfeel') {
    return `\`? ${node.text}\``;
  }
  if (node.type === 'icon') {
    return `(${node.path})`;
  }
  if (node.type === 'image') {
    // FIXME
    const src = '03_Attachments/' + (node.src.startsWith('https://gyazo.com') ? enqueueGyazo(node.src) : enqueueImage(node.src));
    return `![[${src}]]`
  }
  if (node.type === 'link') {
    const content = node.content === '' ? node.href : node.content;
    if (content === node.href && !content.startsWith('http')) {
      // internal wikilink
      const pageName = escapePageName(content);
      return `[[${pageName}]]`
    }
    return `[${content}](${node.href})`;
  }
  if (node.type === 'quote') {
    const content = node.nodes
      .map((childNode) => nodeToMarkdown(childNode))
      .join('\n');
    return `> ${content}`;
  }
  if (node.type === 'strong') {
    const content = node.nodes
      .map((childNode) => nodeToMarkdown(childNode))
      .join('\n');
    return `<strong>${content}</strong>`;
  }
  if (node.type === 'strongIcon') {
    return `<strong>(${node.path})</strong>`;
  }
  if (node.type === 'strongImage') {
    return `![${node.src}](${node.src})`;
  }
  if (node.type === 'numberList') {
    const content = node.nodes
      .map((childNode) => nodeToMarkdown(childNode))
      .join('\n');
    return `${node.number}. ${content}`;
  }
  // node.type === 'plain'
  return node.text;
};

export function pageToMarkdown(page: Page): string {
  const lines = page.map((block) => {
    if (block.type === 'title') {
      return null;// `# ${block.text}`;
    }
    if (block.type === 'codeBlock') {
      const headline = `\`\`\`${block.fileName}`;
      if (block.indent === 0) {
        return `${headline}\n${block.content}\n\`\`\``;
      }
      const indent = '\t'.repeat(block.indent - 1);
      return [
        `${indent}- ${headline}`,
        `${block.content}\n\`\`\``
          .split('\n')
          .map((line) => `${indent}\t${line}`)
          .join('\n'),
      ];
    }
    if (block.type === 'table') {
      const tableRows = block.cells.map((row) =>
        row.map((nodes) => {
          `| ${nodes.map((node) => nodeToMarkdown(node)).join(' | ')} |`;
        })
      );
      if (block.indent === 0) {
        return `${block.fileName}\n${tableRows.join('\n')}`;
      }
      const indent = '\t'.repeat(block.indent - 1);
      return [
        `${indent}- ${block.fileName}`,
        tableRows.map((line) => `${indent}\t${line}`).join('\n'),
      ];
    }
    // block.type === 'line'
    if (block.nodes.length == 0) {
      return '';
    }
    const text = block.nodes.map((node) => nodeToMarkdown(node)).join('');
    if (block.indent === 0) {
      return text;
    }
    const indent = '\t'.repeat(block.indent - 1);
    if (block.nodes[0].type === 'numberList') {
      return `${indent}${text}`;
    }
    return `${indent}- ${text}`;
  });
  lines.shift();
  return lines.join('\n');
};
