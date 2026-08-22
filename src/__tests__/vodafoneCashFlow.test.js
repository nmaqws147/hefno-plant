const mockStores = {
  payments: new Map(),
  payment_events: new Map(),
  users: new Map(),
  subscriptions: new Map(),
  subscriptionLogs: new Map(),
};

function docApi(store, id) {
  return {
    async get() {
      return { exists: store.has(id), data: () => store.get(id) || {} };
    },
    async set(data, opts = {}) {
      const existing = store.get(id) || {};
      store.set(id, { ...(opts && opts.merge ? existing : {}), ...data });
    },
    async update(patch) {
      const cur = store.get(id) || {};
      store.set(id, { ...cur, ...patch });
    },
  };
}

function queryBuilder(store) {
  const state = { filters: [], order: null, limit: null, offset: 0 };
  const api = {
    where(field, op, value) { state.filters.push({ field, op, value }); return api; },
    orderBy(field, dir = 'asc') { state.order = { field, dir }; return api; },
    limit(n) { state.limit = n; return api; },
    offset(n) { state.offset = n; return api; },
    async get() {
      let docs = Array.from(store.values());
      for (const f of state.filters) {
        docs = docs.filter((d) => {
          if (f.op === '==') return d[f.field] === f.value;
          if (f.op === '<') return d[f.field] < f.value;
          if (f.op === '>') return d[f.field] > f.value;
          return true;
        });
      }
      if (state.order) {
        const { field, dir } = state.order;
        docs.sort((a, b) => {
          if (a[field] < b[field]) return dir === 'desc' ? 1 : -1;
          if (a[field] > b[field]) return dir === 'desc' ? -1 : 1;
          return 0;
        });
      }
      const start = state.offset || 0;
      const sliced = state.limit ? docs.slice(start, start + state.limit) : docs.slice(start);
      return {
        size: docs.length,
        docs: sliced.map((d) => ({ data: () => d })),
        forEach(cb) { sliced.forEach((d) => cb({ data: () => d })); },
      };
    },
  };
  return api;
}

function collection(name) {
  if (!mockStores[name]) mockStores[name] = new Map();
  const store = mockStores[name];
  return {
    add: async (data) => {
      const id = `${name}_${store.size + 1}`;
      store.set(id, { id, ...data });
      return { id };
    },
    doc: (id) => docApi(store, id),
    ...queryBuilder(store),
  };
}

const mockFirebaseAdmin = {
  verifyToken: jest.fn(),
  isAdmin: jest.fn(),
  getDb: jest.fn(),
  init: jest.fn(),
  admin: {},
};

const mockSubService = {
  activateSubscription: jest.fn(),
  logEvent: jest.fn(),
  getSubscription: jest.fn(),
  expireSubscription: jest.fn(),
  cancelAtPeriodEnd: jest.fn(),
  consumePackageQuota: jest.fn(),
};

jest.mock('../../api/_lib/firebaseAdmin', () => mockFirebaseAdmin);
jest.mock('../../api/_lib/subscriptionService', () => mockSubService);
jest.mock('../../api/_lib/payments/provider', () => ({
  createPayment: jest.fn(async () => ({ sessionUrl: 'mock' })),
  handleWebhook: jest.fn(async () => ({ event: 'unknown', data: null })),
  registerProvider: jest.fn(),
  getProvider: jest.fn(),
  getAvailableProviders: jest.fn(() => ['paymob']),
  verifyPayment: jest.fn(),
}));
jest.mock('../../api/_lib/checkQuota', () => ({
  checkQuota: jest.fn(async () => ({ allowed: true })),
}));

const billingHandler = require('../../api/billing');

beforeAll(() => {
  process.env.VODAFONE_CASH_NUMBER = '01004653117';
});

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function call(method, path, { token = null, body = null, query = '' } = {}) {
  const headers = {};
  if (token) headers.authorization = `Bearer ${token}`;
  const req = {
    method,
    url: path + (query ? `?${query}` : ''),
    headers,
    body,
  };
  const res = makeRes();
  return billingHandler(req, res).then(() => ({
    status: res.status.mock.calls[0]?.[0],
    json: res.json.mock.calls[0]?.[0],
  }));
}

