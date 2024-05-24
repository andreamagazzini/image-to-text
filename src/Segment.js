import BoundingBox from "./BoundingBox.js";

export default class Segment {
  constructor(text, boundingBox, imageDimensions) {
      this.text = text;
      this.boundingBox = new BoundingBox(boundingBox, imageDimensions);
  }
}