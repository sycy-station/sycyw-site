(() => {
  "use strict";
  window.__cesInitJoinRoom = (content) => {
    const scene = content.querySelector("[data-join-scene]");
    if (!scene) return null;
    const data = JSON.parse(content.querySelector("#joinData").textContent);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const compact = matchMedia("(max-width: 900px)");
    const dialog = content.querySelector(".join-application");
    const form = dialog.querySelector("form");
    const status = dialog.querySelector("[data-join-form-status]");
    const resumeInput = dialog.querySelector("[data-join-resume]");
    const resumeName = dialog.querySelector("[data-join-resume-name]");
    const maxResumeBytes = 10 * 1024 * 1024;
    const resumeExtensions = new Set(["doc", "docx", "pdf"]);
    const jobButtons = [...scene.querySelectorAll("[data-join-job]")];
    const jobPanels = [...scene.querySelectorAll(".join-job-detail")];
    const jobIndex = scene.querySelector(".join-job-index");
    const jobsArea = scene.querySelector(".join-jobs");
    const filterButtons = [...scene.querySelectorAll(".join-job-filter")];
    const jobPager = scene.querySelector(".join-job-pagination");
    const emblem = scene.querySelector("[data-join-emblem]");
    const emblemSymbols = [...emblem.querySelectorAll("[data-join-emblem-symbol]")];
    const emblemCaption = emblem.querySelector("[data-join-emblem-caption]");
    const emblemWords = {
      all: ["文化", "创作", "技术"],
      development: ["代码", "架构", "测试"],
      design: ["视觉", "交互", "创意"],
      operation: ["内容", "社群", "连接"],
      marketing: ["洞察", "传播", "增长"]
    };
    const emblemAnimations = [];
    const pages = new Map();
    const animations = [];
    let activePanel;
    let selectedJob = data.jobs[0];
    let category = "all";
    let filteredJobs = data.jobs;
    let jobCapacity = 1;
    let jobPage = 0;
    let opener;
    let destroyed = false;
    const clear = () => animations.splice(0).forEach((animation) => animation.cancel());
    const clearEmblem = () => emblemAnimations.splice(0).forEach((animation) => animation.cancel());
    const updateEmblem = (direction) => {
      const next = emblemWords[direction] ? direction : "all";
      if (emblem.dataset.direction === next) return;
      clearEmblem();
      emblem.dataset.direction = next;
      emblemSymbols.forEach((symbol) => { symbol.toggleAttribute("hidden", symbol.dataset.joinEmblemSymbol !== next); });
      emblemCaption.replaceChildren(...emblemWords[next].flatMap((word, i) => {
        if (!i) return [document.createTextNode(word)];
        const separator = document.createElement("i");
        separator.textContent = "×";
        return [separator, document.createTextNode(word)];
      }));
      if (reduced.matches) return;
      const symbol = emblemSymbols.find((item) => item.dataset.joinEmblemSymbol === next);
      emblemAnimations.push(symbol.animate([
        { opacity: 0, transform: "scale(.86) rotate(-8deg)" },
        { opacity: 1, transform: "scale(1) rotate(0deg)" }
      ], { duration: 620, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" }));
      emblemAnimations.push(emblemCaption.animate([
        { opacity: 0, transform: "translateY(5px)" }, { opacity: 1, transform: "none" }
      ], { duration: 420, delay: 100, easing: "ease-out", fill: "backwards" }));
    };
    const reveal = (container) => {
      clear();
      if (reduced.matches) return;
      [...container.querySelectorAll("[data-join-reveal]")].filter((el) => !el.closest("[hidden]")).forEach((el, i) => {
        animations.push(el.animate([{ opacity: 0, clipPath: "inset(0 0 24% 0)" }, { opacity: 1, clipPath: "inset(0 0 0% 0)" }],
          { duration: 780, delay: Math.min(i * 70, 360), easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" }));
      });
    };
    const syncOrientation = () => {
      scene.querySelector(".join-tabs").setAttribute("aria-orientation", compact.matches ? "horizontal" : "vertical");
      scene.querySelector(".join-job-index").setAttribute("aria-orientation", compact.matches ? "horizontal" : "vertical");
    };
    const layoutList = (panel) => {
      const list = panel?.querySelector("[data-join-list]");
      if (!list || panel.hidden) return;
      const items = [...list.querySelectorAll("[data-join-item]")];
      const process = list.dataset.joinList === "process";
      const width = list.clientWidth;
      const columns = process ? 1 : width >= 1100 ? 3 : width >= 510 ? 2 : 1;
      const rowHeight = process ? (width < 510 ? 108 : width >= 1100 ? 74 : 82) : (width < 510 ? 116 : 140);
      const rows = Math.max(1, Math.floor(list.clientHeight / rowHeight));
      const capacity = Math.min(items.length, columns * rows);
      const previous = pages.get(list) || { start: 0 };
      const page = Math.min(Math.floor(previous.start / capacity), Math.ceil(items.length / capacity) - 1);
      const start = page * capacity;
      pages.set(list, { start, capacity });
      list.style.setProperty("--join-columns", columns);
      items.forEach((item, i) => { item.hidden = i < start || i >= start + capacity; });
      const pager = panel.querySelector(".join-pager");
      pager.hidden = items.length <= capacity;
      pager.querySelector("[data-join-page-status]").textContent = `${String(start + 1).padStart(2,"0")}–${String(Math.min(start + capacity, items.length)).padStart(2,"0")} / ${String(items.length).padStart(2,"0")}`;
      pager.querySelector("[data-join-prev]").disabled = start === 0;
      pager.querySelector("[data-join-next]").disabled = start + capacity >= items.length;
    };
    const layoutJobs = () => {
      if (scene.querySelector(".join-panel--jobs").hidden) return;
      const empty = filteredJobs.length === 0;
      const label = data.categories.find((item) => item.id === category).label;
      jobsArea.dataset.empty = String(empty);
      scene.querySelector(".join-job-sidebar").hidden = empty;
      scene.querySelector(".join-job-details").hidden = empty;
      scene.querySelector(".join-job-empty").hidden = !empty;
      scene.querySelector("[data-join-empty-title]").textContent = `${label}暂无岗位`;
      scene.querySelector("[data-join-job-count]").textContent = `${label} · ${filteredJobs.length}`;
      if (!empty) {
        const minRow = parseFloat(getComputedStyle(jobButtons[0]).minHeight) || 84;
        jobCapacity = compact.matches ? Math.max(1, Math.floor(jobIndex.clientWidth / 136)) : Math.max(1, Math.floor(jobIndex.clientHeight / minRow));
        const selected = Math.max(0, filteredJobs.findIndex((job) => job.id === selectedJob?.id));
        jobPage = Math.floor(selected / jobCapacity);
      }
      const visibleJobs = filteredJobs.slice(jobPage * jobCapacity, (jobPage + 1) * jobCapacity);
      jobIndex.style.setProperty("--join-job-visible", Math.max(1, visibleJobs.length));
      jobButtons.forEach((button, i) => {
        const active = !empty && data.jobs[i].id === selectedJob?.id;
        button.hidden = empty || !visibleJobs.some((job) => job.id === data.jobs[i].id);
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
        jobPanels[i].hidden = !active;
        jobPanels[i].inert = !active;
      });
      const pageCount = Math.ceil(filteredJobs.length / jobCapacity);
      jobPager.hidden = pageCount <= 1;
      jobPager.querySelector("[data-join-job-page]").textContent = `${jobPage + 1} / ${pageCount}`;
      jobPager.querySelector("[data-join-job-prev]").disabled = jobPage === 0;
      jobPager.querySelector("[data-join-job-next]").disabled = jobPage + 1 >= pageCount;
    };
    const selectJob = (index, focus = false) => {
      if (!filteredJobs.length) return;
      selectedJob = filteredJobs[(index + filteredJobs.length) % filteredJobs.length];
      layoutJobs();
      const active = data.jobs.findIndex((job) => job.id === selectedJob.id);
      jobIndex.scrollTop = 0;
      jobPanels[active].querySelector(".join-job-body").scrollTop = 0;
      reveal(jobPanels[active]);
      if (focus) jobButtons[active].focus({preventScroll:true});
    };
    const filterJobs = (direction) => {
      if (!data.categories.some((item) => item.id === direction)) return;
      category = direction;
      updateEmblem(direction);
      filteredJobs = data.jobs.filter((job) => direction === "all" || job.direction === direction);
      if (!filteredJobs.some((job) => job.id === selectedJob?.id)) selectedJob = filteredJobs[0];
      jobPage = 0;
      filterButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.joinFilter === direction)));
      layoutJobs();
      const label = data.categories.find((item) => item.id === direction).label;
      scene.querySelector("[data-join-filter-status]").textContent = `${label}，共 ${filteredJobs.length} 个岗位。`;
      if (selectedJob) jobPanels[data.jobs.indexOf(selectedJob)].querySelector(".join-job-body").scrollTop = 0;
      reveal(jobsArea);
    };
    const activate = (panel) => {
      if (!scene.contains(panel)) return;
      activePanel = panel;
      scene.dataset.active = panel.id.split("-").pop();
      if (panel.classList.contains("join-panel--jobs")) layoutJobs();
      layoutList(panel);
      reveal(panel);
    };
    const click = (event) => {
      const jobButton = event.target.closest("[data-join-job]");
      if (jobButton) selectJob(filteredJobs.findIndex((job) => job.id === jobButton.dataset.joinJob));
      const filter = event.target.closest("[data-join-filter]");
      if (filter) {
        filterJobs(filter.dataset.joinFilter);
        if (filter.classList.contains("join-empty-reset")) filterButtons[0].focus({preventScroll:true});
      }
      const jobsPageButton = event.target.closest("[data-join-job-prev], [data-join-job-next]");
      if (jobsPageButton && !jobsPageButton.disabled) {
        const nextPage = jobPage + (jobsPageButton.hasAttribute("data-join-job-next") ? 1 : -1);
        selectJob(nextPage * jobCapacity);
        scene.querySelector("[data-join-filter-status]").textContent = `岗位列表第 ${jobPage + 1} 页，共 ${Math.ceil(filteredJobs.length / jobCapacity)} 页。`;
      }
      const pageButton = event.target.closest("[data-join-prev], [data-join-next]");
      if (pageButton && !pageButton.disabled) {
        const panel = pageButton.closest(".join-panel");
        const list = panel.querySelector("[data-join-list]");
        const state = pages.get(list);
        state.start += pageButton.hasAttribute("data-join-next") ? state.capacity : -state.capacity;
        layoutList(panel); reveal(list);
      }
      if (event.target.closest("[data-join-go-jobs]")) scene.querySelector("#tab-join-0").click();
      const apply = event.target.closest("[data-join-apply]");
      if (apply) {
        selectedJob = data.jobs.find((job) => job.id === apply.dataset.joinApply);
        opener = apply;
        dialog.querySelector("[data-join-application-role]").textContent = [selectedJob.title, selectedJob.category, selectedJob.location].filter(Boolean).join(" · ");
        dialog.showModal();
      }
      if (event.target.closest("[data-join-close]")) dialog.close();
      if (event.target === dialog) {
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
      }
    };
    const keyboard = (event) => {
      const button = event.target.closest("[data-join-job]");
      if (!button) return;
      const i = filteredJobs.findIndex((job) => job.id === button.dataset.joinJob);
      const arrows = compact.matches ? {ArrowLeft:i-1,ArrowRight:i+1} : {ArrowUp:i-1,ArrowDown:i+1};
      const index = {...arrows,Home:0,End:filteredJobs.length-1}[event.key];
      if (index === undefined) return;
      event.preventDefault(); selectJob(index,true);
    };
    const close = () => {
      form.reset(); status.textContent = "";
      resumeName.textContent = "支持 DOC / DOCX / PDF，最大 10 MB";
      resumeInput.removeAttribute("aria-invalid");
      dialog.querySelector(".join-draft-output").hidden = true;
      dialog.querySelector("[data-join-draft]").value = "";
      if (opener?.isConnected) opener.focus({preventScroll:true});
    };
    const readResume = () => {
      const file = resumeInput.files?.[0];
      if (!file) return { file: null, error: "请先选择一份简历文件。" };
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      if (!resumeExtensions.has(extension)) return { file: null, error: "简历仅支持 DOC、DOCX 或 PDF 文件。" };
      if (file.size > maxResumeBytes) return { file: null, error: "简历文件不能超过 10 MB。" };
      return { file, error: "" };
    };
    const updateResume = () => {
      const result = readResume();
      if (!resumeInput.files?.length) {
        resumeName.textContent = "支持 DOC / DOCX / PDF，最大 10 MB";
      } else if (result.error) {
        resumeName.textContent = result.error;
      } else {
        const size = result.file.size < 1024 * 1024
          ? `${Math.max(1, Math.round(result.file.size / 1024))} KB`
          : `${(result.file.size / 1024 / 1024).toFixed(1)} MB`;
        resumeName.textContent = `${result.file.name} · ${size}`;
      }
      if (result.error) resumeInput.setAttribute("aria-invalid", "true");
      else resumeInput.removeAttribute("aria-invalid");
      if (result.error) status.textContent = result.error;
      else if (resumeInput.files?.length) status.textContent = "简历已选择，请继续填写申请信息。";
    };
    const submit = async (event) => {
      event.preventDefault();
      const values = new FormData(form);
      const resume = readResume();
      if (resume.error) {
        status.textContent = resume.error;
        resumeInput.focus();
        return;
      }
      const draft = `${data.isExample ? "【示例岗位申请草稿，请先确认招聘信息】\n" : ""}申请岗位：${selectedJob.title}\n姓名 / 称呼：${values.get("name").trim()}\n联系方式：${values.get("contact").trim()}\n简历附件：${resume.file.name}\n\n作品与自我介绍：\n${values.get("introduction").trim()}\n\n官网联系邮箱：${data.email}`;
      const output = dialog.querySelector("[data-join-draft]");
      output.value = draft;
      try {
        await navigator.clipboard.writeText(draft);
        if (!destroyed && dialog.open) status.textContent = "申请草稿已复制；请将简历文件一并发送，尚未提交或发送。";
      } catch (_) {
        if (destroyed || !dialog.open) return;
        dialog.querySelector(".join-draft-output").hidden = false;
        output.focus(); output.select();
        status.textContent = "请手动复制上方草稿，并将简历文件一并发送；尚未提交或发送。";
      }
    };
    const motionChange = () => { clearEmblem(); if (activePanel) reveal(activePanel); };
    const observer = new ResizeObserver(() => {
      syncOrientation(); layoutJobs(); if (activePanel) layoutList(activePanel);
    });
    observer.observe(scene);
    observer.observe(jobIndex);
    scene.querySelectorAll("[data-join-list]").forEach((list) => observer.observe(list));
    syncOrientation();
    content.addEventListener("click",click);
    resumeInput.addEventListener("change", updateResume);
    scene.addEventListener("keydown",keyboard);
    dialog.addEventListener("close",close);
    form.addEventListener("submit",submit);
    reduced.addEventListener("change",motionChange);
    return {activate, destroy() {
      destroyed = true; clear(); clearEmblem(); observer.disconnect();
      if (dialog.open) dialog.close();
      content.removeEventListener("click",click); scene.removeEventListener("keydown",keyboard);
      resumeInput.removeEventListener("change", updateResume);
      dialog.removeEventListener("close",close); form.removeEventListener("submit",submit);
      reduced.removeEventListener("change",motionChange);
    }};
  };
})();
