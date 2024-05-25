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

	getInnerText() {
		for (const child of this._children) {
			if (child.getText) {
				return child.getText();
			}
		}

		return null;
	}

	findTag(tag) {
		if (this._tag === tag) {
			return this;
		}

		for (const child of this._children) {
			const found = child.findTag(tag);
			if (found) {
				return found;
			}
		}

		return null;
	}

	search(path, currentPath = '') {
		let matches = [];
		currentPath += `/${this._tag}`;

		if (path.startsWith('/') && currentPath === path) {
			matches.push(this);
			return matches;
		}

		if (!path.startsWith('/') && currentPath.includes(path)) {
			matches.push(this);
			return matches;
		}

		for (const child of this._children) {
			if (child.search) {
				matches = matches.concat(child.search(path, currentPath));
			}
		}

		return matches;
	}

	searchOne(path, currentPath = '') {
		let matches = [];
		currentPath += `/${this._tag}`;

		if (path.startsWith('/') && currentPath === path) {
			matches.push(this);
			return matches;
		}

		if (!path.startsWith('/') && currentPath.includes(path)) {
			matches.push(this);
			return matches;
		}

		for (const child of this._children) {
			if (child.searchOne) {
				const match = child.searchOne(path, currentPath);
				if (match.length > 0) {
					matches = matches.concat(match);
					break;
				}
			}
		}

		return matches;
	}
}

export class XMLParser {
	constructor(xml = '') {
		this.xml = xml;
		this.tokens = [];
	}

	tokenize() {
		const regex = /<[^>]+>|[^<]+/g;
		this.tokens = this.xml.match(regex).map((token) => token.trim()).filter((token) => token.length > 0);

		return this;
	}

	_getTokenTag(token) {
		const regex = /<\/?([^> ]+)[^>]*>/;
		const match = token.match(regex);

		if (match) {
			return match[1];
		}

		return null;
	}

	parse() {
		let stack = [];
		let root = null;

		for (let token of this.tokens) {
			let match = token.match(/<!\[CDATA\[([^>]+)\]\]>/);
			if (match) {
				token = match[1];
			}

			if (token.startsWith('</')) {
				stack.pop();
			} else if (token.startsWith('<')) {
				let node = new ParentNode(this._getTokenTag(token));
				if (token.includes('description')) {
				}

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
				parent.addChild(new TextNode(token.trim()))
			}
		}

		return root;
	}
}
