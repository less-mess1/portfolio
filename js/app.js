// app.js — VS Code Portfolio Logic

// ===== FILE DATA =====
const fileData = {
  about:    { label: "about.md",    lang: "Markdown" },
  projects: { label: "projects.json", lang: "JSON" },
  skills:   { label: "skills.js",   lang: "JavaScript" },
  cv:       { label: "cv.md",       lang: "Markdown" },
  contact:  { label: "contact.html",lang: "HTML" },
};

// ===== LINE NUMBERS =====
function generateLineNumbers(panelId, containerId) {
  const panel = document.getElementById(panelId);
  const container = document.getElementById(containerId);
  if (!panel || !container) return;
  const pre = panel.querySelector("pre");
  if (!pre) return;
  const lines = pre.innerText.split("\n").length;
  container.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join("<br/>");
}

// ===== TABS =====
const tabsBar = document.querySelector(".tabs-bar");
const openTabs = new Map(); // fileKey -> tab element

function showWelcome() {
  document.getElementById("welcome-screen")?.classList.remove("hidden");
  document.querySelectorAll(".file-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tree-file").forEach(f => f.classList.remove("active"));
  document.getElementById("status-file").textContent = "";
  document.querySelector(".status-right").textContent = "Bas Portfolio v1.0";
}

function openTab(fileKey) {
  const info = fileData[fileKey];
  if (!info) return;

  // Hide welcome screen
  document.getElementById("welcome-screen")?.classList.add("hidden");

  // Deactivate all tabs and panels
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".file-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tree-file").forEach(f => f.classList.remove("active"));

  // Add tab if not open
  if (!openTabs.has(fileKey)) {
    const tab = document.createElement("div");
    tab.className = "tab";
    tab.dataset.file = fileKey;
    tab.innerHTML = `&#128196; ${info.label} <span class="tab-close" data-file="${fileKey}">&#10005;</span>`;
    tab.addEventListener("click", (e) => {
      if (e.target.classList.contains("tab-close")) return;
      openTab(fileKey);
    });
    tab.querySelector(".tab-close").addEventListener("click", () => closeTab(fileKey));
    tabsBar.appendChild(tab);
    openTabs.set(fileKey, tab);
  }

  // Activate tab and panel
  openTabs.get(fileKey).classList.add("active");
  document.getElementById(`panel-${fileKey}`)?.classList.add("active");

  // Activate sidebar file
  document.querySelector(`.tree-file[data-file="${fileKey}"]`)?.classList.add("active");

  // Update status bar
  document.getElementById("status-file").textContent = info.label;
  document.querySelector(".status-right").textContent = `${info.lang}   UTF-8   Bas Portfolio v1.0`;

  // Generate line numbers
  generateLineNumbers(`panel-${fileKey}`, `ln-${fileKey}`);

  // Clear find highlights when switching tabs
  closeFind();

  // Trigger skill bars if skills tab
  if (fileKey === "skills") renderSkillBars();
}

function closeTab(fileKey) {
  const tab = openTabs.get(fileKey);
  if (tab) { tab.remove(); openTabs.delete(fileKey); }

  // Activate last remaining tab or show welcome
  const remaining = [...openTabs.keys()];
  if (remaining.length > 0) {
    openTab(remaining[remaining.length - 1]);
  } else {
    showWelcome();
  }
}

// ===== SIDEBAR FILE CLICK =====
document.querySelectorAll(".tree-file").forEach(el => {
  el.addEventListener("click", () => openTab(el.dataset.file));
});

// ===== ACTIVITY BAR =====
document.querySelectorAll(".activity-icon").forEach(icon => {
  icon.addEventListener("click", () => {
    const panel = icon.dataset.panel;
    document.querySelectorAll(".activity-icon").forEach(i => i.classList.remove("active"));
    icon.classList.add("active");
    if (panel === "explorer") {
      document.querySelector(".sidebar").classList.toggle("hidden-sidebar");
      return;
    }
    // Map activity icons to files
    const map = { git: "skills", contact: "contact", search: "projects" };
    if (map[panel]) openTab(map[panel]);
  });
});

// ===== SKILL BARS =====
const skillsData = {
  "⚡ Frontend": [
    { name: "HTML / CSS",   level: 75 },
    { name: "JavaScript",   level: 70 },
    { name: "React",        level: 85 },
  ],
  "🛠 Backend": [
    { name: "PHP",          level: 90 },
    { name: "Node.js",      level: 70 },
    { name: "MySQL",        level: 75 },
    { name: "Symfony",      level: 65 },
    { name: "XPath",        level: 95 },
    { name: "API's",        level: 65 },
    { name: "Dataverwerking", level: 60 },
  ],
  "🔧 Tools & Omgeving": [
    { name: "Git",          level: 50 },
    { name: "VS Code",      level: 80 },
    { name: "Linux / Ubuntu", level: 60 },
  ],
  "🤖 AI & Automatisering": [
    { name: "AI-development tools", level: 80 },
  ],
};

