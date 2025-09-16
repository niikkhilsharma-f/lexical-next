export class PageBreakNode extends DecoratorNode {
  static getType() {
    return "page-break";
  }

  static clone(node) {
    return new PageBreakNode(node.__key);
  }

  createDOM(config) {
    const span = document.createElement("div");
    span.className = "page-break";
    span.style.cssText =
      "page-break-after: always; border-top: 2px dashed #ccc; margin: 20px 0;";
    return span;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return <PageBreak nodeKey={this.getKey()} />;
  }
}
