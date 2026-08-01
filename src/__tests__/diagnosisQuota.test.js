const subscriptions = new Map();

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
  };
}

function collection(name) {
  if (!mockStores[name]) mockStores[name] = new Map();
  return { doc: (id) => docApi(mockStores[name], id) };
}

function transactionApi() {
  return {
    async get(ref) {
      const store = ref._store;
      const id = ref._id;
      return { exists: store.has(id), data: () => store.get(id) || {} };
    },
    async update(ref, patch) {
      const store = ref._store;
      const id = ref._id;
      const cur = store.get(id) || {};
      const merged = { ...cur };
      for (const [key, value] of Object.entries(patch)) {
        if (key.includes('.')) setPath(merged, key, value);
        else merged[key] = value;
      }
      store.set(id, merged);
    },
  };
}

const mockStores = { subscriptions };

const mockFirebaseAdmin = {
  getDb: jest.fn(() => ({
    collection,
    stores: mockStores,
    runTransaction: async (fn) => fn(transactionApi()),
  })),
};

jest.mock('../../api/_lib/firebaseAdmin', () => mockFirebaseAdmin);

const { MONTHLY_DIAGNOSIS_LIMIT, cycleWindow, buildState, getDiagnosisQuota, consumeDiagnosis, refundDiagnosis } = require('../../api/_lib/diagnosisQuotaService');

function makeSub({ plan = 'premium', status = 'active', startDate, quota = null, expirationDate } = {}) {
  return {
    plan,
    status,
    startDate: startDate || new Date(),
    expirationDate: expirationDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    packageQuotas: quota ? { disease_diagnosis: quota } : {},
  };
}

function seedSub(userId, sub) {
  subscriptions.set(userId, sub);
  return userId;
}

beforeEach(() => {
  jest.clearAllMocks();
  subscriptions.clear();
  mockFirebaseAdmin.getDb.mockImplementation(() => ({
    collection,
    stores: mockStores,
    runTransaction: async (fn) => fn(transactionApi()),
  }));
});

describe('cycleWindow', () => {
  test('anchors a monthly window to the anchor date', () => {
    const anchor = new Date('2026-01-15T12:00:00Z');
    const now = new Date('2026-01-20T12:00:00Z');
    const { start, end } = cycleWindow(anchor, now);
    expect(start.toISOString()).toBe('2026-01-15T12:00:00.000Z');
    expect(end.toISOString()).toBe('2026-02-15T12:00:00.000Z');
  });

  test('rolls forward when the window has elapsed', () => {
    const anchor = new Date('2026-01-15T12:00:00Z');
    const now = new Date('2026-03-05T12:00:00Z');
    const { start, end } = cycleWindow(anchor, now);
    expect(start.toISOString()).toBe('2026-03-15T12:00:00.000Z');
    expect(end.toISOString()).toBe('2026-04-15T12:00:00.000Z');
  });
});

describe('buildState', () => {
  test('fresh state when quota is missing (legacy/migration)', () => {
    const state = buildState({ quota: null, anchor: new Date('2026-01-15T12:00:00Z'), now: new Date('2026-01-20T12:00:00Z') });
    expect(state.monthlyDiagnosisLimit).toBe(14);
    expect(state.diagnosisUsedThisMonth).toBe(0);
    expect(state.diagnosisRemaining).toBe(14);
  });

  test('resets used count when cycle elapses', () => {
    const quota = {
      total: 14,
      remaining: 3,
      monthlyDiagnosisLimit: 14,
      diagnosisUsedThisMonth: 11,
      diagnosisRemaining: 3,
      billingCycleStart: new Date('2026-01-15T12:00:00Z'),
      billingCycleEnd: new Date('2026-02-15T12:00:00Z'),
      lastResetDate: new Date('2026-01-15T12:00:00Z'),
    };
    const state = buildState({ quota, anchor: new Date('2026-01-15T12:00:00Z'), now: new Date('2026-02-20T12:00:00Z') });
    expect(state.diagnosisUsedThisMonth).toBe(0);
    expect(state.diagnosisRemaining).toBe(14);
  });
});

