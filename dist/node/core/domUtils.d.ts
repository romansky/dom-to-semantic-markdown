/**
 * Attempts to find the main content of a web page.
 * @param document The Document object to search.
 * @returns The Element containing the main content, or the body if no main content is found.
 */
export declare function findMainContent(document: Document): Element;
export declare function wrapMainContent(mainContentElement: Element, document: Document): void;
export declare function isElementVisible(element: Element): boolean;
export declare function getVisibleText(element: Element): string;
