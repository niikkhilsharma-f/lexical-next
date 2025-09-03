// Plugins/OnChangePlugin.js
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $isPDFBorderNode } from "../nodes/PDFBorderNode/PDFBorderNode";

export default function OnChangePlugin({ onChange }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        // Get the root node
        const root = editorState._nodeMap.get("root");
        if (root) {
          // Process all nodes including PDF border nodes
          const processNode = (node) => {
            if ($isPDFBorderNode(node)) {
              // This ensures PDF border content is included
              return {
                type: "pdf-border",
                content: node.getContent(),
                nodeKey: node.__key,
              };
            }
            return node;
          };

          // Process all children
          const children = root.getChildren();
          const processedContent = children.map(processNode);

          // Create enhanced editor state data
          const enhancedEditorState = {
            ...editorState,
            _nodeMap: editorState._nodeMap,
            processedContent: processedContent,
          };

          onChange(enhancedEditorState);
        } else {
          onChange(editorState);
        }
      });
    });
  }, [editor, onChange]);

  return null;
}
