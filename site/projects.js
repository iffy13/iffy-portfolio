/*
  ─────────────────────────────────────────────────────────────
  PROJECTS DATA — add a new project by copying one block below.
  ─────────────────────────────────────────────────────────────
  category  must match one of the ids in CATEGORIES.
  images    paths inside /assets (first one is the cover).
  url       optional live link ("" to hide the button).
  featured  true = shows in the "Featured work" spot at the top (use on one project).
*/

window.CATEGORIES = [
  { id: "agents",     title: "AI Agents",            meta: "LLM agents · Chatbots · Receptionists", blurb: "Assistants that answer customers, research, write and take action in your tools." },
  { id: "automation", title: "AI Automation",        meta: "n8n · Zapier · APIs",                    blurb: "Workflows that create content, move data and publish on autopilot." },
  { id: "video",      title: "AI Video",             meta: "Shorts · Ads · Trailers",              blurb: "Scroll-stopping video made with AI generation and editing." },
  { id: "3d",         title: "3D Design & Renders", meta: "Product design · Characters · Renders", blurb: "Product enclosures, stylised characters and photoreal renders." },
  { id: "2d",         title: "2D Art & Motion",      meta: "Illustration · Motion graphics",       blurb: "Characters, illustrations and animated explainers." },
  { id: "saas",       title: "SaaS & Web Apps",      meta: "MVPs · Dashboards · Extensions",       blurb: "Products with logins, payments and real users." },
  { id: "games",      title: "Games",                meta: "Three.js · Mobile-first",              blurb: "Playable 3D browser and mobile games." },
  { id: "web",        title: "Shopify & Websites",   meta: "Shopify · Hydrogen · WordPress",       blurb: "Fast storefronts and sites when the product needs a home." }
];

