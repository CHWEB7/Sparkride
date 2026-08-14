"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Plane,
  HelpCircle,
  PoundSterling,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getBookingUrl, isExternalBookingUrl } from "@/lib/booking-url";

type NavTab = {
  id: string;
  label: string;
  columns: { title?: string; links: { label: string; href: string; external?: boolean }[] }[];
};

function buildNavTabs(bookingUrl: string): NavTab[] {
  const bookingExternal = isExternalBookingUrl(bookingUrl);

  return [
    {
      id: "services",
      label: "Services",
      columns: [
        {
          links: [
            { label: "Airport transfers", href: "/services/airport-transfers" },
            { label: "Ferry & cruise ports", href: "/services/ferry-ports" },
            { label: "Theme parks", href: "/services/theme-parks" },
            { label: "Pre-booked hire", href: "/services/private-hire" },
            { label: "Corporate travel", href: "/services/corporate" },
          ],
        },
        {
          links: [
            { label: "Sustainable travel", href: "/#sustainability" },
            { label: "Pickup locations", href: "/locations/west-yorkshire" },
            { label: "FAQs", href: "/#how-it-works" },
          ],
        },
        {
          links: [
            { label: "Fares", href: "/fares" },
            { label: "Book online", href: bookingUrl, external: bookingExternal },
            { label: "Cancellation policy", href: "/cancellation" },
          ],
        },
      ],
    },
    {
      id: "book",
      label: "Book",
      columns: [
        {
          links: [
            { label: "Book online", href: bookingUrl, external: bookingExternal },
            { label: "View fares", href: "/fares" },
            { label: "Cancellation policy", href: "/cancellation" },
          ],
        },
      ],
    },
    {
      id: "company",
      label: "Company",
      columns: [
        {
          links: [
            { label: "About Sparkride", href: "/#sustainability" },
            { label: "Sustainability", href: "/#sustainability" },
            { label: "Contact", href: "mailto:info@sparkride.co.uk", external: true },
          ],
        },
      ],
    },
    {
      id: "support",
      label: "Support",
      columns: [
        {
          links: [
            { label: "FAQs", href: "/#how-it-works" },
            { label: "Contact us", href: "mailto:info@sparkride.co.uk", external: true },
            { label: "Cancellation policy", href: "/cancellation" },
          ],
        },
      ],
    },
  ];
}

type SidebarItem = {
  id: string;
  href: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  iconBg: string;
  iconColor: string;
  external?: boolean;
};

function buildSidebarItems(bookingUrl: string): SidebarItem[] {
  return [
    {
      id: "book",
      href: bookingUrl,
      icon: Plane,
      title: "Book a transfer",
      desc: "Airport pickups & drop-offs",
      iconBg: "bg-brand/15",
      iconColor: "text-brand",
      external: isExternalBookingUrl(bookingUrl),
    },
    {
      id: "fares",
      href: "/fares",
      icon: PoundSterling,
      title: "Fares",
      desc: "Fixed prices to major hubs",
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-600",
    },
    {
      id: "cancellation",
      href: "/cancellation",
      icon: FileText,
      title: "Cancellation policy",
      desc: "How refunds work",
      iconBg: "bg-violet-500/15",
      iconColor: "text-violet-600",
    },
    {
      id: "support",
      href: "mailto:info@sparkride.co.uk",
      icon: HelpCircle,
      title: "Contact support",
      desc: "We're here to help",
      iconBg: "bg-sky-500/15",
      iconColor: "text-sky-600",
      external: true,
    },
  ];
}

type MegaMenuProps = {
  onClose: () => void;
};

