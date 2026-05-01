document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  const style = getComputedStyle(gallery);
  const rowGap = parseInt(style.getPropertyValue("--gallery-row-gap")) || 0;
  const columnGap = parseInt(style.getPropertyValue("--gallery-column-gap")) || 0;
  const thumbDim = parseInt(style.getPropertyValue("--gallery-thumbnail-dimension")) || 300;

  // Calculate dynamic breakpoints based on the desired thumbnail dimension
  const maxColumns = 12;
  const breakAt = {};
  for (let i = 1; i < maxColumns; i++) {
    // At width (i * thumbDim), use i columns
    breakAt[i * thumbDim] = i;
  }

  const macy = Macy({
    container: "#gallery",
    trueOrder: false,
    waitForImages: false,
    margin: {
      x: columnGap,
      y: rowGap,
    },
    columns: maxColumns,
    breakAt: breakAt,
  });

  globalThis.addEventListener("load", () => {
    macy.recalculate(true);
  });
});