beforeEach(() => {
  jest.clearAllMocks();
  for (const key of Object.keys(mockStores)) mockStores[key].clear();

  mockFirebaseAdmin.getDb.mockImplementation(() => ({ collection, stores: mockStores }));
  mockFirebaseAdmin.verifyToken.mockImplementation(async (token) => {
    if (token === 'user-token') return { uid: 'user123', firebase: { identities: { email: ['user@test.com'] } } };
    if (token === 'admin-token') return { uid: 'admin123', firebase: { identities: { email: ['admin@test.com'] } } };
    throw new Error('Invalid token');
  });
  mockFirebaseAdmin.isAdmin.mockImplementation(async (token) => token === 'admin-token');
  mockFirebaseAdmin.init.mockImplementation(() => ({
    auth: () => ({ verifyIdToken: mockFirebaseAdmin.verifyToken }),
    firestore: () => ({ collection }),
  }));

  mockSubService.activateSubscription.mockImplementation(async ({ userId, plan, billingCycle }) => ({
    userId,
    plan,
    status: 'active',
    billingCycle,
    paymentProvider: 'vodafone_cash',
  }));
  mockSubService.logEvent.mockImplementation(async () => {});
  mockSubService.getSubscription.mockImplementation(async () => null);
  mockSubService.expireSubscription.mockImplementation(async () => {});
  mockSubService.cancelAtPeriodEnd.mockImplementation(async () => {});
  mockSubService.consumePackageQuota.mockImplementation(async () => ({ allowed: true }));
});

describe('Vodafone Cash - initiate', () => {
  test('returns static number and amount for authenticated user', async () => {
    const r = await call('POST', '/api/vodafone-cash/initiate', {
      token: 'user-token',
      body: { plan: 'premium', billingCycle: 'monthly' },
    });
    expect(r.status).toBe(200);
    expect(r.json).toMatchObject({
      paymentMethod: 'vodafone_cash',
      phoneNumber: '01004653117',
      amount: 25,
      currency: 'EGP',
      plan: 'premium',
      billingCycle: 'monthly',
    });
  });

  test.each([
    ['premium monthly', { plan: 'premium', billingCycle: 'monthly' }, 25],
    ['premium yearly', { plan: 'premium', billingCycle: 'yearly' }, 250],
    ['elite monthly', { plan: 'elite', billingCycle: 'monthly' }, 40],
    ['elite yearly', { plan: 'elite', billingCycle: 'yearly' }, 400],
  ])('returns correct amount for %s', async (_name, body, expectedAmount) => {
    const r = await call('POST', '/api/vodafone-cash/initiate', { token: 'user-token', body });
    expect(r.status).toBe(200);
    expect(r.json.amount).toBe(expectedAmount);
  });

  test('ignores a client-provided price and uses the trusted amount', async () => {
    const r = await call('POST', '/api/vodafone-cash/initiate', {
      token: 'user-token',
      body: { plan: 'premium', billingCycle: 'monthly', amount: 1, price: 1 },
    });
    expect(r.status).toBe(200);
    expect(r.json.amount).toBe(25);
  });

  test.each([
    ['invalid plan', { plan: 'gold', billingCycle: 'monthly' }],
    ['invalid billing cycle', { plan: 'premium', billingCycle: 'weekly' }],
    ['missing plan', { billingCycle: 'monthly' }],
  ])('rejects %s', async (_name, body) => {
    const r = await call('POST', '/api/vodafone-cash/initiate', { token: 'user-token', body });
    expect(r.status).toBe(400);
  });

  test('rejects unauthenticated', async () => {
    const r = await call('POST', '/api/vodafone-cash/initiate', { body: { plan: 'premium', billingCycle: 'monthly' } });
    expect(r.status).toBe(401);
  });
});

