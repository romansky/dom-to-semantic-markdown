# DOM to Markdown CLI

A command-line tool to convert HTML DOM to Semantic Markdown.

## Installation

To use the CLI tool with `npx` or install it globally, follow these instructions:

### Using `npx`

You can use the tool directly with `npx` without needing to install it globally:

```sh
npx d2m@latest -i tryme.html -o output.md
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

The `d2m` command converts HTML files or URL content to Markdown. Here are the available options:

- `-i, --input <file>`: Input HTML file
- `-o, --output <file>`: Output Markdown file (if not specified, the result will be printed to the console)
- `-e, --extract-main`: Extract main content (optional)
- `-u, --url <url>`: URL to fetch HTML content from
- `-t, --track-table-columns`: Enable table column tracking for improved LLM data correlation
- `-m, --include-meta-data <"basic" | "extended">`: Include metadata extracted from the HTML head
- `-p, --use-playwright`: Use Playwright to fetch HTML from URL (handles dynamic content, may require `npx playwright install` if browsers are not found)
- `--playwright-wait-until <event>`: Specify the Playwright `page.goto` waitUntil event. Options: `load` (default), `domcontentloaded`, `networkidle`, `commit`. Used only with `-p` or `--use-playwright`.

**Explanation of `waitUntil` options:**
*   `'domcontentloaded'`: Waits for the `DOMContentLoaded` event. The HTML document has been completely parsed, but stylesheets, images, and subframes may still be loading.
*   `'load'`: Waits for the `load` event. The entire page, including all dependent resources like stylesheets and images, has finished loading. **This is the new default if `-p` is used.**
*   `'networkidle'`: Waits until there are no network connections for at least 500 ms. This is excellent for pages that load data asynchronously or SPAs that render content after the initial load.
*   `'commit'`: Waits for the navigation to be committed. This is the fastest but might capture the page in a very early state, often before any meaningful content is rendered by JavaScript.


Note: If you plan to use the `--use-playwright` option (see Usage), you might need to install Playwright's browser drivers first:
```sh
npx playwright install
```

### Examples

#### Using `npx` 

(without local install use `npx d2m@latest -i ...` or `d2m -i ...` if globally installed, ie- `npm link` )

1. Convert an HTML file and print the result to the console:

```sh
npx d2m@latest -i tryme.html
```

2. Convert an HTML file and save the result to a Markdown file:

```sh
npx d2m@latest -i tryme.html -o output.md
```

3. Extract the main content from the HTML file and print the result to the console:

```sh
npx d2m@latest -i tryme.html -e
```

4. Convert HTML content from a URL and print the result to the console:

```sh
npx d2m@latest -u https://example.com
```

5. Convert HTML content from a URL and save the result to a Markdown file:

```sh
npx d2m@latest -u https://example.com -o output.md
```

6. Convert an HTML file with table column tracking:

```sh
npx d2m@latest -i tryme.html -t
```

7. Convert HTML content from a URL using Playwright and save to a file:

```sh
npx d2m@latest -u https://example.com -p -o output_playwright.md
```

8. Convert HTML content from a URL using Playwright while waiting until network has settled

```sh
npx d2m@latest -u https://example.com -p --playwright-wait-until networkidle -o output_spa.md
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
