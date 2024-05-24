export default class LensError extends Error {
  constructor(message, code, headers, body) {
      super(message);
      this.name = 'LensError';
      this.code = code;
      this.headers = headers;
      this.body = body;
  }
}