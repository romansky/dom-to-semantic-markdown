"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMainContent = findMainContent;
exports.wrapMainContent = wrapMainContent;
exports.isElementVisible = isElementVisible;
exports.getVisibleText = getVisibleText;
const ElementNode_1 = require("./ElementNode");
const enableDebug = false;
const debugMessage = (message) => {
    if (enableDebug) {
        console.log(message);
    }
};
/**
 * Attempts to find the main content of a web page.
 * @param document The Document object to search.
 * @returns The Element containing the main content, or the body if no main content is found.
 */
function findMainContent(document) {
    debugMessage('Entering findMainContent function');
    const mainElement = document.querySelector('main');
    if (mainElement) {
        debugMessage('Existing <main> element found');
        return mainElement;
    }
    debugMessage('No <main> element found. Detecting main content.');
    if (!document.body) {
        debugMessage('No body element found, returning document.documentElement');
        return document.documentElement;
    }
    return detectMainContent(document.body);
}
function wrapMainContent(mainContentElement, document) {
    if (mainContentElement.tagName.toLowerCase() !== 'main') {
        debugMessage('Wrapping main content in <main> element');
        const mainElement = document.createElement('main');
        mainContentElement.before(mainElement);
        mainElement.appendChild(mainContentElement);
        mainElement.id = 'detected-main-content';
        debugMessage('Main content wrapped successfully');
    }
    else {
        debugMessage('Main content already wrapped');
    }
}
function detectMainContent(rootElement) {
    const candidates = [];
    const minScore = 20;
    debugMessage(`Collecting candidates with minimum score: ${minScore}`);
    collectCandidates(rootElement, candidates, minScore);
    debugMessage(`Total candidates found: ${candidates.length}`);
    if (candidates.length === 0) {
        debugMessage('No suitable candidates found, returning root element');
        return rootElement;
    }
    candidates.sort((a, b) => calculateScore(b) - calculateScore(a));
    debugMessage('Candidates sorted by score');
    let bestIndependentCandidate = candidates[0];
    for (let i = 1; i < candidates.length; i++) {
        if (!candidates.some((otherCandidate, j) => j !== i && otherCandidate.contains(candidates[i]))) {
            if (calculateScore(candidates[i]) > calculateScore(bestIndependentCandidate)) {
                bestIndependentCandidate = candidates[i];
                debugMessage(`New best independent candidate found: ${elementToString(bestIndependentCandidate)}`);
            }
        }
    }
    debugMessage(`Final main content candidate: ${elementToString(bestIndependentCandidate)}`);
    return bestIndependentCandidate;
}
function elementToString(element) {
    if (!element) {
        return 'No element';
    }
    return `${element.tagName}#${element.id || 'no-id'}.${Array.from(element.classList).join('.')}`;
}
function collectCandidates(element, candidates, minScore) {
    const score = calculateScore(element);
    if (score >= minScore) {
        candidates.push(element);
        debugMessage(`Candidate found: ${elementToString(element)}, score: ${score}`);
    }
    Array.from(element.children).forEach(child => {
        collectCandidates(child, candidates, minScore);
    });
}
function calculateScore(element) {
    let score = 0;
    let scoreLog = [];
    // High impact attributes
    const highImpactAttributes = ['article', 'content', 'main-container', 'main', 'main-content'];
    highImpactAttributes.forEach(attr => {
        if (element.classList.contains(attr) || element.id.includes(attr)) {
            score += 10;
            scoreLog.push(`High impact attribute found: ${attr}, score increased by 10`);
        }
    });
    // High impact tags
    const highImpactTags = ['article', 'main', 'section'];
    if (highImpactTags.includes(element.tagName.toLowerCase())) {
        score += 5;
        scoreLog.push(`High impact tag found: ${element.tagName}, score increased by 5`);
    }
    // Paragraph count
    const paragraphCount = element.getElementsByTagName('p').length;
    const paragraphScore = Math.min(paragraphCount, 5);
    if (paragraphScore > 0) {
        score += paragraphScore;
        scoreLog.push(`Paragraph count: ${paragraphCount}, score increased by ${paragraphScore}`);
    }
    // Text content length
    const textContentLength = element.textContent?.trim().length || 0;
    if (textContentLength > 200) {
        const textScore = Math.min(Math.floor(textContentLength / 200), 5);
        score += textScore;
        scoreLog.push(`Text content length: ${textContentLength}, score increased by ${textScore}`);
    }
    // Link density
    const linkDensity = calculateLinkDensity(element);
    if (linkDensity < 0.3) {
        score += 5;
        scoreLog.push(`Link density: ${linkDensity.toFixed(2)}, score increased by 5`);
    }
    // Data attributes
    if (element.hasAttribute('data-main') || element.hasAttribute('data-content')) {
        score += 10;
        scoreLog.push('Data attribute for main content found, score increased by 10');
    }
    // Role attribute
    if (element.getAttribute('role')?.includes('main')) {
        score += 10;
        scoreLog.push('Role attribute indicating main content found, score increased by 10');
    }
    if (scoreLog.length > 0) {
        debugMessage(`Scoring for ${elementToString(element)}:`);
        scoreLog.forEach(log => debugMessage('  ' + log));
        debugMessage(`  Final score: ${score}`);
    }
    return score;
}
function calculateLinkDensity(element) {
    const linkLength = Array.from(element.getElementsByTagName('a'))
        .reduce((sum, link) => sum + (link.textContent?.length || 0), 0);
    const textLength = element.textContent?.length || 1; // Avoid division by zero
    return linkLength / textLength;
}
function isElementVisible(element) {
    if (!(element instanceof HTMLElement)) {
        return true; // Non-HTMLElements are considered visible
    }
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}
function getVisibleText(element) {
    if (!isElementVisible(element)) {
        return '';
    }
    let text = '';
    for (const child of Array.from(element.childNodes)) {
        if (child.nodeType === ElementNode_1._Node.TEXT_NODE) {
            text += child.textContent;
        }
        else if (child.nodeType === ElementNode_1._Node.ELEMENT_NODE) {
            text += getVisibleText(child);
        }
    }
    return text.trim();
}
