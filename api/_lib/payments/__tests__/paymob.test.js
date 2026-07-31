const crypto = require('crypto');

jest.mock('../../firebaseAdmin', () => ({
  getDb: jest.fn(),
}));

const { registerProvider, getProvider } = require('../provider');
const { provider, PRICES, computeTransactionHmac } = require('../paymob');
const { getDb } = require('../../firebaseAdmin');

const SECRET = 'test_secret';
const MERCHANT_ID = '1205820';
const INTEGRATION_ID = '5809314';

function makeWebhookReq(overrides = {}) {
  const obj = {
    id: 192036465,
    pending: false,
    amount_cents: 8000,
    success: true,
    is_auth: false,
    is_capture: false,
    is_standalone_payment: true,
    is_voided: false,
    is_refunded: false,
    is_3d_secure: true,
    integration_id: 5809314,
    profile_id: 1205820,
    has_parent_transaction: false,
    order: { id: 577046591, merchant: { id: 1205820 } },
    created_at: '2024-06-13T11:33:44.592345',
    currency: 'EGP',
    source_data: { pan: '2346', type: 'card', sub_type: 'MasterCard' },
    error_occured: false,
    owner: 302852,
    ...overrides,
  };
  const rawBody = JSON.stringify({ type: 'TRANSACTION', obj });
  const hmac = computeTransactionHmac(obj, SECRET);
  return {
    rawBody,
    body: { type: 'TRANSACTION', obj },
    url: `https://hefnoplant.site/api/paymob/webhook?hmac=${hmac}`,
    headers: {},
  };
}

describe('Paymob Provider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PAYMOB_HMAC_SECRET = SECRET;
    process.env.PAYMOB_MERCHANT_ID = MERCHANT_ID;
    process.env.PAYMOB_INTEGRATION_ID = INTEGRATION_ID;
  });

  afterEach(() => {
    delete process.env.PAYMOB_HMAC_SECRET;
    delete process.env.PAYMOB_MERCHANT_ID;
    delete process.env.PAYMOB_INTEGRATION_ID;
  });

  describe('HMAC calculation', () => {
    it('should concatenate fields in Paymob order and produce SHA-512 hex', () => {
      const obj = {
        amount_cents: 100,
        created_at: '2020-03-25T18:39:44.719228',
        currency: 'EGP',
        error_occured: false,
        has_parent_transaction: false,
        id: 2556706,
        integration_id: 6741,
        is_3d_secure: true,
        is_auth: false,
        is_capture: false,
        is_refunded: false,
        is_standalone_payment: true,
        is_voided: false,
        order: { id: 4778239 },
        owner: 4705,
        pending: false,
        source_data: { pan: '2346', sub_type: 'MasterCard', type: 'card' },
        success: true,
      };
      const expected = '1002020-03-25T18:39:44.719228EGPfalsefalse25567066741truefalsefalsefalsetruefalse47782394705false2346MasterCardcardtrue';
      const hmac = crypto.createHmac('sha512', SECRET).update(expected).digest('hex');
      expect(computeTransactionHmac(obj, SECRET)).toBe(hmac);
      expect(computeTransactionHmac(obj, SECRET)).toMatch(/^[a-f0-9]{128}$/);
    });

    it('should treat missing optional fields as empty string', () => {
      const obj = { amount_cents: 100, id: 1, order: { id: 2 }, source_data: {} };
      const expected = '10012';
      const hmac = crypto.createHmac('sha512', SECRET).update(expected).digest('hex');
      expect(computeTransactionHmac(obj, SECRET)).toBe(hmac);
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

    beforeEach(() => {
      mockGet = jest.fn();
      mockDoc = jest.fn(() => ({ get: mockGet, set: jest.fn() }));
      mockCollection = jest.fn(() => ({ doc: mockDoc }));
      mockDb = { collection: mockCollection };
      getDb.mockReturnValue(mockDb);
    });

    it('should return invalid_hmac when HMAC does not match', async () => {
      const req = makeWebhookReq();
      req.url = 'https://hefnoplant.site/api/paymob/webhook?hmac=invalid_hmac_value';
      const result = await provider.handleWebhook(req);
      expect(result.event).toBe('invalid_hmac');
    });

    it('should accept valid webhook and return checkout.session.completed', async () => {
      mockGet
        .mockResolvedValueOnce({ exists: false })
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ userId: 'u1', plan: 'elite', billingCycle: 'monthly', amountCents: 8000, currency: 'EGP' }),
        });

      const result = await provider.handleWebhook(makeWebhookReq());
      expect(result.event).toBe('checkout.session.completed');
      expect(result.data.userId).toBe('u1');
      expect(result.data.plan).toBe('elite');
    });

    it('should return invalid_payload for missing id', async () => {
      const req = makeWebhookReq({ id: undefined });
      req.rawBody = JSON.stringify({ type: 'TRANSACTION', obj: { order: { id: 1 } } });
      req.body = { type: 'TRANSACTION', obj: { order: { id: 1 } } };
      const hmac = computeTransactionHmac(req.body.obj, SECRET);
      req.url = `https://hefnoplant.site/api/paymob/webhook?hmac=${hmac}`;
      const result = await provider.handleWebhook(req);
      expect(result.event).toBe('invalid_payload');
    });

    it('should return payment_failed when success is false', async () => {
      const req = makeWebhookReq({ success: false });
      const result = await provider.handleWebhook(req);
      expect(result.event).toBe('payment_failed');
    });

    it('should handle empty body gracefully', async () => {
      const req = { url: 'https://hefnoplant.site/api/paymob/webhook', headers: {}, body: {} };
      const result = await provider.handleWebhook(req);
      expect(result.event).toMatch(/invalid_hmac|invalid_payload/);
    });
  });
});
