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
