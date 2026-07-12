const fs = require('fs');
const path = require('path');

function loadFertilizerData() {
    const fertilizerData = [];
    const dataFolder = path.join(process.cwd(), 'api', 'fertilizer-data');
    
    if (!fs.existsSync(dataFolder)) {
        return fertilizerData;
    }
    
    const files = fs.readdirSync(dataFolder);
    
    for (const file of files) {
        if (file.endsWith('.json')) {
            try {
                const filePath = path.join(dataFolder, file);
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const data = JSON.parse(fileContent);
                
                fertilizerData.push({
                    name: file,
                    content: data
                });
            } catch (error) {
                console.error(`❌ Error reading ${file}: ${error.message}`);
            }
        }
    }
    
    return fertilizerData;
}

function searchFertilizerProgram(crop, soilType, irrigationType, fertilizerData) {
    let bestMatch = null;
    let highestScore = 0;
    
    for (const file of fertilizerData) {
        const data = file.content;
        
        if (data.programs && Array.isArray(data.programs)) {
            for (const program of data.programs) {
                let programScore = 0;
                
                if (program.plant_ar && program.plant_ar.trim() === crop.trim()) {
                    programScore += 20;
                }
                else if (program.plant_ar && crop.includes(program.plant_ar.trim())) {
                    programScore += 15;
                }
                else if (program.plant_ar && program.plant_ar.trim().includes(crop)) {
                    programScore += 10;
                }
                
                if (program.irrigation_systems && irrigationType) {
                    const matchedIrrigation = program.irrigation_systems.some(sys => 
                        sys.trim().includes(irrigationType) || irrigationType.includes(sys.trim())
                    );
                    if (matchedIrrigation) programScore += 8;
                }
                
                if (programScore > highestScore && programScore >= 10) {
                    highestScore = programScore;
                    bestMatch = {
                        ...program,
                        sourceFile: file.name,
                        score: programScore
                    };
                }
            }
        }
    }
    
    return { program: bestMatch, score: highestScore };
}

function formatProgramForResponse(program, areaFeddan, soilType, irrigationType, budget) {
    if (!program) return null;
    
    const fertilizers = [];
    const schedule = [];
    
    if (program.pre_planting && program.pre_planting.applications) {
        for (const app of program.pre_planting.applications) {
            fertilizers.push({
                name: app.name_ar,
                dose: `${app.dose_kg || app.dose_ar || app.dose_g} ${app.dose_kg ? 'كجم' : (app.dose_ar ? 'لتر' : 'جم')}/فدان`,
                method: app.method_ar,
                timing: program.pre_planting.timing_ar || "قبل الزراعة",
                notes: app.notes_ar || ""
            });
        }
    }
    
    if (program.stages && Array.isArray(program.stages)) {
        for (const stage of program.stages) {
            const stageInfo = {
                stage: stage.stage_ar,
                weeks: `الأسبوع ${stage.week_from} - ${stage.week_to}`,
                description: stage.description_ar,
                irrigation: stage.irrigation_ar,
                watch: stage.watch_ar
            };
            
            if (stage.applications && stage.applications.length > 0) {
                for (const app of stage.applications) {
                    fertilizers.push({
                        name: app.name_ar,
                        dose: `${app.dose_kg || app.dose_ar || app.dose_g} ${app.dose_kg ? 'كجم' : (app.dose_ar ? 'لتر' : 'جم')}/فدان`,
                        method: app.method_ar,
                        timing: stage.stage_ar,
                        notes: app.notes_ar || ""
                    });
                }
            }
            
            schedule.push(stageInfo);
        }
    }
    
    if (areaFeddan && areaFeddan !== 1) {
        for (let i = 0; i < fertilizers.length; i++) {
            const fert = fertilizers[i];
            const doseMatch = fert.dose.match(/(\d+(?:\.\d+)?)\s*(كجم|لتر|جم)/);
            if (doseMatch) {
                const originalValue = parseFloat(doseMatch[1]);
                const newValue = originalValue * areaFeddan;
                fert.dose = fert.dose.replace(originalValue.toString(), newValue.toFixed(1));
                fert.note_adjusted = `تم تعديل الجرعة حسب المساحة (${areaFeddan} فدان)`;
            }
        }
    }
    
    let tips = [];
    let warnings = [];
    
    if (program.summary && program.summary.key_tips_ar) {
        tips = program.summary.key_tips_ar;
    }
    
    if (soilType === 'رملية') {
        warnings.push("التربة الرملية: زد عدد مرات التسميد وقلل الجرعة في كل مرة");
        tips.push("في التربة الرملية، استخدم السماد العضوي بكمية أكبر لتحسين الاحتفاظ بالمغذيات");
    } else if (soilType === 'طينية') {
        warnings.push("التربة الطينية: تجنب الإفراط في الري بعد التسميد لتقليل الفقد");
        tips.push("في التربة الطينية، قلل جرعة النتروجين قليلاً لتجنب النمو الخضري الزائد");
    }
    
    if (budget && budget !== 'غير محددة') {
        const budgetNum = parseInt(budget);
        if (budgetNum && budgetNum < 2000) {
            warnings.push(`الميزانية محدودة (${budget} جنيه)، ركز على الأسمدة الأساسية فقط`);
            tips.push("للتوفير، استخدم السماد البلدي كبديل جزئي للأسمدة الكيماوية");
        }
    }
    
    return {
        crop: program.plant_ar,
        season: program.season_ar,
        duration: `${program.duration_weeks} أسبوع`,
        fertilizers: fertilizers.slice(0, 15),
        schedule: schedule,
        tips: tips,
        warnings: warnings,
        summary: program.summary ? {
            total_n: program.summary.total_n_kg,
            total_p: program.summary.total_p_kg,
            total_k: program.summary.total_k_kg,
            expectedYield: program.summary.expected_yield_ton,
            costGuide: program.summary.total_cost_guide_ar
        } : null,
        source: `برنامج من ${program.sourceFile || 'قاعدة البيانات'}`
    };
}

