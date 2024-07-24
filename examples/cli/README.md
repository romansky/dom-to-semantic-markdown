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

### Examples

#### Using `npx`

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

#### Using Globally Installed CLI

1. Convert an HTML file and print the result to the console:

```sh
d2m -i tryme.html
```

2. Convert an HTML file and save the result to a Markdown file:

```sh
d2m -i tryme.html -o output.md
```

3. Extract the main content from the HTML file and print the result to the console:

```sh
d2m -i tryme.html -e
```

4. Convert HTML content from a URL and print the result to the console:

```sh
d2m -u https://example.com
```

5. Convert HTML content from a URL and save the result to a Markdown file:

```sh
d2m -u https://example.com -o output.md
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
