const data = require("./join-data.json");
const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (index) => String(index + 1).padStart(2, "0");
// Keep source job copy intact; directions only organize the recruitment browser.
const jobCategories = [
  { id: "development", label: "开发岗", match: /开发|研发|技术|工程|程序|测试/ },
  { id: "design", label: "设计岗", match: /设计|创意|美术/ },
  { id: "operation", label: "运营岗", match: /运营|社群|社区/ },
  { id: "marketing", label: "市场岗", match: /市场|营销|商务/ },
];
const recruitmentJobs = data.recruitment.jobs.map((job) => ({
  ...job,
  direction: jobCategories.find((category) => category.id === job.direction)?.id ||
    jobCategories.find((category) => category.match.test(job.category))?.id || "other",
}));
const jobFilters = [{ id: "all", label: "全部岗位" }, ...jobCategories.map(({ id, label }) => ({ id, label }))];
if (recruitmentJobs.some((job) => job.direction === "other")) jobFilters.push({ id: "other", label: "其他岗位" });
const chapters = [
  { label: "岗位申请", sub: "OPPORTUNITIES" },
  { label: "团队文化", sub: "OUR CULTURE" },
  { label: "员工福利", sub: "LIFE & GROWTH" },
  { label: "加入流程", sub: "YOUR NEXT STEP" },
];
const head = (eyebrow, title, copy) => `<header class="join-panel-head" data-join-reveal><p class="join-kicker">${eyebrow}</p><h2>${title}</h2>${copy ? `<p class="join-intro">${esc(copy)}</p>` : ""}</header>`;
const pager = `<div class="join-pager"><span data-join-page-status aria-live="polite"></span><div><button type="button" data-join-prev aria-label="上一组">←</button><button type="button" data-join-next aria-label="下一组">→</button></div></div>`;
const featureList = (items, kind) => `<div class="join-feature-list" data-join-list="${kind}">${items.map((item, i) => `<article class="join-feature" data-join-item data-join-reveal><span class="join-feature-number" aria-hidden="true">${num(i)}</span><div><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></div></article>`).join("\n")}</div>${pager}`;
const jobList = (title, items, kind) => `<div class="join-requirements${kind === "responsibilities" ? " join-responsibilities" : ""}" data-join-reveal><h4>${title}</h4><ol>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ol></div>`;
const jobs = `${head("01 / OPPORTUNITIES", "找到与你同频的方向。", "我们正在寻找热爱二次元文化和科技创新的人才")}
  <p class="join-example" data-join-reveal><i aria-hidden="true"></i>${data.recruitment.isExample ? "参考站注明：当前岗位并非真实招聘信息，请勿贸然投递。" : "请选择岗位，查看职责与申请要求。"}</p>
  <div class="join-job-toolbar" data-join-reveal><span class="join-filter-label" id="joinFilterLabel">岗位方向</span><div class="join-job-filters" role="group" aria-labelledby="joinFilterLabel">${jobFilters.map((category, i) => `<button type="button" class="join-job-filter" data-join-filter="${category.id}" aria-pressed="${i === 0}" aria-controls="joinJobResults"><span>${category.label}</span><small>${category.id === "all" ? recruitmentJobs.length : recruitmentJobs.filter((job) => job.direction === category.id).length}</small></button>`).join("")}</div></div>
  <p class="join-filter-status" data-join-filter-status role="status" aria-live="polite"></p>
  <div class="join-jobs" id="joinJobResults">
    <div class="join-job-sidebar"><div class="join-job-list-head"><span data-join-job-count>全部岗位 · ${recruitmentJobs.length}</span><div class="join-job-pagination" hidden><span data-join-job-page></span><button type="button" data-join-job-prev aria-label="上一页岗位">←</button><button type="button" data-join-job-next aria-label="下一页岗位">→</button></div></div>
    <div class="join-job-index" role="tablist" aria-label="岗位列表" aria-orientation="vertical">${data.recruitment.jobs.map((job, i) => `<button class="join-job-choice" type="button" role="tab" id="join-job-tab-${job.id}" aria-controls="join-job-${job.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-join-job="${job.id}"><span class="join-job-number">${num(i)}</span><span class="join-job-name">${esc(job.title)}<small>${esc(job.category)}</small></span><span class="join-job-arrow" aria-hidden="true">↗</span></button>`).join("\n")}</div></div>
    <div class="join-job-details">${data.recruitment.jobs.map((job, i) => `<section class="join-job-detail" id="join-job-${job.id}" role="tabpanel" aria-labelledby="join-job-tab-${job.id}" tabindex="0"${i ? " hidden" : ""}>
      <div class="join-job-body"><div class="join-job-meta" data-join-reveal><span>${esc(job.category)}</span>${job.location ? `<span>工作地点 · ${esc(job.location)}</span>` : ""}</div>
      <h3 data-join-reveal>${esc(job.title)}</h3>${job.description ? `<p class="join-job-copy" data-join-reveal>${esc(job.description)}</p>` : ""}
      ${job.responsibilities?.length ? jobList("岗位职责", job.responsibilities, "responsibilities") : ""}
      ${jobList("任职要求", job.requirements, "requirements")}</div>
      <div class="join-job-foot" data-join-reveal><span>${data.recruitment.isExample ? "示例岗位 · 可预览申请流程" : "让我们认识你的热爱与专长"}</span><button type="button" class="join-action" data-join-apply="${job.id}">岗位申请 <span aria-hidden="true">↗</span></button></div>
    </section>`).join("\n")}</div>
    <div class="join-job-empty" hidden><span class="join-empty-mark" aria-hidden="true"></span><h3 data-join-empty-title>暂无岗位</h3><p>可以切换其他岗位分类，看看与你同频的方向。</p><button type="button" data-join-filter="all" class="join-empty-reset">查看全部岗位 <span aria-hidden="true">↗</span></button></div>
  </div>`;
const culture = `${head("02 / OUR CULTURE", "有共同热爱，也容得下不同。", data.culture.intro)}${featureList(data.culture.items, "culture")}`;
const benefits = `${head("03 / LIFE & GROWTH", "认真创造，也好好生活。", data.benefits.intro)}${featureList(data.benefits.items, "benefits")}`;
const process = `${head("04 / YOUR NEXT STEP", "从一次交流，走向一起创造。", data.process.intro)}
  <div class="join-process" data-join-list="process">${data.process.items.map((step, i) => `<article class="join-step" data-join-item data-join-reveal><span class="join-step-number">${num(i)}</span><div><h3>${esc(step.title)}</h3><p>${esc(step.description)}</p></div></article>`).join("\n")}</div>${pager}
  <footer class="join-process-foot" data-join-reveal><div><h3>${esc(data.cta.title)}</h3><p>${esc(data.cta.description)}</p></div><button type="button" class="join-action" data-join-go-jobs>查看所有职位 <span aria-hidden="true">↗</span></button></footer>`;
const contents = [jobs, culture, benefits, process];
// One visual family: a shared coordinate grid, fine rings and vermilion nodes.
const emblem = `<div class="join-emblem" data-join-emblem data-direction="all" aria-hidden="true">
  <svg viewBox="0 0 260 154" fill="none">
    <path class="join-emblem-axis" d="M0 77H260M130 0V154"/>
    <g class="join-emblem-symbol" data-join-emblem-symbol="all"><circle cx="130" cy="77" r="55"/><circle class="join-emblem-orbit" cx="130" cy="77" r="72"/><path class="join-emblem-route" d="M58 77H110M150 77H202M130 22V58M130 96V132"/><rect class="join-emblem-node" x="126" y="73" width="8" height="8"/><circle class="join-emblem-point" cx="202" cy="77" r="4"/><circle class="join-emblem-point" cx="130" cy="22" r="3"/><circle class="join-emblem-point" cx="58" cy="77" r="3"/></g>
    <g class="join-emblem-symbol" data-join-emblem-symbol="development" hidden><circle cx="130" cy="77" r="55"/><circle class="join-emblem-orbit" cx="130" cy="77" r="72"/><rect x="89" y="46" width="82" height="62" rx="3"/><path class="join-emblem-route" d="M89 62H69M89 92H69M171 62H191M171 92H191M115 46V28M145 108V126"/><path class="join-emblem-stroke" d="M114 65L102 77L114 89M146 65L158 77L146 89M137 59L123 95"/><circle class="join-emblem-point" cx="69" cy="62" r="3"/><circle class="join-emblem-point" cx="191" cy="92" r="3"/><circle class="join-emblem-point" cx="130" cy="22" r="3"/></g>
    <g class="join-emblem-symbol" data-join-emblem-symbol="design" hidden><circle cx="130" cy="77" r="55"/><circle class="join-emblem-orbit" cx="130" cy="77" r="72"/><path d="M130 33L174 77L130 121L86 77Z"/><path d="M76 107L108 43M152 111L184 47"/><path class="join-emblem-curve" d="M76 107C108 43 152 111 184 47"/><path class="join-emblem-route" d="M130 22V43M185 77H164M130 132V111M75 77H96"/><rect class="join-emblem-handle" x="104" y="39" width="8" height="8"/><rect class="join-emblem-handle" x="148" y="107" width="8" height="8"/><circle class="join-emblem-point" cx="76" cy="107" r="4"/><circle class="join-emblem-point" cx="184" cy="47" r="4"/><rect class="join-emblem-node" x="127" y="74" width="6" height="6"/></g>
    <g class="join-emblem-symbol" data-join-emblem-symbol="operation" hidden><circle cx="130" cy="77" r="55"/><circle class="join-emblem-orbit" cx="130" cy="77" r="72"/><path d="M130 37L165 97H95Z"/><path class="join-emblem-route" d="M130 37V77M95 97L130 77L165 97"/><circle cx="130" cy="37" r="11"/><circle cx="95" cy="97" r="11"/><circle cx="165" cy="97" r="11"/><circle class="join-emblem-curve" cx="130" cy="77" r="21"/><circle class="join-emblem-point" cx="130" cy="37" r="4"/><circle class="join-emblem-point" cx="95" cy="97" r="4"/><circle class="join-emblem-point" cx="165" cy="97" r="4"/><rect class="join-emblem-node" x="127" y="74" width="6" height="6"/></g>
    <g class="join-emblem-symbol" data-join-emblem-symbol="marketing" hidden><circle cx="130" cy="77" r="55"/><circle class="join-emblem-orbit" cx="130" cy="77" r="72"/><circle cx="130" cy="77" r="36"/><circle cx="130" cy="77" r="18"/><path class="join-emblem-curve" d="M130 77L168 39M155 39H168V52"/><path class="join-emblem-route" d="M58 77H94M166 77H202M130 22V41M130 113V132"/><circle class="join-emblem-point" cx="202" cy="77" r="4"/><circle class="join-emblem-point" cx="130" cy="132" r="3"/><circle class="join-emblem-point" cx="130" cy="77" r="4"/></g>
  </svg><p data-join-emblem-caption>文化 <i>×</i> 创作 <i>×</i> 技术</p>
