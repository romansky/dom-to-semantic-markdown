/**
 * Attempts to find the main content of a web page.
 * @param document The Document object to search.
 * @returns The Element containing the main content, or the body if no main content is found.
 */
export function findMainContent(document: Document): Element {

    const mainElement = document.querySelector('main');
    if (mainElement) {
        return mainElement;
    }

    const articleElement = document.querySelector('article');
    if (articleElement) {
        return articleElement;
    }

    // If no semantic tags are found, use a scoring system
    return findContentByScoring(document.body);
}


export function wrapMainContent(mainContentElement: Element, document: Document) {
    const mainElement = document.querySelector('main');
    const articleElement = document.querySelector('article');

    if (!mainElement && !articleElement) {
        const mainElement: HTMLElement = document.createElement('main');
        mainContentElement.before(mainElement);
        mainElement.appendChild(mainContentElement);
        mainElement.id = 'wrapped-main-content';
    }
}

/**
 * Finds the element most likely to contain the main content using a scoring system.
 * @param rootElement The root element to start the search from.
 * @returns The element with the highest score.
 */
function findContentByScoring(rootElement: Element): Element {
    let bestElement = rootElement;
    let bestScore = scoreElement(rootElement);

    function traverse(element: Element) {
        const score = scoreElement(element);
        if (score > bestScore) {
            bestScore = score;
            bestElement = element;
        }

        // Use children instead of childNodes and ensure we're only dealing with Elements
        Array.from(element.children).forEach((child: Element) => {
            traverse(child);
        });

    }

    traverse(rootElement);
    return bestElement;
}

/**
 * Scores an element based on its likelihood of containing main content.
 * @param element The element to score.
 * @returns A numerical score.
 */
function scoreElement(element: Element): number {
    let score = 0;

    // Prefer certain IDs and classes
    const idAndClass = (element.id + ' ' + element.className).toLowerCase();
    if (/(^|\s)(content|main|article)($|\s)/i.test(idAndClass)) {
        score += 30;
    }
    if (/(^|\s)(sidebar|menu|nav|footer|header)($|\s)/i.test(idAndClass)) {
        score -= 30;
    }

    // Prefer certain tags
    switch (element.tagName.toLowerCase()) {
        case 'div':
        case 'section':
            score += 5;
            break;
        case 'p':
        case 'h1':
        case 'h2':
        case 'h3':
            score += 3;
            break;
        case 'nav':
        case 'sidebar':
        case 'footer':
        case 'header':
            score -= 10;
            break;
    }

    // Prefer elements with more text
    const text = element.textContent || '';
    score += Math.min(Math.floor(text.length / 100), 20);

    // Prefer elements with fewer links relative to their text content
    const links = element.getElementsByTagName('a');
    if (text.length > 0) {
        const linkDensity = links.length / text.length;
        if (linkDensity < 0.1) {
            score += 10;
        } else if (linkDensity > 0.5) {
            score -= 10;
        }
    }

    return score;
}

/**
 * Checks if an element is visible.
 * @param element The element to check.
 * @returns True if the element is visible, false otherwise.
 */
export function isElementVisible(element: Element): boolean {
    if (!(element instanceof HTMLElement)) {
        return true; // Non-HTMLElements are considered visible
    }

    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

/**
 * Gets the text content of an element, excluding hidden elements.
 * @param element The element to get text from.
 * @returns The visible text content of the element.
 */
export function getVisibleText(element: Element): string {
    if (!isElementVisible(element)) {
        return '';
    }

    let text = '';
    for (const child of Array.from(element.children)) {
        if (child.nodeType === Node.TEXT_NODE) {
            text += child.textContent;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            text += getVisibleText(child);
        }
    }

    return text.trim();
}
