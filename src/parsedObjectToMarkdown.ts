import type { Node, Page } from '@progfay/scrapbox-parser';

// TODO: nodesを読み下す
const nodeToMarkdown = (node: Node): string => {
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
  return '';
};

export const parsedObjectToMarkdown = (page: Page): string => {
  const lines = page.map((block) => {
    if (block.type === 'title') {
      return `# ${block.text}`;
    }
    if (block.type === 'codeBlock') {
      const headline = `\`\`\`${block.fileName}`;
      if (block.indent === 0) {
        return `${headline}\n${block.content}\n\`\`\``;
      }
      const indent = '  '.repeat(block.indent - 1);
      return [
        `${indent}- ${headline}`,
        `${block.content}\n\`\`\``
          .split('\n')
          .map((line) => `${indent}  ${line}`)
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
      const indent = '  '.repeat(block.indent - 1);
      return [
        `${indent}- ${block.fileName}`,
        tableRows.map((line) => `${indent}  ${line}`).join('\n'),
      ];
    }
    // block.type === 'line'
    const text = block.nodes.map((node) => nodeToMarkdown(node));
    if (block.indent === 0) {
      return text;
    }
    const indent = '  '.repeat(block.indent - 1);
    return `${indent}- ${text}`;
  });

  return lines.join('\n');
};
