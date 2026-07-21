const form = document.querySelector("#strategy-form");
const outputArea = document.querySelector("#output-area");
const errorEl = document.querySelector("#form-error");
const sampleButton = document.querySelector("#sample-button");
const resetButton = document.querySelector("#reset-button");
const copyButton = document.querySelector("#copy-button");
const copyLabel = document.querySelector("#copy-label");

const sampleInput = {
    companyDomain: "clay.com",
    notes: "GTM teams use it for enrichment, outbound, inbound routing, and sales research."
};

const assumptionKeys = [
    "companyName",
    "productCategory",
    "stage",
    "teamSize",
    "targetBuyer",
    "averageAcv",
    "salesCycle",
    "targetRevenue",
    "monthlyBudget",
    "objective",
    "primaryChannel",
    "bottleneck",
    "traction"
];

const knownProfiles = {
    "clay.com": {
        companyName: "Clay",
        productCategory: "GTM data orchestration platform",
        targetBuyer: "GTM leaders, RevOps teams, and growth teams at B2B SaaS companies",
        averageAcv: "24000",
        salesCycle: "45",
        targetRevenue: "120000",
        monthlyBudget: "9000",
        stage: "growth",
        teamSize: "pods",
        objective: "pipeline",
        primaryChannel: "founder",
        bottleneck: "trust",
        traction: "content",
        evidence: ["GTM workflow language", "enrichment and orchestration use cases", "strong practitioner community"],
        competitors: ["Apollo", "ZoomInfo", "Clearbit", "Ocean.io"]
    },
    "ramp.com": {
        companyName: "Ramp",
        productCategory: "finance automation platform",
        targetBuyer: "CFOs, controllers, and finance operations leaders at scaling companies",
        averageAcv: "42000",
        salesCycle: "70",
        targetRevenue: "210000",
        monthlyBudget: "18000",
        stage: "growth",
        teamSize: "scaled",
        objective: "moveUpmarket",
        primaryChannel: "partners",
        bottleneck: "conversion",
        traction: "enterprise",
        evidence: ["finance buyer", "multi-product platform", "enterprise proof required"],
        competitors: ["Brex", "Airbase", "Navan", "Spendesk"]
    },
    "linear.app": {
        companyName: "Linear",
        productCategory: "product development workflow platform",
        targetBuyer: "engineering and product leaders at product-led software companies",
        averageAcv: "12000",
        salesCycle: "35",
        targetRevenue: "72000",
        monthlyBudget: "6000",
        stage: "growth",
        teamSize: "pods",
        objective: "activation",
        primaryChannel: "plg",
        bottleneck: "activation",
        traction: "usage",
        evidence: ["product-led workflow", "developer and product audience", "usage-led expansion"],
        competitors: ["Jira", "Asana", "Shortcut", "ClickUp"]
    },
    "gong.io": {
        companyName: "Gong",
        productCategory: "revenue intelligence platform",
        targetBuyer: "CROs, sales leaders, and revenue operations teams at B2B companies",
        averageAcv: "48000",
        salesCycle: "75",
        targetRevenue: "240000",
        monthlyBudget: "20000",
        stage: "growth",
        teamSize: "scaled",
        objective: "moveUpmarket",
        primaryChannel: "events",
        bottleneck: "trust",
        traction: "enterprise",
        evidence: ["revenue leadership buyer", "category education needed", "enterprise sales cycle"],
        competitors: ["Clari", "Chorus", "Salesloft", "Outreach"]
    },
    "attio.com": {
        companyName: "Attio",
        productCategory: "modern CRM platform",
        targetBuyer: "founders, GTM teams, and operators at modern B2B companies",
        averageAcv: "15000",
        salesCycle: "38",
        targetRevenue: "90000",
        monthlyBudget: "7000",
        stage: "seriesA",
        teamSize: "pods",
        objective: "pipeline",
        primaryChannel: "plg",
        bottleneck: "positioning",
        traction: "usage",
        evidence: ["CRM category", "product-led entry", "needs differentiation against incumbents"],
        competitors: ["HubSpot", "Salesforce", "Pipedrive", "Folk"]
    },
    "mutinyhq.com": {
        companyName: "Mutiny",
        productCategory: "website personalization platform",
        targetBuyer: "demand generation and growth leaders at B2B SaaS companies",
        averageAcv: "36000",
        salesCycle: "62",
        targetRevenue: "180000",
        monthlyBudget: "14000",
        stage: "growth",
        teamSize: "pods",
        objective: "pipeline",
        primaryChannel: "events",
        bottleneck: "conversion",
        traction: "enterprise",
        evidence: ["marketing buyer", "conversion pain", "ABM and personalization language"],
        competitors: ["Optimizely", "VWO", "Clearbit", "Intellimize"]
    },
    "zenskar.com": {
        companyName: "Zenskar",
        productCategory: "usage-based billing platform",
        targetBuyer: "finance, RevOps, and monetization teams at SaaS companies",
        averageAcv: "30000",
        salesCycle: "58",
        targetRevenue: "150000",
        monthlyBudget: "8500",
        stage: "seed",
        teamSize: "lean",
        objective: "pipeline",
        primaryChannel: "seo",
        bottleneck: "trust",
        traction: "content",
        evidence: ["technical finance buyer", "billing pain", "high-intent search opportunity"],
        competitors: ["Chargebee", "Maxio", "Stripe Billing", "Orb"]
    }
};