let skillsRendered = false;
function renderSkillBars() {
  if (skillsRendered) return;
  skillsRendered = true;
  const container = document.getElementById("skill-bars");
  container.innerHTML = "";

  for (const [group, skills] of Object.entries(skillsData)) {
    const title = document.createElement("div");
    title.className = "skill-group-title";
    title.textContent = group;
    container.appendChild(title);

    skills.forEach(skill => {
      const item = document.createElement("div");
      item.className = "skill-item";
      item.innerHTML = `
        <div class="skill-label">
          <span>${skill.name}</span>
          <span>${skill.level}%</span>
        </div>
        <div class="skill-bar-bg">
          <div class="skill-bar-fill" data-level="${skill.level}"></div>
        </div>`;
      container.appendChild(item);
    });
  }

  // Animate bars with slight delay
  setTimeout(() => {
    document.querySelectorAll(".skill-bar-fill").forEach(bar => {
      bar.style.width = bar.dataset.level + "%";
    });
  }, 100);
}

// ===== CONTACT FORM =====
document.getElementById("contactForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const feedback = document.getElementById("form-feedback");
  const btn = document.querySelector(".btn-send");
  btn.textContent = "⏳ Versturen...";
  btn.disabled = true;

  const formData = new FormData(e.target);

  try {
    const res = await fetch("php/contact.php", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      feedback.className = "success";
      feedback.textContent = "✓ Bericht verstuurd! Ik neem zo snel mogelijk contact op.";
      e.target.reset();
    } else {
      feedback.className = "error";
      feedback.textContent = "✗ Er ging iets mis: " + (data.message || "Probeer het opnieuw.");
    }
  } catch {
    feedback.className = "error";
    feedback.textContent = "✗ Kon de server niet bereiken. Probeer later opnieuw.";
  }

  btn.textContent = "▶ Verstuur bericht";
  btn.disabled = false;
});

// ===== WELCOME SHORTCUTS =====
document.querySelectorAll(".shortcut-item").forEach(el => {
  el.addEventListener("click", () => openTab(el.dataset.file));
});

// ===== DROPDOWN MENUS =====
const menuItems = document.querySelectorAll(".menu-item");
const dropdowns = document.querySelectorAll(".dropdown");

function closeAllMenus() {
  dropdowns.forEach(d => d.classList.remove("visible"));
  menuItems.forEach(m => m.classList.remove("open"));
}

menuItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.stopPropagation();
    const menuId = item.dataset.menu;
    const dropdown = document.getElementById(`dropdown-${menuId}`);
    const isOpen = dropdown.classList.contains("visible");
    closeAllMenus();
    if (!isOpen) {
      const rect = item.getBoundingClientRect();
      dropdown.style.left = rect.left + "px";
      dropdown.classList.add("visible");
      item.classList.add("open");
    }
  });
});

document.addEventListener("click", closeAllMenus);

// Dropdown actions
document.querySelectorAll(".dropdown-item[data-action]").forEach(el => {
  el.addEventListener("click", () => {
    const action = el.dataset.action;
    closeAllMenus();
    if (action === "open-about")    openTab("about");
    if (action === "open-cv")       openTab("cv");
    if (action === "open-skills")   openTab("skills");
    if (action === "open-projects") openTab("projects");
    if (action === "open-contact")  openTab("contact");
    if (action === "toggle-terminal") toggleTerminal();
    if (action === "toggle-sidebar") {
      document.querySelector(".sidebar").classList.toggle("hidden-sidebar");
    }
    if (action === "toggle-theme") {
      document.body.classList.toggle("light-mode");
      el.textContent = document.body.classList.contains("light-mode")
        ? "🌑 Toggle Dark Mode" : "🌗 Toggle Light Mode";
    }
    if (action === "about-modal") {
      document.getElementById("about-modal").classList.remove("hidden");
    }
    if (action === "download-cv") {
      alert("📄 Tip: voeg cv-bas.pdf toe in de assets/ map om dit te laten werken!");
    }
  });
});

// ===== FIND / SEARCH =====
let findMatches = [];
let findIndex = 0;

