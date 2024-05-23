import * as fs from 'node:fs/promises';
import { XMLParser } from "./src/xmlParser.js";
import { RSSParser } from './src/rssParser.js';

async function fetchFeed(url, lastFetch) {
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/rss+xml',
			'If-Modified-Since': lastFetch,
		}
	});

	const body = await response.text();

	return body;
}

async function main() {
	// const feedURL = 'https://apnews.com/index.rss';
	//
	// const body = await fetchFeed(feedURL);

	let xml = null;
	try {
		xml = await fs.readFile('./ap.xml', { encoding: 'utf8' });
	} catch (err) {
		console.error(err);
	}

	const body = xml;

	const root = new XMLParser().tokenize(body).parse();

	const feed = new RSSParser(root).parse();

	const readEntries = [
		'German far-right party bans its top European election candidate from campaigning after Nazi remark',
		'Former UMA presidential candidate has been paid more than $370K under settlement',
	];

	feed.syncReadEntries(readEntries);

	console.log(feed.sortEntries(feed.byDateAsc, false));
}


main();
