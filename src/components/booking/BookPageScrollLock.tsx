"use client";

import { useEffect } from "react";

/** Locks document scroll while the booking page is mounted. */
export function BookPageScrollLock() {
  useEffect(() => {
    document.documentElement.dataset.scrollLock = "book";
    const html = document.documentElement;
    const body = document.body;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      delete document.documentElement.dataset.scrollLock;
      html.style.overflow = "";
      body.style.overflow = "";
    };
  }, []);

  return null;
}
