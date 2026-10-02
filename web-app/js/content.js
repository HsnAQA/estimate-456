(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CourseContent = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // Course notes and glossary, in English and Arabic. Text between $...$ is TeX and
  // is typeset by math.js. Sources: 456-solution-Lect1-2.pdf (the lecture),
  // Lect1-456.docx, lect-3.ppt (Pressman, chapter 24), and the COCOMO article
  // (GeeksforGeeks) read in class. Each section names its source.

  const NOTES = [
    {
      id: "why",
      part: 0,
      source: { en: "Lecture 1 notes", ar: "ملاحظات المحاضرة 1" },
      title: { en: "Why projects are estimated", ar: "لماذا نقدّر المشاريع" },
      body: {
        en: `<p>Project management lets an organization deliver software on time and within budget. It has five stages: initiation, planning, execution, controlling, and closing. Estimation belongs to planning: before work starts, the manager needs the size of the product, the effort in person-months, the cost, and the schedule.</p>
<p>The software development life cycle (SDLC) gives the work its order: requirements, design (high level and low level), implementation, testing, deployment, and maintenance. Software configuration management (SCM) keeps changes under control through identification, version control, change control, configuration audit, and status reporting.</p>`,
        ar: `<p>إدارة المشاريع تساعد المؤسسة على تسليم البرنامج في وقته وضمن ميزانيته. لها خمس مراحل: البدء، والتخطيط، والتنفيذ، والمتابعة، والإغلاق. التقدير جزء من التخطيط: قبل بدء العمل يحتاج المدير حجم المنتج، والجهد بالأشخاص-أشهر، والتكلفة، والجدول الزمني.</p>
<p>دورة حياة تطوير البرمجيات (SDLC) ترتب العمل: المتطلبات، ثم التصميم (عالي المستوى ومنخفض المستوى)، ثم البرمجة، ثم الاختبار، ثم النشر، ثم الصيانة. وإدارة إعدادات البرمجيات (SCM) تضبط التغييرات عبر تعريف العناصر، والتحكم في الإصدارات، والتحكم في التغيير، والتدقيق، وتقارير الحالة.</p>`,
      },
    },
    {
      id: "people",
      part: 0,
      source: { en: "Lecture 3 slides (Pressman, chapter 24)", ar: "شرائح المحاضرة 3 (Pressman، الفصل 24)" },
      title: { en: "The four P's and the team", ar: "العناصر الأربعة والفريق" },
      body: {
        en: `<p>Every software project is managed through four P's: <b>People</b>, the most important element; <b>Product</b>, the software to build; <b>Process</b>, the framework activities and tasks; and <b>Project</b>, all the work that makes the product real.</p>
<p>A good team leader follows the MOI model: <b>Motivation</b>, <b>Organization</b>, and <b>Ideas or innovation</b>. Teams lose energy through "toxicity": a frenzied atmosphere, high frustration, poorly coordinated procedures, unclear roles, and repeated failure. The problem is then decomposed (partitioned) into functions, data objects, or classes so that each part can be estimated.</p>`,
        ar: `<p>كل مشروع برمجي يُدار عبر أربعة عناصر: <b>الأشخاص</b> وهم أهم عنصر، و<b>المنتج</b> وهو البرنامج المطلوب، و<b>العملية</b> وهي الأنشطة والمهام، و<b>المشروع</b> وهو كل العمل اللازم لإخراج المنتج.</p>
<p>قائد الفريق الجيد يتبع نموذج MOI: <b>التحفيز</b>، و<b>التنظيم</b>، و<b>الأفكار والابتكار</b>. ويفقد الفريق طاقته بسبب "السمية": جو عمل مضطرب، وإحباط عال، وإجراءات غير منسقة، وأدوار غير واضحة، وفشل متكرر. بعد ذلك يُجزّأ المشروع إلى وظائف أو كائنات بيانات أو أصناف حتى يمكن تقدير كل جزء.</p>`,
      },
    },
    {
      id: "sloc",
      part: 1,
      page: "sloc",
      source: { en: "Lecture, section 4.1, and Lecture 1 notes", ar: "المحاضرة القسم 4.1، وملاحظات المحاضرة 1" },
      title: { en: "SLOC: source lines of code", ar: "SLOC: أسطر الشيفرة المصدرية" },
      body: {
        en: `<p>SLOC measures size directly. It suits projects whose language and technology stay fixed. The count <b>includes</b> code delivered to the client, code written by the team, and declarations. It <b>excludes</b> generated code and comments. Blank lines are not counted either.</p>
<p>With size and productivity known, effort, team duration, and cost follow:</p>
<div class="math-block">$E = \\dfrac{\\text{LOC}}{P}$ &nbsp;&nbsp; $D = \\dfrac{E}{N}$ &nbsp;&nbsp; $\\text{Cost} = E \\times R$</div>
<p>The lecture also shows a second way: first the cost per line, $c_{\\text{LOC}} = R / P$, then $\\text{Cost} = \\text{LOC} \\times c_{\\text{LOC}}$. Both ways give the same exact answer. SLOC depends on the language, and counting effort differs between languages.</p>`,
        ar: `<p>طريقة SLOC تقيس الحجم مباشرة، وتناسب المشاريع التي تبقى لغتها وتقنيتها ثابتة. العدّ <b>يشمل</b> الشيفرة المسلّمة للعميل، والشيفرة التي كتبها الفريق، والتعريفات. و<b>لا يشمل</b> الشيفرة المولّدة آليا ولا التعليقات ولا الأسطر الفارغة.</p>
<p>عند معرفة الحجم والإنتاجية نحسب الجهد ومدة الفريق والتكلفة:</p>
<div class="math-block">$E = \\dfrac{\\text{LOC}}{P}$ &nbsp;&nbsp; $D = \\dfrac{E}{N}$ &nbsp;&nbsp; $\\text{Cost} = E \\times R$</div>
<p>وتعرض المحاضرة طريقة ثانية: نحسب تكلفة السطر أولا $c_{\\text{LOC}} = R / P$ ثم $\\text{Cost} = \\text{LOC} \\times c_{\\text{LOC}}$. والطريقتان تعطيان النتيجة الدقيقة نفسها. عيب SLOC أنها تعتمد على اللغة.</p>`,
      },
    },
    {
      id: "fp",
      part: 1,
      page: "fp",
      source: { en: "Lecture, section 4.2, and Lecture 1 notes", ar: "المحاضرة القسم 4.2، وملاحظات المحاضرة 1" },
      title: { en: "Function Points", ar: "نقاط الوظائف" },
      body: {
        en: `<p>Allan Albrecht introduced Function Points at IBM in 1979. They measure what the software does from the user's view, so they do not depend on the language. Five parameters are counted: user inputs (EI), user outputs (EO), user inquiries (EQ), internal files (ILF), and external interfaces (EIF). Each row has its own complexity weight (Table 2).</p>
<div class="math-block">$\\text{CT} = \\sum_{j=1}^{5} \\text{count}_j \\times w_j$</div>
<p>Fourteen questions, F1 to F14, are scored from 0 (no influence) to 5 (critical). Their sum $\\sum F_i$ lies between 0 and 70, so the adjustment factor lies between 0.65 and 1.35:</p>
<div class="math-block">$\\text{VAF} = 0.65 + 0.01 \\times \\sum F_i$ &nbsp;&nbsp; $\\text{FP} = \\text{CT} \\times \\text{VAF}$</div>
<p>FP can be converted to lines of code with the language's average LOC per FP (Table 1). This is called backfiring: $\\text{LOC} = \\text{FP} \\times \\text{AVC}$.</p>`,
        ar: `<p>قدّم Allan Albrecht نقاط الوظائف في IBM عام 1979. وهي تقيس ما يفعله البرنامج من وجهة نظر المستخدم، لذلك لا تعتمد على لغة البرمجة. نعدّ خمسة معاملات: مدخلات المستخدم (EI)، ومخرجاته (EO)، والاستعلامات (EQ)، والملفات الداخلية (ILF)، والواجهات الخارجية (EIF). ولكل صف وزن تعقيد خاص به (الجدول 2).</p>
<div class="math-block">$\\text{CT} = \\sum_{j=1}^{5} \\text{count}_j \\times w_j$</div>
<p>أربعة عشر سؤالا من F1 إلى F14، تأخذ قيمة من 0 (لا تأثير) إلى 5 (حرج). مجموعها $\\sum F_i$ بين 0 و70، لذلك معامل التعديل بين 0.65 و1.35:</p>
<div class="math-block">$\\text{VAF} = 0.65 + 0.01 \\times \\sum F_i$ &nbsp;&nbsp; $\\text{FP} = \\text{CT} \\times \\text{VAF}$</div>
<p>ويمكن تحويل نقاط الوظائف إلى أسطر شيفرة بمتوسط الأسطر لكل نقطة للغة (الجدول 1)، ويسمى ذلك backfiring: $\\text{LOC} = \\text{FP} \\times \\text{AVC}$.</p>`,
      },
    },
    {
      id: "planning",
      part: 2,
      page: "planning",
      source: { en: "Lecture, sections 4.2.3 to 4.2.5", ar: "المحاضرة الأقسام 4.2.3 إلى 4.2.5" },
      title: { en: "Planning, cost, and quality with FP", ar: "التخطيط والتكلفة والجودة بنقاط الوظائف" },
      body: {
        en: `<p>Once FP is known, it drives the plan. With hours per FP: hours, then days, then person-months. With productivity in FP per person-month: effort and cost.</p>
<div class="math-block">$H = \\text{FP} \\times h_{\\text{FP}}$ &nbsp;&nbsp; $\\text{PM} = \\dfrac{H}{h_{\\text{day}} \\times d_{\\text{month}}}$ &nbsp;&nbsp; $c_{\\text{FP}} = \\dfrac{R}{P_{\\text{FP}}}$</div>
<p>After a project ends, FP also measures quality. Defect density compares projects of different sizes; the lowest value means the best quality.</p>
<div class="math-block">$\\text{Defect density} = \\dfrac{\\text{Defects}}{\\text{FP}}$</div>`,
        ar: `<p>بعد معرفة نقاط الوظائف تصبح أساس الخطة. بالساعات لكل نقطة: نحسب الساعات ثم الأيام ثم الأشخاص-أشهر. وبالإنتاجية (نقاط لكل شخص-شهر): نحسب الجهد والتكلفة.</p>
<div class="math-block">$H = \\text{FP} \\times h_{\\text{FP}}$ &nbsp;&nbsp; $\\text{PM} = \\dfrac{H}{h_{\\text{day}} \\times d_{\\text{month}}}$ &nbsp;&nbsp; $c_{\\text{FP}} = \\dfrac{R}{P_{\\text{FP}}}$</div>
<p>وبعد انتهاء المشروع نقيس الجودة بكثافة العيوب، وهي تقارن مشاريع بأحجام مختلفة، والأقل هو الأفضل جودة.</p>
<div class="math-block">$\\text{Defect density} = \\dfrac{\\text{Defects}}{\\text{FP}}$</div>`,
      },
    },
    {
      id: "cocomo",
      part: 2,
      page: "cocomo",
      source: { en: "Lecture, section 4.3, and the COCOMO article read in class", ar: "المحاضرة القسم 4.3، ومقال COCOMO الذي قُرئ في المحاضرة" },
      title: { en: "COCOMO", ar: "نموذج COCOMO" },
      body: {
        en: `<p>Barry Boehm proposed COCOMO (Constructive Cost Model) in 1981 from a study of 63 projects. A project is one of three types: <b>organic</b> (small team, familiar problem, about 2 to 50 KLOC), <b>semi-detached</b> (mixed experience, about 50 to 300 KLOC), or <b>embedded</b> (tight hardware and operational constraints, 300 KLOC and above).</p>
<p><b>Basic COCOMO</b> uses size only. The lecture's Table 8 gives C and K for each type:</p>
<div class="math-block">$E_i = C \\times \\text{KLOC}^{\\,K}$</div>
<p><b>Intermediate COCOMO</b> multiplies by the effort adjustment factor, the product of 15 cost-driver multipliers (product, computer, personnel, and project attributes). Average is 1.0, and typical values run from 0.9 to 1.4.</p>
<div class="math-block">$\\text{EAF} = \\prod_{j=1}^{15} \\text{EM}_j$ &nbsp;&nbsp; $E = \\text{EAF} \\times E_i$</div>
<p><b>Development time and staff</b> come from the article: $c = 2.5$ for every type, and $d$ is 0.38, 0.35, or 0.32.</p>
<div class="math-block">$T_{\\text{dev}} = c \\times E^{\\,d}$ &nbsp;&nbsp; $\\text{Staff} = \\dfrac{E}{T_{\\text{dev}}}$</div>
<p><b>Advanced (detailed) COCOMO</b> keeps the intermediate steps and assigns cost drivers to each phase: planning and requirements, system design, detailed design, module code and test, and integration and test. The phase efforts are added together.</p>
<p class="muted">Note: the article's Basic table uses 2.4, 3.0, and 3.6 for C, while the lecture's Table 8 uses 3.2, 3.0, and 2.8 (the article's Intermediate values). The calculators follow the lecture.</p>`,
        ar: `<p>اقترح Barry Boehm نموذج COCOMO عام 1981 بعد دراسة 63 مشروعا. المشروع من أحد ثلاثة أنواع: <b>عضوي</b> (فريق صغير ومشكلة مألوفة، تقريبا من 2 إلى 50 KLOC)، أو <b>شبه منفصل</b> (خبرات مختلطة، تقريبا من 50 إلى 300 KLOC)، أو <b>مضمّن</b> (قيود صارمة على العتاد والتشغيل، 300 KLOC فأكثر).</p>
<p><b>COCOMO الأساسي</b> يعتمد على الحجم فقط، والجدول 8 في المحاضرة يعطي C وK لكل نوع:</p>
<div class="math-block">$E_i = C \\times \\text{KLOC}^{\\,K}$</div>
<p><b>COCOMO المتوسط</b> يضرب في معامل تعديل الجهد، وهو حاصل ضرب معاملات 15 محرك تكلفة (خصائص المنتج والحاسوب والأفراد والمشروع). المتوسط قيمته 1.0، والقيم المعتادة من 0.9 إلى 1.4.</p>
<div class="math-block">$\\text{EAF} = \\prod_{j=1}^{15} \\text{EM}_j$ &nbsp;&nbsp; $E = \\text{EAF} \\times E_i$</div>
<p><b>زمن التطوير وعدد الأفراد</b> من المقال: $c = 2.5$ لكل الأنواع، و$d$ تساوي 0.38 أو 0.35 أو 0.32.</p>
<div class="math-block">$T_{\\text{dev}} = c \\times E^{\\,d}$ &nbsp;&nbsp; $\\text{Staff} = \\dfrac{E}{T_{\\text{dev}}}$</div>
<p><b>COCOMO المتقدم (التفصيلي)</b> يحتفظ بخطوات المستوى المتوسط ويعطي محركات التكلفة لكل مرحلة: التخطيط والمتطلبات، وتصميم النظام، والتصميم التفصيلي، وبرمجة الوحدات واختبارها، والتكامل والاختبار. ثم تُجمع جهود المراحل.</p>
<p class="muted">ملاحظة: جدول المقال للنموذج الأساسي يستخدم 2.4 و3.0 و3.6 لقيمة C، بينما الجدول 8 في المحاضرة يستخدم 3.2 و3.0 و2.8 (وهي قيم المستوى المتوسط في المقال). الحاسبات تتبع المحاضرة.</p>`,
      },
    },
    {
      id: "delphi",
      part: 2,
      page: "delphi",
      source: { en: "Lecture, section 4.4", ar: "المحاضرة القسم 4.4" },
      title: { en: "Delphi", ar: "طريقة دلفي" },
      body: {
        en: `<p>Delphi is a human-based technique: when several experts reach the same estimate independently, it is likely correct. The roles are the experts (five or six experienced project managers), the estimation coordinator (like a meeting moderator), and the author (like a recorder).</p>
<p>The experts agree on an acceptable variance, estimate each task alone, and the coordinator marks each task accepted (A) or not accepted (NA). Tasks above the limit are discussed and estimated again from step 5.</p>
<div class="math-block">$V = \\dfrac{\\max - \\min}{\\max} \\times 100$</div>`,
        ar: `<p>دلفي طريقة تعتمد على الخبرة البشرية: إذا وصل عدة خبراء إلى التقدير نفسه بشكل مستقل فالأرجح أنه صحيح. الأدوار: الخبراء (خمسة أو ستة مديري مشاريع ذوي خبرة)، ومنسق التقدير (مثل مدير الاجتماع)، والكاتب (مثل مسجل المحضر).</p>
<p>يتفق الخبراء على نسبة تباين مقبولة، ويقدّر كل خبير المهام وحده، ثم يحدد المنسق لكل مهمة مقبولة (A) أو غير مقبولة (NA). والمهام التي تتجاوز الحد تُناقش ويُعاد تقديرها من الخطوة 5.</p>
<div class="math-block">$V = \\dfrac{\\max - \\min}{\\max} \\times 100$</div>`,
      },
    },
  ];

  // Glossary entries: term, optional TeX symbol, definitions, and the page that uses it.
  const GLOSSARY = [
    { term: "LOC", tex: "\\text{LOC}", page: "sloc", en: "Lines of code: every non-comment, non-blank line, including declarations.", ar: "أسطر الشيفرة: كل سطر ليس تعليقا ولا فارغا، ومنها التعريفات." },
    { term: "SLOC", tex: "\\text{SLOC}", page: "sloc", en: "Source lines of code. The estimation technique that derives effort and cost from LOC.", ar: "أسطر الشيفرة المصدرية. طريقة التقدير التي تحسب الجهد والتكلفة من عدد الأسطر." },
    { term: "KLOC", tex: "\\text{KLOC} = \\dfrac{\\text{LOC}}{1000}", page: "cocomo", en: "Thousands of lines of code. COCOMO measures size in KLOC.", ar: "آلاف الأسطر. نموذج COCOMO يقيس الحجم بوحدة KLOC." },
    { term: "PM (person-month)", tex: "\\text{PM}", page: "sloc", en: "The work one person does in one month. Effort is measured in person-months.", ar: "شخص-شهر: عمل شخص واحد لمدة شهر. ويقاس الجهد بهذه الوحدة." },
    { term: "Effort (E)", tex: "E", page: "sloc", en: "The total work needed, in person-months.", ar: "الجهد: إجمالي العمل المطلوب بالأشخاص-أشهر." },
    { term: "Productivity (P)", tex: "P", page: "sloc", en: "Output per person-month: LOC/PM for SLOC, FP/PM for FP planning.", ar: "الإنتاجية: الناتج لكل شخص-شهر، LOC/PM في SLOC وFP/PM في التخطيط." },
    { term: "Labor rate (R)", tex: "R", page: "sloc", en: "The cost of one person-month.", ar: "أجر العمل: تكلفة شخص-شهر واحد." },
    { term: "Developers (N)", tex: "N", page: "sloc", en: "The number of people sharing the work. Duration is effort divided by N.", ar: "عدد المطورين الذين يتقاسمون العمل. والمدة تساوي الجهد مقسوما على N." },
    { term: "Cost per LOC", tex: "c_{\\text{LOC}} = \\dfrac{R}{P}", page: "sloc", en: "What one line of code costs. Used in the lecture's second way.", ar: "تكلفة السطر الواحد، وتستخدم في الطريقة الثانية بالمحاضرة." },
    { term: "FP (function point)", tex: "\\text{FP}", page: "fp", en: "A unit of software size based on the functions the user sees.", ar: "نقطة الوظيفة: وحدة لحجم البرنامج مبنية على الوظائف التي يراها المستخدم." },
    { term: "EI, EO, EQ, ILF, EIF", tex: "", page: "fp", en: "The five FP parameters: external inputs, external outputs, external inquiries, internal logical files, and external interface files.", ar: "معاملات نقاط الوظائف الخمسة: المدخلات، والمخرجات، والاستعلامات، والملفات الداخلية، وملفات الواجهات الخارجية." },
    { term: "Complexity weight", tex: "w_j", page: "fp", en: "The Simple, Average, or Complex weight of one FP parameter (Table 2).", ar: "وزن التعقيد: الوزن البسيط أو المتوسط أو المعقد لكل معامل (الجدول 2)." },
    { term: "CT (count total)", tex: "\\text{CT} = \\sum \\text{count}_j \\times w_j", page: "fp", en: "The sum of the five weighted rows. Also called UFP, the unadjusted function points.", ar: "إجمالي العد: مجموع الصفوف الخمسة الموزونة، ويسمى أيضا UFP." },
    { term: "Fi (F1 to F14)", tex: "F_i \\in \\{0,\\dots,5\\}", page: "fp", en: "The degree of influence of each of the 14 general system characteristics.", ar: "درجة تأثير كل خاصية من خصائص النظام العامة الأربع عشرة." },
    { term: "ΣFi (TDI)", tex: "0 \\le \\sum F_i \\le 70", page: "fp", en: "The sum of F1 to F14, also called the total degree of influence or total weighting factor.", ar: "مجموع F1 إلى F14، ويسمى أيضا إجمالي درجة التأثير." },
    { term: "GSC / CWF", tex: "", page: "fp", en: "General system characteristics, also called complexity weighting factors: the 14 questions behind Fi.", ar: "خصائص النظام العامة، وتسمى أيضا عوامل ترجيح التعقيد: الأسئلة الأربعة عشر خلف Fi." },
    { term: "VAF / CAF", tex: "\\text{VAF} = 0.65 + 0.01\\sum F_i", page: "fp", en: "The value (or complexity) adjustment factor, between 0.65 and 1.35.", ar: "معامل تعديل القيمة (أو التعقيد)، قيمته بين 0.65 و1.35." },
    { term: "AVC (LOC/FP)", tex: "\\text{LOC} = \\text{FP} \\times \\text{AVC}", page: "fp", en: "The average lines of code per function point for a language (Table 1).", ar: "متوسط أسطر الشيفرة لكل نقطة وظيفة في لغة معينة (الجدول 1)." },
    { term: "Backfiring", tex: "", page: "fp", en: "Converting FP to LOC, or LOC to FP, with the AVC table.", ar: "تحويل نقاط الوظائف إلى أسطر شيفرة أو العكس باستخدام جدول AVC." },
    { term: "Defect density", tex: "\\dfrac{\\text{Defects}}{\\text{FP}}", page: "defects", en: "Defects reported per function point. Lower means better quality.", ar: "عدد العيوب لكل نقطة وظيفة. الأقل يعني جودة أفضل." },
    { term: "COCOMO", tex: "", page: "cocomo", en: "Constructive Cost Model, by Barry Boehm (1981), in Basic, Intermediate, and Advanced levels.", ar: "نموذج التكلفة البنّاء لـ Barry Boehm (1981)، وله مستوى أساسي ومتوسط ومتقدم." },
    { term: "Organic / Semi-detached / Embedded", tex: "", page: "cocomo", en: "The three COCOMO project types, from small and familiar to tightly constrained.", ar: "أنواع مشاريع COCOMO الثلاثة، من الصغير المألوف إلى المقيد بشدة." },
    { term: "C and K", tex: "E_i = C \\times \\text{KLOC}^{\\,K}", page: "cocomo", en: "The effort constants of each project type (Table 8). The article calls them a and b.", ar: "ثوابت الجهد لكل نوع مشروع (الجدول 8)، ويسميها المقال a وb." },
    { term: "Ei (initial effort)", tex: "E_i", page: "cocomo", en: "The effort from size alone, before cost drivers.", ar: "الجهد الأولي من الحجم فقط، قبل محركات التكلفة." },
    { term: "Cost driver / EM", tex: "\\text{EM}_j", page: "cocomo", en: "One of the 15 attributes that change effort, and its effort multiplier. Average is 1.0.", ar: "أحد الخصائص الخمس عشرة التي تغير الجهد، ومعامله. قيمة المتوسط 1.0." },
    { term: "EAF", tex: "\\text{EAF} = \\prod \\text{EM}_j", page: "cocomo", en: "Effort adjustment factor: the product of all cost-driver multipliers.", ar: "معامل تعديل الجهد: حاصل ضرب كل معاملات محركات التكلفة." },
    { term: "Tdev", tex: "T_{\\text{dev}} = c \\times E^{\\,d}", page: "cocomo", en: "Development time in months, with c = 2.5 and d from the project type.", ar: "زمن التطوير بالأشهر، حيث c = 2.5 وd حسب نوع المشروع." },
    { term: "Staff", tex: "\\dfrac{E}{T_{\\text{dev}}}", page: "cocomo", en: "The average number of people needed: effort divided by development time.", ar: "متوسط عدد الأفراد: الجهد مقسوما على زمن التطوير." },
    { term: "Delphi", tex: "", page: "delphi", en: "Estimation by independent expert judgment, repeated until the variance is acceptable.", ar: "التقدير بآراء خبراء مستقلين، ويتكرر حتى يصبح التباين مقبولا." },
    { term: "Variance (Delphi)", tex: "V = \\dfrac{\\max-\\min}{\\max}\\times 100", page: "delphi", en: "How far the maximum and minimum estimates of a task differ, in percent.", ar: "مقدار الفرق بين أعلى وأقل تقدير للمهمة، كنسبة مئوية." },
    { term: "A / NA", tex: "", page: "delphi", en: "Accepted or not accepted: whether a task's variance is within the agreed limit.", ar: "مقبول أو غير مقبول: هل تباين المهمة ضمن الحد المتفق عليه." },
  ];

  return { NOTES, GLOSSARY };
});
