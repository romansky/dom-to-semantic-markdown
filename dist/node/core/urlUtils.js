"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refifyUrls = refifyUrls;
const mediaSuffixes = ["jpeg", "jpg", "png", "gif", "bmp", "tiff", "tif", "svg",
    "webp", "ico", "avi", "mov", "mp4", "mkv", "flv", "wmv", "webm", "mpeg",
    "mpg", "mp3", "wav", "aac", "ogg", "flac", "m4a", "pdf", "doc", "docx",
    "ppt", "pptx", "xls", "xlsx", "txt", "css", "js", "xml", "json",
    "html", "htm"
];
const addRefPrefix = (prefix, prefixesToRefs) => {
    if (!prefixesToRefs[prefix]) {
        prefixesToRefs[prefix] = 'ref' + Object.values(prefixesToRefs).length;
    }
    return prefixesToRefs[prefix];
};
const processUrl = (url, prefixesToRefs) => {
    if (!url.startsWith('http')) {
        return url;
    }
    else {
        const mediaSuffix = url.split('.').slice(-1)[0];
        if (mediaSuffix && mediaSuffixes.includes(mediaSuffix)) {
            const parts = url.split('/'); // Split URL keeping the slash before text
            const prefix = parts.slice(0, -1).join('/'); // Get the prefix by removing last part
            const refPrefix = addRefPrefix(prefix, prefixesToRefs);
            return `${refPrefix}://${parts.slice(-1).join('')}`;
        }
        else {
            if (url.split('/').length > 4) {
                return addRefPrefix(url, prefixesToRefs);
            }
            else {
                return url;
            }
        }
    }
};
function refifyUrls(markdownElement, prefixesToRefs = {}) {
    if (Array.isArray(markdownElement)) {
        markdownElement.forEach(element => refifyUrls(element, prefixesToRefs));
    }
    else {
        switch (markdownElement.type) {
            case 'link':
                markdownElement.href = processUrl(markdownElement.href, prefixesToRefs);
                refifyUrls(markdownElement.content, prefixesToRefs);
                break;
            case 'image':
            case 'video':
                markdownElement.src = processUrl(markdownElement.src, prefixesToRefs);
                break;
            case 'list':
                markdownElement.items.forEach(item => item.content.forEach(_ => refifyUrls(_, prefixesToRefs)));
                break;
            case 'table':
                markdownElement.rows.forEach(row => row.cells.forEach(cell => typeof cell.content === 'string' ? null : refifyUrls(cell.content, prefixesToRefs)));
                break;
            case 'blockquote':
            case 'semanticHtml':
                refifyUrls(markdownElement.content, prefixesToRefs);
                break;
        }
    }
    return prefixesToRefs;
}
