import {
  isYeti300500700,
  isYeti20004000,
  isYeti4000,
  isYeti2000,
  isYeti10001500,
  parseModelFromHostId,
  parseSKUFromHostId,
  SKU_MODEL_MAP,
} from 'App/Services/ThingHelper';

describe('ThingHelper', () => {
  describe('parseSKUFromHostId', () => {
    test('should return the SKU when hostId matches the expected pattern', () => {
      const result = parseSKUFromHostId('H-123-A1');

      expect(result).toBe('123');
    });

    test('should return an empty string for an empty hostId', () => {
      const result = parseSKUFromHostId('');

      expect(result).toBe('');
    });
  });

  describe('parseModelFromHostId', () => {
    test('should return the model when hostId maps to a model in SKU_MODEL_MAP', () => {
      const result = parseModelFromHostId('H-37500-A1');

      expect(result).toBe(SKU_MODEL_MAP['37500']);
    });

    test('should return an empty string for a hostId that does not map to a model', () => {
      const result = parseModelFromHostId('');

      expect(result).toBe('');
    });
  });

  describe('isYeti300500700', () => {
    test('should return true for a valid Yeti 300/500/700 model', () => {
      const device = { device: { identity: { hostId: 'H-37100-A1' } } };
      const result = isYeti300500700(device);

      expect(result).toBeTruthy();
    });

    test('should return false for a device with an invalid model', () => {
      const device = { device: { identity: { hostId: 'InvalidHostId' } } };
      const result = isYeti300500700(device);

      expect(result).toBeFalsy();
    });
  });

  describe('isYeti20004000', () => {
    test('should return true for a valid Yeti 2000/4000 model', () => {
      const device = { device: { identity: { hostId: 'H-37500-A1' } } };
      const result = isYeti20004000(device);

      expect(result).toBeTruthy();
    });

    test('should return false for a device with an invalid model', () => {
      const device = { device: { identity: { hostId: 'InvalidHostId' } } };
      const result = isYeti20004000(device);

      expect(result).toBeFalsy();
    });
  });

  describe('isYeti4000', () => {
    test('should return true for a valid Yeti 4000 model', () => {
      const device = { device: { identity: { hostId: 'H-37500-A1' } } };
      const result = isYeti4000(device);

      expect(result).toBeTruthy();
    });

    test('should return false for a device with an invalid model', () => {
      const device = { device: { identity: { hostId: 'InvalidHostId' } } };
      const result = isYeti4000(device);

      expect(result).toBeFalsy();
    });
  });

  describe('isYeti2000', () => {
    test('should return true for a valid Yeti 2000 model', () => {
      const device = { device: { identity: { hostId: 'H-37400-A1' } } };
      const result = isYeti2000(device);

      expect(result).toBeTruthy();
    });

    test('should return false for a device with an invalid model', () => {
      const device = { device: { identity: { hostId: 'InvalidHostId' } } };
      const result = isYeti2000(device);

      expect(result).toBeFalsy();
    });
  });

  describe('isYeti10001500', () => {
    test('should return true for a valid Yeti 1000/1500 model', () => {
      const device = { device: { identity: { hostId: 'H-37200-A1' } } };
      const result = isYeti10001500(device);

      expect(result).toBeTruthy();
    });

    test('should return false for a device with an invalid model', () => {
      const device = { device: { identity: { hostId: 'InvalidHostId' } } };
      const result = isYeti10001500(device);

      expect(result).toBeFalsy();
    });
  });
});
