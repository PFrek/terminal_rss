import { RSSFeed } from './src/rssParser.js';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { getLinksFromHTML, getPageHTML, getRSSLink } from './src/crawl.js';

const EXIT_SIGN = true;
const CONTINUE_SIGN = false;

async function update(feedObj) {
	try {
		console.log(`New Fetch: ${new Date().toUTCString()}`)
		const status = await feedObj.feed.fetch(feedObj.url);
		if (status >= 400 || feedObj.feed.entries.length === 0) {
			feedObj.feed.print();
			throw new Error('Failed to acquire entries');
		}

		feedObj.feed.saveToFile(feedObj.filename);

		feedObj.feed.sortEntries(feedObj.feed.byDateAsc);
		feedObj.feed.print();

		console.log(`Response Status: ${status}`)
		return CONTINUE_SIGN;
	} catch (err) {
		console.log(`Failed update cycle: ${err.message}`)
		return EXIT_SIGN;
	}
}

function urlToFilename(url) {
	let urlStr = url.hostname + url.pathname;
	urlStr = urlStr.replaceAll(/\./g, '_');
	urlStr = urlStr.replaceAll(/[\/\\]/g, '-');

	return 'feeds/' + urlStr + '.json';
}

async function runCommand(command, feedObj) {
	const parts = command.split('-').map(part => part.trim()).filter(part => part.length > 0);
	if (parts.length === 0) {
		console.log(`Failed to parse command`);
		return CONTINUE_SIGN;
	}
	const keyword = parts[0];
	let value = null;
	if (parts.length > 1) {
		value = parts[1];
	}
	switch (keyword) {
		case 'help':
			console.log(`exit: Close the application
help: Display this help menu
update: Update the RSS Feed
read-[#]: Set the entry [#] as read
read-all: Set all entries as read
unread-[#]: Set the entry [#] as unread
unread-all: Set all entries as unread
hide: Hide all entries marked as read
show: Show read entries`)
			break;

		case 'update':
			return await update(feedObj);

		case 'read':
			if (value === 'all') {
				for (let entry of feedObj.feed.entries) {
					entry.read = true;
				}
			} else {
				const index = Number.parseInt(value, 10);
				if (index < 0 || index > feedObj.feed.entries.length) {
					console.log(`Invalid entry index ${index}`)
					break;
				}
				feedObj.feed.entries[index].read = true;
			}

			feedObj.feed.print();

			break;

		case 'unread':
			if (value === 'all') {
				for (let entry of feedObj.feed.entries) {
					entry.read = false;
				}
			} else {
				const index = Number.parseInt(value, 10);
				if (index < 0 || index > feedObj.feed.entries.length) {
					console.log(`Invalid entry index ${index}`)
					break;
				}
				feedObj.feed.entries[index].read = false;
			}

			feedObj.feed.print();

			break;

		case 'hide':
			feedObj.feed.hideRead = true;
			feedObj.feed.print();
			break;

		case 'show':
			feedObj.feed.hideRead = false;
			feedObj.feed.print();
			break;

		case 'exit':
			console.log('Exiting application');
			return EXIT_SIGN;
		default:
			console.log('Invalid command. Enter help to see the available commands');
			break;
	}

	return CONTINUE_SIGN;
}

async function main() {
	const args = process.argv;

	if (args.length != 3) {
		console.log(`Usage: main.js [RSS Feed URL]`);
		return;
	}

	let url = null;
	try {
		url = args[2];
	} catch (err) {
		console.log(`Failed to fetch feed: ${err.message}`);
		return;
	}

	// Try to get an rss feed link from the url
	console.log(`Looking for an RSS link in ${url}`);
	let feedURL = url;
	const html = await getPageHTML(url);
	if (html) {
		const links = getLinksFromHTML(html);
		const newUrl = getRSSLink(links, url);
		if (newUrl) {
			console.log(`Found RSS Feed: ${newUrl}`);
			feedURL = newUrl;
		}
	}

	console.log(`Reading feed from ${feedURL}`)

	const feedObj = {
		url: feedURL,
		filename: urlToFilename(new URL(feedURL)),
		feed: new RSSFeed(),
	};

	await feedObj.feed.readFromFile(feedObj.filename);


	let exit = await update(feedObj);

	const rl = readline.createInterface({ input, output })
	while (!exit) {
		let command = '';
		try {
			command = await rl.question('Command (\'exit\', \'help\', etc) > ');
			command = command.trim();
		} catch (err) {
			console.error(`Failed to read command: ${err.message}`);
		}
		exit = await runCommand(command, feedObj);
	}
	rl.close();

	if (feedObj.feed.entries.length > 0) {
		feedObj.feed.saveToFile(feedObj.filename);
	}
}


main();
