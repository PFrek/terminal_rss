import * as fs from "node:fs/promises";
import { XMLParser } from "./xmlParser.js";
import chalk from "chalk";
import stringLength from "string-length";
import stringWidth from 'string-width';

export class RSSFeed {
	constructor(title = 'No Title', link = 'No Link', description = 'No Description', entries = []) {
		this.title = title;
		this.link = link;
		this.description = description;
		this.entries = entries;
		this.lastFetch = null;

		this.hideRead = false;
	}

	async fetch(url) {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/rss+xml',
				'If-Modified-Since': this.lastFetch,
			}
		});

		if (response.status === 304) {
			return response.status;
		}

		if (response.status >= 400) {
			console.log(`Failed to fetch ${url} - ${response.status}`);
			return response.status;
		}

		const lastModified = response.headers['last-modified'];
		if (lastModified) {
			this.lastFetch = lastModified;
		} else {
			this.lastFetch = new Date().toUTCString();
		}

		const xml = await response.text();

		await fs.writeFile('log.xml', xml);

		const xmlTree = new XMLParser(xml).tokenize().parse();

		const newFeed = new RSSParser(xmlTree).parse();

		this.title = newFeed.title;
		this.link = newFeed.link;
		this.description = newFeed.description;

		for (const entry of this.getRead()) {
			const found = newFeed.entries.findIndex(elem => elem.title === entry.title);
			if (found > -1) {
				newFeed.entries[found].read = true;
			}
		}

		this.entries = newFeed.entries;

		return response.status;
	}

	async saveToFile(filepath) {
		const data = JSON.stringify({
			title: this.title,
			link: this.link,
			lastFetch: this.lastFetch,
			entries: this.entries,
		}, null, 2);

		try {
			await fs.writeFile(filepath, data);
		} catch (err) {
			console.log(`Failed to write to file ${filepath}: ${err}`);
		}
	}

	async readFromFile(filepath) {
		let data = null;
		try {
			data = await fs.readFile(filepath, { encoding: 'utf8' });
			data = JSON.parse(data);
		} catch (err) {
			console.log(`Failed to read data from file ${filepath}: ${err}`);
			return;
		}

		this.title = data.title;
		this.link = data.link;
		this.lastFetch = data.lastFetch;

		this.entries = [];
		for (const entry of data.entries) {
			this.entries.push(new RSSEntry(
				entry.title,
				entry.link,
				entry.description,
				entry.pubDate,
				entry.read,
			));
		}
	}

	_padToWidth(text, maxWidth) {
		const adjust = text.length - stringLength(text);
		return text.padEnd(maxWidth + adjust, ' ');

	}

	print() {
		console.log(`Feed: ${this.title}`);
		console.log(`${this.link}`);

		let entries = this.entries;
		if (this.hideRead) {
			entries = this.getUnread();
		}

		if (!entries || entries.length === 0) {
			console.log(chalk.red('[No entries found]'));
			return;
		}

		const maxWidth = process.stdout.columns;

		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i];
			let entryStr = '';
			if (!entry.read) {
				entryStr += chalk.yellow('*');
			}

			entryStr += `[${i}]`
			const titlePadding = stringWidth(entryStr) + 1;
			let titleLines = entry._splitTitle(maxWidth - titlePadding);
			entryStr += ` ${chalk.magenta.bold(titleLines[0])}\n`;
			for (let i = 1; i < titleLines.length; i++) {
				entryStr += ' '.repeat(titlePadding);
				entryStr += chalk.magenta.bold(titleLines[i]) + '\n';
			};

			let linkLine = ' '.repeat(titlePadding) + chalk.blue(entry.link);
			linkLine = this._padToWidth(linkLine, maxWidth);

			entryStr += chalk.bgGray(linkLine) + '\n';

			let descLines = entry._splitDescription(maxWidth - titlePadding);
			for (let line of descLines) {
				line = ' '.repeat(titlePadding) + line;
				line = line.padEnd(maxWidth, ' ');

				entryStr += chalk.bgGray(line) + '\n';
			}

			let pubDateLine = ' '.repeat(titlePadding) + chalk.blue(entry.pubDate);
			pubDateLine = this._padToWidth(pubDateLine, maxWidth);
			entryStr += chalk.bgGray(pubDateLine) + '\n';

			console.log(entryStr);
		}
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


	sortEntries(predicate, readFirst = null) {
		if (readFirst === null) {
			this.entries.sort(predicate);
			return;
		}

		if (readFirst) {
			this.entries = [
				...this.getRead().sort(predicate),
				...this.getUnread().sort(predicate),
			]
			return;
		}

		this.entries = [
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
	constructor(title = 'No Title', link = 'No Link', description = 'No Description', pubDate = 'No PubDate', read = false) {
		this.title = title;
		this.link = link;
		this.description = description;
		this.pubDate = pubDate;
		this.read = read;
	}

	_splitTitle(maxWidth) {
		return this._splitText(this.title, maxWidth);
	}

	_splitDescription(maxWidth) {
		return this._splitText(this.description, maxWidth);
	}

	_splitText(text, maxWidth) {
		const avgWidth = stringWidth(text) / stringLength(text);
		if (Math.round(avgWidth) > 1) {
			maxWidth = Math.floor(maxWidth / Math.round(avgWidth))
		}

		const validGaps = [' ', ',', '.', ';', '-'];
		let numLines = Math.ceil(stringLength(text) / maxWidth);

		let lines = [];
		let curOffset = 0;
		let accumulatedOffset = 0;
		for (let i = 0; i < numLines; i++) {
			let start = i * maxWidth - accumulatedOffset;
			curOffset = 0;
			let end = start + maxWidth;

			while (end !== text.length && !validGaps.includes(text[end - 1])) {
				curOffset++;
				end--;

				if (end === start) {
					end = start + maxWidth;
					curOffset = 0;
					break;
				}
			}

			accumulatedOffset += curOffset;
			lines.push(text.slice(start, end));
		}

		return lines;
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

	_parsePathsOne(start, paths, fallback = 'No Data Found') {
		for (const path of paths) {
			const nodes = start.searchOne(path);
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

		return this._parsePathsOne(entry, paths, fallback);
	}
	_parseEntryLink(entry) {
		const paths = ['link'];
		const fallback = 'No Entry Link';

		return this._parsePathsOne(entry, paths, fallback);
	}
	_parseEntryDescription(entry) {
		const paths = ['description'];
		const fallback = 'No Entry Description';

		return this._parsePathsOne(entry, paths, fallback);
	}
	_parseEntryPubDate(entry) {
		const paths = ['pubDate'];
		const fallback = 'No Entry PubDate';

		return this._parsePathsOne(entry, paths, fallback);
	}

	_parseFeedTitle() {
		const paths = ['channel/title'];
		const fallback = 'No Feed Title';

		return this._parsePathsOne(this.root, paths, fallback);
	}

	_parseFeedDescription() {
		const paths = ['channel/description'];
		const fallback = 'No Feed Description';

		return this._parsePathsOne(this.root, paths, fallback);
	}

	_parseFeedLink() {
		const paths = ['channel/link'];
		const fallback = 'No Feed Link';

		return this._parsePathsOne(this.root, paths, fallback);
	}
}

