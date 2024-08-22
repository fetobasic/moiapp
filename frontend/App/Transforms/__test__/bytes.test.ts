import {
  bigEndianBytesToNumber,
  numberToBigEndianBytes,
  stringToUtf8ByteArray,
  utf8ByteArrayToString,
} from 'App/Transforms/bytes';

describe('Transform bytes', () => {
  describe('numberToBigEndianBytes', () => {
    test('should convert a number to big-endian bytes correctly', () => {
      const result = numberToBigEndianBytes(16909060);

      expect(result).toEqual([1, 2, 3, 4]);
    });

    test('should handle a number with leading zeros correctly', () => {
      const result = numberToBigEndianBytes(255);

      expect(result).toEqual([0, 0, 0, 255]);
    });
  });

  describe('bigEndianBytesToNumber', () => {
    test('should convert big-endian bytes to a number correctly', () => {
      const result = bigEndianBytesToNumber([1, 2, 3, 4]);

      expect(result).toBe(16909060);
    });

    test('should handle bytes with leading zeros correctly', () => {
      const result = bigEndianBytesToNumber([0, 0, 0, 255]);

      expect(result).toBe(255);
    });
  });

  describe('stringToUtf8ByteArray', () => {
    test('should convert a string to a UTF-8 byte array correctly', () => {
      const result = stringToUtf8ByteArray('Test string');

      expect(result).toEqual([84, 101, 115, 116, 32, 115, 116, 114, 105, 110, 103]);
    });

    test('should not apply the condition for non-surrogate pair characters', () => {
      const result = stringToUtf8ByteArray('😀');

      expect(result).toEqual([240, 159, 152, 128]);
    });

    test('should handle a character less than 2048 correctly', () => {
      const result = stringToUtf8ByteArray('é');

      expect(result).toEqual([195, 169]);
    });

    test('should handle another non-surrogate character correctly', () => {
      const result = stringToUtf8ByteArray('€');

      expect(result).toEqual([226, 130, 172]);
    });
  });

  describe('utf8ByteArrayToString', () => {
    test('should handle non-ASCII characters correctly', () => {
      const byteArray = new Uint8Array([72, 195, 169, 108, 108, 111, 44, 32, 87, 195, 182, 114, 108, 100, 33]);
      const result = utf8ByteArrayToString(byteArray);

      expect(result).toBe('Héllo, Wörld!');
    });

    test('should handle an empty input', () => {
      const result = utf8ByteArrayToString(undefined);

      expect(result).toBe('');
    });
  });

  test('should handle a surrogate pair correctly', () => {
    const byteArray = new Uint8Array([240, 159, 152, 128]);
    const result = utf8ByteArrayToString(byteArray);

    expect(result).toBe('😀');
  });

  test('should handle a character not covered by previous conditions', () => {
    const byteArray = new Uint8Array([226, 130, 172]);
    const result = utf8ByteArrayToString(byteArray);

    expect(result).toBe('€');
  });
});
