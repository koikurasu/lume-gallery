import PhotoSwipeLightbox from "./vendor/photoswipe-lightbox.esm.js";
import PhotoSwipeDynamicCaption from "./vendor/photoswipe-dynamic-caption-plugin.esm.js";

const galleryEl = document.getElementById("gallery");
if (galleryEl) galleryEl.classList.add("js-enabled");

// icons from Akar Icons (https://akaricons.com/)
// MIT License: https://github.com/artcoholic/akar-icons/blob/master/LICENSE
const leftArrowSVGString =
  '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pswp__icn"><path d="M15 4l-8 8 8 8"/></svg>';
const closeSVGString =
  '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pswp__icn"><path d="M20 20L4 4m16 0L4 20"/></svg>';
const zoomSVGString =
  '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pswp__icn"><path d="M21 21l-4.486-4.494M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0z"/><path d="M10.5 7v3.5m0 0V14m0-3.5H14m-3.5 0H7"/></svg>';

const options = {
  arrowPrevSVG: leftArrowSVGString,
  arrowNextSVG: leftArrowSVGString,
  closeSVG: closeSVGString,
  zoomSVG: zoomSVGString,
  gallery: "#gallery",
  children: ".gallery-item:not([hidden]) a.photoswipe",
  pswpModule: () => import("./vendor/photoswipe.esm.js"),
};

const lightbox = new PhotoSwipeLightbox(options);

const _captionPlugin = new PhotoSwipeDynamicCaption(lightbox, {
  type: "auto",
  captionContent: (slide) => {
    const figcaption = slide.data.element
      .closest("figure")
      .querySelector("figcaption");
    return figcaption ? figcaption.innerHTML : "";
  },
});

lightbox.init();
