/* eslint-disable react-refresh/only-export-components */
import {
  addImportVisitor$,
  addLexicalNode$,
  isMdastHTMLNode,
  MdastHTMLNode,
  MdastImportVisitor,
  realmPlugin,
  LexicalExportVisitor,
  addExportVisitor$,
} from "@mdxeditor/editor";
import { MdxJsxAttribute } from "mdast-util-mdx";
import { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";

// this is exported from MDXEditor too, but for customization purposes, we will inline it.
import {
  $createCustomHTMLNode,
  CustomHTMLNode,
  $isCustomHTMLNode,
} from "./CustomHTMLNode";

const MdastHTMLVisitor: MdastImportVisitor<MdastHTMLNode> = {
  // this test will capture all HTML nodes, you can use something more specific
  // https://github.com/mdx-editor/editor/blob/7c5372e5c8da73fa5c07c9074ff26a6ecf5cb0dd/src/plugins/core/MdastHTMLNode.ts?plain=1#L44
  testNode: isMdastHTMLNode,
  visitNode: function ({ mdastNode, actions }): void {
    actions.addAndStepInto(
      $createCustomHTMLNode(
        mdastNode.name,
        mdastNode.type,
        mdastNode.attributes as MdxJsxAttribute[],
      ),
    );
  },
  // setting this priority to a higher number overrrides the built-in visitor.
  // the default one has -100.
  priority: 0,
};

export const LexicalCustomHTMLVisitor: LexicalExportVisitor<
  CustomHTMLNode,
  MdxJsxFlowElement | MdxJsxTextElement
> = {
  testLexicalNode: $isCustomHTMLNode,
  visitLexicalNode({ actions, lexicalNode }) {
    actions.addAndStepInto("mdxJsxTextElement", {
      name: lexicalNode.getTag(),
      type: lexicalNode.getNodeType(),
      attributes: lexicalNode.getAttributes(),
    });
  },
  priority: 0,
};

export const htmlElementsPlugin = realmPlugin({
  init(r) {
    r.pubIn({
      [addLexicalNode$]: [CustomHTMLNode],
      [addImportVisitor$]: MdastHTMLVisitor,
      [addExportVisitor$]: LexicalCustomHTMLVisitor,
    });
  },
});
