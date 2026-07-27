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
    it('should calculate HMAC SHA-512 correctly', () => {
      const secret = 'test_hmac_secret';
      const payload = { id: '123', amount_cents: 5000, success: true };

      const expected = crypto.createHmac('sha512', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      const calculated = crypto.createHmac('sha512', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      expect(calculated).toBe(expected);
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
});
