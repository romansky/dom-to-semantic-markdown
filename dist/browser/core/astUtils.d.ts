import { SemanticMarkdownAST } from "../types/markdownTypes";
export declare const getMainContent: (markdownStr: string) => string;
export declare const isNot: <T, U>(tPred: (t: T | U) => t is T) => (t: T | U) => t is Exclude<U, T>;
export declare function findInAST(markdownElement: SemanticMarkdownAST | SemanticMarkdownAST[], checker: (markdownElement: SemanticMarkdownAST) => boolean): SemanticMarkdownAST | undefined;
export declare function findAllInAST(markdownElement: SemanticMarkdownAST | SemanticMarkdownAST[], checker: (markdownElement: SemanticMarkdownAST) => boolean): SemanticMarkdownAST[];