async function getAIProgram(crop, soilType, irrigationType, areaFeddan, plantingDate, budget, additionalNotes) {
    const API_KEY = process.env.AI_KEY;
    const API_URL = process.env.AI_URL;
    
    if (!API_KEY) {
        throw new Error("AI_KEY is not configured");
    }
    
    const systemPrompt = `أنت خبير زراعي مصري متخصص في برامج التسميد. مهمتك تقديم برنامج تسميد دقيق ومفصل باللغة العربية.`;

    const userPrompt = `قدم برنامج تسميد مفصل للمحصول التالي:

- المحصول: ${crop}
- نوع التربة: ${soilType}
- نظام الري: ${irrigationType}
- المساحة: ${areaFeddan} فدان
- موعد الزراعة: ${plantingDate || 'غير محدد'}
- الميزانية: ${budget || 'غير محددة'}
- ملاحظات إضافية: ${additionalNotes || 'لا توجد'}

الرجاء تقديم برنامج تسميد كامل بالمعلومات التالية بصيغة JSON:

{
  "crop": "اسم المحصول",
  "season": "الموسم المناسب للزراعة",
  "duration": "مدة الموسم بالأسابيع",
  "fertilizers": [
    {
      "name": "اسم السماد",
      "dose": "الجرعة لكل فدان",
      "method": "طريقة التطبيق",
      "timing": "توقيت التطبيق",
      "notes": "ملاحظات إضافية"
    }
  ],
  "schedule": [
    {
      "stage": "اسم المرحلة",
      "weeks": "الأسبوع من - إلى",
      "description": "وصف المرحلة",
      "irrigation": "توصيات الري",
      "watch": "ما يجب مراقبته"
    }
  ],
  "tips": ["نصيحة 1", "نصيحة 2", "نصيحة 3"],
  "warnings": ["تحذير 1", "تحذير 2"],
  "summary": {
    "total_n": "إجمالي النتروجين كجم/فدان",
    "total_p": "إجمالي الفوسفور كجم/فدان",
    "total_k": "إجمالي البوتاسيوم كجم/فدان",
    "expectedYield": "الإنتاج المتوقع طن/فدان",
    "costGuide": "تقدير التكلفة"
  }
}

مهم جداً:
1. اكتب فقط JSON صحيح بدون أي نصوص إضافية
2. استخدم وحدات قياس مناسبة (كجم، لتر، جم)
3. قدم نصائح عملية قابلة للتنفيذ
4. راعِ الظروف المصرية والمناخ المحلي
5. إذا كان المحصول غير معروف، قدم برنامج عام للمحاصيل المشابهة`;

    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ];
    
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
            max_tokens: 2048,
            top_p: 0.85,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Groq API Error:", errorText);
        throw new Error(`Groq API returned ${response.status}`);
    }

    const data = await response.json();
    const aiText = data?.choices?.[0]?.message?.content;
    
    if (!aiText) {
        throw new Error("Empty response from AI");
    }

    let jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Failed to extract JSON from AI response");
    }

    let aiProgram = JSON.parse(jsonMatch[0]);
    
    if (areaFeddan && areaFeddan !== 1 && aiProgram.fertilizers) {
        for (let i = 0; i < aiProgram.fertilizers.length; i++) {
            const fert = aiProgram.fertilizers[i];
            const doseMatch = fert.dose?.match(/(\d+(?:\.\d+)?)\s*(كجم|لتر|جم)/);
            if (doseMatch) {
                const originalValue = parseFloat(doseMatch[1]);
                const newValue = originalValue * areaFeddan;
                fert.dose = fert.dose.replace(originalValue.toString(), newValue.toFixed(1));
                fert.note_adjusted = `تم تعديل الجرعة حسب المساحة (${areaFeddan} فدان)`;
            }
        }
    }
    
    aiProgram.source = "برنامج من الذكاء الاصطناعي (Groq)";
    aiProgram.metadata = {
        soilType: soilType,
        irrigationType: irrigationType,
        area: `${areaFeddan} فدان`,
        plantingDate: plantingDate || 'غير محدد',
        budget: budget || 'غير محدد',
        notes: additionalNotes || 'لا توجد'
    };
    
    return aiProgram;
}

