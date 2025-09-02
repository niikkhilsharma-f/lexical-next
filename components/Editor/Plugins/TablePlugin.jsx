"use client";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  INSERT_TABLE_COMMAND,
  TableCellNode,
  TableNode,
  TableRowNode,
  $getTableCellNodeFromLexicalNode,
  $deleteTableRowAtSelection,
  $deleteTableColumnAtSelection,
  $insertTableRowAtSelection,
  $insertTableColumnAtSelection,
  $getTableNodeFromLexicalNodeOrThrow,
  $isTableSelection,
} from "@lexical/table";
import { $getSelection, $isRangeSelection } from "lexical";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Grid3x3,
  Merge,
  Split,
  Plus,
} from "lucide-react";

export const CellContext = createContext({
  cellEditorConfig: null,
  cellEditorPlugins: null,
  set: () => {
    // Empty
  },
});

export function TableContext({ children }) {
  const [contextValue, setContextValue] = useState({
    cellEditorConfig: null,
    cellEditorPlugins: null,
  });
  return (
    <CellContext.Provider
      value={useMemo(
        () => ({
          cellEditorConfig: contextValue.cellEditorConfig,
          cellEditorPlugins: contextValue.cellEditorPlugins,
          set: (cellEditorConfig, cellEditorPlugins) => {
            setContextValue({ cellEditorConfig, cellEditorPlugins });
          },
        }),
        [contextValue.cellEditorConfig, contextValue.cellEditorPlugins]
      )}
    >
      {children}
    </CellContext.Provider>
  );
}

