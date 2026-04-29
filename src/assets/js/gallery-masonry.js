document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  const style = getComputedStyle(gallery);
  const gap = parseInt(style.getPropertyValue("--gallery-gap")) || 0;

  const macy = Macy({
    container: "#gallery",
    trueOrder: false,
    waitForImages: false,
    margin: gap,
    columns: 6,
    breakAt: {
      1800: 6,
      1500: 5,
      1200: 4,
      900: 3,
      600: 2,
      400: 1,
    },
  });

  globalThis.addEventListener("load", () => {
    macy.recalculate(true);
  });
});