describe('Vodafone Cash - confirm', () => {
  test('creates a pending payment (not activated)', async () => {
    const r = await call('POST', '/api/vodafone-cash/confirm', {
      token: 'user-token',
      body: { plan: 'premium', billingCycle: 'monthly', reference: 'VC12345' },
    });
    expect(r.status).toBe(200);
    expect(r.json).toMatchObject({ success: true, status: 'pending' });
    expect(r.json.paymentId).toBeTruthy();

    const payment = mockStores.payments.get(r.json.paymentId);
    expect(payment).toMatchObject({
      userId: 'user123',
      plan: 'premium',
      billingCycle: 'monthly',
      amount: 25,
      status: 'pending',
      paymentMethod: 'vodafone_cash',
      reference: 'VC12345',
    });
    expect(mockSubService.activateSubscription).not.toHaveBeenCalled();
  });

  test('records a payment_events pending doc and logs the event', async () => {
    const r = await call('POST', '/api/vodafone-cash/confirm', {
      token: 'user-token',
      body: { plan: 'premium', billingCycle: 'monthly' },
    });
    expect(mockStores.payment_events.has(r.json.paymentId)).toBe(true);
    expect(mockStores.payment_events.get(r.json.paymentId).event).toBe('payment_pending');
    expect(mockSubService.logEvent).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user123',
      event: 'payment_pending',
      paymentProvider: 'vodafone_cash',
    }));
  });

  test('stores null reference when omitted', async () => {
    const r = await call('POST', '/api/vodafone-cash/confirm', {
      token: 'user-token',
      body: { plan: 'premium', billingCycle: 'monthly' },
    });
    expect(mockStores.payments.get(r.json.paymentId).reference).toBeNull();
  });

  test('rejects invalid plan', async () => {
    const r = await call('POST', '/api/vodafone-cash/confirm', {
      token: 'user-token',
      body: { plan: 'gold', billingCycle: 'monthly' },
    });
    expect(r.status).toBe(400);
  });

  test('rejects unauthenticated', async () => {
    const r = await call('POST', '/api/vodafone-cash/confirm', { body: { plan: 'premium', billingCycle: 'monthly' } });
    expect(r.status).toBe(401);
  });
});

describe('Vodafone Cash - activate (admin)', () => {
  async function seedPendingPayment() {
    const r = await call('POST', '/api/vodafone-cash/confirm', {
      token: 'user-token',
      body: { plan: 'elite', billingCycle: 'yearly', reference: 'VCREF1' },
    });
    return r.json.paymentId;
  }

  test('blocks non-admin users', async () => {
    const paymentId = await seedPendingPayment();
    const r = await call('POST', '/api/vodafone-cash/activate', {
      token: 'user-token',
      body: { paymentId },
    });
    expect(r.status).toBe(403);
  });

  test('blocks unauthenticated', async () => {
    const r = await call('POST', '/api/vodafone-cash/activate', { body: { paymentId: 'x' } });
    expect(r.status).toBe(401);
  });

  test('admin activates the subscription and marks payment paid', async () => {
    const paymentId = await seedPendingPayment();
    const r = await call('POST', '/api/vodafone-cash/activate', {
      token: 'admin-token',
      body: { paymentId },
    });
    expect(r.status).toBe(200);
    expect(r.json).toMatchObject({ success: true });

    expect(mockSubService.activateSubscription).toHaveBeenCalledWith({
      userId: 'user123',
      plan: 'elite',
      billingCycle: 'yearly',
      paymentProvider: 'vodafone_cash',
    });

    expect(mockStores.payments.get(paymentId).status).toBe('paid');
    expect(mockStores.payment_events.get(paymentId).event).toBe('subscription_activated');
    expect(mockSubService.logEvent).toHaveBeenCalledWith(expect.objectContaining({ event: 'subscription_activated', userId: 'user123' }));
  });

  test('returns alreadyActivated if payment already paid', async () => {
    const paymentId = await seedPendingPayment();
    await call('POST', '/api/vodafone-cash/activate', { token: 'admin-token', body: { paymentId } });
    const r = await call('POST', '/api/vodafone-cash/activate', { token: 'admin-token', body: { paymentId } });
    expect(r.status).toBe(200);
    expect(r.json.alreadyActivated).toBe(true);
    expect(mockSubService.activateSubscription).toHaveBeenCalledTimes(1);
  });

  test('returns 404 for unknown payment', async () => {
    const r = await call('POST', '/api/vodafone-cash/activate', { token: 'admin-token', body: { paymentId: 'nope' } });
    expect(r.status).toBe(404);
  });

  test('returns 400 when paymentId missing', async () => {
    const r = await call('POST', '/api/vodafone-cash/activate', { token: 'admin-token', body: {} });
    expect(r.status).toBe(400);
  });
});