function getDefaultProgram(crop, areaFeddan) {
    return {
        crop: crop,
        season: "حسب الموسم المناسب للمنطقة",
        duration: "حسب نوع المحصول",
        fertilizers: [
            {
                name: "سماد بلدي متخمر",
                dose: `${10 * (areaFeddan || 1)} م³/فدان`,
                method: "نثراً وحرث عميق",
                timing: "قبل الزراعة بـ 2-3 أسابيع",
                notes: "يجب أن يكون السماد متخمراً تماماً"
            },
            {
                name: "سوبر فوسفات أحادي (15.5% P2O5)",
                dose: `${150 * (areaFeddan || 1)} كجم/فدان`,
                method: "نثراً قبل الحرثة الأخيرة",
                timing: "أثناء تجهيز الأرض",
                notes: "مصدر رئيسي للفوسفور"
            },
            {
                name: "نترات النشادر (33.5% N)",
                dose: `${120 * (areaFeddan || 1)} كجم/فدان`,
                method: "نثراً",
                timing: "عمر 20-25 يوم",
                notes: "يضاف على دفعتين"
            },
            {
                name: "سلفات البوتاسيوم (50% K2O)",
                dose: `${80 * (areaFeddan || 1)} كجم/فدان`,
                method: "نثراً",
                timing: "عمر 45-50 يوم",
                notes: "يحسن جودة المحصول"
            }
        ],
        schedule: [
            {
                stage: "تجهيز الأرض",
                weeks: "قبل الزراعة بـ 2-3 أسابيع",
                description: "حرث الأرض وإضافة السماد البلدي والفوسفات",
                irrigation: "ري على البارد قبل الزراعة",
                watch: "تأكد من تجانس السماد في التربة"
            },
            {
                stage: "الزراعة والإنبات",
                weeks: "الأسبوع 1-3",
                description: "زراعة البذور أو الشتلات",
                irrigation: "ري خفيف ومنتظم",
                watch: "انتظام الإنبات"
            },
            {
                stage: "النمو الخضري",
                weeks: "الأسبوع 4-8",
                description: "النمو النشط للنبات",
                irrigation: "ري حسب احتياج المحصول",
                watch: "علامات نقص العناصر"
            },
            {
                stage: "التزهير والعقد",
                weeks: "الأسبوع 9-12",
                description: "مرحلة التزهير وعقد الثمار",
                irrigation: "ري منتظم دون إجهاد",
                watch: "الآفات والأمراض"
            },
            {
                stage: "النضج والحصاد",
                weeks: "الأسبوع 13-16",
                description: "نضج المحصول وجاهزيته للحصاد",
                irrigation: "تقليل الري تدريجياً",
                watch: "علامات النضج"
            }
        ],
        tips: [
            "قم بتحليل التربة قبل التسميد لتحديد الاحتياجات بدقة",
            "وزع الأسمدة على دفعات لتجنب الفقد",
            "أضف الأسمدة الذائبة مع مياه الري في حالة الري بالتنقيط",
            "راقب النباتات باستمرار للكشف المبكر عن أي نقص غذائي",
            "احصل على استشارة مهندس زراعي متخصص"
        ],
        warnings: [
            "لا تفرط في استخدام الأسمدة النتروجينية لتجنب التلوث البيئي",
            "تجنب التسميد في الجو الحار أو قبل هطول الأمطار الغزيرة",
            "احفظ الأسمدة في مكان جاف بعيداً عن متناول الأطفال",
            "اتبع تعليمات السلامة عند التعامل مع الأسمدة الكيماوية"
        ],
        summary: {
            total_n: `${120 * (areaFeddan || 1)} كجم`,
            total_p: `${150 * (areaFeddan || 1)} كجم`,
            total_k: `${80 * (areaFeddan || 1)} كجم`,
            expectedYield: "حسب نوع المحصول والظروف",
            costGuide: "متوسط"
        },
        source: "برنامج تسميد عام (افتراضي)",
        metadata: {
            note: "هذا برنامج تسميد عام. للحصول على برنامج مخصص، يرجى استشارة مهندس زراعي."
        }
    };
}

