const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});
const db = getFirestore(app);

const PLANS = {
  premium: {
    monthly: { price: 50, currency: 'EGP', savings: null },
    yearly: { price: 500, currency: 'EGP', savings: '17%' },
    label: 'Premium',
    description: 'الميزات المتقدمة للمزارعين المحترفين',
  },
  elite: {
    monthly: { price: 80, currency: 'EGP', savings: null },
    yearly: { price: 800, currency: 'EGP', savings: '17%' },
    label: 'Elite',
    description: 'الوصول الكامل لجميع الميزات',
  },
};

const FEATURES_LIST = [
  { id: 'ai_chatbot', name: 'المساعد الذكي', free: '5/يوم', premium: '100/شهر', elite: 'غير محدود' },
  { id: 'knowledge_base', name: 'قاعدة المعرفة', free: '5/أسبوع', premium: '70/شهر', elite: 'غير محدود' },
  { id: 'disease_diagnosis', name: 'تشخيص الأمراض', free: '1/أسبوع', premium: '2/شهر', elite: 'غير محدود' },
  { id: 'weather', name: 'الطقس', free: 'غير محدود', premium: 'غير محدود', elite: 'غير محدود' },
  { id: 'blog', name: 'المقالات', free: 'غير محدود', premium: 'غير محدود', elite: 'غير محدود' },
];

async function seed() {
  await db.collection('pricing').doc('plans').set({ plans: PLANS, features: FEATURES_LIST, updatedAt: new Date() });
  console.log('Seeded pricing config');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
