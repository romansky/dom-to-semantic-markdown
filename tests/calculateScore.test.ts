import {JSDOM} from 'jsdom';
import {calculateScore} from "../src/core/domUtils";
import {ConversionOptions, convertHtmlToMarkdown} from "../src";

// Helper function to set up the DOM environment
function setupDOM(html: string) {
    const dom = new JSDOM(html);
    global.document = dom.window.document;
    global.window = dom.window as any;

    return {dom, window: dom.window, document: dom.window.document};
}

// Helper function to assert Markdown content (more precise than toContain)
function assertMarkdown(markdownString: string, expectedContent: string[], unexpectedContent: string[]) {
    for (const content of expectedContent) {
        expect(markdownString).toContain(content);
    }
    for (const content of unexpectedContent) {
        expect(markdownString).not.toContain(content);
    }
}

describe('calculateScore', () => {
    const scoreTestCases = [
        {html: '<div id="main">Content</div>', expectedScore: 15}, // id="main" (10) + high impact tag (5)
        {html: '<article>Content</article>', expectedScore: 10},    // tag (5)
        {html: '<div class="content">Content</div>', expectedScore: 15},// class (10)
        {html: '<div><p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p></div>', expectedScore: 10},// Max paragraph score (5)
        {html: '<div data-main>Content</div>', expectedScore: 15},   // data-main (10)
        {html: '<div role="main">Content</div>', expectedScore: 15},    // role="main" (10)
        {html: '<div id="main-content" class="article">Test</div>', expectedScore: 25}, // id, class, tag
        {html: '<div id="article-wrapper"><h1>Article Title</h1><p>Some text.</p></div>', expectedScore: 6}, // paragraph
        {html: '<div class="sidebar">Links and ads</div>', expectedScore: 5},
        {
            html: `<div id="content">
                <p>This is some ${"very ".repeat(50)} long text content.</p>
            </div>`, expectedScore: 17 // content id, #p, long content
        },
        {html: '<div><a href="#">Link</a></div>', expectedScore: 0}, // Only a link - high link density.
        {
            html: `<div>
                <p>Some text.</p>
                <a href="#">Link 1</a>
                <a href="#">Link 2</a>
                <a href="#">Link 3</a>
            </div>`, expectedScore: 6 // #p, high link density
        },
        {
            html: `<div>
            ${"very ".repeat(20)} long text
            </div>`,
            expectedScore: 5, // just link density
        },
        {
            html: `<div>${"a".repeat(1200)}</div>`, expectedScore: 10
        },
        {
            html: `<div><a href="#">${"L".repeat(1200)}</a></div>`, expectedScore: 5
        },
        {html: '<section>Content</section>', expectedScore: 10}, // tag (5)
    ];

    scoreTestCases.forEach(({html, expectedScore}) => {
        test(`HTML: ${html.length > 50 ? html.substring(0, 47) + "..." : html}, Expected Score: ${expectedScore}`, () => {
            const {document} = setupDOM(html);
            const element = document.querySelector('div, article, p, section, main')!; // Select *any* relevant element
            const score = calculateScore(element);

            // Use toBeCloseTo to account for potential floating-point errors in link density calculations, etc.
            // However, since calculateScore doesn't currently produce non-integers, toBe is fine.
            expect(score).toBe(expectedScore);
        });
    });

    test('[role="main"] extraction', () => {
        const html = `
          <!DOCTYPE html>
          <html>
            <head><title>Test Page</title></head>
            <body>
              <header><h1>Page Header</h1></header>
              <div role="main" id="main-content">
                <article>
                  <h2>Article Title</h2>
                  <p>This is the main article content.</p>
                </article>
              </div>
              <aside>Sidebar</aside>
              <footer>Footer</footer>
            </body>
          </html>
        `;
        const {window} = setupDOM(html);
        const options: ConversionOptions = {extractMainContent: true, overrideDOMParser: new window.DOMParser()};
        const markdownString = convertHtmlToMarkdown(html, options);
        assertMarkdown(markdownString,
            ['## Article Title', 'This is the main article content.'],
            ['Page Header', 'Sidebar', 'Footer']
        );
    });

    test('Handles edge case where no content can be extracted', () => {
        const html = `<!DOCTYPE html><html><head><title>Test Page</title></head><body></body></html>`;
        const {window} = setupDOM(html);
        const options: ConversionOptions = {extractMainContent: true, overrideDOMParser: new window.DOMParser()};
        const markdownString = convertHtmlToMarkdown(html, options);

        expect(markdownString).toBe('');
    });

});


