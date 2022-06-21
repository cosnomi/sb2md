#!/usr/bin/env node
"use strict";

// node_modules/@progfay/scrapbox-parser/esm/block/Title.js
var convertToTitle = (pack) => {
  return {
    type: "title",
    text: pack.rows[0].text
  };
};

// node_modules/@progfay/scrapbox-parser/esm/block/CodeBlock.js
var convertToCodeBlock = (pack) => {
  const { rows: [head, ...body] } = pack;
  const { indent = 0, text = "" } = head !== null && head !== void 0 ? head : {};
  const fileName = text.replace(/^\s*code:/, "");
  return {
    indent,
    type: "codeBlock",
    fileName,
    content: body.map((row) => row.text.substring(indent + 1)).join("\n")
  };
};

// node_modules/@progfay/scrapbox-parser/esm/block/node/creator.js
var createNodeParser = (nodeCreator, { parseOnNested, parseOnQuoted, patterns }) => {
  return (text, opts, next) => {
    var _a, _b, _c, _d, _e, _f;
    if (!parseOnNested && opts.nested)
      return (_a = next === null || next === void 0 ? void 0 : next()) !== null && _a !== void 0 ? _a : [];
    if (!parseOnQuoted && opts.quoted)
      return (_b = next === null || next === void 0 ? void 0 : next()) !== null && _b !== void 0 ? _b : [];
    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match === null)
        continue;
      const left = text.substring(0, match.index);
      const right = text.substring(match.index + ((_d = (_c = match[0]) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0));
      const node = nodeCreator((_e = match[0]) !== null && _e !== void 0 ? _e : "", opts);
      return [
        ...convertToNodes(left, opts),
        ...node,
        ...convertToNodes(right, opts)
      ];
    }
    return (_f = next === null || next === void 0 ? void 0 : next()) !== null && _f !== void 0 ? _f : [];
  };
};

