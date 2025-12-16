import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: '4dgj84d5',
  dataset: 'production',
  apiVersion: '2024-03-19',
  useCdn: true,
  perspective: 'published'
}) 