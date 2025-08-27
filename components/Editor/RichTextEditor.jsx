"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HeadingNode } from "@lexical/rich-text";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import ToolbarPlugin from "./Plugins/ToolbarPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { css } from "@emotion/css";

const initialConfig = {
  nameSpace: "Rich Text Editor",
  theme: {
    text: {
      bold: css({ fontWeight: "bold" }),
      underline: css({ textDecoration: "underline" }),
      strikethrough: css({ textDecoration: "line-through" }),
      underlineStrikethrough: css({ textDecoration: "underline line-through" }),
      italic: css({ fontStyle: "italic" }),
      code: css({
        color: "black",
        padding: 2,
        background: "#eee",
        border: "1px solid #ccc",
      }),
    },
  },
  onError: () => {},
  nodes: [HeadingNode, CodeHighlightNode, CodeNode],
};

export default function LexicalTextEditor() {
  return (
    <div className="px-0.5! py-2! flex gap-2 h-screen">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="w-1/4 border rounded-md">
          <ToolbarPlugin />
        </div>
        <div className="border p-2! rounded-md border-black relative w-3/4">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="h-full"
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
      </LexicalComposer>
    </div>
  );
}
