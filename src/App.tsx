import {
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  headingsPlugin,
  MDXEditor,
  realmPlugin,
  toolbarPlugin,
  UndoRedo,
  viewMode$,
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

const externalViewModePlugin = realmPlugin<{ sourceMode: boolean }>({
  init(realm, params) {
    realm.pub(viewMode$, params?.sourceMode ? "source" : "rich-text");
  },
  update(realm, params) {
    realm.pub(viewMode$, params?.sourceMode ? "source" : "rich-text");
  },
});

function App() {
  const [sourceMode, setSourceMode] = useState(false);
  const inDarkModeRef = useRef(false);
  const codeMirrorViewRef = useRef<EditorView | null>(null);

  const [editorTheme] = useState(() => {
    return new Compartment();
  });

  return (
    <div>
      <label>
        <input
          type="checkbox"
          onChange={(e) => {
            inDarkModeRef.current = e.target.checked;
            codeMirrorViewRef.current?.dispatch({
              effects: editorTheme.reconfigure(
                inDarkModeRef.current ? basicDark : basicLight,
              ),
            });
          }}
        />{" "}
        Dark mode for source view.
      </label>

      <label>
        <input
          type="checkbox"
          checked={sourceMode}
          onChange={() => setSourceMode((prev) => !prev)}
        />{" "}
        Source mode
      </label>

      <MDXEditor
        contentEditableClassName="my-editor"
        markdown={markdown}
        plugins={[
          headingsPlugin(),
          htmlElementsPlugin(),

          // this enables dark mode when switching to source mode
          realmPlugin({
            init: (r) => {
              r.sub(viewMode$, (mode) => {
                if (mode === "source") {
                  // delay so that the ref is present.
                  setTimeout(() => {
                    codeMirrorViewRef.current?.dispatch({
                      effects: editorTheme.reconfigure(
                        inDarkModeRef.current ? basicDark : basicLight,
                      ),
                    });
                  });
                }
              });
            },
          })(),

          diffSourcePlugin({
            codeMirrorExtensions: [
              editorTheme.of(basicLight),
              EditorView.updateListener.of((update) => {
                codeMirrorViewRef.current = update.view;
              }),
            ],
          }),

          externalViewModePlugin({ sourceMode }),

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