let currentPlan = null;
let activeResearchRun = 0;

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
});

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function toNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function titleCase(value) {
    return String(value)
        .replace(/[-_]+/g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function normalizeDomain(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0]
        .split("?")[0]
        .replace(/:.*$/, "");
}

function collectInput() {
    const data = new FormData(form);
    return Object.fromEntries(data.entries());
}

function setFormValues(values) {
    Object.entries(values).forEach(([key, value]) => {
        const field = form.elements[key];
        if (field) {
            field.value = value;
        }
    });
}

function setAssumptionValues(input) {
    assumptionKeys.forEach((key) => {
        const field = form.elements[key];
        if (field) {
            field.value = input[key] ?? "";
        }
    });
}

function validateDomain(domain) {
    if (!domain) {
        return "Add a company domain first.";
    }

    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain) || domain.includes("..")) {
        return "Use a real domain like clay.com or zenskar.com.";
    }

    return "";
}

function getCompanyNameFromDomain(domain) {
    const base = domain.split(".")[0] || "Company";
    const cleaned = base.replace(/app$|hq$|ai$/i, "");
    return titleCase(cleaned || base);
}

function extractHomepageSignals(text) {
    const title = (text.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || "";
    const description = (text.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || [])[1] || "";
    const headings = [...text.matchAll(/<h[1-2][^>]*>(.*?)<\/h[1-2]>/gi)]
        .slice(0, 4)
        .map((match) => match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
        .filter(Boolean);

    return [title, description, ...headings].filter(Boolean).join(" | ").slice(0, 900);
}

async function fetchHomepageIntel(domain) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 2800);

    try {
        const response = await fetch(`https://${domain}`, {
            method: "GET",
            signal: controller.signal,
            mode: "cors"
        });

        if (!response.ok) {
            throw new Error(`Homepage returned ${response.status}`);
        }

        const text = await response.text();
        const summary = extractHomepageSignals(text);

        return {
            mode: "live homepage",
            summary,
            fetched: Boolean(summary),
            note: summary ? "Read public homepage metadata." : "Homepage responded, but useful copy was sparse."
        };
    } catch (error) {
        return {
            mode: "inferred",
            summary: "",
            fetched: false,
            note: error.name === "AbortError"
                ? "Homepage read timed out, so the agent inferred from domain and notes."
                : "Browser CORS blocked direct homepage reading, so the agent inferred from domain and notes."
        };
    } finally {
        window.clearTimeout(timer);
    }
}

function inferCategory(lowerText) {
    if (/(finance|spend|billing|invoice|revenue recognition|usage-based|accounting|cfo|close)/.test(lowerText)) {
        return {
            productCategory: "finance operations platform",
            targetBuyer: "CFOs, controllers, and finance operations leaders at scaling B2B companies",
            averageAcv: "30000",
            salesCycle: "58",
            primaryChannel: "seo",
            bottleneck: "trust",
            competitors: ["Ramp", "Brex", "Chargebee", "Maxio"]
        };
    }

    if (/(crm|sales|revenue|pipeline|outbound|lead|prospect|gtm|revops|enrichment)/.test(lowerText)) {
        return {
            productCategory: "GTM workflow platform",
            targetBuyer: "GTM leaders, RevOps teams, and growth teams at B2B SaaS companies",
            averageAcv: "24000",
            salesCycle: "45",
            primaryChannel: "founder",
            bottleneck: "positioning",
            competitors: ["HubSpot", "Salesforce", "Apollo", "Clay"]
        };
    }

    if (/(developer|api|github|sdk|infrastructure|observability|security|data platform|deploy)/.test(lowerText)) {
        return {
            productCategory: "developer infrastructure platform",
            targetBuyer: "engineering leaders and platform teams at software companies",
            averageAcv: "18000",
            salesCycle: "42",
            primaryChannel: "plg",
            bottleneck: "activation",
            competitors: ["Datadog", "Vercel", "Postman", "Snyk"]
        };
    }

    if (/(hr|people|recruit|talent|payroll|employee|workforce)/.test(lowerText)) {
        return {
            productCategory: "people operations platform",
            targetBuyer: "people leaders and operations teams at growing companies",
            averageAcv: "20000",
            salesCycle: "50",
            primaryChannel: "partners",
            bottleneck: "trust",
            competitors: ["Rippling", "Deel", "Gusto", "BambooHR"]
        };
    }

    if (/(marketing|personalization|website|conversion|content|campaign|seo|advertising)/.test(lowerText)) {
        return {
            productCategory: "B2B marketing automation platform",
            targetBuyer: "demand generation, growth, and marketing operations leaders at B2B SaaS companies",
            averageAcv: "22000",
            salesCycle: "44",
            primaryChannel: "events",
            bottleneck: "conversion",
            competitors: ["HubSpot", "Mutiny", "Marketo", "Optimizely"]
        };
    }

    return {
        productCategory: "B2B SaaS workflow platform",
        targetBuyer: "functional leaders and operators at 100 to 500 person B2B companies",
        averageAcv: "18000",
        salesCycle: "45",
        primaryChannel: "founder",
        bottleneck: "positioning",
        competitors: ["category incumbents", "spreadsheets", "internal tools", "services firms"]
    };
}

