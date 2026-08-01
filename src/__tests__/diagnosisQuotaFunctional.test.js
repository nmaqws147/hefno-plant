const stores = {
  users: new Map(),
  subscriptions: new Map(),
  features: new Map(),
  usage: new Map(),
};

function setPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (typeof cur[k] !== 'object' || cur[k] === null) cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

function docApi(store, id) {
  return {
    _id: id,
    _store: store,
    async get() {
      return { exists: store.has(id), data: () => store.get(id) || {} };
    },
    async update(patch) {
      const cur = store.get(id) || {};
      const merged = { ...cur };
      for (const [key, value] of Object.entries(patch)) {
        if (key.includes('.')) setPath(merged, key, value);
        else merged[key] = value;
      }
      store.set(id, merged);
    },
    async set(data, opts = {}) {
      const existing = store.get(id) || {};
      store.set(id, { ...(opts && opts.merge ? existing : {}), ...data });
    },
    collection(name) {
      return collection(name);
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
          return true;
        });
      }
      return { size: docs.length, docs: docs.map((d) => ({ data: () => d })), forEach() {} };
    },
  };
  return api;
}

function collection(name) {
  if (!stores[name]) stores[name] = new Map();
  const store = stores[name];
  return {
    doc: (id) => docApi(store, id),
    ...queryBuilder(store),
  };
}

function transactionApi() {
  return {
    async get(ref) {
      const store = ref._store;
      return { exists: store.has(ref._id), data: () => store.get(ref._id) || {} };
    },
    async update(ref, patch) {
      const store = ref._store;
      const cur = store.get(ref._id) || {};
      const merged = { ...cur };
      for (const [key, value] of Object.entries(patch)) {
        if (key.includes('.')) setPath(merged, key, value);
        else merged[key] = value;
      }
      store.set(ref._id, merged);
    },
  };
}

const mockFirebaseAdmin = {
  getDb: jest.fn(() => ({
    collection,
    stores,
    runTransaction: async (fn) => fn(transactionApi()),
  })),
};

jest.mock('../../api/_lib/firebaseAdmin', () => mockFirebaseAdmin);

const { checkQuota } = require('../../api/_lib/quotaStrategies');

function seedFeature() {
  stores.features.set('disease_diagnosis', { isEnabled: true, weeklyLimit: 1 });
}

function seedUser(userId, role = 'user') {
  stores.users.set(userId, { role });
}

function seedSub(userId, { plan = 'premium', status = 'active', billingCycle = 'monthly', startDate, quota = null, expirationDate } = {}) {
  stores.subscriptions.set(userId, {
    plan,
    status,
    billingCycle,
    startDate: startDate || new Date(),
    expirationDate: expirationDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    packageQuotas: quota ? { disease_diagnosis: quota } : {},
  });
}

function fullQuota({ used = 0, start } = {}) {
  const startDate = start || new Date();
  const end = new Date(startDate.getTime());
  end.setUTCMonth(end.getUTCMonth() + 1);
  return {
    total: 14,
    remaining: 14 - used,
    resetDate: startDate,
    monthlyDiagnosisLimit: 14,
    diagnosisUsedThisMonth: used,
    diagnosisRemaining: 14 - used,
    billingCycleStart: startDate,
    billingCycleEnd: end,
    lastResetDate: startDate,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  for (const key of Object.keys(stores)) stores[key].clear();
  mockFirebaseAdmin.getDb.mockImplementation(() => ({
    collection,
    stores,
    runTransaction: async (fn) => fn(transactionApi()),
  }));
  seedFeature();
});

