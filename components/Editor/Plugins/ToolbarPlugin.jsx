import { useState, useEffect } from 'react'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { LOW_PRIORIRTY, RICH_TEXT_OPTIONS, RichTextAction, HEADINGS } from '../constants/index'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
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
} from 'lexical'
import { mergeRegister } from '@lexical/utils'
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text'
import { $wrapNodes } from '@lexical/selection'
import { useKeyBindings } from '@/hooks/useKeyBindings'

export default function ToolbarPlugin() {
	const [editor] = useLexicalComposerContext()
	const [disableMap, setDisableMap] = useState({
		[RichTextAction.Undo]: true,
		[RichTextAction.Redo]: true,
	})

	const [selectionMap, setSelectionMap] = useState({
		[RichTextAction.Bold]: false,
		[RichTextAction.Italics]: false,
		[RichTextAction.Underline]: false,
		[RichTextAction.Strikethrough]: false,
		[RichTextAction.Superscript]: false,
		[RichTextAction.Subscript]: false,
		[RichTextAction.Highlight]: false,
		[RichTextAction.Code]: false,
	})

	const updateToolbar = () => {
		const selection = $getSelection()
		// This means that the selection is a range of content selected by the user, means it is a text selection
		if ($isRangeSelection(selection)) {
			const newSelectionMap = {
				[RichTextAction.Bold]: selection.hasFormat('bold'),
				[RichTextAction.Italics]: selection.hasFormat('italic'),
				[RichTextAction.Underline]: selection.hasFormat('underline'),
				[RichTextAction.Strikethrough]: selection.hasFormat('strikethrough'),
				[RichTextAction.Superscript]: selection.hasFormat('superscript'),
				[RichTextAction.Subscript]: selection.hasFormat('subscript'),
				[RichTextAction.Highlight]: selection.hasFormat('highlight'),
				[RichTextAction.Code]: selection.hasFormat('code'),
			}
			const nodes = selection.getNodes()
			for (const node of nodes) {
				if (node) {
					console.log('This node is a heading!', node)
					// Further actions specific to heading nodes
				} else {
					console.log('This node is not a heading.')
				}
			}
			console.log(nodes, selection, selection.style, selection.format)
			// Check if any selected node is a heading
			const headingInfo = nodes
				.map(node => {
					if ($isHeadingNode(selection)) {
						return {
							type: 'heading',
							tag: node.getTag(), // Returns 'h1', 'h2', 'h3', etc.
						}
					}
					return null
				})
				.filter(Boolean)
			console.log(headingInfo)
			console.log(selection.hasFormat('h1'))
			setSelectionMap(newSelectionMap)
		}
	}

	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					updateToolbar()
				})
			}),
			editor.registerCommand(
				CAN_UNDO_COMMAND,
				payload => {
					console.log('can undo', payload)
					setDisableMap(prev => ({
						...prev,
						[RichTextAction.Undo]: !payload,
					}))
					// Here, returning false would lead to trigger of other event listeners also but in their order or execution. Returning true prevents other event listeners from triggering and only this would be triggered in that case.
					return false
				},
				LOW_PRIORIRTY
			),
			editor.registerCommand(
				CAN_REDO_COMMAND,
				payload => {
					console.log('can redo', payload)
					setDisableMap(prev => ({
						...prev,
						[RichTextAction.Redo]: !payload,
					}))
					return false
				},
				LOW_PRIORIRTY
			),
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				paylod => {
					updateToolbar()
					return false
				},

				LOW_PRIORIRTY
			)
		)
	}, [])

	function onAction(id) {
		switch (id) {
			case RichTextAction.Bold: {
				editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
				break
			}
			case RichTextAction.Italics: {
				editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
				break
			}
			case RichTextAction.Underline: {
				editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
				break
			}
			case RichTextAction.Strikethrough: {
				editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
				break
			}
			case RichTextAction.Superscript: {
				editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')
				break
			}
			case RichTextAction.Subscript: {
				editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')
				break
			}
			case RichTextAction.Highlight: {
				editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')
				break
			}
			case RichTextAction.Code: {
				editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
				break
			}
			case RichTextAction.LeftAlign: {
				editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')
				break
			}
			case RichTextAction.RightAlign: {
				editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')
				break
			}
			case RichTextAction.CenterAlign: {
				editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')
				break
			}
			case RichTextAction.JustifyAlign: {
				editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')
				break
			}
			case RichTextAction.Undo: {
				editor.dispatchCommand(UNDO_COMMAND, undefined)
				break
			}
			case RichTextAction.Redo: {
				editor.dispatchCommand(REDO_COMMAND, undefined)
				break
			}
		}
	}

	useKeyBindings({ onAction })

	const updateHeading = heading => {
		editor.update(() => {
			const selection = $getSelection()

			if ($isRangeSelection(selection)) {
				$wrapNodes(selection, () => $createHeadingNode(heading))
			}
		})
	}

	return (
		<div className="flex gap-2 flex-wrap p-2!">
			<Select onValueChange={updateHeading}>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder={'Select Heading'} />
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
					// option.id === 'divider' && (
					// <Separator key={indx} orientation="vertical" className="h-9!" />
					// ) : (
					option.id !== 'divider' && (
						<Button
							key={indx}
							variant={'outline'}
							className={`${selectionMap[option.id] && 'bg-muted-foreground/30'}`}
							disabled={disableMap[option.id]}
							id={option.id}
							aria-label={option.label}
							size={'icon'}
							onClick={() => onAction(option.id)}>
							{option.icon}
						</Button>
					)
			)}
		</div>
	)
}
