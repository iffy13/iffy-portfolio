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
  { id: "shopify",    title: "Shopify Stores",        meta: "Themes · Liquid · Store builds",  blurb: "Custom Shopify themes and store builds tuned for speed and conversion." },
  { id: "hydrogen",   title: "Headless Commerce",     meta: "Hydrogen · Oxygen · Storefront API", blurb: "React-powered Shopify storefronts with headless architecture." },
  { id: "wordpress",  title: "WordPress Sites",       meta: "Custom themes · WooCommerce",     blurb: "Custom WordPress builds, plugins and WooCommerce stores." },
  { id: "automation", title: "AI Automation",         meta: "n8n · AI agents · APIs",           blurb: "Workflows that create content, move data and publish on autopilot." },
  { id: "webapps",    title: "Web Apps",              meta: "React · Node.js · TypeScript",     blurb: "Bespoke web applications and internal tools." }
];

window.PROJECTS = [
  {
    title: "Copper State Tackle",
    category: "hydrogen",
    featured: true,
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
    category: "shopify",
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
  }
];