function inferDomainProfile(domain, notes = "", homepage = {}) {
    const known = knownProfiles[domain];

    if (known) {
        return {
            ...known,
            companyDomain: domain,
            researchMode: homepage.fetched ? "live homepage plus known profile" : "known profile",
            researchNote: homepage.note || "Matched a built-in B2B SaaS profile.",
            homepageSummary: homepage.summary,
            confidenceBoost: homepage.fetched ? 14 : 10
        };
    }

    const lowerText = `${domain} ${notes} ${homepage.summary || ""}`.toLowerCase();
    const category = inferCategory(lowerText);
    const hasEnterpriseSignal = /(enterprise|security|soc 2|compliance|procurement|salesforce|workday)/.test(lowerText);
    const hasPlgSignal = /(free|self serve|signup|api|developer|workspace|template)/.test(lowerText);
    const hasLaunchSignal = /(launch|waitlist|beta|early access|new)/.test(lowerText);

    return {
        companyDomain: domain,
        companyName: getCompanyNameFromDomain(domain),
        productCategory: category.productCategory,
        targetBuyer: category.targetBuyer,
        averageAcv: category.averageAcv,
        salesCycle: hasEnterpriseSignal ? "65" : category.salesCycle,
        targetRevenue: String(Math.max(toNumber(category.averageAcv) * 5, 60000)),
        monthlyBudget: hasEnterpriseSignal ? "10000" : "6500",
        stage: hasLaunchSignal ? "preseed" : hasEnterpriseSignal ? "seriesA" : "seed",
        teamSize: hasEnterpriseSignal ? "pods" : "lean",
        objective: hasLaunchSignal ? "launch" : hasPlgSignal ? "activation" : "pipeline",
        primaryChannel: hasPlgSignal ? "plg" : category.primaryChannel,
        bottleneck: category.bottleneck,
        traction: hasEnterpriseSignal ? "enterprise" : hasPlgSignal ? "usage" : "calls",
        evidence: [
            homepage.fetched ? "Homepage metadata was readable" : "Homepage fetch needed inference fallback",
            `${category.productCategory} keyword pattern`,
            hasEnterpriseSignal ? "enterprise-readiness signal" : "early pipeline signal"
        ],
        competitors: category.competitors,
        researchMode: homepage.fetched ? "live homepage plus inference" : "domain inference",
        researchNote: homepage.note || "Inferred from domain and optional context.",
        homepageSummary: homepage.summary,
        confidenceBoost: homepage.fetched ? 9 : 3
    };
}

function hydrateInput(rawInput, profile) {
    return {
        companyDomain: profile.companyDomain,
        companyName: rawInput.companyName?.trim() || profile.companyName,
        productCategory: rawInput.productCategory?.trim() || profile.productCategory,
        targetBuyer: rawInput.targetBuyer?.trim() || profile.targetBuyer,
        averageAcv: rawInput.averageAcv || profile.averageAcv,
        salesCycle: rawInput.salesCycle || profile.salesCycle,
        targetRevenue: rawInput.targetRevenue || profile.targetRevenue,
        monthlyBudget: rawInput.monthlyBudget || profile.monthlyBudget,
        stage: rawInput.stage || profile.stage,
        teamSize: rawInput.teamSize || profile.teamSize,
        objective: rawInput.objective || profile.objective,
        primaryChannel: rawInput.primaryChannel || profile.primaryChannel,
        bottleneck: rawInput.bottleneck || profile.bottleneck,
        traction: rawInput.traction || profile.traction,
        notes: rawInput.notes?.trim() || "",
        researchMode: profile.researchMode,
        researchNote: profile.researchNote,
        homepageSummary: profile.homepageSummary || "",
        evidence: profile.evidence || [],
        competitors: profile.competitors || [],
        confidenceBoost: profile.confidenceBoost || 0
    };
}

