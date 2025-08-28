'use client'

import dynamic from 'next/dynamic'

const LexicalTextEditorNoSSR = dynamic(() => import('@/components/Editor/RichTextEditor').then(mod => mod.default), {
	ssr: false,
})

export default function Home() {
	return (
		<div>
			<LexicalTextEditorNoSSR />
		</div>
	)
}
