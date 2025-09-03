import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  LOW_PRIORIRTY,
  RICH_TEXT_OPTIONS,
  RichTextAction,
  HEADINGS,
} from "../constants/index";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CLEAR_EDITOR_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  KEY_DOWN_COMMAND,
  COMMAND_PRIORITY_NORMAL,
} from "lexical";
import { mergeRegister, $getNearestNodeOfType } from "@lexical/utils";
import { $createHeadingNode } from "@lexical/rich-text";
import { $wrapNodes } from "@lexical/selection";
import { useKeyBindings } from "@/hooks/useKeyBindings";
import ColorPlugin from "./ColorPlugin";
import ListPlugin from "./ListPlugin";
import { $isListNode, ListNode } from "@lexical/list";
import { cn } from "@/lib/utils";
import { Trash2, Info } from "lucide-react";
import {
  $getTableCellNodeFromLexicalNode,
  $isTableCellNode,
  $isTableNode,
  TableCellNode,
  $deleteTableRowAtSelection,
  $deleteTableColumnAtSelection,
  $insertTableRowAtSelection,
  $insertTableColumnAtSelection,
  $getTableNodeFromLexicalNodeOrThrow,
  $isTableSelection,
} from "@lexical/table";
import { InsertTableDialog } from "./TablePlugin";
import { Scissors } from "react-bootstrap-icons";
import { INSERT_PAGE_BREAK } from "./PageBreakPlugin";
import { FileImage } from "lucide-react";
import { INSERT_PDF_BORDER_COMMAND } from "./PDFBorderPlugin/PDFBorderPlugin";

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isInTable, setIsInTable] = useState(false);
  const [tableInfo, setTableInfo] = useState({
    rows: 0,
    cols: 0,
    selectedCells: 0,
  });

  const [blockType, setBlockType] = useState("paragraph");
  const [disableMap, setDisableMap] = useState({
    [RichTextAction.Undo]: true,
    [RichTextAction.Redo]: true,
    [RichTextAction.MergeCells]: false,
    [RichTextAction.InsertRow]: false,
    [RichTextAction.InsertColumn]: false,
    [RichTextAction.DeleteRow]: false,
    [RichTextAction.DeleteColumn]: false,
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
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      if ($isRangeSelection(selection)) {
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
      }

      let anchorNode;
      if ($isTableSelection(selection)) {
        const nodes = selection.getNodes();
        anchorNode = nodes[0];
      } else {
        anchorNode = selection.anchor.getNode();
      }

      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (!elementDOM) return;

      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType(anchorNode, ListNode);
        const type = parentList ? parentList.getTag() : element.getTag();
        setBlockType(type);
      }

      // Check table status
      const anchorCell = $getTableCellNodeFromLexicalNode(anchorNode);

      if (anchorCell) {
        setIsInTable(true);

        // Count selected cells
        let selectedCells = 0;
        if ($isTableSelection(selection)) {
          selectedCells = selection
            .getNodes()
            .filter((node) => $isTableCellNode(node)).length;
        } else {
          selectedCells = selection
            .getNodes()
            .filter(
              (node) =>
                $isTableCellNode(node) || $getTableCellNodeFromLexicalNode(node)
            ).length;
        }

        // Get table dimensions
        const tableNode = $getNearestNodeOfType(anchorNode, function (node) {
          return $isTableNode(node);
        });

        if (tableNode) {
          const rows = tableNode.getChildrenSize();
          const cols =
            rows > 0 ? tableNode.getFirstChild()?.getChildrenSize() || 0 : 0;
          setTableInfo({ rows, cols, selectedCells });
        }
      } else {
        setIsInTable(false);
        setTableInfo({ rows: 0, cols: 0, selectedCells: 0 });
      }
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
          setDisableMap((prev) => ({
            ...prev,
            [RichTextAction.Undo]: !payload,
          }));
          return false;
        },
        LOW_PRIORIRTY
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setDisableMap((prev) => ({
            ...prev,
            [RichTextAction.Redo]: !payload,
          }));
          return false;
        },
        LOW_PRIORIRTY
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (payload) => {
          updateToolbar();
          return false;
        },
        LOW_PRIORIRTY
      ),
      // Enhanced table keyboard shortcuts
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event) => {
          if (!isInTable) return false;

          const { ctrlKey, altKey, shiftKey, key } = event;

          // Ctrl+Shift+Arrow keys for table operations
          if (ctrlKey && shiftKey) {
            switch (key) {
              case "ArrowUp":
                event.preventDefault();
                editor.update(() => {
                  $insertTableRowAtSelection(false);
                });
                return true;
              case "ArrowDown":
                event.preventDefault();
                editor.update(() => {
                  $insertTableRowAtSelection(true);
                });
                return true;
              case "ArrowLeft":
                event.preventDefault();
                editor.update(() => {
                  $insertTableColumnAtSelection(false);
                });
                return true;
              case "ArrowRight":
                event.preventDefault();
                editor.update(() => {
                  $insertTableColumnAtSelection(true);
                });
                return true;
            }
          }

          // Alt+Delete for row/column deletion
          if (altKey && key === "Delete") {
            if (shiftKey) {
              event.preventDefault();
              editor.update(() => {
                $deleteTableColumnAtSelection();
              });
            } else {
              event.preventDefault();
              editor.update(() => {
                $deleteTableRowAtSelection();
              });
            }
            return true;
          }

          // Enhanced Ctrl+M for merge/unmerge
          if (ctrlKey && key === "m") {
            event.preventDefault();
            editor.update(() => {
              const selection = $getSelection();
              if (
                $isRangeSelection(selection) ||
                $isTableSelection(selection)
              ) {
                let anchorCell;

                if ($isTableSelection(selection)) {
                  const nodes = selection.getNodes();
                  const cellNodes = nodes.filter(
                    (node) => node instanceof TableCellNode
                  );

                  if (cellNodes.length > 1) {
                    // Merge selected cells
                    const primaryCell = cellNodes[0];
                    primaryCell.setColSpan(cellNodes.length);

                    cellNodes.slice(1).forEach((cell) => {
                      cell.setColSpan(0);
                    });
                  }
                } else {
                  anchorCell = $getTableCellNodeFromLexicalNode(
                    selection.anchor.getNode()
                  );

                  if (anchorCell) {
                    // Check if cell is already merged
                    if (
                      anchorCell.getRowSpan() > 1 ||
                      anchorCell.getColSpan() > 1
                    ) {
                      // Unmerge
                      anchorCell.setRowSpan(1);
                      anchorCell.setColSpan(1);
                    } else {
                      // Try to merge with selected cells
                      const nodes = selection.getNodes();
                      const cellNodes = [];

                      nodes.forEach((node) => {
                        const cell = $getTableCellNodeFromLexicalNode(node);
                        if (cell && !cellNodes.includes(cell)) {
                          cellNodes.push(cell);
                        }
                      });

                      if (cellNodes.length > 1) {
                        // Simple merge - set colspan on first cell
                        const primaryCell = cellNodes[0];
                        primaryCell.setColSpan(cellNodes.length);

                        cellNodes.slice(1).forEach((cell) => {
                          cell.setColSpan(0);
                        });
                      }
                    }
                  }
                }
              }
            });
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_NORMAL
      )
    );
  }, [editor, isInTable]);

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

  useKeyBindings({ onAction });

  const updateHeading = (heading) => {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createHeadingNode(heading));
      }
    });
  };

  return (
    <div className="space-y-2 p-2">
      {/* Main toolbar */}
      <div className="flex gap-2 flex-wrap">
        <Select onValueChange={updateHeading}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={"Select Heading"} />
          </SelectTrigger>
          <SelectContent>
            {HEADINGS.map((heading, indx) => (
              <SelectItem key={indx} value={heading}>
                {heading}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {RICH_TEXT_OPTIONS.map(
          (option, indx) =>
            option.id !== "divider" && (
              <Tooltip key={indx}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      buttonVariants({
                        variant: selectionMap[option.id]
                          ? "default"
                          : "outline",
                        size: "icon",
                      })
                    )}
                    disabled={disableMap[option.id]}
                    id={option.id}
                    size={"icon"}
                    onClick={() => onAction(option.id)}
                  >
                    {option.icon}
                  </div>
                </TooltipTrigger>
                <TooltipContent>{option.label}</TooltipContent>
              </Tooltip>
            )
        )}
        <ColorPlugin />
        <ListPlugin blockType={blockType} setBlockType={setBlockType} />

        <InsertTableDialog activeEditor={activeEditor} onClose={() => {}} />

        <Button
          variant={"outline"}
          size={"icon"}
          onClick={() => {
            activeEditor.dispatchCommand(INSERT_PAGE_BREAK, undefined);
          }}
        >
          <Scissors />
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                activeEditor.dispatchCommand(
                  INSERT_PDF_BORDER_COMMAND,
                  undefined
                );
              }}
            >
              <FileImage />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Insert PDF Border</TooltipContent>
        </Tooltip>

        <Button
          variant={"outline"}
          size={"icon"}
          onClick={() => editor.dispatchCommand(CLEAR_EDITOR_COMMAND)}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