function openFind() {
  const bar = document.getElementById("find-bar");
  bar.classList.remove("hidden");
  const input = document.getElementById("find-input");
  input.focus();
  input.select();
}

function closeFind() {
  document.getElementById("find-bar").classList.add("hidden");
  clearHighlights();
  findMatches = [];
  findIndex = 0;
  document.getElementById("find-count").textContent = "";
}

function clearHighlights() {
  document.querySelectorAll("mark.find-highlight").forEach(mark => {
    const parent = mark.parentNode;
    parent.replaceChild(document.createTextNode(mark.textContent), mark);
    parent.normalize();
  });
}

function doFind(query) {
  clearHighlights();
  findMatches = [];
  findIndex = 0;

  if (!query) {
    document.getElementById("find-count").textContent = "";
    return;
  }

  // Get active panel
  const activePanel = document.querySelector(".file-panel.active");
  if (!activePanel) return;

  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");

  // Walk text nodes and wrap matches
  function walkAndHighlight(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!regex.test(text)) return;
      regex.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0, m;
      while ((m = regex.exec(text)) !== null) {
        frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const mark = document.createElement("mark");
        mark.className = "find-highlight";
        mark.textContent = m[0];
        frag.appendChild(mark);
        findMatches.push(mark);
        last = m.index + m[0].length;
      }
      frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      node.tagName !== "SCRIPT" &&
      node.tagName !== "STYLE" &&
      node.tagName !== "INPUT" &&
      node.tagName !== "TEXTAREA"
    ) {
      Array.from(node.childNodes).forEach(walkAndHighlight);
    }
  }

  walkAndHighlight(activePanel);
  updateFindCurrent();
}

function updateFindCurrent() {
  findMatches.forEach((m, i) => m.classList.toggle("current", i === findIndex));
  const count = findMatches.length;
  document.getElementById("find-count").textContent =
    count > 0 ? `${findIndex + 1}/${count}` : "Geen resultaten";
  if (findMatches[findIndex]) {
    findMatches[findIndex].scrollIntoView({ block: "center", behavior: "smooth" });
  }
}

document.getElementById("find-input")?.addEventListener("input", (e) => {
  doFind(e.target.value);
});
document.getElementById("find-input")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (e.shiftKey) {
      findIndex = (findIndex - 1 + findMatches.length) % findMatches.length || 0;
    } else {
      findIndex = (findIndex + 1) % findMatches.length || 0;
    }
    updateFindCurrent();
  }
  if (e.key === "Escape") closeFind();
});
document.getElementById("find-next")?.addEventListener("click", () => {
  if (!findMatches.length) return;
  findIndex = (findIndex + 1) % findMatches.length;
  updateFindCurrent();
});
document.getElementById("find-prev")?.addEventListener("click", () => {
  if (!findMatches.length) return;
  findIndex = (findIndex - 1 + findMatches.length) % findMatches.length;
  updateFindCurrent();
});
document.getElementById("find-close")?.addEventListener("click", closeFind);

// Ctrl+F shortcut
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "f") {
    e.preventDefault();
    openFind();
  }
});

// Find actie in dropdown
document.querySelectorAll(".dropdown-item[data-action]").forEach(el => {
  if (el.dataset.action === "find") {
    el.addEventListener("click", () => { closeAllMenus(); openFind(); });
  }
});

document.querySelector(".modal-close")?.addEventListener("click", () => {
  document.getElementById("about-modal").classList.add("hidden");
});
document.getElementById("about-modal")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) e.currentTarget.classList.add("hidden");
});

// ===== TERMINAL =====
function toggleTerminal() {
  document.getElementById("terminal-panel").classList.toggle("hidden");
  const input = document.getElementById("terminal-input");
  if (input) setTimeout(() => input.focus(), 50);
}

document.getElementById("terminal-close")?.addEventListener("click", () => {
  document.getElementById("terminal-panel").classList.add("hidden");
});

