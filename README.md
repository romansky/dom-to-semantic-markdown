<h1 align="center">
    <img width="100" height="100" src="d2m_color.svg" alt=""><br>
    Dom to Semantic Markdown
</h1>

[![CI](https://github.com/romansky/dom-to-semantic-markdown/actions/workflows/ci.yml/badge.svg)](https://github.com/romansku/dom-to-semantic-markdown/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/dom-to-semantic-markdown.svg)](https://badge.fury.io/js/dom-to-semantic-markdown)
[![License: ISC](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Convert HTML DOM to Semantic Markdown for use in LLMs (Large Language Models).

## Table of Contents

- [Why Dom to Semantic Markdown?](#why-dom-to-semantic-markdown)
- [Features](#features)
- [Semantic Format](#semantic-format)
- [Use Cases](#use-cases)
- [Tools](#tools)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

## Why Dom to Semantic Markdown?

Dom to Semantic Markdown addresses several key challenges in extracting web content for LLMs:

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
- Browser and Node.js support

## Semantic Format

Dom to Semantic Markdown's format captures rich web content structure:

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
import { htmlToMarkdownAST, findInMarkdownAST } from 'dom-to-semantic-markdown';

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
import { convertHtmlToMarkdown } from 'dom-to-semantic-markdown';

const html = '<a href="https://example.com/very/long/url">Link</a>';
const markdown = convertHtmlToMarkdown(html, { refifyUrls: true });
console.log(markdown);
// Output: [Link](ref1)
// ref1: https://example.com/very/long/url
```

### Main Content Detection

- Automatically identifies the primary content section of a webpage.
- Focuses on relevant information, excluding boilerplate content when not needed.

Example:
```javascript
import { convertHtmlToMarkdown } from 'dom-to-semantic-markdown';

const html = `
  <header>Site Header</header>
  <main><h1>Main Content</h1><p>Important stuff.</p></main>
  <footer>Site Footer</footer>
`;
const markdown = convertHtmlToMarkdown(html, { extractMainContent: true });
console.log(markdown);
// Output: # Main Content
//
// Important stuff.
```

## Installation

```bash
npm install dom-to-semantic-markdown
```

## Usage

### Browser

```javascript
import { convertHtmlToMarkdown } from 'dom-to-semantic-markdown';

const html = '<h1>Hello, World!</h1><p>This is a <strong>test</strong>.</p>';
const markdown = convertHtmlToMarkdown(html);
console.log(markdown);
```

[full browser example](./examples/browser.html) 

### Node.js

```javascript
const { convertHtmlToMarkdown } = require('dom-to-semantic-markdown');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = '<h1>Hello, World!</h1><p>This is a <strong>test</strong>.</p>';
const dom = new JSDOM(html);
const markdown = convertHtmlToMarkdown(html, { overrideDOMParser: dom.window.DOMParser });
console.log(markdown);
```

[full node example](./examples/node)

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

## Contributing

Contributions to Dom to Semantic Markdown are welcome!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
