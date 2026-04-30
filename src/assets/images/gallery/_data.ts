import {
  gallery_style,
  lightbox_dimension,
  lightbox_formats,
  thumbnail_dimension,
  thumbnail_formats,
} from "../../../_data.ts";

const thumbnailResize = gallery_style === "fixed-height"
  ? [null, thumbnail_dimension]
  : gallery_style === "grid"
  ? [
    thumbnail_dimension,
    thumbnail_dimension,
    { fit: "inside", withoutEnlargement: true },
  ]
  : [thumbnail_dimension, null];

// compress images for the lightbox if lightbox_dimension is defined
const lightboxResize = lightbox_dimension
  ? [lightbox_dimension, lightbox_dimension, {
    fit: "inside",
    withoutEnlargement: true,
  }]
  : null;

export const transformImages = [
  {
    resize: thumbnailResize,
    suffix: "-thumbnail",
    format: thumbnail_formats,
  },
  ...(lightbox_dimension !== null
    ? [
      {
        resize: lightboxResize,
        suffix: "-lightbox",
        format: lightbox_formats,
      },
    ]
    : []),
];
