export type BoldNode = {
    type: 'bold';
    content: string;
};
export type ItalicNode = {
    type: 'italic';
    content: string;
};
export type StrikethroughNode = {
    type: 'strikethrough';
    content: string;
};
export type HeadingNode = {
    type: 'heading';
    level: 1 | 2 | 3 | 4 | 5 | 6;
    content: string;
};
export type LinkNode = {
    type: 'link';
    href: string;
    content: SemanticMarkdownAST[];
};
export type ImageNode = {
    type: 'image';
    src: string;
    alt?: string;
};
export type ListItemNode = {
    type: 'listItem';
    content: SemanticMarkdownAST[];
};
export type ListNode = {
    type: 'list';
    ordered: boolean;
    items: ListItemNode[];
};
export type TableCellNode = {
    type: 'tableCell';
    content: string | SemanticMarkdownAST[];
    colId?: string;
};
export type TableRowNode = {
    type: 'tableRow';
    cells: TableCellNode[];
};
export type TableNode = {
    type: 'table';
    rows: TableRowNode[];
    colIds?: string[];
};
export type CodeNode = {
    type: 'code';
    language?: string;
    content: string;
    inline: boolean;
};
export type BlockquoteNode = {
    type: 'blockquote';
    content: SemanticMarkdownAST[];
};
export type CustomNode = {
    type: 'custom';
    content: any;
};
export type SemanticHtmlNode = {
    type: 'semanticHtml';
    htmlType: 'article' | 'aside' | 'details' | 'figcaption' | 'figure' | 'footer' | 'header' | 'main' | 'mark' | 'nav' | 'section' | 'summary' | 'time';
    content: SemanticMarkdownAST[];
};
export type VideoNode = {
    type: 'video';
    src: string;
    poster?: string;
    controls?: boolean;
};
export type TextNode = {
    type: 'text';
    content: string;
};
export type MetaDataNode = {
    type: 'meta';
    content: {
        standard?: Record<string, string>;
        openGraph?: Record<string, string>;
        twitter?: Record<string, string>;
        jsonLd?: {
            [key: string]: any;
        }[];
    };
};
export type SemanticMarkdownAST = TextNode | BoldNode | ItalicNode | StrikethroughNode | HeadingNode | LinkNode | ImageNode | VideoNode | ListNode | TableNode | CodeNode | BlockquoteNode | SemanticHtmlNode | CustomNode | MetaDataNode;
export interface ConversionOptions {
    /**
     * The domain of the website, used to create relative links for images and links.
     */
    websiteDomain?: string;
    /**
     * Whether to extract the main content of the HTML, ignoring elements like headers and footers.
     */
    extractMainContent?: boolean;
    /**
     * Whether to convert URLs to a shorter reference format.
     */
    refifyUrls?: boolean;
    /**
     * A map of URL references to their original values, generated when `refifyUrls` is enabled.
     */
    urlMap?: Record<string, string>;
    /**
     * Enables debug logging during the conversion process.
     */
    debug?: boolean;
    /**
     * Provides an override for the DOMParser object used to parse the HTML.
     */
    overrideDOMParser?: DOMParser;
    /**
     * Enables adding correlational IDs to table cells in the Markdown output.
     */
    enableTableColumnTracking?: boolean;
    /**
     * Provides a function to override the default element processing logic.
     */
    overrideElementProcessing?: (element: Element, options: ConversionOptions, indentLevel: number) => SemanticMarkdownAST[] | undefined;
    /**
     * Provides a function to process unhandled HTML elements.
     */
    processUnhandledElement?: (element: Element, options: ConversionOptions, indentLevel: number) => SemanticMarkdownAST[] | undefined;
    /**
     * Provides a function to override the default node rendering logic.
     */
    overrideNodeRenderer?: (node: SemanticMarkdownAST, options: ConversionOptions, indentLevel: number) => string | undefined;
    /**
     * Provides a function to render custom nodes.
     */
    renderCustomNode?: (node: CustomNode, options: ConversionOptions, indentLevel: number) => string | undefined;
    /**
     * Controls whether to include metadata extracted from the HTML head.
     * - `'basic'`: Includes standard meta tags like title, description, and keywords.
     * - `'extended'`: Includes basic meta tags, Open Graph tags, Twitter Card tags, and JSON-LD data.
     * - `false`: Disables metadata extraction.
     */
    includeMetaData?: 'basic' | 'extended' | false;
}
