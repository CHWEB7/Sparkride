import type { Metadata } from "next";
import { getSiteUrl } from "./site-url";

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}

const defaultDescription =
  "Fixed-price electric airport transfers from Castleford and West Yorkshire. Leeds Bradford from £45. Professional drivers, 24/7 booking.";

export const rootMetadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "Airport Transfers Castleford & West Yorkshire | Sparkride",
    template: "%s | Sparkride",
  },
  description: defaultDescription,
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Sparkride",
    title: "Airport Transfers Castleford & West Yorkshire | Sparkride",
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Airport Transfers Castleford & West Yorkshire | Sparkride",
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${getSiteUrl()}${canonicalPath}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${title} | Sparkride`,
      description,
      url,
    },
    twitter: {
      title: `${title} | Sparkride`,
      description,
    },
  };
}
