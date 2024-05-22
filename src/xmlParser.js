class XMLNode {
	constructor(tag, text, children) {
		this._tag = tag;
		this._text = text;
		this._children = children;
	}

	getTag() {
		return this._tag;
	}
	setTag(tag) {
		this._tag = tag;
	}
}


export class TextNode extends XMLNode {
	constructor(text) {
		if (!text) {
			throw new Error('Failed to create TextNode: text not found');
		}
		super(null, text, null)
	}

	toString() {
		return this._text;
	}

	getText() {
		return this._text;
	}
	setText(text) {
		if (!text) {
			throw new Error('Failed to create TextNode: text not found');
		}
		this._text = text;
	}
}

export class ParentNode extends XMLNode {
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

export class XMLParser {
	constructor() {
		this.tokens = [];
	}

	tokenize(xmlString) {
		const regex = /<[^>]+>|[^<]+/g;
		this.tokens = xmlString.match(regex);

		return this;
	}

	_getTokenTag(token) {
		const regex = /<\/?([^>]+)>/;
		const match = token.match(regex);

		if (match) {
			return match[1];
		}

		return null;
	}

	parse() {
		let stack = [];
		let root = null;

		for (const token of this.tokens) {
			if (token.startsWith('</')) {
				stack.pop();
			} else if (token.startsWith('<')) {
				let node = new ParentNode(this._getTokenTag(token));

				if (stack.length === 0) {
					root = node;
				} else {
					let parent = stack.at(-1);
					parent.addChild(node);
				}

				if (!token.endsWith('/>')) {
					stack.push(node);
				}
			} else { // Text node
				let parent = stack.at(-1);
				parent.addChild(new TextNode(token))
			}
		}

		return root;
	}
}
