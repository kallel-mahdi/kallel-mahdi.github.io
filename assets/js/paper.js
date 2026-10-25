// Interactive components of the paper layout (_layouts/paper.liquid):
// method stepper and question cards.

const typeset = (element) => {
  if (window.MathJax && window.MathJax.typesetPromise) window.MathJax.typesetPromise([element]);
};

// Stepper: one panel visible at a time, driven by tabs and arrows.
document.querySelectorAll("[data-stepper]").forEach((stepper) => {
  const tabs = [...stepper.querySelectorAll(".stepper-tab")];
  const panels = [...stepper.querySelectorAll(".stepper-panel")];
  const count = stepper.querySelector(".stepper-count");
  let current = 0;

  const show = (index) => {
    current = (index + panels.length) % panels.length;
    tabs.forEach((tab, i) => {
      tab.classList.toggle("is-active", i === current);
      tab.setAttribute("aria-selected", i === current);
    });
    panels.forEach((panel, i) => panel.classList.toggle("is-active", i === current));
    count.textContent = `${current + 1} / ${panels.length}`;
  };

  stepper.classList.add("is-interactive");
  tabs.forEach((tab, i) => tab.addEventListener("click", () => show(i)));
  stepper.querySelectorAll(".stepper-arrow").forEach((arrow) => arrow.addEventListener("click", () => show(current + Number(arrow.dataset.step))));
});

// Question cards: the open card's body is shown in a full-width panel
// inserted after the last card of the clicked card's row.
document.querySelectorAll("[data-qa-grid]").forEach((grid) => {
  const cards = [...grid.querySelectorAll(".qa-card")];
  const panel = document.createElement("div");
  panel.className = "qa-panel";
  let openCard = null;

  const rowEnd = (card) => {
    const top = card.offsetTop;
    return cards.filter((c) => c.offsetTop === top).pop();
  };

  const place = () => {
    if (openCard) rowEnd(openCard).after(panel);
  };

  const close = () => {
    if (!openCard) return;
    openCard.classList.remove("is-open");
    openCard.querySelector(".qa-head").setAttribute("aria-expanded", "false");
    panel.remove();
    openCard = null;
  };

  cards.forEach((card) => {
    card.querySelector(".qa-head").addEventListener("click", () => {
      const wasOpen = openCard === card;
      close();
      if (wasOpen) return;
      openCard = card;
      card.classList.add("is-open");
      card.querySelector(".qa-head").setAttribute("aria-expanded", "true");
      panel.innerHTML = card.querySelector(".qa-body").innerHTML;
      place();
      typeset(panel);
    });
  });

  window.addEventListener("resize", place);
});
