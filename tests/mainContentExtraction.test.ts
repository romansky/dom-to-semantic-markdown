import {JSDOM} from 'jsdom';
import {
    ConversionOptions,
    convertHtmlToMarkdown,
    wrapMainContent
} from '../src';

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

describe('Main Content Extraction', () => {
    test('Extracts main content by simple method (<main> tag)', () => {
        const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Test Page</title></head>
        <body>
          <header><h1>Page Header</h1></header>
          <main id="main-content">
            <article>
              <h2>Article Title</h2>
              <p>This is the main article content.</p>
            </article>
          </main>
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

    test('Re-attaching head, should return meta', () => {
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
            <title>Test Page</title>
            <meta name="description" content="This is a test page">
        </head>
        <body>
          <div id="content">
            <p>This is the main content.</p>
          </div>
          <aside>Sidebar</aside>
        </body>
      </html>
    `;
        const {window} = setupDOM(html);
        const options: ConversionOptions = {
            extractMainContent: true,
            overrideDOMParser: new window.DOMParser(),
            includeMetaData: 'basic'
        };
        const markdownString = convertHtmlToMarkdown(html, options);

        assertMarkdown(markdownString,
            ['description: "This is a test page"', 'This is the main content.'],
            []
        );
    });

    test('Nested articles and sections', () => {
        const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Test Page</title></head>
        <body>
          <main>
            <article>
              <h2>Article 1</h2>
              <p>Content 1</p>
              <section>
                <h3>Subsection</h3>
                <p>Subsection content</p>
              </section>
            </article>
            <article>
              <h2>Article 2</h2>
              <p>Content 2</p>
            </article>
          </main>
        </body>
      </html>
    `;
        const {window} = setupDOM(html);
        const options: ConversionOptions = {extractMainContent: true, overrideDOMParser: new window.DOMParser()};
        const markdownString = convertHtmlToMarkdown(html, options);

        assertMarkdown(markdownString,
            ['## Article 1', 'Content 1', '### Subsection', 'Subsection content', '## Article 2', 'Content 2'],
            []
        );
    });

    test('Content spread across multiple divs', () => {
        const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Test Page</title></head>
        <body>
          <div class="content-part">
            <p>Part 1</p>
          </div>
          <div class="content-part">
            <p>Part 2</p>
          </div>
        </body>
      </html>
    `;
        const {window} = setupDOM(html);
        const options: ConversionOptions = {extractMainContent: true, overrideDOMParser: new window.DOMParser()};
        const markdownString = convertHtmlToMarkdown(html, options);

        assertMarkdown(markdownString,
            ['Part 1', 'Part 2'],
            []
        );
    });

    test('Handles comments correctly (should be ignored)', () => {
        const html = `
    <!DOCTYPE html>
    <html>
      <head><title>Test Page</title></head>
      <body>
        <main>
          <p>Main content.</p>
          <!-- This is a comment -->
          <p>More content. <!-- Another comment --></p>
        </main>
      </body>
    </html>
  `;
        const {window} = setupDOM(html);
        const options: ConversionOptions = {extractMainContent: true, overrideDOMParser: new window.DOMParser()};
        const markdownString = convertHtmlToMarkdown(html, options);
        assertMarkdown(markdownString,
            ['Main content.', 'More content.'],
            ['This is a comment', 'Another comment'] // Comments shouldn't appear
        );

    });
    test('wrapMainContent should wrap content in <main> if not already wrapped', () => {
        const {document} = setupDOM('<div><p>Some content</p></div>');
        const div = document.querySelector('div')!;
        wrapMainContent(div, document);
        expect(document.body.innerHTML).toBe('<main id="detected-main-content"><div><p>Some content</p></div></main>');
    });

    test('wrapMainContent should not wrap content if already wrapped in <main>', () => {
        const {document} = setupDOM('<main id="existing-main"><div><p>Some content</p></div></main>');
        const main = document.querySelector('main')!;
        wrapMainContent(main, document);
        expect(document.body.innerHTML).toBe('<main id="existing-main"><div><p>Some content</p></div></main>');
    });

    test('Page with only images', () => {
        const html = `
    <!DOCTYPE html>
    <html>
      <head><title>Image Page</title></head>
      <body>
        <img src="image1.jpg" alt="Image 1">
        <img src="image2.png" alt="Image 2">
      </body>
    </html>
  `;
        const {window} = setupDOM(html);
        const options: ConversionOptions = {extractMainContent: true, overrideDOMParser: new window.DOMParser()};
        const markdownString = convertHtmlToMarkdown(html, options);
        assertMarkdown(markdownString, [], []); // Expect an empty string because images aren't handled yet.
    });

    test('Page with only videos', () => {
        const html = `
    <!DOCTYPE html>
    <html>
      <head><title>Video Page</title></head>
      <body>
        <video src="video1.mp4"></video>
        <video src="video2.webm"></video>
      </body>
    </html>
  `;
        const {window} = setupDOM(html);
        const options: ConversionOptions = {extractMainContent: true, overrideDOMParser: new window.DOMParser()};
        const markdownString = convertHtmlToMarkdown(html, options);
        assertMarkdown(markdownString, [], []); // Expect an empty string.

    });

});
