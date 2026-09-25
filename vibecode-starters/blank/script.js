const btn = document.getElementById("action-btn");
const output = document.getElementById("output");

let clickCount = 0;

btn.addEventListener("click", () => {
  clickCount++;
  output.textContent = `Button clicked ${clickCount} time${clickCount > 1 ? "s" : ""}! ✨`;
  console.log(`Interaction recorded: ${clickCount}`);
});
