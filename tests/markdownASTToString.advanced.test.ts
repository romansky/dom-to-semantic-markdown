import {
    ConversionOptions,
    markdownASTToString, SemanticMarkdownAST
} from '../src';
import {ImageNode, ListItemNode, MetaDataNode, TableNode, TextNode, VideoNode} from "../src/types/markdownTypes";

describe('markdownASTToString Advanced Content Rendering', () => {
    const defaultOptions: ConversionOptions = {includeMetaData: false};

    const renderContent = (nodes: SemanticMarkdownAST[], options: ConversionOptions = defaultOptions) => {
        return markdownASTToString(nodes, options);
    };

    describe('Link Rendering Nuances', () => {
        test('should render simple link correctly', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'link',
                href: '/foo',
                content: [{type: 'text', content: 'LinkText'}]
            }];
            expect(renderContent(ast)).toBe('[LinkText](/foo)');
        });

        test('should use <a> tag for link text with leading/trailing standard spaces in AST', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'link',
                href: '/foo',
                content: [{type: 'text', content: '  LinkText  '}]
            }];
            expect(renderContent(ast)).toBe('<a href="/foo">LinkText</a>');
        });

        test('should preserve internal multiple standard spaces in link text', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'link',
                href: '/foo',
                content: [{type: 'text', content: 'Link  With  Spaces'}]
            }];
            expect(renderContent(ast)).toBe('[Link  With  Spaces](/foo)');
        });

        test('should render link text with non-breaking spaces (NBSP) as [NBSP Link NBSP](url)', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'link',
                href: '/test',
                content: [{type: 'text', content: '\u00A0\u00A0NBSP Link\u00A0\u00A0'}]
            }];
            expect(renderContent(ast)).toBe('<a href="/test">NBSP Link</a>');
        });

        test('should use <a> tag for link with complex content (e.g., bold text)', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'link',
                href: '/foo',
                content: [
                    {type: 'text', content: 'Click '},
                    {type: 'bold', content: [{type: 'text', content: 'here'}]}
                ]
            }];
            expect(renderContent(ast)).toBe('<a href="/foo">Click **here**</a>');
        });

        test('should trim complex link content that has overall leading/trailing spaces', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'link',
                href: '/foo',
                content: [
                    {type: 'text', content: '  Click '},
                    {type: 'bold', content: [{type: 'text', content: 'here'}]},
                    {type: 'text', content: ' too  '}
                ]
            }];
            expect(renderContent(ast)).toBe('<a href="/foo">Click **here** too</a>');
        });
    });

    describe('Whitespace and Formatting Between Inline Elements', () => {
        test('should add space between consecutive text nodes', () => {
            const ast: SemanticMarkdownAST[] = [
                {type: 'text', content: 'Text1'},
                {type: 'text', content: 'Text2'}
            ];
            expect(renderContent(ast)).toBe('Text1 Text2');
        });

        test('should handle punctuation correctly when adding spaces', () => {
            const ast: SemanticMarkdownAST[] = [
                {type: 'text', content: 'Text1'},
                {type: 'text', content: '.'},
                {type: 'text', content: 'Text2'}
            ];
            expect(renderContent(ast)).toBe('Text1. Text2');
        });

        test('should add space between bold and italic', () => {
            const ast: SemanticMarkdownAST[] = [
                {type: 'bold', content: [{type: 'text', content: 'Bold'}]},
                {type: 'italic', content: [{type: 'text', content: 'Italic'}]}
            ];
            expect(renderContent(ast)).toBe('**Bold** *Italic*');
        });

        test('should trim bold/italic content but maintain surrounding spaces correctly', () => {
            const ast: SemanticMarkdownAST[] = [
                {type: 'text', content: 'Before'},
                {type: 'bold', content: [{type: 'text', content: '  SpacedBold  '}]},
                {type: 'text', content: 'After'}
            ];
            expect(renderContent(ast)).toBe('Before **SpacedBold** After');
        });

        test('should add space between text and link', () => {
            const ast: SemanticMarkdownAST[] = [
                {type: 'text', content: 'Go to'},
                {type: 'link', href: '/home', content: [{type: 'text', content: 'Home'}]}
            ];
            expect(renderContent(ast)).toBe('Go to [Home](/home)');
        });

        test('should add space between link and text', () => {
            const ast: SemanticMarkdownAST[] = [
                {type: 'link', href: '/home', content: [{type: 'text', content: 'Home'}]},
                {type: 'text', content: 'page'}
            ];
            expect(renderContent(ast)).toBe('[Home](/home) page');
        });

        test('should add space between link and link', () => {
            const ast: SemanticMarkdownAST[] = [
                {type: 'link', href: '/1', content: [{type: 'text', content: 'L1'}]},
                {type: 'link', href: '/2', content: [{type: 'text', content: 'L2'}]}
            ];
            expect(renderContent(ast)).toBe('[L1](/1) [L2](/2)');
        });

        test('should handle text followed by inline code', () => {
            const ast: SemanticMarkdownAST[] = [
                {type: 'text', content: 'Variable'},
                {type: 'code', inline: true, content: 'myVar'}
            ];
            expect(renderContent(ast)).toBe('Variable `myVar`');
        });

        test('text node containing only spaces between two other elements should be preserved', () => {
            const ast: SemanticMarkdownAST[] = [
                {type: 'bold', content: [{type: 'text', content: 'Bold'}]},
                {type: 'text', content: '   '},
                {type: 'italic', content: [{type: 'text', content: 'Italic'}]}
            ];
            expect(renderContent(ast)).toBe('**Bold**   *Italic*');
        });

        test('empty text node between two other elements', () => {
            const ast: SemanticMarkdownAST[] = [
                {type: 'bold', content: [{type: 'text', content: 'Bold'}]},
                {type: 'text', content: ''},
                {type: 'italic', content: [{type: 'text', content: 'Italic'}]}
            ];
            expect(renderContent(ast)).toBe('**Bold** *Italic*');
        });
    });

    describe('List Item Content Rendering', () => {
        test('list item with link having standard spaces in text (becomes <a> tag)', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'list',
                ordered: true,
                items: [{
                    content: [{
                        type: 'link',
                        href: '/doc',
                        content: [{type: 'text', content: '  Doc Link  '}]
                    }]
                } as ListItemNode]
            }];
            expect(renderContent(ast).trim()).toBe('1. <a href="/doc">Doc Link</a>');
        });

        test('list item with multiple inline elements and correct spacing', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'list',
                ordered: false,
                items: [{
                    content: [
                        {type: 'text', content: 'Item:'},
                        {type: 'bold', content: [{type: 'text', content: 'Bold Text'}]},
                        {type: 'text', content: 'and'},
                        {type: 'italic', content: [{type: 'text', content: 'Italic Text'}]}
                    ]
                } as ListItemNode]
            }];
            expect(renderContent(ast).trim()).toBe('- Item: **Bold Text** and *Italic Text*');
        });

        test('list item starting with link', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'list',
                ordered: false,
                items: [{
                    content: [
                        {type: 'link', href: "/A", content: [{type: 'text', content: "LinkA"}]},
                        {type: 'text', content: "continues"}
                    ]
                } as ListItemNode]
            }];
            expect(renderContent(ast).trim()).toBe("- [LinkA](/A) continues");
        });
    });

    describe('Heading Content Rendering', () => {
        test('heading with mixed inline content', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'heading',
                level: 1,
                content: [
                    {type: 'text', content: 'Title with '},
                    {type: 'bold', content: [{type: 'text', content: 'Bold'}]},
                    {type: 'text', content: ' and '},
                    {type: 'link', href: '/page', content: [{type: 'text', content: 'Link'}]}
                ]
            }];
            expect(renderContent(ast).trim()).toBe('# Title with **Bold** and [Link](/page)');
        });
    });
});

