# Soño

An image gallery theme for [Lume](https://lume.land/).

## Features

- **Spreadsheet-driven** – Manage your entire gallery—images, dates, and custom metadata—from a single spreadsheet.
- **Automatic image processing** – Optimized thumbnails and lightbox images are generated at build time, no need to resize or optimize images separately.
- **Highly customizable** – Easily change the gallery layout, thumbnail size, and more via [LumeCMS](https://lume.land/cms/).
- **Dynamic filtering** – Custom metadata columns automatically become interactive filters, including a year range slider.
- **PhotoSwipe lightbox** – Click on any thumbnail to open the full image in a lightbox, with keyboard navigation, captions, zoom, and fullscreen support.
- **Progressive enhancement** – The gallery works without JavaScript, with hover captions and direct image links as fallbacks.

## Requirements

- [Deno](https://deno.com/) 2.x or later

## Installation

```sh
git clone https://github.com/koikurasu/sono.git my-gallery
cd my-gallery
deno task serve
```

## Getting started

### 1. Add your images

Place your images in `src/assets/images/gallery/`. Supported formats: jpeg, jp2, png, webp, gif, avif, heif and tiff.

### 2. Fill in the spreadsheet

Open `src/_data/images.ods` in LibreOffice Calc, Microsoft Excel, or any compatible spreadsheet program. Add a row for each image.

The reserved columns are:

| Column | Required | Description |
|---|---|---|
| `filename` | Yes | Exact filename including extension, e.g. `my-painting.jpg` |
| `date` | No | Year (`1665`) or date (`2021-05-30`) |
| `alt` | No | Alt text for accessibility |
| `caption` | No | Caption shown in the lightbox. Supports Markdown, including links. |

You can add any additional columns you like, which will be used to filter the gallery. See [Custom metadata](#custom-metadata) below.

### 3. Configure the theme

Your site's configuration is managed through a few key files:
- `src/_data.yml` for site metadata (title, description, language, social links).
- `src/_data.json` for gallery settings (layout style, image sizing, and output formats).
- `src/_includes/sass/_gallery_variables.scss` for gallery-specific dimensions and styling.
- `src/_includes/sass/_theme_variables.scss` for site-wide colors and typography.

The easiest way to configure your site is to use the **LumeCMS** interface. Start the development server (see step 4) and navigate to `http://localhost:3000/admin`. The CMS provides a user-friendly interface to edit all metadata, gallery settings, and CSS variables directly in your browser, with explanations for each option.

### 4. Build or serve

```sh
# Development server with live reload and LumeCMS
deno task serve

# Production build
deno task build
```

Output goes to `_site/`.

## Custom metadata

Add any columns to the spreadsheet beyond the reserved ones. Their names become `data-` attributes on each gallery item, which the filter system uses.

For multiple values in one column, separate them with commas. For example, a cell in a **tags** column might look like:

```text
oil paint, portrait, 17th century
```

Column names are lowercased and spaces replaced with hyphens, so `My Column` becomes `data-my-column`.

## Date format

The `date` column accepts any date format, so long as the year is the only 4-digit number. It powers the year range slider filter.

## Captions

Captions support Markdown inline formatting. To include a link, use standard Markdown syntax:

```
[Artist name](https://example.com)
```

If your URL contains parentheses, wrap it in angle brackets:

```
[Artist name](<https://commons.wikimedia.org/wiki/File:Example_(detail).jpg>)
```

## Fonts

The theme ships with [Aspekta](https://github.com/ivodolenc/aspekta) (OFL 1.1). To use a different font, replace the files in `src/assets/fonts/` and update the `@font-face` declarations in `src/_includes/sass/_fonts.scss`.

## Credits and licensing

- Theme code released under the [MIT](LICENSE) license
- [Aspekta](https://github.com/ivodolenc/aspekta) font – SIL Open Font License 1.1
- [PhotoSwipe](https://photoswipe.com/) – MIT
- [Dynamic caption plugin for PhotoSwipe v5](https://github.com/dimsemenov/photoswipe-dynamic-caption-plugin) – MIT
- [Macy.js](https://github.com/bigbite/macy.js) – MIT