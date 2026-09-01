const SITE_URL = "";
const SPLASH_SIDES = ["interaction", "motion"];
const SPLASH_CAPTION = "MINIMAL SYSTEM / INTERFACE LAB";

const ABOUT_DESC =
  "森韵次元坞是一个专注于极简系统与界面的实验室。我们相信少即是多，克制本身就是一种表达方式。";
const ABOUT_CANON = "设计与工程之间没有边界";

const ABOUT_LINES = {
  pool: [
    "少即是多，但少很难",
    "克制本身就是一种表达",
    "每一处间距都被认真想过",
    "好的界面不需要解释自己"
  ],
  quips: {
    refresh: "这句会变，其他不会",
    allSeen: "六页都看过了，接下来是空白",
    dwell: "你已经在这里三分钟了",
    away: "隔了一周，这里还是这样",
    night: "这个时间还在看排版"
  }
};

const ABOUT_RULES = {
  refreshMin: 4,
  dwellMin: 180000,
  awayMin: 604800000,
  nightFrom: 1,
  nightTo: 5
};

const PAGES = [
  {
    slug: "system-design",
    no: "01",
    title: "系统设计",
    sub: "SYSTEM DESIGN",
    desc: "结构化的界面逻辑与组件体系",
    year: "2024",
    freq: "88.1"
  },
  {
    slug: "interaction",
    no: "02",
    title: "交互研究",
    sub: "INTERACTION",
    desc: "动效节奏与真实的操作反馈",
    year: "2024",
    freq: "91.5"
  },
  {
    slug: "brand",
    no: "03",
    title: "品牌语言",
    sub: "BRAND VOICE",
    desc: "克制而清晰的视觉表达系统",
    year: "2023",
    freq: "94.7"
  },
  {
    slug: "about",
    no: "04",
    title: "关于我们",
    sub: "ABOUT US",
    desc: "我们是谁，从哪里来，往哪里去",
    year: "2023",
    freq: "98.3"
  },
  {
    slug: "motion",
    no: "05",
    title: "动效编排",
    sub: "MOTION",

    desc: "时序、缓动与可被跳过的编排",
    year: "2024",
    freq: "101.9"
  },
  {
    slug: "archive",
    no: "06",
    title: "实验归档",
    sub: "ARCHIVE",
    desc: "未完成的尝试与被否决的方案",
    year: "2023",
    freq: "104.6",

    manifesto: [
      "我们不追逐流行的视觉语言，也不堆叠不必要的装饰。真正的设计感，来自于对留白、节奏和秩序的耐心打磨。",
      "一个页面的好坏，不取决于它用了多少组件，而取决于它有没有被认真地思考过每一处间距、每一次过渡、每一个字号的选择。"
    ]
  }
];

module.exports = {
  PAGES,
  SPLASH_SIDES,
  SPLASH_CAPTION,
  ABOUT_DESC,
  ABOUT_CANON,
  ABOUT_LINES,
  ABOUT_RULES,
  SITE_URL
};
