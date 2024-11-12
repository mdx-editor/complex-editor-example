import {
  createActiveEditorSubscription$,
  realmPlugin,
} from "@mdxeditor/editor";
import { KEY_DOWN_COMMAND } from "lexical";

export const userInteractionPlugin = realmPlugin<{
  onUserInteraction: () => void;
}>({
  init: (realm, params) => {
    realm.pub(createActiveEditorSubscription$, (editor) => {
      // you can probably hook up to PASTE_COMMAND, too
      return editor.registerCommand(
        KEY_DOWN_COMMAND,
        () => {
          params?.onUserInteraction();
          // don't cancel the event
          return false;
        },
        1
      );
    });
  },
});
