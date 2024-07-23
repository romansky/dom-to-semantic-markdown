# DOM to Markdown CLI

A command-line tool to convert HTML DOM to Semantic Markdown.

## Installation

To install the CLI tool globally, use the following commands:

1. Clone the repository:

```sh
https://github.com/romansky/dom-to-semantic-markdown.git
cd cd examples/cli
```

2. Install dependencies:

```sh
npm install
```

3. Link the package globally:

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

### Examples

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
