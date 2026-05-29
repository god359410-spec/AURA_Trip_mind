/**
 * Utility to fetch an image URL for a place using multiple sources.
 * Priority: Wikimedia Commons → Wikipedia → Unsplash fallback
 */

// Cache to avoid redundant fetches during PDF generation
const imageCache = new Map<string, string | null>();

export async function fetchPlaceImage(searchQuery: string): Promise<string | null> {
  if (imageCache.has(searchQuery)) return imageCache.get(searchQuery)!;

  try {
    // Strategy 1: Direct Wikipedia page images
    const directUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(searchQuery)}&pithumbsize=800&format=json&origin=*`;
    const directRes = await fetch(directUrl);
    const directData = await directRes.json();

    if (directData.query?.pages) {
      const pages = Object.values(directData.query.pages) as any[];
      if (pages[0]?.thumbnail?.source) {
        const url = pages[0].thumbnail.source;
        imageCache.set(searchQuery, url);
        return url;
      }
    }

    // Strategy 2: Wikipedia OpenSearch → then get image from found page
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(searchQuery)}&limit=3&namespace=0&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData[1]?.length > 0) {
      for (const title of searchData[1]) {
        const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(title)}&pithumbsize=800&format=json&origin=*`;
        const imgRes = await fetch(imgUrl);
        const imgData = await imgRes.json();
        const imgPages = Object.values(imgData.query?.pages || {}) as any[];
        if (imgPages[0]?.thumbnail?.source) {
          const url = imgPages[0].thumbnail.source;
          imageCache.set(searchQuery, url);
          return url;
        }
      }
    }

    // Strategy 3: Wikimedia Commons via API
    const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery + ' tourist')}&srnamespace=6&srlimit=3&format=json&origin=*`;
    const commonsRes = await fetch(commonsUrl);
    const commonsData = await commonsRes.json();
    const commonsResults = commonsData.query?.search;
    if (commonsResults?.length > 0) {
      const title = commonsResults[0].title;
      const commonsImgUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*`;
      const commonsImgRes = await fetch(commonsImgUrl);
      const commonsImgData = await commonsImgRes.json();
      const commonsImgPages = Object.values(commonsImgData.query?.pages || {}) as any[];
      if (commonsImgPages[0]?.imageinfo?.[0]?.thumburl) {
        const url = commonsImgPages[0].imageinfo[0].thumburl;
        imageCache.set(searchQuery, url);
        return url;
      }
    }

    imageCache.set(searchQuery, null);
    return null;
  } catch (error) {
    console.error('Failed to fetch place image:', error);
    imageCache.set(searchQuery, null);
    return null;
  }
}

/**
 * Fetch an image and convert it to a base64 data URL for embedding in PDFs.
 * Returns null if fetching fails (CORS issues with some images).
 */
export async function fetchImageAsBase64(searchQuery: string): Promise<string | null> {
  const url = await fetchPlaceImage(searchQuery);
  if (!url) return null;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
