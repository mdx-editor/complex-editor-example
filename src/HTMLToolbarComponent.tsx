import { $getNearestNodeOfType } from "@lexical/utils";
import {
  activeEditor$,
  currentSelection$,
  useCellValues,
} from "@mdxeditor/editor";
import { MdxJsxAttribute } from "mdast-util-mdx";
import { useMemo } from "react";
import { CustomHTMLNode } from "./CustomHTMLNode";

export const HTMLToolbarComponent = () => {
  const [currentSelection, activeEditor] = useCellValues(
    currentSelection$,
    activeEditor$,
  );

  const currentHTMLNode = useMemo(() => {
    return (
      activeEditor?.getEditorState().read(() => {
        const selectedNodes = currentSelection?.getNodes() || [];
        if (selectedNodes.length === 1) {
          return $getNearestNodeOfType(selectedNodes[0], CustomHTMLNode);
        } else {
          return null;
        }
      }) || null
    );
  }, [currentSelection, activeEditor]);

  return (
    <>
      <input
        disabled={currentHTMLNode === null}
        value={getCssClass(currentHTMLNode)}
        onChange={(e) => {
          activeEditor?.update(
            () => {
              const attributesWithoutClass =
                currentHTMLNode
                  ?.getAttributes()
                  .filter((attr) => attr.name !== "class") || [];
              const newClassAttr: MdxJsxAttribute = {
                type: "mdxJsxAttribute",
                name: "class",
                value: e.target.value,
              };
              currentHTMLNode?.updateAttributes([
                ...attributesWithoutClass,
                newClassAttr,
              ]);
            },
            { discrete: true },
          );
          e.target.focus();
        }}
      />
    </>
  );
};

function getCssClass(node: CustomHTMLNode | null) {
  return (
    (node?.getAttributes().find((attr) => attr.name === "class")
      ?.value as string) ?? ""
  );
}
