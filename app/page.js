// app/page.js (or wherever your Home component is)
"use client";

import ColorPicker from "@/components/ColorPickerPopUp";
import dynamic from "next/dynamic";

// Import the updated RichTextEditor with table support
const LexicalTextEditorNoSSR = dynamic(
  () => import("@/components/Editor/RichTextEditor").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-gray-600">Loading editor...</span>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LexicalTextEditorNoSSR />
    </div>
  );
}
