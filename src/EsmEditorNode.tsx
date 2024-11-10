import {
  $applyNodeReplacement,
  DOMConversionMap,
  DecoratorNode,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";

/**
 * A serialized representation of a {@link GenericHTMLNode}.
 * @group HTML
 */
export type SerializedEsmEditorNode = Spread<
  {
    type: "esm-editor";
    value: string;
    version: 1;
  },
  SerializedLexicalNode
>;

/**
 * A Lexical node that represents a generic HTML element. Use {@link $createGenericHTMLNode} to construct one.
 * The generic HTML node is used as a "fallback" for HTML elements that are not explicitly supported by the editor.
 * @group HTML
 */
export class EsmEditorNode extends DecoratorNode<JSX.Element> {
  /** @internal */
  __value: string;

  /** @internal */
  static getType(): string {
    return "esm-editor";
  }

  /** @internal */
  static clone(node: EsmEditorNode): EsmEditorNode {
    return new EsmEditorNode(node.__value, node.__key);
  }

  /**
   * Constructs a new {@link GenericHTMLNode} with the specified MDAST HTML node as the object to edit.
   */
  constructor(value: string, key?: NodeKey) {
    super(key);
    this.__value = value;
  }

  getValue(): string {
    return this.__value;
  }

  // View

  createDOM(): HTMLElement {
    const element = document.createElement("span");
    element.style.color = "blue";
    return element;
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    // TODO: take the implementation of convertHeadingElement from headingsPlugin
    return {};
  }

  static importJSON(serializedNode: SerializedEsmEditorNode): EsmEditorNode {
    return $createEsmEditorNode(serializedNode.value);
  }

  exportJSON(): SerializedEsmEditorNode {
    return {
      ...super.exportJSON(),
      value: this.getValue(),
      type: "esm-editor",
      version: 1,
    };
  }

  extractWithChild(): boolean {
    return true;
  }

  isInline(): boolean {
    return false;
  }

  decorate(editor: LexicalEditor) {
    return (
      <span>
        <input
          style={{ width: "100%", color: "blue", fontFamily: "monospace" }}
          size={10}
          onKeyDown={(e) => {
            const value = (e.target as HTMLInputElement).value;
            if ((value === "" && e.key === "Backspace") || e.key === "Delete") {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              e.preventDefault();
              editor.update(() => {
                this.selectPrevious();
                this.remove();
              });
            }
          }}
          onChange={(e) => {
            e.target.parentElement!.dataset.value = e.target.value;
            editor.update(() => {
              this.getWritable().__value = e.target.value;
            });
          }}
          type="text"
          value={this.getValue()}
        />
      </span>
    );
  }
}

export function $createEsmEditorNode(value: string): EsmEditorNode {
  return $applyNodeReplacement(new EsmEditorNode(value));
}

export function $isEsmEditorNode(
  node: LexicalNode | null | undefined
): node is EsmEditorNode {
  return node instanceof EsmEditorNode;
}