export function MegaMenu({ onClose }: MegaMenuProps) {
  const bookingUrl = getBookingUrl();
  const navTabs = buildNavTabs(bookingUrl);
  const sidebarItems = buildSidebarItems(bookingUrl);
  const [activeTab, setActiveTab] = useState(navTabs[0].id);
  const active = navTabs.find((t) => t.id === activeTab) ?? navTabs[0];

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="overflow-hidden border-t border-gray-200/80 dark:border-white/10 max-sm:max-h-[calc(100dvh-3.5rem)]"
    >
      <div className="bg-white dark:bg-dark pb-4 sm:pb-6 max-sm:overflow-y-auto max-sm:max-h-[calc(100dvh-3.5rem)]">
        <motion.div
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-5"
        >
          <div className="grid lg:grid-cols-[1fr_300px] gap-3 sm:gap-4">
            <div className="bg-booking-bg dark:bg-dark-elevated rounded-2xl p-3 sm:p-6 shadow-sm">
              <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200/60 dark:border-white/10">
                {navTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium tracking-[-0.01em] transition-all ${
                      activeTab === tab.id
                        ? "bg-white dark:bg-dark text-dark dark:text-white shadow-sm"
                        : "text-muted hover:text-dark dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
                >
                  {active.columns.map((col, i) => (
                    <div key={i}>
                      {col.title && (
                        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
                          {col.title}
                        </p>
                      )}
                      <ul className="space-y-2 sm:space-y-2.5">
                        {col.links.map((link) => (
                          <li key={link.label}>
                            {link.external ? (
                              <a
                                href={link.href}
                                onClick={onClose}
                                className="text-xs sm:text-sm font-medium text-dark/80 dark:text-gray-200 hover:text-brand dark:hover:text-brand-end tracking-[-0.01em] transition-colors"
                                target={link.href.startsWith("http") ? "_blank" : undefined}
                                rel={
                                  link.href.startsWith("http")
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                              >
                                {link.label}
                              </a>
                            ) : (
                              <Link
                                href={link.href}
                                onClick={onClose}
                                className="text-xs sm:text-sm font-medium text-dark/80 dark:text-gray-200 hover:text-brand dark:hover:text-brand-end tracking-[-0.01em] transition-colors"
                              >
                                {link.label}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="hidden lg:block bg-[#e8eaee] dark:bg-dark-elevated/80 rounded-2xl p-3 sm:p-4 shadow-sm">
              <ul className="space-y-1">
                {sidebarItems.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + i * 0.04 }}
                  >
                    {item.external ? (
                      <a
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl hover:bg-white/60 dark:hover:bg-white/5 transition-colors group"
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          item.href.startsWith("http") ? "noopener noreferrer" : undefined
                        }
                      >
                        <SidebarItemContent item={item} />
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl hover:bg-white/60 dark:hover:bg-white/5 transition-colors group"
                      >
                        <SidebarItemContent item={item} />
                      </Link>
                    )}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 lg:hidden">
            {sidebarItems.map((item) =>
              item.external ? (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-xl border border-black/8 dark:border-white/10 bg-booking-bg dark:bg-dark-elevated px-3 py-2.5 text-xs font-medium text-dark dark:text-white"
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${item.iconColor}`} />
                  <span className="truncate">{item.title}</span>
                </a>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-xl border border-black/8 dark:border-white/10 bg-booking-bg dark:bg-dark-elevated px-3 py-2.5 text-xs font-medium text-dark dark:text-white"
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${item.iconColor}`} />
                  <span className="truncate">{item.title}</span>
                </Link>
              )
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-4 sm:mt-6 pt-4 sm:pt-5 hidden sm:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-muted"
          >
            <div className="flex flex-wrap items-center gap-4">
              <span>© {new Date().getFullYear()} Sparkride Airport Transfers</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SidebarItemContent({ item }: { item: SidebarItem }) {
  return (
    <>
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}
      >
        <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs sm:text-sm font-medium text-dark dark:text-white tracking-[-0.01em]">
          {item.title}
        </div>
        <div className="text-xs text-muted tracking-[-0.01em] truncate">{item.desc}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted group-hover:text-brand transition-colors shrink-0" />
    </>
  );
}
