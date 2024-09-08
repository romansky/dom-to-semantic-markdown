// this is by value copy of the global Node
export const _Node = {
    /** node is an element. */
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    /** node is a Text node. */
    TEXT_NODE: 3,
    /** node is a CDATASection node. */
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    /** node is a ProcessingInstruction node. */
    PROCESSING_INSTRUCTION_NODE: 7,
    /** node is a Comment node. */
    COMMENT_NODE: 8,
    /** node is a document. */
    DOCUMENT_NODE: 9,
    /** node is a doctype. */
    DOCUMENT_TYPE_NODE: 10,
    /** node is a DocumentFragment node. */
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12,
    /** Set when node and other are not in the same tree. */
    DOCUMENT_POSITION_DISCONNECTED: 0x01,
    /** Set when other is preceding node. */
    DOCUMENT_POSITION_PRECEDING: 0x02,
    /** Set when other is following node. */
    DOCUMENT_POSITION_FOLLOWING: 0x04,
    /** Set when other is an ancestor of node. */
    DOCUMENT_POSITION_CONTAINS: 0x08,
    /** Set when other is a descendant of node. */
    DOCUMENT_POSITION_CONTAINED_BY: 0x10,
    DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 0x20,
};
