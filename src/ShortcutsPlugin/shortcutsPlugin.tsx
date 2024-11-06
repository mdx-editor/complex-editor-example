import {
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  CODE,
  INLINE_CODE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
} from "@lexical/markdown";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin.js";
import {
  addComposerChild$,
  addNestedEditorChild$,
  realmPlugin,
} from "@mdxeditor/editor";

export const markdownShortcutPlugin = realmPlugin({
  init(realm) {
    const transformers = [
      BOLD_ITALIC_STAR,
      BOLD_ITALIC_UNDERSCORE,
      BOLD_STAR,
      BOLD_UNDERSCORE,
      INLINE_CODE,
      ITALIC_STAR,
      ITALIC_UNDERSCORE,
      CODE,
    ];
    realm.pubIn({
      [addComposerChild$]: () => (
        <MarkdownShortcutPlugin transformers={transformers} />
      ),
      [addNestedEditorChild$]: () => (
        <MarkdownShortcutPlugin transformers={transformers} />
      ),
    });
  },
});
