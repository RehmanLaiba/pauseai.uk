// ============================================================================
// How this list gets built and maintained
// ============================================================================
//
// DISCOVERY
// A new item usually starts as a lead — a name, an outlet, a rough date,
// or a URL someone found — not a finished, verified entry. Before it's
// added:
//
// - Prefer the outlet's own on-site search over a generic web search.
//   Several major outlets (confirmed: BBC) block automated crawlers
//   outright, and generic search's `site:` filtering is unreliable for
//   others — both return noise or false positives rather than useful
//   results.
// - Open the actual page and read it — never trust a search snippet or
//   headline alone. Snippets have produced false leads this way (e.g. a
//   promising-looking "hit" for one person turned out to be about someone
//   else entirely).
// - When a page is paywalled or JS-blocks automated fetching, retry with
//   a real logged-in browser session before giving up — it's cracked
//   pages that a plain fetch couldn't (BBC, Reuters Connect, Instagram,
//   YouTube's full descriptions, IMAGO). A hard paywall with no visible
//   text (FT) is a genuine dead end, not a "try harder" case.
// - Check images, not just body text. Several entries (Gizmodo, The
//   Guardian) have zero PauseAI mention in their article text but use a
//   genuine photo of one of our protests as the hero image, confirmed by
//   matching photographer credit against other confirmed-us photos. Text
//   search alone misses these.
//
// INCLUSION / EXCLUSION
// An item earns a place here if it has a real, verifiable connection to
// us — named in the text, or a confirmed photo of one of our protests.
// Zero connection (neither text nor photo, on inspection) means it
// doesn't belong here even if it matched on a keyword or headline theme —
// two entries (Futurism, The Observer's podcast) were removed on this
// basis. A shared name is not a connection: one outlet (The Spectator)
// was removed after realizing it cited "PauseAI.com", a different
// organization — PauseAI Global's real site is pauseai.info.
//
// THREE DISTINCT ORGS, NOT TWO — read carefully before adding anything:
//   - PauseAI UK — us. A national chapter.
//   - PauseAI Global — the international org UK is a chapter of.
//     UK and Global are related (chapter and parent); coverage of either
//     can belong here (see priority note below).
//   - "PauseAI US" — a SEPARATE, DIFFERENT organization. Despite the
//     similar name, it is not a Global chapter and not us. Coverage of
//     PauseAI US does not belong in this file, full stop — treat a "US"
//     name-match with the same suspicion as the PauseAI.com case above,
//     not as a sibling chapter to include.
//
// UK vs PauseAI Global (the legitimate pair): both are legitimate and
// both can appear, but they're not the same thing. Coverage of PauseAI
// UK's own activity, protests, or spokespeople is the priority.
// Interviews with PauseAI Global's CEO (Maxime Fournes) are kept too,
// including on UK channels (GB News, TalkTV), but are explicitly lower
// priority — flagged in comments so they're easy to reconsider or swap
// out once genuine UK spokesperson coverage on the same outlet turns up.
//
// Where a claim couldn't be verified — a date, a title, an attribution —
// it's marked with a `TODO` comment rather than guessed. Search
// `TODO` in this file to find everything still open.
//
// CAROUSEL CURATION (`inCarousel`)
// The full table above (rendered on /press) includes everything that
// passes the inclusion bar, regardless of whether the outlet has a logo
// asset. The homepage marquee is a curated subset of that: only outlets
// with a strong, official, recognizable logo, capped at one slot per
// outlet, and — as of the most recent pass — deliberately balanced
// across political lean rather than "everyone with a logo is in." Weaker
// or less mainstream-recognizable logos (regional editions, lifestyle
// magazines, smaller outlets) were cut from the carousel specifically to
// keep it reading as instantly recognizable, even though those items stay
// fully present in the /press table.
//
// POLITICAL LEAN (`lean`)
// Sourced from AllSides, Ad Fontes, and Media Bias/Fact Check where a
// rating exists for the outlet. Left unset — not guessed — for wire/photo
// agencies, lifestyle magazines, and small outlets with no real bias
// rating to draw on.
// ============================================================================

