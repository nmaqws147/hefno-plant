
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.TOKEN
});

const API_KEYS = [
  process.env.IMAGE_AI1,
  process.env.IMAGE_AI2,
  process.env.IMAGE_AI3,
].filter(key => key && key.trim() !== "");

const FALLBACK_KEY = process.env.AI_MODEL_3_FLASH_KEY || process.env.GEMINI_API_KEY;
if (API_KEYS.length === 0 && FALLBACK_KEY) {
  API_KEYS.push(FALLBACK_KEY);
}

const MODELS = [
  {
    name: "Backup Engine",
    provider: "gemini",
    url: "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=",
    modelId: "gemini-2.5-flash",
    timeout: 40000,
    priority: 2,
    supportsJsonMode: true
  },
  {
    name: "Primary Engine",
    provider: "gemini",
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=",
    modelId: "gemini-3.5-flash",
    timeout: 35000,
    priority: 1,
    supportsJsonMode: true,
    responseSchema: {
      type: "OBJECT",
      properties: {
        plantName: { type: "STRING" },
        healthStatus: { type: "STRING" },
        mainProblems: { type: "ARRAY", items: { type: "STRING" } },
        problemType: { type: "STRING" },
        diseaseName: {
          type: "OBJECT",
          properties: { scientific: { type: "STRING" }, common: { type: "STRING" } },
          required: ["scientific", "common"]
        },
        symptoms: { type: "ARRAY", items: { type: "STRING" } },
        severity: { type: "STRING" },
        affectedParts: { type: "ARRAY", items: { type: "STRING" } },
        pesticides: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              type: { type: "STRING" },
              activeIngredient: { type: "STRING" },
              dosage: { type: "STRING" },
              usageMethod: { type: "STRING" },
              preHarvestInterval: { type: "STRING" }
            }
          }
        },
        organicControl: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: { method: { type: "STRING" }, preparation: { type: "STRING" }, application: { type: "STRING" } }
          }
        },
        treatment: { type: "ARRAY", items: { type: "STRING" } },
        careTips: { type: "ARRAY", items: { type: "STRING" } },
        confidence: { type: "INTEGER" }
      },
      required: ["plantName", "healthStatus", "mainProblems", "problemType", "diseaseName", "symptoms", "severity", "treatment"]
    }
  },
  {
    name: "Double Backup Engine",
    provider: "gemini",
    url: "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=",
    modelId: "gemini-1.5-flash",
    timeout: 40000,
    priority: 3,
    supportsJsonMode: true
  }
];

const PROMPT = `أنت خبير عالمي متخصص في تشخيص أمراض النباتات والحشرات الزراعية بخبرة 20 سنة.
📌 مهمتك: تحليل الصورة المرفقة بدقة وتحديد الآفة أو المرض وتقديم تشخيص علمي وعلاجي باللغة العربية فقط.

📋 الإخراج المطلوب (JSON فقط):
{
  "plantName": "اسم النبات بالعربية",
  "healthStatus": "سليم | جيدة | متوسطة | حرجة",
  "mainProblems": ["المشكلة الأساسية"],
  "problemType": "فطري | بكتيري | فيروسي | فسيولوجي | حشري | متعدد",
  "diseaseName": {
    "scientific": "الاسم العلمي باللاتينية",
    "common": "الاسم الشائع بالعربية"
  },
  "symptoms": ["عرض 1", "عرض 2"],
  "severity": "بسيطة | متوسطة | شديدة | خطيرة",
  "affectedParts": ["الأجزاء المصابة"],
  "pesticides": [{
    "type": "نوع المبيد",
    "activeIngredient": "المادة الفعالة",
    "dosage": "الجرعة",
    "usageMethod": "طريقة الاستخدام",
    "preHarvestInterval": "فترة الأمان"
  }],
  "organicControl": [{
    "method": "الطريقة العضوية",
    "preparation": "التحضير",
    "application": "التطبيق"
  }],
  "treatment": ["خطوة علاجية 1"],
  "careTips": ["نصيحة 1"],
  "confidence": 95
}

⚡ قواعد صارمة:
1. الرد JSON فقط - لا شيء خارجه مطلقاً.
2. إذا كان النبات سليماً: اجعل healthStatus="سليم" و المصفوفات فارغة.`;

async function checkAndConsumeRateLimit(fingerprint, limit = 2) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `hefno:analyze:${fingerprint}:${today}`;
  const count = (await redis.get(key)) || 0;

  if (count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      reset: 86400,
      limit: limit,
      used: parseInt(count)
    };
  }

  return {
    allowed: true,
    remaining: limit - count,
    limit: limit,
    used: parseInt(count),
    key: key,
    reset: 86400
  };
}

async function consumeRateLimit(key) {
  await redis.incr(key);
  await redis.expire(key, 86400);
}

function getFingerprint(req) {
  const headers = req.headers;
  const ip = headers["x-forwarded-for"] || headers["client-ip"] || headers["x-real-ip"] || "unknown";
  const userAgent = headers["user-agent"] || "unknown";
  
  let bodyFingerprint = "";
  try {
    bodyFingerprint = req.body?.userId || req.body?.sessionId || "";
  } catch(e) {}
  
  const fingerprint = bodyFingerprint 
    ? `session:${bodyFingerprint}`
    : `ip:${ip}:${userAgent.substring(0, 30)}`;
  
  return crypto.createHash('md5').update(fingerprint).digest('hex');
}

