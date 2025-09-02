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
import { TablePlugin } from "@lexical/react/LexicalTablePlugin"; // Add this import
// import { TableSelectionPlugin } from "@lexical/react/LexicalTableSelectionPlugin";
import { ListItemNode, ListNode } from "@lexical/list";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { css } from "@emotion/css";
import { useState } from "react";

// Import your custom plugins
import ToolbarPlugin from "./Plugins/ToolbarPlugin";
import OnChangePlugin from "./Plugins/OnChangePlugin";
import { TableContext } from "./Plugins/TablePlugin"; // Import the context
import ClearEditorPlugin from "./Plugins/ClearEditorPlugin";
import Form from "../Form";

const initialConfig = {
  nameSpace: "Rich Text Editor",
  theme: {
    heading: {
      h1: "text-4xl font-extrabold tracking-tight text-balance",
      h2: "text-3xl font-semibold tracking-tight",
      h3: "text-2xl font-semibold tracking-tight",
      h4: "text-xl font-semibold tracking-tight",
      h5: "text-lg font-semibold tracking-tight",
      h6: "text-base font-semibold tracking-tight",
    },
    list: {
      ul: "my-6 ml-6 list-disc [&>li]:mt-2",
      ol: "my-6 ml-6 list-decimal [&>li]:mt-2",
    },
    text: {
      bold: css({ fontWeight: "bold" }),
      underline: css({ textDecoration: "underline" }),
      strikethrough: css({ textDecoration: "line-through" }),
      underlineStrikethrough: css({ textDecoration: "underline line-through" }),
      italic: css({ fontStyle: "italic" }),
      code: "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
    },
    // Add table theme with better styling
    // table: "border-collapse border-2 border-gray-300 w-full",
    // tableCell: "border border-gray-300 p-3 min-w-20 relative",
    // tableCellHeader:
    //   "border border-gray-300 p-3 min-w-20 bg-gray-50 font-semibold text-center",
    // tableRow: "border-b border-gray-300",
    // tableSelection: "bg-blue-100",
  },
  onError: (error) => {
    console.error("Lexical Error:", error);
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    CodeHighlightNode,
    CodeNode,
    TableNode,
    TableCellNode,
    TableRowNode,
  ],
};

export default function LexicalTextEditor() {
  return (
    <div className="px-0.5 py-2 flex gap-2 h-screen">
      <LexicalComposer initialConfig={initialConfig}>
        <TableContext>
          {" "}
          {/* Wrap with TableContext */}
          <div className="flex flex-col w-1/4 border rounded-md">
            <ToolbarPlugin />
            <div className="flex flex-1 items-end m-2">
              <Form />
            </div>
          </div>
          <div className="border p-2 rounded-md border-black relative w-3/4">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="h-full focus-within:outline-none"
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
          <TablePlugin /> {/* Add the Lexical TablePlugin */}
          {/* <TableSelectionPlugin /> Add table selection support */}
          <ClearEditorPlugin />
          <OnChangePlugin
            onChange={(editorState) => {
              console.log(editorState, "from the editor");
            }}
          />
        </TableContext>
      </LexicalComposer>
    </div>
  );
}
