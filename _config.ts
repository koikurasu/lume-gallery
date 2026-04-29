import lume from "lume/mod.ts";
import plugins from "./plugins.ts";

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

export default site;
