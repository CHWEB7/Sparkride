"use client";

import { useEffect } from "react";

/** Locks document scroll while the booking page is mounted. */
export function BookPageScrollLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.dataset.scrollLock = "book";
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      delete html.dataset.scrollLock;
      html.style.overflow = "";
      body.style.overflow = "";
    };
  }, []);

  return null;
}