module.exports = async function handler(req, res) {
    const requestId = Math.random().toString(36).substring(7).toUpperCase();
    const startTime = Date.now();

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = req.body;
        const { crop, soilType, irrigationType, areaFeddan, plantingDate, budget, additionalNotes } = data;

        if (!crop || !soilType || !irrigationType || !areaFeddan) {
            return res.status(400).json({ error: 'يرجى إدخال البيانات الأساسية' });
        }

        const fertilizerData = loadFertilizerData();
        const { program, score } = searchFertilizerProgram(crop, soilType, irrigationType, fertilizerData);
        
        let finalPlan = null;
        let source = 'local';
        let usedAI = false;
        
        if (program && score >= 10) {
            finalPlan = formatProgramForResponse(program, areaFeddan, soilType, irrigationType, budget);
            
            if (!finalPlan) {
                throw new Error('فشل في تنسيق البرنامج');
            }
        } 
        
        if (!finalPlan) {
            try {
                const aiProgram = await getAIProgram(crop, soilType, irrigationType, areaFeddan, plantingDate, budget, additionalNotes);
                finalPlan = aiProgram;
                source = 'ai';
                usedAI = true;
            } catch (aiError) {
                console.error(`[${requestId}] ❌ AI failed:`, aiError.message);
                finalPlan = getDefaultProgram(crop, areaFeddan);
                source = 'default';
            }
        }
        
        if (!finalPlan.metadata) {
            finalPlan.metadata = {
                soilType: soilType,
                irrigationType: irrigationType,
                area: `${areaFeddan} فدان`,
                plantingDate: plantingDate || 'غير محدد',
                budget: budget || 'غير محدد',
                notes: additionalNotes || 'لا توجد'
            };
        }
        
        const duration = Date.now() - startTime;

        return res.status(200).json({
            success: true,
            plan: finalPlan,
            source: source,
            matchScore: score || 0,
            usedAI: usedAI,
            requestId: requestId,
            processingTime: `${duration}ms`
        });

    } catch (error) {
        console.error(`[${requestId}] Failure:`, error.message);
        
        try {
            const body = req.body;
            const defaultPlan = getDefaultProgram(body.crop || 'المحصول', body.areaFeddan || 1);
            return res.status(200).json({
                success: true,
                plan: defaultPlan,
                source: 'fallback',
                requestId: requestId,
                note: 'تم استخدام برنامج تسميد عام بسبب خطأ في النظام'
            });
        } catch (e) {
            return res.status(500).json({ 
                error: "حدث خطأ في النظام، يرجى المحاولة ثانية", 
                details: error.message,
                requestId 
            });
        }
    }
};