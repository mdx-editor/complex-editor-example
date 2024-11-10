import { Compartment, EditorState, Extension } from "@codemirror/state";
import { EditorView, lineNumbers } from "@codemirror/view";
import { basicLight } from "cm6-theme-basic-light";
import { basicSetup } from "codemirror";
import React, { FC, useEffect } from "react";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";

export const COMMON_STATE_CONFIG_EXTENSIONS: Extension[] = [
  basicSetup,
  basicLight,
  lineNumbers(),
  EditorView.lineWrapping,
];

interface SourceEditorProps {
  value: string;
  language: "ts" | "js" | "css";
  readOnly?: boolean;
}

export const SourceEditor: FC<SourceEditorProps> = ({
  readOnly,
  value,
  language,
}) => {
  const editorViewRef = React.useRef<EditorView | null>(null);
  const [languageCompartment] = React.useState(() => new Compartment());

  useEffect(() => {
    editorViewRef.current?.dispatch({
      effects: languageCompartment.reconfigure(
        language === "ts" ? javascript({ typescript: true }) : css()
      ),
    });
  }, [language, languageCompartment]);

  const ref = React.useCallback(
    (el: HTMLDivElement | null) => {
      if (el !== null) {
        const extensions = [
          ...COMMON_STATE_CONFIG_EXTENSIONS,
          EditorView.updateListener.of(({ state }) => {
            console.log("change", state.doc.toString());
          }),

          EditorView.focusChangeEffect.of((_, focused) => {
            if (!focused) {
              console.log("blur");
            }
            return null;
          }),
          languageCompartment.of(javascript({ typescript: true })),
        ];
        if (readOnly) {
          extensions.push(EditorState.readOnly.of(true));
        }
        el.innerHTML = "";
        editorViewRef.current = new EditorView({
          parent: el,
          state: EditorState.create({ doc: value, extensions }),
        });
      } else {
        editorViewRef.current?.destroy();
        editorViewRef.current = null;
      }
    },
    [languageCompartment, readOnly, value]
  );

  return <div ref={ref} className="cm-sourceView mdxeditor-source-editor" />;
};
