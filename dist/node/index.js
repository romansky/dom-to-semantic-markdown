"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapMainContent = exports.refifyUrls = exports.findMainContent = exports.markdownASTToString = exports.htmlToMarkdownAST = void 0;
exports.convertHtmlToMarkdown = convertHtmlToMarkdown;
exports.convertElementToMarkdown = convertElementToMarkdown;
exports.findInMarkdownAST = findInMarkdownAST;
exports.findAllInMarkdownAST = findAllInMarkdownAST;
const htmlToMarkdownAST_1 = require("./core/htmlToMarkdownAST");
Object.defineProperty(exports, "htmlToMarkdownAST", { enumerable: true, get: function () { return htmlToMarkdownAST_1.htmlToMarkdownAST; } });
const markdownASTToString_1 = require("./core/markdownASTToString");
Object.defineProperty(exports, "markdownASTToString", { enumerable: true, get: function () { return markdownASTToString_1.markdownASTToString; } });
const domUtils_1 = require("./core/domUtils");
Object.defineProperty(exports, "findMainContent", { enumerable: true, get: function () { return domUtils_1.findMainContent; } });
Object.defineProperty(exports, "wrapMainContent", { enumerable: true, get: function () { return domUtils_1.wrapMainContent; } });
const urlUtils_1 = require("./core/urlUtils");
Object.defineProperty(exports, "refifyUrls", { enumerable: true, get: function () { return urlUtils_1.refifyUrls; } });
const astUtils_1 = require("./core/astUtils");
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
        element = (0, domUtils_1.findMainContent)(doc);
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
    let ast = (0, htmlToMarkdownAST_1.htmlToMarkdownAST)(element, options);
    if (options?.refifyUrls) {
        options.urlMap = (0, urlUtils_1.refifyUrls)(ast);
    }
    return (0, markdownASTToString_1.markdownASTToString)(ast, options);
}
/**
 * Finds a node in the Markdown AST that matches the given predicate.
 * @param ast The Markdown AST to search.
 * @param predicate A function that returns true for the desired node.
 * @returns The first matching node, or undefined if not found.
 */
function findInMarkdownAST(ast, predicate) {
    return (0, astUtils_1.findInAST)(ast, predicate);
}
/**
 * Finds all nodes in the Markdown AST that match the given predicate.
 * @param ast The Markdown AST to search.
 * @param predicate A function that returns true for the desired nodes.
 * @returns An array of all matching nodes.
 */
function findAllInMarkdownAST(ast, predicate) {
    return (0, astUtils_1.findAllInAST)(ast, predicate);
}
