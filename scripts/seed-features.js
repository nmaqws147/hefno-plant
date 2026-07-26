const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: require('path').join(__dirname, '..', 'api', '.env') });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});
const db = getFirestore(app);

const FEATURES = [
  {
    id: 'ai_chatbot',
    displayName: 'AI Chatbot',
    order: 1,
    dailyLimit: 5,
    weeklyLimit: null,
    monthlyLimit: null,
    premiumUnlimited: true,
    premiumMonthlyQuota: 100,
    isPublic: false,
    isEnabled: true,
  },
  {
    id: 'knowledge_base',
    displayName: 'Knowledge Base',
    order: 2,
    dailyLimit: null,
    weeklyLimit: 5,
    monthlyLimit: null,
    premiumUnlimited: true,
    premiumMonthlyQuota: 70,
    isPublic: false,
    isEnabled: true,
  },
  {
    id: 'disease_diagnosis',
    displayName: 'AI Disease Diagnosis',
    order: 3,
    dailyLimit: null,
    weeklyLimit: 1,
    monthlyLimit: null,
    premiumUnlimited: false,
    premiumMonthlyQuota: 2,
    isPublic: false,
    isEnabled: true,
  },
];

async function seed() {
  for (const feat of FEATURES) {
    await db.collection('features').doc(feat.id).set({
      ...feat,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Seeded: ${feat.id}`);
  }
  console.log('Done');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
