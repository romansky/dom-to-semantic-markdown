#!/usr/bin/env node
import {program} from 'commander';
import {convertHtmlToMarkdown} from 'dom-to-semantic-markdown';
import {chromium} from 'playwright';
import axios from 'axios';
import fs from 'fs/promises';
import {JSDOM} from 'jsdom';

const playwrightWaitUntilEvents = ['load', 'domcontentloaded', 'networkidle', 'commit'] as const;

program
    .version('1.4.0')
    .description('Convert DOM to Semantic Markdown')
    .option('-i, --input <file>', 'Input HTML file')
    .option('-o, --output <file>', 'Output Markdown file')
    .option('-e, --extract-main', 'Extract main content')
    .option('-u, --url <url>', 'URL to fetch HTML content from')
    .option('-t, --track-table-columns', 'Enable table column tracking for improved LLM data correlation')
    .option(`-m, --include-meta-data <"basic" | "extended">`, 'Include metadata extracted from the HTML head')
    .option('-p, --use-playwright', 'Use Playwright to fetch HTML from URL (handles dynamic content)')
    .option(
        '--playwright-wait-until <event>',
        `Playwright page.goto waitUntil event. Allowed values: ${playwrightWaitUntilEvents.filter(e => e !== undefined).join(', ')}. Default: load.`,
        'load'
    )
    .parse(process.argv);

const options = program.opts();

async function main() {
    let html: string | undefined;
    if (options.url) {
        if (options.usePlaywright) {
            let waitUntilEvent = options.playwrightWaitUntil as (typeof playwrightWaitUntilEvents)[number];
            if (!playwrightWaitUntilEvents.includes(waitUntilEvent)) {
                console.warn(
                    `Invalid --playwright-wait-until value: "${options.playwrightWaitUntil}". ` +
                    `Allowed values are: ${playwrightWaitUntilEvents.filter(e => e !== undefined).join(', ')}. Using default "load".`
                );
                waitUntilEvent = 'load';
            }

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
            const response = await axios.get(options.url);
            html = response.data;
        }
    } else if (options.input) {
        html = await fs.readFile(options.input, 'utf-8');
    } else {
        console.error('Either an input file (-i) or a URL (-u) must be specified.');
        program.help();
        process.exit(1);
    }

    if (typeof html !== 'string') {
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