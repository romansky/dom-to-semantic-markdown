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
// Define heading levels
export type HeadingNode = {
    type: 'heading';
    level: 1 | 2 | 3 | 4 | 5 | 6;
    content: string;
};
// Define links and images
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
// Define lists
export type ListItemNode = {
    type: 'listItem';
    content: SemanticMarkdownAST[];
};
export type ListNode = {
    type: 'list';
    ordered: boolean;
    items: ListItemNode[];
};
// Define tables
export type TableCellNode = {
    type: 'tableCell';
    content: string | SemanticMarkdownAST[];
    colId?: string; // Add column ID to TableCell
};
export type TableRowNode = {
    type: 'tableRow';
    cells: TableCellNode[];
};
export type TableNode = {
    type: 'table';
    rows: TableRowNode[];
    colIds?: string[]; // Add column IDs to TableElement
};
// Define code elements
export type CodeNode = {
    type: 'code';
    content: string;
    inline: boolean;
};
// Define blockquotes
export type BlockquoteNode = {
    type: 'blockquote';
    content: SemanticMarkdownAST[];
};
export type CustomNode = {
    type: 'custom';
    content: any;
};
// Define semantic HTML elements (like header, footer)
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
export type SemanticMarkdownAST =
    TextNode
    | BoldNode
    | ItalicNode
    | StrikethroughNode
    | HeadingNode
    | LinkNode
    | ImageNode
    | VideoNode
    | ListNode
    | TableNode
    | CodeNode
    | BlockquoteNode
    | SemanticHtmlNode
    | CustomNode;

export interface ConversionOptions {
    websiteDomain?: string;
    extractMainContent?: boolean;
    refifyUrls?: boolean;
    urlMap?: Record<string, string>;
    debug?: boolean;
    overrideDOMParser?: DOMParser;
    enableTableColumnTracking?: boolean;
    overrideElementProcessing?: (element: Element, options: ConversionOptions, indentLevel: number) => SemanticMarkdownAST[] | undefined;
    processUnhandledElement?: (element: Element, options: ConversionOptions, indentLevel: number) => SemanticMarkdownAST[] | undefined;
    overrideNodeRenderer?: (node: SemanticMarkdownAST, options: ConversionOptions, indentLevel: number) => string | undefined;
    renderCustomNode?: (node: CustomNode, options: ConversionOptions, indentLevel: number) => string | undefined;
}
