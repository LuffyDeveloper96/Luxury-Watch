export const DEFAULT_WATCH_IMAGE = '/images/watches/rolex_submariner.jpg';

/**
 * Normalizes product media items supporting images and videos up to 5 items.
 * Backward compatible with products having `media`, `images`, or `image`.
 */
export const normalizeProductMedia = (product) => {
  if (!product) return [{ id: 'default-0', type: 'image', url: DEFAULT_WATCH_IMAGE, order: 0 }];

  // 1. If product.media is provided as an array
  if (Array.isArray(product.media) && product.media.length > 0) {
    const valid = product.media.slice(0, 5).map((m, idx) => {
      if (typeof m === 'string') {
        const clean = m.trim();
        if (!clean || clean === 'undefined' || clean === 'null') return null;
        const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(clean);
        return {
          id: `media-${idx}-${clean}`,
          type: isVideo ? 'video' : 'image',
          url: clean,
          thumbnail: isVideo ? '' : clean,
          order: idx
        };
      }
      const rawUrl = typeof m?.url === 'string' ? m.url.trim() : (typeof m?.src === 'string' ? m.src.trim() : '');
      if (!rawUrl || rawUrl === 'undefined' || rawUrl === 'null') return null;
      const isVideo = m.type === 'video' || /\.(mp4|webm|ogg|mov)$/i.test(rawUrl);
      return {
        id: m.id || m._id || `media-${idx}-${rawUrl}`,
        type: isVideo ? 'video' : 'image',
        url: rawUrl,
        thumbnail: m.thumbnail || (!isVideo ? rawUrl : ''),
        order: typeof m.order === 'number' ? m.order : idx
      };
    }).filter(Boolean);

    if (valid.length > 0) return valid;
  }

  // 2. If product.images is provided as an array
  if (Array.isArray(product.images) && product.images.length > 0) {
    const valid = product.images.slice(0, 5).map((img, idx) => {
      const rawUrl = typeof img === 'string' ? img.trim() : (typeof img?.url === 'string' ? img.url.trim() : '');
      if (!rawUrl || rawUrl === 'undefined' || rawUrl === 'null') return null;
      const isVideo = typeof rawUrl === 'string' && /\.(mp4|webm|ogg|mov)$/i.test(rawUrl);
      return {
        id: `img-${idx}-${rawUrl}`,
        type: isVideo ? 'video' : 'image',
        url: rawUrl,
        thumbnail: isVideo ? '' : rawUrl,
        order: idx
      };
    }).filter(Boolean);

    if (valid.length > 0) return valid;
  }

  // 3. If product.image is provided as a single string
  if (product.image) {
    const rawUrl = typeof product.image === 'string' ? product.image.trim() : (typeof product.image?.url === 'string' ? product.image.url.trim() : '');
    if (rawUrl && rawUrl !== 'undefined' && rawUrl !== 'null') {
      const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(rawUrl);
      return [{
        id: `single-0-${rawUrl}`,
        type: isVideo ? 'video' : 'image',
        url: rawUrl,
        thumbnail: isVideo ? '' : rawUrl,
        order: 0
      }];
    }
  }

  return [{ id: 'fallback-0', type: 'image', url: DEFAULT_WATCH_IMAGE, order: 0 }];
};

export default normalizeProductMedia;

