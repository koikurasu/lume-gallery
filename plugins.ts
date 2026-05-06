import lightningcss from "lume/plugins/lightningcss.ts";
import basePath from "lume/plugins/base_path.ts";
import metas from "lume/plugins/metas.ts";
import { Options as SitemapOptions, sitemap } from "lume/plugins/sitemap.ts";
import { favicon, Options as FaviconOptions } from "lume/plugins/favicon.ts";
import { merge } from "lume/core/utils/object.ts";
import sheets from "lume/plugins/sheets.ts";
import picture from "lume/plugins/picture.ts";
import transformImages from "lume/plugins/transform_images.ts";
import imageSize from "lume/plugins/image_size.ts";
import sass from "lume/plugins/sass.ts";

import "lume/types.ts";

export interface Options {
  sitemap?: Partial<SitemapOptions>;
  favicon?: Partial<FaviconOptions>;
}

export const defaults: Options = {
  favicon: {
    input: "assets/images/other/favicon.svg",
  },
};

/** Configure the site */
export default function (userOptions?: Options) {
  const options = merge(defaults, userOptions);

  return (site: Lume.Site) => {
    site
      .use(sass())
      .use(lightningcss())
      .use(basePath())
      .use(picture())
      .use(transformImages())
      .use(imageSize())
      .use(metas())
      .use(sitemap(options.sitemap))
      .use(favicon(options.favicon))
      .use(sheets({
        sheets: "first",
        extensions: [".ods", ".xlsx", ".csv"],
      }))
      .add("style.scss")
      .add("/assets");
  };
}
