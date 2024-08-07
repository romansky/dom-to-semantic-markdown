#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
// Add these lines to define Node constants
// @ts-ignore
global.Node = {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
};
const dom_to_semantic_markdown_1 = require("dom-to-semantic-markdown");
const axios_1 = __importDefault(require("axios"));
const promises_1 = __importDefault(require("fs/promises"));
const jsdom_1 = require("jsdom");
commander_1.program
    .version('1.0.0')
    .description('Convert DOM to Semantic Markdown')
    .option('-i, --input <file>', 'Input HTML file')
    .option('-o, --output <file>', 'Output Markdown file')
    .option('-e, --extract-main', 'Extract main content')
    .option('-u, --url <url>', 'URL to fetch HTML content from')
    .option('-t, --track-table-columns', 'Enable table column tracking for improved LLM data correlation')
    .option(`-meta, --include-meta-data <"basic" | "extended">`, 'Include metadata extracted from the HTML head')
    .parse(process.argv);
const options = commander_1.program.opts();
async function main() {
    let html;
    if (options.url) {
        const response = await axios_1.default.get(options.url);
        html = response.data;
    }
    else if (options.input) {
        html = await promises_1.default.readFile(options.input, 'utf-8');
    }
    else {
        console.error('Either an input file or a URL must be specified.');
        process.exit(1);
    }
    const markdown = (0, dom_to_semantic_markdown_1.convertHtmlToMarkdown)(html, {
        extractMainContent: options.extractMain,
        overrideDOMParser: new (new jsdom_1.JSDOM()).window.DOMParser(),
        enableTableColumnTracking: options.trackTableColumns,
        includeMetaData: options.includeMetaData,
    });
    if (options.output) {
        await promises_1.default.writeFile(options.output, markdown);
        console.log(`Markdown saved to ${options.output}`);
    }
    else {
        console.log(markdown);
    }
}
main().catch(console.error);
