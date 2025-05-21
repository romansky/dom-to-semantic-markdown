import {ConversionOptions, findInMarkdownAST, SemanticMarkdownAST} from "../index";
import {MetaDataNode} from "../types/markdownTypes";

function aggressiveTrim(str: string | undefined | null): string {
    if (typeof str !== 'string') return '';
    return str.replace(/^[\s\u00A0\u200B]+|[\s\u00A0\u200B]+$/g, '');
}

// --- Metadata Rendering ---

function renderSimpleMetaObject(obj: Record<string, string> | undefined, indent: string = ''): string {
    if (!obj || Object.keys(obj).length === 0) return '';
    let metaString = '';
    Object.keys(obj).forEach(key => {
        const value = String(obj[key] ?? '');
        metaString += `${indent}${key}: "${value.replace(/"/g, '\\"')}"\n`;
    });
    return metaString;
}

function markdownMetaASTToString(nodes: SemanticMarkdownAST[], options?: ConversionOptions): string {
    if (!options?.includeMetaData) {
        return '';
    }

    const metaNode = findInMarkdownAST(nodes, _ => _.type === 'meta') as MetaDataNode | undefined;
    if (!metaNode) {
        return '---\n---\n\n';
    }

    let markdownString = '---\n';

    if (metaNode.content.standard) {
        markdownString += renderSimpleMetaObject(metaNode.content.standard);
    }

    if (options.includeMetaData === 'extended') {
        if (metaNode.content.openGraph && Object.keys(metaNode.content.openGraph).length > 0) {
            markdownString += 'openGraph:\n';
            markdownString += renderSimpleMetaObject(metaNode.content.openGraph, '  ');
        }

        if (metaNode.content.twitter && Object.keys(metaNode.content.twitter).length > 0) {
            markdownString += 'twitter:\n';
            markdownString += renderSimpleMetaObject(metaNode.content.twitter, '  ');
        }

        if (metaNode.content.jsonLd && metaNode.content.jsonLd.length > 0) {
            markdownString += 'schema:\n';
            metaNode.content.jsonLd.forEach(item => {
                if (!item) return;
                const {
                    '@context': _jldContext,
                    '@type': jldType,
                    ...semanticData
                } = item;
                markdownString += `  ${jldType ?? '(unknown type)'}:\n`;
                Object.keys(semanticData).forEach(key => {
                    const value = semanticData[key];
                    markdownString += `    ${key}: ${JSON.stringify(value ?? null)}\n`;
                });
            });
        }
    }

    markdownString += '---\n\n\n';
    return markdownString;
}

// --- Content Rendering (Visitor Pattern) ---

type RenderChildrenCallback = (
    nodes: SemanticMarkdownAST[],
    options?: ConversionOptions,
    indentLevel?: number
) => string;

type NodeRenderer<T extends SemanticMarkdownAST = SemanticMarkdownAST> = (
    node: T,
    options: ConversionOptions | undefined,
    renderChildren: RenderChildrenCallback,
    currentIndentLevel: number
) => string | undefined;

function processNodeContent(
    content: string | SemanticMarkdownAST[],
    renderChildren: RenderChildrenCallback,
    options?: ConversionOptions,
    indentLevel?: number
): string {
    if (typeof content === 'string') {
        return content;
    }
    if (Array.isArray(content)) {
        return renderChildren(content, options, indentLevel);
    }
    return '';
}

type RendererMap = {
    [K in SemanticMarkdownAST['type']]: NodeRenderer<
        Extract<SemanticMarkdownAST, { type: K }>
    >
}

