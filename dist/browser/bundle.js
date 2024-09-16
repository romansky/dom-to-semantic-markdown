// this is by value copy of the global Node
const _Node = {
    /** node is an element. */
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    /** node is a Text node. */
    TEXT_NODE: 3,
    /** node is a CDATASection node. */
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    /** node is a ProcessingInstruction node. */
    PROCESSING_INSTRUCTION_NODE: 7,
    /** node is a Comment node. */
    COMMENT_NODE: 8,
    /** node is a document. */
    DOCUMENT_NODE: 9,
    /** node is a doctype. */
    DOCUMENT_TYPE_NODE: 10,
    /** node is a DocumentFragment node. */
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12,
    /** Set when node and other are not in the same tree. */
    DOCUMENT_POSITION_DISCONNECTED: 0x01,
    /** Set when other is preceding node. */
    DOCUMENT_POSITION_PRECEDING: 0x02,
    /** Set when other is following node. */
    DOCUMENT_POSITION_FOLLOWING: 0x04,
    /** Set when other is an ancestor of node. */
    DOCUMENT_POSITION_CONTAINS: 0x08,
    /** Set when other is a descendant of node. */
    DOCUMENT_POSITION_CONTAINED_BY: 0x10,
    DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 0x20,
};

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
        else if (childElement.nodeType === _Node.TEXT_NODE) {
            const textContent = escapeMarkdownCharacters(childElement.textContent?.trim() ?? '');
            if (textContent && !!childElement.textContent) {
                debugLog(`Text Node: '${textContent}'`);
                // preserve whitespaces when text childElement is not empty
                result.push({ type: 'text', content: childElement.textContent?.trim() });
            }
        }
        else if (childElement.nodeType === _Node.ELEMENT_NODE) {
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
                    if (Array.from(elem.childNodes).every(_ => _.nodeType === _Node.TEXT_NODE)) {
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
                            content: cell.nodeType === _Node.TEXT_NODE
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

function markdownASTToString(nodes, options, indentLevel = 0) {
    let markdownString = '';
    markdownString += markdownMetaASTToString(nodes, options, indentLevel);
    markdownString += markdownContentASTToString(nodes, options, indentLevel);
    return markdownString;
}
function markdownMetaASTToString(nodes, options, indentLevel = 0) {
    let markdownString = '';
    if (options?.includeMetaData) {
        // include meta-data
        markdownString += '---\n';
        const node = findInMarkdownAST(nodes, _ => _.type === 'meta');
        if (node?.type === 'meta') {
            if (node.content.standard) {
                Object.keys(node.content.standard).forEach(key => {
                    markdownString += `${key}: "${node.content.standard[key]}"\n`;
                });
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
                        const { '@context': jldContext, '@type': jldType, ...semanticData } = item;
                        markdownString += `  ${jldType ?? '(unknown type)'}:\n`;
                        Object.keys(semanticData).forEach(key => {
                            markdownString += `    ${key}: ${JSON.stringify(semanticData[key])}\n`;
                        });
                    });
                }
            }
        }
        markdownString += '---\n\n';
    }
    return markdownString;
}
function markdownContentASTToString(nodes, options, indentLevel = 0) {
    let markdownString = '';
    nodes.forEach((node) => {
        const indent = ' '.repeat(indentLevel * 2); // Adjust the multiplier for different indent sizes
        const nodeRenderingOverride = options?.overrideNodeRenderer?.(node, options, indentLevel);
        if (nodeRenderingOverride) {
            markdownString += nodeRenderingOverride;
        }
        else {
            switch (node.type) {
                case 'text':
                case 'bold':
                case 'italic':
                case 'strikethrough':
                case 'link':
                    const isLastWhitespace = /\s/.test(markdownString.slice(-1));
                    const textNodeTypes = ['text', 'bold', 'italic', 'strikethrough', 'link'];
                    const isStartsWithWhiteSpace = textNodeTypes.includes(node.type) && /\s/.test(node.content.slice(0, 1)[0]);
                    if (!isLastWhitespace && node.content !== '.' && !isStartsWithWhiteSpace) {
                        markdownString += ' ';
                    }
                    if (node.type === 'text') {
                        markdownString += `${indent}${node.content}`;
                    }
                    else if (node.type === 'bold') {
                        markdownString += `**${node.content}**`;
                    }
                    else if (node.type === 'italic') {
                        markdownString += `*${node.content}*`;
                    }
                    else if (node.type === 'strikethrough') {
                        markdownString += `~~${node.content}~~`;
                    }
                    else if (node.type === 'link') {
                        // Check if the link contains only text
                        if (node.content.length === 1 && node.content[0].type === 'text') {
                            // Use native markdown syntax for text-only links
                            markdownString += ` [${node.content[0].content}](${node.href})`;
                        }
                        else {
                            // Use HTML <a> tag for links with rich content
                            const linkContent = markdownContentASTToString(node.content, options, indentLevel + 1);
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
                                cellContent += ' ' + `<!-- ${cell.colId} -->`;
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
                    }
                    else {
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
                    break;
            }
        }
    });
    return markdownString;
}

const debugMessage = (message) => {
};
/**
 * Attempts to find the main content of a web page.
 * @param document The Document object to search.
 * @returns The Element containing the main content, or the body if no main content is found.
 */
function findMainContent(document) {
    const mainElement = document.querySelector('main');
    if (mainElement) {
        return mainElement;
    }
    if (!document.body) {
        return document.documentElement;
    }
    return detectMainContent(document.body);
}
function wrapMainContent(mainContentElement, document) {
    if (mainContentElement.tagName.toLowerCase() !== 'main') {
        const mainElement = document.createElement('main');
        mainContentElement.before(mainElement);
        mainElement.appendChild(mainContentElement);
        mainElement.id = 'detected-main-content';
    }
}
function detectMainContent(rootElement) {
    const candidates = [];
    const minScore = 20;
    collectCandidates(rootElement, candidates, minScore);
    if (candidates.length === 0) {
        return rootElement;
    }
    candidates.sort((a, b) => calculateScore(b) - calculateScore(a));
    let bestIndependentCandidate = candidates[0];
    for (let i = 1; i < candidates.length; i++) {
        if (!candidates.some((otherCandidate, j) => j !== i && otherCandidate.contains(candidates[i]))) {
            if (calculateScore(candidates[i]) > calculateScore(bestIndependentCandidate)) {
                bestIndependentCandidate = candidates[i];
                debugMessage(`New best independent candidate found: ${elementToString(bestIndependentCandidate)}`);
            }
        }
    }
    debugMessage(`Final main content candidate: ${elementToString(bestIndependentCandidate)}`);
    return bestIndependentCandidate;
}
function elementToString(element) {
    if (!element) {
        return 'No element';
    }
    return `${element.tagName}#${element.id || 'no-id'}.${Array.from(element.classList).join('.')}`;
}
function collectCandidates(element, candidates, minScore) {
    const score = calculateScore(element);
    if (score >= minScore) {
        candidates.push(element);
        debugMessage(`Candidate found: ${elementToString(element)}, score: ${score}`);
    }
    Array.from(element.children).forEach(child => {
        collectCandidates(child, candidates, minScore);
    });
}
function calculateScore(element) {
    let score = 0;
    let scoreLog = [];
    // High impact attributes
    const highImpactAttributes = ['article', 'content', 'main-container', 'main', 'main-content'];
    highImpactAttributes.forEach(attr => {
        if (element.classList.contains(attr) || element.id.includes(attr)) {
            score += 10;
            scoreLog.push(`High impact attribute found: ${attr}, score increased by 10`);
        }
    });
    // High impact tags
    const highImpactTags = ['article', 'main', 'section'];
    if (highImpactTags.includes(element.tagName.toLowerCase())) {
        score += 5;
        scoreLog.push(`High impact tag found: ${element.tagName}, score increased by 5`);
    }
    // Paragraph count
    const paragraphCount = element.getElementsByTagName('p').length;
    const paragraphScore = Math.min(paragraphCount, 5);
    if (paragraphScore > 0) {
        score += paragraphScore;
        scoreLog.push(`Paragraph count: ${paragraphCount}, score increased by ${paragraphScore}`);
    }
    // Text content length
    const textContentLength = element.textContent?.trim().length || 0;
    if (textContentLength > 200) {
        const textScore = Math.min(Math.floor(textContentLength / 200), 5);
        score += textScore;
        scoreLog.push(`Text content length: ${textContentLength}, score increased by ${textScore}`);
    }
    // Link density
    const linkDensity = calculateLinkDensity(element);
    if (linkDensity < 0.3) {
        score += 5;
        scoreLog.push(`Link density: ${linkDensity.toFixed(2)}, score increased by 5`);
    }
    // Data attributes
    if (element.hasAttribute('data-main') || element.hasAttribute('data-content')) {
        score += 10;
        scoreLog.push('Data attribute for main content found, score increased by 10');
    }
    // Role attribute
    if (element.getAttribute('role')?.includes('main')) {
        score += 10;
        scoreLog.push('Role attribute indicating main content found, score increased by 10');
    }
    if (scoreLog.length > 0) {
        debugMessage(`Scoring for ${elementToString(element)}:`);
    }
    return score;
}
function calculateLinkDensity(element) {
    const linkLength = Array.from(element.getElementsByTagName('a'))
        .reduce((sum, link) => sum + (link.textContent?.length || 0), 0);
    const textLength = element.textContent?.length || 1; // Avoid division by zero
    return linkLength / textLength;
}

const mediaSuffixes = ["jpeg", "jpg", "png", "gif", "bmp", "tiff", "tif", "svg",
    "webp", "ico", "avi", "mov", "mp4", "mkv", "flv", "wmv", "webm", "mpeg",
    "mpg", "mp3", "wav", "aac", "ogg", "flac", "m4a", "pdf", "doc", "docx",
    "ppt", "pptx", "xls", "xlsx", "txt", "css", "js", "xml", "json",
    "html", "htm"
];
const addRefPrefix = (prefix, prefixesToRefs) => {
    if (!prefixesToRefs[prefix]) {
        prefixesToRefs[prefix] = 'ref' + Object.values(prefixesToRefs).length;
    }
    return prefixesToRefs[prefix];
};
const processUrl = (url, prefixesToRefs) => {
    if (!url.startsWith('http')) {
        return url;
    }
    else {
        const mediaSuffix = url.split('.').slice(-1)[0];
        if (mediaSuffix && mediaSuffixes.includes(mediaSuffix)) {
            const parts = url.split('/'); // Split URL keeping the slash before text
            const prefix = parts.slice(0, -1).join('/'); // Get the prefix by removing last part
            const refPrefix = addRefPrefix(prefix, prefixesToRefs);
            return `${refPrefix}://${parts.slice(-1).join('')}`;
        }
        else {
            if (url.split('/').length > 4) {
                return addRefPrefix(url, prefixesToRefs);
            }
            else {
                return url;
            }
        }
    }
};
function refifyUrls(markdownElement, prefixesToRefs = {}) {
    if (Array.isArray(markdownElement)) {
        markdownElement.forEach(element => refifyUrls(element, prefixesToRefs));
    }
    else {
        switch (markdownElement.type) {
            case 'link':
                markdownElement.href = processUrl(markdownElement.href, prefixesToRefs);
                refifyUrls(markdownElement.content, prefixesToRefs);
                break;
            case 'image':
            case 'video':
                markdownElement.src = processUrl(markdownElement.src, prefixesToRefs);
                break;
            case 'list':
                markdownElement.items.forEach(item => item.content.forEach(_ => refifyUrls(_, prefixesToRefs)));
                break;
            case 'table':
                markdownElement.rows.forEach(row => row.cells.forEach(cell => typeof cell.content === 'string' ? null : refifyUrls(cell.content, prefixesToRefs)));
                break;
            case 'blockquote':
            case 'semanticHtml':
                refifyUrls(markdownElement.content, prefixesToRefs);
                break;
        }
    }
    return prefixesToRefs;
}

const isNot = (tPred) => (t) => !tPred(t);
const isString = (x) => typeof x === "string";
function findInAST(markdownElement, checker) {
    const loopCheck = (z) => {
        for (const element of z) {
            const found = findInAST(element, checker);
            if (found) {
                return found;
            }
        }
        return undefined;
    };
    if (Array.isArray(markdownElement)) {
        return loopCheck(markdownElement);
    }
    else {
        if (checker(markdownElement)) {
            return markdownElement;
        }
        switch (markdownElement.type) {
            case 'link':
                return loopCheck(markdownElement.content);
            case 'list':
                return loopCheck(markdownElement.items
                    .map(_ => _.content)
                    .flat());
            case 'table':
                return loopCheck(markdownElement.rows
                    .map(row => row.cells.map(_ => _.content)
                    .filter(isNot(isString)))
                    .flat());
            case 'blockquote':
            case 'semanticHtml':
                return loopCheck(markdownElement.content);
        }
        return undefined;
    }
}
function findAllInAST(markdownElement, checker) {
    const loopCheck = (z) => {
        let out = [];
        for (const element of z) {
            const found = findAllInAST(element, checker);
            out = [...out, ...found];
        }
        return out;
    };
    if (Array.isArray(markdownElement)) {
        return loopCheck(markdownElement);
    }
    else {
        if (checker(markdownElement)) {
            return [markdownElement];
        }
        switch (markdownElement.type) {
            case 'link':
                return loopCheck(markdownElement.content);
            case 'list':
                return loopCheck(markdownElement.items
                    .map(_ => _.content)
                    .flat());
            case 'table':
                return loopCheck(markdownElement.rows
                    .map(row => row.cells.map(_ => _.content)
                    .filter(isNot(isString)))
                    .flat());
            case 'blockquote':
            case 'semanticHtml':
                return loopCheck(markdownElement.content);
        }
        return [];
    }
}

/**
 * Converts an HTML string to Markdown.
 * @param html The HTML string to convert.
 * @param options Conversion options.
 * @returns The converted Markdown string.
 */
function convertHtmlToMarkdown(html, options) {
    const parser = options?.overrideDOMParser ?? (typeof DOMParser !== 'undefined' ? new DOMParser() : null);
    if (!parser) {
        throw new Error('DOMParser is not available. Please provide an overrideDOMParser in options.');
    }
    const doc = parser.parseFromString(html, 'text/html');
    let element;
    if (options?.extractMainContent) {
        element = findMainContent(doc);
        if (options.includeMetaData && !!doc.querySelector('head')?.innerHTML && !element.querySelector('head')) {
            // content container was found and extracted, re-attaching the head for meta-data extraction
            element = parser.parseFromString(`<html>${doc.head.outerHTML}${element.outerHTML}`, 'text/html').documentElement;
        }
    }
    else {
        // If there's a body, use it; otherwise, use the document element
        if (options?.includeMetaData && !!doc.querySelector('head')?.innerHTML) {
            element = doc.documentElement;
        }
        else {
            element = doc.body || doc.documentElement;
        }
    }
    return convertElementToMarkdown(element, options);
}
/**
 * Converts an HTML Element to Markdown.
 * @param element The HTML Element to convert.
 * @param options Conversion options.
 * @returns The converted Markdown string.
 */
function convertElementToMarkdown(element, options) {
    let ast = htmlToMarkdownAST(element, options);
    if (options?.refifyUrls) {
        options.urlMap = refifyUrls(ast);
    }
    return markdownASTToString(ast, options);
}
/**
 * Finds a node in the Markdown AST that matches the given predicate.
 * @param ast The Markdown AST to search.
 * @param predicate A function that returns true for the desired node.
 * @returns The first matching node, or undefined if not found.
 */
function findInMarkdownAST(ast, predicate) {
    return findInAST(ast, predicate);
}
/**
 * Finds all nodes in the Markdown AST that match the given predicate.
 * @param ast The Markdown AST to search.
 * @param predicate A function that returns true for the desired nodes.
 * @returns An array of all matching nodes.
 */
function findAllInMarkdownAST(ast, predicate) {
    return findAllInAST(ast, predicate);
}

export { convertElementToMarkdown, convertHtmlToMarkdown, findAllInMarkdownAST, findInMarkdownAST, findMainContent, htmlToMarkdownAST, markdownASTToString, refifyUrls, wrapMainContent };