export type CoverageItem = {
  outlet: string;
  title: string;
  medium: "Article" | "Video" | "Photos";
  /** Single-link items set this. Multi-platform items (the same clip/story
      cross-posted) set `links` instead and leave this undefined. */
  url?: string;
  /** For a story cross-posted across platforms: one row showing each
      platform as its own link, e.g. "Instagram, X, YouTube". */
  links?: { label: string; url: string }[];
  /** Publish date, YYYY-MM-DD. Drives sort order on the /press coverage
      table; undated items sort to the bottom. */
  date?: string;
  logoSrc?: string;
  logoHtml?: string;
  /** Desktop render height in px. Chosen per logo so every mark carries
      roughly equal visual area (height ∝ 1/√aspect-ratio): wide wordmarks
      get shorter, square marks get taller. Defaults to 44 in CSS. */
  logoHeight?: number;
  /** Intrinsic pixel dimensions of logoSrc (its viewBox/natural size, not
      the rendered size) — required by next/image for aspect ratio; actual
      display size is still driven by the logoHeight CSS var. */
  logoIntrinsicWidth?: number;
  logoIntrinsicHeight?: number;
  /** Show this item's logo in the homepage marquee carousel. Only set for
      outlets with a strong, recognizable, official logo asset — an item
      with no logoSrc/logoHtml can never appear there regardless of this
      flag. Each outlet should carry at most one `true` so the carousel
      doesn't repeat the same mark. */
  inCarousel?: boolean;
  /** Outlet's political lean, sourced from AllSides / Ad Fontes / Media
      Bias Fact Check where a rating exists. Omitted for wire/photo
      agencies, lifestyle magazines, and small outlets with no bias
      rating — not a guess, genuinely not applicable or not ratable. */
  lean?: "Left" | "Lean Left" | "Center" | "Lean Right" | "Right";
};

