import { test, expect } from '@jest/globals';
import { TextNode, ParentNode, XMLParser } from '../src/xmlParser.js';


test('TextNode to string', () => {
	const leaf = new TextNode('This is the title')

	const str = leaf.toString();

	expect(str).toEqual('This is the title')
})

test('TextNode must have text', () => {
	expect(() => {
		const leaf = new TextNode(null);
	}).toThrow();

	expect(() => {
		const leaf = new TextNode(undefined);
	}).toThrow();

	expect(() => {
		const leaf = new TextNode('');
	}).toThrow();

	expect(() => {
		const leaf = new TextNode('text');
		leaf.setText(null);
	}).toThrow();
})

test('ParentNode to string', () => {
	const parent = new ParentNode('root');

	parent.addChild(new ParentNode('parent1', [new TextNode('The first text node')]));
	parent.addChild(new ParentNode('parent2', [new TextNode('The second text node')]));
	parent.addChild(new ParentNode('parent3', [
		new ParentNode('innerParent', [
			new TextNode('The third text node')
		])
	]));

	const str = parent.toString();

	expect(str).toEqual(`<root>\
<parent1>The first text node</parent1>\
<parent2>The second text node</parent2>\
<parent3>\
<innerParent>The third text node</innerParent>\
</parent3>\
</root>`)
})

test('ParentNode can search an absolute path', () => {
	const parent = new ParentNode('root', [
		new ParentNode('books', [
			new ParentNode('entry', [new TextNode('Book A')]),
			new ParentNode('entry', [new TextNode('Book B')]),
			new ParentNode('entry', [new TextNode('Book C')]),
		]),
		new ParentNode('magazines', [
			new ParentNode('entry', [new TextNode('Magazine A')]),
			new ParentNode('entry', [new TextNode('Magazine B')]),
		])
	]);

	const matches = parent.search('/root/books/entry');

	expect(matches).toEqual([
		new ParentNode('entry', [new TextNode('Book A')]),
		new ParentNode('entry', [new TextNode('Book B')]),
		new ParentNode('entry', [new TextNode('Book C')]),
	]);
})

test('ParentNode can search a relative path', () => {
	const parent = new ParentNode('root', [
		new ParentNode('books', [
			new ParentNode('entry', [new TextNode('Book A')]),
			new ParentNode('entry', [new TextNode('Book B')]),
			new ParentNode('entry', [new TextNode('Book C')]),
		]),
		new ParentNode('magazines', [
			new ParentNode('entry', [new TextNode('Magazine A')]),
			new ParentNode('entry', [new TextNode('Magazine B')]),
		])
	]);

	let matches = parent.search('entry');

	expect(matches).toEqual([
		new ParentNode('entry', [new TextNode('Book A')]),
		new ParentNode('entry', [new TextNode('Book B')]),
		new ParentNode('entry', [new TextNode('Book C')]),
		new ParentNode('entry', [new TextNode('Magazine A')]),
		new ParentNode('entry', [new TextNode('Magazine B')]),
	]);

	matches = parent.search('books/entry');

	expect(matches).toEqual([
		new ParentNode('entry', [new TextNode('Book A')]),
		new ParentNode('entry', [new TextNode('Book B')]),
		new ParentNode('entry', [new TextNode('Book C')]),
	]);

	matches = parent.search('magazines/entry');

	expect(matches).toEqual([
		new ParentNode('entry', [new TextNode('Magazine A')]),
		new ParentNode('entry', [new TextNode('Magazine B')]),
	]);

	matches = parent.search('videos/entry');

	expect(matches).toEqual([]);
})

test('XMLParser tokenizes correctly', () => {
	const parser = new XMLParser();

	parser.tokenize('<item><title>This is the title</title><desc>Description</desc></item>')

	expect(parser.tokens).toEqual(['<item>', '<title>', 'This is the title', '</title>', '<desc>', 'Description', '</desc>', '</item>']);
})

test('XMLParser can extract tag from token', () => {
	const parser = new XMLParser();

	const tags = [];
	tags.push(parser._getTokenTag('<item>'));
	tags.push(parser._getTokenTag('</closing>'));
	tags.push(parser._getTokenTag('No tag'));

	expect(tags).toEqual([
		'item',
		'closing',
		null
	])
})

test('XMLParser can parse XML', () => {
	const parser = new XMLParser();
	const xml = `\
<rss>\
<title>RSS feed example</title>\
<item>\
<title>First item</title>\
<desc>First item's description</desc>\
</item>\
<item>\
<title>Second item</title>\
<desc>Second item's description</desc>\
</item>\
<item>\
<title>Third item</title>\
<desc>Third item's description</desc>\
</item>\
</rss>`;

	const root = parser.tokenize(xml).parse();

	expect(root.toString()).toEqual(xml)

});

