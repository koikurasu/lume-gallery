import PhotoSwipeLightbox from '/assets/js/vendor/photoswipe-lightbox.esm.js';
import PhotoSwipeDynamicCaption from '/assets/js/vendor/photoswipe-dynamic-caption-plugin.esm.js';

const lightbox = new PhotoSwipeLightbox({
  gallery: '#gallery',
  children: 'a',
  pswpModule: () => import('/assets/js/vendor/photoswipe.esm.js')
});

const _captionPlugin = new PhotoSwipeDynamicCaption(lightbox, {
  type: 'auto',
  captionContent: (slide) => {
      return slide.data.element.querySelector('picture').getAttribute('data-caption');
  }
});

lightbox.init();
