"use client";

import { useEffect } from "react";

const DESKTOP_MQ = "(min-width: 1024px)";

/** Locks document scroll on desktop booking layout only (lg+). */
export function BookPageScrollLock() {
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);

    function applyScrollLock() {
      const html = document.documentElement;
      const body = document.body;

      if (mq.matches) {
        html.dataset.scrollLock = "book";
        html.style.overflow = "hidden";
        body.style.overflow = "hidden";
      } else {
        delete html.dataset.scrollLock;
        html.style.overflow = "";
        body.style.overflow = "";
      }
    }

    applyScrollLock();
    mq.addEventListener("change", applyScrollLock);

    return () => {
      mq.removeEventListener("change", applyScrollLock);
      delete document.documentElement.dataset.scrollLock;
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  return null;
}
