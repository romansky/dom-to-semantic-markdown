import {ConversionOptions, SemanticMarkdownAST} from "../types/markdownTypes";

// src/core/htmlToMarkdownAST.ts

export function htmlToMarkdownAST(element: Element, options?: ConversionOptions, indentLevel: number = 0): SemanticMarkdownAST[] {
    let result: SemanticMarkdownAST[] = [];

    const debugLog = (message: string) => {
        if (options?.debug) {
            console.log(message);
        }
    };

    element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const textContent = escapeMarkdownCharacters(node.textContent?.trim() ?? '');
            if (textContent && !!node.textContent) {
                debugLog(`Text Node: '${textContent}'`);
                // preserve whitespaces when text node is not empty
                result.push({type: 'text', content: node.textContent?.trim()});
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const elem = node as Element;
            if (/^h[1-6]$/i.test(elem.tagName)) {
                const level = parseInt(elem.tagName.substring(1)) as 1 | 2 | 3 | 4 | 5 | 6;
                const content = escapeMarkdownCharacters(elem.textContent || '').trim();
                if (content) {
                    debugLog(`Heading ${level}: '${elem.textContent}'`);
                    result.push({type: 'heading', level, content});
                }
            } else if (elem.tagName.toLowerCase() === 'p') {
                debugLog("Paragraph");
                result.push(...htmlToMarkdownAST(elem, options));
                // Add a new line after the paragraph
                result.push({type: 'text', content: '\n\n'});
            } else if (elem.tagName.toLowerCase() === 'a') {
                debugLog(`Link: '${(elem as HTMLAnchorElement).href}' with text '${elem.textContent}'`);
                // Check if the href is a data URL for an image
                if ((elem as HTMLAnchorElement).href.startsWith("data:image")) {
                    // If it's a data URL for an image, skip this link
                    result.push({
                        type: 'link',
                        href: '-',
                        content: htmlToMarkdownAST(elem, options)
                    });
                } else {
                    // Process the link as usual
                    const href = options?.websiteDomain && (elem as HTMLAnchorElement).href.startsWith(options.websiteDomain) ?
                        (elem as HTMLAnchorElement).href.substring(options.websiteDomain.length) :
                        (elem as HTMLAnchorElement).href;
                    // if all children are text,
                    if (Array.from(elem.childNodes).every(_ => _.nodeType === Node.TEXT_NODE)) {
                        result.push({
                            type: 'link',
                            href: href,
                            content: [{type: 'text', content: elem.textContent?.trim() ?? ''}]
                        });
                    } else {
                        result.push({
                            type: 'link',
                            href: href,
                            content: htmlToMarkdownAST(elem, options)
                        });
                    }
                }
            } else if (elem.tagName.toLowerCase() === 'img') {
                debugLog(`Image: src='${(elem as HTMLImageElement).src}', alt='${(elem as HTMLImageElement).alt}'`);
                if ((elem as HTMLImageElement).src.startsWith("data:image")) {
                    result.push({
                        type: 'image',
                        src: '-',
                        alt: escapeMarkdownCharacters((elem as HTMLImageElement).alt)
                    });
                } else {
                    const src = options?.websiteDomain && (elem as HTMLImageElement).src.startsWith(options.websiteDomain) ?
                        (elem as HTMLImageElement).src.substring(options.websiteDomain.length) :
                        (elem as HTMLImageElement).src;
                    result.push({type: 'image', src, alt: escapeMarkdownCharacters((elem as HTMLImageElement).alt)});
                }
            } else if (elem.tagName.toLowerCase() === 'video') {
                debugLog(`Video: src='${(elem as HTMLVideoElement).src}', poster='${(elem as HTMLVideoElement).poster}', controls='${(elem as HTMLVideoElement).controls}'`);
                result.push({
                    type: 'video',
                    src: (elem as HTMLVideoElement).src,
                    poster: escapeMarkdownCharacters((elem as HTMLVideoElement).poster),
                    controls: (elem as HTMLVideoElement).controls
                });
            } else if (elem.tagName.toLowerCase() === 'ul' || elem.tagName.toLowerCase() === 'ol') {
                debugLog(`${elem.tagName.toLowerCase() === 'ul' ? 'Unordered' : 'Ordered'} List`);
                result.push({
                    type: 'list',
                    ordered: elem.tagName.toLowerCase() === 'ol',
                    items: Array.from(elem.children).map(li => ({
                        type: 'listItem',
                        content: htmlToMarkdownAST(li, options, indentLevel + 1)
                    }))
                });
            } else if (elem.tagName.toLowerCase() === 'br') {
                debugLog("Line Break");
                result.push({type: 'text', content: '\n'});
            } else if (elem.tagName.toLowerCase() === 'table') {
                debugLog("Table");
                const tableRows = Array.from(elem.querySelectorAll('tr'));
                const markdownTableRows = tableRows.map(row => {
                    const cells = Array.from(row.querySelectorAll('th, td')).map(cell => {
                        return {
                            type: 'tableCell' as const,
                            content: cell.nodeType === Node.TEXT_NODE
                                ? escapeMarkdownCharacters(cell.textContent?.trim() ?? '')
                                : htmlToMarkdownAST(cell, options, indentLevel + 1),
                        };
                    });
                    return {type: 'tableRow' as const, cells};
                });

                if (markdownTableRows.length > 0) {
                    // Check if the first row contains header cells
                    const hasHeaders = tableRows[0].querySelector('th') !== null;
                    if (hasHeaders) {
                        // Create a header separator row
                        const headerSeparatorCells = Array.from(tableRows[0].querySelectorAll('th, td'))
                            .map(() => ({type: 'tableCell' as const, content: '---'}));
                        const headerSeparatorRow = {type: 'tableRow' as const, cells: headerSeparatorCells};
                        markdownTableRows.splice(1, 0, headerSeparatorRow);
                    }
                }

                result.push({type: 'table', rows: markdownTableRows});
            } else {
                const content = escapeMarkdownCharacters(elem.textContent || '');
                switch (elem.tagName.toLowerCase()) {
                    case 'noscript':
                    case 'script':
                    case 'style':
                    case 'html':
                    case 'head':
                        // blackhole..
                        break;
                    case 'strong':
                    case 'b':
                        if (content) {
                            debugLog(`Bold: '${content}'`);
                            result.push({type: 'bold', content});
                        }
                        break;
                    case 'em':
                    case 'i':
                        if (content) {
                            debugLog(`Italic: '${content}'`);
                            result.push({type: 'italic', content});
                        }
                        break;
                    case 's':
                    case 'strike':
                        if (content) {
                            debugLog(`Strikethrough: '${content}'`);
                            result.push({type: 'strikethrough', content});
                        }
                        break;
                    case 'code':
                        if (content) {
                            // Handling inline code differently
                            const isCodeBlock = elem.parentNode && elem.parentNode.nodeName.toLowerCase() === 'pre';
                            debugLog(`${isCodeBlock ? 'Code Block' : 'Inline Code'}: '${content}'`);
                            result.push({
                                type: 'code',
                                content: elem.innerHTML?.trim() ?? '',
                                inline: !isCodeBlock
                            });
                        }
                        break;
                    case 'blockquote':
                        debugLog(`Blockquote`);
                        result.push({
                            type: 'blockquote',
                            content: htmlToMarkdownAST(elem, options)
                        });
                        break;
                    case 'article':
                    case 'aside':
                    case 'details':
                    case 'figcaption':
                    case 'figure':
                    case 'footer':
                    case 'header':
                    case 'main':
                    case 'mark':
                    case 'nav':
                    case 'section':
                    case 'summary':
                    case 'time':
                        debugLog(`Semantic HTML Element: '${elem.tagName}'`);
                        result.push({
                            type: 'semanticHtml',
                            htmlType: elem.tagName.toLowerCase() as any,
                            content: htmlToMarkdownAST(elem, options)
                        });
                        break;
                    default:
                        debugLog(`Generic HTMLElement: '${elem.tagName}'`);
                        result.push(...htmlToMarkdownAST(elem, options));
                        break;
                }
            }
        }
    });

    return result;
}

function escapeMarkdownCharacters(text: string, isInlineCode = false) {
    if (isInlineCode) {
        // In inline code, we don't escape any characters
        return text;
    }

    // First, replace special HTML characters with their entity equivalents
    let escapedText = text.replace(/&/g, '&amp;') // Replace & first
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Then escape characters that have special meaning in Markdown
    // The list of characters to escape can be adjusted as needed
    escapedText = escapedText.replace(/([\\`*_{}[\]#+!|])/g, '\\$1');
    return escapedText;
}
