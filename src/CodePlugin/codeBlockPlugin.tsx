import {
  addComposerChild$,
  addExportVisitor$,
  addImportVisitor$,
  addLexicalNode$,
  createRootEditorSubscription$,
  realmPlugin,
} from "@mdxeditor/editor";
import { MdastCodeVisitor } from "./MdastCodeVisitor";
import {
  CodeHighlightNode,
  CodeNode,
  registerCodeHighlighting,
} from "@lexical/code";
import { CodeVisitor } from "./LexicalCodeVisitor";
import CodeActionMenuPlugin from "../CodeActionMenuPlugin";

/**
 * A plugin that adds support for code blocks and custom code block editors.
 * @group Code Block
 */
export const codeBlockPlugin = realmPlugin({
  init(realm) {
    realm.pubIn({
      [addImportVisitor$]: MdastCodeVisitor,
      [addLexicalNode$]: [CodeNode, CodeHighlightNode],
      [addExportVisitor$]: CodeVisitor,
      [addComposerChild$]: CodeActionMenuPlugin,
    });

    realm.pub(createRootEditorSubscription$, (theEditor) => {
      return registerCodeHighlighting(theEditor);
    });
  },
});