describe('markdownASTToString Robustness and Edge Cases', () => {
    const defaultOptions: ConversionOptions = {includeMetaData: false};
    const render = (nodes: SemanticMarkdownAST[], options: ConversionOptions = defaultOptions) => {
        return markdownASTToString(nodes, options);
    };

    describe('Meta Data Handling', () => {
        test('should handle empty meta node content gracefully', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'meta',
                content: {}
            } as MetaDataNode];
            const options: ConversionOptions = {includeMetaData: "basic"};
            expect(render(ast, options)).toBe('---\n---\n\n\n');
        });

        test('should handle missing extended meta fields gracefully', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'meta',
                content: {
                    standard: {title: 'Test'},
                }
            } as MetaDataNode];
            const options: ConversionOptions = {includeMetaData: 'extended'};
            expect(render(ast, options)).toBe('---\ntitle: "Test"\n---\n\n\n');
        });

        test('should handle jsonLd item without @type', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'meta',
                content: {
                    jsonLd: [{"name": "Thing"} as any]
                }
            } as MetaDataNode];
            const options: ConversionOptions = {includeMetaData: 'extended'};
            expect(render(ast, options)).toBe('---\nschema:\n  (unknown type):\n    name: "Thing"\n---\n\n\n');
        });

        test('should produce empty string if includeMetaData is false', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'meta',
                content: {standard: {title: 'Test'}}
            } as MetaDataNode];
            expect(render(ast, {includeMetaData: false})).toBe('');
        });

        test('should handle no meta node found with includeMetaData true', () => {
            const ast: SemanticMarkdownAST[] = [{type: 'text', content: 'No meta here'}];
            const options: ConversionOptions = {includeMetaData: "basic"};
            expect(render(ast, options)).toBe('---\n---\n\nNo meta here');
        });
    });

    describe('Image Node Robustness', () => {
        test('should render empty string for image with null src', () => {
            const ast: SemanticMarkdownAST[] = [{type: 'image', src: null, alt: 'Null src'} as unknown as ImageNode];
            expect(render(ast)).toBe('![Null src]()');
        });

        test('should render empty string for image with undefined src', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'image',
                src: undefined,
                alt: 'Undefined src'
            } as unknown as ImageNode];
            expect(render(ast)).toBe('![Undefined src]()');
        });

        test('should render image with empty src string', () => {
            const ast: SemanticMarkdownAST[] = [{type: 'image', src: '', alt: 'Empty src'}];
            expect(render(ast)).toBe('![Empty src]()');
        });

        test('should encode special characters in image src', () => {
            const ast: SemanticMarkdownAST[] = [{type: 'image', src: '/path with spaces/image.png', alt: 'Spaces'}];
            expect(render(ast)).toBe('![Spaces](/path%20with%20spaces/image.png)');
        });

        test('should use empty alt text if node.alt is null or undefined', () => {
            const astNull: SemanticMarkdownAST[] = [{
                type: 'image',
                src: '/test.png',
                alt: null
            } as unknown as ImageNode];
            expect(render(astNull)).toBe('![](/test.png)');
            const astUndef: SemanticMarkdownAST[] = [{
                type: 'image',
                src: '/test.png',
                alt: undefined
            } as unknown as ImageNode];
            expect(render(astUndef)).toBe('![](/test.png)');
        });

        test('should trim alt text and handle NBSP', () => {
            const ast: SemanticMarkdownAST[] = [{type: 'image', src: '/test.png', alt: '  Alt\u00A0Text\u00A0  '}];
            expect(render(ast)).toBe('![Alt\u00A0Text](/test.png)');
        });
    });

    describe('Blockquote Multi-line Formatting', () => {
        test('should format blockquote with multiple paragraphs', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'blockquote',
                content: [
                    {type: 'text', content: 'First paragraph.'},
                    {type: 'text', content: '\n\nSecond paragraph.'}
                ]
            }];
            expect(render(ast)).toBe('> First paragraph.\n> \n> Second paragraph.');
        });

        test('should format blockquote with lines having leading/trailing spaces in content', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'blockquote',
                content: [{type: 'text', content: '  Line 1  \n  Line 2  '}]
            }];
            expect(render(ast)).toBe('> Line 1\n> Line 2');
        });

        test('should handle blockquote with content that is only whitespace', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'blockquote',
                content: [{type: 'text', content: '   \n \t  '}]
            }];
            expect(render(ast)).toBe('>');
        });

        test('should handle empty blockquote content array', () => {
            const ast: SemanticMarkdownAST[] = [{type: 'blockquote', content: []}];
            expect(render(ast)).toBe('>');
        });
    });

    describe('Table Cell Escaping and Content', () => {
        test('should escape pipe characters in table cell content', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'table',
                rows: [{cells: [{content: 'Cell | with | pipes'}]}]
            } as TableNode];
            expect(render(ast).trim()).toBe('| Cell \\| with \\| pipes |');
        });

        test('should preserve backslashes and other markdown in cell content', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'table',
                rows: [{cells: [{content: 'Cell with \\`*markdown*\\`'}]}]
            } as TableNode];
            expect(render(ast).trim()).toBe('| Cell with \\`*markdown*\\` |');
        });

        test('should render complex content like links within table cells', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'table',
                rows: [{
                    cells: [{
                        content: [{type: 'link', href: '/test', content: [{type: 'text', content: 'Link'}]}]
                    }]
                }]
            } as TableNode];
            expect(render(ast).trim()).toBe('| [Link](/test) |');
        });

        test('should handle empty cell content', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'table',
                rows: [{cells: [{content: ''}]}]
            } as TableNode];
            expect(render(ast).trim()).toBe('|  |');
        });

        test('should handle table with no rows or no cells', () => {
            const astNoRows: SemanticMarkdownAST[] = [{type: 'table', rows: []} as TableNode];
            expect(render(astNoRows).trim()).toBe('');
            const astNoCells: SemanticMarkdownAST[] = [{type: 'table', rows: [{type: 'tableRow', cells: []}]}];
            expect(render(astNoCells)).toBe('');
        });
    });

    describe('Video Node Robustness', () => {
        test('should handle missing src in video node', () => {
            const ast: SemanticMarkdownAST[] = [{type: 'video', poster: '/poster.png', controls: true} as VideoNode];
            expect(render(ast).trim()).toBe('![Video]()\n![Poster](/poster.png)\nControls: true');
        });
        test('should handle missing poster in video node', () => {
            const ast: SemanticMarkdownAST[] = [{type: 'video', src: '/video.mp4', controls: false} as VideoNode];
            expect(render(ast).trim()).toBe('![Video](/video.mp4)\nControls: false');
        });
        test('should handle video node with only src', () => {
            const ast: SemanticMarkdownAST[] = [{type: 'video', src: '/video.mp4'} as VideoNode];
            expect(render(ast).trim()).toBe('![Video](/video.mp4)');
        });
    });

    describe('List Robustness', () => {
        test('should handle empty list items array', () => {
            const ast: SemanticMarkdownAST[] = [{type: 'list', ordered: false, items: []}];
            expect(render(ast)).toBe('');
        });
        test('should handle list item with empty content array', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'list',
                ordered: false,
                items: [{type: 'listItem', content: []}]
            }];
            expect(render(ast).trim()).toBe("-");
        });
        test('should handle list item rendering to empty string', () => {
            const ast: SemanticMarkdownAST[] = [{
                type: 'list',
                ordered: true,
                items: [{content: [{type: 'text', content: "  "}]} as ListItemNode]
            }];
            expect(render(ast).trim()).toBe("1.");
        });
    });

    describe('Inline Code Whitespace', () => {
        test('code preceded by text ending in whitespace', () => {
            const ast: SemanticMarkdownAST[] = [
                {type: 'text', content: 'Text '},
                {type: 'code', inline: true, content: 'myVar'}
            ];
            expect(render(ast)).toBe('Text `myVar`');
        });
        test('code followed by text starting with whitespace', () => {
            const ast: SemanticMarkdownAST[] = [
                {type: 'code', inline: true, content: 'myVar'},
                {type: 'text', content: ' Text'}
            ];
            expect(render(ast)).toBe('`myVar` Text');
        });
    });

    describe('Node Renderer Overrides', () => {
        test('overrideNodeRenderer should take precedence', () => {
            const ast: SemanticMarkdownAST[] = [{type: 'text', content: 'Hello'}];
            const options: ConversionOptions = {
                overrideNodeRenderer: (node) => {
                    if (node.type === 'text') return 'OVERRIDE';
                    return undefined;
                }
            };
            expect(render(ast, options)).toBe('OVERRIDE');
        });

        test('renderCustomNode should be used for custom type', () => {
            const ast: SemanticMarkdownAST[] = [{type: 'custom', customType: 'mySpecial', data: 'foo'} as any];
            const options: ConversionOptions = {
                renderCustomNode: (node) => {
                    if (node.type === 'custom' && (node as any).customType === 'mySpecial') return `CUSTOM:${(node as any).data}`;
                    return undefined;
                }
            };
            expect(render(ast, options)).toBe('CUSTOM:foo');
        });
        test('overrideNodeRenderer returning empty string', () => {
            const ast: SemanticMarkdownAST[] = [{type: 'text', content: 'Hello'}, {type: 'text', content: 'World'}];
            const options: ConversionOptions = {
                overrideNodeRenderer: (node, opts, indent) => {
                    console.dir({node})
                    if (node.type === 'text' && (node as TextNode).content === 'Hello') return '';
                    return undefined;
                }
            };
            expect(render(ast, options)).toBe('World');
        });
    });

});
