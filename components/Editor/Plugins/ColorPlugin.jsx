import ColorPickerPopUp from "@/components/ColorPickerPopUp";
import { PaintBucket } from "react-bootstrap-icons";
import { Palette } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import {
  $patchStyleText,
  $getSelectionStyleValueForProperty,
} from "@lexical/selection";
import { mergeRegister } from "@lexical/utils";
import { LOW_PRIORIRTY } from "../constants";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ColorPlugin() {
  const [editor] = useLexicalComposerContext();
  const [colors, setColors] = useState({
    color: "#000",
    backgroundColor: "#fff",
  });

  const updateToolbar = () => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      // You can also check for other formats here
      const color = $getSelectionStyleValueForProperty(
        selection,
        "color",
        "#000"
      );
      const backgroundColor = $getSelectionStyleValueForProperty(
        selection,
        "background",
        "#fff"
      );

      setColors({ color, backgroundColor });
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
        SELECTION_CHANGE_COMMAND,
        (paylod) => {
          updateToolbar();
          return false;
        },
        LOW_PRIORIRTY
      )
    );
  }, [editor]);

  const updateColor = ({ property, color }) => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection) {
        $patchStyleText(selection, { [property]: color });
      }
    });
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger>
          <ColorPickerPopUp
            color={colors.color}
            onColorChange={(color) => {
              updateColor({ property: "color", color });
            }}
            icon={<Palette />}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Change Text Color</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger>
          <ColorPickerPopUp
            color={colors.backgroundColor}
            onColorChange={(color) => {
              updateColor({ property: "background", color });
            }}
            icon={<PaintBucket />}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Background Color</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
}