function showEmptyState() {
    currentPlan = null;
    copyButton.disabled = true;
    copyLabel.textContent = "Copy brief";
    outputArea.innerHTML = `
        <div class="empty-state">
            <div class="empty-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                    <path d="M5 18.5V6.2l7-3.1 7 3.1v12.3l-7 3.1z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                    <path d="m8 9.4 4-1.8 4 1.8M8 13l4-1.8 4 1.8M8 16.6l4-1.8 4 1.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
            </div>
            <h3>Give the agent a domain</h3>
            <p>It will infer the company, buyer, category, ACV, motion, and first experiments. Add context only when the website will not tell the full story.</p>
        </div>
    `;
}

function showResearchState(domain) {
    copyButton.disabled = true;
    outputArea.innerHTML = `
        <div class="loading-state" aria-label="Researching domain">
            <div class="research-steps">
                <div class="research-step is-active">
                    <span></span>
                    <strong>Normalizing domain</strong>
                    <p>${escapeHtml(domain)}</p>
                </div>
                <div class="research-step">
                    <span></span>
                    <strong>Reading public site signals</strong>
                    <p>Homepage copy, title, category language</p>
                </div>
                <div class="research-step">
                    <span></span>
                    <strong>Inferring GTM assumptions</strong>
                    <p>Buyer, ACV, motion, bottleneck, proof</p>
                </div>
                <div class="research-step">
                    <span></span>
                    <strong>Building operating plan</strong>
                    <p>Experiments, channels, weekly cadence</p>
                </div>
            </div>
            <div class="loading-grid">
                <div class="skeleton"></div>
                <div class="skeleton"></div>
                <div class="skeleton"></div>
            </div>
        </div>
    `;
}

function getStageProfile(stage) {
    const profiles = {
        preseed: { closeRate: 0.14, proof: "thin", speed: "fast", risk: "category trust" },
        seed: { closeRate: 0.18, proof: "early", speed: "fast", risk: "repeatability" },
        seriesA: { closeRate: 0.22, proof: "usable", speed: "measured", risk: "pipeline quality" },
        growth: { closeRate: 0.26, proof: "strong", speed: "controlled", risk: "channel fatigue" }
    };

    return profiles[stage] || profiles.seed;
}

function inferMotion(input) {
    const acv = toNumber(input.averageAcv, 12000);
    const budget = toNumber(input.monthlyBudget, 5000);
    const objective = input.objective;
    const bottleneck = input.bottleneck;
    const channel = input.primaryChannel;

    if (bottleneck === "activation" || objective === "activation" || channel === "plg") {
        return {
            name: "Activation-led PLG sprint",
            thesis: "Your growth problem is less about reach and more about getting the right users to value faster. Treat acquisition and activation as one motion.",
            tags: ["activation", "lifecycle", "product signals"],
            lanes: { clarity: 74, reach: 48, proof: 62, conversion: 82 }
        };
    }

    if (acv >= 28000 || objective === "moveUpmarket" || input.traction === "enterprise") {
        return {
            name: "Account-based founder-led outbound",
            thesis: "The ACV supports fewer, better accounts. Win with precise account selection, founder POV, proof, and a clean handoff into sales.",
            tags: ["ABM", "enterprise", "founder POV"],
            lanes: { clarity: 78, reach: 56, proof: 72, conversion: 76 }
        };
    }

    if (objective === "launch") {
        return {
            name: "Launch room with sales capture",
            thesis: "The launch should not just create attention. It should identify high-fit accounts, route warm replies, and turn the spike into meetings.",
            tags: ["launch", "distribution", "capture"],
            lanes: { clarity: 70, reach: 84, proof: 58, conversion: 64 }
        };
    }

    if (channel === "seo" || budget < 3500) {
        return {
            name: "POV-led content with narrow outbound",
            thesis: "Use content to sharpen demand and outbound to learn faster. The content should make sales conversations easier within two weeks.",
            tags: ["content", "SEO", "sales learning"],
            lanes: { clarity: 82, reach: 58, proof: 55, conversion: 68 }
        };
    }

    if (channel === "events") {
        return {
            name: "Webinar to pipeline engine",
            thesis: "Events can become a repeatable acquisition system when speaker selection, registrant scoring, and follow-up are designed together.",
            tags: ["events", "partners", "follow-up"],
            lanes: { clarity: 76, reach: 66, proof: 74, conversion: 70 }
        };
    }

    return {
        name: "Signal-led outbound plus founder proof",
        thesis: "Pair a tight account list with founder-led credibility. The goal is not volume. It is a weekly learning loop around who cares and why now.",
        tags: ["outbound", "founder brand", "signals"],
        lanes: { clarity: 76, reach: 64, proof: 66, conversion: 72 }
    };
}

