#!/usr/bin/env node
import {program} from 'commander';

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

import {convertHtmlToMarkdown} from 'dom-to-semantic-markdown';
import fs from 'fs/promises';
import {JSDOM} from 'jsdom';

program
    .version('1.0.0')
    .description('Convert DOM to Semantic Markdown')
    .option('-i, --input <file>', 'Input HTML file')
    .option('-o, --output <file>', 'Output Markdown file')
    .option('-e, --extract-main', 'Extract main content')
    .parse(process.argv);

const options = program.opts();

async function main() {
    const html = await fs.readFile(options.input, 'utf-8');
    const markdown = convertHtmlToMarkdown(html, {
        extractMainContent: options.extractMain,
        overrideDOMParser: new (new JSDOM()).window.DOMParser()
    });
    if (options.output) {
        await fs.writeFile(options.output, markdown);
        console.log(`Markdown saved to ${options.output}`);
    } else {
        console.log(markdown);
    }
}

main().catch(console.error);
