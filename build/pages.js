const SITE_URL = "";
const SPLASH_SIDES = ["ecosystem", "join"];
const SPLASH_CAPTION = "CULTURE / CREATION / TECHNOLOGY";
const ABOUT_DESC = "森韵次元连接二次元文化、内容创作与技术，围绕次元坞平台与社区交流，探索属于共同热爱的数字空间。";
const ABOUT_CANON = "用创意与科技，连接二次元与现实";
const ABOUT_LINES = {
  pool: ["让热爱，拥有自己的次元", "从一个社区，走向更多可能", "文化与技术，在这里相遇", "一起把想法，变成看得见的作品"],
  quips: { refresh: "每一次相遇，都是新的开始", allSeen: "六个空间，同一种热爱", dwell: "慢慢看，故事还在继续", away: "欢迎回来，继续我们的故事", night: "热爱，也在深夜发光" }
};
const ABOUT_RULES = { refreshMin: 4, dwellMin: 180000, awayMin: 604800000, nightFrom: 1, nightTo: 5 };
const PAGES = [
  { slug: "products", no: "01", title: "次元坞", sub: "PLATFORM", desc: "为 Vup、术曲与二次元创作，构想一个相遇的空间。", year: "2024", freq: "88.1" },
  { slug: "ecosystem", no: "02", title: "生态伙伴", sub: "ECOSYSTEM", desc: "从云端支持到社区交流，连接同行的力量。", year: "2024", freq: "91.5" },
  { slug: "team", no: "03", title: "核心团队", sub: "OUR TEAM", desc: "因共同的热爱相遇，让不同的专长一起生长。", year: "2024", freq: "94.7" },
  { slug: "about", no: "04", title: "关于我们", sub: "ABOUT US", desc: "从 Minecraft 社区出发，走向文化与技术的交汇处。", year: "2024", freq: "98.3" },
  { slug: "join", no: "05", title: "加入共创", sub: "CO-CREATE", desc: "带上你的想法，一起探索值得创造的事。", year: "2024", freq: "101.9" },
  { slug: "contact", no: "06", title: "联系合作", sub: "CONTACT", desc: "关于产品、技术与合作，让对话从这里开始。", year: "2024", freq: "104.6" }
];
module.exports = { PAGES, SPLASH_SIDES, SPLASH_CAPTION, ABOUT_DESC, ABOUT_CANON, ABOUT_LINES, ABOUT_RULES, SITE_URL };
