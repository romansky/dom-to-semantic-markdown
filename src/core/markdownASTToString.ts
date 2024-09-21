import {ConversionOptions, SemanticMarkdownAST} from "../types/markdownTypes";
import {findInMarkdownAST} from "../index";

export function markdownASTToString(nodes: SemanticMarkdownAST[], options?: ConversionOptions, indentLevel: number = 0): string {
    let markdownString = '';
    markdownString += markdownMetaASTToString(nodes, options, indentLevel);
    markdownString += markdownContentASTToString(nodes, options, indentLevel);
    return markdownString;
}

function markdownMetaASTToString(nodes: SemanticMarkdownAST[], options?: ConversionOptions, indentLevel: number = 0): string {
    let markdownString = '';

    if (options?.includeMetaData) {
        // include meta-data
        markdownString += '---\n';
        const node = findInMarkdownAST(nodes, _ => _.type === 'meta');
        if (node?.type === 'meta') {
            if (node.content.standard) {
                Object.keys(node.content.standard).forEach(key => {
                    markdownString += `${key}: "${node.content.standard![key]}"\n`;
                })
            }

            if (options.includeMetaData === 'extended') {
                if (node.content.openGraph) {
                    if (Object.keys(node.content.openGraph).length > 0) {
                        markdownString += 'openGraph:\n';
                        for (const [key, value] of Object.entries(node.content.openGraph)) {
                            markdownString += `  ${key}: "${value}"\n`;
                        }
                    }
                }

                if (node.content.twitter) {
                    if (Object.keys(node.content.twitter).length > 0) {
                        markdownString += 'twitter:\n';
                        for (const [key, value] of Object.entries(node.content.twitter)) {
                            markdownString += `  ${key}: "${value}"\n`;
                        }
                    }
                }

                if (node.content.jsonLd && node.content.jsonLd.length > 0) {
                    markdownString += 'schema:\n';
                    node.content.jsonLd.forEach(item => {

                        const {
                            '@context': jldContext, '@type': jldType,
                            ...semanticData
                        } = item;
                        markdownString += `  ${jldType ?? '(unknown type)'}:\n`;
                        Object.keys(semanticData).forEach(key => {
                            markdownString += `    ${key}: ${JSON.stringify(semanticData[key])}\n`;
                        })
                    })

                }
            }
        }
        markdownString += '---\n\n';


    }

    return markdownString;
}

function markdownContentASTToString(nodes: SemanticMarkdownAST[], options?: ConversionOptions, indentLevel: number = 0): string {
    let markdownString = '';

    nodes.forEach((node, index) => {
        const indent = ' '.repeat(indentLevel * 2); // adjust the multiplier for different indent sizes

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
                    const prevNode = index > 0 ? nodes[index - 1] : null;
                    const nextNode = index < nodes.length - 1 ? nodes[index + 1] : null;
                    const isPrevNodeFormatting = prevNode && ['bold', 'italic', 'strikethrough', 'link'].includes(prevNode.type);
                    const isNextNodePunctuation = nextNode && nextNode.type === 'text' && /^[.,!?;:]/.test(nextNode.content);

                    if (node.type === 'text') {
                        if (!isPrevNodeFormatting && !isNextNodePunctuation && !/^\s/.test(node.content) && markdownString.length > 0 && !/\s/.test(markdownString.slice(-1))) {
                            markdownString += ' ';
                        }
                        markdownString += `${indent}${node.content}`;
                    } else {
                        let content = '';
                        if (Array.isArray(node.content)) {
                            content = markdownContentASTToString(node.content, options, indentLevel);
                        } else {
                            content = node.content;
                        }
                        content = content.trim();

                        if (!isPrevNodeFormatting && markdownString.length > 0 && !/\s/.test(markdownString.slice(-1))) {
                            markdownString += ' ';
                        }

                        if (node.type === 'bold') {
                            markdownString += `**${content}**`;
                        } else if (node.type === 'italic') {
                            markdownString += `*${content}*`;
                        } else if (node.type === 'strikethrough') {
                            markdownString += `~~${content}~~`;
                        } else if (node.type === 'link') {
                            // check if the link contains only text
                            if (node.content.length === 1 && node.content[0].type === 'text') {
                                // use native markdown syntax for text-only links
                                markdownString += `[${content}](${node.href})`;
                            } else {
                                // Use HTML <a> tag for links with rich content
                                markdownString += `<a href="${node.href}">${content}</a>`;
                            }
                        }

                        // Add space after closing tag if next node is not punctuation
                        if (!isNextNodePunctuation && nextNode) {
                            markdownString += ' ';
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
                        const contents = markdownContentASTToString(item.content, options, indentLevel + 1).trim();
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
                                : markdownContentASTToString(cell.content, options, indentLevel + 1).trim();
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
                        markdownString += '\n```' + (node.language ?? '') + '\n';
                        markdownString += `${node.content}\n`;
                        markdownString += '```\n\n';
                    }
                    break;
                case 'blockquote':
                    markdownString += `> ${markdownContentASTToString(node.content, options).trim()}\n\n`;
                    break;
                case "meta":
                    // already handled
                    break;
                case 'semanticHtml':
                    switch (node.htmlType) {
                        case "article":
                            markdownString += '\n\n' + markdownContentASTToString(node.content, options);
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
                            markdownString += `\n\n<-${node.htmlType}->\n` + markdownContentASTToString(node.content, options) + `\n\n</-${node.htmlType}->\n`;
                            break;
                        case "section":
                            markdownString += '---\n\n';
                            markdownString += markdownContentASTToString(node.content, options);
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
