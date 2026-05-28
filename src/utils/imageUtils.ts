/**
 * Utility to fetch an image URL from Wikipedia based on a search term.
 * Returns null if no image is found.
 */
export async function fetchPlaceImage(searchQuery: string): Promise<string | null> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(searchQuery)}&pithumbsize=500&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages) as any[];
      if (pages.length > 0 && pages[0].thumbnail && pages[0].thumbnail.source) {
        return pages[0].thumbnail.source;
      }
    }
    
    // Fallback: Use Wikipedia OpenSearch if direct title match fails
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(searchQuery)}&limit=1&namespace=0&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    if (searchData[1] && searchData[1].length > 0) {
      const realTitle = searchData[1][0];
      const secondUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(realTitle)}&pithumbsize=500&format=json&origin=*`;
      const secondRes = await fetch(secondUrl);
      const secondData = await secondRes.json();
      
      if (secondData.query && secondData.query.pages) {
        const pages = Object.values(secondData.query.pages) as any[];
        if (pages.length > 0 && pages[0].thumbnail && pages[0].thumbnail.source) {
          return pages[0].thumbnail.source;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch place image from Wikipedia:', error);
    return null;
  }
}
