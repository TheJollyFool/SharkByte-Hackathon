const host = document.createElement("div");
host.id = "shark-advisor";
const shadow = host.attachShadow({ mode: "closed" });

const style = document.createElement("style");
style.textContent = `
  .shark-button {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 2147483647;
    width: 56px;
    height: 56px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: #004b87;
    font-size: 28px;
    cursor: pointer;
  }

  .shark-button #shark-head,
  .shark-button #shark-lower-jaw {
    transition: transform 220ms ease;
  }

  .shark-button[aria-expanded="true"] #shark-head {
    transform: translateY(-5px);
  }

  .shark-button[aria-expanded="true"] #shark-lower-jaw {
    transform: translateY(20px);
  }
`;

const button = document.createElement("button");
button.type = "button";
button.className = "shark-button";
button.setAttribute("aria-label", "Open Shark Advisor");
button.textContent = "🦈";

fetch(chrome.runtime.getURL("shark.svg"))
  .then((response) => response.text())
  .then((markup) => {
    const svg = new DOMParser()
      .parseFromString(markup, "image/svg+xml")
      .documentElement;

    if (svg.localName !== "svg") return;

    svg.setAttribute("width", "44");
    svg.setAttribute("height", "44");
    svg.setAttribute("aria-hidden", "true");
    button.replaceChildren(svg);
  })
  .catch((error) => {
    console.warn("[Shark Advisor] Could not load the shark illustration", error);
  });

shadow.append(style, button);
document.body.append(host);

const panel = document.createElement("iframe");
panel.id = "shark-panel";
panel.title = "Shark Advisor";
panel.src = PANEL_ORIGIN;

style.textContent += `
  .shark-mouth {
    position: fixed;
    top: 16px;
    right: 16px;
    bottom: 16px;
    z-index: 2147483646;
    width: min(400px, calc(100vw - 32px));
    box-sizing: border-box;
    padding: 26px 12px;
    border: 4px solid #354f65;
    border-radius: 44px;
    background: #541e2f;
    overflow: hidden;
  }

.shark-mouth {
  clip-path: inset(0 round 44px);
  visibility: visible;
  transition: clip-path 350ms ease 100ms, visibility 0s 100ms;
}

.shark-mouth:has(#shark-panel[hidden]) {
  clip-path: inset(50% 0 round 44px);
  visibility: hidden;
  transition: clip-path 350ms ease, visibility 0s 350ms;
}

#shark-panel[hidden] {
  display: block;
}

@media (prefers-reduced-motion: reduce) {
  .shark-button #shark-head,
  .shark-button #shark-lower-jaw,
  .shark-mouth,
  .shark-mouth:has(#shark-panel[hidden]) {
    transition: none;
  }
}

  #shark-panel {
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: 16px;
    background: white;
  }
`;

const mouth = document.createElement("div");
mouth.className = "shark-mouth";

panel.hidden = true;
mouth.append(panel);
shadow.append(mouth);

button.setAttribute("aria-controls", panel.id);
button.setAttribute("aria-expanded", "false");

button.addEventListener("click", () => {
  panel.hidden = !panel.hidden;
  button.setAttribute("aria-expanded", String(!panel.hidden));
  button.setAttribute(
    "aria-label",
    panel.hidden ? "Open Shark Advisor" : "Close Shark Advisor",
  );
});

style.textContent += `
  .shark-mouth::before,
  .shark-mouth::after {
    content: "";
    position: absolute;
    left: 26px;
    right: 26px;
    height: 20px;
    background: conic-gradient(
      from -35deg at 50% 100%,
      #fff 0deg 70deg,
      transparent 70deg
    ) repeat-x left top / 28px 20px;
    pointer-events: none;
  }

  .shark-mouth::before {
    top: 0;
    transform: rotate(180deg);
  }

  .shark-mouth::after {
    bottom: 0;
  }
`;

window.addEventListener("message", (event) => {
  if (event.origin !== PANEL_ORIGIN || event.source !== panel.contentWindow) {
    return;
  }

  const message = event.data;

  if (message?.type === "shark:close" || message?.type === "shark:start_guide") {
    if (!panel.hidden) {
      button.click();
    }

    if (message.type === "shark:start_guide") {
      const language = message.language === "es" ? "es" : "en";

      const guide = MOCK_NAVIGATE
        ? startRecordedGuide(message.goal)
        : startLiveNavigator(message.goal, language).catch((error) => {
            console.warn("[Shark Advisor] Live Navigator unavailable", error);
            return startRecordedGuide(message.goal);
          });

      guide.catch((error) => {
        console.error("[Shark Advisor] Could not start the guide", error);
      });
    }
    return;
  }

  if (message?.type === "shark:open_url") {
    const url = message.url;
    if (typeof url !== "string" || !URL.canParse(url)) return;

    const destination = new URL(url);
    if (destination.protocol === "https:") {
      window.location.assign(destination.href);
    }
  }
});

