import { Metadata } from "next";

// Keyword Categories
const PRIMARY_KEYWORDS = [
  "bowling leicester",
  "roller skating leicester",
  "arcade games leicester",
  "ten pin bowling",
  "roller rink leicester",
  "family entertainment leicester",
  "indoor activities leicester",
  "fun things to do leicester",
  "leicester bowling alley",
  "skating rink leicester",
  "vr arcade leicester",
  "indoor fun leicester",
  "family activities leicester",
  "weekend activities leicester",
  "leicester city centre entertainment",
  "bowling and skating",
  "arcade leicester",
  "things to do in leicester",
  "leicester attractions",
  "indoor entertainment leicester",
  "leicester leisure activities"
];

const BOOKING_KEYWORDS = [
  "birthday party leicester",
  "bowling party leicester",
  "skating party leicester",
  "party venue leicester",
  "kids birthday party leicester",
  "roller skating party",
  "bowling birthday party",
  "group bookings leicester",
  "party packages leicester",
  "leicester party venue",
  "book bowling leicester",
  "book skating leicester",
  "leicester celebrations",
  "event venue leicester",
  "group activities leicester",
  "team building leicester"
];

const BRAND_KEYWORDS = [
  "spin pin",
  "spin pin leicester",
  "spinpin",
  "leicester bowling",
  "leicester skating",
  "leicester arcade",
  "spin pin uk",
  "bowling skating arcade",
  "leicester entertainment hub"
];

const LEICESTER_KEYWORDS = [
  "bowling in leicester",
  "roller skating in leicester",
  "arcade in leicester",
  "leicester city centre bowling",
  "leicester city centre skating",
  "things to do leicester city centre",
  "leicester indoor activities",
  "leicester family fun",
  "leicester entertainment",
  "leicester leisure",
  "first roller skating rink leicester",
  "leicester roller rink",
  "leicester ten pin bowling"
];

export const SEO_KEYWORDS = [
  ...PRIMARY_KEYWORDS,
  ...BOOKING_KEYWORDS,
  ...BRAND_KEYWORDS,
  ...LEICESTER_KEYWORDS
];

export const SEO_CONFIG = {
  siteName: "Spin Pin",
  title: "Spin Pin | Bowling, Roller Skating & Arcade in Leicester",
  description: "Experience the ultimate fun at Spin Pin Leicester! Enjoy ten pin bowling, roller skating on Leicester's first roller rink, and exciting arcade games. Perfect for birthday parties, family entertainment, and group events. Book your session now!",
  baseUrl: "https://www.spinpin.uk",
  keywords: SEO_KEYWORDS,
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://www.spinpin.uk/",
    siteName: "Spin Pin",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Spin Pin Leicester",
      },
    ],
  },
};

export function getMetadata(
  title?: string,
  description?: string,
  icons?: Metadata['icons']
): Metadata {
  const metaTitle = title
    ? `${title} | ${SEO_CONFIG.siteName}`
    : SEO_CONFIG.title;

  const metaDescription = description || SEO_CONFIG.description;

  return {
    metadataBase: new URL(SEO_CONFIG.baseUrl),
    title: metaTitle,
    description: metaDescription,
    keywords: SEO_CONFIG.keywords,
    openGraph: {
      ...SEO_CONFIG.openGraph,
      title: metaTitle,
      description: metaDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: SEO_CONFIG.openGraph.images,
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: icons || {
      icon: '/favicon.png',
    },
  };
}
