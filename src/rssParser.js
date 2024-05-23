export class RSSFeed {
	constructor(title = 'No Title', link = 'No Link', description = 'No Description', entries = []) {
		this.title = title;
		this.link = link;
		this.description = description;
		this.entries = entries;
	}

	syncReadEntries(readTitles) {
		for (let entry of this.entries) {
			if (readTitles.includes(entry.title)) {
				entry.read = true;
			}
		}
	}

	getRead() {
		return this.entries.filter(entry => entry.read);
	}
	getUnread() {
		return this.entries.filter(entry => !entry.read);
	}

	sortEntries(predicate, readFirst = false) {
		if (readFirst) {
			return [
				...this.getRead().sort(predicate),
				...this.getUnread().sort(predicate),
			]
		}

		return [
			...this.getUnread().sort(predicate),
			...this.getRead().sort(predicate),
		]
	}

	byDateAsc(entryA, entryB) {
		const dateA = new Date(entryA.pubDate);
		const dateB = new Date(entryB.pubDate);

		return dateA - dateB;
	}
	byDateDesc(entryA, entryB) {
		const dateA = new Date(entryA.pubDate);
		const dateB = new Date(entryB.pubDate);

		return dateB - dateA;
	}

	byTitleAsc(entryA, entryB) {
		if (entryA.title > entryB.title) return 1;
		if (entryA.title < entryB.title) return -1;
	}
	byTitleDesc(entryA, entryB) {
		if (entryA.title > entryB.title) return -1;
		if (entryA.title < entryB.title) return 1;
	}
}

export class RSSEntry {
	constructor(title = 'No Title', link = 'No Link', description = 'No Description', pubDate = 'No PubDate') {
		this.title = title;
		this.link = link;
		this.description = description;
		this.pubDate = pubDate;
		this.read = false;
	}
}


export class RSSParser {
	constructor(xmlRoot) {
		this.root = xmlRoot
	}

	parse() {
		const entries = this._parseEntries()
		return new RSSFeed(
			this._parseFeedTitle(),
			this._parseFeedLink(),
			this._parseFeedDescription(),
			entries,
		)
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

	_parseFeedTitle() {
		const paths = ['channel/title'];
		const fallback = 'No Feed Title';

		return this._parsePaths(this.root, paths, fallback);
	}

	_parseFeedDescription() {
		const paths = ['channel/description'];
		const fallback = 'No Feed Description';

		return this._parsePaths(this.root, paths, fallback);
	}

	_parseFeedLink() {
		const paths = ['channel/link'];
		const fallback = 'No Feed Link';

		return this._parsePaths(this.root, paths, fallback);
	}
}

