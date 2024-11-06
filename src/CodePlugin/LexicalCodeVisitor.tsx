import * as Mdast from "mdast";
import { $isCodeNode, CodeNode } from "@lexical/code";
import { LexicalExportVisitor } from "@mdxeditor/editor";

export const CodeVisitor: LexicalExportVisitor<CodeNode, Mdast.Code> = {
  testLexicalNode: $isCodeNode,
  visitLexicalNode: ({ lexicalNode, actions }) => {
    const codeValue = lexicalNode
      .getChildren()
      .map((child) => child.getTextContent())
      .join("");
    actions.addAndStepInto("code", {
      lang: lexicalNode.getLanguage(),
      value: codeValue,
    });
  },
};
