// Enhanced PDFBorderNode with editable content
function PDFBorderComponent({ nodeKey }) {
  const [editor] = useLexicalComposerContext();
  const [isEditing, setIsEditing] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);

    // Focus the main editor and position cursor after this node
    editor.update(() => {
      const node = editor.getEditorState()._nodeMap.get(nodeKey);
      if (node) {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Create a new paragraph after the border for editing
          const paragraph = $createParagraphNode();
          node.insertAfter(paragraph);
          paragraph.select();
        }
      }
    });
  };

  return (
    <div
      className="pdf-border-wrapper"
      onClick={handleClick}
      style={{
        width: "21cm",
        minHeight: "29.7cm",
        maxWidth: "100%",
        margin: "20px auto",
        padding: "2.5cm 2cm",
        border: "2px solid #374151",
        borderRadius: "8px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        background: "white",
        position: "relative",
        boxSizing: "border-box",
        cursor: "text",
        transition: "border-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#2563eb";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#374151";
      }}
    >
      {/* Corner indicators */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          width: "20px",
          height: "20px",
          border: "2px solid #9ca3af",
          borderRight: "none",
          borderBottom: "none",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          width: "20px",
          height: "20px",
          border: "2px solid #9ca3af",
          borderLeft: "none",
          borderBottom: "none",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          width: "20px",
          height: "20px",
          border: "2px solid #9ca3af",
          borderRight: "none",
          borderTop: "none",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          width: "20px",
          height: "20px",
          border: "2px solid #9ca3af",
          borderLeft: "none",
          borderTop: "none",
          opacity: 0.5,
        }}
      />

      {/* Content area */}
      <div style={{ minHeight: "24.7cm", width: "100%", position: "relative" }}>
        <div
          style={{
            color: "#9ca3af",
            fontSize: "14px",
            textAlign: "center",
            paddingTop: "50px",
          }}
        >
          📄 PDF Border Container
          <div style={{ fontSize: "12px", marginTop: "10px" }}>
            Click to start typing content that will appear within this bordered
            area
          </div>
        </div>
      </div>
    </div>
  );
}
