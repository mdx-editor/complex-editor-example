import {
  MdastImportVisitor,
  realmPlugin,
  addImportVisitor$,
  addLexicalNode$,
  LexicalExportVisitor,
  addExportVisitor$,
} from "@mdxeditor/editor";
import { MdxjsEsm } from "mdast-util-mdx";
import {
  $createEsmEditorNode,
  $isEsmEditorNode,
  EsmEditorNode,
} from "./EsmEditorNode";
import { ElementNode } from "lexical";

const MdastMdxJsEsmVisitor: MdastImportVisitor<MdxjsEsm> = {
  testNode: (node) => {
    return node.type === "mdxjsEsm" && node.value.startsWith("export ");
  },
  visitNode({ mdastNode, lexicalParent }) {
    (lexicalParent as ElementNode).append(
      $createEsmEditorNode(mdastNode.value)
    );
    void 0;
  },
  priority: 100,
};

const LexicalEsmEditorVisitor: LexicalExportVisitor<EsmEditorNode, MdxjsEsm> = {
  testLexicalNode: $isEsmEditorNode,
  visitLexicalNode({ actions, mdastParent, lexicalNode }) {
    const mdastNode = {
      type: "mdxjsEsm",
      value: lexicalNode.getValue(),
    } as const satisfies MdxjsEsm;

    actions.appendToParent(mdastParent, mdastNode);
  },
};

export const esmEditorPlugin = realmPlugin({
  init: (r) => {
    r.pubIn({
      [addImportVisitor$]: [MdastMdxJsEsmVisitor],
      [addExportVisitor$]: [LexicalEsmEditorVisitor],
      [addLexicalNode$]: [EsmEditorNode],
    });
  },
});
