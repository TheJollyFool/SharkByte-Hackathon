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
panel.srcdoc = "<h1>Shark Advisor</h1><p>Panel preview</p>";

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

  if (event.data?.type === "shark:close" && !panel.hidden) {
    button.click();
  }
});