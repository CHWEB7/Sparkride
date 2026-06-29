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
import { AnimatedGradientButton } from "@/components/AnimatedGradientButton";
import { AddressFinder } from "@/components/AddressFinder";
import { BookingCalendarPicker } from "@/components/booking/BookingCalendarPicker";
import { BookingTimePicker } from "@/components/booking/BookingTimePicker";
import { PartySizePicker } from "@/components/booking/PartySizePicker";
import {
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  Calendar,
  Loader2,
  MapPin,
  Plane,
  Ship,
  User,
  Check,
  Clock,
  Car,
  Users,
} from "lucide-react";

type StepId =
  | "journey"
  | "service"
  | "direction"
  | "route"
  | "date"
  | "time"
  | "party"
  | "driver"
  | "contact";

const STEP_META: Record<StepId, { label: string; icon: typeof Plane }> = {
  journey: { label: "Journey", icon: ArrowLeftRight },
  service: { label: "Service", icon: Clock },
  direction: { label: "Direction", icon: Plane },
  route: { label: "Route", icon: MapPin },
  date: { label: "Date", icon: Calendar },
  time: { label: "Time", icon: Clock },
  party: { label: "Party", icon: Users },
  driver: { label: "Driver", icon: Car },
  contact: { label: "Details", icon: User },
};

function getSteps(journeyType: string, serviceType: string): StepId[] {
  const steps: StepId[] = ["journey"];
  if (!journeyType) return steps;
  steps.push("service");
  if (!serviceType) return steps;
  if (journeyType === "SINGLE" && isHubTransfer(serviceType)) steps.push("direction");
  steps.push("route", "date", "time", "party", "driver", "contact");
  return steps;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0 }),
};

