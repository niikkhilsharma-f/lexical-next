import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { createCommand, COMMAND_PRIORITY_EDITOR } from "lexical";
import { useEffect } from "react";
import { $createCustomParagraphNode } from "../../nodes/CustomParagraphNode/CustomParagraphNode";

// Create a custom command
export const INSERT_CUSTOM_PARAGRAPH_COMMAND = createCommand();

export function CustomParagraphPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Register the command
    return editor.registerCommand(
      INSERT_CUSTOM_PARAGRAPH_COMMAND,
      (payload) => {
        // Create and insert your custom paragraph node
        const customParagraphNode = $createCustomParagraphNode();
        $insertNodeToNearestRoot(customParagraphNode);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null; // This plugin doesn't render anything
}
