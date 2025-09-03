// nodes/PDFBorderNode.js
import { useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { DecoratorNode } from "lexical";
import { initialConfig } from "../../RichTextEditor";

export class PDFBorderNode extends DecoratorNode {
  __content;

  static getType() {
    return "pdf-border";
  }

  static clone(node) {
    // Fixed: Pass the key correctly to maintain node identity
    return new PDFBorderNode(node.__content, node.__key);
  }

  constructor(content = "", key) {
    super(key);
    this.__content = content;
  }

  createDOM() {
    const div = document.createElement("div");
    div.className = "pdf-border-container";
    return div;
  }

  updateDOM() {
    return false;
  }

  static importJSON(serializedNode) {
    const { content } = serializedNode;
    return new PDFBorderNode(content);
  }

  exportJSON() {
    return {
      type: "pdf-border",
      version: 1,
      content: this.__content,
    };
  }

  setContent(content) {
    // Fixed: Use getWritable() correctly
    const writableNode = this.getWritable();
    writableNode.__content = content;
  }

  getContent() {
    return this.getLatest().__content;
  }

  decorate() {
    return <PDFBorderComponent node={this} nodeKey={this.__key} />;
  }

  isInline() {
    return false;
  }

  isKeyboardSelectable() {
    return false;
  }

  exportDOM() {
    const element = document.createElement("div");
    element.className = "pdf-border-export";
    element.style.cssText = `
      width: 21cm;
      min-height: 29.7cm;
      margin: 10px auto;
      padding: 1cm 1cm;
      border: 2px solid #374151;
      background: white;
      box-sizing: border-box;
    `;
    element.innerHTML = this.__content || "";
    return { element };
  }
}

// Inner editor configuration
const borderEditorConfig = {
  namespace: "PDFBorderEditor",
  theme: {
    heading: {
      h1: "text-2xl font-bold text-center mb-4",
      h2: "text-xl font-semibold mb-3",
      h3: "text-lg font-semibold mb-2",
    },
    text: {
      bold: "font-bold",
      italic: "italic",
      underline: "underline",
      strikethrough: "line-through",
    },
    paragraph: "mb-2",
  },
  onError: (error) => {
    console.error("PDF Border Editor Error:", error);
  },
  nodes: [HeadingNode, ListNode, ListItemNode, CodeHighlightNode, CodeNode],
};

function PDFBorderComponent({ node, nodeKey }) {
  const [parentEditor] = useLexicalComposerContext();
  const contentEditableRef = useRef(null);

  // Handle content changes in the inner editor
  const handleContentChange = (editorState) => {
    // Convert editor state to HTML
    const htmlContent = editorState.read(() => {
      const root = editorState._nodeMap.get("root");
      if (!root) return "";

      const children = root.getChildren();
      return children
        .map((child) => {
          const textContent = child.getTextContent();
          if (child.getType() === "paragraph") {
            return textContent ? `<p>${textContent}</p>` : "";
          } else if (child.getType().startsWith("heading")) {
            const level = child.getTag();
            return textContent ? `<${level}>${textContent}</${level}>` : "";
          }
          return textContent ? `<p>${textContent}</p>` : "";
        })
        .filter(Boolean)
        .join("");
    });

    // Update the parent editor with the new content
    parentEditor.update(() => {
      const currentNode = parentEditor.getEditorState()._nodeMap.get(nodeKey);
      if (currentNode && currentNode instanceof PDFBorderNode) {
        currentNode.setContent(htmlContent);
      }
    });
  };

  const handleBorderClick = (e) => {
    if (e.target === e.currentTarget) {
      if (contentEditableRef.current) {
        contentEditableRef.current.focus();
      }
    }
  };

  return (
    <div
      className="pdf-border-wrapper"
      onClick={handleBorderClick}
      style={{
        width: "21cm",
        minHeight: "29.7cm",
        maxWidth: "100%",
        margin: "20px auto",
        border: "2px solid #374151",
        borderRadius: "4px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        background: "white",
        position: "relative",
        boxSizing: "border-box",
        cursor: "text",
        transition: "border-color 0.2s ease",
      }}
    >
      {/* PDF Border Indicators */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          left: "8px",
          width: "15px",
          height: "15px",
          border: "1px solid #9ca3af",
          borderRight: "none",
          borderBottom: "none",
          opacity: 0.7,
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          width: "15px",
          height: "15px",
          border: "1px solid #9ca3af",
          borderLeft: "none",
          borderBottom: "none",
          opacity: 0.7,
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          left: "8px",
          width: "15px",
          height: "15px",
          border: "1px solid #9ca3af",
          borderRight: "none",
          borderTop: "none",
          opacity: 0.7,
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          right: "8px",
          width: "15px",
          height: "15px",
          border: "1px solid #9ca3af",
          borderLeft: "none",
          borderTop: "none",
          opacity: 0.7,
          zIndex: 1,
        }}
      />

      {/* Editable Content Area */}
      <div
        style={{
          padding: "2.5cm 2cm",
          minHeight: "24.7cm",
          width: "100%",
          position: "relative",
        }}
      >
        <LexicalComposer initialConfig={initialConfig}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                ref={contentEditableRef}
                className="pdf-border-content-editable"
                style={{
                  minHeight: "100%",
                  outline: "none",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  color: "#374151",
                }}
                aria-placeholder="Start typing your document content here..."
                placeholder={
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "0",
                      color: "#9ca3af",
                      fontSize: "14px",
                      pointerEvents: "none",
                    }}
                  >
                    Start typing your document content here...
                  </div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={handleContentChange} />
          <HistoryPlugin />
        </LexicalComposer>
      </div>
    </div>
  );
}

export function $createPDFBorderNode(content = "") {
  return new PDFBorderNode(content);
}

export function $isPDFBorderNode(node) {
  return node instanceof PDFBorderNode;
}
