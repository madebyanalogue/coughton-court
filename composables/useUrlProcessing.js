export const useUrlProcessing = () => {
  /**
   * Process external URLs to ensure they have proper protocols
   * @param {string} url - The URL to process
   * @returns {string} - The processed URL
   */
  const getProcessedUrl = (url) => {
    if (!url) return '#'
    
    // Preserve mailto: and tel: links as-is
    if (url.startsWith('mailto:') || url.startsWith('tel:')) {
      return url
    }
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    } else if (url.startsWith('//')) {
      // Protocol-relative URL
      return `https:${url}`
    } else if (url.startsWith('/')) {
      // Absolute path on same domain
      return url
    } else {
      // Relative URL or domain without protocol - treat as external
      return `https://${url}`
    }
  }

  return {
    getProcessedUrl
  }
}