const ALL_COVERAGE: CoverageItem[] = [
  {
    logoSrc: "/images/media-coverage/Financial_Times_corporate_logo.svg",
    outlet: "Financial Times",
    logoHeight: 56,
    logoIntrinsicWidth: 228,
    logoIntrinsicHeight: 311,
    title: "Peter Kyle agreed to include 'more positive language' in AI speech after Mandelson's advice",
    url: "https://www.ft.com/content/1b3e3117-b979-4187-b983-c785d230c09b",
    medium: "Article",
    inCarousel: true,
    lean: "Center",
  },
  {
    logoSrc: "/images/media-coverage/Wired_logo.svg",
    outlet: "Wired Italia",
    logoHeight: 35,
    logoIntrinsicWidth: 125,
    logoIntrinsicHeight: 25,
    title: "Movements against AI are growing — inside the groups trying to stop it",
    url: "https://www.wired.it/article/movimenti-contro-intelligenza-artificiale-mappa-nomi-pauseai-stopai-controlai/",
    date: "2026-05-30",
    medium: "Article",
  },
  {
    logoSrc: "/images/media-coverage/Cosmopolitan_logo.svg",
    outlet: "Cosmopolitan Italia",
    logoHeight: 33,
    logoIntrinsicWidth: 600,
    logoIntrinsicHeight: 106,
    title: "Gen Z is losing faith in AI — and protest movements are growing",
    url: "https://www.cosmopolitan.com/it/lifecoach/news-attualita/a71455730/gen-z-paura-intelligenza-artificiale-ansia/",
    date: "2026-06-02",
    medium: "Article",
  },
  {
    logoSrc: "/images/media-coverage/Gizmodo_logo.svg",
    outlet: "Gizmodo",
    logoHeight: 33,
    logoIntrinsicWidth: 186,
    logoIntrinsicHeight: 36,
    // Article text never names PauseAI — it's about an unrelated Illinois
    // AI lobbying bill. Hero image is genuinely one of ours though: a
    // protester holding a "PAUSEAI" sign, credited Justin Tallis/AFP via
    // Getty — the same photographer credited on confirmed PauseAI UK
    // photos elsewhere in this file.
    title: "The OpenAI–Anthropic Cold War Comes to Illinois",
    url: "https://gizmodo.com/the-openai-anthropic-cold-war-comes-to-illinois-2000746324",
    date: "2026-04-14",
    medium: "Article",
    lean: "Lean Left",
  },
  {
    logoSrc: "/images/media-coverage/wall-street-journal-logo.png",
    outlet: "Wall Street Journal",
    logoHeight: 26,
    logoIntrinsicWidth: 777,
    logoIntrinsicHeight: 67,
    title: "AI Giants Go on Charm Offensive to Avert Public Backlash",
    url: "https://www.wsj.com/tech/ai/ai-companies-public-relations-ae312d79",
    date: "2026-04-07",
    medium: "Article",
    inCarousel: true,
    lean: "Center",
  },
  {
    logoSrc: "/images/media-coverage/Business_Insider_Logo.svg",
    outlet: "Business Insider",
    logoHeight: 43,
    logoIntrinsicWidth: 103,
    logoIntrinsicHeight: 32,
    title: "Protesters accuse Google DeepMind of breaking AI safety promises",
    url: "https://www.businessinsider.com/protesters-accuse-google-deepmind-breaking-promises-ai-safety-2025-6",
    date: "2025-06-30",
    medium: "Article",
    inCarousel: true,
    lean: "Lean Left",
  },
  {
    logoSrc: "/images/media-coverage/Time_Magazine_logo.svg",
    outlet: "TIME",
    logoHeight: 42,
    logoIntrinsicWidth: 298,
    logoIntrinsicHeight: 92,
    title: "60 U.K. lawmakers accuse Google of breaking AI safety pledge",
    url: "https://time.com/7313320/google-deepmind-gemini-ai-safety-pledge/",
    date: "2025-08-29",
    medium: "Article",
    inCarousel: true,
    lean: "Lean Left",
  },
  {
    logoSrc: "/images/media-coverage/Fortune_magazine_logo.svg",
    outlet: "Fortune",
    logoHeight: 37,
    logoIntrinsicWidth: 90,
    logoIntrinsicHeight: 21,
    title: "Lawmakers press Google DeepMind over delayed safety report",
    url: "https://fortune.com/2025/08/29/british-lawmakers-accuse-google-deepmind-of-breach-of-trust-over-delayed-gemini-2-5-pro-safety-report/",
    date: "2025-08-29",
    medium: "Article",
    inCarousel: true,
    lean: "Center",
  },
  {
    logoSrc: "/images/media-coverage/MIT_Technology_Review_modern_logo.svg",
    outlet: "MIT Technology Review",
    logoHeight: 54,
    logoIntrinsicWidth: 184,
    logoIntrinsicHeight: 92,
    title: "I checked out one of the biggest anti-AI protests yet",
    url: "https://www.technologyreview.com/2026/03/02/1133814/i-checked-out-londons-biggest-ever-anti-ai-protest/",
    date: "2026-03-02",
    medium: "Article",
    inCarousel: true,
    lean: "Center",
  },
  {
    logoSrc: "/images/media-coverage/The_Guardian_Logo.svg",
    outlet: "The Guardian",
    logoHeight: 44,
    logoIntrinsicWidth: 295,
    logoIntrinsicHeight: 97,
    // Article text never names PauseAI — it's about a House of Lords
    // copyright report. Hero image is genuinely one of ours: protesters
    // holding "Pull The Plug" and "It's not too late... to regulate"
    // signs from the same march covered elsewhere in this file.
    title: "UK arts must not be sacrificed for speculative AI gains, peers say",
    url: "https://www.theguardian.com/technology/2026/mar/06/uk-arts-must-not-be-sacrificed-for-speculative-ai-gains-peers-say",
    date: "2026-03-06",
    medium: "Article",
    inCarousel: true,
    lean: "Left",
  },
  {
    logoSrc: "/images/media-coverage/BBC_Logo_2021.svg",
    outlet: "BBC",
    logoHeight: 40,
    logoIntrinsicWidth: 560,
    logoIntrinsicHeight: 160,
    title: "Hundreds of people march for tighter controls on AI",
    // This URL is a third-party reupload/compilation channel ("Mark
    // 1333"), not BBC's own channel — searched BBC's own site and
    // YouTube's official BBC News channel and couldn't find the original
    // source. Content looks like a genuine BBC London bulletin segment
    // (28 Feb 2026), just not a verifiable BBC source link. Swap this for
    // the real BBC link if it turns up.
    url: "https://youtu.be/-0CRojvk1FE?t=146",
    date: "2026-02-28",
    medium: "Video",
    inCarousel: true,
    lean: "Center",
  },
  {
    outlet: "BBC",
    title: "Why some experts increasingly fear AI will take over",
    url: "https://www.bbc.co.uk/news/articles/c74edv9887eo",
    date: "2026-09-10",
    medium: "Article",
    lean: "Center",
  },
  {
    outlet: "BBC",
    title: "Why are there concerns AI could threaten humanity?",
    url: "https://www.bbc.co.uk/news/articles/c790xvnzgnno",
    date: "2026-09-14",
    medium: "Article",
    lean: "Center",
  },
  {
    logoSrc: "/images/media-coverage/the-observer-logo.svg",
    outlet: "The Observer",
    logoHeight: 30,
    logoIntrinsicWidth: 980,
    logoIntrinsicHeight: 157,
    // TODO verify: written episode description has no PauseAI mention,
    // but this is a 33-min interview — audio may name us and there's no
    // transcript to check. Confirm by listening before treating as
    // confirmed UK coverage.
    title: "Endgame: Can we live with Artificial General Intelligence? - The People vs AI",
    url: "https://open.spotify.com/episode/3jPBSckJzWIq6Y2agpVSKH",
    date: "2026-06-10",
    medium: "Article",
  },
  {
    logoSrc: "/images/media-coverage/The_Independent_Logo.png",
    outlet: "The Independent",
    logoHeight: 26,
    logoIntrinsicWidth: 540,
    logoIntrinsicHeight: 38,
    title: "Pro-human AI declaration gains diverse support amid calls for stronger safety measures",
    url: "https://www.independent.co.uk/tech/ai-safety-declaration-steve-bannon-b2932570.html",
    date: "2026-03-05",
    medium: "Article",
    inCarousel: true,
    lean: "Lean Left",
  },
  {
    logoSrc: "/images/media-coverage/Futurism_Logo.svg",
    outlet: "Futurism",
    logoHeight: 33,
    logoIntrinsicWidth: 489,
    logoIntrinsicHeight: 93,
    // Article text doesn't name PauseAI by name (covers the SF "QuitGPT"
    // protest plus a vague "London" mention), but the hero photo is
    // confirmed to be one of our own UK protests.
    title: "The rage at OpenAI has grown so immense that there are entire protests against it",
    url: "https://futurism.com/artificial-intelligence/rage-openai-protests",
    date: "2026-03-05",
    medium: "Article",
  },
  {
    logoSrc: "/images/media-coverage/Real_Media_Logo.png",
    outlet: "Real Media",
    logoHeight: 52,
    logoIntrinsicWidth: 94,
    logoIntrinsicHeight: 83,
    title: "Pull the plug — Pause AI: a timely call for urgent regulation",
    url: "https://realmedia.press/pull-the-plug",
    date: "2026-03-06",
    medium: "Article",
  },
  {
    logoHtml: '<span class="news-logo-text news-logo-text--swlondoner"><span class="sw">SW</span>Londoner</span>',
    outlet: "SW Londoner",
    title: "Pressing pause on AI: London activists to march in largest AI safety protest yet",
    url: "https://www.swlondoner.co.uk/news/27022026-pressing-pause-on-ai-london-activists-to-march-in-largest-ai-safety-protest-yet",
    date: "2026-02-27",
    medium: "Article",
  },
  {
    logoSrc: "/images/media-coverage/Politis_Logo.png",
    outlet: "Politis",
    logoHeight: 43,
    logoIntrinsicWidth: 180,
    logoIntrinsicHeight: 58,
    title: "L'image : à Londres, une marche contre l'IA",
    url: "https://www.politis.fr/articles/2026/03/limage-a-londres-une-marche-contre-lia/",
    date: "2026-03-03",
    medium: "Article",
    lean: "Left",
  },
  {
    logoSrc: "/images/media-coverage/Daily_Mail_masthead.svg",
    outlet: "Daily Mail",
    logoHeight: 31,
    logoIntrinsicWidth: 1000,
    logoIntrinsicHeight: 158,
    title: "When given a choice, AI opts for self-preservation over human life — and that should terrify us all",
    url: "https://www.dailymail.com/debate/article-16032063/AI-opts-self-preservation-human-life.html",
    date: "2026-08-05",
    medium: "Article",
    inCarousel: true,
    lean: "Right",
  },
  {
    logoSrc: "/images/media-coverage/New_Statesman_magazine_logo.svg",
    outlet: "New Statesman",
    logoHeight: 30,
    logoIntrinsicWidth: 524,
    logoIntrinsicHeight: 80,
    title: "The anti-AI revolt is here",
    url: "https://www.newstatesman.com/politics/society/2026/08/the-anti-ai-revolt-is-here",
    date: "2026-08-19",
    medium: "Article",
    lean: "Left",
  },
  {
    logoSrc: "/images/media-coverage/Channel_4_logo.svg",
    outlet: "Channel 4",
    logoHeight: 56,
    logoIntrinsicWidth: 178,
    logoIntrinsicHeight: 240,
    title: "Hundreds of protesters rally against AI outside Downing Street",
    url: "https://www.channel4.com/news/hundreds-of-protesters-rally-against-ai-outside-downing-street",
    date: "2026-09-16",
    medium: "Article",
    inCarousel: true,
    lean: "Center",
  },
  {
    logoSrc: "/images/media-coverage/ITV_logo.svg",
    outlet: "ITV",
    logoHeight: 46,
    logoIntrinsicWidth: 1000,
    logoIntrinsicHeight: 368,
    title: "Science Correspondent breaks down the 'terrifying' risks of superintelligent AI",
    url: "https://www.youtube.com/watch?v=cvMRaa6h8tM&t=486s",
    date: "2026-09-16",
    medium: "Video",
    inCarousel: true,
    lean: "Center",
  },
  {
    logoSrc: "/images/media-coverage/Channel_4_logo.svg",
    outlet: "Channel 4",
    logoHeight: 56,
    logoIntrinsicWidth: 178,
    logoIntrinsicHeight: 240,
    title: "The danger of AI and the global race to control it - explained",
    url: "https://www.youtube.com/watch?v=rDb5qlSAmvQ&t=249s",
    date: "2026-09-17",
    medium: "Video",
    lean: "Center",
    // Channel 4 already has a marquee slot above (its direct protest
    // coverage) — skip a second logo for the same outlet.
  },
  {
    outlet: "Channel 4",
    medium: "Video",
    title: "PauseAI activists stage emergency protest outside Downing Street",
    links: [
      { label: "Facebook", url: "https://www.facebook.com/reel/1522309576272007/" },
      { label: "X", url: "https://x.com/Channel4News/status/2100298598772605015" },
      { label: "YouTube", url: "https://www.youtube.com/shorts/2JRtI-dDwgc" },
    ],
    date: "2026-09-16",
    lean: "Center",
  },
  {
    outlet: "ITV",
    medium: "Video",
    title: "Protesters demand pause on AI development",
    links: [
      { label: "Instagram", url: "https://www.instagram.com/p/DdWzB4Gxkv_/" },
      { label: "YouTube", url: "https://www.youtube.com/shorts/TFxdevKHM8s" },
    ],
    date: "2026-09-16",
    lean: "Center",
  },
  {
    outlet: "ITV",
    medium: "Video",
    title: "Why is AI safety back in the spotlight",
    url: "https://www.youtube.com/shorts/rkgvZRnoytA",
    date: "2026-09-16",
    lean: "Center",
  },
  {
    outlet: "Al Arabiya",
    medium: "Video",
    title: "Activists gather outside Downing Street in London, calling on governments to pause AI development",
    url: "https://www.instagram.com/p/DdWvDuejvh7/",
    date: "2026-09-16",
    lean: "Lean Right",
  },
  {
    outlet: "Imago Images",
    medium: "Photos",
    title: "Pause AI, urging the government to limit the development of artificial intelligence amid warnings that it could lead to human extinction",
    url: "https://www.imago-images.com/st/0867004406",
    date: "2026-09-16",
  },
  {
    outlet: "Reuters Connect (Anadolu Agency)",
    medium: "Photos",
    title: "PauseAI activists stage emergency protest outside Downing Street in London",
    url: "https://www.reutersconnect.com/item/pauseai-activists-stage-emergency-protest-outside-downing-street-in-london/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX01UMUFOQURMMDAwTkZPN1hH",
    date: "2026-09-16",
  },
  {
    outlet: "Reuters Connect (Zuma Press)",
    medium: "Photos",
    title: "Pause AI Protest Outside Downing Street",
    url: "https://www.reutersconnect.com/item/pause-ai-protest-outside-downing-street/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX01UMVpVTUEwMDBGRzlOVEs",
    date: "2026-09-16",
  },
  {
    outlet: "Reuters Connect (Nurphoto)",
    medium: "Photos",
    title: "Pause AI Emergency Protest In London",
    url: "https://www.reutersconnect.com/item/pause-ai-emergency-protest-in-london/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX01UMU5VUlBITzAwMDhGQTJTVg",
    date: "2026-09-16",
  },
  {
    outlet: "Boston Globe",
    medium: "Photos",
    title: "AI rivals found rare agreement on safety. Putting it into practice is harder.",
    url: "https://www.bostonglobe.com/2026/09/16/business/ai-slowdown-safety/",
    date: "2026-09-16",
    lean: "Lean Left",
  },
  {
    logoSrc: "/images/media-coverage/Vox_logo.svg",
    outlet: "Vox",
    logoHeight: 52,
    logoIntrinsicWidth: 120,
    logoIntrinsicHeight: 58,
    medium: "Photos",
    title: "Should we be skeptical about the AI panic?",
    url: "https://www.vox.com/podcasts/502875/ai-existential-risk-jacob-coxon-anthropic-dario-amodei",
    date: "2026-09-16",
    inCarousel: true,
    lean: "Left",
  },
  {
    outlet: "Manchester Evening News",
    medium: "Photos",
    title: "King Charles to issue 'deeply concerning' message to AI leaders after doomsday warnings",
    url: "https://www.manchestereveningnews.co.uk/news/uk-news/king-charles-issue-deeply-concerning-34629383",
    date: "2026-09-17",
    lean: "Lean Left",
  },
  {
    outlet: "Daily Sabah",
    medium: "Photos",
    title: "From hallucinations to wiping out humanity: How AI's path advanced",
    url: "https://www.dailysabah.com/business/tech/from-hallucinations-to-wiping-out-humanity-how-ai-path-advanced",
    date: "2026-09-17",
    lean: "Right",
  },
  {
    logoHtml: '<span class="news-logo-text news-logo-text--ibtimes">International Business Times<span class="uk">UK</span></span>',
    outlet: "International Business Times",
    medium: "Article",
    title: "'10% Chance of Extinction': AI Protesters Take Scientists' Warning to Downing Street",
    url: "https://www.ibtimes.co.uk/london-protesters-demand-tougher-advanced-ai-controls-1820296",
    date: "2026-09-17",
    lean: "Center",
  },
  {
    logoSrc: "/images/media-coverage/GB_News_logo.png",
    outlet: "GB News",
    logoHeight: 28,
    logoIntrinsicWidth: 1240,
    logoIntrinsicHeight: 164,
    medium: "Video",
    // PauseAI Global CEO Maxime Fournes (not PauseAI UK specifically),
    // debating Maxwell Marlow of the Adam Smith Institute.
    title: "Should we shut down AI? GB News debate",
    url: "https://www.youtube.com/watch?v=kTc_Q72q7hY",
    date: "2026-07-24",
    inCarousel: true,
    lean: "Right",
  },
  {
    logoSrc: "/images/media-coverage/TalkTV_logo.png",
    outlet: "TalkTV",
    logoHeight: 52,
    logoIntrinsicWidth: 873,
    logoIntrinsicHeight: 778,
    medium: "Video",
    // PauseAI Global CEO Maxime Fournes (not PauseAI UK specifically),
    // interviewed by Ian Collins.
    title: "\"It Could Be Human Extinction\" | AI Expert Warns Of Internet Catastrophe In SIX MONTHS",
    url: "https://www.youtube.com/watch?v=CuwQkwhhfdM",
    date: "2026-09-14",
    inCarousel: true,
    lean: "Right",
  },
  {
    outlet: "Islington Tribune",
    medium: "Article",
    title: "Watch out! The robots are coming",
    url: "https://www.islingtontribune.co.uk/article/watch-out-the-robots-are-coming",
    date: "2023-05-26",
  },
];