style.textContent += `
  .shark-guide-highlight {
    position: fixed;
    z-index: 2147483645;
    box-sizing: border-box;
    border: 3px solid #0078d4;
    border-radius: 8px;
    box-shadow: 0 0 0 4px rgb(0 120 212 / 25%);
    pointer-events: none;
  }
`;

function highlightGuideTarget(target) {
  const highlight = document.createElement("div");
  highlight.className = "shark-guide-highlight";
  highlight.setAttribute("aria-hidden", "true");
  shadow.append(highlight);

  let frameId;

  function updatePosition() {
    const bounds = target.getBoundingClientRect();
    Object.assign(highlight.style, {
      top: `${bounds.top}px`,
      left: `${bounds.left}px`,
      width: `${bounds.width}px`,
      height: `${bounds.height}px`,
    });

    frameId = requestAnimationFrame(updatePosition);
  }

  target.scrollIntoView({ block: "center", inline: "nearest" });
  updatePosition();

  return () => {
    cancelAnimationFrame(frameId);
    highlight.remove();
  };
}

style.textContent += `
  .shark-guide-bubble {
    position: fixed;
    left: 16px;
    bottom: 16px;
    z-index: 2147483646;
    max-width: min(300px, calc(100vw - 100px));
    box-sizing: border-box;
    padding: 14px;
    border-radius: 12px;
    background: #123047;
    color: white;
    font: 14px/1.4 system-ui, sans-serif;
  }

  .shark-guide-bubble p {
    margin: 0 0 10px;
  }
`;

function showGuideBubble(instruction, onStop) {
  const bubble = document.createElement("div");
  bubble.className = "shark-guide-bubble";

  const message = document.createElement("p");
  message.setAttribute("role", "status");
  message.textContent = instruction;

  const stopButton = document.createElement("button");
  stopButton.type = "button";
  stopButton.textContent = "Stop guide";
  stopButton.addEventListener("click", onStop);

  bubble.append(message, stopButton);
  shadow.append(bubble);

  return () => bubble.remove();
}

async function guideState(action, state) {
  const response = await chrome.runtime.sendMessage({
    type: "shark:guide_state",
    action,
    state,
  });

  if (!response?.ok) {
    throw new Error(response?.error ?? "Could not access guide state");
  }

  return response.state;
}

function showGuideStep(step, onStop) {
  const target = document.querySelector(step.selector);

  if (!target) {
    return null;
  }

  const removeHighlight = highlightGuideTarget(target);
  const removeBubble = showGuideBubble(step.bubble, onStop);

  return () => {
    removeHighlight();
    removeBubble();
  };
}

function matchesGuideUrl(pattern, pageUrl) {
  const regexSource = pattern
    .split("*")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");

  return new RegExp(`^${regexSource}$`).test(pageUrl);
}

function findGuideStepIndex(steps, startIndex, pageUrl) {
  return steps.findIndex(
    (step, index) =>
      index >= startIndex && matchesGuideUrl(step.url_pattern, pageUrl),
  );
}

async function finishGuide(stepId, status, removeStep) {
  removeStep?.();
  await guideState("clear");

  panel.contentWindow?.postMessage(
    {
      type: "shark:guide_finished",
      step_id: stepId,
      status,
    },
    PANEL_ORIGIN,
  );
}

async function resumeGuide(state) {
  const { goal, steps, stepIndex } = state;
  const destination = new URL(goal.url);
  const currentPage = new URL(window.location.href);
  const normalizePath = (path) => path.replace(/\/+$/, "");

  if (
    destination.origin === currentPage.origin &&
    normalizePath(destination.pathname) === normalizePath(currentPage.pathname)
  ) {
    await finishGuide(goal.step_id, "done");
    return;
  }

  const index = findGuideStepIndex(steps, stepIndex, currentPage.href);

  if (index === -1) {
    await finishGuide(goal.step_id, "failed");
    return;
  }

  const removeStep = showGuideStep(steps[index], () => {
    finishGuide(goal.step_id, "stopped", removeStep).catch(console.error);
  });

  if (!removeStep) {
    await finishGuide(goal.step_id, "failed");
  }
}