describe('Vodafone Cash - reject (admin)', () => {
  async function seedPendingPayment() {
    const r = await call('POST', '/api/vodafone-cash/confirm', {
      token: 'user-token',
      body: { plan: 'premium', billingCycle: 'monthly' },
    });
    return r.json.paymentId;
  }

  test('blocks non-admin', async () => {
    const paymentId = await seedPendingPayment();
    const r = await call('POST', '/api/vodafone-cash/reject', { token: 'user-token', body: { paymentId } });
    expect(r.status).toBe(403);
  });

  test('admin rejects a pending payment', async () => {
    const paymentId = await seedPendingPayment();
    const r = await call('POST', '/api/vodafone-cash/reject', { token: 'admin-token', body: { paymentId } });
    expect(r.status).toBe(200);
    expect(r.json.status).toBe('failed');
    expect(mockStores.payments.get(paymentId).status).toBe('failed');
    expect(mockSubService.activateSubscription).not.toHaveBeenCalled();
    expect(mockSubService.logEvent).toHaveBeenCalledWith(expect.objectContaining({ event: 'payment_failed' }));
  });

  test('cannot reject a non-pending payment', async () => {
    const paymentId = await seedPendingPayment();
    await call('POST', '/api/vodafone-cash/activate', { token: 'admin-token', body: { paymentId } });
    const r = await call('POST', '/api/vodafone-cash/reject', { token: 'admin-token', body: { paymentId } });
    expect(r.status).toBe(400);
  });

  test('returns 404 for unknown payment', async () => {
    const r = await call('POST', '/api/vodafone-cash/reject', { token: 'admin-token', body: { paymentId: 'nope' } });
    expect(r.status).toBe(404);
  });
});

describe('Billing payments listing', () => {
  test('admin sees all payments including vodafone_cash', async () => {
    await call('POST', '/api/vodafone-cash/confirm', { token: 'user-token', body: { plan: 'premium', billingCycle: 'monthly' } });
    const r = await call('GET', '/api/billing/payments', { token: 'admin-token' });
    expect(r.status).toBe(200);
    expect(r.json.total).toBe(1);
    expect(r.json.payments[0].paymentMethod).toBe('vodafone_cash');
    expect(r.json.payments[0].status).toBe('pending');
  });

  test('non-admin only sees their own payments', async () => {
    await call('POST', '/api/vodafone-cash/confirm', { token: 'user-token', body: { plan: 'premium', billingCycle: 'monthly' } });
    const r = await call('GET', '/api/billing/payments', { token: 'user-token' });
    expect(r.status).toBe(200);
    expect(r.json.total).toBe(1);
    expect(r.json.payments[0].userId).toBe('user123');
  });

  test('rejects unauthenticated', async () => {
    const r = await call('GET', '/api/billing/payments');
    expect(r.status).toBe(401);
  });
});

describe('Subscription endpoint', () => {
  test('returns free plan for user without subscription', async () => {
    const r = await call('GET', '/api/subscription', { token: 'user-token' });
    expect(r.status).toBe(200);
    expect(r.json.plan).toBe('free');
  });
});
