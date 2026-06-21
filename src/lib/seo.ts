import { variables } from "./variables"

export const site = {
  name: "Crashnaut",
  author: "Mike Sell",
  url: variables.basePath,
  description:
    "Mike Sell (Crashnaut), Senior SDET specializing in test automation, CI/CD, and quality engineering.",
  defaultImage: `${variables.basePath}/images/mike.jpg`,
  locale: "en_US",
  twitter: "@crashnaut",
  /** Trading / legal entity for contracting (Ireland). */
  legalEntity: {
    name: "Crashnaut Ltd",
    addressCountry: "IE",
  },
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.author,
    url: site.url,
    image: site.defaultImage,
    jobTitle: "Senior SDET Contractor",
    sameAs: [
      "https://www.linkedin.com/in/mike-sell-crashnaut",
      "https://github.com/crashnaut",
      "https://bsky.app/profile/crashnaut.com",
    ],
    worksFor: {
      "@type": "Organization",
      name: site.legalEntity.name,
      address: {
        "@type": "PostalAddress",
        addressCountry: site.legalEntity.addressCountry,
      },
    },
  }
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
    author: { "@type": "Person", name: site.author },
  }
}

export function blogPostingJsonLd(opts: {
  title: string
  description: string
  url: string
  image: string
  publishedAt: string
  modifiedAt?: string
  tags?: string[]
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    image: opts.image,
    datePublished: opts.publishedAt,
    dateModified: opts.modifiedAt ?? opts.publishedAt,
    author: { "@type": "Person", name: site.author, url: site.url },
    publisher: {
      "@type": "Organization",
      name: site.legalEntity.name,
      url: site.url,
      address: {
        "@type": "PostalAddress",
        addressCountry: site.legalEntity.addressCountry,
      },
    },
    keywords: opts.tags?.join(", "),
    mainEntityOfPage: { "@type": "WebPage", "@id": opts.url },
  }
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