guideState("load")
  .then((state) => {
    if (!state) return;

    if (state.mode === "live") {
      return startLiveNavigator(state.goal, state.language);
    }

    return resumeGuide(state);
  })
  .catch((error) => {
    console.error("[Shark Advisor] Could not resume the guide", error);
  });

async function findRecordedGuide(goal, guideFiles) {
  const guides = await Promise.all(
    guideFiles.map(async (file) => {
      const response = await fetch(chrome.runtime.getURL(file));

      if (!response.ok) {
        throw new Error(`Could not load guide: ${file}`);
      }

      return response.json();
    }),
  );

  const destination = new URL(goal.url);

  return (
    guides.find((guide) =>
      guide.match.goal_urls.some((prefix) => {
        const match = new URL(prefix);
        const path = match.pathname.replace(/\/+$/, "");
        return destination.origin === match.origin && (
          destination.pathname === path ||
          destination.pathname.startsWith(`${path}/`)
        );
      }),
    ) ??
    guides.find((guide) => guide.match.step_ids.includes(goal.step_id)) ??
    null
  );
}

const recordedGuideFiles = ["guides/cybersecurity-analyst.json"];

async function startRecordedGuide(goal) {
  if (typeof goal?.url !== "string" || !URL.canParse(goal.url)) {
    return;
  }

  const destination = new URL(goal.url);
  if (destination.protocol !== "https:") {
    return;
  }

  const guide = await findRecordedGuide(goal, recordedGuideFiles);

  if (!guide) {
    await guideState("clear");
    window.location.assign(destination.href);
    return;
  }

  const state = {
    goal: { ...goal, url: guide.destination_url ?? goal.url },
    steps: guide.steps,
    stepIndex: 0,
  };
  await guideState("save", state);
  await resumeGuide(state);
}

function captureNavigatorPage() {
  const targets = new Map();
  const elements = [];
  const candidates = document.querySelectorAll(
    'a[href], button, input:not([type="hidden"]), textarea, select, [role="button"]',
  );

  for (const element of candidates) {
    if (elements.length === 150) break;

    if (
      !element.getClientRects().length ||
      getComputedStyle(element).visibility !== "visible" ||
      element.matches(":disabled")
    ) {
      continue;
    }

    const id = `shark-target-${elements.length + 1}`;
    const text = (
      element.getAttribute("aria-label") ||
      element.innerText ||
      element.textContent ||
      ""
    ).replace(/\s+/g, " ").trim().slice(0, 80);

    targets.set(id, element);
    elements.push({
      id,
      tag: element.localName,
      text,
      href: element instanceof HTMLAnchorElement ? element.href : null,
      type: element.getAttribute("type"),
      placeholder: element.getAttribute("placeholder"),
    });
  }

  return {
    page: { url: location.href, title: document.title, elements },
    targets,
  };
}

async function requestNavigatorStep(goal, language, previousSteps = []) {
  const { page, targets } = captureNavigatorPage();

  const response = await chrome.runtime.sendMessage({
    type: "shark:navigate",
    request: {
      goal,
      language,
      page,
      previous_steps: previousSteps,
    },
  });

  if (!response?.ok) {
    throw new Error(response?.error ?? "Could not get the next guide step");
  }

  const step = response.step;
  return {
    step,
    target: targets.get(step.element_id) ?? null,
  };
}

function showNavigatorInstruction(step, target, onStop) {
  const canHighlight = target?.isConnected;
  const removeHighlight = canHighlight
    ? highlightGuideTarget(target)
    : null;

  let instruction = step.bubble || "Follow the highlighted step.";

  if (step.action === "type" && step.text_to_type) {
    instruction += `\n“${step.text_to_type}”`;
  }

  const removeBubble = showGuideBubble(instruction, onStop);

  return () => {
    removeHighlight?.();
    removeBubble();
  };
}

async function startLiveNavigator(goal, language) {
  await guideState("save", {
    mode: "live",
    goal,
    language,
  });

  const { step, target } = await requestNavigatorStep(goal, language);
    console.info("[Shark Advisor] Navigator action:", step.action);

  if (step.action === "done") {
    await finishGuide(goal.step_id, "done");
    return;
  }

  if (step.action === "open_url") {
    await startRecordedGuide(goal);
    return;
  }

  const removeInstruction = showNavigatorInstruction(step, target, () => {
    finishGuide(goal.step_id, "stopped", removeInstruction).catch(console.error);
  });
}
