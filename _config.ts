import lume from "lume/mod.ts";
import plugins from "./plugins.ts";
import {
  imageDimensionsFromData,
  imageDimensionsFromStream,
} from "lume/deps/image_dimmensions.ts";
import { posix } from "lume/deps/path.ts";

const site = lume({
  src: "./src",
});

// in the _data/images spreadsheet, these column names are already reserved
// for use when building the image gallery. all other columns are to be
// treated as metadata for building the filtering system.
const RESERVED = new Set(["filename", "date", "alt", "caption"]);

site.filter("extractMeta", (row: Record<string, unknown>) => {
  const meta: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(row)) {
    if (!RESERVED.has(key)) {
      const slug = key.toLowerCase().replace(/\s+/g, "-");
      meta[slug] = typeof value === "string"
        ? value.split(",").map((v) => v.trim()).filter(Boolean)
        : [String(value)];
    }
  }
  return meta;
});

// create a simple filter that removes all spaces and the final .{image extension}
site.filter(
  "removeExt",
  (filename: string) => filename.replaceAll(/\s/g, "").replace(/\.[^/.]+$/, ""),
);

site.use(plugins());

// add image dimensions to image links for photoswipe
site.process([".html"], async function processPswpSize(pages) {
  const sizes = new Map<string, { width: number; height: number } | undefined>();

  async function getImageSize(path: string) {
    if (sizes.has(path)) return sizes.get(path);

    const page = site.pages.find((p) => p.data.url === path);
    if (page) {
      const dims = imageDimensionsFromData(page.bytes);
      sizes.set(path, dims);
      return dims;
    }

    const file = site.files.find((f) => f.data.url === path);
    if (file) {
      using fs = await Deno.open(file.src.entry.src, { read: true, write: false });
      const dims = await imageDimensionsFromStream(fs.readable);
      sizes.set(path, dims);
      return dims;
    }
  }

  for (const page of pages) {
    const { document } = page;
    const basePath = posix.dirname(page.outputPath);

    for (const a of document.querySelectorAll("a[pswp-size]")) {
      const href = a.getAttribute("href");
      if (!href) continue;

      const size = await getImageSize(posix.resolve(basePath, href));
      if (size) {
        a.setAttribute("data-pswp-width", size.width.toString());
        a.setAttribute("data-pswp-height", size.height.toString());
      }

      a.removeAttribute("pswp-size");
    }
  }
});

export default site;
