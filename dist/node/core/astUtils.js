"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNot = exports.getMainContent = void 0;
exports.findInAST = findInAST;
exports.findAllInAST = findAllInAST;
const getMainContent = (markdownStr) => {
    if (markdownStr.includes('<-main->')) {
        const regex = /(?<=<-main->)[\s\S]*?(?=<\/-main->)/;
        const match = markdownStr.match(regex);
        return match?.[0] ?? '';
    }
    else {
        const removeSectionsRegex = /(<-nav->[\s\S]*?<\/-nav->)|(<-footer->[\s\S]*?<\/-footer->)|(<-header->[\s\S]*?<\/-header->)|(<-aside->[\s\S]*?<\/-aside->)/g;
        return markdownStr.replace(removeSectionsRegex, '');
    }
};
exports.getMainContent = getMainContent;
const isNot = (tPred) => (t) => !tPred(t);
exports.isNot = isNot;
const isString = (x) => typeof x === "string";
function findInAST(markdownElement, checker) {
    const loopCheck = (z) => {
        for (const element of z) {
            const found = findInAST(element, checker);
            if (found) {
                return found;
            }
        }
        return undefined;
    };
    if (Array.isArray(markdownElement)) {
        return loopCheck(markdownElement);
    }
    else {
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
                    .filter((0, exports.isNot)(isString)))
                    .flat());
            case 'blockquote':
            case 'semanticHtml':
                return loopCheck(markdownElement.content);
        }
        return undefined;
    }
}
function findAllInAST(markdownElement, checker) {
    const loopCheck = (z) => {
        let out = [];
        for (const element of z) {
            const found = findAllInAST(element, checker);
            out = [...out, ...found];
        }
        return out;
    };
    if (Array.isArray(markdownElement)) {
        return loopCheck(markdownElement);
    }
    else {
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
                    .filter((0, exports.isNot)(isString)))
                    .flat());
            case 'blockquote':
            case 'semanticHtml':
                return loopCheck(markdownElement.content);
        }
        return [];
    }
}
