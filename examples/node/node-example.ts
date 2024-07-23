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
import axios from 'axios';
import {JSDOM} from 'jsdom';

async function main() {
    const url = 'https://example.com';
    const response = await axios.get(url);
    const html = response.data;
    const markdown = convertHtmlToMarkdown(html,
        {
            extractMainContent: true,
            overrideDOMParser: new (new JSDOM()).window.DOMParser()
        });
    console.log(markdown);
}

main().catch(console.error);
