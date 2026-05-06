import PhotoSwipeLightbox from "/assets/js/vendor/photoswipe-lightbox.esm.js";
import PhotoSwipeDynamicCaption from "/assets/js/vendor/photoswipe-dynamic-caption-plugin.esm.js";

const galleryEl = document.getElementById("gallery");
if (galleryEl) galleryEl.classList.add("js-enabled");

const lightbox = new PhotoSwipeLightbox({
  gallery: "#gallery",
  children: ".gallery-item:not([hidden]) a.photoswipe",
  pswpModule: () => import("/assets/js/vendor/photoswipe.esm.js"),
});

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
