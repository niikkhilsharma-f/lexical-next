'use client'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { HeadingNode } from '@lexical/rich-text'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import ToolbarPlugin from './Plugins/ToolbarPlugin'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { css } from '@emotion/css'

const initialConfig = {
	nameSpace: 'Rich Text Editor',
	theme: {
		heading: {
			h1: 'text-4xl font-extrabold tracking-tight text-balance',
			h2: 'text-3xl font-semibold tracking-tight',
			h3: 'text-2xl font-semibold tracking-tight',
			h4: 'text-xl font-semibold tracking-tight',
			h5: 'text-lg font-semibold tracking-tight',
			h6: 'text-base font-semibold tracking-tight',
		},
		list: { ul: 'my-6 ml-6 list-disc [&>li]:mt-2' },
		text: {
			bold: css({ fontWeight: 'bold' }),
			underline: css({ textDecoration: 'underline' }),
			strikethrough: css({ textDecoration: 'line-through' }),
			underlineStrikethrough: css({ textDecoration: 'underline line-through' }),
			italic: css({ fontStyle: 'italic' }),
			code: 'bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
		},
		// I'm not sure if it's getting applied
		table: { tr: 'even:bg-muted m-0 border-t p-0' },
	},
	onError: () => {},
	nodes: [HeadingNode, CodeHighlightNode, CodeNode],
}

export default function LexicalTextEditor() {
	return (
		<div className="px-0.5! py-2! flex gap-2 h-screen">
			<LexicalComposer initialConfig={initialConfig}>
				<div className="w-1/4 border rounded-md">
					<ToolbarPlugin />
				</div>
				<div className="border p-2! rounded-md border-black relative w-3/4">
					<RichTextPlugin
						contentEditable={
							<ContentEditable
								className="h-full focus-within:outline-none"
								aria-placeholder={'Enter some text...'}
								placeholder={<div className="absolute left-2 top-2">Enter some text...</div>}
							/>
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>
				</div>
				<AutoFocusPlugin />
				<HistoryPlugin />
			</LexicalComposer>
		</div>
	)
}