window.PROJECTS = [
  {
    title: "WhatsApp AI Assistant",
    category: "agents",
    featured: true,
    client: "Personal & small-business assistant",
    tagline: "One WhatsApp number that reads images, books meetings, manages tasks and answers from your own documents.",
    images: ["assets/wa-agent-2.webp", "assets/wa-agent-ollama.webp"],
    url: "",
    stack: ["n8n", "WhatsApp Cloud API", "Multi-agent", "MongoDB Atlas Vector Search", "Google Calendar & Tasks", "Gmail", "Ollama"],
    challenge: "Built so a busy owner can run their day from WhatsApp: email, meetings, research and to-dos, without opening five apps.",
    work: [
      "WhatsApp trigger sorts text from media; images are downloaded and analysed by a vision model before the agent replies",
      "A main AI agent hands work to specialist sub-agents for Gmail, research (web search and Wikipedia), Google Calendar and Google Tasks",
      "Answers from the client's own knowledge base through a MongoDB Atlas vector store",
      "Shows a typing indicator, keeps conversation memory, and saves full chat history to MongoDB",
      "A lighter version runs on a self-hosted Ollama model and handles personal chats, group chats and a safe fallback route"
    ],
    result: "A working assistant that lives in WhatsApp and handles email, calendar, tasks and research by chat."
  },
  {
    title: "LinkedIn Lead Research & Outreach Agent",
    category: "agents",
    client: "B2B sales team",
    tagline: "Describe your ideal customer in a chat. The agent finds, researches, scores and contacts the leads.",
    images: ["assets/linkedin-agent.webp"],
    url: "",
    stack: ["n8n", "OpenAI", "LinkedIn API (HDW)", "Google Sheets", "AI scoring"],
    challenge: "The sales team spent hours finding prospects on LinkedIn and reading their company sites before writing a single message.",
    work: [
      "An AI agent turns a plain-English ICP description into LinkedIn search filters and saves every match to Google Sheets",
      "For each lead, the workflow finds the company website, then summarises the site, the lead's posts, company news and company posts with AI",
      "A scoring step rates how likely each company is to need the product, with criteria the team can edit",
      "On a schedule it sends connection requests to the top-scored leads, capped to stay inside LinkedIn's weekly limits",
      "When a connection is accepted, it sends a personalised follow-up message automatically"
    ],
    result: "End-to-end prospecting: from an ICP sentence to researched, scored and contacted leads, all tracked in one sheet."
  },
  {
    title: "WhatsApp Business API Setup",
    category: "agents",
    client: "Client businesses",
    tagline: "Meta business verification and WhatsApp Cloud API onboarding, ready for bots and broadcasts.",
    images: ["assets/wa-api-limits.webp", "assets/wa-api-verified.webp"],
    url: "",
    stack: ["Meta Business Manager", "WhatsApp Cloud API", "Meta for Developers"],
    challenge: "Clients needed an official WhatsApp Business API number for their chatbots, but kept getting stuck on Meta's business verification.",
    work: [
      "Set up the business portfolio, app and WhatsApp account in Meta Business Manager",
      "Prepared and submitted business verification for the right use case until it was approved",
      "Connected the verified number to the client's automation and AI agent"
    ],
    result: "Verified businesses. One account's limit was raised to 100,000 business-initiated conversations every 24 hours."
  },
  {
    title: "Competitor Ad Research Bot",
    category: "automation",
    client: "E-commerce product research",
    tagline: "Finds stores running proven Meta ads and logs them to a sheet. I took it from 7 ads found to 404.",
    images: ["assets/ad-research-card.webp", "assets/ad-research-flow.webp"],
    url: "",
    stack: ["n8n", "Apify", "Meta Ad Library", "JavaScript", "Google Sheets"],
    challenge: "The client's product research workflow kept reporting almost no active ads, so winning products were being missed.",
    work: [
      "Traced the problem to the Ad Library link having no country, so results used the server's region",
      "Added the country to the request, which took the same 6 stores from 7 active ads found to 404",
      "Fixed a second bug: the workflow counted Facebook pages, not brands, so one brand with 4 pages was filtered out as 4 competitors",
      "Kept only stores with 80+ active ads and at least one ad live for 30+ days, dropped apps, and wrote to Google Sheets with no duplicates"
    ],
    result: "Reliable daily product research with about 58× more ads detected on the same stores."
  },
  {
    title: "CRM Sync Fix: Phone Leads",
    category: "automation",
    client: "Home services company",
    tagline: "Customers who phoned in were reaching installers as blank records. I found out why and fixed it.",
    images: ["assets/crm-sync-card.webp"],
    url: "",
    stack: ["Zapier", "GoHighLevel", "Job dispatch app", "Installer software"],
    challenge: "Contacts created from phone calls had no email, and the installer software silently rejected the whole record with \"email must be an email\".",
    work: [
      "Followed one record from the dispatch app through GoHighLevel to the installer software to find where data was lost",
      "Fixed the mapping so a valid email is always present, and the record now syncs in full",
      "Tested new jobs, reschedules, cancellations and technician assignment end to end"
    ],
    result: "Installers now see the name, email and phone on every job, including leads that phoned in."
  },
  {
    title: "Won-Deal Client Onboarding",
    category: "automation",
    client: "Software company · Brazil",
    tagline: "A closed deal in HubSpot sets up the customer across six systems with no manual entry.",
    images: ["assets/hubspot-onboarding.webp"],
    url: "",
    stack: ["HubSpot", "Airtable", "Pipefy", "Conta Azul", "Coda", "ViaCEP & IBGE APIs"],
    challenge: "Every new customer was being typed into finance, operations and support tools by hand, which caused delays and typos.",
    work: [
      "Triggered on a HubSpot won deal; pulls the contact, the SDR and the account executive",
      "Validates the postcode with ViaCEP and looks up the city through IBGE",
      "Builds the product list, MRR and licences, then creates the store and credentials",
      "Creates the records in Airtable, Pipefy (finance, key-account and CD pipes), Conta Azul and Coda",
      "Writes a success or error note back to the HubSpot deal at every step"
    ],
    result: "Onboarding starts the moment a deal closes, and every step is logged on the deal."
  },
  {
    title: "Lead Generation Scrapers",
    category: "automation",
    client: "Agencies & outbound teams",
    tagline: "Search-based lead scraping that cleans, splits and logs contacts into ready-to-use sheets.",
    images: ["assets/leadgen-google.webp", "assets/leadgen-sheets.webp"],
    url: "",
    stack: ["n8n", "Google Search scraping", "JavaScript", "Google Sheets"],
    challenge: "Clients needed steady, deduplicated lead lists without paying for an expensive data tool.",
    work: [
      "Google Search lead gen routes each query type to its own scraper loop and appends the results to a sheet",
      "A sheet-triggered version picks up new search requests, calls the scraper, parses the results with code and splits leads into batches of 50 across sheets",
      "Marks each request as done so nothing runs twice"
    ],
    result: "Self-serve lead lists: add a row to a sheet and get organised leads back."
  },
  {
    title: "PCB Enclosure Design",
    category: "3d",
    client: "Hardware & IoT makers",
    tagline: "Custom enclosures for PCBs and electronics, ready for 3D printing or injection moulding.",
    images: ["assets/pcb-enclosure-1.webp", "assets/pcb-enclosure-2.webp"],
    url: "",
    stack: ["Fusion 360", "SolidWorks", "STL", "STEP", "3MF"],
    challenge: "Makers needed enclosures that fit their exact boards, print cleanly and can scale to manufacturing.",
    work: [
      "Designed cases around the PCB with screw bosses, brass inserts and port cut-outs",
      "Made snap-fit and screw-down variants for PLA, PETG and translucent light-pipe builds",
      "Covered Raspberry Pi cases, Arduino boxes, handheld IoT devices and wall-mounted sensors",
      "Delivered 2D technical drawings plus STL, STEP and 3MF files"
    ],
    result: "Print-ready, manufacturable enclosures from a board outline to the final files."
  },
  {
    title: "AI Content & Video Pipeline",
    category: "automation",
    client: "Content creator · Social media",
    tagline: "Ideas to published short videos on three platforms with no manual steps.",
    images: ["assets/n8n-video-automation.webp"],
    url: "",
    stack: ["n8n", "OpenAI", "Video generation API", "YouTube / TikTok / Instagram"],
    challenge: "Posting short-form video every day across three platforms was taking hours of manual work.",
    work: [
      "Idea agent pulls past topics from Google Sheets and generates fresh concepts",
      "Prompt agent writes video prompts and sends them to a video generation API",
      "Workflow polls for the finished render and handles errors and retries",
      "Final videos are captioned and auto-posted to YouTube, TikTok and Instagram"
    ],
    result: "A hands-off pipeline that keeps all three channels posting on schedule."
  },
  {
    title: "AI SEO Article Publisher",
    category: "automation",
    client: "Content site · SEO",
    tagline: "Keyword-targeted articles written by AI agents and published to the CMS.",
    images: ["assets/n8n-seo-automation.webp"],
    url: "",
    stack: ["n8n", "AI agents", "CMS API"],
    challenge: "The client needed a steady flow of SEO articles without paying for every draft by hand.",
    work: [
      "AI agents research keywords and write structured, optimised articles",
      "Outputs are validated and formatted into CMS-ready posts",
      "Articles publish straight to the CMS on a schedule"
    ],
    result: "Consistent SEO publishing with minimal manual input."
  },
  {
    title: "Copper State Tackle",
    category: "web",
    client: "Fishing tackle retailer · USA",
    tagline: "A fast headless Shopify storefront on Hydrogen and Oxygen.",
    images: ["assets/copperstate.webp"],
    url: "https://copperstatetackle.com/",
    stack: ["Shopify Hydrogen", "Oxygen", "React", "Storefront API"],
    challenge: "The brand needed a storefront that could hold a large tackle catalogue and still load quickly for shoppers on mobile.",
    work: [
      "Built a custom Hydrogen storefront and deployed it on Shopify Oxygen hosting",
      "Set up the headless architecture against the Storefront API",
      "Customised navigation, collections and product pages for a deep catalogue",
      "Tuned performance so pages stay fast as the range grows"
    ],
    result: "A scalable headless store the team can keep growing without a rebuild."
  },
  {
    title: "BagUps",
    category: "web",
    client: "Eco trash-bag brand · USA",
    tagline: "Theme customisation and UX polish for a subscription-style Shopify store.",
    images: ["assets/bagups.webp"],
    url: "https://bagups.com/",
    stack: ["Shopify", "Liquid", "Theme customisation"],
    challenge: "BagUps wanted their product story and the \"Help me choose\" journey to feel clearer, with a smoother route to checkout.",
    work: [
      "Made tailored Liquid theme modifications across key templates",
      "Optimised layouts and product presentation",
      "Improved site performance and the overall shopping flow"
    ],
    result: "A cleaner storefront that guides shoppers to the right product faster."
  }
];
