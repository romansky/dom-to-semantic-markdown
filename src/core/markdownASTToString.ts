import {SemanticMarkdownAST} from "../types/markdownTypes";

export function markdownASTToString(elements: SemanticMarkdownAST[], indentLevel: number = 0): string {
    let markdownString = '';

    elements.forEach((element, i) => {

        const indent = ' '.repeat(indentLevel * 2); // Adjust the multiplier for different indent sizes

        switch (element.type) {
            case 'text':
            case 'bold':
            case 'italic':
            case 'strikethrough':
            case 'link':
                const isLastWhitespace = /\s/.test(markdownString.slice(-1));
                const textElementTypes = ['text', 'bold', 'italic', 'strikethrough', 'link'];
                const isStartsWithWhiteSpace = textElementTypes.includes(element.type) && /\s/.test(element.content.slice(0, 1)[0] as string);

                if (!isLastWhitespace && element.content !== '.' && !isStartsWithWhiteSpace) {
                    markdownString += ' ';
                }

                if (element.type === 'text') {

                    markdownString += `${indent}${element.content}`;
                } else if (element.type === 'bold') {
                    markdownString += `**${element.content}**`;
                } else if (element.type === 'italic') {
                    markdownString += `*${element.content}*`;
                } else if (element.type === 'strikethrough') {
                    markdownString += `~~${element.content}~~`;
                } else if (element.type === 'link') {
                    // Check if the link contains only text
                    if (element.content.length === 1 && element.content[0].type === 'text') {
                        // Use native markdown syntax for text-only links
                        markdownString += ` [${element.content[0].content}](${element.href})`;
                    } else {
                        // Use HTML <a> tag for links with rich content
                        const linkContent = markdownASTToString(element.content);
                        markdownString += ` <a href="${element.href}">${linkContent}</a>`;
                    }
                }

                break;
            case 'heading':
                const isEndsWithNewLine = markdownString.slice(-1) === '\n';
                if (!isEndsWithNewLine) {
                    markdownString += '\n';
                }
                markdownString += `${'#'.repeat(element.level)} ${element.content}\n\n`;
                break;
            case 'image':
                if (!element.alt?.trim() || !!element.src?.trim()) {
                    markdownString += `![${element.alt || ''}](${element.src})`;
                }
                break;
            case 'list':
                element.items.forEach((item, i) => {
                    const listItemPrefix = element.ordered ? `${i + 1}.` : '-';
                    const contents = markdownASTToString(item.content, indentLevel + 1).trim();
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
                markdownString += `\n![Video](${element.src})\n`;
                if (element.poster) {
                    markdownString += `![Poster](${element.poster})\n`;
                }
                if (element.controls) {
                    markdownString += `Controls: ${element.controls}\n`;
                }
                markdownString += '\n';
                break;
            case 'table':
                element.rows.forEach((row) => {
                    row.cells.forEach((cell) => {
                        let cellContent = typeof cell.content === 'string'
                            ? cell.content
                            : markdownASTToString(cell.content, indentLevel + 1).trim();
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
                if (element.inline) {
                    const isLsatWhitespace = /\s/.test(markdownString.slice(-1));
                    if (!isLsatWhitespace) {
                        markdownString += ' ';
                    }
                    markdownString += `\`${element.content}\``;

                } else {
                    // For code blocks, we do not escape characters and preserve formatting
                    markdownString += '\n```\n';
                    markdownString += `${element.content}\n`;
                    markdownString += '```\n\n';
                }
                break;
            case 'blockquote':
                markdownString += `> ${markdownASTToString(element.content).trim()}\n\n`;
                break;
            case 'semanticHtml':
                switch (element.htmlType) {
                    case "article":
                        markdownString += '\n\n' + markdownASTToString(element.content);
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
                        markdownString += `\n\n<-${element.htmlType}->\n` + markdownASTToString(element.content) + `\n\n</-${element.htmlType}->\n`;
                        break;
                    case "section":
                        markdownString += '---\n\n';
                        markdownString += markdownASTToString(element.content);
                        markdownString += '\n\n';
                        markdownString += '---\n\n';
                        break;
                }
                break;
            default:
                break;
        }
    });

    return markdownString;
}
