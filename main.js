import * as fs from 'node:fs/promises';
import { XMLParser } from "./src/xmlParser.js";
import { RSSFeed, RSSParser } from './src/rssParser.js';


async function update(feed) {
	try {
		console.clear();
		console.log()
		await feed.fetch('https://apnews.com/index.rss');
		feed.saveToFile('feeds/ap.json');

		feed.print(feed.getUnread());
	} catch (err) {
		console.log(`Failed update cycle: ${err.message}`)
	}
}

async function main() {

	const feed = new RSSFeed();
	feed.readFromFile('feeds/ap.json');

	setInterval(update, 5000, feed);

}


main();
