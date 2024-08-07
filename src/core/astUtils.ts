import {SemanticMarkdownAST} from "../types/markdownTypes";

export const getMainContent = (markdownStr: string) => {
    if (markdownStr.includes('<-main->')) {
        const regex = /(?<=<-main->)[\s\S]*?(?=<\/-main->)/;
        const match = markdownStr.match(regex);
        return match?.[0] ?? '';
    } else {
        const removeSectionsRegex = /(<-nav->[\s\S]*?<\/-nav->)|(<-footer->[\s\S]*?<\/-footer->)|(<-header->[\s\S]*?<\/-header->)|(<-aside->[\s\S]*?<\/-aside->)/g;

        return markdownStr.replace(removeSectionsRegex, '');
    }
}

export const isNot = <T, U>(tPred: (t: T | U) => t is T) =>
    (t: T | U): t is Exclude<U, T> => !tPred(t);

const isString = (x: any): x is string => typeof x === "string";

export function findInAST(markdownElement: SemanticMarkdownAST | SemanticMarkdownAST[], checker: (markdownElement: SemanticMarkdownAST) => boolean): SemanticMarkdownAST | undefined {
    const loopCheck = (z: SemanticMarkdownAST[]): SemanticMarkdownAST | undefined => {
        for (const element of z) {
            const found = findInAST(element, checker);
            if (found) {
                return found;
            }
        }
        return undefined;
    }
    if (Array.isArray(markdownElement)) {
        return loopCheck(markdownElement)
    } else {
        if (checker(markdownElement)) {
            return markdownElement;
        }
        switch (markdownElement.type) {
            case 'link':
                return loopCheck(markdownElement.content);
            case 'list':
                return loopCheck(markdownElement.items
                    .map(_ => _.content)
                    .flat());
            case 'table':
                return loopCheck(markdownElement.rows
                    .map(row => row.cells.map(_ => _.content)
                        .filter(isNot(isString)))
                    .flat()
                );
            case 'blockquote':
            case 'semanticHtml':
                return loopCheck(markdownElement.content);
        }

        return undefined;
    }
}

export function findAllInAST(markdownElement: SemanticMarkdownAST | SemanticMarkdownAST[], checker: (markdownElement: SemanticMarkdownAST) => boolean): SemanticMarkdownAST[] {
    const loopCheck = (z: SemanticMarkdownAST[]): SemanticMarkdownAST[] => {
        let out: SemanticMarkdownAST[] = [];
        for (const element of z) {
            const found = findAllInAST(element, checker);
            out = [...out, ...found];
        }
        return out;
    }
    if (Array.isArray(markdownElement)) {
        return loopCheck(markdownElement)
    } else {
        if (checker(markdownElement)) {
            return [markdownElement];
        }
        switch (markdownElement.type) {
            case 'link':
                return loopCheck(markdownElement.content);
            case 'list':
                return loopCheck(markdownElement.items
                    .map(_ => _.content)
                    .flat());
            case 'table':
                return loopCheck(markdownElement.rows
                    .map(row => row.cells.map(_ => _.content)
                        .filter(isNot(isString)))
                    .flat()
                );
            case 'blockquote':
            case 'semanticHtml':
                return loopCheck(markdownElement.content);
        }

        return [];
    }
}
