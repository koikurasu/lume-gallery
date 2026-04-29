import {
  gallery_style,
  lightbox_dimension,
  thumbnail_dimension,
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
    format: [
      { format: "avif", quality: 80, chromaSubsampling: "4:4:4" },
      { format: "jpg", quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" },
    ],
  },
  ...(lightbox_dimension !== null
    ? [
      {
        resize: lightboxResize,
        suffix: "-lightbox",
        format: [
          { format: "avif", quality: 85, chromaSubsampling: "4:4:4" },
        ],
      },
    ]
    : []),
];
