import { mkdirSync, writeFileSync } from 'fs';

const slugify = (string) => {
	const a = 'àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœøṕŕßśșțùúüûǘẃẍÿź·/_,:;';
	const b = 'aaaaaaaaceeeeghiiiimnnnooooooprssstuuuuuwxyz------';
	const p = new RegExp(a.split('').join('|'), 'g');

	return string
		.toString()
		.toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
		.replace(/&/g, '-and-') // Replace & with 'and'
		.replace(/[^\w-]+/g, '') // Remove all non-word characters
		.replace(/--+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, ''); // Trim - from end of text
};

function createBit(title) {
	let slug = slugify(title);
	let path = `./bits/${slug}`;

	mkdirSync(path);
	mkdirSync(`${path}/images`);
	writeFileSync(
		`${path}/index.md`,
		`---
title: ${title}
slug: ${slug}
date: ${new Date().toISOString().split('T')[0]}
tags: 
---

# ${title}
`,
	);
}

const [slug] = process.argv.slice(2);
createBit(slug);