</div>`;
const JOIN_SCENE = `<div class="join-scene" data-join-scene>
  <i class="join-frame-corner join-frame-corner--start" aria-hidden="true"></i><i class="join-frame-corner join-frame-corner--end" aria-hidden="true"></i>
  <aside class="join-index">
    <div class="join-index-heading"><p class="join-kicker">CO-CREATE / SYCYW</p><h2>一起<br>创造未来。</h2><p>${esc(data.hero.description)}</p></div>
    <div class="room-tabs join-tabs" role="tablist" aria-label="加入共创章节" aria-orientation="vertical">${chapters.map((chapter, i) => `<button type="button" class="join-chapter" data-room-tab="join-${i}" data-label="${chapter.label}" id="tab-join-${i}" role="tab" aria-controls="panel-join-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span class="join-chapter-number" aria-hidden="true">${num(i)}</span><span class="join-chapter-name">${chapter.label}<small>${chapter.sub}</small></span><i aria-hidden="true">↗</i></button>`).join("\n")}</div>
    ${emblem}
    <a class="join-team-link" href="team.html" data-route>认识我们的团队 <span aria-hidden="true">↗</span></a>
  </aside>
  <div class="room-panels join-panels">${chapters.map((chapter, i) => `<section class="room-panel join-panel join-panel--${["jobs", "culture", "benefits", "process"][i]}" id="panel-join-${i}" role="tabpanel" aria-labelledby="tab-join-${i}" tabindex="0"${i ? " hidden" : ""}>${contents[i]}</section>`).join("\n")}</div>
