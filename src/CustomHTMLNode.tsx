// Taken from https://github.com/mdx-editor/editor/blob/7c5372e5c8da73fa5c07c9074ff26a6ecf5cb0dd/src/plugins/core/GenericHTMLNode.tsx?plain=1#L1
import {
  $applyNodeReplacement,
  DOMConversionMap,
  DOMExportOutput,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from "lexical";
import { MdxJsxAttribute } from "mdast-util-mdx-jsx";
import { MdxNodeType, htmlTags } from "@mdxeditor/editor";

/**
 * All recognized HTML tags.
 * @group HTML
 */
export type KnownHTMLTagType = (typeof htmlTags)[number];

/** @internal */
export const TYPE_NAME = "custom-html" as const;

/**
 * A serialized representation of a {@link CustomHTMLNode}.
 * @group HTML
 */
export type SerializedCustomHTMLNode = Spread<
  {
    tag: KnownHTMLTagType;
    type: typeof TYPE_NAME;
    mdxType: MdxNodeType;
    attributes: MdxJsxAttribute[];
    version: 1;
  },
  SerializedElementNode
>;

/**
 * A Lexical node that represents a generic HTML element. Use {@link $createCustomHTMLNode} to construct one.
 * The generic HTML node is used as a "fallback" for HTML elements that are not explicitly supported by the editor.
 * @group HTML
 */
export class CustomHTMLNode extends ElementNode {
  /** @internal */
  __tag: KnownHTMLTagType;
  /** @internal */
  __nodeType: MdxNodeType;
  /** @internal */
  __attributes: MdxJsxAttribute[];

  /** @internal */
  static getType(): string {
    return TYPE_NAME;
  }

  /** @internal */
  static clone(node: CustomHTMLNode): CustomHTMLNode {
    return new CustomHTMLNode(
      node.__tag,
      node.__nodeType,
      node.__attributes,
      node.__key,
    );
  }

  /**
   * Constructs a new {@link CustomHTMLNode} with the specified MDAST HTML node as the object to edit.
   */
  constructor(
    tag: KnownHTMLTagType,
    type: MdxNodeType,
    attributes: MdxJsxAttribute[],
    key?: NodeKey,
  ) {
    super(key);
    this.__tag = tag;
    this.__nodeType = type;
    this.__attributes = attributes;
  }

  getTag(): KnownHTMLTagType {
    return this.__tag;
  }

  getNodeType(): MdxNodeType {
    return this.__nodeType;
  }

  getAttributes(): MdxJsxAttribute[] {
    return this.__attributes;
  }

  updateAttributes(attributes: MdxJsxAttribute[]): void {
    const self = this.getWritable();
    self.__attributes = attributes;
  }

  getStyle(): string {
    return this.__attributes.find((attribute) => attribute.name === "style")
      ?.value as string;
  }

  // View

  createDOM(): HTMLElement {
    const tag = this.__tag;
    const element = document.createElement(tag);
    // take the attributes and apply them to the element
    this.__attributes.forEach((attribute) => {
      element.setAttribute(attribute.name, attribute.value as string);
    });
    // XXX: just for demo purposes
    element.setAttribute("style", "border: 1px solid red");
    return element;
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    // TODO: take the implementation of convertHeadingElement from headingsPlugin
    return {};
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    // TODO
    const { element } = super.exportDOM(editor);

    // this.getFormatType()
    /*
    if (element && isHTMLElement(element)) {
      if (this.isEmpty()) element.append(document.createElement('br'))

      const formatType = this.getFormatType()
      element.style.textAlign = formatType

      const direction = this.getDirection()
      if (direction) {
        element.dir = direction
      }
    }*/

    return {
      element,
    };
  }

  static importJSON(serializedNode: SerializedCustomHTMLNode): CustomHTMLNode {
    const node = $createCustomHTMLNode(
      serializedNode.tag,
      serializedNode.mdxType,
      serializedNode.attributes,
    );
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  exportJSON(): SerializedCustomHTMLNode {
    return {
      ...super.exportJSON(),
      tag: this.getTag(),
      attributes: this.__attributes,
      mdxType: this.__nodeType,
      type: TYPE_NAME,
      version: 1,
    };
  }

  /*
  // Mutation
  insertNewAfter(selection?: RangeSelection, restoreSelection = true): ParagraphNode | GenericHTMLNode {
    const anchorOffet = selection ? selection.anchor.offset : 0
    const newElement =
      anchorOffet > 0 && anchorOffet < this.getTextContentSize() ? $createHeadingNode(this.getTag()) : $createParagraphNode()
    const direction = this.getDirection()
    newElement.setDirection(direction)
    this.insertAfter(newElement, restoreSelection)
    return newElement
  }

  collapseAtStart(): true {
    const newElement = !this.isEmpty() ? $createHeadingNode(this.getTag()) : $createParagraphNode()
    const children = this.getChildren()
    children.forEach((child) => newElement.append(child))
    this.replace(newElement)
    return true
  }*/

  extractWithChild(): boolean {
    return true;
  }

  isInline(): boolean {
    return this.__nodeType === "mdxJsxTextElement";
  }
}

/**
 * Creates a new {@link CustomHTMLNode} with the specified MDAST HTML node as the object to edit.
 * @group HTML
 */
export function $createCustomHTMLNode(
  tag: KnownHTMLTagType,
  type: MdxNodeType,
  attributes: MdxJsxAttribute[],
): CustomHTMLNode {
  return $applyNodeReplacement(new CustomHTMLNode(tag, type, attributes));
}

/**
 * Determines if the specified node is a {@link CustomHTMLNode}.
 * @group HTML
 */
export function $isCustomHTMLNode(
  node: LexicalNode | null | undefined,
): node is CustomHTMLNode {
  return node instanceof CustomHTMLNode;
}