export function InsertTableDialog({ activeEditor, onClose, isOpen }) {
  const [rows, setRows] = useState("3");
  const [columns, setColumns] = useState("3");

  const onClick = () => {
    const row = Number(rows);
    const column = Number(columns);

    if (
      !(row && row > 0 && row <= 500 && column && column > 0 && column <= 50)
    ) {
      alert("Please enter valid values (Rows: 1-500, Columns: 1-50)");
      return;
    }

    activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns: column,
      rows: row,
      includeHeaders: true,
    });

    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Insert Table</AlertDialogTitle>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rows" className="block mb-2">
                Number of Rows
              </Label>
              <Input
                id="rows"
                placeholder="# of rows (1-500)"
                onChange={(e) => setRows(e.target.value)}
                value={rows}
                type="number"
                min="1"
                max="500"
              />
            </div>

            <div>
              <Label htmlFor="columns" className="block mb-2">
                Number of Columns
              </Label>
              <Input
                id="columns"
                placeholder="# of columns (1-50)"
                onChange={(e) => setColumns(e.target.value)}
                value={columns}
                type="number"
                min="1"
                max="50"
              />
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onClick}>Insert Table</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function TableActionsDropdown({ activeEditor }) {
  const [isInTable, setIsInTable] = useState(false);
  const [canMergeCells, setCanMergeCells] = useState(false);
  const [canUnmergeCells, setCanUnmergeCells] = useState(false);

  useEffect(() => {
    return activeEditor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const focusNode = selection.focus.getNode();

          // Check if we're in a table
          const anchorCell = $getTableCellNodeFromLexicalNode(anchorNode);
          const focusCell = $getTableCellNodeFromLexicalNode(focusNode);

          const inTable = anchorCell !== null;
          setIsInTable(inTable);

          if (inTable) {
            // Check if multiple cells are selected for merging
            const multipleCellsSelected =
              anchorCell !== focusCell && focusCell !== null;
            setCanMergeCells(multipleCellsSelected);

            // Check if current cell can be unmerged (has rowspan > 1 or colspan > 1)
            if (anchorCell) {
              const rowSpan = anchorCell.getRowSpan();
              const colSpan = anchorCell.getColSpan();
              setCanUnmergeCells(rowSpan > 1 || colSpan > 1);
            }
          }
        } else if ($isTableSelection(selection)) {
          setIsInTable(true);
          setCanMergeCells(true);
          setCanUnmergeCells(false);
        }
      });
    });
  }, [activeEditor]);

  const handleInsertRowAbove = () => {
    activeEditor.update(() => {
      $insertTableRowAtSelection(false);
    });
  };

  const handleInsertRowBelow = () => {
    activeEditor.update(() => {
      $insertTableRowAtSelection(true);
    });
  };

  const handleInsertColumnLeft = () => {
    activeEditor.update(() => {
      $insertTableColumnAtSelection(false);
    });
  };

  const handleInsertColumnRight = () => {
    activeEditor.update(() => {
      $insertTableColumnAtSelection(true);
    });
  };

  const handleDeleteRow = () => {
    activeEditor.update(() => {
      $deleteTableRowAtSelection();
    });
  };

  const handleDeleteColumn = () => {
    activeEditor.update(() => {
      $deleteTableColumnAtSelection();
    });
  };

  // Enhanced merge functionality
  const handleMergeCells = () => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        try {
          if ($isTableSelection(selection)) {
            // Handle TableSelection - get cells from table selection
            const nodes = selection.getNodes();
            const cellNodes = nodes.filter(
              (node) => node instanceof TableCellNode
            );

            if (cellNodes.length > 1) {
              // Simple merge - set colspan on the first cell
              const primaryCell = cellNodes[0];
              primaryCell.setColSpan(cellNodes.length);

              // Hide other cells by setting their colSpan to 0
              cellNodes.slice(1).forEach((cell) => {
                cell.setColSpan(0);
              });
            }
          } else {
            // Handle RangeSelection
            const anchorNode = selection.anchor.getNode();
            const anchorCell = $getTableCellNodeFromLexicalNode(anchorNode);

            if (anchorCell) {
              // Get all selected nodes and filter for table cells
              const nodes = selection.getNodes();
              const cellNodes = [];

              nodes.forEach((node) => {
                const cell = $getTableCellNodeFromLexicalNode(node);
                if (cell && !cellNodes.includes(cell)) {
                  cellNodes.push(cell);
                }
              });

              if (cellNodes.length > 1) {
                // Simple horizontal merge
                const primaryCell = cellNodes[0];
                primaryCell.setColSpan(cellNodes.length);

                // Hide other cells
                cellNodes.slice(1).forEach((cell) => {
                  cell.setColSpan(0);
                });
              }
            }
          }
        } catch (error) {
          console.error("Error merging cells:", error);
        }
      }
    });
  };

  const handleUnmergeCells = () => {
    activeEditor.update(() => {
      try {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const anchorCell = $getTableCellNodeFromLexicalNode(anchorNode);

          if (
            anchorCell &&
            (anchorCell.getRowSpan() > 1 || anchorCell.getColSpan() > 1)
          ) {
            anchorCell.setRowSpan(1);
            anchorCell.setColSpan(1);
          }
        }
      } catch (error) {
        console.error("Error unmerging cells:", error);
      }
    });
  };

  if (!isInTable) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" title="Table Actions">
          <Grid3x3 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem
          onClick={handleInsertRowAbove}
          className="flex items-center gap-2"
        >
          <ArrowUp className="h-4 w-4" />
          Insert Row Above
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleInsertRowBelow}
          className="flex items-center gap-2"
        >
          <ArrowDown className="h-4 w-4" />
          Insert Row Below
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleInsertColumnLeft}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Insert Column Left
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleInsertColumnRight}
          className="flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          Insert Column Right
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleMergeCells}
          disabled={!canMergeCells}
          className="flex items-center gap-2"
        >
          <Merge className="h-4 w-4" />
          Merge Cells
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleUnmergeCells}
          disabled={!canUnmergeCells}
          className="flex items-center gap-2"
        >
          <Split className="h-4 w-4" />
          Unmerge Cells
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDeleteRow}
          className="flex items-center gap-2 text-red-600"
        >
          <Minus className="h-4 w-4" />
          Delete Row
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDeleteColumn}
          className="flex items-center gap-2 text-red-600"
        >
          <Minus className="h-4 w-4" />
          Delete Column
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Quick Action Buttons Component
export function TableQuickActions({ activeEditor }) {
  const [isInTable, setIsInTable] = useState(false);

  useEffect(() => {
    return activeEditor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const anchorCell = $getTableCellNodeFromLexicalNode(anchorNode);
          setIsInTable(anchorCell !== null);
        } else if ($isTableSelection(selection)) {
          setIsInTable(true);
        }
      });
    });
  }, [activeEditor]);

  const handleAddRow = () => {
    activeEditor.update(() => {
      $insertTableRowAtSelection(true); // Add row below
    });
  };

  const handleAddColumn = () => {
    activeEditor.update(() => {
      $insertTableColumnAtSelection(true); // Add column to the right
    });
  };

  if (!isInTable) {
    return null;
  }

  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddRow}
        title="Add Row"
        className="h-8 px-2"
      >
        <Plus className="h-3 w-3 mr-1" />
        Row
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddColumn}
        title="Add Column"
        className="h-8 px-2"
      >
        <Plus className="h-3 w-3 mr-1" />
        Col
      </Button>
    </div>
  );
}

export function TablePlugin({ cellEditorConfig, children, activeEditor }) {
  const [editor] = useLexicalComposerContext();
  const cellContext = useContext(CellContext);
  const [showTableDialog, setShowTableDialog] = useState(false);

  const editorToUse = activeEditor || editor;

  useEffect(() => {
    if (!editor.hasNodes([TableNode, TableRowNode, TableCellNode])) {
      throw new Error(
        "TablePlugin: TableNode, TableRowNode, or TableCellNode is not registered on editor"
      );
    }
  }, [editor]);

  useEffect(() => {
    if (cellContext && cellEditorConfig) {
      cellContext.set(cellEditorConfig, children);
    }
  }, [cellContext, cellEditorConfig, children]);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowTableDialog(true)}
        title="Insert Table"
      >
        <Table className="h-4 w-4" />
      </Button>

      <TableQuickActions activeEditor={editorToUse} />
      <TableActionsDropdown activeEditor={editorToUse} />

      <InsertTableDialog
        activeEditor={editorToUse}
        onClose={() => setShowTableDialog(false)}
        isOpen={showTableDialog}
      />
    </div>
  );
}