const terminalCommands = {
  help: () => `<span class="t-accent">Beschikbare commands:</span>
  <span class="t-cmd">whoami</span>        — wie ben ik?
  <span class="t-cmd">skills</span>        — toon mijn skills
  <span class="t-cmd">projects</span>      — toon mijn projecten
  <span class="t-cmd">contact</span>       — contactinfo
  <span class="t-cmd">joke</span>          — een programmeer grapje
  <span class="t-cmd">sudo hire-bas</span> — belangrijkste command
  <span class="t-cmd">coffee</span>        — essentieel
  <span class="t-cmd">git log</span>       — mijn leven in commits
  <span class="t-cmd">ls</span>            — bestanden bekijken
  <span class="t-cmd">clear</span>         — terminal leegmaken`,

  whoami: () => `<span class="t-success">Bas Waaijer</span> — Software Developer uit 's-Gravenzande 🇳🇱
19 jaar oud, bouwt scrapers bij TreeHouse Rotterdam.
Gepassioneerd over code, hardstyle en octopus eten in Portugal.`,

  skills: () => { openTab("skills"); return `<span class="t-success">Opening skills.js...</span>`; },
  projects: () => { openTab("projects"); return `<span class="t-success">Opening projects.json...</span>`; },
  contact: () => { openTab("contact"); return `<span class="t-success">Opening contact.html...</span>

<span class="t-accent">📧  Email</span>     baswaaijer7@gmail.com
<span class="t-accent">📱  Telefoon</span>  +06 38481925
<span class="t-accent">🐙  GitHub</span>    https://github.com/less-mess1
<span class="t-accent">💼  LinkedIn</span>  https://www.linkedin.com/in/bas-waaijer-118045351/`; },

  ls: () => `<span class="t-accent">drwxr-xr-x</span>  about.md
<span class="t-accent">drwxr-xr-x</span>  projects.json
<span class="t-accent">drwxr-xr-x</span>  skills.js
<span class="t-accent">drwxr-xr-x</span>  cv.md
<span class="t-accent">drwxr-xr-x</span>  contact.html`,

  joke: () => {
    const jokes = [
      `Waarom werken programmeurs 's nachts?\n  <span class="t-warn">Omdat ze bugs niet in het donker kunnen zien... oh wacht.</span>`,
      `Een SQL-query loopt een bar in.\n  <span class="t-warn">Loopt naar twee tafels en vraagt: "Mag ik joinen?"</span>`,
      `Hoe noem je een programmeur die niet luistert?\n  <span class="t-warn">Een developer die "null" teruggeeft op feedback.</span>`,
      `99 bugs in de code, 99 bugs...\n  <span class="t-warn">Fix er één, compile opnieuw — 127 bugs in de code.</span>`,
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  },

  coffee: () => `<span class="t-warn">☕ Brewing coffee...</span>
<span class="t-success">████████████████ 100%</span>
Koffie gezet. Klaar om te coden.`,

  "sudo hire-bas": () => `<span class="t-warn">[sudo] wachtwoord voor recruiter:</span> ••••••••
<span class="t-success">✓ Authenticatie geslaagd.</span>
<span class="t-success">✓ Bas Waaijer ingehuurd.</span>
<span class="t-accent">Gefeliciteerd! Stuur een mail naar baswaaijer7@gmail.com</span>`,

  "git log": () => `<span class="t-accent">commit a1b2c3d</span> — fix: octopus gegeten in Portugal, zou het opnieuw doen
<span class="t-accent">commit b2c3d4e</span> — feat: geslaagd voor Grafisch Lyceum Rotterdam 🎓
<span class="t-accent">commit c3d4e5f</span> — chore: gestart bij TreeHouse Rotterdam
<span class="t-accent">commit d4e5f6g</span> — init: geboren in het Westland 🇳🇱`,

  clear: () => "__clear__",
};

function runCommand(cmd) {
  const body = document.getElementById("terminal-body");
  const trimmed = cmd.trim().toLowerCase();

  // Show the command the user typed
  const cmdLine = document.createElement("div");
  cmdLine.className = "terminal-line";
  cmdLine.innerHTML = `<span class="t-prompt">bas@portfolio:~$</span> <span class="t-cmd">${cmd}</span>`;
  body.appendChild(cmdLine);

  if (!trimmed) { body.scrollTop = body.scrollHeight; return; }

  const handler = terminalCommands[trimmed];
  if (handler) {
    const output = handler();
    if (output === "__clear__") {
      body.innerHTML = "";
    } else {
      const outLine = document.createElement("div");
      outLine.className = "terminal-line";
      outLine.innerHTML = output;
      body.appendChild(outLine);
    }
  } else {
    const errLine = document.createElement("div");
    errLine.className = "terminal-line";
    errLine.innerHTML = `<span class="t-error">bash: ${cmd}: command not found</span> — typ <span class="t-cmd">help</span> voor een lijst`;
    body.appendChild(errLine);
  }

  body.scrollTop = body.scrollHeight;
}

document.getElementById("terminal-input")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const input = e.target;
    runCommand(input.value);
    input.value = "";
  }
});

// ===== INIT — toon welkomstscherm =====
showWelcome();
