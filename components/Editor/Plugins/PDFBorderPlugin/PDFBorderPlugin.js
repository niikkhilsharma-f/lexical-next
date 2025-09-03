// Plugins/PDFBorderPlugin.js
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  $createParagraphNode,
} from "lexical";
import { $insertNodes } from "lexical";
import {
  $createPDFBorderNode,
  PDFBorderNode,
} from "../../nodes/PDFBorderNode/PDFBorderNode";

export const INSERT_PDF_BORDER_COMMAND = createCommand(
  "INSERT_PDF_BORDER_COMMAND"
);

export default function PDFBorderPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([PDFBorderNode])) {
      throw new Error(
        "PDFBorderPlugin: PDFBorderNode not registered on editor"
      );
    }

    return editor.registerCommand(
      INSERT_PDF_BORDER_COMMAND,
      () => {
        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            const pdfBorderNode = $createPDFBorderNode();

            // Insert the PDF border node
            $insertNodes([pdfBorderNode]);

            // Add some space after the border
            const paragraphNode = $createParagraphNode();
            $insertNodes([paragraphNode]);
          }
        });

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
