// controls how images are arranged
// possible values: fixed-height, grid, masonry-css, masonry-js
export const gallery_style:
  | "fixed-height"
  | "grid"
  | "masonry-css"
  | "masonry-js" = "masonry-css";

// controls how images are resized to fit the allocated space
// possible values: cover, contain
export const image_fit: "cover" | "contain" = "contain";

// max thumbnail height (if fixed-height) or width (if grid or masonry) of images.
export const thumbnail_dimension = 300;

// max width/height of lightbox images. will be resized to fit inside this dimension (with aspect ratio preserved)
// set to null to always serve the original image files. note that this will greatly increase build times, especially the first build.
export const lightbox_dimension = 2000;
