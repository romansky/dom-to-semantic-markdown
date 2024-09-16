import { SemanticMarkdownAST } from "../types/markdownTypes";
export declare function refifyUrls(markdownElement: SemanticMarkdownAST | SemanticMarkdownAST[], prefixesToRefs?: Record<string, string>): Record<string, string>;
