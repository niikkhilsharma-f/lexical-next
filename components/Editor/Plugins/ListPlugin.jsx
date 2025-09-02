import { Button } from "@/components/ui/button";
import React from "react";
import { ListOl, ListUl } from "react-bootstrap-icons";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";

export default function ListPlugin({ blockType, setBlockType }) {
  const [editor] = useLexicalComposerContext();

  const toggleList = (type) => {
    if (blockType === type) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      setBlockType("paragraph"); // Reset to paragraph when removing list
    } else {
      if (type === "ol") {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      }
    }
  };

  return (
    <>
      <Button
        aria-label="Add Ordered list"
        variant={blockType === "ol" ? "default" : "outline"}
        size={"icon"}
        onClick={() => toggleList("ol")}
      >
        <ListOl />
      </Button>
      <Button
        aria-label="Add Unordered list"
        variant={blockType === "ul" ? "default" : "outline"}
        size={"icon"}
        onClick={() => toggleList("ul")}
      >
        <ListUl />
      </Button>
    </>
  );
}
