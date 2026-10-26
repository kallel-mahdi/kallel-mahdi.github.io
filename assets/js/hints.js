// Exercise cards for exercise posts (_layouts/exercises.liquid).
// The Hint and Answer details blocks right after an exercise callout move inside it:
// the hint becomes a "?" button in the corner (a mouse hover previews it; a click or tap pins it open;
// Escape or a click elsewhere closes it), and the answer becomes the card's collapsible footer.
// Without JavaScript both stay ordinary details blocks below the callout.

const hints = [];
const summaryText = (details) => details.querySelector(":scope > summary")?.textContent.trim();

// Answers first, so a hint that sat between callout and answer is still next to the callout.
document.querySelectorAll("details").forEach((answer) => {
  if (summaryText(answer) !== "Answer") return;
  let callout = answer.previousElementSibling;
  if (callout && callout.tagName === "DETAILS" && summaryText(callout) === "Hint") callout = callout.previousElementSibling;
  if (!callout || callout.tagName !== "BLOCKQUOTE") return;
  callout.append(answer);
  answer.classList.add("answer-in");
});

document.querySelectorAll("details").forEach((hint) => {
  const summary = hint.querySelector(":scope > summary");
  const callout = hint.previousElementSibling;
  if (!summary || summary.textContent.trim() !== "Hint" || !callout || callout.tagName !== "BLOCKQUOTE") return;

  callout.append(hint);
  hint.classList.add("hint-pop");
  const body = document.createElement("div");
  body.className = "hint-body";
  body.append(...[...hint.childNodes].filter((node) => node !== summary));
  hint.append(body);
  summary.textContent = "?";
  summary.setAttribute("aria-label", "Hint");
  summary.title = "Hint";

  let pinned = false;
  let hovered = false;
  const sync = () => {
    hint.open = pinned || hovered;
    hint.classList.toggle("is-pinned", pinned);
  };
  hint.unpin = () => {
    pinned = false;
    sync();
  };

  summary.addEventListener("click", (event) => {
    event.preventDefault();
    pinned = !pinned;
    sync();
  });
  hint.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return;
    hovered = true;
    sync();
  });
  hint.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "mouse") return;
    hovered = false;
    sync();
  });
  hints.push(hint);
});

document.addEventListener("click", (event) => {
  hints.forEach((hint) => {
    if (!hint.contains(event.target)) hint.unpin();
  });
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hints.forEach((hint) => hint.unpin());
});
