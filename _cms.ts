import CMS from "lume/cms/mod.ts";

const cms = CMS();

const image_format_fields: any[] = [
  {
    name: "format",
    type: "select",
    options: ["avif", "jpeg", "webp", "png"],
  },
  {
    name: "quality",
    type: "number",
    description:
      "Image quality. Higher numbers equal better quality but larger file size. Defaults to 50 for avif, 80 for jpeg and webp, and 100 for png. Range: 0-100",
    attributes: {
      min: 0,
      max: 100,
    },
  },
  {
    name: "chromaSubsampling",
    description:
      "Possible values: 4:4:4, 4:2:2, 4:2:0. 4:4:4 prevents chroma subsampling, improving color accuracy and clarity around sharp edges (e.g. text, logos) at the cost of increased file size.",
    type: "text",
  },
  {
    name: "effort",
    type: "number",
    description:
      "CPU effort. Lower numbers equal faster encoding, higher numbers equal better compression. Possible ranges: 0-9 for avif, 0-6 for webp, 1-10 for png.",
  },
  {
    name: "mozjpeg",
    type: "checkbox",
    description: "Only for jpeg. Better compression, but slower encoding.",
  },
  {
    name: "lossless",
    type: "checkbox",
    description: "Only for webp and avif. Enables lossless compression.",
  },
];

cms.document({
  name: "site_settings",
  label: "Site settings",
  description: "Configure the site name and description",
  store: "src:_data.yml",
  fields: [
    "lang: text",
    "site: text",
    "description: textarea",
    {
      name: "metas",
      type: "object",
      fields: [
        "site: hidden",
        "description: hidden",
        "twitter: text",
        "fediverse: text",
        "icon: file",
        "lang: hidden",
        "generator: checkbox",
      ],
    },
  ],
});

cms.document({
  name: "gallery_settings",
  label: "Gallery settings",
  description:
    "Configure the gallery layout, thumbnail sizes, and image formats",
  store: "src:_data.json",
  fields: [
    {
      name: "gallery_style",
      label: "Gallery style",
      description:
        "Controls how image thumbnails are arranged. fixed-height: all image containers have the same height, using flexbox to fill images row-wise. grid: all image containers have the same height and width, using css grid to position images in a grid. masonry-css: all images have the same width, using css columns to fill images down a column. masonry-js: all images have the same width, using javascript to fill images across columns. Falls back to masonry-css when javascript is disabled.",
      type: "select",
      options: ["fixed-height", "grid", "masonry-css", "masonry-js"],
      value: "masonry-js",
    },
    {
      name: "image_fit",
      label: "Image fit",
      description:
        "Controls how thumbnails are resized to fit the allocated space. Has no effect when using masonry layouts. cover: images will be cropped to fill the space. contain: images will be resized to fit the space, without cropping.",
      type: "select",
      options: ["cover", "contain"],
      value: "contain",
    },
    {
      name: "gallery_aspect_ratio",
      label: "Gallery aspect ratio",
      description:
        "Aspect ratio of image thumbnails when gallery_style = grid. Possible values: any valid CSS aspect-ratio value (e.g. 1/1, 4/3, 16/9, 0.75).",
      type: "text",
      value: "4/3",
    },
    {
      name: "hover_captions",
      label: "Hover captions",
      description:
        "Show image captions on hover, in addition to the lightbox. Note that captions will always be shown on hover if the user has javascript disabled.",
      type: "checkbox",
      value: false,
    },
    {
      name: "thumbnail_dimension",
      label: "Thumbnail dimension",
      description:
        "Max height (if fixed-height) or width (if grid or masonry) of thumbnails.",
      type: "number",
      value: 500,
    },
    {
      name: "lightbox_dimension",
      label: "Lightbox dimension",
      description:
        "Max length of the lightbox image's longest side, in pixels. Larger images will be sized down to fit inside this dimension (with aspect ratio preserved). Set to 0 to always serve the original image files. Recommended value: up to 3000",
      type: "number",
      value: 2000,
    },
    {
      name: "remove_originals",
      label: "Remove originals",
      description:
        "Remove original images from the published site folder. Only takes effect if lightbox_dimension does not equal 0. Recommended to save space.",
      type: "checkbox",
      value: true,
    },
    {
      name: "thumbnail_formats",
      label: "Thumbnail formats",
      description:
        "Formats to compress thumbnails into. The last format in the list will be used as the fallback for <img> tags and should be a format that all browsers support, such as jpeg or png. For more info, see https://sharp.pixelplumbing.com/api-output/",
      type: "object-list",
      fields: image_format_fields,
    },
    {
      name: "lightbox_formats",
      label: "Lightbox formats",
      description:
        "Formats to compress lightbox images into. The last format in the list will be used as the fallback for <a> tags and should be a format that all browsers support, such as jpeg or png. For more info, see https://sharp.pixelplumbing.com/api-output/",
      type: "object-list",
      fields: image_format_fields,
    },
  ],
});

cms.document({
  name: "gallery_page",
  label: "Gallery page",
  description: "Update gallery page title and description",
  store: "src:index.vto",
  fields: [
    "layout: hidden",
    "title: text",
    "description: textarea",
  ],
});

cms.document({
  name: "about",
  label: "About page",
  description: "Biography, contact or commission info, etc",
  store: "src:about.md",
  fields: [
    "layout: hidden",
    "title: text",
    "description: textarea",
    {
      name: "content",
      type: "markdown",
      upload: "other_images",
      relativePath: false,
    },
  ],
});

cms.document({
  name: "not_found",
  label: "Not found page",
  description: "Page shown when a requested page is not found.",
  store: "src:404.md",
  fields: [
    "layout: hidden",
    "url: hidden",
    "title: text",
    {
      name: "content",
      type: "markdown",
      upload: "other_images",
      relativePath: false,
    },
  ],
});

cms.document({
  name: "css_variables_gallery",
  label: "Gallery CSS variables",
  description: "CSS variables for the image gallery",
  store: "src:_includes/sass/_gallery_variables.scss",
  fields: [
    "content: code",
  ],
});

cms.document({
  name: "css_variables_theme",
  label: "Theme CSS variables",
  description: "CSS variables for the site colors and theme",
  store: "src:_includes/sass/_theme_variables.scss",
  fields: [
    "content: code",
  ],
});

cms.upload({
  name: "gallery_images",
  label: "Gallery images",
  description: "Upload images to the gallery",
  store: "src:assets/images/gallery",
  delete: false,
  edit: false,
  rename: false,
});

cms.upload({
  name: "other_images",
  label: "Other images",
  description: "Other images",
  store: "src:assets/images/other",
});

export default cms;
