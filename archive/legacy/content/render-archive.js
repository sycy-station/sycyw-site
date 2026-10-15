const { ARCHIVE, ARCHIVE_STATUS } = require("./archive.js");

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
const plain = (s) => String(s).replace(/`/g, "");

const DAY = 86400000;
const dayNo = (date) => Math.round(Date.parse(`${date}T00:00:00Z`) / DAY);
const mmdd = (date) => date.slice(5).replace("-", ".");
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const check = () => {
  const seen = new Set();
  ARCHIVE.forEach((e) => {
    if (!ARCHIVE_STATUS[e.status]) throw new Error(`归档 ${e.no} 的状态不存在: ${e.status}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date) || isNaN(dayNo(e.date))) {
      throw new Error(`归档 ${e.no} 的日期格式不对: ${e.date}`);
    }
    if (seen.has(e.no)) throw new Error(`归档编号重复: ${e.no}`);
    seen.add(e.no);
  });
};

const mark = (s) => `<span class="ar-mark" data-s="${s}" aria-hidden="true"></span>`;

const chart = () => {
  const dates = ARCHIVE.map((e) => e.date).sort();
  const first = dayNo(dates[0]);
  const last = dates[dates.length - 1];
  const span = dayNo(last) - first + 1;

  const groups = new Map();
  ARCHIVE.forEach((e) => {
    const d = dayNo(e.date) - first + 1;
    if (!groups.has(d)) groups.set(d, []);
    groups.get(d).push(e);
  });
  const days = [...groups].sort((a, b) => a[0] - b[0]);
  const tall = Math.max(...days.map(([, list]) => list.length));

  // 按日期在区间里的位置铺开，整幅图占满一行
  const pct = (d) => `${span > 1 ? ((d - 1) / (span - 1)) * 100 : 0}%`;

  const cols = days.map(([d, list]) => {
    const marks = list.map((e) => {
      const tip = `${e.no} ${plain(e.title)} · ${ARCHIVE_STATUS[e.status].label}`;
      return `                <a class="ar-mark" data-s="${e.status}" href="#a-${e.no}" tabindex="-1" title="${esc(tip)}"></a>`;
    });
    return `              <div class="ar-col" style="--p:${pct(d)}">
${marks.join("\n")}
                <span class="ar-col-n">${list.length}</span>
              </div>`;
  });

  // 周一画长刻度
  const weeks = [];
  for (let d = 1; d <= span; d++) {
    if (new Date((first + d - 1) * DAY).getUTCDay() === 1) {
      weeks.push(`<i class="ar-wk" style="--p:${pct(d)}"></i>`);
    }
  }

  // 窄屏下与上一个可见读数相隔不到三天的读数撤掉，跨月的保留
  let shownDay = -Infinity;
  let month = "";
  const labels = days.map(([d, list]) => {
    const date = list[0].date;
    const m = date.slice(5, 7);
    const near = m === month && d - shownDay < 3;
    if (!near) shownDay = d;
    const mon = m === month ? "" : `<small>${MONTHS[Number(m) - 1]}</small>`;
    month = m;
    return `              <span class="ar-day${near ? " is-near" : ""}" style="--p:${pct(d)}">${date.slice(8)}${mon}</span>`;
  });

  const to = last.slice(0, 4) === dates[0].slice(0, 4) ? mmdd(last) : last.replace(/-/g, ".");

  return `          <figure class="ar-chart">
            <div class="ar-chart-scroll">
              <div class="ar-plot-wrap" style="--tall:${tall}" aria-hidden="true">
                <div class="ar-plot">
${cols.join("\n")}
                </div>
                <div class="ar-scale">${weeks.join("")}</div>
                <div class="ar-days">
${labels.join("\n")}
                </div>
              </div>
            </div>
            <figcaption class="ar-cap">${dates[0].replace(/-/g, ".")} → ${to}，共 ${ARCHIVE.length} 条，按登记日期堆叠。长刻度是周一。</figcaption>
          </figure>`;
};

const filter = () => {
  const count = (s) => ARCHIVE.filter((e) => e.status === s).length;
  const chips = Object.keys(ARCHIVE_STATUS)
    .filter((s) => count(s))
    .map(
      (s) =>
        `            <button type="button" class="ar-chip" data-filter="${s}" aria-pressed="false">${mark(s)}<span class="ar-chip-k">${ARCHIVE_STATUS[s].label}</span><span class="ar-chip-n">${count(s)}</span></button>`
    );

  return `          <div class="ar-filter" role="group" aria-label="按状态筛选" hidden>
            <span class="ar-filter-k" aria-hidden="true">STATUS</span>
            <button type="button" class="ar-chip" data-filter="all" aria-pressed="true"><span class="ar-chip-k">全部</span><span class="ar-chip-n">${ARCHIVE.length}</span></button>
${chips.join("\n")}
            <span class="ar-count" aria-live="polite"></span>
            <button type="button" class="ar-expand">全部展开</button>
          </div>`;
};

const FACTS = [
  ["tried", "尝试"],
  ["result", "结果"],
  ["now", "现状"]
];

const row = (e) => {
  const facts = FACTS.filter(([k]) => e[k]).map(
    ([k, label]) => `              <div><dt>${label}</dt><dd>${inline(e[k])}</dd></div>`
  );
  if (e.ref) {
    const ref = e.href ? `<a class="ar-link" href="${esc(e.href)}">${esc(e.ref)}</a>` : inline(e.ref);
    facts.push(`              <div class="ar-ref"><dt>出处</dt><dd>${ref}</dd></div>`);
  }

  return `          <li class="ar-item reveal-item" id="a-${e.no}" data-s="${e.status}">
            <details class="ar-row">
              <summary class="ar-sum">
                <span class="ar-no">${e.no}</span>
                <time class="ar-date" datetime="${e.date}">${mmdd(e.date)}</time>
                <span class="ar-area">${esc(e.area)}</span>
                <span class="ar-title">${inline(e.title)}</span>
                <span class="ar-gist">${inline(e.gist)}</span>
                <span class="ar-state">${mark(e.status)}${ARCHIVE_STATUS[e.status].label}</span>
                <span class="ar-tog" aria-hidden="true"></span>
              </summary>
              <dl class="ar-facts">
${facts.join("\n")}
              </dl>
            </details>
          </li>`;
};

const list = () => `        <div class="ar-ledger">
          <div class="ar-head" aria-hidden="true">
            <span>编号</span><span>日期</span><span>分区</span><span>条目</span><span>要点</span><span>状态</span>
          </div>
          <ol class="ar-list" role="list">
${ARCHIVE.map(row).join("\n")}
          </ol>
        </div>`;

const archiveVars = (page) => {
  check();
  return {
    archivePreface: (page.manifesto || []).map((t) => `          <p>${esc(t)}</p>`).join("\n"),
    archiveChart: chart(),
    archiveFilter: filter(),
    archiveList: list()
  };
};

module.exports = { archiveVars };
