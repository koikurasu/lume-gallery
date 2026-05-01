// controls how images are arranged
// possible values: fixed-height, grid, masonry-css, masonry-js
export const gallery_style:
  | "fixed-height"
  | "grid"
  | "masonry-css"
  | "masonry-js" = "masonry-js";

// controls how images are resized to fit the allocated space. has no effect when using masonry layouts.
// possible values: cover, contain
export const image_fit: "cover" | "contain" = "contain";

// max width/height of thumbnails.
export const thumbnail_dimension = 500;

// max width/height of lightbox images. will be resized to fit inside this dimension (with aspect ratio preserved)
// set to null to always serve the original image files.
// note that this will increase build times, especially the first build, after modifying lightbox_formats,
// or using a large value for lightbox_dimension. using avif as a format in lightbox_formats greatly increases build times.
export const lightbox_dimension = 2000;

// remove original images from the published site. only takes effect if lightbox_dimensions != null
export const remove_originals = true;

// formats to compress thumbnails into.
// the last format in the list will be used as the fallback for <img> tags.
// for more options, see https://sharp.pixelplumbing.com/api-output/
export const thumbnail_formats = [
  { format: "avif", quality: 68, chromaSubsampling: "4:4:4", effort: 6 },
  { format: "jpeg", quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" },
];

// formats to compress lightbox images into.
// the last format in the list will be used as the fallback for <a> tags.
// to use the same options as thumbnail_formats, set this to [ ...thumbnail_formats ]
export const lightbox_formats = [
  { format: "jpeg", quality: 84, mozjpeg: true, chromaSubsampling: "4:4:4" },
];
