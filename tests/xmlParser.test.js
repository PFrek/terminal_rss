import { test, expect } from '@jest/globals';
import { LeafNode, ParentNode } from '../src/xmlParser';


test('LeafNode to string', () => {
	const leaf = new LeafNode('title', 'This is the title')

	const str = leaf.toString();

	expect(str).toEqual('<title>This is the title</title>')
})

test('ParentNode to string', () => {
	const parent = new ParentNode('parent1');

	parent.addChild(new LeafNode('leaf1', 'The first leaf child'))
	parent.addChild(new ParentNode('parent2', [new LeafNode('leaf2', 'A nested leaf child')]))
	parent.addChild(new LeafNode('leaf3', 'The third leaf child'))
	parent.addChild(new LeafNode('leaf4', 'The fourth leaf child'))

	const str = parent.toString();

	expect(str).toEqual('<parent1><leaf1>The first leaf child</leaf1><parent2><leaf2>A nested leaf child</leaf2></parent2><leaf3>The third leaf child</leaf3><leaf4>The fourth leaf child</leaf4></parent1>')
})

test('XMLNode must have tag', () => {
	expect(() => {
		const leaf = new LeafNode(null, 'My tag is null');
	}).toThrow();

	expect(() => {
		const leaf = new LeafNode(undefined, 'My tag is undefined');
	}).toThrow();

	expect(() => {
		const leaf = new LeafNode('', 'My tag is empty');
	}).toThrow();

	expect(() => {
		const leaf = new LeafNode('tag', 'I have a tag');
		leaf.setTag(null);
	}).toThrow();
})

test('LeafNode must have text', () => {
	expect(() => {
		const leaf = new LeafNode('text_null', null);
	}).toThrow();

	expect(() => {
		const leaf = new LeafNode('text_undefined', undefined);
	}).toThrow();

	expect(() => {
		const leaf = new LeafNode('text_empty', '');
	}).toThrow();

	expect(() => {
		const leaf = new LeafNode('with_text', 'text');
		leaf.setText(null);
	}).toThrow();
})