function buildChannels(input, motion) {
    if (motion.name.includes("Activation")) {
        return [
            { name: "Lifecycle", weight: 34, reason: "Turn signup and usage moments into activation paths." },
            { name: "Product prompts", weight: 26, reason: "Push users toward the first valuable workflow." },
            { name: "Founder proof", weight: 20, reason: "Keep trust high while the product loop tightens." },
            { name: "Outbound", weight: 20, reason: "Target accounts where activation pain is obvious." }
        ];
    }

    if (motion.name.includes("Account-based")) {
        return [
            { name: "Outbound", weight: 38, reason: "Small account set, high personalization, clear signal logic." },
            { name: "Founder proof", weight: 24, reason: "Build trust before the first sales conversation." },
            { name: "Webinars", weight: 20, reason: "Use operators and customers to compress trust." },
            { name: "Partners", weight: 18, reason: "Borrow distribution from ecosystems buyers already trust." }
        ];
    }

    if (motion.name.includes("Launch")) {
        return [
            { name: "Founder proof", weight: 30, reason: "Anchor the launch in a clear category point of view." },
            { name: "Community", weight: 24, reason: "Seed the launch where buyers already compare tools." },
            { name: "Outbound", weight: 24, reason: "Turn launch engagement into direct conversations." },
            { name: "PR", weight: 22, reason: "Use the launch to earn references and credibility." }
        ];
    }

    if (motion.name.includes("content")) {
        return [
            { name: "Content", weight: 36, reason: "Create buyer-intent pages with a strong point of view." },
            { name: "Founder proof", weight: 26, reason: "Distribute the POV before search compounds." },
            { name: "Outbound", weight: 22, reason: "Use replies to tune the messaging." },
            { name: "Community", weight: 16, reason: "Find language and objections in the wild." }
        ];
    }

    if (motion.name.includes("Webinar")) {
        return [
            { name: "Webinars", weight: 36, reason: "Design every event around a buyer pain and a sales follow-up path." },
            { name: "Partners", weight: 24, reason: "Use trusted guests to create warmer audiences." },
            { name: "Outbound", weight: 22, reason: "Invite named accounts and create account-level intent." },
            { name: "Founder proof", weight: 18, reason: "Turn event insights into durable posts and emails." }
        ];
    }

    return [
        { name: "Outbound", weight: 34, reason: "Reach accounts with a timely trigger and a specific pain." },
        { name: "Founder proof", weight: 28, reason: "Make the same pain visible in public before the ask." },
        { name: "Content", weight: 22, reason: "Create comparison and problem pages that support sales." },
        { name: "Events", weight: 16, reason: "Test one small expert session once messaging starts landing." }
    ];
}

function buildExperiments(input, motion) {
    const buyer = input.targetBuyer.trim();
    const category = input.productCategory.trim();
    const experimentsByMotion = {
        activation: [
            ["Activation interview sprint", `Interview 8 recent signups and map the moment ${buyer} first sees value.`, 8.4],
            ["Lifecycle trigger test", "Write three usage-based emails tied to setup, stalled activation, and team invite moments.", 7.9],
            ["In-product proof block", "Add a short proof module near the highest-friction setup step.", 7.2],
            ["High-fit concierge path", "Route the best-fit signups into a founder-led onboarding call within 24 hours.", 8.1]
        ],
        account: [
            ["Signal list sprint", `Build 80 accounts where ${buyer} likely has an urgent reason to care.`, 8.7],
            ["Founder POV sequence", `Send a 4-touch sequence around the cost of ignoring ${category}.`, 8.2],
            ["Operator webinar", "Recruit one credible guest and invite a hand-picked account list.", 7.8],
            ["Proof memo", "Turn strongest customer evidence into a one-page sales asset.", 7.5]
        ],
        launch: [
            ["Launch audience map", "Split launch targets into buyers, amplifiers, partners, and proof sources.", 8.3],
            ["Warm reply capture", "Create a reply-handling path for every founder post, community mention, and email response.", 8.1],
            ["Comparison angle", `Publish a direct page on how ${category} changes the old workflow.`, 7.4],
            ["Partner drop", "Coordinate 5 partner or customer mentions across the first 72 hours.", 7.7]
        ],
        content: [
            ["Buyer-intent cluster", `Map 12 queries ${buyer} asks before buying a ${category}.`, 8.2],
            ["Pain-led outbound", "Send 50 messages using the strongest content POV as the opening wedge.", 7.8],
            ["Alternative page", "Create one competitor or spreadsheet-alternative page with a clear switching argument.", 7.5],
            ["Community language pull", "Mine 40 buyer phrases from Reddit, LinkedIn comments, support calls, and sales notes.", 7.6]
        ],
        webinar: [
            ["Speaker shortlist", `Find 15 operators who already have trust with ${buyer}.`, 8.4],
            ["Registrant scoring", "Score registrants by account fit, role, urgency signal, and topic match.", 8.1],
            ["Follow-up forks", "Create separate follow-up paths for attended, no-show, and high-fit engaged accounts.", 8.5],
            ["Event content loop", "Turn the event into 6 posts, 2 emails, and one sales enablement note.", 7.3]
        ],
        default: [
            ["Signal-based account list", `Build 120 accounts where ${buyer} has a visible trigger.`, 8.6],
            ["Founder proof cadence", "Publish three POV posts per week, each tied to an outbound pain angle.", 8.0],
            ["Reply analysis loop", "Tag every reply by pain, objection, persona, and urgency every Friday.", 7.9],
            ["Conversion asset", "Create a short proof page to send after the first interested reply.", 7.4]
        ]
    };

    let key = "default";
    if (motion.name.includes("Activation")) key = "activation";
    if (motion.name.includes("Account-based")) key = "account";
    if (motion.name.includes("Launch")) key = "launch";
    if (motion.name.includes("content")) key = "content";
    if (motion.name.includes("Webinar")) key = "webinar";

    return experimentsByMotion[key].map(([name, detail, score]) => ({ name, detail, score }));
}

