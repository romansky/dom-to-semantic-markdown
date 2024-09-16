import { htmlToMarkdownAST } from './core/htmlToMarkdownAST';
import { markdownASTToString } from './core/markdownASTToString';
import { findMainContent, wrapMainContent } from './core/domUtils';
import { refifyUrls } from './core/urlUtils';
import type { ConversionOptions, SemanticMarkdownAST } from './types/markdownTypes';
export { ConversionOptions, SemanticMarkdownAST };
/**
 * Converts an HTML string to Markdown.
 * @param html The HTML string to convert.
 * @param options Conversion options.
 * @returns The converted Markdown string.
 */
export declare function convertHtmlToMarkdown(html: string, options?: ConversionOptions): string;
/**
 * Converts an HTML Element to Markdown.
 * @param element The HTML Element to convert.
 * @param options Conversion options.
 * @returns The converted Markdown string.
 */
export declare function convertElementToMarkdown(element: Element, options?: ConversionOptions): string;
/**
 * Finds a node in the Markdown AST that matches the given predicate.
 * @param ast The Markdown AST to search.
 * @param predicate A function that returns true for the desired node.
 * @returns The first matching node, or undefined if not found.
 */
export declare function findInMarkdownAST(ast: SemanticMarkdownAST | SemanticMarkdownAST[], predicate: (node: SemanticMarkdownAST) => boolean): SemanticMarkdownAST | undefined;
/**
 * Finds all nodes in the Markdown AST that match the given predicate.
 * @param ast The Markdown AST to search.
 * @param predicate A function that returns true for the desired nodes.
 * @returns An array of all matching nodes.
 */
export declare function findAllInMarkdownAST(ast: SemanticMarkdownAST | SemanticMarkdownAST[], predicate: (node: SemanticMarkdownAST) => boolean): SemanticMarkdownAST[];
export { htmlToMarkdownAST, markdownASTToString, findMainContent, refifyUrls, wrapMainContent };
