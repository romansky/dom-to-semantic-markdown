import {ConversionOptions, SemanticMarkdownAST} from "../types/markdownTypes";

export function markdownASTToString(nodes: SemanticMarkdownAST[], options?: ConversionOptions, indentLevel: number = 0): string {
    let markdownString = '';

    nodes.forEach((node) => {

        const indent = ' '.repeat(indentLevel * 2); // Adjust the multiplier for different indent sizes

        const nodeRenderingOverride = options?.overrideNodeRenderer?.(node, options, indentLevel);
        if (nodeRenderingOverride) {
            markdownString += nodeRenderingOverride;
        } else {
            switch (node.type) {
                case 'text':
                case 'bold':
                case 'italic':
                case 'strikethrough':
                case 'link':
                    const isLastWhitespace = /\s/.test(markdownString.slice(-1));
                    const textNodeTypes = ['text', 'bold', 'italic', 'strikethrough', 'link'];
                    const isStartsWithWhiteSpace = textNodeTypes.includes(node.type) && /\s/.test(node.content.slice(0, 1)[0] as string);

                    if (!isLastWhitespace && node.content !== '.' && !isStartsWithWhiteSpace) {
                        markdownString += ' ';
                    }

                    if (node.type === 'text') {

                        markdownString += `${indent}${node.content}`;
                    } else if (node.type === 'bold') {
                        markdownString += `**${node.content}**`;
                    } else if (node.type === 'italic') {
                        markdownString += `*${node.content}*`;
                    } else if (node.type === 'strikethrough') {
                        markdownString += `~~${node.content}~~`;
                    } else if (node.type === 'link') {
                        // Check if the link contains only text
                        if (node.content.length === 1 && node.content[0].type === 'text') {
                            // Use native markdown syntax for text-only links
                            markdownString += ` [${node.content[0].content}](${node.href})`;
                        } else {
                            // Use HTML <a> tag for links with rich content
                            const linkContent = markdownASTToString(node.content, options);
                            markdownString += ` <a href="${node.href}">${linkContent}</a>`;
                        }
                    }

                    break;
                case 'heading':
                    const isEndsWithNewLine = markdownString.slice(-1) === '\n';
                    if (!isEndsWithNewLine) {
                        markdownString += '\n';
                    }
                    markdownString += `${'#'.repeat(node.level)} ${node.content}\n\n`;
                    break;
                case 'image':
                    if (!node.alt?.trim() || !!node.src?.trim()) {
                        markdownString += `![${node.alt || ''}](${node.src})`;
                    }
                    break;
                case 'list':
                    node.items.forEach((item, i) => {
                        const listItemPrefix = node.ordered ? `${i + 1}.` : '-';
                        const contents = markdownASTToString(item.content, options, indentLevel + 1).trim();
                        if (markdownString.slice(-1) !== '\n') {
                            markdownString += '\n';
                        }
                        if (contents) {
                            markdownString += `${indent}${listItemPrefix} ${contents}\n`;
                        }
                    });
                    markdownString += '\n';
                    break;
                case 'video':
                    markdownString += `\n![Video](${node.src})\n`;
                    if (node.poster) {
                        markdownString += `![Poster](${node.poster})\n`;
                    }
                    if (node.controls) {
                        markdownString += `Controls: ${node.controls}\n`;
                    }
                    markdownString += '\n';
                    break;
                case 'table':
                    node.rows.forEach((row) => {
                        row.cells.forEach((cell) => {
                            let cellContent = typeof cell.content === 'string'
                                ? cell.content
                                : markdownASTToString(cell.content, options, indentLevel + 1).trim();
                            if (cell.colId) {
                                cellContent += ' ' + `<!-- ${cell.colId} -->`
                            }
                            markdownString += `| ${cellContent} `;
                        });
                        markdownString += '|\n';
                    });
                    markdownString += '\n';
                    break;
                case 'code':
                    if (node.inline) {
                        const isLsatWhitespace = /\s/.test(markdownString.slice(-1));
                        if (!isLsatWhitespace) {
                            markdownString += ' ';
                        }
                        markdownString += `\`${node.content}\``;

                    } else {
                        // For code blocks, we do not escape characters and preserve formatting
                        markdownString += '\n```\n';
                        markdownString += `${node.content}\n`;
                        markdownString += '```\n\n';
                    }
                    break;
                case 'blockquote':
                    markdownString += `> ${markdownASTToString(node.content, options).trim()}\n\n`;
                    break;
                case 'semanticHtml':
                    switch (node.htmlType) {
                        case "article":
                            markdownString += '\n\n' + markdownASTToString(node.content, options);
                            break;
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
                            markdownString += `\n\n<-${node.htmlType}->\n` + markdownASTToString(node.content, options) + `\n\n</-${node.htmlType}->\n`;
                            break;
                        case "section":
                            markdownString += '---\n\n';
                            markdownString += markdownASTToString(node.content, options);
                            markdownString += '\n\n';
                            markdownString += '---\n\n';
                            break;
                    }
                    break;
                case "custom":
                    const customNodeRendering = options?.renderCustomNode?.(node, options, indentLevel);
                    if (customNodeRendering) {
                        markdownString += customNodeRendering;
                    }
                    break
                default:
                    break;
            }

        }

    });

    return markdownString;
}
