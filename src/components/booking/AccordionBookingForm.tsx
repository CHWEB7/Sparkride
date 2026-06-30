"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  ArrowRight,
  Car,
  Clock,
  CreditCard,
  Loader2,
  Plane,
  Ship,
} from "lucide-react";
import { estimatePrice } from "@/lib/airports";
import {
  formatHubLabel,
  getDefaultHubCode,
  getDirectionOptions,
  getHub,
  getHubList,
  getHubPickerLabel,
  getServiceLabel,
  isHubTransfer,
  normalizeServiceType,
  PORT_TRANSFER,
} from "@/lib/hubs";
import { AddressFinder } from "@/components/AddressFinder";
import { BookingDateTimePicker } from "@/components/booking/BookingDateTimePicker";
import { PartySizePicker } from "@/components/booking/PartySizePicker";
import { TimePeriodScroller } from "@/components/booking/TimePeriodScroller";
import { FLIGHT_TIME_PERIODS } from "@/components/booking/time-slot-groups";
import { getAirportTerminals } from "@/lib/airport-terminals";
import { BookingAccordionSection } from "@/components/booking/BookingAccordionSection";
import { BookingAccountPanel } from "@/components/booking/BookingAccountPanel";
import {
  BookingSectionError,
  BookingSectionNextButton,
} from "@/components/booking/BookingSectionNextButton";
import { buildBookingReviewSections } from "@/components/booking/BookingReviewSummary";
import {
  squareButtonPrimaryClass,
  squareButtonSecondaryClass,
  squareCardActiveClass,
  squareCardClass,
  squareInputClass,
  squareLabelClass,
  squareSelectClass,
} from "@/components/booking/booking-square-styles";
import type { CustomerProfile } from "@/lib/customer";

const DRAFT_STORAGE_KEY = "sparkride-booking-draft";

const ALL_SECTIONS = [
  { id: "trip", title: "Choose your trip", subtitle: "Journey type and service" },
  { id: "route", title: "Route", subtitle: "Pickup and destination" },
  { id: "schedule", title: "Pickup date and time", subtitle: "When your driver collects you" },
  { id: "party", title: "Passengers", subtitle: "Party size and luggage" },
  {
    id: "flight",
    title: "Flight information",
    subtitle: "Flight number, departure time, and terminal",
  },
  { id: "driver", title: "Driver", subtitle: "Choose your driver" },
  { id: "account", title: "Account", subtitle: "Sign in or create an account" },
  { id: "details", title: "Confirm your details", subtitle: "Review your contact information" },
  { id: "review", title: "Review your booking", subtitle: "Check everything before payment" },
  { id: "payment", title: "Payment", subtitle: "Secure your trip or save for later" },
] as const;

const SECTIONS_WITH_NEXT = new Set<SectionId>([
  "trip",
  "route",
  "schedule",
  "party",
  "flight",
  "driver",
  "details",
  "review",
]);

type SectionId = (typeof ALL_SECTIONS)[number]["id"];

function isFlightSectionRequired(serviceType: string): boolean {
  return serviceType === "AIRPORT_TRANSFER";
}

type BookableDriver = {
  id: string;
  name: string;
  vehicleLabel: string;
  vehicleType: string;
  maxSeats: number;
};

type FormState = {
  journeyType: string;
  serviceType: string;
  tripType: string;
  airportCode: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  passengers: number;
  luggage: number;
  vehicleType: string;
  driverId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  flightNumber: string;
  flightDepartureTime: string;
  flightTerminal: string;
  returnFlightNumber: string;
  returnFlightDepartureTime: string;
  returnFlightTerminal: string;
  notes: string;
};

