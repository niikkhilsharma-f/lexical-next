"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HeadingNode } from "@lexical/rich-text";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { ListItemNode, ListNode } from "@lexical/list";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { css } from "@emotion/css";
import { useState, useEffect } from "react"; // Add useEffect
import { RootNode, TextNode, $createParagraphNode } from "lexical"; // Add missing imports
import { $createPageBreakNode } from "./nodes/PageBreakNode"; // Add this import

// Your existing imports...
import ToolbarPlugin from "./Plugins/ToolbarPlugin";
import OnChangePlugin from "./Plugins/OnChangePlugin";
import { TableContext } from "./Plugins/TablePlugin";
import ClearEditorPlugin from "./Plugins/ClearEditorPlugin";
import Form from "../Form";
import TableCellResizerPlugin from "./Plugins/TableCellResizer";
import TableHoverActionsPlugin from "./Plugins/TableHoverActionsPlugin";
import PageBreakPlugin from "./Plugins/PageBreakPlugin";
import { PageBreakNode } from "./nodes/PageBreakNode";
import { ExtendedTextNode } from "./nodes/ExtendedTextNode";
import { PDFBorderNode } from "./nodes/PDFBorderNode/PDFBorderNode";
import PDFBorderPlugin from "./Plugins/PDFBorderPlugin/PDFBorderPlugin";
import { CustomParagraphNode } from "./nodes/CustomParagraphNode/CustomParagraphNode";

export const initialConfig = {
  namespace: "Rich Text Editor", // Fixed typo: nameSpace -> namespace
  theme: {
    // Your existing theme...
  },
  onError: (error) => {
    console.error("Lexical Error:", error);
  },
  nodes: [
    ExtendedTextNode,
    {
      replace: TextNode,
      with: (node) => new ExtendedTextNode(node.__text),
      withKlass: ExtendedTextNode,
    },
    PageBreakNode, // Remove duplicate - only keep this one
    HeadingNode,
    ListNode,
    ListItemNode,
    CodeHighlightNode,
    CodeNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    PDFBorderNode,
    CustomParagraphNode,
  ],
};

// Move this outside the component
function calculateNodeHeight(node) {
  // Simple height calculation - you may need to adjust this based on your styling
  const nodeType = node.getType();
  switch (nodeType) {
    case "heading":
      return 40;
    case "paragraph":
      return 20;
    case "list":
      return 25;
    case "table":
      return 100; // Approximate table height
    default:
      return 20;
  }
}

// Hook should be outside component
function usePaginationTransform(editor) {
  useEffect(() => {
    return editor.registerNodeTransform(RootNode, (rootNode) => {
      const PAGE_HEIGHT = 800; // pixels
      let currentHeight = 0;

      const children = rootNode.getChildren();

      children.forEach((child) => {
        const childHeight = calculateNodeHeight(child);

        if (currentHeight + childHeight > PAGE_HEIGHT) {
          // Insert page break before this node
          const pageBreak = $createPageBreakNode();
          child.insertBefore(pageBreak);
          currentHeight = childHeight;
        } else {
          currentHeight += childHeight;
        }
      });
    });
  }, [editor]);
}

export default function LexicalTextEditor() {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState(null);

  const onRef = (_floatingAnchorElem) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div className="px-0.5 py-2 flex gap-2 h-screen">
      <div className="document">
        <div className="page">
          {" "}
          {/* Single page container */}
          <LexicalComposer initialConfig={initialConfig}>
            <TableContext>
              <div className="flex flex-col w-1/5 border rounded-md">
                <ToolbarPlugin />
                <div className="flex flex-1 items-end m-2">
                  <Form />
                </div>
              </div>
              <div className="border p-2 rounded-md border-black relative w-4/5 overflow-hidden">
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable
                      ref={onRef}
                      className="focus-within:outline-none h-full overflow-scroll border border-black border-dotted"
                      aria-placeholder={"Enter some text..."}
                      placeholder={
                        <div className="absolute left-2 top-2">
                          Enter some text...
                        </div>
                      }
                    />
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
              </div>
              <AutoFocusPlugin />
              <HistoryPlugin />
              <ListPlugin />
              <TablePlugin />
              <ClearEditorPlugin />
              <PageBreakPlugin />
              <PDFBorderPlugin />
              <TableCellResizerPlugin />
              <TableHoverActionsPlugin />
              <OnChangePlugin
                onChange={(editorState) => {
                  console.log(editorState, "from the editor");
                }}
              />
            </TableContext>
          </LexicalComposer>
        </div>
      </div>
    </div>
  );
}
