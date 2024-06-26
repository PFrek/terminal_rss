import { test, expect } from '@jest/globals';
import { RSSParser, RSSEntry, RSSFeed } from '../src/rssParser';
import { ParentNode, TextNode } from '../src/xmlParser';

test('RSSParser can find the feeds title', () => {
	const xmlRoot = new ParentNode('root', [
		new ParentNode('channel', [
			new ParentNode('title', [
				new TextNode('This is the title')
			]),
			new ParentNode('description', [
				new TextNode('This is the description')
			])
		])
	]);

	const feedTitle = new RSSParser(xmlRoot)._parseFeedTitle();

	expect(feedTitle).toEqual('This is the title');
})

test('RSSParser returns fallback title when none found', () => {
	const xmlRoot = new ParentNode('root', [
		new ParentNode('channel', [
			new ParentNode('description', [
				new TextNode('This is the description')
			])
		])
	]);

	const feedTitle = new RSSParser(xmlRoot)._parseFeedTitle();

	expect(feedTitle).toEqual('No Feed Title');
})

test('RSSParser can find the feeds description', () => {
	const xmlRoot = new ParentNode('root', [
		new ParentNode('channel', [
			new ParentNode('title', [
				new TextNode('This is the title')
			]),
			new ParentNode('description', [
				new TextNode('This is the description')
			])
		])
	]);

	const feedDescription = new RSSParser(xmlRoot)._parseFeedDescription();

	expect(feedDescription).toEqual('This is the description');
})

test('RSSParser returns fallback description when none found', () => {
	const xmlRoot = new ParentNode('root', [
		new ParentNode('channel', [
			new ParentNode('title', [
				new TextNode('This is the title')
			]),
		])
	]);

	const feedDescription = new RSSParser(xmlRoot)._parseFeedDescription();

	expect(feedDescription).toEqual('No Feed Description');
})

test('RSSParser can find the feeds link', () => {
	const xmlRoot = new ParentNode('root', [
		new ParentNode('channel', [
			new ParentNode('title', [
				new TextNode('This is the title')
			]),
			new ParentNode('description', [
				new TextNode('This is the description')
			]),
			new ParentNode('link', [
				new TextNode('https://rss_link.com')
			]),
		])
	]);

	const feedLink = new RSSParser(xmlRoot)._parseFeedLink();

	expect(feedLink).toEqual('https://rss_link.com');
})

test('RSSParser returns fallback link when none found', () => {
	const xmlRoot = new ParentNode('root', [
		new ParentNode('channel', [
			new ParentNode('title', [
				new TextNode('This is the title')
			]),
		])
	]);

	const feedLink = new RSSParser(xmlRoot)._parseFeedLink();

	expect(feedLink).toEqual('No Feed Link');
})

test('RSSParser can parse entries', () => {
	const xmlRoot = new ParentNode('root', [
		new ParentNode('channel', [
			new ParentNode('title', [
				new TextNode('This is the title')
			]),
			new ParentNode('description', [
				new TextNode('This is the description')
			]),
			new ParentNode('link', [
				new TextNode('https://rss_link.com')
			]),
			new ParentNode('item', [
				new ParentNode('title', [new TextNode('First Entry')]),
				new ParentNode('link', [new TextNode('http://rss.com/first_entry')]),
				new ParentNode('description', [new TextNode('The first entry')]),
				new ParentNode('pubDate', [new TextNode('Wed, 22 May 2024 17:25:20 GMT')]),
			]),
			new ParentNode('item', [
				new ParentNode('title', [new TextNode('Second Entry')]),
				new ParentNode('link', [new TextNode('http://rss.com/second_entry')]),
				new ParentNode('description', [new TextNode('The second entry')]),
			]),
			new ParentNode('item', [
				new ParentNode('title', [new TextNode('Third Entry')]),
				new ParentNode('link', [new TextNode('http://rss.com/third_entry')]),
				new ParentNode('pubDate', [new TextNode('Wed, 23 May 2024 00:00:00 GMT')]),
			]),
			new ParentNode('item', [
				new ParentNode('title', [new TextNode('Fourth Entry')]),
				new ParentNode('description', [new TextNode('The fourth entry')]),
				new ParentNode('pubDate', [new TextNode('Wed, 23 May 2024 04:00:00 GMT')]),
			]),
			new ParentNode('item', [
				new ParentNode('link', [new TextNode('http://rss.com/fifth_entry')]),
				new ParentNode('description', [new TextNode('The fifth entry')]),
				new ParentNode('pubDate', [new TextNode('Wed, 23 May 2024 08:00:00 GMT')]),
			]),
		])
	]);

	const entries = new RSSParser(xmlRoot)._parseEntries();

	expect(entries).toHaveLength(5);

	expect(entries).toEqual([
		new RSSEntry('First Entry', 'http://rss.com/first_entry', 'The first entry', 'Wed, 22 May 2024 17:25:20 GMT'),
		new RSSEntry('Second Entry', 'http://rss.com/second_entry', 'The second entry', 'No Entry PubDate'),
		new RSSEntry('Third Entry', 'http://rss.com/third_entry', 'No Entry Description', 'Wed, 23 May 2024 00:00:00 GMT'),
		new RSSEntry('Fourth Entry', 'No Entry Link', 'The fourth entry', 'Wed, 23 May 2024 04:00:00 GMT'),
		new RSSEntry('No Entry Title', 'http://rss.com/fifth_entry', 'The fifth entry', 'Wed, 23 May 2024 08:00:00 GMT'),
	])
})

