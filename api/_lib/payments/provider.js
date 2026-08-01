const providers = {};

function registerProvider(name, implementation) {
  providers[name] = implementation;
}

function getProvider(name) {
  if (!providers[name]) throw new Error(`Payment provider "${name}" not registered`);
  return providers[name];
}

function getAvailableProviders() {
  return Object.keys(providers);
}

async function createPayment({ provider, plan, billingCycle, userId, customerEmail, phoneNumber }) {
  const impl = getProvider(provider);
  if (phoneNumber && typeof impl.createWalletSession === 'function') {
    return impl.createWalletSession({ plan, billingCycle, userId, customerEmail, phoneNumber });
  }
  return impl.createCheckoutSession({ plan, billingCycle, userId, customerEmail });
}

async function verifyPayment({ provider, paymentId, data }) {
  return getProvider(provider).verifyPayment({ paymentId, data });
}

async function handleWebhook({ provider, req }) {
  return getProvider(provider).handleWebhook(req);
}

module.exports = { registerProvider, getProvider, getAvailableProviders, createPayment, verifyPayment, handleWebhook };