</div>
<dialog class="join-application" aria-labelledby="joinApplicationTitle">
  <div class="join-application-head"><p class="join-kicker">${data.recruitment.isExample ? "示例岗位 / 申请草稿" : "岗位申请"}</p><button type="button" class="join-close" data-join-close aria-label="关闭岗位申请">×</button></div>
  <h2 id="joinApplicationTitle">岗位申请</h2><p class="join-application-role" data-join-application-role></p>
  <p class="join-application-note">${data.recruitment.isExample ? "当前岗位为示例信息。你可以体验申请流程并复制草稿，内容不会提交。" : "填写后复制申请草稿，再通过官网邮箱联系团队。"}</p>
  <form data-join-application-form><div class="join-form-row"><label>姓名 / 称呼<input name="name" autocomplete="name" maxlength="50" required placeholder="我们该如何称呼你"></label><label>联系方式<input name="contact" autocomplete="email" maxlength="100" required placeholder="邮箱或 QQ"></label></div>
    <label class="join-resume-field">上传简历<span class="join-file-control"><input type="file" name="resume" data-join-resume accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf" required><span class="join-file-button" aria-hidden="true">选择文件 <b>↗</b></span><span class="join-file-name" data-join-resume-name>支持 DOC / DOCX / PDF，最大 10 MB</span></span></label>
    <label>作品与自我介绍<textarea name="introduction" rows="4" maxlength="3000" required placeholder="介绍你的经历、擅长的方向，附上作品或项目链接。"></textarea></label>
    <div class="join-draft-output" hidden><label>申请草稿<textarea rows="5" readonly data-join-draft aria-label="申请草稿内容"></textarea></label></div>
    <div class="join-form-foot"><p>仅生成草稿；请将选中的简历文件与草稿一并发送。</p><button type="submit" class="join-action">复制申请草稿 <span aria-hidden="true">↗</span></button></div><p class="join-form-status" data-join-form-status role="status" aria-live="polite"></p>
  </form>
</dialog><script type="application/json" id="joinData">${JSON.stringify({jobs:recruitmentJobs,categories:jobFilters,email:data.email,isExample:data.recruitment.isExample}).replace(/</g, "\\u003c")}</script>`;
module.exports = { JOIN_SCENE };
