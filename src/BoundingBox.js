export default class BoundingBox {
  #imageDimensions;
  constructor(box, imageDimensions) {
      if(!box) throw new Error('Bounding box not set');
      if(!(imageDimensions?.width || imageDimensions?.height)) throw new Error('Image dimensions not set');
      
      this.#imageDimensions = [imageDimensions.width, imageDimensions.height];

      this.centerPerX = box[0];
      this.centerPerY = box[1];
      this.perWidth = box[2];
      this.perHeight = box[3];
      this.pixelCoords = this.#toPixelCoords();
  }
  #toPixelCoords() {
      const [imgWidth, imgHeight] = this.#imageDimensions;

      const width = this.perWidth * imgWidth;
      const height = this.perHeight * imgHeight;

      const x = (this.centerPerX * imgWidth) - (width / 2);
      const y = (this.centerPerY * imgHeight) - (height / 2);

      return {
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height)
      };
  }
}