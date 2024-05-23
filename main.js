import * as fs from 'node:fs/promises';
import { XMLParser } from "./src/xmlParser.js";

async function fetchFeed(url) {
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/rss+xml',
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

	console.log(xml);

	const body = xml;

	const root = new XMLParser().tokenize(body).parse();

	const title = root.findTag('title');

	console.log(title.getTag());
	console.log(title.toString());
}


main();