// node_modules/@progfay/scrapbox-parser/esm/block/node/PlainNode.js
var createPlainNode = (raw) => [
  {
    type: "plain",
    raw,
    text: raw
  }
];
var PlainNodeParser = createNodeParser(createPlainNode, {
  parseOnNested: true,
  parseOnQuoted: true,
  patterns: [/^()(.*)()$/]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/QuoteNode.js
var quoteRegExp = /^>.*$/;
var createQuoteNode = (raw, opts) => opts.context === "table" ? createPlainNode(raw, opts) : [
  {
    type: "quote",
    raw,
    nodes: convertToNodes(raw.substring(1), { ...opts, quoted: true })
  }
];
var QuoteNodeParser = createNodeParser(createQuoteNode, {
  parseOnNested: false,
  parseOnQuoted: false,
  patterns: [quoteRegExp]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/HelpfeelNode.js
var helpfeelRegExp = /^\? .+$/;
var createHelpfeelNode = (raw, opts) => opts.context === "table" ? createPlainNode(raw, opts) : [
  {
    type: "helpfeel",
    raw,
    text: raw.substring(2)
  }
];
var HelpfeelNodeParser = createNodeParser(createHelpfeelNode, {
  parseOnNested: false,
  parseOnQuoted: false,
  patterns: [helpfeelRegExp]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/StrongImageNode.js
var strongImageRegExp = /\[\[https?:\/\/[^\s\]]+\.(?:png|jpe?g|gif|svg)\]\]/i;
var strongGyazoImageRegExp = /\[\[https?:\/\/(?:[0-9a-z-]+\.)?gyazo\.com\/[0-9a-f]{32}\]\]/;
var createStrongImageNode = (raw, opts) => {
  if (opts.context === "table") {
    return createPlainNode(raw, opts);
  }
  const src = raw.substring(2, raw.length - 2);
  const isGyazoImage = /^https?:\/\/([0-9a-z-]\.)?gyazo\.com\/[0-9a-f]{32}$/.test(src);
  return [
    {
      type: "strongImage",
      raw,
      src: isGyazoImage ? `${src}/thumb/1000` : src
    }
  ];
};
var StrongImageNodeParser = createNodeParser(createStrongImageNode, {
  parseOnNested: false,
  parseOnQuoted: true,
  patterns: [strongImageRegExp, strongGyazoImageRegExp]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/IconNode.js
var iconRegExp = /\[[^[\]]*\.icon(?:\*[1-9]\d*)?\]/;
function generateIconNodeCreator(type) {
  return (raw, opts) => {
    if (type === "strongIcon" && opts.context === "table") {
      return createPlainNode(raw, opts);
    }
    const target = type === "icon" ? raw.substring(1, raw.length - 1) : raw.substring(2, raw.length - 2);
    const index = target.lastIndexOf(".icon");
    const path = target.substring(0, index);
    const pathType = path.startsWith("/") ? "root" : "relative";
    const numStr = target.substring(index + 5, target.length);
    const num = numStr.startsWith("*") ? parseInt(numStr.substring(1), 10) : 1;
    return new Array(num).fill({}).map(() => ({ path, pathType, type, raw }));
  };
}
var createIconNode = generateIconNodeCreator("icon");
var IconNodeParser = createNodeParser(createIconNode, {
  parseOnNested: false,
  parseOnQuoted: true,
  patterns: [iconRegExp]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/StrongIconNode.js
var strongIconRegExp = /\[\[[^[\]]*\.icon(?:\*\d+)?\]\]/;
var createStrongIconNode = generateIconNodeCreator("strongIcon");
var StrongIconNodeParser = createNodeParser(createStrongIconNode, {
  parseOnNested: false,
  parseOnQuoted: true,
  patterns: [strongIconRegExp]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/StrongNode.js
var strongRegExp = /\[\[(?:[^[]|\[[^[]).*?\]*\]\]/;
var createStrongNode = (raw, opts) => opts.context === "table" ? createPlainNode(raw, opts) : [
  {
    type: "strong",
    raw,
    nodes: convertToNodes(raw.substring(2, raw.length - 2), {
      ...opts,
      nested: true
    })
  }
];
var StrongNodeParser = createNodeParser(createStrongNode, {
  parseOnNested: false,
  parseOnQuoted: true,
  patterns: [strongRegExp]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/FormulaNode.js
var formulaWithTailHalfSpaceRegExp = /\[\$ .+? \]/;
var formulaRegExp = /\[\$ [^\]]+\]/;
var createFormulaNode = (raw, opts) => opts.context === "table" ? createPlainNode(raw, opts) : [
  {
    type: "formula",
    raw,
    formula: raw.substring(3, raw.length - (raw.endsWith(" ]") ? 2 : 1))
  }
];
var FormulaNodeParser = createNodeParser(createFormulaNode, {
  parseOnNested: false,
  parseOnQuoted: true,
  patterns: [formulaWithTailHalfSpaceRegExp, formulaRegExp]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/DecorationNode.js
var decorationRegExp = /\[[!"#%&'()*+,\-./{|}<>_~]+ (?:\[[^[\]]+\]|[^\]])+\]/;
var createDecorationNode = (raw, opts) => {
  if (opts.context === "table") {
    return createPlainNode(raw, opts);
  }
  const separatorIndex = raw.indexOf(" ");
  const rawDecos = raw.substring(1, separatorIndex);
  const text = raw.substring(separatorIndex + 1, raw.length - 1);
  const decoSet = new Set(rawDecos);
  if (decoSet.has("*")) {
    const asteriskCount = rawDecos.split("*").length - 1;
    decoSet.delete("*");
    decoSet.add(`*-${Math.min(asteriskCount, 10)}`);
  }
  return [
    {
      type: "decoration",
      raw,
      rawDecos,
      decos: Array.from(decoSet),
      nodes: convertToNodes(text, { ...opts, nested: true })
    }
  ];
};
var DecorationNodeParser = createNodeParser(createDecorationNode, {
  parseOnNested: false,
  parseOnQuoted: true,
  patterns: [decorationRegExp]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/CodeNode.js
var codeRegExp = /`.*?`/;
var createCodeNode = (raw, opts) => opts.context === "table" ? createPlainNode(raw, opts) : [
  {
    type: "code",
    raw,
    text: raw.substring(1, raw.length - 1)
  }
];
var CodeNodeParser = createNodeParser(createCodeNode, {
  parseOnNested: false,
  parseOnQuoted: true,
  patterns: [codeRegExp]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/CommandLineNode.js
var commandLineRegExp = /^[$%] .+$/;
var createCommandLineNode = (raw, opts) => {
  var _a;
  if (opts.context === "table") {
    return createPlainNode(raw, opts);
  }
  const symbol = (_a = raw[0]) !== null && _a !== void 0 ? _a : "";
  const text = raw.substring(2);
  return [
    {
      type: "commandLine",
      raw,
      symbol,
      text
    }
  ];
};
var CommandLineNodeParser = createNodeParser(createCommandLineNode, {
  parseOnNested: false,
  parseOnQuoted: false,
  patterns: [commandLineRegExp]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/BlankNode.js
var blankRegExp = /\[\s+\]/;
var createBlankNode = (raw, opts) => opts.context === "table" ? createPlainNode(raw, opts) : [
  {
    type: "blank",
    raw,
    text: raw.substring(1, raw.length - 1)
  }
];
var BlankNodeParser = createNodeParser(createBlankNode, {
  parseOnNested: false,
  parseOnQuoted: true,
  patterns: [blankRegExp]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/ImageNode.js
var srcFirstStrongImageRegExp = /\[https?:\/\/[^\s\]]+\.(?:png|jpe?g|gif|svg)(?:\?[^\]\s]+)?(?:\s+https?:\/\/[^\s\]]+)?\]/i;
var linkFirstStrongImageRegExp = /\[https?:\/\/[^\s\]]+\s+https?:\/\/[^\s\]]+\.(?:png|jpe?g|gif|svg)(?:\?[^\]\s]+)?\]/i;
var srcFirstStrongGyazoImageRegExp = /\[https?:\/\/(?:[0-9a-z-]+\.)?gyazo\.com\/[0-9a-f]{32}(?:\/raw)?(?:\s+https?:\/\/[^\s\]]+)?\]/;
var linkFirstStrongGyazoImageRegExp = /\[https?:\/\/[^\s\]]+\s+https?:\/\/(?:[0-9a-z-]+\.)?gyazo\.com\/[0-9a-f]{32}(?:\/raw)?\]/;
var isImageUrl = (text) => /^https?:\/\/[^\s\]]+\.(png|jpe?g|gif|svg)(\?[^\]\s]+)?$/i.test(text) || isGyazoImageUrl(text);
var isGyazoImageUrl = (text) => /^https?:\/\/([0-9a-z-]\.)?gyazo\.com\/[0-9a-f]{32}(\/raw)?$/.test(text);
var createImageNode = (raw, opts) => {
  if (opts.context === "table") {
    return createPlainNode(raw, opts);
  }
  const index = raw.search(/\s/);
  const first = index !== -1 ? raw.substring(1, index) : raw.substring(1, raw.length - 1);
  const second = index !== -1 ? raw.substring(index, raw.length - 1).trimLeft() : "";
  const [src, link] = isImageUrl(second) ? [second, first] : [first, second];
  return [
    {
      type: "image",
      raw,
      src: /^https?:\/\/([0-9a-z-]\.)?gyazo\.com\/[0-9a-f]{32}$/.test(src) ? `${src}/thumb/1000` : src,
      link
    }
  ];
};
var ImageNodeParser = createNodeParser(createImageNode, {
  parseOnNested: true,
  parseOnQuoted: true,
  patterns: [
    srcFirstStrongImageRegExp,
    linkFirstStrongImageRegExp,
    srcFirstStrongGyazoImageRegExp,
    linkFirstStrongGyazoImageRegExp
  ]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/ExternalLinkNode.js
var hrefFirstUrlRegExp = /\[https?:\/\/[^\s\]]+\s+[^\]]*[^\s]\]/;
var contentFirstUrlRegExp = /\[[^[\]]*[^\s]\s+https?:\/\/[^\s\]]+\]/;
var bracketedUrlRegExp = /\[https?:\/\/[^\s\]]+\]/;
var httpRegExp = /https?:\/\/[^\s]+/;
var createExternalLinkNode = (raw, opts) => {
  if (opts.context === "table") {
    return createPlainNode(raw, opts);
  }
  const inner = raw.startsWith("[") && raw.endsWith("]") ? raw.substring(1, raw.length - 1) : raw;
  const isHrefFirst = /^https?:\/\/[^\s\]]/.test(inner);
  const match = (isHrefFirst ? /^https?:\/\/[^\s\]]+/ : /https?:\/\/[^\s\]]+$/).exec(inner);
  if ((match === null || match === void 0 ? void 0 : match[0]) === void 0)
    return [];
  const content = isHrefFirst ? inner.substring(match[0].length) : inner.substring(0, match.index - 1);
  return [
    {
      type: "link",
      raw,
      pathType: "absolute",
      href: match[0],
      content: content.trim()
    }
  ];
};
var ExternalLinkNodeParser = createNodeParser(createExternalLinkNode, {
  parseOnNested: true,
  parseOnQuoted: true,
  patterns: [
    hrefFirstUrlRegExp,
    contentFirstUrlRegExp,
    bracketedUrlRegExp,
    httpRegExp
  ]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/GoogleMapNode.js
var placeFirstGoogleMapRegExp = /\[([^\]]*[^\s])\s+([NS]\d+(?:\.\d+)?,[EW]\d+(?:\.\d+)?(?:,Z\d+)?)\]/;
var coordFirstGoogleMapRegExp = /\[([NS]\d+(?:\.\d+)?,[EW]\d+(?:\.\d+)?(?:,Z\d+)?)(?:\s+([^\]]*[^\s]))?\]/;
var parseCoordinate = (format) => {
  const [lat = "", lng = "", z = ""] = format.split(",");
  const latitude = parseFloat(lat.replace(/^N/, "").replace(/^S/, "-"));
  const longitude = parseFloat(lng.replace(/^E/, "").replace(/^W/, "-"));
  const zoom = /^Z\d+$/.test(z) ? parseInt(z.replace(/^Z/, ""), 10) : 14;
  return { latitude, longitude, zoom };
};
var createGoogleMapNode = (raw, opts) => {
  var _a;
  if (opts.context === "table") {
    return createPlainNode(raw, opts);
  }
  const match = (_a = raw.match(placeFirstGoogleMapRegExp)) !== null && _a !== void 0 ? _a : raw.match(coordFirstGoogleMapRegExp);
  if (match === null)
    return [];
  const isCoordFirst = raw.startsWith("[N") || raw.startsWith("[S");
  const [, coord = "", place = ""] = isCoordFirst ? match : [match[0], match[2], match[1]];
  const { latitude, longitude, zoom } = parseCoordinate(coord);
  const url = place !== "" ? `https://www.google.com/maps/place/${encodeURIComponent(place)}/@${latitude},${longitude},${zoom}z` : `https://www.google.com/maps/@${latitude},${longitude},${zoom}z`;
  return [
    {
      type: "googleMap",
      raw,
      latitude,
      longitude,
      zoom,
      place,
      url
    }
  ];
};
var GoogleMapNodeParser = createNodeParser(createGoogleMapNode, {
  parseOnNested: false,
  parseOnQuoted: true,
  patterns: [placeFirstGoogleMapRegExp, coordFirstGoogleMapRegExp]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/InternalLinkNode.js
var internalLinkRegExp = /\[\/?[^[\]]+\]/;
var createInternalLinkNode = (raw) => {
  const href = raw.substring(1, raw.length - 1);
  return [
    {
      type: "link",
      raw,
      pathType: href.startsWith("/") ? "root" : "relative",
      href,
      content: ""
    }
  ];
};
var InternalLinkNodeParser = createNodeParser(createInternalLinkNode, {
  parseOnNested: true,
  parseOnQuoted: true,
  patterns: [internalLinkRegExp]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/HashTagNode.js
var hashTagRegExp = /(?:^|\s)#\S+/;
var createHashTagNode = (raw, opts) => {
  if (opts.context === "table") {
    return createPlainNode(raw, opts);
  }
  if (raw.startsWith("#")) {
    return [
      {
        type: "hashTag",
        raw,
        href: raw.substring(1)
      }
    ];
  }
  const space = raw.substring(0, 1);
  const tag = raw.substring(1);
  return [
    ...createPlainNode(space, opts),
    {
      type: "hashTag",
      raw: tag,
      href: tag.substring(1)
    }
  ];
};
var HashTagNodeParser = createNodeParser(createHashTagNode, {
  parseOnNested: true,
  parseOnQuoted: true,
  patterns: [hashTagRegExp]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/NumberListNode.js
var numberListRegExp = /^[0-9]+\. .*$/;
var createNumberListNode = (raw, opts) => {
  if (opts.context === "table") {
    return createPlainNode(raw, opts);
  }
  const separatorIndex = raw.indexOf(" ");
  const rawNumber = raw.substring(0, separatorIndex - 1);
  const number = parseInt(rawNumber, 10);
  const text = raw.substring(separatorIndex + 1, raw.length);
  return [
    {
      type: "numberList",
      raw,
      rawNumber,
      number,
      nodes: convertToNodes(text, { ...opts, nested: true })
    }
  ];
};
var NumberListNodeParser = createNodeParser(createNumberListNode, {
  parseOnNested: false,
  parseOnQuoted: false,
  patterns: [numberListRegExp]
});

// node_modules/@progfay/scrapbox-parser/esm/block/node/index.js
var FalsyEliminator = (text, _, next) => {
  var _a;
  if (text === "")
    return [];
  return (_a = next === null || next === void 0 ? void 0 : next()) !== null && _a !== void 0 ? _a : [];
};
var combineNodeParsers = (...parsers) => (text, opts) => parsers.reduceRight((acc, parser) => () => parser(text, opts, acc), () => PlainNodeParser(text, opts))();
var convertToNodes = combineNodeParsers(FalsyEliminator, QuoteNodeParser, HelpfeelNodeParser, CodeNodeParser, CommandLineNodeParser, FormulaNodeParser, BlankNodeParser, DecorationNodeParser, StrongImageNodeParser, StrongIconNodeParser, StrongNodeParser, ImageNodeParser, ExternalLinkNodeParser, IconNodeParser, GoogleMapNodeParser, InternalLinkNodeParser, HashTagNodeParser, NumberListNodeParser);

// node_modules/@progfay/scrapbox-parser/esm/block/Table.js
var convertToTable = (pack) => {
  const { rows: [head, ...body] } = pack;
  const { indent = 0, text = "" } = head !== null && head !== void 0 ? head : {};
  const fileName = text.replace(/^\s*table:/, "");
  return {
    indent,
    type: "table",
    fileName,
    cells: body.map((row) => row.text.substring(indent + 1)).map((text2) => text2.split("	").map((block) => convertToNodes(block, {
      nested: false,
      quoted: false,
      context: "table"
    })))
  };
};

// node_modules/@progfay/scrapbox-parser/esm/block/Line.js
var convertToLine = (pack) => {
  const { indent, text } = pack.rows[0];
  return {
    indent,
    type: "line",
    nodes: convertToNodes(text.substring(indent), {
      nested: false,
      quoted: false,
      context: "line"
    })
  };
};

// node_modules/@progfay/scrapbox-parser/esm/block/index.js
var convertToBlock = (pack) => {
  switch (pack.type) {
    case "title":
      return convertToTitle(pack);
    case "codeBlock":
      return convertToCodeBlock(pack);
    case "table":
      return convertToTable(pack);
    case "line":
      return convertToLine(pack);
  }
};

// node_modules/@progfay/scrapbox-parser/esm/block/Row.js
var parseToRows = (input) => input.split("\n").map((text) => {
  var _a, _b, _c;
  return {
    indent: (_c = (_b = (_a = /^\s+/.exec(text)) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0,
    text
  };
});

// node_modules/@progfay/scrapbox-parser/esm/block/Pack.js
var isChildRowOfPack = (pack, row) => {
  var _a, _b;
  return (pack.type === "codeBlock" || pack.type === "table") && row.indent > ((_b = (_a = pack.rows[0]) === null || _a === void 0 ? void 0 : _a.indent) !== null && _b !== void 0 ? _b : 0);
};
var packing = (packs, row) => {
  const lastPack = packs[packs.length - 1];
  if (lastPack !== void 0 && isChildRowOfPack(lastPack, row)) {
    lastPack.rows.push(row);
    return packs;
  }
  packs.push({
    type: /^\s*code:/.test(row.text) ? "codeBlock" : /^\s*table:/.test(row.text) ? "table" : "line",
    rows: [row]
  });
  return packs;
};
var packRows = (rows, opts) => {
  var _a;
  if ((_a = opts.hasTitle) !== null && _a !== void 0 ? _a : true) {
    const [title, ...body] = rows;
    if (title === void 0)
      return [];
    return [
      {
        type: "title",
        rows: [title]
      },
      ...body.reduce(packing, [])
    ];
  }
  return rows.reduce(packing, []);
};

// node_modules/@progfay/scrapbox-parser/esm/parse.js
var parse = (input, opts) => {
  var _a;
  const rows = parseToRows(input);
  const packs = packRows(rows, { hasTitle: (_a = opts === null || opts === void 0 ? void 0 : opts.hasTitle) !== null && _a !== void 0 ? _a : true });
  return packs.map(convertToBlock);
};

// src/pageToMarkdown.ts
var nodeToMarkdown = (node) => {
  if (node.type === "blank") {
    return node.text;
  }
  if (node.type === "code") {
    return `\`${node.text}\``;
  }
  if (node.type === "commandLine") {
    return `\`${node.raw}\``;
  }
  if (node.type === "decoration") {
    const prefix = "";
    const tags = [];
    node.decos.forEach((deco) => {
      if (deco[0] === "*") {
        const decoLevel = parseInt(deco.substring(2), 10);
        prefix.concat("#".repeat(Math.max(6 - decoLevel + 1, 1)));
        for (let i = 0; i < decoLevel - 6; i += 1) {
          tags.push("strong");
        }
      } else if (deco === "-") {
        tags.push("s");
      } else if (deco === "_") {
        tags.push("u");
      } else if (deco === "/") {
        tags.push("i");
      }
    });
    return node.nodes.map((childNode) => nodeToMarkdown(childNode)).join("");
  }
  if (node.type === "formula") {
    return `$$ ${node.formula} $$`;
  }
  if (node.type === "googleMap") {
    return node.url;
  }
  if (node.type === "hashTag") {
    return `[${node.raw}](${node.href})`;
  }
  if (node.type === "helpfeel") {
    return `\`? ${node.text}\``;
  }
  if (node.type === "icon") {
    return `(${node.path})`;
  }
  if (node.type === "image") {
    const img = `![${node.src}](${node.src})`;
    return node.link === "" ? img : `[${img}](${node.link})`;
  }
  if (node.type === "link") {
    const content = node.content === "" ? node.href : node.content;
    return `[${content}](${node.href})`;
  }
  if (node.type === "quote") {
    const content = node.nodes.map((childNode) => nodeToMarkdown(childNode)).join("\n");
    return `> ${content}`;
  }
  if (node.type === "strong") {
    const content = node.nodes.map((childNode) => nodeToMarkdown(childNode)).join("\n");
    return `<strong>${content}</strong>`;
  }
  if (node.type === "strongIcon") {
    return `<strong>(${node.path})</strong>`;
  }
  if (node.type === "strongImage") {
    return `![${node.src}](${node.src})`;
  }
  if (node.type === "numberList") {
    const content = node.nodes.map((childNode) => nodeToMarkdown(childNode)).join("\n");
    return `${node.number}. ${content}`;
  }
  return node.text;
};
var pageToMarkdown = (page) => {
  const lines2 = page.map((block) => {
    if (block.type === "title") {
      return `# ${block.text}`;
    }
    if (block.type === "codeBlock") {
      const headline = `\`\`\`${block.fileName}`;
      if (block.indent === 0) {
        return `${headline}
${block.content}
\`\`\``;
      }
      const indent2 = "  ".repeat(block.indent - 1);
      return [
        `${indent2}- ${headline}`,
        `${block.content}
\`\`\``.split("\n").map((line) => `${indent2}  ${line}`).join("\n")
      ];
    }
    if (block.type === "table") {
      const tableRows = block.cells.map((row) => row.map((nodes) => {
        `| ${nodes.map((node) => nodeToMarkdown(node)).join(" | ")} |`;
      }));
      if (block.indent === 0) {
        return `${block.fileName}
${tableRows.join("\n")}`;
      }
      const indent2 = "  ".repeat(block.indent - 1);
      return [
        `${indent2}- ${block.fileName}`,
        tableRows.map((line) => `${indent2}  ${line}`).join("\n")
      ];
    }
    const text = block.nodes.map((node) => nodeToMarkdown(node)).join("");
    if (block.indent === 0) {
      return text;
    }
    const indent = "  ".repeat(block.indent - 1);
    if (block.nodes[0].type === "numberList") {
      return `${indent}${text}`;
    }
    return `${indent}- ${text}`;
  });
  return lines2.join("\n");
};

// src/index.ts
process.stdin.setEncoding("utf8");
var lines = [];
var reader = require("readline").createInterface({
  input: process.stdin
});
reader.on("line", (line) => {
  lines.push(line);
});
reader.on("close", () => {
  const markdown = pageToMarkdown(parse(lines.join("\n"), { hasTitle: false }));
  console.log(markdown);
});
