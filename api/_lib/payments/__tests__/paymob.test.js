const crypto = require('crypto');

jest.mock('../../firebaseAdmin', () => ({
  getDb: jest.fn(),
}));

const { registerProvider, getProvider } = require('../provider');
const { provider, PRICES } = require('../paymob');
const { getDb } = require('../../firebaseAdmin');

describe('Paymob Provider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('HMAC calculation', () => {
    it('should produce consistent HMAC SHA-512 for known input', () => {
      const secret = 'test_hmac_secret';
      const payload = { id: '123', amount_cents: 5000, success: true };

      const result = crypto.createHmac('sha512', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      expect(result).toMatch(/^[a-f0-9]{128}$/);

      const result2 = crypto.createHmac('sha512', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      expect(result2).toBe(result);
    });
  });

  describe('Price constants', () => {
    it('should have correct price values', () => {
      expect(PRICES).toEqual({
        premium: { monthly: 5000, yearly: 50000 },
        elite: { monthly: 8000, yearly: 80000 },
      });
    });
  });

  describe('Provider registration', () => {
    it('should register paymob provider with correct interface', () => {
      const paymobProvider = getProvider('paymob');
      expect(paymobProvider).toBeDefined();
      expect(typeof paymobProvider.createCheckoutSession).toBe('function');
      expect(typeof paymobProvider.handleWebhook).toBe('function');
      expect(typeof paymobProvider.verifyPayment).toBe('function');
    });
  });

  describe('verifyPayment', () => {
    it('should return false for unknown paymentId', async () => {
      const mockSnap = { exists: false };
      const mockDoc = { get: jest.fn().mockResolvedValue(mockSnap) };
      const mockCollection = { doc: jest.fn().mockReturnValue(mockDoc) };
      getDb.mockReturnValue({ collection: jest.fn().mockReturnValue(mockCollection) });

      const result = await provider.verifyPayment({ paymentId: 'nonexistent' });
      expect(result.verified).toBe(false);
      expect(result.paymentDetails).toBeNull();
    });
  });

  describe('handleWebhook', () => {
    let mockGet;
    let mockDoc;
    let mockCollection;
    let mockDb;

    beforeAll(() => {
      process.env.PAYMOB_HMAC_SECRET = 'test_secret';
    });

    beforeEach(() => {
      mockGet = jest.fn();
      mockDoc = jest.fn(() => ({ get: mockGet, set: jest.fn() }));
      mockCollection = jest.fn(() => ({ doc: mockDoc }));
      mockDb = { collection: mockCollection };
      getDb.mockReturnValue(mockDb);
    });

    afterAll(() => {
      delete process.env.PAYMOB_HMAC_SECRET;
    });

    it('should return invalid_hmac when HMAC does not match', async () => {
      const req = {
        headers: { hmac: 'invalid_hmac_value' },
        body: { id: 1, order: { id: 1 } },
        rawBody: JSON.stringify({ id: 1, order: { id: 1 } }),
      };
      const result = await provider.handleWebhook(req);
      expect(result.event).toBe('invalid_hmac');
    });

    it('should return invalid_payload for missing id', async () => {
      const payload = { not_id: 1 };
      const correctHmac = crypto.createHmac('sha512', process.env.PAYMOB_HMAC_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');
      const req = {
        headers: { hmac: correctHmac },
        body: payload,
      };
      const result = await provider.handleWebhook(req);
      expect(result.event).toBe('invalid_payload');
    });

    it('should handle empty body gracefully', async () => {
      const req = {
        headers: {},
        body: {},
      };
      const result = await provider.handleWebhook(req);
      expect(result.event).toMatch(/invalid_hmac|invalid_payload/);
    });
  });
});
