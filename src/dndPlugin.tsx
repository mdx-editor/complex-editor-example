import { mergeRegister } from "@lexical/utils";
import {
  createActiveEditorSubscription$,
  realmPlugin,
} from "@mdxeditor/editor";
import {
  COMMAND_PRIORITY_CRITICAL,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
} from "lexical";

// check how the image plugin implemented the drag and drop. Careful not to clash there, you can change the priority of the command handlers and return false if you don't want to handle it.
// https://github.com/mdx-editor/editor/blob/483b19648dd709cca8cb7832de7db4b087ac85de/src/plugins/image/index.ts?plain=1#L1

export const dndPlugin = realmPlugin({
  init: (realm) => {
    realm.pub(createActiveEditorSubscription$, (editor) => {
      return mergeRegister(
        editor.registerCommand<DragEvent>(
          DRAGSTART_COMMAND,
          (event) => {
            console.log("dragstart", event);
            // The user has started dragging an object.
            return true;
          },
          COMMAND_PRIORITY_CRITICAL
        ),
        editor.registerCommand<DragEvent>(
          DRAGOVER_COMMAND,
          (event) => {
            console.log("dragover", event);
            return true;
            // return onDragover(event, !!theUploadHandler)
          },
          COMMAND_PRIORITY_CRITICAL
        ),

        editor.registerCommand<DragEvent>(
          DROP_COMMAND,
          (event) => {
            console.log("drop", event);
            return true;
          },
          COMMAND_PRIORITY_CRITICAL
        )
      );
    });
  },
});
