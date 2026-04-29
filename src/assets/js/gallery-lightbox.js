import PhotoSwipeLightbox from 'https://cdn.jsdelivr.net/npm/photoswipe@5/dist/photoswipe-lightbox.esm.js';
import PhotoSwipeDynamicCaption from 'https://unpkg.com/photoswipe-dynamic-caption-plugin/photoswipe-dynamic-caption-plugin.esm.js';

const lightbox = new PhotoSwipeLightbox({
  gallery: '#gallery',
  children: 'a',
  pswpModule: () => import('https://cdn.jsdelivr.net/npm/photoswipe@5/dist/photoswipe.esm.js')
});

const _captionPlugin = new PhotoSwipeDynamicCaption(lightbox, {
  type: 'auto',
  captionContent: (slide) => {
      return slide.data.element.querySelector('picture').getAttribute('data-caption');
  }
});

lightbox.init();
