import {htmlToMarkdownAST} from './core/htmlToMarkdownAST';
import {markdownASTToString} from './core/markdownASTToString';
import {findMainContent, wrapMainContent} from './core/domUtils';
import {refifyUrls} from './core/urlUtils';
import {findInAST, findAllInAST} from './core/astUtils';
import type {ConversionOptions, SemanticMarkdownAST} from './types/markdownTypes';

export {ConversionOptions, SemanticMarkdownAST};

/**
 * Converts an HTML string to Markdown.
 * @param html The HTML string to convert.
 * @param options Conversion options.
 * @returns The converted Markdown string.
 */
export function convertHtmlToMarkdown(html: string, options?: ConversionOptions): string {
    const parser = options?.overrideDOMParser ?? (typeof DOMParser !== 'undefined' ? new DOMParser() : null);
    if (!parser) {
        throw new Error('DOMParser is not available. Please provide an overrideDOMParser in options.');
    }

    const doc = parser.parseFromString(html, 'text/html');
    let element: Element;

    if (options?.extractMainContent) {
        element = findMainContent(doc);
        if (options.includeMetaData && !!doc.querySelector('head')?.innerHTML && !element.querySelector('head')) {
            // content container was found and extracted, re-attaching the head for meta-data extraction
            element = parser.parseFromString(
                `<html>${doc.head.outerHTML}${element.outerHTML}`,
                'text/html'
            ).documentElement;
        }
    } else {
        // If there's a body, use it; otherwise, use the document element
        if (options?.includeMetaData && !!doc.querySelector('head')?.innerHTML) {
            element = doc.documentElement;
        } else {
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
export function convertElementToMarkdown(element: Element, options?: ConversionOptions): string {
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
export function findInMarkdownAST(ast: SemanticMarkdownAST | SemanticMarkdownAST[], predicate: (node: SemanticMarkdownAST) => boolean): SemanticMarkdownAST | undefined {
    return findInAST(ast, predicate);
}

/**
 * Finds all nodes in the Markdown AST that match the given predicate.
 * @param ast The Markdown AST to search.
 * @param predicate A function that returns true for the desired nodes.
 * @returns An array of all matching nodes.
 */
export function findAllInMarkdownAST(ast: SemanticMarkdownAST | SemanticMarkdownAST[], predicate: (node: SemanticMarkdownAST) => boolean): SemanticMarkdownAST[] {
    return findAllInAST(ast, predicate);
}

// Re-export core functions for advanced usage
export {htmlToMarkdownAST, markdownASTToString, findMainContent, refifyUrls, wrapMainContent};
