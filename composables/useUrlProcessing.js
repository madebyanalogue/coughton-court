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

  /**
   * Check if URL is external (not a relative path)
   * @param {string} url - The URL to check
   * @returns {boolean} - True if external
   */
  const isExternalUrl = (url) => {
    if (!url) return false
    // Explicit external protocols
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return true
    if (url.startsWith('mailto:') || url.startsWith('tel:')) return true
    // Treat any URL that doesn't start with "/" or "#" as external (e.g. example.com)
    return !url.startsWith('/') && !url.startsWith('#')
  }

  /**
   * Determine if link should open in new tab (mailto/tel should not)
   * @param {string} url - The URL to check
   * @returns {boolean} - True if should open in new tab
   */
  const shouldOpenInNewTab = (url) => {
    if (!url) return false
    // mailto: and tel: should not open in new tab
    if (url.startsWith('mailto:') || url.startsWith('tel:')) return false
    // Other external URLs should open in new tab
    return isExternalUrl(url)
  }

  return {
    getProcessedUrl,
    isExternalUrl,
    shouldOpenInNewTab
  }
}