function buildCadence(input, motion) {
    const base = [
        ["Week 1", "Choose the account or user segment, sharpen the pain statement, and build the first asset."],
        ["Week 2", "Run the first outbound, content, or lifecycle test. Track replies and objections daily."],
        ["Week 3", "Double down on the segment with the strongest signal. Add proof and tighten the CTA."],
        ["Week 4", "Review conversion, kill weak plays, and lock the next 30 day operating rhythm."]
    ];

    if (motion.name.includes("Webinar")) {
        base[1][1] = "Secure speaker, build invite list, and send the first segmented invite path.";
        base[2][1] = "Run event, score attendance, and start follow-up within 12 hours.";
    }

    if (motion.name.includes("Activation")) {
        base[1][1] = "Ship the first lifecycle path and concierge activation offer.";
        base[2][1] = "Compare activation cohorts, then remove the highest-friction setup step.";
    }

    return base.map(([week, detail]) => ({ week, detail }));
}

function buildPlan(input) {
    const motion = inferMotion(input);
    const channels = buildChannels(input, motion);
    const experiments = buildExperiments(input, motion);
    const cadence = buildCadence(input, motion);
    const profile = getStageProfile(input.stage);
    const acv = Math.max(toNumber(input.averageAcv, 12000), 1);
    const target = Math.max(toNumber(input.targetRevenue, acv * 3), acv);
    const salesCycle = Math.max(toNumber(input.salesCycle, 35), 7);
    const budget = Math.max(toNumber(input.monthlyBudget, 0), 0);
    const closeRate = profile.closeRate;
    const dealsNeeded = Math.max(Math.ceil(target / acv), 1);
    const opportunitiesNeeded = Math.ceil(dealsNeeded / closeRate);
    const meetingRate = acv >= 28000 ? 0.075 : 0.105;
    const accountsNeeded = Math.ceil(opportunitiesNeeded / meetingRate);
    const weeklyAccounts = Math.ceil(accountsNeeded / 12);
    const confidence = Math.min(94, 55 + (input.notes.length > 40 ? 7 : 2) + (budget > 0 ? 5 : 1) + (input.traction !== "none" ? 7 : 0) + (input.primaryChannel !== "none" ? 5 : 0) + input.confidenceBoost);
    const timeToSignal = salesCycle > 60 ? "21 to 28 days" : "10 to 18 days";

    const read = [
        `${titleCase(input.stage)} company with ${profile.proof} proof needs a plan that learns weekly, not a frozen annual channel mix.`,
        `${currency.format(acv)} ACV means the motion can afford real personalization, but only if the account list stays narrow.`,
        `${titleCase(input.bottleneck)} is the constraint to solve first. Until that improves, extra activity will mostly create noise.`
    ];

    const persona = [
        { label: "Best-fit account", value: `${input.targetBuyer.trim()} with visible urgency, budget ownership, and a workflow pain tied to ${input.productCategory.trim()}.` },
        { label: "Why now trigger", value: "Hiring, funding, compliance pressure, tool migration, leadership change, or manual work becoming impossible to hide." },
        { label: "Disqualifier", value: "No owner, no measurable pain, or only curiosity about AI without a current operational problem." }
    ];

    const message = {
        oneLiner: `${input.companyName.trim()} helps ${input.targetBuyer.trim()} replace slow manual work in ${input.productCategory.trim()} with a workflow that is easier to trust and faster to act on.`,
        wedge: `Lead with the business cost of the old workflow, then show the specific moment where ${input.companyName.trim()} changes the outcome.`,
        cta: acv >= 28000 ? "Ask for a 20 minute account review, not a generic demo." : "Ask for one painful workflow example, then offer a short teardown."
    };

    const guardrails = [
        "Keep every outbound list below the number you can research well.",
        "Tag every reply and lost call by objection so strategy changes are based on evidence.",
        "Do not scale a channel until one segment shows repeated pain, urgency, and conversion.",
        "Make founder content and sales messaging use the same enemy, same proof, and same CTA."
    ];

    return {
        input,
        motion,
        channels,
        experiments,
        cadence,
        read,
        persona,
        message,
        guardrails,
        metrics: {
            confidence,
            dealsNeeded,
            opportunitiesNeeded,
            accountsNeeded,
            weeklyAccounts,
            timeToSignal,
            target,
            acv
        },
        research: {
            domain: input.companyDomain,
            mode: input.researchMode,
            note: input.researchNote,
            homepageSummary: input.homepageSummary,
            evidence: input.evidence,
            competitors: input.competitors
        }
    };
}

