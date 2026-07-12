
const { Redis } = require('@upstash/redis');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

//  Redis
const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.TOKEN
});

// دالة الـ Rate Limit
async function checkRateLimit(fingerprint, limit = 20) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `chat:${fingerprint}:${today}`;
  const count = (await redis.get(key)) || 0;

  if (count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      reset: 86400,
      limit: limit
    };
  }

  await redis.incr(key);
  await redis.expire(key, 86400);

  return {
    allowed: true,
    remaining: limit - count - 1,
    reset: 86400,
    limit: limit
  };
}

// دالة للحصول على FingerPrint المستخدم
function getFingerprint(req) {
  const headers = req.headers;
  
  const ip = headers["x-forwarded-for"] || 
             headers["client-ip"] || 
             headers["x-real-ip"] || 
             "unknown";
  
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

// ==========  التعامل مع JSON ==========

async function loadAllJSONs(jsonFolder) {
    const jsonData = [];
    
    if (!fs.existsSync(jsonFolder)) {
        return jsonData;
    }
    
    const files = fs.readdirSync(jsonFolder);
    
    for (const file of files) {
        if (file.endsWith('.json')) {
            try {
                const jsonPath = path.join(jsonFolder, file);
                const fileContent = fs.readFileSync(jsonPath, 'utf-8');
                const data = JSON.parse(fileContent);
                
                jsonData.push({
                    name: file,
                    content: data
                });
                
            } catch (error) {
                console.error(`❌ خطأ في قراءة JSON ${file}: ${error.message}`);
            }
        }
    }
    
    return jsonData;
}

function diseasesToContext(jsonData) {
    let context = "";
    let totalChars = 0;
    const MAX_CONTEXT_CHARS = 30000;
    
    for (const jsonFile of jsonData) {
        const data = jsonFile.content;
        let fileContext = `\n\n📄 **المصدر: ${jsonFile.name}**\n`;
        fileContext += `📊 قاعدة بيانات: ${data.name_ar || 'أمراض النبات'}\n`;
        fileContext += `📅 الإصدار: ${data.version || '1.0'}\n`;
        fileContext += `🌍 النطاق: ${data.scope || 'مصر والوطن العربي'}\n`;
        
        if (data.diseases && Array.isArray(data.diseases)) {
            fileContext += `\n🦠 **الأمراض الزراعية (${data.diseases.length} مرض):**\n`;
            
            for (const disease of data.diseases) {
                let diseaseContext = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                diseaseContext += `📌 ${disease.name_ar || 'غير محدد'}\n`;
                
                if (disease.scientific_name) {
                    diseaseContext += `🔬 الاسم العلمي: ${disease.scientific_name}\n`;
                }
                if (disease.group_ar) {
                    diseaseContext += `📂 المجموعة: ${disease.group_ar} | ${disease.group_en || ''}\n`;
                }
                if (disease.family_ar) {
                    diseaseContext += `🏛️ الفصيلة: ${disease.family_ar}\n`;
                }
                if (disease.type) {
                    diseaseContext += `📍 نوع المرض: ${disease.type}\n`;
                }
                if (disease.severity) {
                    const severityText = {
                        'very high': 'شديد جداً',
                        'high': 'شديد',
                        'medium': 'متوسط',
                        'low': 'خفيف'
                    }[disease.severity] || disease.severity;
                    diseaseContext += `⚠️ شدة المرض: ${severityText}\n`;
                }
                if (disease.season) {
                    diseaseContext += `📅 الموسم: ${disease.season}\n`;
                }
                
                if (disease.symptoms && Array.isArray(disease.symptoms) && disease.symptoms.length > 0) {
                    diseaseContext += `\n🔍 الأعراض:\n`;
                    for (const symptom of disease.symptoms.slice(0, 8)) {
                        diseaseContext += `  • ${symptom}\n`;
                    }
                    if (disease.symptoms.length > 8) {
                        diseaseContext += `  • ... و${disease.symptoms.length - 8} أعراض أخرى\n`;
                    }
                }
                
                if (disease.favorable_conditions) {
                    diseaseContext += `\n🌡️ الظروف الملائمة:\n  ${disease.favorable_conditions}\n`;
                }
                
                if (disease.host_plants && Array.isArray(disease.host_plants) && disease.host_plants.length > 0) {
                    diseaseContext += `\n🌱 المحاصيل المصابة:\n  `;
                    diseaseContext += disease.host_plants.slice(0, 10).join('، ');
                    if (disease.host_plants.length > 10) {
                        diseaseContext += ` ... +${disease.host_plants.length - 10}`;
                    }
                    diseaseContext += `\n`;
                }
                
                if (disease.economic_threshold) {
                    diseaseContext += `\n📊 العتبة الاقتصادية:\n  ${disease.economic_threshold}\n`;
                }
                
                if (disease.active_ingredients && Array.isArray(disease.active_ingredients) && disease.active_ingredients.length > 0) {
                    diseaseContext += `\n💊 المواد الفعالة الموصى بها:\n`;
                    for (const ai of disease.active_ingredients.slice(0, 6)) {
                        diseaseContext += `  • ${ai}\n`;
                    }
                    if (disease.active_ingredients.length > 6) {
                        diseaseContext += `  • ... و${disease.active_ingredients.length - 6} مواد أخرى\n`;
                    }
                }
                
                if (disease.biological_control && Array.isArray(disease.biological_control) && disease.biological_control.length > 0) {
                    diseaseContext += `\n🐞 المكافحة الحيوية:\n`;
                    for (const bio of disease.biological_control.slice(0, 4)) {
                        diseaseContext += `  • ${bio}\n`;
                    }
                }
                
                if (disease.cultural_control && Array.isArray(disease.cultural_control) && disease.cultural_control.length > 0) {
                    diseaseContext += `\n🌾 المكافحة الزراعية:\n`;
                    for (const cultural of disease.cultural_control.slice(0, 4)) {
                        diseaseContext += `  • ${cultural}\n`;
                    }
                }
                
                if (disease.resistance_risk) {
                    diseaseContext += `\n⚠️ مقاومة المبيدات: ${disease.resistance_risk}\n`;
                }
                
                if (disease.ai_prompt) {
                    diseaseContext += `\n🤖 ملخص للمساعد الذكي:\n  ${disease.ai_prompt}\n`;
                }
                
                if (totalChars + diseaseContext.length <= MAX_CONTEXT_CHARS) {
                    fileContext += diseaseContext;
                    totalChars += diseaseContext.length;
                } else {
                    break;
                }
            }
        }
        
        if (totalChars + fileContext.length <= MAX_CONTEXT_CHARS) {
            context += fileContext;
            totalChars += fileContext.length;
        } else {
            break;
        }
    }
    
    return context;
}

function searchDiseaseInData(jsonData, diseaseName) {
    const results = [];
    const searchTerm = diseaseName.toLowerCase();
    
    for (const jsonFile of jsonData) {
        const data = jsonFile.content;
        if (data.diseases && Array.isArray(data.diseases)) {
            for (const disease of data.diseases) {
                if (disease.name_ar?.toLowerCase().includes(searchTerm) ||
                    disease.scientific_name?.toLowerCase().includes(searchTerm)) {
                    results.push({
                        disease: disease,
                        source: jsonFile.name,
                        matchScore: disease.name_ar?.toLowerCase() === searchTerm ? 100 : 80
                    });
                }
            }
        }
    }
    
    return results.sort((a, b) => b.matchScore - a.matchScore);
}

async function getSmartContext(jsonData, userMessage, maxChars = 25000) {
    let context = "";
    let totalChars = 0;
    
    const keywords = extractKeywords(userMessage);
    
    const relevantDiseases = [];
    
    for (const jsonFile of jsonData) {
        const data = jsonFile.content;
        if (data.diseases && Array.isArray(data.diseases)) {
            for (const disease of data.diseases) {
                let relevanceScore = 0;
                
                for (const keyword of keywords) {
                    if (disease.name_ar?.toLowerCase().includes(keyword)) relevanceScore += 10;
                    if (disease.scientific_name?.toLowerCase().includes(keyword)) relevanceScore += 8;
                    if (disease.symptoms?.some(s => s.toLowerCase().includes(keyword))) relevanceScore += 5;
                    if (disease.host_plants?.some(h => h.toLowerCase().includes(keyword))) relevanceScore += 4;
                    if (disease.active_ingredients?.some(ai => ai.toLowerCase().includes(keyword))) relevanceScore += 3;
                }
                
                if (relevanceScore > 0) {
                    relevantDiseases.push({
                        disease: disease,
                        score: relevanceScore,
                        source: jsonFile.name
                    });
                }
            }
        }
    }
    
    relevantDiseases.sort((a, b) => b.score - a.score);
    const topDiseases = relevantDiseases.slice(0, 3);
    
    for (const item of topDiseases) {
        const disease = item.disease;
        let diseaseContext = `\n\n📌 **${disease.name_ar}** (درجة الصلة: ${item.score})\n`;
        diseaseContext += `🔬 الاسم العلمي: ${disease.scientific_name || 'غير محدد'}\n`;
        
        if (disease.symptoms && disease.symptoms.length > 0) {
            diseaseContext += `🔍 الأعراض:\n`;
            for (const symptom of disease.symptoms.slice(0, 5)) {
                diseaseContext += `  • ${symptom}\n`;
            }
        }
        
        if (disease.active_ingredients && disease.active_ingredients.length > 0) {
            diseaseContext += `💊 المواد الفعالة:\n`;
            for (const ai of disease.active_ingredients.slice(0, 5)) {
                diseaseContext += `  • ${ai}\n`;
            }
        }
        
        if (disease.cultural_control && disease.cultural_control.length > 0) {
            diseaseContext += `🌾 مكافحة زراعية:\n  ${disease.cultural_control.slice(0, 3).join('; ')}\n`;
        }
        
        if (totalChars + diseaseContext.length <= maxChars) {
            context += diseaseContext;
            totalChars += diseaseContext.length;
        }
    }
    
    if (context.length === 0) {
        context = await diseasesToContext(jsonData);
        context = context.substring(0, maxChars);
    }
    
    return context;
}

function extractKeywords(text) {
    const cleanText = text.toLowerCase()
        .replace(/[؟!،؛:."'()\[\]{}]/g, '')
        .replace(/\s+/g, ' ');
    
    const stopWords = ['ما', 'هو', 'هل', 'كيف', 'متى', 'أين', 'لماذا', 'على', 'في', 'من', 'إلى', 'عن', 'مع', 'كل', 'بعض', 'هذه', 'هذا', 'ذلك', 'تلك', 'كان', 'كانت', 'يكون', 'تصبح', 'أصبح', 'لقد', 'قد', 'ربما', 'لكن', 'لذلك', 'حيث', 'بين', 'بعد', 'قبل', 'عند', 'حتى', 'أثناء', 'بدون', 'ضد', 'مثل', 'نفس', 'أي', 'أيضا', 'كذلك', 'هناك', 'هنا'];
    
    const words = cleanText.split(' ');
    const keywords = [];
    
    for (const word of words) {
        if (word.length > 2 && !stopWords.includes(word)) {
            keywords.push(word);
        }
    }
    
    return [...new Set(keywords)];
}

// System Prompt
function buildSystemPrompt(cat, lang, context) {
    const isArabic = lang === "ar";
    
    const contextInstruction = context && context.length > 0 ? (isArabic ? `
📚 **قاعدة المعرفة المتاحة (JSON Database):**

لديك قاعدة بيانات متخصصة تحتوي على معلومات دقيقة عن:
• الأمراض الزراعية وتشخيصها
• المبيدات الموصى بها والجرعات
• طرق المكافحة والعلاج
• الأسمدة والتسميد

${context}

🚨 **تعليمات استخدام قاعدة المعرفة:**
• استخدم المعلومات من JSON كلما أمكن
• إذا كان السؤال عن مرض أو مبيد موجود في البيانات → أجب بالضبط بناءً على المعلومات
• اذكر المصدر (اسم ملف JSON) في إجابتك
• لا تختلق معلومات غير موجودة في قاعدة المعرفة
• إذا لم تجد الإجابة في البيانات → استخدم معرفتك العامة مع التوضيح
` : `
📚 **Available Knowledge Base (JSON Database):**

You have a specialized database with accurate information about:
• Plant diseases and diagnosis
• Recommended pesticides and dosages
• Control and treatment methods
• Fertilizers

${context}

🚨 **Knowledge Base Instructions:**
• Use JSON information whenever possible
• If question about disease/pesticide exists in data → answer exactly based on information
• Cite the source (JSON file name) in your answer
• Don't fabricate information not in the knowledge base
• If answer not in data → use your general knowledge but clarify
`) : '';

    const identity = isArabic
        ? `أنت خبير زراعي محترف حاصل على دكتوراه في العلوم الزراعية، لديك خبرة 20 عاماً.`
        : `You are a professional agricultural expert with a PhD in Agricultural Sciences.`;

    const domainGuard = isArabic
        ? `
🚨 قواعد صارمة:
1. أنت خبير زراعي فقط
2. أي سؤال خارج الزراعة → "❌ هذا السؤال خارج اختصاصي"
3. لا تخمن أو تؤلف معلومات
4. إذا لم تكن متأكد → "تحتاج لاستشارة متخصص"`
        : `
🚨 STRICT RULES:
1. Agriculture expert ONLY
2. Non-agriculture questions → "❌ Out of my expertise"
3. No guessing or making up information
4. If not sure → "Needs specialist consultation"`;

    const formatRules = {
        diseases: isArabic
            ? [
                "🔬 **التشخيص**: [اسم المرض]",
                "⚠️ **الأعراض**: [وصف الأعراض]",
                "💊 **العلاج**: [المبيد والجرعة]",
                "📄 **المصدر**: Database"
            ]
            : [
                "🔬 **Diagnosis**: [Disease name]",
                "⚠️ **Symptoms**: [Description]",
                "💊 **Treatment**: [Pesticide and dosage]",
                "📄 **Source**: [JSON file name]"
            ],
        treatment: isArabic
            ? [
                "💊 **العلاج**: [اسم المبيد]",
                "⚖️ **الجرعة**: [الكمية]",
                "⚠️ **التحذيرات**: [احتياطات السلامة]",
                "📄 **المصدر**: [اسم ملف JSON]"
            ]
            : [
                "💊 **Treatment**: [Pesticide name]",
                "⚖️ **Dosage**: [Amount]",
                "⚠️ **Warnings**: [Safety precautions]",
                "📄 **Source**: [JSON file name]"
            ],
        general: isArabic
            ? [
                "📚 **الإجابة**: [معلومة دقيقة]",
                "💡 **نصيحة**: [توصية عملية]"
            ]
            : [
                "📚 **Answer**: [Accurate information]",
                "💡 **Tip**: [Practical recommendation]"
            ],
    };

    const currentFormat = formatRules[cat] || formatRules.general;

    return `
${identity}

${domainGuard}

${contextInstruction}

📌 **قالب الرد:**

${currentFormat.map(line => `  ${line}`).join('\n')}
`;
}

function sanitizeInput(input) {
    return input
        .replace(/<[^>]*>/g, "")
        .replace(/ignore previous instructions/gi, "")
        .trim();
}

function formatResponse(text) {
    let formatted = text.replace(/\n{3,}/g, "\n\n");
    formatted = formatted.replace(/•([^\s])/g, "• $1");
    return formatted.trim();
}

// ==================== الـ Handler الرئيسي (لـ Vercel) ====================

module.exports = async function handler(req, res) {
    const requestId = Math.random().toString(36).substring(7).toUpperCase();
    const startTime = Date.now();

    try {
        // ✅ التحقق من الطريقة
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method Not Allowed" });
        }

        // ✅ الحصول على البصمة
        const fingerprint = getFingerprint(req);
        const rateLimit = await checkRateLimit(fingerprint, 10);
        
        if (!rateLimit.allowed) {
            return res.status(429).json({
                error: true,
                message: `❌ تجاوزت الحد المسموح به (${rateLimit.limit} سؤال/يوم). الرجاء المحاولة غداً.`,
                rateLimit: {
                    remaining: rateLimit.remaining,
                    limit: rateLimit.limit,
                    resetInHours: Math.ceil(rateLimit.reset / 3600)
                }
            });
        }

        // ✅ قراءة البيانات (Vercel بيفك JSON تلقائياً)
        const { userMessage, category, conversationHistory, language = "ar" } = req.body;

        if (!userMessage || typeof userMessage !== "string") {
            return res.status(400).json({ error: "الرسالة مطلوبة" });
        }

        // ========== تحميل JSON ==========
        const jsonFolder = path.join(process.cwd(), 'api', 'json-data');
        const jsonDocuments = await loadAllJSONs(jsonFolder);
        const jsonContext = await getSmartContext(jsonDocuments, userMessage, 25000);
        
        // ============================================

        const safeUserMessage = sanitizeInput(userMessage);
        
        const messages = [
            { role: "system", content: buildSystemPrompt(category, language, jsonContext) }
        ];

        if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
            const recentHistory = conversationHistory.slice(-5);
            recentHistory.forEach(msg => {
                if (msg.role === "user" && msg.text) {
                    messages.push({ role: "user", content: sanitizeInput(msg.text) });
                } else if (msg.role === "assistant" && msg.text) {
                    messages.push({ role: "assistant", content: msg.text });
                }
            });
        }

        messages.push({ role: "user", content: safeUserMessage });

        const API_KEY = process.env.AI_KEY;
        const API_URL = process.env.AI_URL;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: messages,
                temperature: 0.3,
                max_tokens: 1200,
                top_p: 0.85,
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API returned status ${response.status}`);
        }

        const data = await response.json();
        let aiText = data?.choices?.[0]?.message?.content;

        if (!aiText) {
            aiText = "عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.";
        }

        const duration = Date.now() - startTime;

        return res.status(200).json({ 
            reply: formatResponse(aiText), 
            requestId: requestId,
            speed: `${duration}ms`,
            category: category || 'general',
            rateLimit: {
                remaining: rateLimit.remaining,
                limit: rateLimit.limit,
                resetInHours: Math.ceil(rateLimit.reset / 3600)
            }
        });

    } catch (error) {
        console.error(`[${requestId}] 🔥 ERROR:`, error.message);
        
        return res.status(500).json({
            error: true,
            message: "عذراً، حدث خطأ في النظام. يرجى المحاولة مرة أخرى.",
            requestId: requestId
        });
    }
};