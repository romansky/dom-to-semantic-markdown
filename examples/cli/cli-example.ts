#!/usr/bin/env node
import {program} from 'commander';
import {convertHtmlToMarkdown} from 'dom-to-semantic-markdown';
import {chromium} from 'playwright'; // Import PageLoadOptions for type safety
import axios from 'axios';
import fs from 'fs/promises';
import {JSDOM} from 'jsdom';

// Define allowed Playwright waitUntil events for type safety and validation
const playwrightWaitUntilEvents = ['load', 'domcontentloaded', 'networkidle', 'commit'] as const;

program
    .version('1.4.0') // Consider aligning this with your package.json version
    .description('Convert DOM to Semantic Markdown')
    .option('-i, --input <file>', 'Input HTML file')
    .option('-o, --output <file>', 'Output Markdown file')
    .option('-e, --extract-main', 'Extract main content')
    .option('-u, --url <url>', 'URL to fetch HTML content from')
    .option('-t, --track-table-columns', 'Enable table column tracking for improved LLM data correlation')
    .option(`-m, --include-meta-data <"basic" | "extended">`, 'Include metadata extracted from the HTML head') // Note: README uses -meta, code uses -m
    .option('-p, --use-playwright', 'Use Playwright to fetch HTML from URL (handles dynamic content)')
    .option(
        '--playwright-wait-until <event>',
        `Playwright page.goto waitUntil event. Allowed values: ${playwrightWaitUntilEvents.filter(e => e !== undefined).join(', ')}. Default: load.`,
        'load' // Default value for the option
    )
    .parse(process.argv);

const options = program.opts();

async function main() {
    let html: string | undefined;
    if (options.url) {
        if (options.usePlaywright) {
            // Validate the playwrightWaitUntil option
            let waitUntilEvent = options.playwrightWaitUntil as (typeof playwrightWaitUntilEvents)[number];
            if (!playwrightWaitUntilEvents.includes(waitUntilEvent)) {
                console.warn(
                    `Invalid --playwright-wait-until value: "${options.playwrightWaitUntil}". ` +
                    `Allowed values are: ${playwrightWaitUntilEvents.filter(e => e !== undefined).join(', ')}. Using default "load".`
                );
                waitUntilEvent = 'load';
            }

            console.log(`Fetching HTML from ${options.url} using Playwright (waitUntil: ${waitUntilEvent})...`);
            const browser = await chromium.launch();
            const context = await browser.newContext();
            const page = await context.newPage();
            try {
                await page.goto(options.url, {waitUntil: waitUntilEvent});
                html = await page.content();
            } catch (error) {
                console.error(`Error fetching URL with Playwright: ${(error as Error).message}`);
                process.exit(1);
            } finally {
                await page.close();
                await context.close();
                await browser.close();
            }
        } else {
            console.log(`Fetching HTML from ${options.url} using Axios...`);
            const response = await axios.get(options.url);
            html = response.data;
        }
    } else if (options.input) {
        html = await fs.readFile(options.input, 'utf-8');
    } else {
        console.error('Either an input file (-i) or a URL (-u) must be specified.');
        program.help(); // Show help on error
        process.exit(1);
    }

    if (typeof html !== 'string') {
        // This case should ideally be handled by earlier checks, but as a safeguard:
        console.error('Failed to retrieve HTML content. Exiting.');
        process.exit(1);
    }

    const markdown = convertHtmlToMarkdown(html, {
        extractMainContent: options.extractMain,
        overrideDOMParser: new (new JSDOM()).window.DOMParser(),
        enableTableColumnTracking: options.trackTableColumns,
        includeMetaData: options.includeMetaData,
    });

    if (options.output) {
        await fs.writeFile(options.output, markdown);
        console.log(`Markdown saved to ${options.output}`);
    } else {
        console.log(markdown);
    }
}

main().catch(error => {
    console.error('An unexpected error occurred:', error);
    process.exit(1);
});