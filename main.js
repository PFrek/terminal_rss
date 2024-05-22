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
	const feedURL = 'https://apnews.com/index.rss';

	const body = await fetchFeed(feedURL);

	const root = new XMLParser().tokenize(body).parse();

	console.log(root.toString());
}


main();
