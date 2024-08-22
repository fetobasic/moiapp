/* eslint-disable eqeqeq */

/**
 * @param {number} num
 * @returns {Array<number>}
 * */
export const numberToBigEndianBytes = (num: number) => {
  const dataView = new DataView(new ArrayBuffer(4));
  dataView.setUint32(0, num, false); // byteOffset = 0; litteEndian = false
  return [dataView.getUint8(0), dataView.getUint8(1), dataView.getUint8(2), dataView.getUint8(3)];
};

/**
 * @param {ArrayBuffer|Array<number>|Uint8Array} bytes
 * @returns {number}
 * */
export const bigEndianBytesToNumber = (bytes: Uint8Array | number[]) => {
  if (!(bytes instanceof Uint8Array)) {
    bytes = new Uint8Array(bytes);
  }
  return new Uint32Array(bytes.slice().reverse().buffer)[0];
};

/**
 * @see https://github.com/google/closure-library/blob/master/closure/goog/crypt/crypt.js#L117
 * @param {string} str
 * @returns {Array<number>}
 * */
export const stringToUtf8ByteArray = (str: string) => {
  const out = [];
  let p = 0;

  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);

    if (c < 128) {
      out[p++] = c;
    } else if (c < 2048) {
      out[p++] = (c >> 6) | 192;
      out[p++] = (c & 63) | 128;
    } else if ((c & 0xfc00) == 0xd800 && i + 1 < str.length && (str.charCodeAt(i + 1) & 0xfc00) == 0xdc00) {
      // Surrogate Pair
      c = 0x10000 + ((c & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
      out[p++] = (c >> 18) | 240;
      out[p++] = ((c >> 12) & 63) | 128;
      out[p++] = ((c >> 6) & 63) | 128;
      out[p++] = (c & 63) | 128;
    } else {
      out[p++] = (c >> 12) | 224;
      out[p++] = ((c >> 6) & 63) | 128;
      out[p++] = (c & 63) | 128;
    }
  }

  return out;
};

/**
 * @see https://github.com/google/closure-library/blob/master/closure/goog/crypt/crypt.js#L151
 * @param {ArrayBuffer|Array<number>|Uint8Array} str
 * @returns {string}
 * */
export const utf8ByteArrayToString = (bytes: Uint8Array) => {
  if (!(bytes instanceof Uint8Array)) {
    bytes = new Uint8Array(bytes);
  }

  const out = [];
  let pos = 0;
  let c = 0;

  while (pos < bytes.length) {
    const c1 = bytes[pos++];
    if (c1 < 128) {
      out[c++] = String.fromCharCode(c1);
    } else if (c1 > 191 && c1 < 224) {
      const c2 = bytes[pos++];
      out[c++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
    } else if (c1 > 239 && c1 < 365) {
      // Surrogate Pair
      const c2 = bytes[pos++];
      const c3 = bytes[pos++];
      const c4 = bytes[pos++];
      const u = (((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) - 0x10000;
      out[c++] = String.fromCharCode(0xd800 + (u >> 10));
      out[c++] = String.fromCharCode(0xdc00 + (u & 1023));
    } else {
      const c2 = bytes[pos++];
      const c3 = bytes[pos++];
      out[c++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
    }
  }

  return out.join('');
};
