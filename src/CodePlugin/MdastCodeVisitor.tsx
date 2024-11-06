import * as Mdast from "mdast";
import { $createCodeNode } from "@lexical/code";
import { MdastImportVisitor } from "@mdxeditor/editor";
import { $createTextNode } from "lexical";

export const MdastCodeVisitor: MdastImportVisitor<Mdast.Code> = {
  testNode: (node) => {
    return node.type === "code";
  },
  visitNode({ mdastNode, actions }) {
    const codeNode = $createCodeNode(mdastNode.lang);
    codeNode.append($createTextNode(mdastNode.value));
    console.log("mdastNode", mdastNode);
    actions.addAndStepInto(codeNode);
  },
};
