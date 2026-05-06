import siteData from "../../../_data.json" with { type: "json" };

const {
  gallery_aspect_ratio,
  gallery_style,
  image_fit,
  lightbox_dimension,
  lightbox_formats,
  thumbnail_dimension,
  thumbnail_formats,
} = siteData;

const ratio = (() => {
  const parts = gallery_aspect_ratio.split("/");
  if (parts.length === 2) {
    return parseFloat(parts[0]) / parseFloat(parts[1]);
  }
  return parseFloat(parts[0]) || 1;
})();

const thumbnailHeight = thumbnail_dimension / ratio;

const thumbnailResize1x = gallery_style === "fixed-height"
  ? image_fit === "cover"
    ? [
      thumbnail_dimension * 1.5, // width buffer for flex stretching
      thumbnail_dimension,
      { fit: "outside", withoutEnlargement: true },
    ]
    : [null, thumbnail_dimension]
  : gallery_style === "grid"
  ? [
    thumbnail_dimension,
    thumbnailHeight,
    {
      fit: image_fit === "cover" ? "outside" : "inside",
      withoutEnlargement: true,
    },
  ]
  : [thumbnail_dimension, null];

const thumbnailResize2x = gallery_style === "fixed-height"
  ? image_fit === "cover"
    ? [
      thumbnail_dimension * 3.0, // width buffer for flex stretching
      thumbnail_dimension * 2,
      { fit: "outside", withoutEnlargement: true },
    ]
    : [null, thumbnail_dimension * 2]
  : gallery_style === "grid"
  ? [
    thumbnail_dimension * 2,
    thumbnailHeight * 2,
    {
      fit: image_fit === "cover" ? "outside" : "inside",
      withoutEnlargement: true,
    },
  ]
  : [thumbnail_dimension * 2, null];

// compress images for the lightbox if lightbox_dimension is defined
const lightboxResize = lightbox_dimension
  ? [lightbox_dimension, lightbox_dimension, {
    fit: "inside",
    withoutEnlargement: true,
  }]
  : null;

export const transformImages = [
  {
    resize: thumbnailResize1x,
    suffix: "-thumbnail",
    format: thumbnail_formats,
  },
  {
    resize: thumbnailResize2x,
    suffix: "-thumbnail@2x",
    format: thumbnail_formats,
  },
  ...(lightbox_dimension > 0
    ? [
      {
        resize: lightboxResize,
        suffix: "-lightbox",
        format: lightbox_formats,
      },
    ]
    : []),
];
