export type BoldElement = {
    type: 'bold';
    content: string;
};
export type ItalicElement = {
    type: 'italic';
    content: string;
};
export type StrikethroughElement = {
    type: 'strikethrough';
    content: string;
};
// Define heading levels
export type HeadingElement = {
    type: 'heading';
    level: 1 | 2 | 3 | 4 | 5 | 6;
    content: string;
};
// Define links and images
export type LinkElement = {
    type: 'link';
    href: string;
    content: SemanticMarkdownAST[];
};
export type ImageElement = {
    type: 'image';
    src: string;
    alt?: string;
};
// Define lists
export type ListItem = {
    type: 'listItem';
    content: SemanticMarkdownAST[];
};
export type ListElement = {
    type: 'list';
    ordered: boolean;
    items: ListItem[];
};
// Define tables
export type TableCell = {
    type: 'tableCell';
    content: string | SemanticMarkdownAST[];
};
export type TableRow = {
    type: 'tableRow';
    cells: TableCell[];
};
export type TableElement = {
    type: 'table';
    rows: TableRow[];
};
// Define code elements
export type CodeElement = {
    type: 'code';
    content: string;
    inline: boolean;
};
// Define blockquotes
export type BlockquoteElement = {
    type: 'blockquote';
    content: SemanticMarkdownAST[];
};
// Define semantic HTML elements (like header, footer)
export type SemanticHtmlElement = {
    type: 'semanticHtml';
    htmlType: 'article' | 'aside' | 'details' | 'figcaption' | 'figure' | 'footer' | 'header' | 'main' | 'mark' | 'nav' | 'section' | 'summary' | 'time';
    content: SemanticMarkdownAST[];
};
export type VideoElement = {
    type: 'video';
    src: string;
    poster?: string;
    controls?: boolean;
};
export type TextElement = {
    type: 'text';
    content: string;
};
export type SemanticMarkdownAST =
    TextElement
    | BoldElement
    | ItalicElement
    | StrikethroughElement
    | HeadingElement
    | LinkElement
    | ImageElement
    | VideoElement
    | ListElement
    | TableElement
    | CodeElement
    | BlockquoteElement
    | SemanticHtmlElement;

export interface ConversionOptions {
    websiteDomain?: string;
    extractMainContent?: boolean;
    refifyUrls?: boolean;
    urlMap?: Record<string, string>;
    debug?: boolean;
    overrideDOMParser?: DOMParser;
}
