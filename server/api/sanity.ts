import { createClient } from '@sanity/client'

// Define our own error type since SanityError isn't exported
interface SanityError extends Error {
  details?: any
  statusCode?: number
}

const client = createClient({
  projectId: '4dgj84d5',
  dataset: 'production',
  apiVersion: '2024-03-19',
  useCdn: false
})

interface Section {
  _type: string
  sectionType: string
  [key: string]: any
}

interface Page {
  _id: string
  title: string
  slug: {
    current: string
  }
  sections?: Section[]
  darkMode?: boolean
  removeTopPadding?: boolean
  hideFooter?: boolean
  hideHeaderLogo?: boolean
  greyBackground?: boolean
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  try {
    if (query.type === 'siteSettings') {
      try {
        const result = await client.fetch(`
          *[_type == "siteSettings"] | order(_updatedAt desc)[0] {
            ...,
            // Favicon and app icons
            favicon {
              favicon {
                asset->
              },
              faviconPng {
                asset->
              },
              faviconDarkPng {
                asset->
              },
              appleTouchIcon {
                asset->
              },
              androidIcon {
                asset->
              }
            },
            // Expand assets for images used across the site
            footerLogos[] {
              ...,
              asset->
            },
            certificationLogo {
              ...,
              asset->
            },
            ftCreditLogo {
              ...,
              asset->
            },
            menuBackgroundImage {
              ...,
              asset->
            },
            // Preloader images (square images displayed before site load)
            preloaderImages[] {
              "image": select(
                _type == "image" => @,
                defined(image) => image,
                @
              ){
                ...,
                asset->
              },
              alt,
              repeatLeftRight
            },
            // Logotype image for preloader
            logotype {
              ...,
              asset-> {
                _id,
                url,
                mimeType,
                metadata {
                  dimensions
                }
              },
              alt
            },
            // Main navigation menu reference
            mainNavigationMenu-> {
              _id,
              title,
              items[] {
                ...,
                to {
                  ...,
                  page-> {
                    _id,
                    slug {
                      current
                    },
                    title
                  }
                }
              }
            },
            // Feature flags / toggles
            disablePreloader,
            // Contact info
            contactInfo[] {
              label,
              value
            }
          }
        `)
        if (!result) {
          return { footerLogos: [], contactInfo: [] }
        }
        // Normalize menu items to array if null
        if (result.mainNavigationMenu && (result.mainNavigationMenu.items === null || result.mainNavigationMenu.items === undefined)) {
          result.mainNavigationMenu.items = []
        }
        return result
      } catch (fetchError: any) {
        console.error('Error fetching siteSettings:', {
          message: fetchError?.message,
          stack: fetchError?.stack,
          details: fetchError?.details,
          statusCode: fetchError?.statusCode
        })
        throw fetchError
      }
    }
    
    if (query.menuTitle) {
      const result = await client.fetch(
        `*[_type == "menu" && title == $menuTitle][0]{
          ...,
          items[]{
            ...,
            _key,
            text,
            to{
              ...,
              page-> {
                _id,
                slug {
                  current
                },
                title
              }
            }
          }
        }`,
        { menuTitle: query.menuTitle }
      )
      // Ensure items is always an array, not null
      if (result && result.items === null) {
        result.items = []
      }
      return result
    }
    
    if (query.type === 'page') {
      let result: Page | null
      
      if (query.identifierType === 'slug') {
        const queryString = `*[_type == "page" && slug.current == $identifier][0] {
          _id,
          title,
          slug,
          featuredImage {
            asset-> {
              _id,
              url,
              metadata {
                dimensions
              }
            },
            alt
          },
          shortDescription,
          sections[]-> {
            _id,
            _type,
            title,
            sectionType,
            heroContent {
              image {
                asset-> {
                  _id,
                  url,
                  metadata {
                    dimensions
                  }
                }
              }
            },

            basicContent {
              title,
              content,
              pdf {
                asset-> {
                  _id,
                  url,
                  metadata { dimensions }
                }
              }
            },
            imageContent {
              image {
                asset-> {
                  _id,
                  url,
                  metadata {
                    dimensions
                  }
                }
              },
              constrainHeight,
              alignment,
              columns,
              grid
            },
            sectionImagesContent {
              enablePadding,
              items[] {
                image {
                  asset-> {
                    _id,
                    url,
                    metadata {
                      dimensions
                    }
                  }
                },
                objectFit,
                alignment,
                width
              }
            },
            tipsFromTheTableContent {
              title
            },
            reviewsContent {
              backgroundColor,
              textColor,
              items[] {
                reviewContent,
                cite,
                showStars,
                showQuotes
              }
            },
            instagramContent {
              sectionImage { asset-> },
              linkText,
              linkUrl,
              items[] {
                image { asset-> }
              }
            },
            headlineContent {
              headline,
              centerText,
              centerBlock,
              paddingBottom,
              showArrow,
              button {
                text,
                url
              }
            },

            contactContent {
              content,
              items[] {
                _key,
                label,
                value
              },
              ftCreditLogo {
                asset-> {
                  _id,
                  url
                }
              },
              decorativeImage {
                asset-> {
                  _id,
                  url,
                  metadata {
                    dimensions
                  }
                },
                alt
              }
            },
            homeScrollContent {
              items[] {
                _key,
                title,
                image {
                  asset-> {
                    _id,
                    url,
                    metadata {
                      dimensions
                    }
                  }
                },
                link {
                  page-> {
                    slug {
                      current
                    }
                  },
                  url
                }
              }
            },
            twoColumnContent {
              mainImage {
                asset-> {
                  _id,
                  url,
                  metadata { dimensions }
                }
              },
              overlayImage {
                asset-> {
                  _id,
                  url,
                  metadata { dimensions }
                }
              },
              roundalImage {
                asset-> {
                  _id,
                  url,
                  metadata { dimensions }
                }
              },
              includeLogo,
              logoImage {
                asset-> {
                  _id,
                  url,
                  metadata { dimensions }
                }
              },
              text,
              enableBookingButton,
              imageRight,
              backgroundColor,
              textColor,
              textImage {
                asset-> {
                  _id,
                  url,
                  metadata { dimensions }
                }
              }
            },
            nestedContent {
              mainImage {
                asset-> {
                  _id,
                  url,
                  metadata { dimensions }
                }
              },
              iconImage {
                asset-> {
                  _id,
                  url,
                  metadata { dimensions }
                }
              },
              content,
              backgroundColor,
              textColor
            },
            bannerContent {
              image {
                asset-> {
                  _id,
                  url,
                  metadata { dimensions }
                }
              },
              content
            },
            newsContent {
              topText
            },
            selectedNewsContent {
              title,
              news[]-> {
                _id,
                title,
                publishedAt,
                summary,
                content,
                featuredImage {
                  asset-> {
                    _id,
                    url,
                    metadata { dimensions }
                  }
                },
                offsiteUrl,
                linkTitle
              },
              button {
                text,
                page-> { slug },
                url
              }
            },
            quoteContent {
              quote,
              cite,
              alignment
            },
            googleMapContent {
              latitude,
              longitude,
              zoom,
              mapHeight,
              googleMapsLink
            },
            textContent {
              title,
              image {
                asset-> {
                  _id,
                  url,
                  metadata {
                    dimensions
                  }
                },
                alt
              },
              content,
              columns,
              offset,
              splitTitle,
              splitTitleLeft,
              splitTitleRight
            },
            marqueeContent {
              linkTitle,
              linkUrl,
              repeatCount,
              marqueeSpeed,
              reverse
            },
            serviceLinksContent {
              enablePaddingTopBottom,
              enablePaddingLeftRight,
              items[] {
                image {
                  asset-> {
                    _id,
                    url,
                    metadata {
                      dimensions
                    }
                  }
                },
                title,
                linkTitle,
                url,
                targetBlank
              }
            },
            dualCarouselContent {
              leftCarousel[] {
                _type,
                asset-> {
                  _id,
                  url,
                  metadata { dimensions }
                },
                alt
              },
              leftOverlay {
                asset-> {
                  _id,
                  url,
                  metadata { dimensions }
                },
                alt
              },
              rightCarousel[] {
                _type,
                asset-> {
                  _id,
                  url,
                  metadata { dimensions }
                },
                alt
              },
              rightOverlay {
                asset-> {
                  _id,
                  url,
                  metadata { dimensions }
                },
                alt
              },
              carouselSpeed,
              transitionDuration
            },
            singleCarouselContent {
              carousel[] {
                _type,
                asset-> {
                  _id,
                  url,
                  metadata { dimensions }
                },
                alt
              },
              overlay {
                asset-> {
                  _id,
                  url,
                  metadata { dimensions }
                },
                alt
              },
              carouselSpeed,
              transitionDuration,
              enableBookingButton,
              enableFixedBackground,
              enablePaddingTopBottom,
              enablePaddingLeftRight,
              topBackgroundColor,
              bottomBackgroundColor
            },
            uspsContent {
              items[] {
                image {
                  asset-> {
                    _id,
                    url,
                    metadata { dimensions }
                  }
                },
                title,
                description
              }
            },
            serviceContent {
              service-> {
                _id,
                title,
                description,
                bookingLink,
                subservices[] {
                  title,
                  duration,
                  cost
                }
              },
              alignment,
              testimonial {
                quote,
                cite
              }
            },
            horizontalCarouselContent {
              items[] {
                _type,
                asset {
                  asset-> {
                    _id,
                    url,
                    metadata { dimensions }
                  }
                },
                alt,
                poster {
                  asset-> {
                    _id,
                    url,
                    metadata { dimensions }
                  }
                }
              }
            },
            selectedPagesContent {
              title,
              pages[]-> {
                _id,
                title,
                slug {
                  current
                },
                featuredImage {
                  asset-> {
                    _id,
                    url,
                    metadata {
                      dimensions
                    }
                  },
                  alt
                },
                shortDescription
              }
            }
          }
        }`
        
        try {
          // Add detailed logging for the query parameters
          console.error('[Server API] Page query details:', {
            identifier: query.identifier,
            identifierType: query.identifierType,
            queryString,
            timestamp: new Date().toISOString()
          })

          result = await client.fetch<Page>(queryString, { identifier: query.identifier })
          
          // Log the result or lack thereof
          if (!result) {
            console.error('[Server API] No page found for slug:', query.identifier)
            throw createError({
              statusCode: 404,
              message: `Page not found: ${query.identifier}`
            })
          }

          // Debug logging for horizontal carousel data
          if (result.sections) {
            const horizontalCarouselSection = result.sections.find(s => s.sectionType === 'horizontalCarousel')
            if (horizontalCarouselSection) {
              console.log('[Server API] Horizontal carousel data:', JSON.stringify(horizontalCarouselSection.horizontalCarouselContent, null, 2))
            }
          }



        } catch (error) {
          const fetchError = error as SanityError
          console.error('[Server API] Error fetching page:', {
            error: fetchError.message,
            stack: fetchError.stack,
            details: fetchError.details,
            statusCode: fetchError.statusCode,
            query: {
              identifier: query.identifier,
              type: query.type,
              identifierType: query.identifierType
            }
          })
          throw createError({
            statusCode: fetchError.statusCode || 500,
            message: `Error fetching page: ${fetchError.message}`
          })
        }
      } else {
        const queryString = '*[_type == "page" && routeName == $identifier][0]'
        try {
          result = await client.fetch<Page>(queryString, { identifier: query.identifier })
        } catch (error) {
          const fetchError = error as SanityError
          console.error('[Server API] Error fetching page by route name:', {
            error: fetchError.message,
            stack: fetchError.stack,
            details: fetchError.details,
            statusCode: fetchError.statusCode
          })
          throw fetchError
        }
      }

      if (!result) {
        throw createError({
          statusCode: 404,
          message: `Page not found: ${query.identifier}`
        })
      }
      return result
    }
    
    if (query.type === 'section') {
      const params: any = { sectionType: query.sectionType }
      if (query.title) {
        params.title = query.title
      }
      const result = await client.fetch(`
        *[_type == "section" && sectionType == $sectionType${query.title ? ' && title == $title' : ''}][0] {
          ...,
          heroContent {
            ...,
            heroElements[] {
              ...,
              image {
                ...,
                asset->
              }
            }
          },
          homeScrollContent {
            ...,
            items[] {
              ...,
              image {
                ...,
                asset->
              },
              link {
                ...,
                page-> {
                  _id,
                  title,
                  slug
                }
              }
            }
          },
          selectedServicesContent {
            services[]-> {
              _id,
              title,
              image {
                asset-> {
                  _id,
                  url,
                  mimeType
                }
              },
              description
            },
            button {
              text,
              page-> { slug },
              url
            }
          }
        }
      `, params)
      return result
    }
    
    if (query.type === 'sectionHomeScroll') {
      const result = await client.fetch('*[_type == "sectionHomeScroll"][0]{..., items[]{..., link{..., page-> { _id, slug, title }}}}')
      return result
    }
    
    if (query.type === 'news') {
      const limit = query.limit ? parseInt(query.limit as string) : undefined
      const limitClause = limit ? `[0...${limit}]` : ''
      
      const result = await client.fetch(`*[_type == "news"] | order(publishedAt desc)${limitClause} {
        _id,
        title,
        publishedAt,
        summary,
        content,
        excerpt,
        category,
        featuredImage {
          asset-> {
            _id,
            url,
            metadata { dimensions }
          }
        },
        offsiteUrl,
        linkTitle
      }`)
      return result
    }

    if (query.type === 'service') {
      const result = await client.fetch(`*[_type == "service"] | order(orderRank){
        _id,
        title,
        description,
        bookingLink,
        subservices[] {
          title,
          duration,
          cost
        }
      }`)
      return result
    }

    if (query.type === 'team') {
      const result = await client.fetch(`*[_type == "team"] | order(orderRank asc) {
        _id,
        name,
        role,
        bio,
        "imageUrl": image.asset->url,
        "imageAlt": image.alt,
        orderRank
      }`)
      return result
    }
    
    if (query.type === 'tips') {
      const result = await client.fetch(`
        *[_type == "tips"] | order(orderRank asc) {
          title,
          content,
          image { asset-> },
          backgroundImage { asset-> },
          link {
            text,
            url,
            targetBlank
          },
          orderRank
        }
      `)
      return result
    }

    if (query.type === 'galleries') {
      return await client.fetch(`
        *[_type == "gallery"] | order(orderRank asc) {
          _id,
          title,
          "thumbnail": items[0] {
            asset->
          },
          "itemCount": count(items)
        }
      `)
    }

    if (query.type === 'gallery' && query.id) {
      return await client.fetch(`
        *[_type == "gallery" && _id == $id][0] {
          _id,
          title,
          items[] {
            _type,
            asset->
          }
        }
      `, { id: query.id })
    }
    
    throw new Error('Invalid query parameters')
  } catch (error: any) {
    console.error('[Server API] Critical error:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      details: error?.details,
      statusCode: error?.statusCode,
      query,
      path: event.node.req.url
    })
    throw createError({
      statusCode: error?.statusCode || 500,
      message: `Error fetching data from Sanity: ${error?.message || 'Unknown error'}`
    })
  }
}) 