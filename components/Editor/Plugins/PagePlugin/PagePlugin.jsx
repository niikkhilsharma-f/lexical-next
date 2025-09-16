export const INSERT_PAGE_BREAK_COMMAND = createCommand('INSERT_PAGE_BREAK_COMMAND');

export default function PageBreakPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([PageBreakNode])) {
      throw new Error('PageBreakPlugin: PageBreakNode not registered on editor');
    }

    return editor.registerCommand<void>(
      INSERT_PAGE_BREAK_COMMAND,
      () => {
        const pageBreakNode = $createPageBreakNode();
        $insertNodeToNearestRoot(pageBreakNode);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
