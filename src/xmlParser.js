class XMLNode {
	constructor(tag, text, children) {
		if (!tag) {
			throw new Error('Failed to create XMLNode: tag not found');
		}

		this._tag = tag;
		this._text = text;
		this._children = children;
	}

	getTag() {
		return this._tag;
	}
	setTag(tag) {
		if (!tag) {
			throw new Error('Failed to create XMLNode: tag not found');
		}

		this._tag = tag;
	}


}


class LeafNode extends XMLNode {
	constructor(tag, text) {
		if (!text) {
			throw new Error('Failed to create LeafNode: text not found');
		}
		super(tag, text, null)
	}

	toString() {
		return `<${this._tag}>${this._text}</${this._tag}>`
	}

	getText() {
		return this._text;
	}
	setText(text) {
		if (!text) {
			throw new Error('Failed to create LeafNode: text not found');
		}
		this._text = text;
	}
}

class ParentNode extends XMLNode {
	constructor(tag, children = []) {
		super(tag, null, children)
	}

	toString() {
		let str = `<${this._tag}>`;
		for (const child of this._children) {
			str += child.toString();
		}
		str += `</${this._tag}>`;
		return str;
	}

	getChildren() {
		return this._children;
	}
	setChildren(children) {
		this._children = children;
	}
	addChild(node) {
		this._children.push(node);
	}
}



export { LeafNode, ParentNode };
