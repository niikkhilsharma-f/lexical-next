import { LOW_PRIORIRTY, RichTextAction } from "@/components/Editor/constants";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { KEY_DOWN_COMMAND, KEY_ENTER_COMMAND } from "lexical";
import { useEffect } from "react";

export const useKeyBindings = ({ onAction }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const unregister = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        if (event?.key === "B" && (event?.ctrlKey || event?.metaKey))
          onAction(RichTextAction.Bold);
        if (event?.key === "I" && (event?.ctrlKey || event?.metaKey))
          onAction(RichTextAction.Italics);
        if (event?.key === "U" && (event?.ctrlKey || event?.metaKey))
          onAction(RichTextAction.Underline);
        if (event?.key === "H" && (event?.ctrlKey || event?.metaKey))
          onAction(RichTextAction.Highlight);
        if (event?.key === "S" && (event?.ctrlKey || event?.metaKey))
          onAction(RichTextAction.Strikethrough);
        if (event?.key === "Z" && (event?.ctrlKey || event?.metaKey))
          onAction(RichTextAction.Undo);
        if (event?.key === "Y" && (event?.ctrlKey || event?.metaKey))
          onAction(RichTextAction.Redo);

        return false;
      },
      LOW_PRIORIRTY
    );

    return unregister; // Cleanup on unmount
  }, [onAction, editor]);
};
