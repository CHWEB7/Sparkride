"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  isPortTransferCategory,
  normalizeServiceType,
  PORT_TRANSFER,
} from "@/lib/hubs";
import { AddressFinder } from "@/components/AddressFinder";
import { BookingDateTimePicker } from "@/components/booking/BookingDateTimePicker";
import { BookingStepBreadcrumb } from "@/components/booking/BookingStepBreadcrumb";
import { PartySizePicker } from "@/components/booking/PartySizePicker";
import {
  ArrowRight,
  ArrowLeftRight,
  Loader2,
  MapPin,
  Plane,
  Ship,
  User,
  Clock,
  Car,
  Users,
  ChevronRight,
} from "lucide-react";

type StepId =
  | "journey"
  | "service"
  | "direction"
  | "route"
  | "schedule"
  | "party"
  | "driver"
  | "contact";

const STEP_META: Record<StepId, { label: string; breadcrumb: string }> = {
  journey: { label: "Journey", breadcrumb: "Journey" },
  service: { label: "Service", breadcrumb: "Service" },
  direction: { label: "Direction", breadcrumb: "Direction" },
  route: { label: "Route", breadcrumb: "Route" },
  schedule: { label: "Schedule", breadcrumb: "Time" },
  party: { label: "Party", breadcrumb: "Party" },
  driver: { label: "Driver", breadcrumb: "Driver" },
  contact: { label: "Details", breadcrumb: "Confirm" },
};

function getSteps(journeyType: string, serviceType: string): StepId[] {
  const steps: StepId[] = ["journey"];
  if (!journeyType) return steps;
  steps.push("service");
  if (!serviceType) return steps;
  if (journeyType === "SINGLE" && isHubTransfer(serviceType)) steps.push("direction");
  steps.push("route", "schedule", "party", "driver", "contact");
  return steps;
}

const MANUAL_CONTINUE_STEPS = new Set<StepId>(["route", "schedule", "party", "contact"]);

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0 }),
};