async function callGeminiSingle(modelConfig, apiKey, base64Image, retries = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), modelConfig.timeout);
  
  const generationConfig = {
    temperature: 0.1,
    maxOutputTokens: 3000
  };

  if (modelConfig.supportsJsonMode && modelConfig.responseSchema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = modelConfig.responseSchema;
  }
  
  const requestBody = {
    contents: [{
      parts: [
        { text: PROMPT },
        { inline_data: { mime_type: "image/jpeg", data: base64Image } }
      ]
    }],
    generationConfig: generationConfig
  };
  
  try {
    const fullUrl = `${modelConfig.url}${apiKey}`;
    
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.status === 429 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return callGeminiSingle(modelConfig, apiKey, base64Image, retries - 1);
    }
    
    if (response.status === 503 || response.status === 500) {
      return { success: false, error: `Service Unavailable (${response.status})` };
    }
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const data = await response.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return { success: false, error: "Empty response" };
    }
    
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: "No JSON found" };
    }
    
    try {
      const result = JSON.parse(jsonMatch[0]);
      return { success: true, result };
    } catch (parseError) {
      return { success: false, error: "JSON Parse Error" };
    }
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return { success: false, error: "Timeout" };
    }
    
    if (retries > 0 && !error.message.includes('Timeout')) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return callGeminiSingle(modelConfig, apiKey, base64Image, retries - 1);
    }
    
    return { success: false, error: error.message };
  }
}

async function tryAllModels(base64Image) {
  for (let i = 0; i < API_KEYS.length; i++) {
    const apiKey = API_KEYS[i].trim();
    
    for (const model of MODELS) {
      const result = await callGeminiSingle(model, apiKey, base64Image, 0);
      
      if (result.success) {
        return { ...result, usedModel: model.name };
      }
      
      if (result.error && result.error.includes('429')) {
        break; 
      }
    }
  }
  
  return { success: false, errorType: "SERVER_OVERLOAD" };
}

export default async function handler(req, res) {
  const startTime = Date.now();

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { base64Image } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: "الصورة مطلوبة" });
    }

    const imageSize = Buffer.byteLength(base64Image, 'base64');
    const maxSize = 3 * 1024 * 1024;
    
    if (imageSize > maxSize) {
      return res.status(400).json({
        error: "حجم الملف كبير جداً",
        message: "حجم الصورة يجب أن يكون أقل من 3 ميجابايت"
      });
    }

    const fingerprint = getFingerprint(req);
    const rateLimitCheck = await checkAndConsumeRateLimit(fingerprint, 2);
    
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        error: "تجاوزت الحد المسموح به اليوم",
        message: `يمكنك تحليل صورتين فقط في اليوم مجاناً.`,
        limit: rateLimitCheck.limit,
        remaining: rateLimitCheck.remaining,
        resetInHours: Math.ceil(rateLimitCheck.reset / 3600)
      });
    }

    const aiResult = await tryAllModels(base64Image);
    
    if (!aiResult.success) {
      return res.status(503).json({
        error: "خوادم المعالجة ممتلئة حالياً",
        message: "جميع محاولات الاتصال بخوادم التحليل فشلت. يرجى إعادة المحاولة بعد 30 ثانية.",
        retryAfter: 30
      });
    }

    await consumeRateLimit(rateLimitCheck.key);
    
    const totalDuration = Date.now() - startTime;

    const validatedResult = {
      plantName: aiResult.result.plantName || "غير معروف",
      healthStatus: aiResult.result.healthStatus || "جيدة",
      mainProblems: Array.isArray(aiResult.result.mainProblems) ? aiResult.result.mainProblems : ["لا توجد مشاكل محددة"],
      problemType: aiResult.result.problemType || "غير محدد",
      diseaseName: aiResult.result.diseaseName || { scientific: "", common: "" },
      symptoms: Array.isArray(aiResult.result.symptoms) ? aiResult.result.symptoms : ["لا توجد أعراض محددة"],
      severity: aiResult.result.severity || "بسيطة",
      affectedParts: Array.isArray(aiResult.result.affectedParts) ? aiResult.result.affectedParts : [],
      pesticides: Array.isArray(aiResult.result.pesticides) ? aiResult.result.pesticides : [],
      organicControl: Array.isArray(aiResult.result.organicControl) ? aiResult.result.organicControl : [],
      treatment: Array.isArray(aiResult.result.treatment) ? aiResult.result.treatment : ["استشر مهندساً زراعياً مصنفاً"],
      careTips: Array.isArray(aiResult.result.careTips) ? aiResult.result.careTips : ["حافظ على تنظيم الري للفترات المقبلة"],
      confidence: aiResult.result.confidence || 85
    };

    return res.status(200).json({
      ...validatedResult,
      rateLimit: {
        remaining: rateLimitCheck.remaining - 1,
        limit: rateLimitCheck.limit,
        resetInHours: Math.ceil(rateLimitCheck.reset / 3600),
        used: rateLimitCheck.used + 1
      },
      metadata: {
        processingTime: totalDuration,
        timestamp: new Date().toISOString(),
        usedModel: aiResult.usedModel || "Primary"
      }
    });

  } catch (err) {
    console.error("Critical System Failure:", err.message);
    
    return res.status(500).json({
      error: "خطأ في خادم التحليل الرئيسي",
      message: "نواجه صعوبة مؤقتة، برجاء إعادة المحاولة لاحقاً."
    });
  }
};