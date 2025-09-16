import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Button } from "./ui/button";
import { useEffect } from "react";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $insertNodes, $getRoot, $createParagraphNode } from "lexical";
import { toast } from "sonner";
import { LoaderOne } from "./ui/loader";

export default function Form() {
  const [editor] = useLexicalComposerContext();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    async function getData(editor) {
      const data = await fetch("/api/save");
      const htmlData = await data.text();

      editor.update(() => {
        console.log(htmlData, "loaded data");
        $getRoot().clear();
        const parser = new DOMParser();
        const dom = parser.parseFromString(htmlData, "text/html");
        console.log(dom);
        const nodes = $generateNodesFromDOM(editor, dom);
        console.log(nodes);
        $insertNodes(nodes);
      });
    }

    if (editor) {
      getData(editor);
    }
  }, [editor]);

  async function handleSubmit(e, html) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: html }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error();
      }
      toast.success("Content saved successfully!", {
        position: "bottom-right",
      });
      console.log("Success:", result);
    } catch (error) {
      console.log("Error:", error);
      toast.error("Failed to save content.");
    }
    setLoading(false);
  }

  return (
    <div className="w-full">
      <Button
        className={"w-full"}
        disabled={loading}
        onClick={() => {
          const html = editor.read((editorState) => {
            const htmlString = $generateHtmlFromNodes(editor, null);
            return htmlString.replace(/white-space:\s*pre-wrap;?/g, "");
          });

          console.log(html, "the html value");
          handleSubmit(event, html);
        }}
      >
        Save
      </Button>
      {loading && (
        <div className="absolute left-1/2 top-1/2">
          <LoaderOne />
        </div>
      )}
    </div>
  );
}