const nodeRenderers: Partial<RendererMap> = {
    text: (node) => {
        return typeof node.content === 'string' ? node.content : '';
    },
    bold: (node, options, renderChildren, indentLevel) => {
        const contentString = processNodeContent(node.content, renderChildren, options, indentLevel);
        return `**${aggressiveTrim(contentString)}**`;
    },
    italic: (node, options, renderChildren, indentLevel) => {
        const contentString = processNodeContent(node.content, renderChildren, options, indentLevel);
        return `*${aggressiveTrim(contentString)}*`;
    },
    strikethrough: (node, options, renderChildren, indentLevel) => {
        const contentString = processNodeContent(node.content, renderChildren, options, indentLevel);
        return `~~${aggressiveTrim(contentString)}~~`;
    },
    link: (node, options, renderChildren, indentLevel) => {
        const linkNode = node;
        const contentString = processNodeContent(linkNode.content, renderChildren, options, indentLevel);
        const trimmedLinkContent = aggressiveTrim(contentString);
        const href = linkNode.href ? encodeURI(linkNode.href) : '';

        // Heuristic for using []() vs <a>: if content was simple text that got trimmed, or is just plain text.
        if (
            trimmedLinkContent &&
            (
                (Array.isArray(linkNode.content) && linkNode.content.length === 1 && linkNode.content[0].type === 'text' && linkNode.content[0].content === trimmedLinkContent) ||
                (typeof linkNode.content === 'string' && linkNode.content === trimmedLinkContent) ||
                (!Array.isArray(linkNode.content) && !trimmedLinkContent.includes('<') && !trimmedLinkContent.includes('\n'))
            )
        ) {
            return `[${trimmedLinkContent}](${href})`;
        }
        return `<a href="${href}">${trimmedLinkContent}</a>`;
    },
    heading: (node, options, renderChildren, indentLevel) => {
        const headingNode = node;
        const contentString = processNodeContent(headingNode.content, renderChildren, options, indentLevel);
        return `${'#'.repeat(headingNode.level)} ${contentString.trim()}\n\n`;
    },
    image: (node) => {
        const imageNode = node;
        const altText = aggressiveTrim(imageNode.alt);
        const srcText = imageNode.src ? encodeURI(imageNode.src) : '';
        return `![${altText}](${srcText})\n`;
    },
    list: (node, options, renderChildren, indentLevel) => {
        const listNode = node;
        let listString = '';
        const itemIndent = ' '.repeat(indentLevel * 2);

        (listNode.items || []).forEach((item, i) => {
            if (!item || !item.content) return;
            const listItemPrefix = listNode.ordered ? `${i + 1}.` : '-';
            const itemContentString = renderChildren(item.content, options, indentLevel + 1).trim();
            listString += `${itemIndent}${listItemPrefix} ${itemContentString}\n`;
        });
        return listString;
    },
    video: (node) => {
        const videoNode = node;
        let videoString = '';
        const videoSrc = videoNode.src ? encodeURI(videoNode.src) : '';
        videoString += `\n![Video](${videoSrc})\n`;
        if (videoNode.poster) {
            const posterSrc = typeof videoNode.poster === 'string' ? encodeURI(videoNode.poster) : '';
            videoString += `![Poster](${posterSrc})\n`;
        }
        if (videoNode.controls !== undefined) {
            videoString += `Controls: ${videoNode.controls}\n`;
        }
        return videoString;
    },
    table: (node, options, renderChildren, indentLevel) => {
        const tableNode = node;
        const rows = tableNode.rows || [];
        if (rows.length === 0) return '';

        const maxColumns = Math.max(0, ...rows.map(row =>
            (row.cells || []).reduce((sum, cell) => sum + Math.max(1, cell?.colspan || 1), 0)
        ));

        if (maxColumns === 0) return '';

        let tableString = '';
        rows.forEach((row, rowIndex) => {
            if (!row || !row.cells) return;
            let currentColumn = 0;
            let rowString = '';
            row.cells.forEach((cell) => {
                if (!cell) return;
                let cellContent = processNodeContent(cell.content, renderChildren, options, indentLevel + 1).trim();
                cellContent = cellContent.replace(/\|/g, '\\|');

                if (cell.colId) cellContent += ` <!-- ${cell.colId} -->`;
                const colspan = Math.max(1, cell.colspan || 1);
                const rowspan = Math.max(1, cell.rowspan || 1);
                if (colspan > 1) cellContent += ` <!-- colspan: ${colspan} -->`;
                if (rowspan > 1) cellContent += ` <!-- rowspan: ${rowspan} -->`;

                rowString += `| ${cellContent} `;
                currentColumn += colspan;
                for (let i = 1; i < colspan; i++) {
                    rowString += '| ';
                }
            });

            while (currentColumn < maxColumns) {
                rowString += '|  ';
                currentColumn++;
            }
            tableString += rowString + '|\n';

        });
        return tableString;
    },
    code: (node) => {
        const codeNode = node;
        const codeContent = codeNode.content || "";
        if (codeNode.inline) {
            return `\`${codeContent}\``;
        } else {
            return `\`\`\`${codeNode.language || ''}\n${codeContent}\n\`\`\`\n`;
        }
    },
    blockquote: (node, options, renderChildren, indentLevel) => {
        const rawBqContent = renderChildren(node.content, options, indentLevel);
        const processedBqContent = rawBqContent
            .trim()
            .split('\n')
            .map(line => `> ${line.trim()}`)
            .join('\n');

        if (processedBqContent.length > 0 && processedBqContent !== ">") {
            return processedBqContent + '\n';
        }
        return '> \n';
    },
    semanticHtml: (node, options, renderChildren, indentLevel) => {
        const htmlNode = node;
        const contentString = renderChildren(htmlNode.content, options, indentLevel);
        switch (htmlNode.htmlType) {
            case "article":
                return contentString;
            case "section":
                return `---\n\n${contentString}\n\n---\n`;
            case "summary":
            case "time":
            case "aside":
            case "nav":
            case "figcaption":
            case "main":
            case "mark":
            case "header":
            case "footer":
            case "details":
            case "figure":
                return `<!-- <${htmlNode.htmlType}> -->\n${contentString}\n<!-- </${htmlNode.htmlType}> -->\n`;
            default:
                // ignore
                return undefined;
        }
    },
    // 'meta' is handled by markdownMetaASTToString, not here.
    // 'custom' is handled by options.renderCustomNode in the main loop.
};