function renderPlan(plan) {
    currentPlan = plan;
    copyButton.disabled = false;

    const safeCompany = escapeHtml(plan.input.companyName.trim());
    const safeCategory = escapeHtml(plan.input.productCategory.trim());
    const tags = plan.motion.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
    const lanes = Object.entries(plan.motion.lanes).map(([name, width]) => `
        <div class="map-lane">
            <span>${escapeHtml(titleCase(name))}</span>
            <div class="lane-track"><i style="--lane-width: ${width}%"></i></div>
        </div>
    `).join("");

    outputArea.innerHTML = `
        <article class="strategy-output">
            <div class="strategy-hero">
                <section class="motion-panel">
                    <p class="motion-kicker">${safeCompany} strategy</p>
                    <h3>${escapeHtml(plan.motion.name)}</h3>
                    <p>${escapeHtml(plan.motion.thesis)}</p>
                    <div class="hero-tags">${tags}</div>
                </section>

                <section class="map-panel" aria-label="Strategy balance map">
                    <div class="strategy-map">
                        <div class="map-title">
                            <span>Motion balance</span>
                            <span>${safeCategory}</span>
                        </div>
                        <div class="map-lanes">${lanes}</div>
                    </div>
                </section>
            </div>

            <section class="research-strip">
                <div>
                    <span>Domain</span>
                    <strong>${escapeHtml(plan.research.domain)}</strong>
                </div>
                <div>
                    <span>Research mode</span>
                    <strong>${escapeHtml(plan.research.mode)}</strong>
                </div>
                <div>
                    <span>Evidence</span>
                    <strong>${escapeHtml(plan.research.evidence.slice(0, 2).join(" + ") || "inferred signals")}</strong>
                </div>
                <p>${escapeHtml(plan.research.note)}</p>
            </section>

            <div class="metric-grid">
                <div class="metric">
                    <span>Strategy confidence</span>
                    <strong>${plan.metrics.confidence}%</strong>
                    <small>Based on research source, channel signal, proof, budget, and context quality.</small>
                </div>
                <div class="metric">
                    <span>Deals required</span>
                    <strong>${plan.metrics.dealsNeeded}</strong>
                    <small>For a ${currency.format(plan.metrics.target)} 90 day target at ${currency.format(plan.metrics.acv)} ACV.</small>
                </div>
                <div class="metric">
                    <span>Qualified accounts</span>
                    <strong>${plan.metrics.accountsNeeded}</strong>
                    <small>About ${plan.metrics.weeklyAccounts} accounts per week for 12 weeks.</small>
                </div>
                <div class="metric">
                    <span>Time to signal</span>
                    <strong>${escapeHtml(plan.metrics.timeToSignal)}</strong>
                    <small>First evidence window before scaling or killing a play.</small>
                </div>
            </div>

            <div class="section-grid">
                <section class="strategy-section">
                    <div class="section-header">
                        <h3>Strategic read</h3>
                        <span>01</span>
                    </div>
                    <ul class="read-list">
                        ${plan.read.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                    </ul>
                </section>

                <section class="strategy-section">
                    <div class="section-header">
                        <h3>ICP hypothesis</h3>
                        <span>02</span>
                    </div>
                    <ul class="persona-list">
                        ${plan.persona.map((item) => `<li><strong>${escapeHtml(item.label)}:</strong> ${escapeHtml(item.value)}</li>`).join("")}
                    </ul>
                </section>

                <section class="strategy-section">
                    <div class="section-header">
                        <h3>Channel mix</h3>
                        <span>03</span>
                    </div>
                    <div class="channel-list">
                        ${plan.channels.map((channel) => `
                            <div class="channel-row" title="${escapeHtml(channel.reason)}">
                                <span>${escapeHtml(channel.name)}</span>
                                <div class="channel-bar"><i style="--bar-width: ${channel.weight}%"></i></div>
                                <strong>${channel.weight}%</strong>
                            </div>
                        `).join("")}
                    </div>
                </section>

                <section class="strategy-section">
                    <div class="section-header">
                        <h3>Messaging spine</h3>
                        <span>04</span>
                    </div>
                    <div class="message-block">
                        <p class="message-line"><strong>One-liner:</strong> ${escapeHtml(plan.message.oneLiner)}</p>
                        <p class="message-line"><strong>Opening wedge:</strong> ${escapeHtml(plan.message.wedge)}</p>
                        <p class="message-line"><strong>CTA:</strong> ${escapeHtml(plan.message.cta)}</p>
                    </div>
                </section>

                <section class="strategy-section wide">
                    <div class="section-header">
                        <h3>Experiment backlog</h3>
                        <span>05</span>
                    </div>
                    <div class="experiment-list">
                        ${plan.experiments.map((experiment) => `
                            <article class="experiment">
                                <div>
                                    <h4>${escapeHtml(experiment.name)}</h4>
                                    <p>${escapeHtml(experiment.detail)}</p>
                                </div>
                                <span class="score-pill">${experiment.score.toFixed(1)}</span>
                            </article>
                        `).join("")}
                    </div>
                </section>

                <section class="strategy-section">
                    <div class="section-header">
                        <h3>30 day cadence</h3>
                        <span>06</span>
                    </div>
                    <div class="week-list">
                        ${plan.cadence.map((week) => `
                            <article class="week">
                                <h4>${escapeHtml(week.week)}</h4>
                                <p>${escapeHtml(week.detail)}</p>
                            </article>
                        `).join("")}
                    </div>
                </section>

                <section class="strategy-section">
                    <div class="section-header">
                        <h3>Guardrails</h3>
                        <span>07</span>
                    </div>
                    <ul class="simple-list">
                        ${plan.guardrails.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                    </ul>
                </section>
            </div>
        </article>
    `;
}

