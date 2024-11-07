import {
  $createFrontmatterNode,
  $isFrontmatterNode,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  frontmatterPlugin,
  headingsPlugin,
  imagePlugin,
  imagePreviewHandler$,
  jsxPlugin,
  MDXEditor,
  realmPlugin,
  rootEditor$,
  toolbarPlugin,
  UndoRedo,
  useCellValue,
  useMdastNodeUpdater,
  viewMode$,
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";
import "./my-editor.css";
import "./lexical-playground-theme.css";
import { basicDark } from "cm6-theme-basic-dark";
import { basicLight } from "cm6-theme-basic-light";
import { useEffect, useRef, useState } from "react";
import { htmlElementsPlugin } from "./htmlElementsPlugin";
import { Compartment } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { HTMLToolbarComponent } from "./HTMLToolbarComponent";
import { $getRoot } from "lexical";
import { codeBlockPlugin } from "./CodePlugin/codeBlockPlugin";
import { customLexicalTheme } from "./LexicalTheme";
import { markdownShortcutPlugin } from "./ShortcutsPlugin/shortcutsPlugin";

const markdown = `
  # Hello world

  <div class="blue">HTML element</div>

  A paragraph
  <UnknownElement foo="bar" />

  ![Image](https://example.com/image.png)

  <CustomImage />

\`\`\`js
console.log("Hello world");
\`\`\`
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
  const [frontMatterController] = useState(() => {
    let subscription: (frontMatter: string) => void = () => {};
    return {
      subscribe: (fn: (frontMatter: string) => void) => {
        subscription = fn;
      },
      setFrontMatter: (frontMatter: string) => {
        subscription(frontMatter);
      },
    };
  });

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
                inDarkModeRef.current ? basicDark : basicLight
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
      <hr />
      <label>External Frontmatter:</label>
      <br />
      <button
        onClick={() => frontMatterController.setFrontMatter('"key": "value"')}
      >
        Set frontmatter
      </button>
      <button onClick={() => frontMatterController.setFrontMatter("")}>
        Clear frontmatter
      </button>

      <MDXEditor
        contentEditableClassName="my-editor"
        lexicalTheme={customLexicalTheme}
        markdown={markdown}
        plugins={[
          headingsPlugin(),
          htmlElementsPlugin(),
          frontmatterPlugin(),

          // this enables dark mode when switching to source mode
          realmPlugin({
            init: (r) => {
              r.sub(viewMode$, (mode) => {
                if (mode === "source") {
                  // delay so that the ref is present.
                  setTimeout(() => {
                    codeMirrorViewRef.current?.dispatch({
                      effects: editorTheme.reconfigure(
                        inDarkModeRef.current ? basicDark : basicLight
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

          jsxPlugin({
            jsxComponentDescriptors: [
              {
                name: "CustomImage",
                kind: "flow",
                hasChildren: false,
                props: [],
                Editor: () => {
                  // this is how you get the value of the image preview handler
                  const imagePreviewHandler =
                    useCellValue(imagePreviewHandler$)!;

                  const [imageSource, setImageSource] =
                    useState<string>("unknown");

                  useEffect(() => {
                    if (imagePreviewHandler) {
                      const callPreviewHandler = async () => {
                        setImageSource(await imagePreviewHandler("something"));
                      };
                      callPreviewHandler().catch((e: unknown) => {
                        console.error(e);
                      });
                    } else {
                      setImageSource("unknown");
                    }
                  }, [imagePreviewHandler]);

                  return <img src={imageSource} alt="Custom image" />;
                },
              },
              {
                name: "*",
                kind: "flow",
                hasChildren: false,
                props: [],
                Editor: ({ mdastNode }) => {
                  // you can read the attributes of the JSX node here.
                  // A more convoluted example is present here: https://github.com/mdx-editor/editor/blob/c6d1067dbe4faeb18246a27988d9b4c334565551/src/jsx-editors/GenericJsxEditor.tsx?plain=1#L40
                  void mdastNode;
                  const updateMdastNode = useMdastNodeUpdater();
                  // here, you can render a custom component for the JSX node.
                  return (
                    <div>
                      Unknown element
                      <button
                        onClick={() => {
                          updateMdastNode({
                            attributes: [
                              {
                                type: "mdxJsxAttribute",
                                name: "foo",
                                value: "moo",
                              },
                            ],
                          });
                        }}
                      >
                        Change the foo attribute to "moo"
                      </button>
                    </div>
                  );
                },
              },
            ],
          }),

          // frontmatter sync
          realmPlugin({
            init: (r) => {
              frontMatterController.subscribe((content) => {
                const editor = r.getValue(rootEditor$);

                editor?.update(() => {
                  const firstItem = $getRoot().getFirstChild();
                  if (content !== "") {
                    if (!$isFrontmatterNode(firstItem)) {
                      const fmNode = $createFrontmatterNode(content);
                      if (firstItem) {
                        firstItem.insertBefore(fmNode);
                      } else {
                        $getRoot().append(fmNode);
                      }
                    } else {
                      firstItem.setYaml(content);
                    }
                  } else {
                    if ($isFrontmatterNode(firstItem)) {
                      firstItem.remove();
                    }
                  }
                });
              });
            },
          })(),

          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <HTMLToolbarComponent />
                <UndoRedo />
              </DiffSourceToggleWrapper>
            ),
          }),

          imagePlugin({
            imagePreviewHandler: async (src) => {
              console.log("Image preview handler", src);
              return Promise.resolve("https://picsum.photos/200/300");
            },
          }),

          codeBlockPlugin(),
          markdownShortcutPlugin(),
        ]}
      />
    </div>
  );
}

export default App;
