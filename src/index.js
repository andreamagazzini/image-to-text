import { readFile } from 'node:fs/promises';
import { fileTypeFromBuffer } from 'file-type';
import { imageDimensionsFromData } from 'image-dimensions';

import LensCore from './LensCore.js';
import BoundingBox from './BoundingBox.js'
import LensError from './LensError.js';
import LensResult from './LensResult.js';
import Segment from './Segment.js';
import { MIME_TO_EXT, SUPPORTED_MIMES } from './consts.js';

export { LensResult, LensError, Segment, BoundingBox };

export default class Lens extends LensCore {
    constructor(config = {}) {
        if (typeof config !== 'object') {
            console.warn('Lens constructor expects an object, got', typeof config);
            config = {};
        }
        super(config);
    }

    async scanByFile(path) {
        const file = await readFile(path);

        return this.scanByBuffer(file);
    }

    async scanByURL(url) {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();

        return this.scanByBuffer(Buffer.from(buffer));
    }

    async scanByBuffer(buffer) {
        const fileType = await fileTypeFromBuffer(buffer);

        if (!fileType) throw new Error('File type not supported');

        let uint8Array = Uint8Array.from(buffer);

        return this.scanByData(uint8Array, fileType.mime);
    }

    async scanByData(uint8, mime) {
        if (!SUPPORTED_MIMES.includes(mime)) {
            throw new Error('File type not supported');
        }
        
        const dimensions = imageDimensionsFromData(uint8);
        if (!dimensions) {
            throw new Error('Could not determine image dimensions');
        }

        let { width, height } = dimensions;

        // Google Lens does not accept images larger than 1000x1000
        if (width > 1000 || height > 1000) {
            throw new Error('Wrong image dimensions. Max allowed 1000x1000')
        }

        let fileName = `image.${MIME_TO_EXT[mime]}`;

        const file = new File([uint8], fileName, { type: mime });
        const formdata = new FormData();

        formdata.append('encoded_image', file);
        formdata.append('original_width', '' + width);
        formdata.append('original_height', '' + height);
        formdata.append('processed_image_dimensions', `${width},${height}`);

        return this.analyzeImage(formdata, { width, height });
    }
}
