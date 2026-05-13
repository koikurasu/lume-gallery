---
title: About
layout: layouts/base.vto
templateEngine:
  - vto
  - md
---

# {{ site }}

A theme for [Lume](https://lume.land/) that turns a spreadsheet into an image gallery site.

## Features

- **Spreadsheet-driven** – Manage your entire gallery—images, dates, and custom metadata—from a single spreadsheet.
- **Automatic image processing** – Optimized thumbnails and lightbox images are generated at build time, no need to resize or optimize images separately.
- **Highly customizable** – Easily change the gallery layout, thumbnail size, and more via [LumeCMS](https://lume.land/cms/).
- **Dynamic filtering** – Custom metadata columns automatically become interactive filters, including a year range slider.
- **PhotoSwipe lightbox** – Click on any thumbnail to open the full image in a lightbox, with keyboard navigation, captions, zoom, and fullscreen support.
- **Progressive enhancement** – The gallery works without JavaScript, with hover captions and direct image links as fallbacks.

## How it works

1. **Add images** to the `src/assets/images/gallery/` folder.
2. **Fill in the spreadsheet.** Open `src/_data/images.ods` and add a row for each image.
3. **Configure the theme** by running `lume -s` and navigating to `http://localhost:3000/admin`. You can tweak layout and style options directly in the UI.
4. **Build and deploy.** Run `lume` to build the static site in the `_site/` folder.

Thumbnails and lightbox images are generated automatically at build time and cached for future builds.

## Gallery styles

Choose one of four layouts and one of two image fitting styles in your configuration file. This demo uses JS masonry.

### Fixed height

All thumbnails share a fixed height and are filled row by row; widths vary with each image's aspect ratio.

<figure>
    <div class="one-row-gallery" style="--row-height: 300px;">
        <img src="/assets/images/other/fixedheightcover.jpg" alt="Image gallery. Images are organized by row, with the left and right sides flushed to the container edges." />
        <img src="/assets/images/other/fixedheightcontain.jpg" alt="Image gallery. Images are the same height and scaled down to fit available space." />
    </div>
    <figcaption><strong>left:</strong> <code>"gallery_style": "fixed-height"</code>, <code>"image_fit": "cover"</code>, <code>$gallery-row-gap</code> and <code>$gallery-column-gap: 10px</code>. <strong>right:</strong> <code>"gallery_style": "fixed-height"</code>, <code>"image_fit": "contain"</code>, <code>$gallery-row-gap</code> and <code>$gallery-column-gap: 10px</code>, <code>$gallery-justify-content: flex-start</code>. </figcaption>
</figure>

### Grid

Fixed width and height; images are cropped or letterboxed to fill their cell.

<figure>
    <div class="one-row-gallery" style="--row-height: 300px;">
        <img src="/assets/images/other/gridcover.jpg" alt="Image gallery. Thumbnails are cropped to squares of the same size and displayed in a grid." />
        <img src="/assets/images/other/gridcontain.jpg" alt="Image gallery. Image containers are displayed in a grid, with thumbnails scaled down to fit." />
    </div>
    <figcaption><strong>left:</strong> <code>"gallery_style": "grid"</code>, <code>"image_fit": "cover"</code>, <code>"gallery_aspect_ratio": "1/1"</code>, <code>$gallery-row-gap</code> and <code>$gallery-column-gap: 10px</code>. <strong>right:</strong> <code>"gallery_style": "grid"</code>, <code>"image_fit": "contain"</code>, <code>"gallery_aspect_ratio": "4/3"</code>, <code>$gallery-row-gap: 90px</code>, <code>$gallery-column-gap: 80px</code>. </figcaption>
</figure>

### CSS masonry

Fixed width, variable height. Images flow top-to-bottom within each column before moving to the next. Note that the spacing between columns cannot be controlled.

<figure>
    <img src="/assets/images/other/masonrycss.jpg" alt="Image gallery. Images are organized by columns." />
    <figcaption><code>"gallery_style": "masonry-css"</code>, <code>$gallery-row-gap: 50px</code>.</figcaption>
</figure>

### JS masonry

Fixed width, variable height. Images fill across rows. Requires JavaScript; falls back to CSS masonry if scripting is unavailable.

<figure>
    <img src="/assets/images/other/masonryjs.jpg" alt="Image gallery. Images are organized by columns." />
    <figcaption><code>"gallery_style": "masonry-js"</code>, <code>$gallery-row-gap</code> and <code>$gallery-column-gap: 20px</code>.</figcaption>
</figure>

## Spreadsheet structure

Open `src/_data/images.ods` in LibreOffice Calc, Microsoft Excel, or any compatible app. Add a new row for each image you want to add to the gallery.

| filename     | date | alt                                                 | caption                | artist                   | nationality | tags            |
| :----------- | :--- | :-------------------------------------------------- | :--------------------- | :----------------------- | :---------- | :-------------- |
| vanitas.jpg  | 1665 | A still life featuring a skull adorned with a crown | Vanitas Still Life     | Jan van Kessel the Elder | Flemish     | flowers         |
| beatrice.jpg | 1882 | Young girl in black dress with red sash             | Miss Beatrice Townsend | John Singer Sargent      | American    | people, animals |

The four reserved columns have specific roles:

- **`filename`** (Required): The name of the image file in `src/assets/images/gallery/`.
- **`date`**: Powers the year range slider. Works with any date format, so long as the year is the only 4-digit number.
- **`alt`**: Descriptive text for accessibility and screen readers.
- **`caption`**: The description shown in the lightbox. Supports [Markdown](https://www.markdownguide.org/) for links and formatting.

Any other columns you add (e.g. `medium`, `location`, `character`, etc.) will be treated as custom metadata for the filter system. Add as many as you need to suit your work.

For multiple values in one cell, separate them with commas. For example, if a photo has multiple subjects, you could put `people, animals` in the `tags` column.

## Filtering and sorting

Every custom metadata column automatically becomes a filterable attribute. If you add an `artist` column, visitors can filter by artist. If a column has multiple values separated by commas, e.g. `people, animals`, then each value can be filtered independently.

The date column drives a range slider, so visitors can browse by year.

## Requirements and installation

You\'ll need [Deno](https://deno.com/) 2.x or later installed.

```bash
# Clone the repository
git clone https://github.com/koikurasu/sono.git
cd sono

# Start a local development server
lume -s
```

Full setup instructions, configuration reference, and deployment guides are in the [README](https://github.com/koikurasu/sono#readme).

## Licenses

Theme code is released under the [MIT License](https://github.com/koikurasu/sono/blob/main/LICENSE). Bundled assets have their own licenses:

- [Aspekta](https://github.com/ivodolenc/aspekta) – SIL Open Font License 1.1
- [PhotoSwipe](https://photoswipe.com/) – MIT
- [Macy.js](https://github.com/bigbite/macy.js) – MIT

The demo images are public domain works sourced from museum open access collections.