const DEFAULT_FORM: FormState = {
  journeyType: "",
  serviceType: "",
  tripType: "TO_AIRPORT",
  airportCode: "LBA",
  pickupAddress: "",
  dropoffAddress: "",
  pickupDate: "",
  pickupTime: "",
  returnDate: "",
  returnTime: "",
  passengers: 1,
  luggage: 1,
  vehicleType: "SALOON",
  driverId: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  flightNumber: "",
  flightDepartureTime: "",
  flightTerminal: "",
  returnFlightNumber: "",
  returnFlightDepartureTime: "",
  returnFlightTerminal: "",
  notes: "",
};

type AccordionBookingFormProps = {
  profile: CustomerProfile | null;
  onProfileChange?: (profile: CustomerProfile | null) => void;
};

export function AccordionBookingForm({ profile, onProfileChange }: AccordionBookingFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => ({
    ...DEFAULT_FORM,
    customerName: profile?.name ?? "",
    customerEmail: profile?.email ?? "",
    customerPhone: profile?.phone ?? "",
  }));
  const [authProfile, setAuthProfile] = useState<CustomerProfile | null>(profile);
  const [openSection, setOpenSection] = useState<SectionId>("trip");
  const [scrollTarget, setScrollTarget] = useState<SectionId | null>(null);
  const [scheduleLeg, setScheduleLeg] = useState<"outbound" | "return">("outbound");
  const [flightLeg, setFlightLeg] = useState<"outbound" | "return">("outbound");
  const [drivers, setDrivers] = useState<BookableDriver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmedSections, setConfirmedSections] = useState<Set<SectionId>>(() =>
    profile ? new Set(["account"]) : new Set()
  );
  const [accountLocked, setAccountLocked] = useState(() => Boolean(profile));
  const [sectionError, setSectionError] = useState("");

  useEffect(() => {
    setAuthProfile(profile);
    if (profile) {
      setAccountLocked(true);
      setConfirmedSections((prev) => new Set([...prev, "account"]));
      setForm((prev) => ({
        ...prev,
        customerName: prev.customerName || profile.name || "",
        customerEmail: profile.email,
        customerPhone: prev.customerPhone || profile.phone || "",
      }));
    }
  }, [profile]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as Partial<FormState>;
      setForm((prev) => ({ ...prev, ...draft }));
    } catch {
      // ignore invalid draft
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
    } catch {
      // ignore storage errors
    }
  }, [form]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (form.pickupDate && form.pickupTime) {
      params.set("pickupDate", form.pickupDate);
      params.set("pickupTime", form.pickupTime);
      if (form.journeyType === "RETURN" && form.returnDate && form.returnTime) {
        params.set("returnDate", form.returnDate);
        params.set("returnTime", form.returnTime);
      }
    }

    const query = params.toString();
    fetch(`/api/drivers${query ? `?${query}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setDrivers(data);
        setForm((prev) => {
          if (prev.driverId && !data.some((d: BookableDriver) => d.id === prev.driverId)) {
            return { ...prev, driverId: "" };
          }
          return prev;
        });
      })
      .catch(() => {});
  }, [
    form.pickupDate,
    form.pickupTime,
    form.returnDate,
    form.returnTime,
    form.journeyType,
  ]);

  const isReturn = form.journeyType === "RETURN";
  const isHubTransferType = isHubTransfer(form.serviceType);
  const isAirportTransfer = form.serviceType === "AIRPORT_TRANSFER";
  const visibleSections = useMemo(
    () =>
      ALL_SECTIONS.filter(
        (section) => section.id !== "flight" || isFlightSectionRequired(form.serviceType)
      ),
    [form.serviceType]
  );
  const airportTerminals = useMemo(
    () => getAirportTerminals(form.airportCode),
    [form.airportCode]
  );
  const hubList = isHubTransferType ? getHubList(form.serviceType) : [];
  const selectedHub = isHubTransferType ? getHub(form.airportCode, form.serviceType) : undefined;
  const selectedDriver = drivers.find((d) => d.id === form.driverId);
  const priceVehicleType = selectedDriver?.vehicleType ?? form.vehicleType;
  const price =
    form.journeyType && form.serviceType
      ? estimatePrice(
          priceVehicleType,
          form.tripType,
          form.journeyType,
          form.serviceType,
          form.airportCode
        )
      : 0;

  const validateSectionFields = useCallback(
    (sectionId: SectionId): string | null => {
      switch (sectionId) {
        case "trip":
          if (!form.journeyType) return "Please choose a journey type";
          if (!form.serviceType) return "Please choose a service";
          if (form.journeyType === "SINGLE" && isHubTransfer(form.serviceType) && !form.tripType) {
            return "Please choose a direction";
          }
          return null;
        case "route":
          if (!form.pickupAddress.trim() || form.pickupAddress.trim().length < 3) {
            return "Please enter a complete pickup address";
          }
          if (!isReturn && (!form.dropoffAddress.trim() || form.dropoffAddress.trim().length < 3)) {
            return "Please enter a complete drop-off address";
          }
          return null;
        case "schedule":
          if (!form.pickupDate) return "Please select your pickup date";
          if (!form.pickupTime) return "Please select your pickup time";
          if (isReturn && !form.returnDate) return "Please select your return date";
          if (isReturn && !form.returnTime) return "Please select your return time";
          if (isReturn && form.returnDate < form.pickupDate) {
            return "Return date must be on or after outbound date";
          }
          return null;
        case "flight":
          if (!isFlightSectionRequired(form.serviceType)) return null;
          if (!form.flightNumber.trim()) return "Flight number is required";
          if (!form.flightDepartureTime) return "Flight departure time is required";
          if (!form.flightTerminal) return "Please select a terminal";
          if (isReturn) {
            if (!form.returnFlightNumber.trim()) return "Return flight number is required";
            if (!form.returnFlightDepartureTime) return "Return flight departure time is required";
            if (!form.returnFlightTerminal) return "Please select a return terminal";
          }
          return null;
        case "party":
          if (form.passengers < 1) return "At least one passenger is required";
          return null;
        case "driver":
          if (!form.driverId) return "Please select a driver";
          return null;
        case "account":
          if (!authProfile) return "Please sign in or create an account";
          return null;
        case "details":
          if (!form.customerName.trim() || form.customerName.trim().length < 2) {
            return "Name is required";
          }
          if (!form.customerPhone.trim() || form.customerPhone.trim().length < 10) {
            return "A valid phone number is required";
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim())) {
            return "A valid email is required";
          }
          return null;
        case "review":
          return null;
        default:
          return null;
      }
    },
    [form, isReturn, authProfile]
  );

  const isSectionConfirmed = useCallback(
    (sectionId: SectionId): boolean => {
      if (sectionId === "account") {
        return Boolean(authProfile) && accountLocked;
      }
      if (sectionId === "payment") return false;
      return confirmedSections.has(sectionId);
    },
    [authProfile, accountLocked, confirmedSections]
  );

  const sectionComplete = useCallback(
    (sectionId: SectionId): boolean => {
      if (sectionId === "payment") return false;
      if (!isSectionConfirmed(sectionId)) return false;
      return validateSectionFields(sectionId) === null;
    },
    [isSectionConfirmed, validateSectionFields]
  );

  const sectionUnlocked = useCallback(
    (sectionId: SectionId): boolean => {
      if (sectionId === "details" && !authProfile) return false;
      const index = visibleSections.findIndex((s) => s.id === sectionId);
      if (index <= 0) return true;
      for (let i = 0; i < index; i++) {
        if (!sectionComplete(visibleSections[i].id)) return false;
      }
      return true;
    },
    [sectionComplete, authProfile, visibleSections]
  );

  function advanceToSection(nextId: SectionId) {
    setOpenSection(nextId);
    setScrollTarget(nextId);
  }

  function goToNextSection(currentId: SectionId) {
    const currentIndex = visibleSections.findIndex((s) => s.id === currentId);
    const next = visibleSections[currentIndex + 1];
    if (next) advanceToSection(next.id);
  }

  function confirmSection(sectionId: SectionId) {
    const err = validateSectionFields(sectionId);
    if (err) {
      setSectionError(err);
      return;
    }
    setSectionError("");
    setConfirmedSections((prev) => new Set([...prev, sectionId]));
    goToNextSection(sectionId);
  }

  const reviewSections = useMemo(
    () =>
      buildBookingReviewSections(
        {
          ...form,
          estimatedPrice: price,
        },
        {
          isAirportTransfer,
          driverName: selectedDriver?.name,
        }
      ),
    [form, price, isAirportTransfer, selectedDriver?.name]
  );

  function update(field: keyof FormState, value: string | number) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "journeyType" && value === "RETURN") next.tripType = "TO_AIRPORT";
      if (field === "airportCode" || field === "journeyType" || field === "tripType") {
        if (isHubTransfer(next.serviceType)) {
          const hub = getHub(
            field === "airportCode" ? String(value) : next.airportCode,
            next.serviceType
          );
          if (hub) {
            const hubLabel = formatHubLabel(hub, next.serviceType);
            if (next.journeyType === "RETURN" || next.tripType === "TO_AIRPORT") {
              next.dropoffAddress = hubLabel;
            }
          }
        }
        if (field === "airportCode") {
          next.flightTerminal = "";
          next.returnFlightTerminal = "";
        }
      }
      return next;
    });
    setError("");
    setSectionError("");
    setConfirmedSections((prev) => {
      const next = new Set(prev);
      next.delete("review");
      return next;
    });
  }

  function handleHomeAddress(value: string) {
    setForm((prev) => {
      if (!isHubTransfer(prev.serviceType)) {
        return { ...prev, pickupAddress: value };
      }
      const hub = getHub(prev.airportCode, prev.serviceType);
      const hubLabel = hub ? formatHubLabel(hub, prev.serviceType) : "";
      return { ...prev, pickupAddress: value, dropoffAddress: hubLabel };
    });
  }

  function selectService(value: string) {
    const hubCode = getDefaultHubCode(value);
    const hub = getHub(hubCode, value);
    setForm((prev) => ({
      ...prev,
      serviceType: value,
      airportCode: hubCode,
      tripType: "TO_AIRPORT",
      pickupAddress: "",
      dropoffAddress: hub && isHubTransfer(value) ? formatHubLabel(hub, value) : "",
    }));
  }

  function handleAuthenticated(nextProfile: CustomerProfile) {
    setAuthProfile(nextProfile);
    onProfileChange?.(nextProfile);
    setAccountLocked(true);
    setForm((prev) => ({
      ...prev,
      customerName: nextProfile.name || "",
      customerEmail: nextProfile.email,
      customerPhone: nextProfile.phone || "",
    }));
    setConfirmedSections((prev) => {
      const next = new Set(prev);
      next.add("account");
      next.delete("details");
      next.delete("review");
      return next;
    });
    setSectionError("");
    advanceToSection("details");
  }

  async function submitBooking(mode: "save" | "pay") {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const hub = isHubTransfer(form.serviceType)
        ? getHub(form.airportCode, form.serviceType)
        : null;
      const hubLabel = hub ? formatHubLabel(hub, form.serviceType) : "";
      const storedServiceType = normalizeServiceType(form.serviceType, form.airportCode);
      const payload = {
        ...form,
        serviceType: storedServiceType,
        ...(form.journeyType === "RETURN" && isHubTransfer(form.serviceType)
          ? { tripType: "TO_AIRPORT", dropoffAddress: hubLabel || form.dropoffAddress }
          : {}),
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      localStorage.removeItem(DRAFT_STORAGE_KEY);

      if (mode === "pay") {
        router.push(`/booking/${data.reference}`);
        return;
      }

      setSuccessMessage(
        `Booking ${data.reference} saved. You can pay when your driver confirms — find it in My bookings.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const optionCard = (active: boolean) =>
    `${squareCardClass} p-5 ${active ? squareCardActiveClass : "hover:border-brand/40"}`;

  function renderSectionFooter(sectionId: SectionId, label = "Next") {
    if (!SECTIONS_WITH_NEXT.has(sectionId)) return null;
    return (
      <>
        <BookingSectionError
          message={sectionError && openSection === sectionId ? sectionError : undefined}
        />
        <BookingSectionNextButton label={label} onClick={() => confirmSection(sectionId)} />
      </>
    );
  }

  return (
    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
      <div className="min-w-0 space-y-3">
        {error && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        {visibleSections.map((section, index) => (
          <BookingAccordionSection
            key={section.id}
            id={`booking-section-${section.id}`}
            step={index + 1}
            title={section.title}
            subtitle={section.subtitle}
            open={
              section.id === "account" && accountLocked
                ? false
                : openSection === section.id
            }
            unlocked={sectionUnlocked(section.id)}
            complete={sectionComplete(section.id)}
            locked={section.id === "account" && accountLocked}
            scrollIntoView={scrollTarget === section.id}
            onToggle={() => {
              if (!sectionUnlocked(section.id)) return;
              if (section.id === "account" && accountLocked) return;
              setOpenSection(section.id);
              setScrollTarget(null);
            }}
          >
            {section.id === "trip" && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Journey type
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        value: "SINGLE",
                        label: "Single journey",
                        desc: "One-way transfer",
                        icon: ArrowRight,
                      },
                      {
                        value: "RETURN",
                        label: "Return journey",
                        desc: "Outbound and return",
                        icon: ArrowLeftRight,
                      },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => update("journeyType", opt.value)}
                        className={optionCard(form.journeyType === opt.value)}
                      >
                        <opt.icon className="mb-3 h-7 w-7 text-brand" />
                        <div className="font-semibold dark:text-white">{opt.label}</div>
                        <div className="mt-1 text-sm text-muted">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {form.journeyType && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Service
                    </h3>
                    <div className="grid gap-3">
                      {[
                        {
                          value: "AIRPORT_TRANSFER",
                          label: "Airport transfer",
                          desc: "To or from a UK airport",
                          icon: Plane,
                        },
                        {
                          value: PORT_TRANSFER,
                          label: "Ferry & cruise ports",
                          desc: "Ferry and cruise terminals",
                          icon: Ship,
                        },
                        {
                          value: "PRE_BOOKED",
                          label: "Pre-booked journey",
                          desc: "Private hire for any destination",
                          icon: Clock,
                        },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => selectService(opt.value)}
                          className={optionCard(form.serviceType === opt.value)}
                        >
                          <opt.icon className="mb-3 h-7 w-7 text-brand" />
                          <div className="font-semibold dark:text-white">{opt.label}</div>
                          <div className="mt-1 text-sm text-muted">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {form.journeyType === "SINGLE" && isHubTransferType && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Direction
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {getDirectionOptions(form.serviceType).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => update("tripType", opt.value)}
                          className={optionCard(form.tripType === opt.value)}
                        >
                          <div className="font-semibold dark:text-white">{opt.label}</div>
                          <div className="mt-1 text-sm text-muted">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {renderSectionFooter("trip")}
              </div>
            )}

            {section.id === "route" && (
              <div className="space-y-4">
                {isHubTransferType && (
                  <div>
                    <label className={squareLabelClass}>{getHubPickerLabel(form.serviceType)}</label>
                    <select
                      value={form.airportCode}
                      onChange={(e) => update("airportCode", e.target.value)}
                      className={squareSelectClass}
                    >
                      {hubList.map((hub) => (
                        <option key={hub.code} value={hub.code}>
                          {hub.name} ({hub.code}) — {hub.city}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {isReturn && isHubTransferType ? (
                  <AddressFinder
                    label="Home / pickup address"
                    value={form.pickupAddress}
                    onChange={handleHomeAddress}
                    hint={`Outbound: home → ${selectedHub?.name}. Return: ${selectedHub?.name} → home.`}
                    inputClass={squareInputClass}
                    labelClass={squareLabelClass}
                  />
                ) : (
                  <>
                    <AddressFinder
                      label="Pickup address"
                      value={form.pickupAddress}
                      onChange={(value) => update("pickupAddress", value)}
                      inputClass={squareInputClass}
                      labelClass={squareLabelClass}
                    />
                    <AddressFinder
                      label="Drop-off address"
                      value={form.dropoffAddress}
                      onChange={(value) => update("dropoffAddress", value)}
                      inputClass={squareInputClass}
                      labelClass={squareLabelClass}
                    />
                  </>
                )}

                {renderSectionFooter("route")}
              </div>
            )}

            {section.id === "schedule" && (
              <div className="min-w-0 max-w-full overflow-hidden">
                {isReturn && (
                  <div className="mb-4 flex gap-2">
                    {(["outbound", "return"] as const).map((leg) => (
                      <button
                        key={leg}
                        type="button"
                        onClick={() => setScheduleLeg(leg)}
                        className={`px-4 py-2 text-sm font-medium ${
                          scheduleLeg === leg
                            ? "bg-brand text-white"
                            : "border border-gray-300 bg-white text-gray-600 dark:border-white/15 dark:bg-dark dark:text-gray-300"
                        }`}
                      >
                        {leg === "outbound" ? "Outbound" : "Return"}
                      </button>
                    ))}
                  </div>
                )}

                <BookingDateTimePicker
                  title="Select pickup date and time"
                  square
                  date={scheduleLeg === "return" ? form.returnDate : form.pickupDate}
                  time={scheduleLeg === "return" ? form.returnTime : form.pickupTime}
                  minDate={scheduleLeg === "return" ? form.pickupDate || undefined : undefined}
                  onDateChange={(dateKey) =>
                    update(scheduleLeg === "return" ? "returnDate" : "pickupDate", dateKey)
                  }
                  onTimeChange={(time) =>
                    update(scheduleLeg === "return" ? "returnTime" : "pickupTime", time)
                  }
                />
                {renderSectionFooter("schedule")}
              </div>
            )}

            {section.id === "party" && (
              <div>
                <PartySizePicker
                passengers={form.passengers}
                luggage={form.luggage}
                onPassengersChange={(value) => update("passengers", value)}
                  onLuggageChange={(value) => update("luggage", value)}
                />
                {renderSectionFooter("party")}
              </div>
            )}

            {section.id === "flight" && isAirportTransfer && (
              <div className="min-w-0 max-w-full space-y-5 overflow-hidden">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Help your driver meet you at the right terminal. These details are for your
                  flight — separate from your pickup time above.
                </p>

                {isReturn && (
                  <div className="flex gap-2">
                    {(["outbound", "return"] as const).map((leg) => (
                      <button
                        key={leg}
                        type="button"
                        onClick={() => setFlightLeg(leg)}
                        className={`px-4 py-2 text-sm font-medium ${
                          flightLeg === leg
                            ? "bg-brand text-white"
                            : "border border-gray-300 bg-white text-gray-600 dark:border-white/15 dark:bg-dark dark:text-gray-300"
                        }`}
                      >
                        {leg === "outbound" ? "Outbound flight" : "Return flight"}
                      </button>
                    ))}
                  </div>
                )}

                {(!isReturn || flightLeg === "outbound") && (
                  <div className="space-y-4">
                    <div>
                      <label className={squareLabelClass}>Flight number</label>
                      <input
                        type="text"
                        placeholder="e.g. FR1234"
                        value={form.flightNumber}
                        onChange={(e) => update("flightNumber", e.target.value)}
                        className={squareInputClass}
                      />
                    </div>
                    <div>
                      <label className={squareLabelClass}>Flight departure time</label>
                      <TimePeriodScroller
                        periods={FLIGHT_TIME_PERIODS}
                        value={form.flightDepartureTime}
                        onChange={(time) => update("flightDepartureTime", time)}
                        square
                      />
                    </div>
                    <div>
                      <label className={squareLabelClass}>
                        Terminal at {selectedHub?.name ?? "airport"}
                      </label>
                      <select
                        value={form.flightTerminal}
                        onChange={(e) => update("flightTerminal", e.target.value)}
                        className={squareSelectClass}
                      >
                        <option value="">Select terminal</option>
                        {airportTerminals.map((terminal) => (
                          <option key={terminal.id} value={terminal.id}>
                            {terminal.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {isReturn && flightLeg === "return" && (
                  <div className="space-y-4">
                    <div>
                      <label className={squareLabelClass}>Return flight number</label>
                      <input
                        type="text"
                        placeholder="e.g. FR1234"
                        value={form.returnFlightNumber}
                        onChange={(e) => update("returnFlightNumber", e.target.value)}
                        className={squareInputClass}
                      />
                    </div>
                    <div>
                      <label className={squareLabelClass}>Return flight departure time</label>
                      <TimePeriodScroller
                        periods={FLIGHT_TIME_PERIODS}
                        value={form.returnFlightDepartureTime}
                        onChange={(time) => update("returnFlightDepartureTime", time)}
                        square
                      />
                    </div>
                    <div>
                      <label className={squareLabelClass}>
                        Return terminal at {selectedHub?.name ?? "airport"}
                      </label>
                      <select
                        value={form.returnFlightTerminal}
                        onChange={(e) => update("returnFlightTerminal", e.target.value)}
                        className={squareSelectClass}
                      >
                        <option value="">Select terminal</option>
                        {airportTerminals.map((terminal) => (
                          <option key={terminal.id} value={terminal.id}>
                            {terminal.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {renderSectionFooter("flight")}
              </div>
            )}

            {section.id === "driver" && (
              <div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {drivers.map((driver) => (
                    <button
                      key={driver.id}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          driverId: driver.id,
                          vehicleType: driver.vehicleType,
                        }));
                      }}
                      className={optionCard(form.driverId === driver.id)}
                    >
                      <Car className="mb-3 h-7 w-7 text-brand" />
                      <div className="font-semibold dark:text-white">{driver.name}</div>
                      <div className="mt-1 text-sm text-muted">{driver.vehicleLabel}</div>
                      <div className="mt-1 text-xs font-medium text-brand">
                        Up to {driver.maxSeats} passengers
                      </div>
                    </button>
                  ))}
                </div>
                {drivers.length === 0 && (
                  <p className="text-sm text-muted">
                    {form.pickupDate && form.pickupTime
                      ? "No drivers are available on your selected dates. Try different dates."
                      : "Complete the date and time section first to see available drivers."}
                  </p>
                )}
                {renderSectionFooter("driver")}
              </div>
            )}

            {section.id === "account" && !accountLocked && (
              <BookingAccountPanel onAuthenticated={handleAuthenticated} />
            )}

            {section.id === "details" && authProfile && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We&apos;ve filled in your details from your account. Please review and confirm
                  before continuing to payment.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={squareLabelClass}>Full name</label>
                    <input
                      type="text"
                      required
                      value={form.customerName}
                      onChange={(e) => update("customerName", e.target.value)}
                      className={squareInputClass}
                    />
                  </div>
                  <div>
                    <label className={squareLabelClass}>Phone number</label>
                    <input
                      type="tel"
                      required
                      placeholder="07xxx xxxxxx"
                      value={form.customerPhone}
                      onChange={(e) => update("customerPhone", e.target.value)}
                      className={squareInputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={squareLabelClass}>Email</label>
                  <input
                    type="email"
                    required
                    value={form.customerEmail}
                    disabled
                    className={`${squareInputClass} bg-gray-50 text-gray-500 dark:bg-white/5`}
                  />
                </div>
                <div>
                  <label className={squareLabelClass}>Special requests (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Child seat, wheelchair access, etc."
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    className={squareInputClass}
                  />
                </div>

                {renderSectionFooter("details", "Confirm details")}
              </div>
            )}

            {section.id === "review" && (
              <div className="space-y-5">
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  Please read through your booking summary below. Open any section above if you
                  need to change something, then confirm to continue to payment.
                </p>

                <div className="space-y-4 border border-gray-200 bg-[#fafafa] p-4 dark:border-white/10 dark:bg-white/5 sm:p-5">
                  {reviewSections.map((group) => (
                    <div key={group.title}>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-brand">
                        {group.title}
                      </h4>
                      <ul className="mt-2 space-y-1">
                        {group.lines.map((line) => (
                          <li
                            key={`${group.title}-${line}`}
                            className="text-sm leading-relaxed text-gray-800 dark:text-gray-200"
                          >
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {renderSectionFooter("review", "Confirm booking")}
              </div>
            )}

            {section.id === "payment" && (
              <div>
                {successMessage ? (
                  <div className="border border-brand/30 bg-brand-light/20 px-4 py-4 dark:bg-brand/10">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{successMessage}</p>
                    <a
                      href="/my-bookings"
                      className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
                    >
                      View my bookings
                    </a>
                  </div>
                ) : (
                  <>
                    <div className="mb-5 flex items-start gap-3 border border-gray-200 bg-[#f9fafb] p-4 dark:border-white/10 dark:bg-white/5">
                      <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Estimated fare: £{price}
                        </p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Pay now to secure your trip once your driver confirms, or save the booking
                          to your account and pay later from My bookings.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        disabled={loading || !sectionComplete("review")}
                        onClick={() => submitBooking("pay")}
                        className={squareButtonPrimaryClass}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Pay to secure trip"
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={loading || !sectionComplete("review")}
                        onClick={() => submitBooking("save")}
                        className={squareButtonSecondaryClass}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Save for later"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </BookingAccordionSection>
        ))}
      </div>

      <aside className="border border-gray-300 bg-white p-5 lg:sticky lg:top-20 dark:border-white/15 dark:bg-dark-elevated">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Your quote
        </h3>

        {form.journeyType && form.serviceType ? (
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Journey</span>
              <span className="font-medium dark:text-white">
                {form.journeyType === "RETURN" ? "Return" : "Single"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Service</span>
              <span className="font-medium dark:text-white">
                {getServiceLabel(form.serviceType)}
              </span>
            </div>
            {form.journeyType === "SINGLE" && isHubTransferType && form.tripType && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Direction</span>
                <span className="font-medium dark:text-white">
                  {getDirectionOptions(form.serviceType).find((o) => o.value === form.tripType)
                    ?.label ?? form.tripType}
                </span>
              </div>
            )}
            {selectedHub && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">{getHubPickerLabel(form.serviceType)}</span>
                <span className="font-medium dark:text-white">{selectedHub.code}</span>
              </div>
            )}
            {selectedDriver && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Driver</span>
                <span className="text-right font-medium dark:text-white">
                  {selectedDriver.name}
                </span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-4 dark:border-white/10">
              <div className="text-sm text-gray-500">Estimated total</div>
              <div className="mt-1 text-4xl font-bold text-brand">£{price}</div>
              {isReturn && (
                <div className="mt-1 text-xs text-gray-500">
                  Return fare is double the single journey price
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500">
                Review your quote before creating an account
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">
            Choose your trip type to see pricing.
          </p>
        )}
      </aside>
    </div>
  );
}
