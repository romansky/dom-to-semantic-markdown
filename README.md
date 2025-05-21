<h1 align="center">
    <img width="100" height="100" src="d2m_color.svg" alt="DOM to Semantic Markdown Logo"><br>
    DOM to Semantic Markdown
</h1>

[![CI](https://github.com/romansky/dom-to-semantic-markdown/actions/workflows/ci.yml/badge.svg)](https://github.com/romansku/dom-to-semantic-markdown/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/dom-to-semantic-markdown.svg)](https://badge.fury.io/js/dom-to-semantic-markdown)
[![License: ISC](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

This library converts HTML DOM to a semantic Markdown format optimized for use with Large Language Models (LLMs). It
preserves the semantic structure of web content, extracts essential metadata, and reduces token usage compared to raw
HTML, making it easier for LLMs to understand and process information.

## Key Features

* **Semantic Structure Preservation:** Retains the meaning of HTML elements like `<header>`, `<footer>`, `<nav>`, and
  more.
* **Metadata Extraction:** Captures important metadata such as title, description, keywords, Open Graph tags, Twitter
  Card tags, and JSON-LD data.
* **Token Efficiency:** Optimizes for token usage through URL refification and concise representation of content.
* **Main Content Detection:** Automatically identifies and extracts the primary content section of a webpage.
* **Table Column Tracking:** Adds unique identifiers to table columns, improving LLM's ability to correlate data across
  rows.

## Special Feature Examples

Here are examples showcasing the library's special features using the CLI tool:

**1. Simple Content Extraction:**

```bash
npx d2m@latest -u https://xkcd.com
```

This command fetches `https://xkcd.com` and converts it to Markdown

<details>
<summary>Click to view the output</summary>

```markdown
- [Archive](/archive)
- [What If?](https://what-if.xkcd.com/)
- [About](/about)
- [Feed](/atom.xml) • [Email](/newsletter/)
- [TW](https://twitter.com/xkcd/) • [FB](https://www.facebook.com/TheXKCD/) • [IG](https://www.instagram.com/xkcd/)
- [-Books-](/books/)
- [What If? 2](/what-if-2/)
- [WI?](/what-if/) • [TE](/thing-explainer/) • [HT](/how-to/)
  <a href="/">![xkcd.com logo](/s/0b7742.png)</a> A webcomic of romance,
  sarcasm, math, and language. [Special 10th anniversary edition of WHAT IF?](https://xkcd.com/what-if/) —revised and annotated with brand-new illustrations and answers to important questions you never thought to ask—out now. Order it [here](https://bit.ly/WhatIf10th)! Renormalization
- [|<](/1/)
- [< Prev](/3090/)
- [Random](//c.xkcd.com/random/comic/)
- [Next >](about:blank#)
- [>|](/)

![Renormalization](//imgs.xkcd.com/comics/renormalization.png)

- [|<](/1/)
- [< Prev](/3090/)
- [Random](//c.xkcd.com/random/comic/)
- [Next >](about:blank#)
- [>|](/)

Permanent link to this comic: [https://xkcd.com/3091/](https://xkcd.com/3091)
Image URL (for hotlinking/embedding): [https://imgs.xkcd.com/comics/renormalization.png](https://imgs.xkcd.com/comics/renormalization.png)
![Selected Comics](//imgs.xkcd.com/s/a899e84.jpg)

<a href="//xkcd.com/1732/">![Earth temperature timeline](//imgs.xkcd.com/s/temperature.png)</a>
[RSS Feed](/rss.xml) - [Atom Feed](/atom.xml) - [Email](/newsletter/)
Comics I enjoy:
[Three Word Phrase](http://threewordphrase.com/), [SMBC](https://www.smbc-comics.com/), [Dinosaur Comics](https://www.qwantz.com/), [Oglaf](https://oglaf.com/) (nsfw), [A Softer World](https://www.asofterworld.com/), [Buttersafe](https://buttersafe.com/), [Perry Bible Fellowship](https://pbfcomics.com/), [Questionable Content](https://questionablecontent.net/), [Buttercup Festival](http://www.buttercupfestival.com/), [Homestuck](https://www.homestuck.com/), [Junior Scientist Power Hour](https://www.jspowerhour.com/)
Other things:
[Tips on technology and government](https://medium.com/civic-tech-thoughts-from-joshdata/so-you-want-to-reform-democracy-7f3b1ef10597),
[Climate FAQ](https://www.nytimes.com/interactive/2017/climate/what-is-climate-change.html), [Katharine Hayhoe](https://twitter.com/KHayhoe)
xkcd.com is best viewed with Netscape Navigator 4.0 or below on a Pentium 3±1 emulated in Javascript on an Apple IIGS
at a screen resolution of 1024x1. Please enable your ad blockers, disable high-heat drying, and remove your device
from Airplane Mode and set it to Boat Mode. For security reasons, please leave caps lock on while browsing. This work is licensed under a [Creative Commons Attribution-NonCommercial 2.5 License](https://creativecommons.org/licenses/by-nc/2.5/).

This means you're free to copy and share these comics (but not to sell them). [More details](/license.html).
```

</details>

**2. Table Column Tracking:**

```bash
npx d2m@latest -u https://softwareyoga.com/latency-numbers-everyone-should-know/ -t -e
```

This command fetches and converts the main content from to Markdown and adds unique identifiers to table columns, aiding
LLMs in understanding table structure.

<details>
<summary>Click to view the output</summary>

```markdown
# Latency Numbers Everyone Should Know

## Latency

In a computer network, latency is defined as the amount of time it takes for a packet of data to get from one designated point to another.

In more general terms, it is the amount of time between the cause and the observation of the effect.

As you would expect, latency is important, very important. As programmers, we all know reading from disk takes longer than reading from memory or the fact that L1 cache is faster than the L2 cache.

But do you know the orders of magnitude by which these aspects are faster/slower compared to others?

## Latency for common operations

Jeff Dean from Google studied exactly that and came up with figures for latency in various situations.

With improving hardware, the latency at the higher ends of the spectrum are reducing, but not enough to ignore them completely! For instance, to read 1MB sequentially from disk might have taken 20,000,000 ns a decade earlier and with the advent of SSDs may probably take 1,000,000 ns today. But it is never going to surpass reading directly from memory.

The table below presents the latency for the most common operations on commodity hardware. These data are only approximations and will vary with the hardware and the execution environment of your code. However, they do serve their primary purpose, which is to enable us make informed technical decisions to reduce latency.

For better comprehension of  the multi-fold increase in latency, scaled figures in relation to L2 cache are also provided by assuming that the L1 cache reference is 1 sec.

**Scroll horizontally on the table in smaller screens**

| Operation <!-- col-0 --> | Note <!-- col-1 --> | Latency <!-- col-2 --> | Scaled Latency <!-- col-3 --> |
| --- | --- | --- | --- |
| L1 cache reference <!-- col-0 --> | Level-1 cache, usually built onto the microprocessor chip itself. <!-- col-1 --> | 0.5 ns <!-- col-2 --> | Consider L1 cache reference duration is 1 sec <!-- col-3 --> |
| Branch mispredict <!-- col-0 --> | During the execution of a program, CPU predicts the next set of instructions. Branch misprediction is when it makes the wrong prediction. Hence, the previous prediction has to be erased and new one calculated and placed on the execution stack. <!-- col-1 --> | 5 ns <!-- col-2 --> | 10 s <!-- col-3 --> |
| L2 cache reference <!-- col-0 --> | Level-2 cache is memory built on a separate chip. <!-- col-1 --> | 7 ns <!-- col-2 --> | 14 s <!-- col-3 --> |
| Mutex lock/unlock <!-- col-0 --> | Simple synchronization method used to ensure exclusive access to resources shared between many threads. <!-- col-1 --> | 25 ns <!-- col-2 --> | 50 s <!-- col-3 --> |
| Main memory reference <!-- col-0 --> | Time to reference main memory i.e. RAM. <!-- col-1 --> | 100 ns <!-- col-2 --> | 3m 20s <!-- col-3 --> |
| Compress 1K bytes with Snappy <!-- col-0 --> | Snappy is a fast data compression and decompression library written in C++ by Google and used in many Google projects like BigTable, MapReduce and other open source projects. <!-- col-1 --> | 3,000 ns <!-- col-2 --> | 1h 40 m <!-- col-3 --> |
| Send 1K bytes over 1 Gbps network <!-- col-0 --> |  <!-- col-1 --> | 10,000 ns <!-- col-2 --> | 5h 33m 20s <!-- col-3 --> |
| Read 1 MB sequentially from memory <!-- col-0 --> | Read from RAM. <!-- col-1 --> | 250,000 ns <!-- col-2 --> | 5d 18h 53m 20s <!-- col-3 --> |
| Round trip within same datacenter <!-- col-0 --> | We can assume that the DNS lookup will be much faster within a datacenter than it is to go over an external router. <!-- col-1 --> | 500,000 ns <!-- col-2 --> | 11d 13h 46m 40s <!-- col-3 --> |
| Read 1 MB sequentially from SSD disk <!-- col-0 --> | Assumes SSD disk. SSD boasts random data access times of 100000 ns or less. <!-- col-1 --> | 1,000,000 ns <!-- col-2 --> | 23d 3h 33m 20s <!-- col-3 --> |
| Disk seek <!-- col-0 --> | Disk seek is method to get to the sector and head in the disk where the required data exists. <!-- col-1 --> | 10,000,000 ns <!-- col-2 --> | 231d 11h 33m 20s <!-- col-3 --> |
| Read 1 MB sequentially from disk <!-- col-0 --> | Assumes regular disk, not SSD. Check the difference in comparison to SSD! <!-- col-1 --> | 20,000,000 ns <!-- col-2 --> | 462d 23h 6m 40s <!-- col-3 --> |
| Send packet CA->Netherlands->CA <!-- col-0 --> | Round trip for packet data from U.S.A to Europe and back. <!-- col-1 --> | 150,000,000 ns <!-- col-2 --> | 3472d 5h 20m <!-- col-3 --> |

### References:

1. [Designs, Lessons and Advice from Building Large Distributed Systems](http://www.cs.cornell.edu/projects/ladis2009/talks/dean-keynote-ladis2009.pdf)
2. [Peter Norvig’s post on – Teach Yourself Programming in Ten Years](http://norvig.com/21-days.html#answers)
```

</details>

**3. Metadata Extraction (Basic):**

```bash
npx d2m@latest -u https://xkcd.com -m basic
```

This command extracts basic metadata (title, description, keywords) and includes it in the Markdown output.

<details>
<summary>Click to view the output</summary>

```markdown
---
title: "xkcd: Renormalization"
---


- [Archive](/archive)
- [What If?](https://what-if.xkcd.com/)
- [About](/about)
- [Feed](/atom.xml) • [Email](/newsletter/)
- [TW](https://twitter.com/xkcd/) • [FB](https://www.facebook.com/TheXKCD/) • [IG](https://www.instagram.com/xkcd/)
- [-Books-](/books/)
- [What If? 2](/what-if-2/)
- [WI?](/what-if/) • [TE](/thing-explainer/) • [HT](/how-to/)
  <a href="/">![xkcd.com logo](/s/0b7742.png)</a> A webcomic of romance,
  sarcasm, math, and language. [Special 10th anniversary edition of WHAT IF?](https://xkcd.com/what-if/) —revised and annotated with brand-new illustrations and answers to important questions you never thought to ask—out now. Order it [here](https://bit.ly/WhatIf10th)! Renormalization
- [|<](/1/)
- [< Prev](/3090/)
- [Random](//c.xkcd.com/random/comic/)
- [Next >](about:blank#)
- [>|](/)

![Renormalization](//imgs.xkcd.com/comics/renormalization.png)

- [|<](/1/)
- [< Prev](/3090/)
- [Random](//c.xkcd.com/random/comic/)
- [Next >](about:blank#)
- [>|](/)

Permanent link to this comic: [https://xkcd.com/3091/](https://xkcd.com/3091)
Image URL (for hotlinking/embedding): [https://imgs.xkcd.com/comics/renormalization.png](https://imgs.xkcd.com/comics/renormalization.png)
![Selected Comics](//imgs.xkcd.com/s/a899e84.jpg)

<a href="//xkcd.com/1732/">![Earth temperature timeline](//imgs.xkcd.com/s/temperature.png)</a>
[RSS Feed](/rss.xml) - [Atom Feed](/atom.xml) - [Email](/newsletter/)
Comics I enjoy:
[Three Word Phrase](http://threewordphrase.com/), [SMBC](https://www.smbc-comics.com/), [Dinosaur Comics](https://www.qwantz.com/), [Oglaf](https://oglaf.com/) (nsfw), [A Softer World](https://www.asofterworld.com/), [Buttersafe](https://buttersafe.com/), [Perry Bible Fellowship](https://pbfcomics.com/), [Questionable Content](https://questionablecontent.net/), [Buttercup Festival](http://www.buttercupfestival.com/), [Homestuck](https://www.homestuck.com/), [Junior Scientist Power Hour](https://www.jspowerhour.com/)
Other things:
[Tips on technology and government](https://medium.com/civic-tech-thoughts-from-joshdata/so-you-want-to-reform-democracy-7f3b1ef10597),
[Climate FAQ](https://www.nytimes.com/interactive/2017/climate/what-is-climate-change.html), [Katharine Hayhoe](https://twitter.com/KHayhoe)
xkcd.com is best viewed with Netscape Navigator 4.0 or below on a Pentium 3±1 emulated in Javascript on an Apple IIGS
at a screen resolution of 1024x1. Please enable your ad blockers, disable high-heat drying, and remove your device
from Airplane Mode and set it to Boat Mode. For security reasons, please leave caps lock on while browsing. This work is licensed under a [Creative Commons Attribution-NonCommercial 2.5 License](https://creativecommons.org/licenses/by-nc/2.5/).

This means you're free to copy and share these comics (but not to sell them). [More details](/license.html).
```

</details>

**4. Metadata Extraction (Extended):**

```bash
npx d2m@latest -u https://xkcd.com -m extended
```

This command extracts extended metadata, including Open Graph, Twitter Card tags, and JSON-LD data, and includes it in
the Markdown output.

<details>
<summary>Click to view the output</summary>

```markdown
---
title: "xkcd: Renormalization"
openGraph:
  site_name: "xkcd"
  title: "Renormalization"
  url: "https://xkcd.com/3091/"
  image: "https://imgs.xkcd.com/comics/renormalization_2x.png"
twitter:
  card: "summary_large_image"
---


- [Archive](/archive)
- [What If?](https://what-if.xkcd.com/)
- [About](/about)
- [Feed](/atom.xml) • [Email](/newsletter/)
- [TW](https://twitter.com/xkcd/) • [FB](https://www.facebook.com/TheXKCD/) • [IG](https://www.instagram.com/xkcd/)
- [-Books-](/books/)
- [What If? 2](/what-if-2/)
- [WI?](/what-if/) • [TE](/thing-explainer/) • [HT](/how-to/)
  <a href="/">![xkcd.com logo](/s/0b7742.png)</a> A webcomic of romance,
  sarcasm, math, and language. [Special 10th anniversary edition of WHAT IF?](https://xkcd.com/what-if/) —revised and annotated with brand-new illustrations and answers to important questions you never thought to ask—out now. Order it [here](https://bit.ly/WhatIf10th)! Renormalization
- [|<](/1/)
- [< Prev](/3090/)
- [Random](//c.xkcd.com/random/comic/)
- [Next >](about:blank#)
- [>|](/)

![Renormalization](//imgs.xkcd.com/comics/renormalization.png)

- [|<](/1/)
- [< Prev](/3090/)
- [Random](//c.xkcd.com/random/comic/)
- [Next >](about:blank#)
- [>|](/)

Permanent link to this comic: [https://xkcd.com/3091/](https://xkcd.com/3091)
Image URL (for hotlinking/embedding): [https://imgs.xkcd.com/comics/renormalization.png](https://imgs.xkcd.com/comics/renormalization.png)
![Selected Comics](//imgs.xkcd.com/s/a899e84.jpg)

<a href="//xkcd.com/1732/">![Earth temperature timeline](//imgs.xkcd.com/s/temperature.png)</a>
[RSS Feed](/rss.xml) - [Atom Feed](/atom.xml) - [Email](/newsletter/)
Comics I enjoy:
[Three Word Phrase](http://threewordphrase.com/), [SMBC](https://www.smbc-comics.com/), [Dinosaur Comics](https://www.qwantz.com/), [Oglaf](https://oglaf.com/) (nsfw), [A Softer World](https://www.asofterworld.com/), [Buttersafe](https://buttersafe.com/), [Perry Bible Fellowship](https://pbfcomics.com/), [Questionable Content](https://questionablecontent.net/), [Buttercup Festival](http://www.buttercupfestival.com/), [Homestuck](https://www.homestuck.com/), [Junior Scientist Power Hour](https://www.jspowerhour.com/)
Other things:
[Tips on technology and government](https://medium.com/civic-tech-thoughts-from-joshdata/so-you-want-to-reform-democracy-7f3b1ef10597),
[Climate FAQ](https://www.nytimes.com/interactive/2017/climate/what-is-climate-change.html), [Katharine Hayhoe](https://twitter.com/KHayhoe)
xkcd.com is best viewed with Netscape Navigator 4.0 or below on a Pentium 3±1 emulated in Javascript on an Apple IIGS
at a screen resolution of 1024x1. Please enable your ad blockers, disable high-heat drying, and remove your device
from Airplane Mode and set it to Boat Mode. For security reasons, please leave caps lock on while browsing. This work is licensed under a [Creative Commons Attribution-NonCommercial 2.5 License](https://creativecommons.org/licenses/by-nc/2.5/).

This means you're free to copy and share these comics (but not to sell them). [More details](/license.html).
```

</details>

## Installation

### Using npm

```bash
npm install dom-to-semantic-markdown
```

### Using npx (CLI)

```bash
> npx d2m@latest -h
Usage: d2m [options]

Convert DOM to Semantic Markdown

Options:
  -V, --version                                   output the version number
  -i, --input <file>                              Input HTML file
  -o, --output <file>                             Output Markdown file
  -e, --extract-main                              Extract main content
  -u, --url <url>                                 URL to fetch HTML content from
  -t, --track-table-columns                       Enable table column tracking for improved LLM data correlation
  -m, --include-meta-data <"basic" | "extended">  Include metadata extracted from the HTML head
  -p, --use-playwright                            Use Playwright to fetch HTML from URL (handles dynamic content)
  --playwright-wait-until <event>                 Playwright page.goto waitUntil event. Allowed values: load, domcontentloaded, networkidle, commit. Default: load. (default: "load")
  -h, --help                                      display help for command
```

## Usage

### Browser

```javascript
import {convertHtmlToMarkdown} from 'dom-to-semantic-markdown';

const markdown = convertHtmlToMarkdown(document.body);
console.log(markdown);
```

### Node.js

```javascript
import {convertHtmlToMarkdown} from 'dom-to-semantic-markdown';
import {JSDOM} from 'jsdom';

const html = '<h1>Hello, World!</h1><p>This is a <strong>test</strong>.</p>';
const dom = new JSDOM(html);
const markdown = convertHtmlToMarkdown(html, {overrideDOMParser: new dom.window.DOMParser()});
console.log(markdown);
```

### CLI

```bash
d2m -i input.html -o output.md # Convert input.html to output.md
d2m -u https://example.com -o output.md # Fetch and convert a webpage to Markdown
d2m -i input.html -e # Extract main content from input.html
d2m -i input.html -t # Enable table column tracking
d2m -i input.html -m basic # Include basic metadata
d2m -i input.html -m extended # Include extended metadata
```

## API

### `convertHtmlToMarkdown(html: string, options?: ConversionOptions): string`

Converts an HTML string to semantic Markdown.

### `convertElementToMarkdown(element: Element, options?: ConversionOptions): string`

Converts an HTML Element to semantic Markdown.

### `ConversionOptions`

* `websiteDomain?: string`: The domain of the website being converted.
* `extractMainContent?: boolean`: Whether to extract only the main content of the page.
* `refifyUrls?: boolean`: Whether to convert URLs to reference-style links.
* `debug?: boolean`: Enable debug logging.
* `overrideDOMParser?: DOMParser`: Custom DOMParser for Node.js environments.
* `enableTableColumnTracking?: boolean`: Adds unique identifiers to table columns.
* `overrideElementProcessing?: (element: Element, options: ConversionOptions, indentLevel: number) => SemanticMarkdownAST[] | undefined`:
  Custom processing for HTML elements.
* `processUnhandledElement?: (element: Element, options: ConversionOptions, indentLevel: number) => SemanticMarkdownAST[] | undefined`:
  Handler for unknown HTML elements.
* `overrideNodeRenderer?: (node: SemanticMarkdownAST, options: ConversionOptions, indentLevel: number) => string | undefined`:
  Custom renderer for AST nodes.
* `renderCustomNode?: (node: CustomNode, options: ConversionOptions, indentLevel: number) => string | undefined`:
  Renderer for custom AST nodes.
* `includeMetaData?: 'basic' | 'extended'`: Controls whether to include metadata extracted from the HTML head.
    - `'basic'`: Includes standard meta tags like title, description, and keywords.
    - `'extended'`: Includes basic meta tags, Open Graph tags, Twitter Card tags, and JSON-LD data.

## Using the Output with LLMs

The semantic Markdown produced by this library is optimized for use with Large Language Models (LLMs). To use it effectively:

1. Extract the Markdown content using the library.
2. Start with a brief instruction or context for the LLM.
3. Wrap the extracted Markdown in triple backticks (```).
4. Follow the Markdown with your question or prompt.

Example:

````
The following is a semantic Markdown representation of a webpage. Please analyze its content:

```markdown
{paste your extracted markdown here}
```

{your question, e.g., "What are the main points discussed in this article?"}
````

This format helps the LLM understand its task and the context of the content, enabling more accurate and relevant responses to your questions.

## Contributing

Contributions are welcome! See the [CONTRIBUTING.md](CONTRIBUTING.md) file for details.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
