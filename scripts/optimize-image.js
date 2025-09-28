import { writeFile, readFile } from 'fs/promises';
import { ImagePool } from '@squoosh/lib';
import { cpus } from 'os';
import { existsSync } from 'fs';

export async function optimizeImage(img) {
	if (!existsSync(img)) {
		return;
	}

	const imagePool = new ImagePool(cpus().length);
	const file = await readFile(img);
	const image = imagePool.ingestImage(file);
	await image.encode({
		mozjpeg: {
			quality: 100,
		},
		webp: {
			quality: 100,
		},
	});

	if (!img.endsWith('.webp')) {
		const mozjpeg = await image.encodedWith.mozjpeg;
		await writeFile(img, mozjpeg.binary);
	}

	const webp = await image.encodedWith.webp;
	await writeFile(img.replace(/\.(png|jpg|jpeg|jpeg)$/, '.webp'), webp.binary);

	await imagePool.close();
}
