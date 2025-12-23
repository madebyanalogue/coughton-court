/**
 * Generate a URL-friendly ID from a section title
 * @param {string} title - The section title
 * @returns {string} - A slugified ID
 */
export function useSectionId() {
  const generateSectionId = (title) => {
    if (!title) return null
    
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  }

  return {
    generateSectionId
  }
}