function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-6 sm:mb-8">
      <div className="w-1 h-8 rounded-full bg-brand-gradient shrink-0" />
      <div>
        <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] dark:text-white">{title}</h2>
        <p className="text-muted font-normal tracking-[-0.01em] mt-1">{subtitle}</p>
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
      case "date":
        if (!form.pickupDate) return "Please select your pickup date";
        if (isReturn && !form.returnDate) return "Please select your return date";
        if (isReturn && form.returnDate < form.pickupDate)
          return "Return date must be on or after outbound date";
        return null;
      case "time":
        if (!form.pickupTime) return "Please select your pickup time";
        if (isReturn && !form.returnTime) return "Please select your return time";
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

  const bigCard = (active: boolean) =>
    `relative p-8 lg:p-10 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
      active
        ? "bg-brand-light/60 dark:bg-brand/10 shadow-lg shadow-brand/15 ring-2 ring-brand/30"
        : "bg-white dark:bg-dark-elevated shadow-sm hover:shadow-md dark:border dark:border-white/10"
    }`;

  return (
    <div className={`grid ${isModal ? "lg:grid-cols-[1fr_260px]" : "lg:grid-cols-[1fr_300px]"} gap-4 lg:gap-6 items-start p-4 sm:p-5 lg:p-6`}>
      <div className={`bg-booking-bg dark:bg-dark-elevated ${isModal ? "rounded-2xl" : "rounded-3xl"} border-0 dark:border dark:border-white/10 shadow-md overflow-hidden`}>
        {/* Progress bar */}
        {form.journeyType && (
          <div className="px-6 sm:px-8 pt-6 pb-2 dark:border-b dark:border-white/10">
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {steps.map((id, i) => {
                const meta = STEP_META[id];
                const Icon = meta.icon;
                const done = i < stepIndex;
                const active = i === stepIndex;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={i > stepIndex}
                    onClick={() => i < stepIndex && goTo(i)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                      active
                        ? "bg-brand-gradient text-white"
                        : done
                          ? "bg-brand-light dark:bg-brand/20 text-brand cursor-pointer"
                          : "bg-gray-100 dark:bg-white/5 text-muted"
                    }`}
                  >
                    {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                    {meta.label}
                  </button>
                );
              })}
            </div>
            <div className="h-1 bg-gray-100 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
              <motion.div
                className="h-full bg-brand-gradient rounded-full"
                animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        <div className={`relative ${isModal ? "min-h-[420px] sm:min-h-[460px]" : "min-h-[480px] sm:min-h-[520px]"}`}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="px-6 sm:px-8 py-8 sm:py-10"
            >
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Step: Journey type */}
              {currentStep === "journey" && (
                <div>
                  <StepHeading title="What type of journey?" subtitle="Select one to continue" />
                  <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
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
                        <opt.icon className="w-10 h-10 text-brand mb-4" />
                        <div className="text-xl font-bold dark:text-white">{opt.label}</div>
                        <div className="text-sm text-muted mt-2">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Service type */}
              {currentStep === "service" && (
                <div>
                  <StepHeading
                    title="What type of booking?"
                    subtitle="Choose your service before selecting a route"
                  />
                  <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
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
                        <opt.icon className="w-10 h-10 text-brand mb-4" />
                        <div className="text-xl font-bold dark:text-white">{opt.label}</div>
                        <div className="text-sm text-muted mt-2">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Direction */}
              {currentStep === "direction" && isHubTransferType && (
                <div>
                  <StepHeading title="Which direction?" subtitle="Where are you heading?" />
                  <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
                    {getDirectionOptions(form.serviceType).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => selectDirection(opt.value)}
                        className={bigCard(form.tripType === opt.value)}
                      >
                        {isPortTransferCategory(form.serviceType) ? (
                          <Ship
                            className={`w-10 h-10 text-brand mb-4 ${opt.value === "FROM_AIRPORT" ? "rotate-180" : ""}`}
                          />
                        ) : (
                          <Plane
                            className={`w-10 h-10 text-brand mb-4 ${opt.value === "FROM_AIRPORT" ? "rotate-180" : ""}`}
                          />
                        )}
                        <div className="text-xl font-bold dark:text-white">{opt.label}</div>
                        <div className="text-sm text-muted mt-2">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Route */}
              {currentStep === "route" && (
                <div>
                  <StepHeading
                    title="Where are you travelling?"
                    subtitle={
                      isHubTransferType
                        ? `Select your ${getHubPickerLabel(form.serviceType).toLowerCase()} and addresses`
                        : "Enter your pickup and drop-off locations"
                    }
                  />
                  <div className="grid lg:grid-cols-2 gap-6">
                    {isHubTransferType && (
                      <div className="lg:col-span-2">
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
                      <div className="lg:col-span-2">
                        <AddressFinder
                          label="Home / pickup address"
                          value={form.pickupAddress}
                          onChange={handleHomeAddress}
                          hint={`Outbound: home → ${selectedHub?.name}. Return: ${selectedHub?.name} → home.`}
                          inputClass={inputClass}
                          labelClass={labelClass}
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <AddressFinder
                            label="Pickup address"
                            value={form.pickupAddress}
                            onChange={(value) => update("pickupAddress", value)}
                            inputClass={inputClass}
                            labelClass={labelClass}
                          />
                        </div>
                        <div>
                          <AddressFinder
                            label="Drop-off address"
                            value={form.dropoffAddress}
                            onChange={(value) => update("dropoffAddress", value)}
                            inputClass={inputClass}
                            labelClass={labelClass}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step: Date */}
              {currentStep === "date" && (
                <div>
                  <StepHeading
                    title={isReturn ? "When are you travelling?" : "Pick your date"}
                    subtitle={
                      isReturn
                        ? "Choose outbound and return dates on the calendar"
                        : "Select your pickup date"
                    }
                  />
                  <div className="space-y-5">
                    <BookingCalendarPicker
                      label={isReturn ? "Outbound" : "Pickup date"}
                      value={form.pickupDate}
                      onChange={(dateKey) => update("pickupDate", dateKey)}
                    />
                    {isReturn && (
                      <BookingCalendarPicker
                        label="Return"
                        value={form.returnDate}
                        minDate={form.pickupDate || undefined}
                        onChange={(dateKey) => update("returnDate", dateKey)}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Step: Time */}
              {currentStep === "time" && (
                <div>
                  <StepHeading
                    title="What time suits you?"
                    subtitle={
                      isAirportTransfer
                        ? "Pick your pickup times — add flight numbers if you like"
                        : "Choose your pickup times"
                    }
                  />
                  <div className="space-y-5">
                    <BookingTimePicker
                      label={isReturn ? "Outbound pickup" : "Pickup time"}
                      value={form.pickupTime}
                      onChange={(time) => update("pickupTime", time)}
                    />
                    {isReturn && (
                      <BookingTimePicker
                        label={isAirportTransfer ? "Return pickup" : "Return time"}
                        value={form.returnTime}
                        onChange={(time) => update("returnTime", time)}
                      />
                    )}
                    {isAirportTransfer && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Flight number (optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. FR1234"
                            value={form.flightNumber}
                            onChange={(e) => update("flightNumber", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        {isReturn && (
                          <div>
                            <label className={labelClass}>Return flight (optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. FR5678"
                              value={form.returnFlightNumber}
                              onChange={(e) => update("returnFlightNumber", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step: Party */}
              {currentStep === "party" && (
                <div>
                  <StepHeading
                    title="Who's travelling?"
                    subtitle="Passengers and luggage for this journey"
                  />
                  <PartySizePicker
                    passengers={form.passengers}
                    luggage={form.luggage}
                    onPassengersChange={(value) => update("passengers", value)}
                    onLuggageChange={(value) => update("luggage", value)}
                  />
                </div>
              )}

              {/* Step: Driver */}
              {currentStep === "driver" && (
                <div>
                  <StepHeading
                    title="Choose your driver"
                    subtitle="Select who you'd like for this journey"
                  />
                  <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
                    {drivers.map((driver) => (
                      <button
                        key={driver.id}
                        type="button"
                        onClick={() => selectDriver(driver)}
                        className={bigCard(form.driverId === driver.id)}
                      >
                        <Car className="w-10 h-10 text-brand mb-4" />
                        <div className="text-xl font-bold dark:text-white">{driver.name}</div>
                        <div className="text-sm text-muted mt-2">{driver.vehicleLabel}</div>
                        <div className="text-xs text-brand mt-2 font-medium">
                          Up to {driver.maxSeats} passengers
                        </div>
                      </button>
                    ))}
                  </div>
                  {drivers.length === 0 && (
                    <p className="text-sm text-muted">
                      {form.pickupDate && form.pickupTime
                        ? "No drivers are available on your selected dates. Try different dates or contact us."
                        : "Complete the date and time steps first to see available drivers."}
                    </p>
                  )}
                </div>
              )}

              {/* Step: Contact */}
              {currentStep === "contact" && (
                <div>
                  <StepHeading
                    title="Almost done"
                    subtitle="Confirm your contact details"
                  />
                  <div className="space-y-5">
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
                      Confirmation and updates will be sent to{" "}
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
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation footer */}
        {form.journeyType && currentStep !== "journey" && (
          <div className="px-6 sm:px-8 py-5 flex items-center justify-between gap-4 bg-booking-bg/80 dark:bg-dark/50 dark:border-t dark:border-white/10">
            <button
              type="button"
              onClick={back}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-muted hover:text-dark dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep === "contact" ? (
              <AnimatedGradientButton
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3.5 gap-2 font-bold"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Confirm booking
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </AnimatedGradientButton>
            ) : currentStep !== "direction" && currentStep !== "service" ? (
              <button
                type="button"
                onClick={handleContinue}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-gradient text-white font-bold rounded-full hover:opacity-90 transition-opacity"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Live summary sidebar */}
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
            {selectedDriver && !["journey", "service", "direction", "route", "date", "time", "party"].includes(currentStep) && (
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
              <div className="text-xs text-muted mt-1">Return fare is double the single journey price</div>
            )}
            <div className="text-xs text-muted mt-2">Fixed price · Pay online after driver confirms</div>
          </div>
        </aside>
      )}
    </div>
  );
}