function StepHeading({
  title,
  subtitle,
  compact = false,
}: {
  title: string;
  subtitle?: string;
  compact?: boolean;
}) {
  if (compact) {
    return <h2 className="text-xl font-semibold tracking-[-0.02em] dark:text-white mb-4">{title}</h2>;
  }

  return (
    <div className="flex items-center gap-3 mb-6 sm:mb-8">
      <div className="w-1 h-8 rounded-full bg-brand-gradient shrink-0" />
      <div>
        <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] dark:text-white">{title}</h2>
        {subtitle && <p className="text-muted font-normal tracking-[-0.01em] mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

import type { CustomerProfile } from "@/lib/customer";

type SavedTemplate = {
  serviceType: string;
  journeyType: string;
  tripType: string;
  airportCode: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  passengers: number;
  luggage: number;
  vehicleType: string;
  driverId: string | null;
  notes: string | null;
};

type BookableDriver = {
  id: string;
  name: string;
  vehicleLabel: string;
  vehicleType: string;
  maxSeats: number;
};

type BookingFormProps = {
  profile?: CustomerProfile | null;
  savedTemplate?: SavedTemplate | null;
  variant?: "page" | "modal";
};

export function BookingForm({ profile, savedTemplate, variant = "modal" }: BookingFormProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNotes, setShowNotes] = useState(Boolean(savedTemplate?.notes));
  const [scheduleLeg, setScheduleLeg] = useState<"outbound" | "return">("outbound");
  const [drivers, setDrivers] = useState<BookableDriver[]>([]);
  const [form, setForm] = useState({
    journeyType: savedTemplate?.journeyType ?? "",
    serviceType: savedTemplate?.serviceType ?? "",
    tripType: savedTemplate?.tripType ?? "TO_AIRPORT",
    airportCode: savedTemplate?.airportCode ?? "LBA",
    pickupAddress: savedTemplate?.pickupAddress ?? "",
    dropoffAddress: savedTemplate?.dropoffAddress ?? "",
    pickupDate: "",
    pickupTime: "",
    returnDate: "",
    returnTime: "",
    passengers: savedTemplate?.passengers ?? 1,
    luggage: savedTemplate?.luggage ?? 1,
    vehicleType: savedTemplate?.vehicleType ?? "SALOON",
    driverId: savedTemplate?.driverId ?? "",
    customerName: profile?.name ?? "",
    customerEmail: profile?.email ?? "",
    customerPhone: profile?.phone ?? "",
    flightNumber: "",
    returnFlightNumber: "",
    notes: savedTemplate?.notes ?? "",
    saveDetails: false,
    savedDetailsLabel: "",
  });

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

  const steps = useMemo(
    () => getSteps(form.journeyType, form.serviceType),
    [form.journeyType, form.serviceType]
  );
  const currentStep = steps[stepIndex] ?? "journey";
  const isReturn = form.journeyType === "RETURN";
  const isHubTransferType = isHubTransfer(form.serviceType);
  const isAirportTransfer = form.serviceType === "AIRPORT_TRANSFER";
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

  function goTo(index: number) {
    setDirection(index > stepIndex ? 1 : -1);
    setStepIndex(index);
    setError("");
  }

  function next() {
    if (stepIndex < steps.length - 1) goTo(stepIndex + 1);
  }

  function back() {
    if (stepIndex > 0) goTo(stepIndex - 1);
  }

  function update(field: string, value: string | number) {
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
      }
      return next;
    });
  }

  function selectJourney(value: string) {
    update("journeyType", value);
    setTimeout(() => {
      setDirection(1);
      setStepIndex(1);
      setError("");
    }, 350);
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
    setTimeout(() => {
      setDirection(1);
      setStepIndex((i) => i + 1);
      setError("");
    }, 350);
  }

  function selectDirection(value: string) {
    update("tripType", value);
    setTimeout(() => {
      setDirection(1);
      setStepIndex((i) => i + 1);
      setError("");
    }, 350);
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

  function validateStep(): string | null {
    switch (currentStep) {
      case "route":
        if (!form.pickupAddress.trim()) return "Pickup address is required";
        if (!isReturn && !form.dropoffAddress.trim()) return "Drop-off address is required";
        return null;
      case "schedule":
        if (!form.pickupDate) return "Please select your pickup date";
        if (!form.pickupTime) return "Please select your pickup time";
        if (isReturn && !form.returnDate) return "Please select your return date";
        if (isReturn && !form.returnTime) return "Please select your return time";
        if (isReturn && form.returnDate < form.pickupDate)
          return "Return date must be on or after outbound date";
        return null;
      case "party":
        if (form.passengers < 1) return "At least one passenger is required";
        return null;
      case "driver":
        if (!form.driverId) return "Please select a driver";
        return null;
      case "contact":
        if (!form.customerName.trim()) return "Name is required";
        if (!form.customerPhone.trim()) return "Phone number is required";
        if (!form.customerEmail.trim()) return "Email is required";
        return null;
      default:
        return null;
    }
  }

  function handleContinue() {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    next();
  }

  function selectDriver(driver: BookableDriver) {
    setForm((prev) => ({
      ...prev,
      driverId: driver.id,
      vehicleType: driver.vehicleType,
    }));
    setTimeout(() => {
      setDirection(1);
      setStepIndex((i) => i + 1);
      setError("");
    }, 350);
  }

  async function handleSubmit() {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError("");

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
      router.push(`/booking/${data.reference}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl border border-gray-200/60 dark:border-white/10 bg-white dark:bg-dark text-dark dark:text-gray-100 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all shadow-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";
  const isModal = variant === "modal";
  const needsContinue = MANUAL_CONTINUE_STEPS.has(currentStep);
  const breadcrumbSteps = steps.map((id) => ({
    id,
    label: STEP_META[id].breadcrumb,
  }));

  const bigCard = (active: boolean) =>
    `relative text-left transition-all duration-200 active:scale-[0.98] ${
      isModal ? "p-4 rounded-xl" : "p-8 lg:p-10 rounded-2xl hover:scale-[1.02]"
    } ${
      active
        ? "bg-brand-light/60 dark:bg-brand/10 shadow-md ring-2 ring-brand/30"
        : "bg-white dark:bg-dark-elevated shadow-sm hover:shadow-md dark:border dark:border-white/10"
    }`;

  const stepContent = (
    <>
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {currentStep === "journey" && (
        <div>
          <StepHeading title="What type of journey?" compact={isModal} />
          <div className={`grid gap-3 ${isModal ? "grid-cols-1" : "sm:grid-cols-2 gap-4 lg:gap-6"}`}>
            {[
              {
                value: "SINGLE",
                label: "Single journey",
                desc: "One-way airport transfer",
                icon: ArrowRight,
              },
              {
                value: "RETURN",
                label: "Return journey",
                desc: "Outbound and return trip",
                icon: ArrowLeftRight,
              },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => selectJourney(opt.value)}
                className={bigCard(form.journeyType === opt.value)}
              >
                <opt.icon className={`${isModal ? "w-7 h-7" : "w-10 h-10"} text-brand mb-3`} />
                <div className={`${isModal ? "text-base" : "text-xl"} font-bold dark:text-white`}>
                  {opt.label}
                </div>
                <div className="text-sm text-muted mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStep === "service" && (
        <div>
          <StepHeading title="What type of booking?" compact={isModal} />
          <div className={`grid gap-3 ${isModal ? "grid-cols-1" : "sm:grid-cols-2 gap-4 lg:gap-6"}`}>
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
                desc: "To or from UK ferry and cruise terminals",
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
                className={bigCard(form.serviceType === opt.value)}
              >
                <opt.icon className={`${isModal ? "w-7 h-7" : "w-10 h-10"} text-brand mb-3`} />
                <div className={`${isModal ? "text-base" : "text-xl"} font-bold dark:text-white`}>
                  {opt.label}
                </div>
                <div className="text-sm text-muted mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStep === "direction" && isHubTransferType && (
        <div>
          <StepHeading title="Which direction?" compact={isModal} />
          <div className={`grid gap-3 ${isModal ? "grid-cols-1" : "sm:grid-cols-2 gap-4 lg:gap-6"}`}>
            {getDirectionOptions(form.serviceType).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => selectDirection(opt.value)}
                className={bigCard(form.tripType === opt.value)}
              >
                {isPortTransferCategory(form.serviceType) ? (
                  <Ship
                    className={`${isModal ? "w-7 h-7" : "w-10 h-10"} text-brand mb-3 ${opt.value === "FROM_AIRPORT" ? "rotate-180" : ""}`}
                  />
                ) : (
                  <Plane
                    className={`${isModal ? "w-7 h-7" : "w-10 h-10"} text-brand mb-3 ${opt.value === "FROM_AIRPORT" ? "rotate-180" : ""}`}
                  />
                )}
                <div className={`${isModal ? "text-base" : "text-xl"} font-bold dark:text-white`}>
                  {opt.label}
                </div>
                <div className="text-sm text-muted mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStep === "route" && (
        <div>
          <StepHeading title="Where are you travelling?" compact={isModal} />
          <div className="space-y-4">
            {isHubTransferType && (
              <div>
                <label className={labelClass}>{getHubPickerLabel(form.serviceType)}</label>
                <select
                  value={form.airportCode}
                  onChange={(e) => update("airportCode", e.target.value)}
                  className={inputClass}
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
                inputClass={inputClass}
                labelClass={labelClass}
              />
            ) : (
              <>
                <AddressFinder
                  label="Pickup address"
                  value={form.pickupAddress}
                  onChange={(value) => update("pickupAddress", value)}
                  inputClass={inputClass}
                  labelClass={labelClass}
                />
                <AddressFinder
                  label="Drop-off address"
                  value={form.dropoffAddress}
                  onChange={(value) => update("dropoffAddress", value)}
                  inputClass={inputClass}
                  labelClass={labelClass}
                />
              </>
            )}
          </div>
        </div>
      )}

      {currentStep === "schedule" && (
        <div className="flex h-full min-h-0 flex-col">
          {isReturn && (
            <div className="mb-4 flex gap-2">
              {(["outbound", "return"] as const).map((leg) => (
                <button
                  key={leg}
                  type="button"
                  onClick={() => setScheduleLeg(leg)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    scheduleLeg === leg
                      ? "bg-brand text-white"
                      : "bg-gray-100 dark:bg-white/5 text-muted hover:text-dark dark:hover:text-white"
                  }`}
                >
                  {leg === "outbound" ? "Outbound" : "Return"}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 min-h-0">
            <BookingDateTimePicker
              title="Select time"
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
          </div>

          {isAirportTransfer && (
            <div className="shrink-0 pt-4 border-t border-gray-200/60 dark:border-white/10 mt-4">
              <label className={labelClass}>
                {scheduleLeg === "return" && isReturn
                  ? "Return flight (optional)"
                  : "Flight number (optional)"}
              </label>
              <input
                type="text"
                placeholder="e.g. FR1234"
                value={scheduleLeg === "return" && isReturn ? form.returnFlightNumber : form.flightNumber}
                onChange={(e) =>
                  update(
                    scheduleLeg === "return" && isReturn ? "returnFlightNumber" : "flightNumber",
                    e.target.value
                  )
                }
                className={inputClass}
              />
            </div>
          )}
        </div>
      )}

      {currentStep === "party" && (
        <div>
          <StepHeading title="Who's travelling?" compact={isModal} />
          <PartySizePicker
            passengers={form.passengers}
            luggage={form.luggage}
            onPassengersChange={(value) => update("passengers", value)}
            onLuggageChange={(value) => update("luggage", value)}
          />
        </div>
      )}

      {currentStep === "driver" && (
        <div>
          <StepHeading title="Choose your driver" compact={isModal} />
          <div className={`grid gap-3 ${isModal ? "grid-cols-1" : "sm:grid-cols-2 gap-4 lg:gap-6"}`}>
            {drivers.map((driver) => (
              <button
                key={driver.id}
                type="button"
                onClick={() => selectDriver(driver)}
                className={bigCard(form.driverId === driver.id)}
              >
                <Car className={`${isModal ? "w-7 h-7" : "w-10 h-10"} text-brand mb-3`} />
                <div className={`${isModal ? "text-base" : "text-xl"} font-bold dark:text-white`}>
                  {driver.name}
                </div>
                <div className="text-sm text-muted mt-1">{driver.vehicleLabel}</div>
                <div className="text-xs text-brand mt-1 font-medium">
                  Up to {driver.maxSeats} passengers
                </div>
              </button>
            ))}
          </div>
          {drivers.length === 0 && (
            <p className="text-sm text-muted">
              {form.pickupDate && form.pickupTime
                ? "No drivers are available on your selected dates. Try different dates or contact us."
                : "Complete the time step first to see available drivers."}
            </p>
          )}
        </div>
      )}

      {currentStep === "contact" && (
        <div>
          <StepHeading title="Almost done" compact={isModal} />
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full name</label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) => update("customerName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone number</label>
                <input
                  type="tel"
                  required
                  placeholder="07xxx xxxxxx"
                  value={form.customerPhone}
                  onChange={(e) => update("customerPhone", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <p className="text-sm text-muted">
              Confirmation sent to{" "}
              <span className="font-medium text-dark dark:text-white">{form.customerEmail}</span>
            </p>

            {!showNotes ? (
              <button
                type="button"
                onClick={() => setShowNotes(true)}
                className="text-sm font-medium text-brand hover:underline"
              >
                + Add special requests (optional)
              </button>
            ) : (
              <div>
                <label className={labelClass}>Special requests</label>
                <textarea
                  rows={3}
                  placeholder="Child seat, wheelchair access, etc."
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-gray-200/60 dark:border-white/10 bg-white dark:bg-dark px-4 py-3">
              <input
                type="checkbox"
                checked={form.saveDetails}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, saveDetails: e.target.checked }))
                }
                className="h-4 w-4 rounded border-black/20 text-brand"
              />
              <span className="text-sm text-muted">Save this route for next time</span>
            </label>

            {form.saveDetails && (
              <div>
                <label className={labelClass}>Saved label (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Home to Leeds Bradford"
                  value={form.savedDetailsLabel}
                  onChange={(e) => update("savedDetailsLabel", e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  if (isModal) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <BookingStepBreadcrumb
          steps={breadcrumbSteps}
          currentIndex={stepIndex}
          onBack={back}
          onGoTo={goTo}
          price={price}
        />

        <div className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className={`h-full overflow-y-auto px-5 py-4 ${
                currentStep === "schedule" ? "flex flex-col min-h-0" : ""
              }`}
            >
              {stepContent}
            </motion.div>
          </AnimatePresence>
        </div>

        {needsContinue && (
          <div className="shrink-0 border-t border-gray-200/60 dark:border-white/10 px-5 py-3 flex justify-end bg-white/80 dark:bg-dark/80">
            <button
              type="button"
              onClick={currentStep === "contact" ? handleSubmit : handleContinue}
              disabled={loading && currentStep === "contact"}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {currentStep === "contact" ? (
                loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Confirming…
                  </>
                ) : (
                  <>
                    Confirm booking
                    <ChevronRight className="w-4 h-4" />
                  </>
                )
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-6 lg:gap-8 items-start">
      <div className="bg-booking-bg dark:bg-dark-elevated rounded-3xl border-0 dark:border dark:border-white/10 shadow-md overflow-hidden flex flex-col min-h-[520px]">
        <BookingStepBreadcrumb
          steps={breadcrumbSteps}
          currentIndex={stepIndex}
          onBack={back}
          onGoTo={goTo}
          price={price}
        />

        <div className="relative flex-1 min-h-[480px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className={`px-6 sm:px-8 py-8 sm:py-10 h-full ${
                currentStep === "schedule" ? "flex flex-col min-h-[420px]" : ""
              }`}
            >
              {stepContent}
            </motion.div>
          </AnimatePresence>
        </div>

        {needsContinue && (
          <div className="px-6 sm:px-8 py-4 flex justify-end border-t border-gray-200/60 dark:border-white/10">
            <button
              type="button"
              onClick={currentStep === "contact" ? handleSubmit : handleContinue}
              disabled={loading && currentStep === "contact"}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {currentStep === "contact" ? (
                loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Confirming…
                  </>
                ) : (
                  <>
                    Confirm booking
                    <ChevronRight className="w-4 h-4" />
                  </>
                )
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {form.journeyType && form.serviceType && (
        <aside className="lg:sticky lg:top-24 bg-booking-bg dark:bg-dark-elevated rounded-3xl border-0 dark:border dark:border-white/10 p-6 shadow-md">
          <div className="flex items-center gap-2 mb-5 pb-5 dark:border-b dark:border-white/10">
            <div className="w-2 h-2 rounded-full bg-brand-gradient" />
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
              Your quote
            </h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Journey</span>
              <span className="font-medium dark:text-white">
                {form.journeyType === "RETURN" ? "Return" : "Single"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Service</span>
              <span className="font-medium dark:text-white">
                {getServiceLabel(form.serviceType)}
              </span>
            </div>
            {form.journeyType === "SINGLE" && isHubTransferType && form.tripType && (
              <div className="flex justify-between">
                <span className="text-muted">Direction</span>
                <span className="font-medium dark:text-white">
                  {getDirectionOptions(form.serviceType).find((o) => o.value === form.tripType)?.label ??
                    form.tripType}
                </span>
              </div>
            )}
            {isHubTransferType && selectedHub && !["journey", "service"].includes(currentStep) && (
              <div className="flex justify-between">
                <span className="text-muted">{getHubPickerLabel(form.serviceType)}</span>
                <span className="font-medium dark:text-white">{selectedHub.code}</span>
              </div>
            )}
            {selectedDriver &&
              !["journey", "service", "direction", "route", "schedule", "party"].includes(
                currentStep
              ) && (
                <div className="flex justify-between">
                  <span className="text-muted">Driver</span>
                  <span className="font-medium dark:text-white text-right">
                    {selectedDriver.name}
                    <span className="block text-xs text-muted font-normal">
                      {selectedDriver.vehicleLabel}
                    </span>
                  </span>
                </div>
              )}
          </div>
          <div className="mt-6 pt-6 dark:border-t dark:border-white/10">
            <div className="text-sm text-muted">Estimated total</div>
            <div className="text-4xl font-bold text-brand-gradient mt-1">£{price}</div>
            {isReturn && (
              <div className="text-xs text-muted mt-1">
                Return fare is double the single journey price
              </div>
            )}
            <div className="text-xs text-muted mt-2">
              Fixed price · Pay online after driver confirms
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