const INLINE_NODE_TYPES = new Set(['text', 'bold', 'italic', 'strikethrough', 'link', 'code']);
const BLOCK_NODE_TYPES = new Set(['heading', 'image', 'list', 'video', 'table', 'code', 'blockquote', 'semanticHtml']);

function markdownContentASTToStringRecursive(
    nodes: SemanticMarkdownAST[],
    options?: ConversionOptions,
    indentLevel: number = 0
): string {
    let markdownString = '';

    const renderChildren: RenderChildrenCallback = (childNodes, childOptions = options, childIndent = indentLevel) => {
        if (typeof childNodes === 'string') return childNodes;
        if (!childNodes || childNodes.length === 0) return '';
        return markdownContentASTToStringRecursive(childNodes, childOptions, childIndent);
    };

    nodes.forEach((node, index) => {
        if (node.type === 'meta') return;

        const nodeRenderingOverride = options?.overrideNodeRenderer?.(node, options, indentLevel);
        if (nodeRenderingOverride !== undefined) {
            markdownString += nodeRenderingOverride;
            return;
        }

        let renderedNodeString: string | undefined;

        if (nodeRenderers[node.type]) {
            renderedNodeString = nodeRenderers[node.type]?.(node as any, options, renderChildren, indentLevel);
        } else if (node.type === 'custom' && options?.renderCustomNode) {
            renderedNodeString = options.renderCustomNode(node, options, indentLevel);
        } else {
            console.warn(`Unhandled Markdown AST node type: ${node.type}`);
            renderedNodeString = '';
        }

        if (renderedNodeString === undefined || renderedNodeString === null) {
            renderedNodeString = '';
        }

        // --- Whitespace and Newline Management ---
        const isCurrentNodeInline = INLINE_NODE_TYPES.has(node.type) && !(node.type === 'code' && !(node).inline);
        const isCurrentNodeBlock = BLOCK_NODE_TYPES.has(node.type) && !(node.type === 'code' && (node).inline);

        if (isCurrentNodeInline) {
            let addSpaceBeforeCurrentNode = false;
            if (markdownString.length > 0 && renderedNodeString.length > 0) {
                const lastCharOfPrevOutput = markdownString.slice(-1);
                const firstCharOfCurrentRenderedNode = renderedNodeString.charAt(0);

                const prevEndsWithSpace = /\s/.test(lastCharOfPrevOutput);
                const currentStartsWithSpace = /\s/.test(firstCharOfCurrentRenderedNode);

                // Punctuation that should not have a leading space if it's the start of the current node.
                const currentStartsWithClingingPunctuation = /^[.,!?;:)]/.test(firstCharOfCurrentRenderedNode);
                // Characters that the previous string might end with, that shouldn't have a following space.
                const prevEndsWithOpeningBracket = /[([]$/.test(lastCharOfPrevOutput);

                if (!prevEndsWithSpace &&
                    !currentStartsWithSpace &&
                    !currentStartsWithClingingPunctuation &&
                    !prevEndsWithOpeningBracket) {
                    addSpaceBeforeCurrentNode = true;
                }
            }
            if (addSpaceBeforeCurrentNode) {
                markdownString += ' ';
            }
            markdownString += renderedNodeString;
        } else if (isCurrentNodeBlock) {
            if (markdownString.length > 0 && !markdownString.endsWith('\n')) {
                markdownString += '\n';
            }
            if (renderedNodeString.length > 0 && markdownString.length > 0 && !markdownString.endsWith('\n\n') && !renderedNodeString.startsWith('\n')) {
                if (!markdownString.endsWith('\n')) markdownString += '\n';
            }

            markdownString += renderedNodeString;

            if (renderedNodeString.length > 0 && index < nodes.length - 1) {
                const nextNode = nodes[index + 1];
                const isNextNodeBlock = BLOCK_NODE_TYPES.has(nextNode.type) && !(nextNode.type === 'code' && (nextNode).inline);

                if (isNextNodeBlock || (nextNode.type === 'code' && !(nextNode).inline)) {
                    if (!renderedNodeString.endsWith('\n\n')) {
                        if (!renderedNodeString.endsWith('\n')) {
                            markdownString += '\n\n';
                        } else {
                            markdownString += '\n';
                        }
                    }
                } else if (!renderedNodeString.endsWith('\n')) {
                    markdownString += '\n';
                }
            }


        } else {
            markdownString += renderedNodeString;
        }
    });

    return markdownString;
}


// --- Main Export ---
export function markdownASTToString(nodes: SemanticMarkdownAST[], options?: ConversionOptions, indentLevel: number = 0): string {
    if (!Array.isArray(nodes)) {
        console.warn("markdownASTToString received non-array input for nodes:", nodes);
        return "";
    }

    const metaOutput = markdownMetaASTToString(nodes, options);
    const contentOutput = markdownContentASTToStringRecursive(nodes, options, indentLevel);
    if (!metaOutput && !contentOutput) {
        return "";
}
    if (contentOutput) {
        return (metaOutput + contentOutput).trimEnd();
    } else {
        return metaOutput;
    }
}