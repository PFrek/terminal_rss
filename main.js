import { RSSFeed } from './src/rssParser.js';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';


async function update(feed, url, filename) {
	try {
		console.log(`New Fetch: ${new Date().toUTCString()}`)
		const status = await feed.fetch(url);
		feed.saveToFile(filename);

		feed.print();

		console.log(`Response Status: ${status}`)
	} catch (err) {
		console.log(`Failed update cycle: ${err.message}`)
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
		return false;
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
unread-[#]: Set the entry [#] as unread`)
			break;

		case 'update':
			await update(feedObj.feed, feedObj.url, feedObj.filename);
			break;

		case 'read':
			{
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
			{
				const index = Number.parseInt(value, 10);
				if (index < 0 || index > feedObj.feed.entries.length) {
					console.log(`Invalid entry index ${index}`)
					break;
				}
				feedObj.feed.entries[index].read = false;
			}

			feedObj.feed.print();

			break;

		case 'exit':
			console.log('Exiting application');
			return true;
		default:
			console.log('Invalid command. Enter help to see the available commands');
			break;
	}

	return false;
}

async function main() {
	const args = process.argv;

	if (args.length != 3) {
		console.log(`Usage: main.js [RSS Feed URL]`);
		return;
	}

	let url = null;
	try {
		url = new URL(args[2]);
	} catch (err) {
		console.log(`Failed to fetch feed: ${err.message}`);
		return;
	}

	console.log(`Reading feed from ${url}`)

	const feedObj = {
		url,
		filename: urlToFilename(url),
		feed: new RSSFeed(),
	};

	await feedObj.feed.readFromFile(feedObj.filename);

	await update(feedObj.feed, feedObj.url, feedObj.filename);

	const rl = readline.createInterface({ input, output })
	let exit = false;
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

	feedObj.feed.saveToFile(feedObj.filename);
}


main();
