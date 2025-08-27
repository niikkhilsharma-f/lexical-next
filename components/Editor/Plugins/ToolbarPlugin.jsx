import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LOW_PRIORIRTY,
  RICH_TEXT_OPTIONS,
  RichTextAction,
} from "../constants/index";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { mergeRegister } from "@lexical/utils";

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [disableMap, setDisableMap] = useState({
    [RichTextAction.Undo]: true,
    [RichTextAction.Redo]: true,
  });

  const [selectionMap, setSelectionMap] = useState({
    [RichTextAction.Bold]: false,
    [RichTextAction.Italics]: false,
    [RichTextAction.Underline]: false,
    [RichTextAction.Strikethrough]: false,
    [RichTextAction.Superscript]: false,
    [RichTextAction.Subscript]: false,
    [RichTextAction.Highlight]: false,
    [RichTextAction.Code]: false,
  });

  const updateToolbar = () => {
    const selection = $getSelection();
    // This means that the selection is a range of content selected by the user, means it is a text selection
    if ($isRangeSelection(selection)) {
      console.log(selection);
      const newSelectionMap = {
        [RichTextAction.Bold]: selection.hasFormat("bold"),
        [RichTextAction.Italics]: selection.hasFormat("italic"),
        [RichTextAction.Underline]: selection.hasFormat("underline"),
        [RichTextAction.Strikethrough]: selection.hasFormat("strikethrough"),
        [RichTextAction.Superscript]: selection.hasFormat("superscript"),
        [RichTextAction.Subscript]: selection.hasFormat("subscript"),
        [RichTextAction.Highlight]: selection.hasFormat("highlight"),
        [RichTextAction.Code]: selection.hasFormat("code"),
      };
      setSelectionMap(newSelectionMap);
      console.log(newSelectionMap);
    }
  };

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          console.log("can undo", payload);
          setDisableMap((prev) => ({
            ...prev,
            [RichTextAction.Undo]: !payload,
          }));
        },
        LOW_PRIORIRTY
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          console.log("can redo", payload);
          setDisableMap((prev) => ({
            ...prev,
            [RichTextAction.Redo]: !payload,
          }));
        },
        LOW_PRIORIRTY
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (paylod) => {
          updateToolbar();
        },
        LOW_PRIORIRTY
      )
    );
  }, []);

  function onAction(id) {
    switch (id) {
      case RichTextAction.Bold: {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        break;
      }
      case RichTextAction.Italics: {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        break;
      }
      case RichTextAction.Underline: {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        break;
      }
      case RichTextAction.Strikethrough: {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        break;
      }
      case RichTextAction.Superscript: {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
        break;
      }
      case RichTextAction.Subscript: {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
        break;
      }
      case RichTextAction.Highlight: {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "highlight");
        break;
      }
      case RichTextAction.Code: {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
        break;
      }
      case RichTextAction.LeftAlign: {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        break;
      }
      case RichTextAction.RightAlign: {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        break;
      }
      case RichTextAction.CenterAlign: {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        break;
      }
      case RichTextAction.JustifyAlign: {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        break;
      }
      case RichTextAction.Undo: {
        editor.dispatchCommand(UNDO_COMMAND, undefined);
        break;
      }
      case RichTextAction.Redo: {
        editor.dispatchCommand(REDO_COMMAND, undefined);
        break;
      }
    }
  }

  return (
    <div className="flex gap-2 flex-wrap p-2!">
      {RICH_TEXT_OPTIONS.map((option) =>
        option.id === "divider" ? (
          // <Separator orientation="vertical" className="h-9!" />
          <></>
        ) : (
          <Button
            variant={"outline"}
            className={`${selectionMap[option.id] && "bg-muted-foreground/30"}`}
            disabled={disableMap[option.id]}
            id={option.id}
            aria-label={option.label}
            size={"icon"}
            onClick={() => onAction(option.id)}
          >
            {option.icon}
          </Button>
        )
      )}
    </div>
  );
}
