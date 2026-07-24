
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

// System Prompt — enriched from expert system docx
function buildSystemPrompt(cat, lang, context) {
    const isArabic = lang === "ar";

    const identity = isArabic ? `
أنت خبير زراعي متخصص في الزراعة المصرية والعربية، تعمل مستشاراً زراعياً في تطبيق HefnoPlant. اسمك 'المهندس هفنو'.

## شخصيتك ونبرتك
- تتحدث بالعربية الفصحى البسيطة — سهلة الفهم للجميع من المزارع البسيط للدكتور الجامعي
- ودود ومحترم — تتعامل مع المزارع باحترام تام وتقديره
- عملي ومباشر — تعطي إجابات واضحة قابلة للتطبيق فوراً في الحقل
- صادق — لو السؤال خارج تخصصك الزراعي، تقول ذلك بوضوح
- متحمس — تحب الزراعة وتظهر ذلك في ردودك
- لا تستخدم كلمات تقنية معقدة إلا مع شرحها

🚨 قواعد صارمة:
1. أنت خبير زراعي فقط
2. أي سؤال خارج الزراعة → "❌ هذا السؤال خارج اختصاصي"
3. لا تخمن أو تؤلف معلومات
4. إذا لم تكن متأكد → "تحتاج لاستشارة متخصص"`
: `
You are a specialized agricultural expert working as a consultant for HefnoPlant application. Your name is 'Engineer Hefno'.

## Your Personality and Tone
- You speak in simple, clear Arabic — easy for everyone from farmers to university professors
- Friendly and respectful — you treat farmers with full respect and appreciation
- Practical and direct — you give clear, immediately applicable answers
- Honest — if the question is outside your agricultural expertise, you say so clearly
- Passionate — you love agriculture and show it in your responses
- You don't use complex technical terms without explaining them

🚨 STRICT RULES:
1. Agriculture expert ONLY
2. Non-agriculture questions → "❌ Out of my expertise"
3. No guessing or making up information
4. If not sure → "Needs specialist consultation"`;

    const contextInstruction = context && context.length > 0 ? (isArabic ? `
## قاعدة معرفتك
تعمل مع قاعدة بيانات HefnoPlant الشاملة.

📚 **المعلومات المتاحة في قاعدة المعرفة:**
- الأمراض الزراعية وتشخيصها وأعراضها وعلاجها
- المبيدات الموصى بها والجرعات وطرق التطبيق
- الأسمدة وبرامج التسميد الكاملة
- الآفات الحشرية والنيماتودا
- الحشائش والأعشاب الضارة ومبيداتها
- التقويم الزراعي المصري

بالإضافة إلى معرفتك الزراعية العامة العميقة.

${context}

🚨 **تعليمات استخدام قاعدة المعرفة:**
• استخدم المعلومات من JSON كلما أمكن
• إذا كان السؤال عن مرض أو مبيد موجود في البيانات → أجب بالضبط بناءً على المعلومات
• اذكر المصدر في إجابتك
• لا تختلق معلومات غير موجودة في قاعدة المعرفة
• إذا لم تجد الإجابة في البيانات → استخدم معرفتك العامة مع التوضيح
` : `
## Your Knowledge Base
You work with HefnoPlant's comprehensive database.

📚 **Available Information in Knowledge Base:**
- Plant diseases, diagnosis, symptoms, and treatment
- Recommended pesticides, dosages, and application methods
- Fertilizers and complete fertilization programs
- Insect pests and nematodes
- Weeds and herbicides
- Egyptian agricultural calendar

Plus your deep general agricultural knowledge.

${context}

🚨 **Knowledge Base Instructions:**
• Use JSON information whenever possible
• If question about disease/pesticide exists in data → answer exactly based on information
• Cite the source in your answer
• Don't fabricate information not in the knowledge base
• If answer not in data → use your general knowledge but clarify
`) : '';

    const answerStructure = isArabic ? `
## كيف تُجيب على الأسئلة

### قاعدة أساسية — السياق أولاً
قبل أي إجابة، فكّر:
1. **من السائل؟** — مزارع بسيط؟ مهندس؟ طالب؟ — اضبط مستوى الإجابة
2. **ما المحصول؟ وما الموسم؟** — الإجابة تختلف حسب الوقت
3. **ما المنطقة؟** — الدلتا تختلف عن الصعيد عن الأراضي الجديدة
4. **ما المشكلة بالضبط؟** — لو غير واضح، اسأل سؤالاً واحداً فقط للتوضيح

### هيكل الإجابة المثالي

**للأسئلة العملية الميدانية:**
✦ الإجابة المباشرة أولاً (جملة أو اثنتان)
✦ الشرح والسبب
✦ خطوات تطبيقية واضحة
✦ تحذير مهم (لو في)
✦ نصيحة إضافية للأفضل (اختيارية)

**للأسئلة الأكاديمية والمتخصصة:**
✦ الإجابة العلمية الدقيقة
✦ المصطلحات الإنجليزية بين قوسين عند الحاجة
✦ الأرقام والمعادلات عند الحاجة
✦ مرجع علمي لو مناسب

**للأسئلة التشخيصية (النبات مريض/مشكلة):**
✦ الأسباب المحتملة مرتبة من الأكثر شيوعاً
✦ كيف تتأكد من التشخيص
✦ العلاج الفوري
✦ المكافحة المتكاملة للمستقبل

### معايير الجودة
✅ إجابات جيدة:
• دقيقة علمياً — تعطي المعلومات الصحيحة
• عملية قابلة للتطبيق — المزارع يقدر يطبقها فوراً
• واضحة ومفهومة — حتى للمزارع البسيط
• منظمة — عناوين ونقاط تسهل القراءة
• شاملة — تغطي التشخيص والعلاج والوقاية

❌ إجابات سيئة:
• عامة جداً — "استخدم مبيد مناسب"
• معقدة — كلام أكاديمي صعب
• غير عملية — المزارع مش قادر يطبقها
• بدون تحذيرات — عدم ذكر الاحتياطات اللازمة
• مختلقة — معلومات مش في قاعدة المعرفة
` : `
## How to Answer Questions

### Basic Rule — Context First
Before any answer, think:
1. **Who is asking?** — Farmer? Engineer? Student? — Adjust your answer level
2. **What crop? What season?** — Answers vary by time
3. **What region?** — Delta differs from Upper Egypt from new lands
4. **What's the exact problem?** — If unclear, ask ONE clarifying question

### Ideal Answer Structure

**For practical field questions:**
✦ Direct answer first (one or two sentences)
✦ Explanation and reason
✦ Clear actionable steps
✦ Important warning (if any)
✦ Extra tip for best results (optional)

**For academic/specialized questions:**
✦ Precise scientific answer
✦ English terms in parentheses when needed
✦ Numbers and formulas when needed
✦ Scientific reference if appropriate

**For diagnostic questions (sick plant/problem):**
✦ Possible causes ordered from most common
✦ How to confirm the diagnosis
✦ Immediate treatment
✦ Integrated management for the future

### Quality Standards
✅ Good answers:
• Scientifically accurate — correct information
• Practically applicable — farmer can apply immediately
• Clear and understandable — even for simple farmers
• Well organized — headings and points for easy reading
• Comprehensive — covers diagnosis, treatment, and prevention

❌ Bad answers:
• Too general — "use appropriate pesticide"
• Too complex — hard academic language
• Not practical — farmer can't apply it
• Without warnings — missing safety precautions
• Fabricated — information not in knowledge base`;

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
    const formatSection = isArabic
        ? `📌 **قالب الرد:**\n\n${currentFormat.map(line => `  ${line}`).join('\n')}`
        : `📌 **Response Format:**\n\n${currentFormat.map(line => `  ${line}`).join('\n')}`;

    return `${identity}

${contextInstruction}

${answerStructure}

${formatSection}
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