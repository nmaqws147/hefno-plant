const errorMap = {
  'auth/operation-not-allowed': 'تسجيل البريد الإلكتروني غير مفعّل في لوحة تحكم Firebase',
  'auth/email-already-in-use': 'هذا البريد الإلكتروني مسجل بالفعل',
  'auth/weak-password': 'كلمة المرور ضعيفة — 6 أحرف على الأقل',
  'auth/invalid-email': 'البريد الإلكتروني غير صالح',
  'auth/user-not-found': 'لا يوجد حساب بهذا البريد الإلكتروني',
  'auth/wrong-password': 'كلمة المرور غير صحيحة',
  'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'auth/network-request-failed': 'مشكلة في الاتصال — تحقق من اتصالك بالإنترنت',
  'auth/too-many-requests': 'طلبات كثيرة جداً — حاول لاحقاً',
  'auth/user-disabled': 'تم تعطيل هذا الحساب',
  'auth/requires-recent-login': 'يرجى تسجيل الخروج وإعادة تسجيل الدخول',
  'auth/invalid-action-code': 'رمز التحقق غير صالح',
  'auth/expired-action-code': 'انتهت صلاحية رمز التحقق',
};

export const getFirebaseErrorMessage = (err) => {
  const message = err?.message || '';
  const code = err?.code || '';
  const match = message.match(/\(([^)]+)\)/);
  const errorCode = code || (match ? `auth/${match[1].replace('auth/', '')}` : '');
  return errorMap[errorCode] || message.replace('Firebase: ', '').replace(/\([^)]+\)/g, '').trim() || 'حدث خطأ غير متوقع';
};