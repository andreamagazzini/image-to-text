import clipboardy from 'clipboardy';
import { fileTypeFromBuffer } from 'file-type';
import { readFile } from 'node:fs/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import Lens from './src/index.js';
import { sleep } from './src/utils.js';

try {
    // get file path from command line
    const args = process.argv.slice(2);
    const filePath = args[0];

    // get path to cookies file (should be in the same directory as this script)
    const moduleUrl = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(moduleUrl);
    const pathToCookies = path.join(__dirname, 'cookies.json');

    // read cookies from file
    let cookies;
    if (fs.existsSync(pathToCookies)) {
        cookies = JSON.parse(fs.readFileSync(pathToCookies, 'utf8'));
    }

    // create lens instance
    const lens = new Lens({
        headers: {
            cookie: cookies
        }
    });

    // scan file
    const file = await readFile(filePath);
    const fileType = await fileTypeFromBuffer(file);

    if (!fileType) throw new Error('File type not supported');

    let uint8Array = Uint8Array.from(file);

    const text = await lens.scanByData(uint8Array, fileType.mime);

    // write cookies to file
    fs.writeFileSync(pathToCookies, JSON.stringify(lens.cookies, null, 4));

    // write text to clipboard
    clipboardy.writeSync(text.segments.map(s => s.text).join('\n'));
    console.log(text)
} catch (e) {
    console.error('Error occurred:');
    console.error(e);
    await sleep(30000);
}
