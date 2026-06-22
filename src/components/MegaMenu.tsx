"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Plane,
  Car,
  Building2,
  HelpCircle,
  Briefcase,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AccountMegaPanel } from "./customer/AccountMegaPanel";

type NavTab = {
  id: string;
  label: string;
  columns: { title?: string; links: { label: string; href: string }[] }[];
};

const NAV_TABS: NavTab[] = [
  {
    id: "services",
    label: "Services",
    columns: [
      {
        links: [
          { label: "Airport transfers", href: "/book" },
          { label: "Return journeys", href: "/book" },
          { label: "Pre-booked hire", href: "/book" },
          { label: "Corporate travel", href: "/corporate" },
        ],
      },
      {
        links: [
          { label: "Leeds Bradford", href: "/airports/leeds-bradford" },
          { label: "Manchester", href: "/airports/manchester" },
          { label: "Heathrow", href: "/airports/heathrow" },
          { label: "View all airports", href: "/#airports" },
        ],
      },
      {
        links: [
          { label: "Saloon & estate", href: "/fleet" },
          { label: "MPV & executive", href: "/fleet" },
          { label: "Wheelchair access", href: "/accessibility" },
          { label: "Child seats", href: "/extras" },
        ],
      },
      {
        links: [
          { label: "Instant quotes", href: "/book" },
          { label: "Fixed pricing", href: "/pricing" },
          { label: "Track your booking", href: "/track" },
          { label: "FAQs", href: "/faq" },
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
          { label: "Book online", href: "/book" },
          { label: "Single journey", href: "/book" },
          { label: "Return journey", href: "/book" },
          { label: "Manage booking", href: "/manage" },
        ],
      },
      {
        links: [
          { label: "Get a quote", href: "/book" },
          { label: "Payment options", href: "/payments" },
          { label: "Cancellation policy", href: "/cancellation" },
          { label: "Special requests", href: "/extras" },
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
          { label: "About Sparkride", href: "/about" },
          { label: "Our story", href: "/about" },
          { label: "Careers", href: "/careers" },
          { label: "Press", href: "/press" },
        ],
      },
      {
        links: [
          { label: "Safety", href: "/safety" },
          { label: "Licensed drivers", href: "/safety" },
          { label: "Sustainability", href: "/sustainability" },
          { label: "Community", href: "/community" },
        ],
      },
    ],
  },
  {
    id: "airports",
    label: "Airports",
    columns: [
      {
        title: "Yorkshire & North",
        links: [
          { label: "Leeds Bradford (LBA)", href: "/airports/leeds-bradford" },
          { label: "Manchester (MAN)", href: "/airports/manchester" },
          { label: "Newcastle (NCL)", href: "/airports/newcastle" },
        ],
      },
      {
        title: "London",
        links: [
          { label: "Heathrow (LHR)", href: "/airports/heathrow" },
          { label: "Gatwick (LGW)", href: "/airports/gatwick" },
          { label: "Stansted (STN)", href: "/airports/stansted" },
        ],
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    columns: [],
  },
  {
    id: "support",
    label: "Support",
    columns: [
      {
        links: [
          { label: "Help centre", href: "/help" },
          { label: "Contact us", href: "/contact" },
          { label: "Lost property", href: "/lost-property" },
          { label: "Complaints", href: "/complaints" },
        ],
      },
      {
        links: [
          { label: "Driver support", href: "/driver/login" },
          { label: "Business accounts", href: "/corporate" },
          { label: "Accessibility", href: "/accessibility" },
          { label: "Terms & conditions", href: "/terms" },
        ],
      },
    ],
  },
];

const SIDEBAR_ITEMS: {
  href: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    href: "/book",
    icon: Plane,
    title: "Book a transfer",
    desc: "Airport pickups & drop-offs",
    iconBg: "bg-brand/15",
    iconColor: "text-brand",
  },
  {
    href: "/drive",
    icon: Car,
    title: "Become a driver",
    desc: "Earn on your own schedule",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-600",
  },
  {
    href: "/corporate",
    icon: Building2,
    title: "Business travel",
    desc: "Accounts for your team",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-600",
  },
  {
    href: "/driver/login",
    icon: Briefcase,
    title: "Driver portal",
    desc: "Manage your bookings",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-600",
  },
  {
    href: "/help",
    icon: HelpCircle,
    title: "Get support",
    desc: "We're here to help 24/7",
    iconBg: "bg-sky-500/15",
    iconColor: "text-sky-600",
  },
];

type MegaMenuProps = {
  onClose: () => void;
};

export function MegaMenu({ onClose }: MegaMenuProps) {
  const [activeTab, setActiveTab] = useState(NAV_TABS[0].id);
  const active = NAV_TABS.find((t) => t.id === activeTab) ?? NAV_TABS[0];

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="overflow-hidden border-t border-gray-200/80 dark:border-white/10"
    >
      <div className="bg-white dark:bg-dark pb-6">
        <motion.div
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 pt-5"
        >
          <div className="grid lg:grid-cols-[1fr_300px] gap-4">
            {/* Main panel */}
            <div className="bg-booking-bg dark:bg-dark-elevated rounded-2xl p-5 sm:p-6 shadow-sm">
              {/* Tab row */}
              <div className="flex flex-wrap gap-1.5 mb-6 pb-4 border-b border-gray-200/60 dark:border-white/10">
                {NAV_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium tracking-[-0.01em] transition-all ${
                      activeTab === tab.id
                        ? "bg-white dark:bg-dark text-dark dark:text-white shadow-sm"
                        : "text-muted hover:text-dark dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Link columns */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className={
                    activeTab === "account"
                      ? ""
                      : "grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
                  }
                >
                  {activeTab === "account" ? (
                    <AccountMegaPanel onClose={onClose} />
                  ) : (
                    active.columns.map((col, i) => (
                      <div key={i}>
                        {col.title && (
                          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
                            {col.title}
                          </p>
                        )}
                        <ul className="space-y-2.5">
                          {col.links.map((link) => (
                            <li key={link.label}>
                              <Link
                                href={link.href}
                                onClick={onClose}
                                className="text-sm font-medium text-dark/80 dark:text-gray-200 hover:text-brand dark:hover:text-brand-end tracking-[-0.01em] transition-colors"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <div className="bg-[#e8eaee] dark:bg-dark-elevated/80 rounded-2xl p-4 shadow-sm">
              <ul className="space-y-1">
                {SIDEBAR_ITEMS.map((item, i) => (
                  <motion.li
                    key={item.href + item.title}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + i * 0.04 }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/60 dark:hover:bg-white/5 transition-colors group"
                    >
                      <div
                        className={`w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}
                      >
                        <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-dark dark:text-white tracking-[-0.01em]">
                          {item.title}
                        </div>
                        <div className="text-xs text-muted tracking-[-0.01em] truncate">
                          {item.desc}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted group-hover:text-brand transition-colors shrink-0" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-6 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-muted"
          >
            <div className="flex items-center gap-4">
              <Link href="/social/facebook" onClick={onClose} className="hover:text-dark dark:hover:text-white transition-colors">
                Facebook
              </Link>
              <Link href="/social/instagram" onClick={onClose} className="hover:text-dark dark:hover:text-white transition-colors">
                Instagram
              </Link>
              <Link href="/social/linkedin" onClick={onClose} className="hover:text-dark dark:hover:text-white transition-colors">
                LinkedIn
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/terms" onClick={onClose} className="hover:text-dark dark:hover:text-white transition-colors">
                Terms &amp; Conditions
              </Link>
              <Link href="/privacy" onClick={onClose} className="hover:text-dark dark:hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/cookies" onClick={onClose} className="hover:text-dark dark:hover:text-white transition-colors">
                Cookies
              </Link>
              <span>© {new Date().getFullYear()} Sparkride Airport Transfers</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
