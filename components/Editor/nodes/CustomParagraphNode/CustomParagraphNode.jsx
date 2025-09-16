import { $applyNodeReplacement, ParagraphNode } from "lexical";

export class CustomParagraphNode extends ParagraphNode {
  __bgColor;

  static getType() {
    return "custom-paragraph";
  }

  static clone(node) {
    return new CustomParagraphNode(node.__key, node.__bgColor);
  }

  constructor(key, bgColor = "red") {
    super(key);
    this.__bgColor = bgColor;
  }

  static importDOM() {
    const importers = ParagraphNode.importDOM();
    return {
      ...importers,
      p: () => ({
        conversion: (node) => {
          const backgroundColor = node.style.backgroundColor || "red";
          const paragraphNode = new CustomParagraphNode(
            undefined,
            backgroundColor
          );

          // Apply other styles
          const textAlign = node.style.textAlign;
          const direction = node.getAttribute("dir");

          if (textAlign || direction) {
            let style = [];
            if (textAlign) style.push(`text-align: ${textAlign}`);
            if (direction) style.push(`direction: ${direction}`);

            if (style.length > 0) {
              paragraphNode.setStyle(style.join("; "));
            }
          }

          return { node: paragraphNode };
        },
        priority: 1,
      }),
    };
  }

  createDOM() {
    const dom = document.createElement("p");
    dom.className = "custom-paragraph";
    dom.style.backgroundColor = this.__bgColor;
    return dom;
  }

  updateDOM(prevNode, dom) {
    if (prevNode.__bgColor !== this.__bgColor) {
      dom.style.backgroundColor = this.__bgColor;
      return true;
    }
    return false;
  }

  setBgColor(bgColor) {
    const writable = this.getWritable();
    writable.__bgColor = bgColor;
  }

  getBgColor() {
    return this.__bgColor;
  }

  static importJSON(serializedNode) {
    const node = new CustomParagraphNode(undefined, serializedNode.bgColor);
    return node;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "custom-paragraph",
      version: 1,
      bgColor: this.__bgColor,
    };
  }
}

export function $createCustomParagraphNode(bgColor = "red") {
  return $applyNodeReplacement(new CustomParagraphNode(undefined, bgColor));
}

export function $isCustomParagraphNode(node) {
  return node instanceof CustomParagraphNode;
}
