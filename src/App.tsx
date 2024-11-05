import {
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  headingsPlugin,
  MDXEditor,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";
import "./my-editor.css";
import { basicDark } from "cm6-theme-basic-dark";
import { basicLight } from "cm6-theme-basic-light";
import { useRef, useState } from "react";
import { htmlElementsPlugin } from "./htmlElementsPlugin";
import { Compartment } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { HTMLToolbarComponent } from "./HTMLToolbarComponent";

const markdown = `
  # Hello world

  <div class="blue">HTML element</div>

  A paragraph
`;

function App() {
  const codeMirrorViewRef = useRef<EditorView | null>(null);

  const [editorTheme] = useState(() => {
    return new Compartment();
  });

  return (
    <div>
      <label>
        <input
          type="checkbox"
          onChange={(e) =>
            codeMirrorViewRef.current?.dispatch({
              effects: editorTheme.reconfigure(
                e.target.checked ? basicDark : basicLight,
              ),
            })
          }
        />{" "}
        Dark mode for source view.
      </label>
      <MDXEditor
        contentEditableClassName="my-editor"
        markdown={markdown}
        plugins={[
          headingsPlugin(),
          htmlElementsPlugin(),
          diffSourcePlugin({
            codeMirrorExtensions: [
              // this will work for code blocks in the rich mode, too
              editorTheme.of(basicLight),
              EditorView.updateListener.of((update) => {
                codeMirrorViewRef.current = update.view;
              }),
            ],
          }),
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <HTMLToolbarComponent />
                <UndoRedo />
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
      />
    </div>
  );
}

export default App;
