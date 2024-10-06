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
                    let content = node.content as string; // might be a nodes array but we take care of that below
                    if (Array.isArray(node.content)) {
                        content = markdownContentASTToString(node.content, options, indentLevel);
                    } 
                   
                    const isMarkdownStringNotEmpty = markdownString.length > 0; 
                    const isFirstCharOfContentWhitespace = /\s/.test(content.slice(0, 1));
                    const isLastCharOfMarkdownWhitespace = /\s/.test(markdownString.slice(-1));
                    const isContentPunctuation = content.length === 1 && /^[.,!?;:]/.test(content);

                    if (isMarkdownStringNotEmpty && !isContentPunctuation && !isFirstCharOfContentWhitespace && !isLastCharOfMarkdownWhitespace) {
                        markdownString += ' ';
                    } 

                    if (node.type === 'text') {
                        markdownString += `${indent}${content}`;
                    } else {
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
                                markdownString += `[${content}](${encodeURI(node.href)})`;
                            } else {
                                // Use HTML <a> tag for links with rich content
                                markdownString += `<a href="${node.href}">${content}</a>`;
                            }
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
                    const maxColumns = Math.max(...node.rows.map(row =>
                        row.cells.reduce((sum, cell) => sum + (cell.colspan || 1), 0)
                    ));

                    node.rows.forEach((row) => {
                        let currentColumn = 0;
                        row.cells.forEach((cell) => {
                            let cellContent = typeof cell.content === 'string'
                                ? cell.content
                                : markdownContentASTToString(cell.content, options, indentLevel + 1).trim();

                            if (cell.colId) {
                                cellContent += ` <!-- ${cell.colId} -->`;
                            }

                            if (cell.colspan && cell.colspan > 1) {
                                cellContent += ` <!-- colspan: ${cell.colspan} -->`;
                            }

                            if (cell.rowspan && cell.rowspan > 1) {
                                cellContent += ` <!-- rowspan: ${cell.rowspan} -->`;
                            }

                            markdownString += `| ${cellContent} `;
                            currentColumn += cell.colspan || 1;

                            // Add empty cells for colspan
                            for (let i = 1; i < (cell.colspan || 1); i++) {
                                markdownString += '| ';
                            }
                        });

                        // Fill remaining columns with empty cells
                        while (currentColumn < maxColumns) {
                            markdownString += '|  ';
                            currentColumn++;
                        }

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
