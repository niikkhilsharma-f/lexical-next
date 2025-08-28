import { LOW_PRIORIRTY, RichTextAction } from '@/components/Editor/constants'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { KEY_DOWN_COMMAND, KEY_ENTER_COMMAND } from 'lexical'
import { useEffect } from 'react'

export const useKeyBindings = ({ onAction }) => {
	const [editor] = useLexicalComposerContext()
	useEffect(() => {
		editor.registerCommand(
			KEY_DOWN_COMMAND,
			event => {
				if (event?.key === 'b' && (event?.ctrlKey || event?.metaKey)) onAction(RichTextAction.Bold)
				if (event?.key === 'i' && (event?.ctrlKey || event?.metaKey)) onAction(RichTextAction.Italics)
				if (event?.key === 'u' && (event?.ctrlKey || event?.metaKey)) onAction(RichTextAction.Underline)
				if (event?.key === 'h' && (event?.ctrlKey || event?.metaKey)) onAction(RichTextAction.Highlight)
				if (event?.key === 's' && (event?.ctrlKey || event?.metaKey)) onAction(RichTextAction.Strikethrough)
				if (event?.key === 'z' && (event?.ctrlKey || event?.metaKey)) onAction(RichTextAction.Undo)
				if (((event?.key === 'z' && event?.shiftKey) || event?.key === 'y') && (event?.ctrlKey || event?.metaKey))
					onAction(RichTextAction.Redo)

				return false
			},
			LOW_PRIORIRTY
		)
	}, [onAction, editor])
}
