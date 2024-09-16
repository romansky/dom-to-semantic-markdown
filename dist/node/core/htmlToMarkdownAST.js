"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.htmlToMarkdownAST = htmlToMarkdownAST;
const ElementNode_1 = require("./ElementNode");
function htmlToMarkdownAST(element, options, indentLevel = 0) {
    let result = [];
    const debugLog = (message) => {
        if (options?.debug) {
            console.log(message);
        }
    };
    element.childNodes.forEach((childElement) => {
        const overriddenElementProcessing = options?.overrideElementProcessing?.(childElement, options, indentLevel);
        if (overriddenElementProcessing) {
            debugLog(`Element Processing Overridden: '${childElement.nodeType}'`);
            result.push(...overriddenElementProcessing);
        }
        else if (childElement.nodeType === ElementNode_1._Node.TEXT_NODE) {
            const textContent = escapeMarkdownCharacters(childElement.textContent?.trim() ?? '');
            if (textContent && !!childElement.textContent) {
                debugLog(`Text Node: '${textContent}'`);
                // preserve whitespaces when text childElement is not empty
                result.push({ type: 'text', content: childElement.textContent?.trim() });
            }
        }
        else if (childElement.nodeType === ElementNode_1._Node.ELEMENT_NODE) {
            const elem = childElement;
            if (/^h[1-6]$/i.test(elem.tagName)) {
                const level = parseInt(elem.tagName.substring(1));
                const content = escapeMarkdownCharacters(elem.textContent || '').trim();
                if (content) {
                    debugLog(`Heading ${level}: '${elem.textContent}'`);
                    result.push({ type: 'heading', level, content });
                }
            }
            else if (elem.tagName.toLowerCase() === 'p') {
                debugLog("Paragraph");
                result.push(...htmlToMarkdownAST(elem, options));
                // Add a new line after the paragraph
                result.push({ type: 'text', content: '\n\n' });
            }
            else if (elem.tagName.toLowerCase() === 'a') {
                debugLog(`Link: '${elem.href}' with text '${elem.textContent}'`);
                // Check if the href is a data URL for an image
                if (typeof elem.href === 'string' && elem.href.startsWith("data:image")) {
                    // If it's a data URL for an image, skip this link
                    result.push({
                        type: 'link',
                        href: '-',
                        content: htmlToMarkdownAST(elem, options)
                    });
                }
                else {
                    // Process the link as usual
                    let href = elem.href;
                    if (typeof href === 'string') {
                        href = options?.websiteDomain && href.startsWith(options.websiteDomain) ?
                            href.substring(options.websiteDomain.length) : href;
                    }
                    else {
                        href = '#'; // Use a default value when href is not a string
                    }
                    // if all children are text,
                    if (Array.from(elem.childNodes).every(_ => _.nodeType === ElementNode_1._Node.TEXT_NODE)) {
                        result.push({
                            type: 'link',
                            href: href,
                            content: [{ type: 'text', content: elem.textContent?.trim() ?? '' }]
                        });
                    }
                    else {
                        result.push({
                            type: 'link',
                            href: href,
                            content: htmlToMarkdownAST(elem, options)
                        });
                    }
                }
            }
            else if (elem.tagName.toLowerCase() === 'img') {
                debugLog(`Image: src='${elem.src}', alt='${elem.alt}'`);
                if (elem.src?.startsWith("data:image")) {
                    result.push({
                        type: 'image',
                        src: '-',
                        alt: escapeMarkdownCharacters(elem.alt)
                    });
                }
                else {
                    const src = options?.websiteDomain && elem.src?.startsWith(options.websiteDomain) ?
                        elem.src?.substring(options.websiteDomain.length) :
                        elem.src;
                    result.push({ type: 'image', src, alt: escapeMarkdownCharacters(elem.alt) });
                }
            }
            else if (elem.tagName.toLowerCase() === 'video') {
                debugLog(`Video: src='${elem.src}', poster='${elem.poster}', controls='${elem.controls}'`);
                result.push({
                    type: 'video',
                    src: elem.src,
                    poster: escapeMarkdownCharacters(elem.poster),
                    controls: elem.controls
                });
            }
            else if (elem.tagName.toLowerCase() === 'ul' || elem.tagName.toLowerCase() === 'ol') {
                debugLog(`${elem.tagName.toLowerCase() === 'ul' ? 'Unordered' : 'Ordered'} List`);
                result.push({
                    type: 'list',
                    ordered: elem.tagName.toLowerCase() === 'ol',
                    items: Array.from(elem.children).map(li => ({
                        type: 'listItem',
                        content: htmlToMarkdownAST(li, options, indentLevel + 1)
                    }))
                });
            }
            else if (elem.tagName.toLowerCase() === 'br') {
                debugLog("Line Break");
                result.push({ type: 'text', content: '\n' });
            }
            else if (elem.tagName.toLowerCase() === 'table') {
                debugLog("Table");
                let colIds = [];
                if (options?.enableTableColumnTracking) {
                    // Generate unique column IDs
                    const headerCells = Array.from(elem.querySelectorAll('th'));
                    headerCells.forEach((_, index) => {
                        colIds.push(`col-${index}`);
                    });
                }
                const tableRows = Array.from(elem.querySelectorAll('tr'));
                const markdownTableRows = tableRows.map(row => {
                    const cells = Array.from(row.querySelectorAll('th, td')).map((cell, columnIndex) => {
                        return {
                            type: 'tableCell',
                            content: cell.nodeType === ElementNode_1._Node.TEXT_NODE
                                ? escapeMarkdownCharacters(cell.textContent?.trim() ?? '')
                                : htmlToMarkdownAST(cell, options, indentLevel + 1),
                            colId: colIds[columnIndex]
                        };
                    });
                    return { type: 'tableRow', cells };
                });
                if (markdownTableRows.length > 0) {
                    // Check if the first row contains header cells
                    const hasHeaders = tableRows[0].querySelector('th') !== null;
                    if (hasHeaders) {
                        // Create a header separator row
                        const headerSeparatorCells = Array.from(tableRows[0].querySelectorAll('th, td'))
                            .map(() => ({ type: 'tableCell', content: '---', colId: undefined }));
                        const headerSeparatorRow = {
                            type: 'tableRow', cells: headerSeparatorCells
                        };
                        markdownTableRows.splice(1, 0, headerSeparatorRow);
                    }
                }
                result.push({ type: 'table', rows: markdownTableRows, colIds });
            }
            else if (elem.tagName.toLowerCase() === 'head' && !!options?.includeMetaData) {
                const node = {
                    type: 'meta',
                    content: {
                        standard: {},
                        openGraph: {},
                        twitter: {},
                    }
                };
                elem.querySelectorAll('title')
                    .forEach(titleElem => {
                    node.content.standard['title'] = escapeMarkdownCharacters(titleElem.text);
                });
                // Extract meta tags
                const metaTags = elem.querySelectorAll('meta');
                const nonSemanticTagNames = [
                    "viewport",
                    "referrer",
                    "Content-Security-Policy"
                ];
                metaTags.forEach(metaTag => {
                    const name = metaTag.getAttribute('name');
                    const property = metaTag.getAttribute('property');
                    const content = metaTag.getAttribute('content');
                    if (property && property.startsWith('og:') && content) {
                        if (options.includeMetaData === 'extended') {
                            node.content.openGraph[property.substring(3)] = content;
                        }
                    }
                    else if (name && name.startsWith('twitter:') && content) {
                        if (options.includeMetaData === 'extended') {
                            node.content.twitter[name.substring(8)] = content;
                        }
                    }
                    else if (name && !nonSemanticTagNames.includes(name) && content) {
                        node.content.standard[name] = content;
                    }
                });
                // Extract JSON-LD data
                if (options.includeMetaData === 'extended') {
                    const jsonLdData = [];
                    const jsonLDScripts = elem.querySelectorAll('script[type="application/ld+json"]');
                    jsonLDScripts.forEach(script => {
                        try {
                            const jsonContent = script.textContent;
                            if (jsonContent) {
                                const parsedData = JSON.parse(jsonContent);
                                jsonLdData.push(parsedData);
                            }
                        }
                        catch (error) {
                            console.error('Failed to parse JSON-LD', error);
                        }
                    });
                    node.content.jsonLd = jsonLdData;
                }
                result.push(node);
            }
            else {
                const content = escapeMarkdownCharacters(elem.textContent || '');
                switch (elem.tagName.toLowerCase()) {
                    case 'noscript':
                    case 'script':
                    case 'style':
                    case 'html':
                        // blackhole..
                        break;
                    case 'strong':
                    case 'b':
                        if (content) {
                            debugLog(`Bold: '${content}'`);
                            result.push({ type: 'bold', content });
                        }
                        break;
                    case 'em':
                    case 'i':
                        if (content) {
                            debugLog(`Italic: '${content}'`);
                            result.push({ type: 'italic', content });
                        }
                        break;
                    case 's':
                    case 'strike':
                        if (content) {
                            debugLog(`Strikethrough: '${content}'`);
                            result.push({ type: 'strikethrough', content });
                        }
                        break;
                    case 'code':
                        if (content) {
                            // Handling inline code differently
                            const isCodeBlock = elem.parentNode && elem.parentNode.nodeName.toLowerCase() === 'pre';
                            debugLog(`${isCodeBlock ? 'Code Block' : 'Inline Code'}: '${content}'`);
                            const languageClass = elem.className?.split(" ").find(cls => cls.startsWith("language-"));
                            const language = languageClass ? languageClass.replace("language-", "") : "";
                            result.push({
                                type: 'code',
                                content: elem.textContent?.trim() ?? '',
                                language,
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
                            htmlType: elem.tagName.toLowerCase(),
                            content: htmlToMarkdownAST(elem, options)
                        });
                        break;
                    default:
                        const unhandledElementProcessing = options?.processUnhandledElement?.(elem, options, indentLevel);
                        if (unhandledElementProcessing) {
                            debugLog(`Processing Unhandled Element: '${elem.tagName}'`);
                            result.push(...unhandledElementProcessing);
                        }
                        else {
                            debugLog(`Generic HTMLElement: '${elem.tagName}'`);
                            result.push(...htmlToMarkdownAST(elem, options, indentLevel + 1));
                        }
                        break;
                }
            }
        }
    });
    return result;
}
function escapeMarkdownCharacters(text, isInlineCode = false) {
    if (isInlineCode || !text?.trim()) {
        // In inline code, we don't escape any characters
        return text;
    }
    // First, replace special HTML characters with their entity equivalents
    let escapedText = text.replace(/&/g, '&amp;') // Replace & first
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    // Then escape characters that have special meaning in Markdown
    escapedText = escapedText.replace(/([\\`*_{}[\]#+!|])/g, '\\$1');
    return escapedText;
}