function plainTextPlan(plan) {
    return [
        `${plan.input.companyName} GTM strategy`,
        `Domain: ${plan.research.domain}`,
        `Research mode: ${plan.research.mode}`,
        `Recommended motion: ${plan.motion.name}`,
        "",
        plan.motion.thesis,
        "",
        `90 day target: ${currency.format(plan.metrics.target)}`,
        `Deals needed: ${plan.metrics.dealsNeeded}`,
        `Qualified accounts: ${plan.metrics.accountsNeeded}`,
        `Time to signal: ${plan.metrics.timeToSignal}`,
        "",
        "Strategic read:",
        ...plan.read.map((item) => `- ${item}`),
        "",
        "Channel mix:",
        ...plan.channels.map((channel) => `- ${channel.name}: ${channel.weight}% - ${channel.reason}`),
        "",
        "Experiment backlog:",
        ...plan.experiments.map((experiment) => `- ${experiment.name}: ${experiment.detail}`),
        "",
        "30 day cadence:",
        ...plan.cadence.map((week) => `- ${week.week}: ${week.detail}`)
    ].join("\n");
}

async function runStrategy(rawInput) {
    const domain = normalizeDomain(rawInput.companyDomain);
    const error = validateDomain(domain);
    const researchRun = activeResearchRun + 1;
    activeResearchRun = researchRun;

    if (error) {
        errorEl.textContent = error;
        return;
    }

    errorEl.textContent = "";
    showResearchState(domain);

    const homepage = await fetchHomepageIntel(domain);
    const profile = inferDomainProfile(domain, rawInput.notes, homepage);
    const hydratedInput = hydrateInput({ ...rawInput, companyDomain: domain }, profile);

    if (activeResearchRun !== researchRun) {
        return;
    }

    setFormValues({ companyDomain: domain, notes: rawInput.notes || "" });
    setAssumptionValues(hydratedInput);
    renderPlan(buildPlan(hydratedInput));
}

function renderInitialSample() {
    const domain = normalizeDomain(sampleInput.companyDomain);
    const profile = inferDomainProfile(domain, sampleInput.notes, {
        fetched: false,
        summary: "",
        note: "Loaded sample profile. Submit the domain to attempt a live homepage read."
    });
    const input = hydrateInput(sampleInput, profile);
    setFormValues({ companyDomain: domain, notes: sampleInput.notes });
    setAssumptionValues(input);
    renderPlan(buildPlan(input));
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    runStrategy(collectInput());
});

sampleButton.addEventListener("click", () => {
    form.reset();
    runStrategy(sampleInput);
});

resetButton.addEventListener("click", () => {
    activeResearchRun += 1;
    form.reset();
    errorEl.textContent = "";
    showEmptyState();
});

copyButton.addEventListener("click", async () => {
    if (!currentPlan) return;

    const text = plainTextPlan(currentPlan);

    try {
        await navigator.clipboard.writeText(text);
        copyLabel.textContent = "Copied";
        window.setTimeout(() => {
            copyLabel.textContent = "Copy brief";
        }, 1400);
    } catch {
        copyLabel.textContent = "Copy failed";
        window.setTimeout(() => {
            copyLabel.textContent = "Copy brief";
        }, 1400);
    }
});

renderInitialSample();
