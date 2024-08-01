<h1 align="center">
    <img width="100" height="100" src="d2m_color.svg" alt="DOM to Semantic Markdown Logo"><br>
    DOM to Semantic Markdown
</h1>

[![CI](https://github.com/romansky/dom-to-semantic-markdown/actions/workflows/ci.yml/badge.svg)](https://github.com/romansku/dom-to-semantic-markdown/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/dom-to-semantic-markdown.svg)](https://badge.fury.io/js/dom-to-semantic-markdown)
[![License: ISC](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Convert HTML DOM to Semantic Markdown for use in LLMs (Large Language Models).

## Table of Contents

- [Why DOM to Semantic Markdown?](#why-dom-to-semantic-markdown)
- [Features](#features)
- [Semantic Format](#semantic-format)
- [Use Cases](#use-cases)
- [Tools](#tools)
- [Installation](#installation)
- [Usage](#usage)
- [Adding to an Existing Project](#adding-to-an-existing-project)
- [API](#api)
- [Contributing](#contributing)
- [Example](#example)
- [License](#license)

## Why DOM to Semantic Markdown?

DOM to Semantic Markdown addresses several key challenges in extracting web content for LLMs:

1. **Maximizing Semantic Information**: Preserves the semantic structure of web content, unlike traditional HTML-to-text conversion.

2. **Token Efficiency**: Produces a concise yet information-rich format, reducing token usage compared to verbose HTML.

3. **Preserving Metadata**: Retains essential metadata like links, image descriptions, and structural information.

4. **Semantic Clarity**: Converts web content to a format more easily "understandable" for LLMs, enhancing their processing and reasoning capabilities.

## Features

- HTML to Semantic Markdown AST conversion
- Detection and extraction of main content
- Semantic structure preservation (e.g., `<header>`, `<footer>`, `<nav>`)
- Metadata capture for images, tables, and other rich media elements
- URL refification for token optimization
- Customizable conversion options
- Browser, CLI and Node.js support
- Table column tracking for enhanced LLM processing capabilities

## Advanced Features

### Table Column Tracking

When dealing with tables, especially those with numerous columns containing similar data types, LLMs may struggle to correlate cells with their respective columns. The `enableTableColumnTracking` option (or `--track-table-columns` in CLI) adds unique identifiers to each column, significantly improving an LLM's ability to understand table structure and correlate data across rows.

Example output with column tracking enabled:

| Header 1 \<!-- col-0 --> | Header 2 \<!-- col-1 --> |
|--------------------------|--------------------------|
| Data 1 \<!-- col-0 -->   | Data 2 \<!-- col-1 -->   |

This feature is particularly useful for complex tables or when precise column identification is crucial for downstream LLM tasks.

### Custom Element Processing and Rendering

DOM to Semantic Markdown now offers advanced customization options for handling and rendering elements:

1. **overrideElementProcessing**: Allows custom processing of HTML elements before conversion to AST.
2. **processUnhandledElement**: Provides a way to handle unknown or custom HTML elements.
3. **overrideNodeRenderer**: Enables custom rendering of AST nodes to Markdown.
4. **renderCustomNode**: Allows rendering of custom AST nodes.

These options provide flexibility for handling complex or custom HTML structures and controlling the output Markdown.

Example usage:

```javascript
import {convertHtmlToMarkdown} from 'dom-to-semantic-markdown';

const html = '<custom-element>Custom content</custom-element>';
const options = {
   overrideElementProcessing: (element, options, indentLevel) => {
      if (element.tagName.toLowerCase() === 'custom-element') {
         return [{ type: 'custom', content: element.textContent }];
      }
   },
   renderCustomNode: (node, options, indentLevel) => {
      if (node.type === 'custom') {
         return `**Custom:** ${node.content}`;
      }
   }
};

const markdown = convertHtmlToMarkdown(html, options);
console.log(markdown); // Output: **Custom:** Custom content
```

## Semantic Format

DOM to Semantic Markdown's format captures rich web content structure:

- Preserves HTML semantic tags (`<header>`, `<footer>`, `<nav>`, `<aside>`, etc.)
- Captures image metadata (alt text, dimensions, etc.)
- Maintains table structures and data relationships
- Preserves link destinations while optimizing for token efficiency

## Use Cases

1. **Content-Focused Q&A**: Extract main content for focused question-answering tasks.

2. **Full-Page Analysis**: Convert entire web pages for comprehensive site analysis.

3. **Rich Media Understanding**: Preserve image descriptions and table structures for visual or structured data tasks.

4. **SEO and Content Auditing**: Analyze page structure and content distribution across semantic sections.

## Tools

### Abstract Syntax Tree (AST)

- Enables programmatic content manipulation and analysis.
- Facilitates advanced filtering, restructuring, and content transformation.

Example:

```javascript
import {htmlToMarkdownAST, findInMarkdownAST} from 'dom-to-semantic-markdown';

const html = '<div><h1>Title</h1><p>Content</p></div>';
const ast = htmlToMarkdownAST(html);

const headingNode = findInMarkdownAST(ast, node => node.type === 'heading' && node.level === 1);
console.log(headingNode); // { type: 'heading', level: 1, content: 'Title' }
```

### URL Refification

- Converts long URLs into shorter, token-efficient references.
- Preserves link information while reducing token count.

Example:

```javascript
import {convertHtmlToMarkdown} from 'dom-to-semantic-markdown';

const html = '<a href="https://example.com/very/long/url">Link</a>';
const markdown = convertHtmlToMarkdown(html, {refifyUrls: true});
console.log(markdown);
// Output: [Link](ref1)
// ref1: https://example.com/very/long/url
```

### Main Content Detection

- Automatically identifies the primary content section of a webpage.
- Focuses on relevant information, excluding boilerplate content when not needed.

Example:

```javascript
import {convertHtmlToMarkdown} from 'dom-to-semantic-markdown';

const html = `
  <header>Site Header</header>
  <main><h1>Main Content</h1><p>Important stuff.</p></main>
  <footer>Site Footer</footer>
`;
const markdown = convertHtmlToMarkdown(html, {extractMainContent: true});
console.log(markdown);
// Output: # Main Content
//
// Important stuff.
```

## Installation

### Using `npx`

You can use the tool directly with `npx` without needing to install it globally:

```sh
> npx d2m@latest -h
Usage: d2m [options]

Convert DOM to Semantic Markdown

Options:
  -V, --version        output the version number
  -i, --input <file>   Input HTML file
  -o, --output <file>  Output Markdown file
  -e, --extract-main   Extract main content
  -u, --url <url>      URL to fetch HTML content from
  -t, --track-table-columns                          Enable table column tracking for improved LLM data correlation
  -meta, --include-meta-data <"basic" | "extended">  Include metadata extracted from the HTML head
  -h, --help           display help for command

> npx d2m@latest -i tryme.html -o output.md
```

[See more `npx` examples in the cli readme](./examples/cli/README.md)

### Adding to Existing Project

```bash
npm install dom-to-semantic-markdown
```

### Global Installation

To install the CLI tool globally, use the following commands:

1. Clone the repository:

    ```sh
    git clone https://github.com/romansky/dom-to-semantic-markdown.git
    cd examples/cli
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Build the project:

    ```sh
    npm run build
    ```

4. Link the package globally:

    ```sh
    npm link
    ```

After linking the package globally, you can use the `d2m` command anywhere on your system.

## Usage

### Browser

```javascript
import {convertHtmlToMarkdown} from 'dom-to-semantic-markdown';

const html = '<h1>Hello, World!</h1><p>This is a <strong>test</strong>.</p>';
const markdown = convertHtmlToMarkdown(html);
console.log(markdown);
```

[full browser example](./examples/browser.html)

### Node.js

```javascript
const {convertHtmlToMarkdown} = require('dom-to-semantic-markdown');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const html = '<h1>Hello, World!</h1><p>This is a <strong>test</strong>.</p>';
const dom = new JSDOM(html);
const markdown = convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()});
console.log(markdown);
```

[full node example](./examples/node)

## Adding to an Existing Project

To add `dom-to-semantic-markdown` to your existing project, follow these steps:

1. Install the library:

```sh
npm add dom-to-semantic-markdown
```

2. Import and use it in your project:

```javascript
import {convertHtmlToMarkdown} from 'dom-to-semantic-markdown';
import jsdom from 'jsdom';

const {JSDOM} = jsdom;

const html = '<h1>Hello, World!</h1><p>This is a <strong>test</strong>.</p>';
const dom = new JSDOM(html);
const markdown = convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()});

console.log(markdown);
// Output:
// # Hello, World!
// 
// This is a **test**.
```

## API

### `convertHtmlToMarkdown(html: string, options?: ConversionOptions): string`

Converts an HTML string to Semantic Markdown.

### `convertElementToMarkdown(element: Element, options?: ConversionOptions): string`

Converts an HTML Element to Semantic Markdown.

### `ConversionOptions`

- `websiteDomain?: string`: The domain of the website being converted.
- `extractMainContent?: boolean`: Whether to extract only the main content of the page.
- `refifyUrls?: boolean`: Whether to convert URLs to reference-style links.
- `debug?: boolean`: Enable debug logging.
- `overrideDOMParser?: DOMParser`: Custom DOMParser for Node.js environments.
- `enableTableColumnTracking?: boolean`: Adds unique identifiers to table columns, enhancing LLM's ability to correlate data across rows.
- `overrideElementProcessing?: (element: Element, options: ConversionOptions, indentLevel: number) => SemanticMarkdownAST[] | undefined`: Custom processing for HTML elements.
- `processUnhandledElement?: (element: Element, options: ConversionOptions, indentLevel: number) => SemanticMarkdownAST[] | undefined`: Handler for unknown HTML elements.
- `overrideNodeRenderer?: (node: SemanticMarkdownAST, options: ConversionOptions, indentLevel: number) => string | undefined`: Custom renderer for AST nodes.
- `renderCustomNode?: (node: CustomNode, options: ConversionOptions, indentLevel: number) => string | undefined`: Renderer for custom AST nodes.
- `includeMetaData?: 'basic' | 'extended' | false`: Controls whether to include metadata extracted from the HTML head.
  - `'basic'`: Includes standard meta tags like title, description, and keywords.
  - `'extended'`: Includes basic meta tags, Open Graph tags, Twitter Card tags, and JSON-LD data.
  - `false`: Disables metadata extraction.

## Example

<details>
<summary>Convert XKCD homepage to Markdown</summary>

```sh
npx d2m@latest -u https://xkcd.com -o xkcd.md
```

<details>
<summary>Click to view the converted Markdown</summary>

```markdown
- [Archive](/archive)
- [What If?](https://what-if.xkcd.com/)
- [About](/about)
- [Feed](/atom.xml)   • [Email](/newsletter/)
- [TW](https://twitter.com/xkcd/)   • [FB](https://www.facebook.com/TheXKCD/)   • [IG](https://www.instagram.com/xkcd/)
- [-Books-](/books/)
- [What If? 2](/what-if-2/)
- [WI?](/what-if/)   • [TE](/thing-explainer/)   • [HT](/how-to/)

<a href="/">![xkcd.com logo](/s/0b7742.png)</a> A webcomic of romance,
sarcasm, math, and language. [Special 10th anniversary edition of WHAT IF?](https://xkcd.com/what-if/) —revised and annotated with brand-new illustrations and answers to important questions you never thought to ask—coming from November 2024. Preorder [here](https://bit.ly/WhatIf10th) ! President Venn Diagram
- [|<](/1/)
- [< Prev](/2961/)
- [Random](//c.xkcd.com/random/comic/)
- [Next >](about:blank#)
- [>|](/)

![President Venn Diagram](//imgs.xkcd.com/comics/president_venn_diagram.png)
- [|<](/1/)
- [< Prev](/2961/)
- [Random](//c.xkcd.com/random/comic/)
- [Next >](about:blank#)
- [>|](/)


Permanent link to this comic: [https://xkcd.com/2962/](https://xkcd.com/2962)
Image URL (for hotlinking/embedding): [https://imgs.xkcd.com/comics/president_venn_diagram.png](https://imgs.xkcd.com/comics/president_venn_diagram.png)![Selected Comics](//imgs.xkcd.com/s/a899e84.jpg)
<a href="//xkcd.com/1732/">![Earth temperature timeline](//imgs.xkcd.com/s/temperature.png)</a>
[RSS Feed](/rss.xml) - [Atom Feed](/atom.xml) - [Email](/newsletter/)
Comics I enjoy:
[Three Word Phrase](http://threewordphrase.com/) , [SMBC](https://www.smbc-comics.com/) , [Dinosaur Comics](https://www.qwantz.com/) , [Oglaf](https://oglaf.com/) (nsfw), [A Softer World](https://www.asofterworld.com/) , [Buttersafe](https://buttersafe.com/) , [Perry Bible Fellowship](https://pbfcomics.com/) , [Questionable Content](https://questionablecontent.net/) , [Buttercup Festival](http://www.buttercupfestival.com/) , [Homestuck](https://www.homestuck.com/) , [Junior Scientist Power Hour](https://www.jspowerhour.com/)
Other things:
[Tips on technology and government](https://medium.com/civic-tech-thoughts-from-joshdata/so-you-want-to-reform-democracy-7f3b1ef10597) ,
[Climate FAQ](https://www.nytimes.com/interactive/2017/climate/what-is-climate-change.html) , [Katharine Hayhoe](https://twitter.com/KHayhoe)
xkcd.com is best viewed with Netscape Navigator 4.0 or below on a Pentium 3±1 emulated in Javascript on an Apple IIGS
at a screen resolution of 1024x1. Please enable your ad blockers, disable high-heat drying, and remove your device
from Airplane Mode and set it to Boat Mode. For security reasons, please leave caps lock on while browsing. This work is licensed under a [Creative Commons Attribution-NonCommercial 2.5 License](https://creativecommons.org/licenses/by-nc/2.5/).

This means you're free to copy and share these comics (but not to sell them). [More details](/license.html).
```

</details>
</details>

## Contributing

Contributions to DOM to Semantic Markdown are welcome!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
