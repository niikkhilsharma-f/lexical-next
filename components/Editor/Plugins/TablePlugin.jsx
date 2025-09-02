import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  INSERT_TABLE_COMMAND,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "@lexical/table";
import { EditorThemeClasses, Klass, LexicalEditor, LexicalNode } from "lexical";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Table } from "react-bootstrap-icons";

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

export function InsertTableDialog({ activeEditor, onClose }) {
  const [rows, setRows] = useState("5");
  const [columns, setColumns] = useState("5");
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    const row = Number(rows);
    const column = Number(columns);
    if (row && row > 0 && row <= 500 && column && column > 0 && column <= 50) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [rows, columns]);

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns,
      rows,
    });

    onClose();
  };

  return (
    <Popover>
      <PopoverTrigger
        className={buttonVariants({ variant: "outline", size: "icon" })}
      >
        <Table />
      </PopoverTrigger>
      <PopoverContent as="div" className={"space-y-3"}>
        <span className="block">
          <Label htmlFor="rows">Rows</Label>
          <Input
            className={"mt-1.5"}
            id="rows"
            placeholder={"# of rows (1-500)"}
            label="Rows"
            onChange={(e) => setRows(e.target.value)}
            value={rows}
            data-test-id="table-modal-rows"
            type="number"
          />
        </span>
        <span className="block">
          <Label htmlFor="columns">Columns</Label>
          <Input
            className={"mt-1.5"}
            id="columns"
            placeholder={"# of columns (1-50)"}
            label="Columns"
            onChange={(e) => setColumns(e.target.value)}
            value={columns}
            data-test-id="table-modal-columns"
            type="number"
          />
        </span>
        <Button disabled={isDisabled} onClick={onClick}>
          Confirm
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export function TablePlugin({ cellEditorConfig, children }) {
  const [editor] = useLexicalComposerContext();
  const cellContext = useContext(CellContext);
  useEffect(() => {
    if (!editor.hasNodes([TableNode, TableRowNode, TableCellNode])) {
      throw new Error(
        "TablePlugin: TableNode, TableRowNode, or TableCellNode is not registered on editor"
      );
    }
  }, [editor]);
  useEffect(() => {
    cellContext.set(cellEditorConfig, children);
  }, [cellContext, cellEditorConfig, children]);
  return null;
}
