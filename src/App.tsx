import { MDXEditor } from "@mdxeditor/editor";
import { headingsPlugin } from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";
import { htmlElementsPlugin } from "./htmlElementsPlugin";

const markdown = `
  # Hello world

  <div>HTML element</div>

  A paragraph
`;
function App() {
  return (
    <MDXEditor
      markdown={markdown}
      plugins={[headingsPlugin(), htmlElementsPlugin()]}
    />
  );
}

export default App;
