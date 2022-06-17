import type { Page } from '@progfay/scrapbox-parser';

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
      // TODO: nodesを読み下す
      const tableRows = block.cells.map((row) =>
        row.map((nodes) => {
          `| ${nodes.map((node) => node).join(' | ')} |`;
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
    // TODO: nodesを読み下す
    if (block.indent === 0) {
      return block.nodes;
    }
    const indent = '  '.repeat(block.indent - 1);
    return `${indent}- ${block.nodes}`;
  });

  return lines.join('\n');
};
