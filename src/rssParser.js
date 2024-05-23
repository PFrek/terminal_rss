export class RSSFeed {
	constructor() {
		this.title = 'No Title';
		this.link = 'No Link';
		this.description = 'No description';
		this.entry = [];
	}
}

export class RSSEntry {
	constructor(title = 'No Title', link = 'No Link', description = 'No Description', pubDate = 'No PubDate') {
		this.title = title;
		this.link = link;
		this.description = description;
		this.pubDate = pubDate;
	}
}


export class RSSParser {
	constructor(xmlRoot) {
		this.root = xmlRoot
	}

	_parsePaths(start, paths, fallback = 'No Data Found') {
		for (const path of paths) {
			const nodes = start.search(path);
			if (nodes.length > 0) {
				return nodes[0].getInnerText();
			}
		}

		return fallback;

	}

	_parseEntries() {
		const paths = ['channel/item'];

		for (const path of paths) {
			const nodes = this.root.search(path);
			if (nodes.length > 0) {
				return nodes.map((node) => {
					return new RSSEntry(
						this._parseEntryTitle(node),
						this._parseEntryLink(node),
						this._parseEntryDescription(node),
						this._parseEntryPubDate(node),
					);
				});
			}
		}

		return [];
	}

	_parseEntryTitle(entry) {
		const paths = ['title'];
		const fallback = 'No Entry Title';

		return this._parsePaths(entry, paths, fallback);
	}
	_parseEntryLink(entry) {
		const paths = ['link'];
		const fallback = 'No Entry Link';

		return this._parsePaths(entry, paths, fallback);
	}
	_parseEntryDescription(entry) {
		const paths = ['description'];
		const fallback = 'No Entry Description';

		return this._parsePaths(entry, paths, fallback);
	}
	_parseEntryPubDate(entry) {
		const paths = ['pubDate'];
		const fallback = 'No Entry PubDate';

		return this._parsePaths(entry, paths, fallback);
	}

	parseFeedTitle() {
		const paths = ['channel/title'];
		const fallback = 'No Feed Title';

		return this._parsePaths(this.root, paths, fallback);
	}

	parseFeedDescription() {
		const paths = ['channel/description'];
		const fallback = 'No Feed Description';

		return this._parsePaths(this.root, paths, fallback);
	}

	parseFeedLink() {
		const paths = ['channel/link'];
		const fallback = 'No Feed Link';

		return this._parsePaths(this.root, paths, fallback);
	}
}

