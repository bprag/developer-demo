export const nodeOps = {
	querySelector(selector) {
		return document.querySelector(selector);
	},
	createElement(type) {
		return document.createElement(type);
	},
	createText(text) {
		return document.createTextNode(text);
	},
	remove(el) {
		const parentNode = el.parentNode;
		if (parentNode) {
			parentNode.removeChild(el);
		}
	},
	setElementText(el, text) {
		el.textContent = text
	},
	setText(node, text) {
		return (node.nodeValue = text)
	},
	parentNode(el) {
		return el.parentNode
	},
	nextSibling(el) {
		return el.nextSibling
	},
	insert(el, parent, anchor = null) {
		parent.insertBefore(el, anchor)
	}
}