describe('getDiagnosisQuota', () => {
  test('returns not-allowed for free/non-premium users', async () => {
    const uid = seedSub('u1', makeSub({ plan: 'free' }));
    const result = await getDiagnosisQuota(uid);
    expect(result.allowed).toBe(false);
    expect(result.isPremium).toBe(false);
  });

  test('returns full quota for a fresh premium subscription', async () => {
    const uid = seedSub('u1', makeSub({ startDate: new Date() }));
    const result = await getDiagnosisQuota(uid);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(14);
    expect(result.limit).toBe(14);
    expect(result.usedThisMonth).toBe(0);
  });

  test('auto-migrates legacy quota (total 2) to a fresh 14', async () => {
    const uid = seedSub('u1', makeSub({
      startDate: new Date(),
      quota: { total: 2, remaining: 1, resetDate: new Date() },
    }));
    const result = await getDiagnosisQuota(uid);
    expect(result.remaining).toBe(14);
    expect(result.limit).toBe(14);
  });
});

describe('consumeDiagnosis', () => {
  test('decrements remaining atomically', async () => {
    const uid = seedSub('u1', makeSub({ startDate: new Date() }));
    const first = await consumeDiagnosis(uid);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(13);
    const second = await consumeDiagnosis(uid);
    expect(second.remaining).toBe(12);
  });

  test('rejects after 14 uses in the current cycle', async () => {
    const uid = seedSub('u1', makeSub({
      startDate: new Date(),
      quota: {
        total: 14,
        remaining: 0,
        monthlyDiagnosisLimit: 14,
        diagnosisUsedThisMonth: 14,
        diagnosisRemaining: 0,
        billingCycleStart: new Date(),
        billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lastResetDate: new Date(),
      },
    }));
    const result = await consumeDiagnosis(uid);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('quota_exhausted');
  });

  test('resets the cycle and allows consumption after billingCycleEnd', async () => {
    const uid = seedSub('u1', makeSub({
      startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      quota: {
        total: 14,
        remaining: 0,
        monthlyDiagnosisLimit: 14,
        diagnosisUsedThisMonth: 14,
        diagnosisRemaining: 0,
        billingCycleStart: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        billingCycleEnd: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        lastResetDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      },
    }));
    const result = await consumeDiagnosis(uid);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(13);
  });

  test('rejects for non-active premium', async () => {
    const uid = seedSub('u1', makeSub({
      status: 'expired',
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    }));
    const result = await consumeDiagnosis(uid);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('no_active_premium');
  });
});

describe('refundDiagnosis', () => {
  test('restores a consumed diagnosis', async () => {
    const uid = seedSub('u1', makeSub({ startDate: new Date() }));
    await consumeDiagnosis(uid);
    const refund = await refundDiagnosis(uid);
    expect(refund.refunded).toBe(true);
    expect(refund.remaining).toBe(14);
  });

  test('does not refund above the limit', async () => {
    const uid = seedSub('u1', makeSub({ startDate: new Date() }));
    const refund = await refundDiagnosis(uid);
    expect(refund.refunded).toBe(false);
  });
});

describe('subscriptionService integration', () => {
  test('getPackageQuotas seeds 14/month and is excluded from yearly x12', async () => {
    const { getPackageQuotas } = require('../../api/_lib/subscriptionService');
    const monthly = getPackageQuotas('premium', 'monthly');
    expect(monthly.disease_diagnosis.total).toBe(14);
    expect(monthly.disease_diagnosis.diagnosisRemaining).toBe(14);
    expect(monthly.disease_diagnosis.billingCycleEnd).toBeInstanceOf(Date);
    const yearly = getPackageQuotas('premium', 'yearly');
    expect(yearly.disease_diagnosis.total).toBe(14);
    expect(yearly.ai_chatbot.total).toBe(1200);
    expect(yearly.knowledge_base.total).toBe(840);
    expect(MONTHLY_DIAGNOSIS_LIMIT).toBe(14);
  });
});