test('RSSParser can parse feed', () => {
	const xmlRoot = new ParentNode('root', [
		new ParentNode('channel', [
			new ParentNode('title', [
				new TextNode('This is the title')
			]),
			new ParentNode('description', [
				new TextNode('This is the description')
			]),
			new ParentNode('link', [
				new TextNode('https://rss_link.com')
			]),
			new ParentNode('item', [
				new ParentNode('title', [new TextNode('First Entry')]),
				new ParentNode('link', [new TextNode('http://rss.com/first_entry')]),
				new ParentNode('description', [new TextNode('The first entry')]),
				new ParentNode('pubDate', [new TextNode('Wed, 22 May 2024 17:25:20 GMT')]),
			]),
			new ParentNode('item', [
				new ParentNode('title', [new TextNode('Second Entry')]),
				new ParentNode('link', [new TextNode('http://rss.com/second_entry')]),
				new ParentNode('description', [new TextNode('The second entry')]),
			]),
			new ParentNode('item', [
				new ParentNode('title', [new TextNode('Third Entry')]),
				new ParentNode('link', [new TextNode('http://rss.com/third_entry')]),
				new ParentNode('pubDate', [new TextNode('Wed, 23 May 2024 00:00:00 GMT')]),
			]),
			new ParentNode('item', [
				new ParentNode('title', [new TextNode('Fourth Entry')]),
				new ParentNode('description', [new TextNode('The fourth entry')]),
				new ParentNode('pubDate', [new TextNode('Wed, 23 May 2024 04:00:00 GMT')]),
			]),
			new ParentNode('item', [
				new ParentNode('link', [new TextNode('http://rss.com/fifth_entry')]),
				new ParentNode('description', [new TextNode('The fifth entry')]),
				new ParentNode('pubDate', [new TextNode('Wed, 23 May 2024 08:00:00 GMT')]),
			]),
		])
	]);

	const feed = new RSSParser(xmlRoot).parse();

	expect(feed.entries).toHaveLength(5);

	expect(feed).toEqual(new RSSFeed(
		'This is the title',
		'https://rss_link.com',
		'This is the description',
		[
			new RSSEntry('First Entry', 'http://rss.com/first_entry', 'The first entry', 'Wed, 22 May 2024 17:25:20 GMT'),
			new RSSEntry('Second Entry', 'http://rss.com/second_entry', 'The second entry', 'No Entry PubDate'),
			new RSSEntry('Third Entry', 'http://rss.com/third_entry', 'No Entry Description', 'Wed, 23 May 2024 00:00:00 GMT'),
			new RSSEntry('Fourth Entry', 'No Entry Link', 'The fourth entry', 'Wed, 23 May 2024 04:00:00 GMT'),
			new RSSEntry('No Entry Title', 'http://rss.com/fifth_entry', 'The fifth entry', 'Wed, 23 May 2024 08:00:00 GMT'),
		]))
})

test('RSSEntry can split long descriptions', () => {
	const entry = new RSSEntry();
	entry.description = '12345678';

	let lines = entry._splitDescription(4);

	expect(lines).toEqual(['1234', '5678'])
})
