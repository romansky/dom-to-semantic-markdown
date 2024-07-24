import {JSDOM} from 'jsdom';
import {convertHtmlToMarkdown, convertElementToMarkdown, ConversionOptions} from '../src';

describe('HTML to Markdown conversion', () => {
    let dom: JSDOM;

    beforeEach(() => {
        dom = new JSDOM('<!doctype html><html><body></body></html>');
        global.document = dom.window.document;
    });

    // Helper function to create a DOM element
    function createElement(html: string): Element {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.firstElementChild as Element;
    }

    test('converts simple paragraph', () => {
        const html = '<p>This is a simple paragraph.</p>';
        const expected = 'This is a simple paragraph.';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts headings', () => {
        const html = '<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>';
        const expected = '# Heading 1\n\n## Heading 2\n\n### Heading 3';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts unordered list', () => {
        const html = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
        const expected = '- Item 1\n- Item 2\n- Item 3';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts ordered list', () => {
        const html = '<ol><li>First</li><li>Second</li><li>Third</li></ol>';
        const expected = '1. First\n2. Second\n3. Third';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts links', () => {
        const html = '<a href="https://example.com">Example</a>';
        const expected = '[Example](https://example.com/)';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts images', () => {
        const html = '<img src="image.jpg" alt="An image">';
        const expected = '![An image](image.jpg)';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts bold and italic text', () => {
        const html = '<p><strong>Bold</strong> and <em>italic</em> text</p>';
        const expected = '**Bold** and *italic* text';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts blockquotes', () => {
        const html = '<blockquote><p>This is a quote.</p></blockquote>';
        const expected = '> This is a quote.';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts code blocks', () => {
        const html = `<pre><code>function example() {\n  return true;\n}</code></pre>`;
        const expected = '```\nfunction example() {\n  return true;\n}\n```';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts inline code', () => {
        const html = '<p>Use the <code>example()</code> function.</p>';
        const expected = 'Use the `example()` function.';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts tables', () => {
        const html = `
      <table>
        <thead>
          <tr><th>Header 1</th><th>Header 2</th></tr>
        </thead>
        <tbody>
          <tr><td>Row 1, Cell 1</td><td>Row 1, Cell 2</td></tr>
          <tr><td>Row 2, Cell 1</td><td>Row 2, Cell 2</td></tr>
        </tbody>
      </table>
    `;
        const expected =
            '| Header 1 | Header 2 |\n' +
            '| --- | --- |\n' +
            '| Row 1, Cell 1 | Row 1, Cell 2 |\n' +
            '| Row 2, Cell 1 | Row 2, Cell 2 |';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts nested structures', () => {
        const html = `
      <div>
        <h1>Main Title</h1>
        <p>Here's a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2
            <ol>
              <li>Subitem 2.1</li>
              <li>Subitem 2.2</li>
            </ol>
          </li>
          <li>Item 3</li>
        </ul>
      </div>
    `;
        const expected =
            '# Main Title\n\n' +
            'Here\'s a paragraph with **bold** and *italic* text.\n\n' +
            '- Item 1\n' +
            '- Item 2\n' +
            '  1. Subitem 2.1\n' +
            '  2. Subitem 2.2\n' +
            '- Item 3';
        expect(convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('converts element to markdown', () => {
        const element = createElement('<p>This is a <strong>test</strong>.</p>');
        const expected = 'This is a **test**.';
        expect(convertElementToMarkdown(element, {overrideDOMParser: new dom.window.DOMParser()}).trim()).toBe(expected);
    });

    test('respects conversion options', () => {
        const html = '<div id="content" role="main"><p>Main content</p></div><div id="sidebar"><p>Sidebar</p></div>';
        const options: ConversionOptions = {
            extractMainContent: true,
            overrideDOMParser: new dom.window.DOMParser()
        };
        const expected = 'Main content';
        expect(convertHtmlToMarkdown(html, options).trim()).toBe(expected);
    });

    // Add more tests as needed for edge cases and specific features
});