describe('checkQuota functional limits (monthly billing)', () => {
  test('premium can consume exactly 14, then is rejected', async () => {
    const uid = 'm1';
    seedUser(uid);
    seedSub(uid, { startDate: new Date() });

    for (let i = 1; i <= 14; i++) {
      const r = await checkQuota({ featureId: 'disease_diagnosis', userId: uid, incrementIfAllowed: true });
      expect(r.allowed).toBe(true);
      expect(r.remaining).toBe(14 - i);
    }

    const rejected = await checkQuota({ featureId: 'disease_diagnosis', userId: uid, incrementIfAllowed: true });
    expect(rejected.allowed).toBe(false);
    expect(rejected.error).toBe('quota_exhausted');
    expect(rejected.remaining).toBe(0);
  });

  test('read-only check reports remaining without consuming', async () => {
    const uid = 'm2';
    seedUser(uid);
    seedSub(uid, { startDate: new Date() });

    const r = await checkQuota({ featureId: 'disease_diagnosis', userId: uid });
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(14);

    const again = await checkQuota({ featureId: 'disease_diagnosis', userId: uid });
    expect(again.remaining).toBe(14);
  });

  test('rejects after 14 in the current billing cycle', async () => {
    const uid = 'm3';
    seedUser(uid);
    seedSub(uid, { startDate: new Date(), quota: fullQuota({ used: 14 }) });

    const r = await checkQuota({ featureId: 'disease_diagnosis', userId: uid, incrementIfAllowed: true });
    expect(r.allowed).toBe(false);
    expect(r.error).toBe('quota_exhausted');
  });

  test('resets at the start of a new billing cycle', async () => {
    const uid = 'm4';
    seedUser(uid);
    const start = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
    seedSub(uid, { startDate: start, quota: fullQuota({ used: 14, start }) });

    const r = await checkQuota({ featureId: 'disease_diagnosis', userId: uid, incrementIfAllowed: true });
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(13);
  });
});

describe('checkQuota functional limits (yearly billing)', () => {
  test('yearly premium still gets 14/month (not 168 lump), resetting monthly', async () => {
    const uid = 'y1';
    seedUser(uid);
    const start = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
    seedSub(uid, { billingCycle: 'yearly', startDate: start, quota: fullQuota({ used: 14, start }) });

    const r = await checkQuota({ featureId: 'disease_diagnosis', userId: uid, incrementIfAllowed: true });
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(13);
    expect(r.limit).toBe(14);
  });

  test('yearly premium exhausts after 14 in the month', async () => {
    const uid = 'y2';
    seedUser(uid);
    seedSub(uid, { billingCycle: 'yearly', startDate: new Date(), quota: fullQuota({ used: 14 }) });

    const r = await checkQuota({ featureId: 'disease_diagnosis', userId: uid, incrementIfAllowed: true });
    expect(r.allowed).toBe(false);
    expect(r.error).toBe('quota_exhausted');
  });

  test('yearly premium consumes 14 consecutively then rejects', async () => {
    const uid = 'y3';
    seedUser(uid);
    seedSub(uid, { billingCycle: 'yearly', startDate: new Date() });

    for (let i = 1; i <= 14; i++) {
      const r = await checkQuota({ featureId: 'disease_diagnosis', userId: uid, incrementIfAllowed: true });
      expect(r.allowed).toBe(true);
    }
    const rejected = await checkQuota({ featureId: 'disease_diagnosis', userId: uid, incrementIfAllowed: true });
    expect(rejected.allowed).toBe(false);
    expect(rejected.remaining).toBe(0);
  });
});

describe('checkQuota admin and elite exemptions', () => {
  test('admin is unlimited and usage is not decremented', async () => {
    const uid = 'admin1';
    seedUser(uid, 'admin');
    seedSub(uid, { startDate: new Date(), quota: fullQuota({ used: 14 }) });

    const r = await checkQuota({ featureId: 'disease_diagnosis', userId: uid, incrementIfAllowed: true });
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(Infinity);

    const stored = stores.subscriptions.get(uid).packageQuotas.disease_diagnosis;
    expect(stored.diagnosisUsedThisMonth).toBe(14);
  });

  test('elite is unlimited and usage is not decremented', async () => {
    const uid = 'elite1';
    seedUser(uid);
    seedSub(uid, { plan: 'elite', startDate: new Date(), quota: fullQuota({ used: 14 }) });

    const r = await checkQuota({ featureId: 'disease_diagnosis', userId: uid, incrementIfAllowed: true });
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(Infinity);

    const stored = stores.subscriptions.get(uid).packageQuotas.disease_diagnosis;
    expect(stored.diagnosisUsedThisMonth).toBe(14);
  });
});

describe('diagnosisQuotaService refund', () => {
  test('refund restores a consumed diagnosis', async () => {
    const { refundDiagnosis } = require('../../api/_lib/diagnosisQuotaService');
    const uid = 'r1';
    seedUser(uid);
    seedSub(uid, { startDate: new Date() });

    await checkQuota({ featureId: 'disease_diagnosis', userId: uid, incrementIfAllowed: true });
    const refund = await refundDiagnosis(uid);
    expect(refund.refunded).toBe(true);
    expect(refund.remaining).toBe(14);
  });
});