// Full, dated table for the /press page — newest first, undated items
// (most social/wire links are blocked to automated date lookups) sorted
// to the bottom in their original list order.
export const allCoverage: CoverageItem[] = [...ALL_COVERAGE].sort((a, b) => {
  if (a.date && b.date) return b.date.localeCompare(a.date);
  if (a.date) return -1;
  if (b.date) return 1;
  return 0;
});

// The homepage marquee's curated subset — only outlets with a strong,
// recognizable logo (`inCarousel: true`), one slot per outlet. Desktop:
// 2 rows. Mobile (handled in page.tsx): 3 rows so each row is shorter and
// easier to scan on a narrow viewport.
const CAROUSEL_ITEMS = ALL_COVERAGE.filter((item) => item.inCarousel);
const desktopSplit = Math.ceil(CAROUSEL_ITEMS.length / 2);
const mobileSplit = Math.ceil(CAROUSEL_ITEMS.length / 3);

// The marquee loops by rendering each row's item list twice side by side
// and scrolling by exactly -50% — seamless only if one copy is already
// wider than the viewport. With a curated (short) item list, a half- or
// third-sized row can be too narrow on wide screens, leaving a gap
// instead of looping. Repeat a short row's items until the count is
// safely above what any realistic screen width needs, rather than
// shrinking the curation to fit.
function tileToMinLength<T>(items: T[], minLength: number): T[] {
  if (items.length === 0) return items;
  const tiled: T[] = [];
  while (tiled.length < minLength) tiled.push(...items);
  return tiled;
}

export const newsRow1 = tileToMinLength(CAROUSEL_ITEMS.slice(0, desktopSplit), 14);
export const newsRow2 = tileToMinLength(CAROUSEL_ITEMS.slice(desktopSplit), 14);

export const newsMobileRow1 = tileToMinLength(CAROUSEL_ITEMS.slice(0, mobileSplit), 10);
export const newsMobileRow2 = tileToMinLength(CAROUSEL_ITEMS.slice(mobileSplit, mobileSplit * 2), 10);
export const newsMobileRow3 = tileToMinLength(CAROUSEL_ITEMS.slice(mobileSplit * 2), 10);
