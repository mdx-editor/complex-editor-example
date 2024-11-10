import { useState } from "react";
import { SourceEditor } from "./SourceEditor";

export function SourceEditorExample() {
  const [sourceEditorLanguage, setSourceEditorLanguage] = useState("ts");
  const [sourceEditorValue, setSourceEditorValue] = useState("console.log(1)");

  return (
    <>
      <h1>Source Editor</h1>

      <select
        onChange={(e) => {
          if (e.target.value === "ts") {
            setSourceEditorLanguage("ts");
            setSourceEditorValue("console.log('hello world')");
          } else {
            setSourceEditorLanguage("css");
            setSourceEditorValue("body { color: red; }");
          }
        }}
      >
        <option value="ts">TypeScript</option>
        <option value="css">CSS</option>
      </select>
      <SourceEditor
        language={sourceEditorLanguage as "ts" | "css"}
        value={sourceEditorValue}
      />
    </>
  );
}
