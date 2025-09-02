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
import { ListItemNode, ListNode } from "@lexical/list";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { css } from "@emotion/css";
// Import your custom plugins
import ToolbarPlugin from "./Plugins/ToolbarPlugin";
import OnChangePlugin from "./Plugins/OnChangePlugin";
import { TableContext } from "./Plugins/TablePlugin"; // Import the context
import ClearEditorPlugin from "./Plugins/ClearEditorPlugin";
import Form from "../Form";
import TableCellResizerPlugin from "./Plugins/TableCellResizer";
import TableHoverActionsPlugin from "./Plugins/TableHoverActionsPlugin";
import { useState } from "react";
import PageBreakPlugin from "./Plugins/PageBreakPlugin";
import { PageBreakNode } from "./nodes/PageBreakNode";
import { TextNode } from "lexical";
import { ExtendedTextNode } from "./nodes/ExtendedTextNode";
// import TableActionMenuPlugin from "./Plugins/TableActionMenuPlugin";

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
    table: "PlaygroundEditorTheme__table",
    tableAddColumns: "PlaygroundEditorTheme__tableAddColumns",
    tableAddRows: "PlaygroundEditorTheme__tableAddRows",
    tableAlignment: {
      center: "PlaygroundEditorTheme__tableAlignmentCenter",
      right: "PlaygroundEditorTheme__tableAlignmentRight",
    },
    tableCell: "PlaygroundEditorTheme__tableCell",
    tableCellActionButton: "PlaygroundEditorTheme__tableCellActionButton",
    tableCellActionButtonContainer:
      "PlaygroundEditorTheme__tableCellActionButtonContainer",
    tableCellHeader: "PlaygroundEditorTheme__tableCellHeader",
    tableCellResizer: "PlaygroundEditorTheme__tableCellResizer",
    tableCellSelected: "PlaygroundEditorTheme__tableCellSelected",
    tableFrozenColumn: "PlaygroundEditorTheme__tableFrozenColumn",
    tableFrozenRow: "PlaygroundEditorTheme__tableFrozenRow",
    tableRowStriping: "PlaygroundEditorTheme__tableRowStriping",
    tableScrollableWrapper: "PlaygroundEditorTheme__tableScrollableWrapper",
    tableSelected: "PlaygroundEditorTheme__tableSelected",
    tableSelection: "PlaygroundEditorTheme__tableSelection",
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
    HeadingNode,
    ListNode,
    ListItemNode,
    CodeHighlightNode,
    CodeNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    PageBreakNode,
  ],
};

export default function LexicalTextEditor() {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState(null);

  const onRef = (_floatingAnchorElem) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div className="px-0.5 py-2 flex gap-2 h-screen">
      <LexicalComposer initialConfig={initialConfig}>
        <TableContext>
          {" "}
          {/* Wrap with TableContext */}
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
          <TableCellResizerPlugin />
          <TableHoverActionsPlugin />
          {/* {floatingAnchorElem && (
            <>
              <TableActionMenuPlugin
                anchorElem={floatingAnchorElem}
                cellMerge={true}
              />
            </>
          )} */}
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
