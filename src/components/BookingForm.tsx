"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AIRPORTS, estimatePrice } from "@/lib/airports";
import { AnimatedGradientButton } from "@/components/AnimatedGradientButton";
import { AddressFinder } from "@/components/AddressFinder";
import {
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  Calendar,
  Car,
  Loader2,
  MapPin,
  Plane,
  User,
  Check,
  Clock,
} from "lucide-react";

const VEHICLES = [
  { value: "SALOON", label: "Saloon", desc: "Up to 3 passengers", price: 45 },
  { value: "ESTATE", label: "Estate", desc: "Extra luggage space", price: 55 },
  { value: "MPV", label: "MPV", desc: "Up to 6 passengers", price: 65 },
  { value: "EXECUTIVE", label: "Executive", desc: "Premium comfort", price: 85 },
];

type StepId = "journey" | "service" | "direction" | "route" | "schedule" | "vehicle" | "contact";

const STEP_META: Record<StepId, { label: string; icon: typeof Plane }> = {
  journey: { label: "Journey", icon: ArrowLeftRight },
  service: { label: "Service", icon: Clock },
  direction: { label: "Direction", icon: Plane },
  route: { label: "Route", icon: MapPin },
  schedule: { label: "Schedule", icon: Calendar },
  vehicle: { label: "Vehicle", icon: Car },
  contact: { label: "Details", icon: User },
};

function getSteps(journeyType: string, serviceType: string): StepId[] {
  const steps: StepId[] = ["journey"];
  if (!journeyType) return steps;
  steps.push("service");
  if (!serviceType) return steps;
  if (journeyType === "SINGLE" && serviceType === "AIRPORT_TRANSFER") steps.push("direction");
  steps.push("route", "schedule", "vehicle", "contact");
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

export function BookingForm() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
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
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    flightNumber: "",
    returnFlightNumber: "",
    notes: "",
  });

  const steps = useMemo(
    () => getSteps(form.journeyType, form.serviceType),
    [form.journeyType, form.serviceType]
  );
  const currentStep = steps[stepIndex] ?? "journey";
  const isReturn = form.journeyType === "RETURN";
  const isAirportTransfer = form.serviceType === "AIRPORT_TRANSFER";
  const selectedAirport = AIRPORTS.find((a) => a.code === form.airportCode);
  const price =
    form.journeyType && form.serviceType
      ? estimatePrice(
          form.vehicleType,
          form.tripType,
          form.journeyType,
          form.serviceType
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
        const airport = AIRPORTS.find(
          (a) => a.code === (field === "airportCode" ? value : next.airportCode)
        );
        if (airport && next.serviceType === "AIRPORT_TRANSFER") {
          const airportLabel = `${airport.name} Airport (${airport.code})`;
          if (next.journeyType === "RETURN" || next.tripType === "TO_AIRPORT") {
            if (!next.dropoffAddress.includes("Airport")) next.dropoffAddress = airportLabel;
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
    update("serviceType", value);
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
      const airport = AIRPORTS.find((a) => a.code === prev.airportCode);
      const airportLabel = airport ? `${airport.name} Airport (${airport.code})` : "";
      return { ...prev, pickupAddress: value, dropoffAddress: airportLabel };
    });
  }

  function validateStep(): string | null {
    switch (currentStep) {
      case "route":
        if (!form.pickupAddress.trim()) return "Pickup address is required";
        if (!isReturn && !form.dropoffAddress.trim()) return "Drop-off address is required";
        return null;
      case "schedule":
        if (!form.pickupDate || !form.pickupTime) return "Outbound date and time are required";
        if (isReturn && (!form.returnDate || !form.returnTime))
          return "Return date and time are required";
        if (isReturn && form.returnDate < form.pickupDate)
          return "Return date must be on or after outbound date";
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

  async function handleSubmit() {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const airport = AIRPORTS.find((a) => a.code === form.airportCode);
      const airportLabel = airport ? `${airport.name} Airport (${airport.code})` : "";
      const payload = {
        ...form,
        ...(form.journeyType === "RETURN" && isAirportTransfer
          ? { tripType: "TO_AIRPORT", dropoffAddress: airportLabel || form.dropoffAddress }
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

  const bigCard = (active: boolean) =>
    `relative p-8 lg:p-10 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
      active
        ? "bg-brand-light/60 dark:bg-brand/10 shadow-lg shadow-brand/15 ring-2 ring-brand/30"
        : "bg-white dark:bg-dark-elevated shadow-sm hover:shadow-md dark:border dark:border-white/10"
    }`;

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-6 lg:gap-8 items-start">
      <div className="bg-booking-bg dark:bg-dark-elevated rounded-3xl border-0 dark:border dark:border-white/10 shadow-md overflow-hidden">
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

        <div className="relative min-h-[480px] sm:min-h-[520px]">
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
                        icon: Plane,
                      },
                      {
                        value: "RETURN",
                        label: "Return journey",
                        desc: "Outbound and return trip — save 10%",
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
              {currentStep === "direction" && (
                <div>
                  <StepHeading title="Which direction?" subtitle="Where are you heading?" />
                  <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
                    {[
                      { value: "TO_AIRPORT", label: "To airport", desc: "Home or hotel → airport" },
                      { value: "FROM_AIRPORT", label: "From airport", desc: "Airport → your destination" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => selectDirection(opt.value)}
                        className={bigCard(form.tripType === opt.value)}
                      >
                        <Plane
                          className={`w-10 h-10 text-brand mb-4 ${opt.value === "FROM_AIRPORT" ? "rotate-180" : ""}`}
                        />
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
                      isAirportTransfer
                        ? "Select your airport and addresses"
                        : "Enter your pickup and drop-off locations"
                    }
                  />
                  <div className="grid lg:grid-cols-2 gap-6">
                    {isAirportTransfer && (
                      <div className="lg:col-span-2">
                        <label className={labelClass}>Airport</label>
                        <select
                          value={form.airportCode}
                          onChange={(e) => update("airportCode", e.target.value)}
                          className={inputClass}
                        >
                          {AIRPORTS.map((a) => (
                            <option key={a.code} value={a.code}>
                              {a.name} ({a.code}) — {a.city}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {isReturn && isAirportTransfer ? (
                      <div className="lg:col-span-2">
                        <AddressFinder
                          label="Home / pickup address"
                          value={form.pickupAddress}
                          onChange={handleHomeAddress}
                          placeholder="e.g. 12 High Street, Castleford"
                          hint={`Outbound: home → ${selectedAirport?.name}. Return: ${selectedAirport?.name} → home.`}
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
                            onChange={(addr) => update("pickupAddress", addr)}
                            placeholder="e.g. 12 High Street, Castleford"
                            inputClass={inputClass}
                            labelClass={labelClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Drop-off address</label>
                          <input
                            type="text"
                            placeholder="e.g. Leeds Bradford Airport"
                            value={form.dropoffAddress}
                            onChange={(e) => update("dropoffAddress", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step: Schedule */}
              {currentStep === "schedule" && (
                <div>
                  <StepHeading
                    title="When do you need us?"
                    subtitle={
                      isReturn
                        ? isAirportTransfer
                          ? "Enter your outbound and return flight times"
                          : "Enter your outbound and return pickup times"
                        : "Pick your date and time"
                    }
                  />
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="lg:col-span-2">
                      <h3 className="text-sm font-semibold text-brand mb-4 uppercase tracking-wide">
                        {isReturn ? "Outbound" : "Pickup"}
                      </h3>
                    </div>
                    <div>
                      <label className={labelClass}>{isReturn ? "Departure date" : "Date"}</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={form.pickupDate}
                        onChange={(e) => update("pickupDate", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{isReturn ? "Pickup time" : "Time"}</label>
                      <input
                        type="time"
                        value={form.pickupTime}
                        onChange={(e) => update("pickupTime", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    {isAirportTransfer && (
                      <div className="lg:col-span-2">
                        <label className={labelClass}>Flight number (optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. FR1234"
                          value={form.flightNumber}
                          onChange={(e) => update("flightNumber", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    )}
                    {isReturn && (
                      <>
                        <div className="lg:col-span-2 mt-2">
                          <h3 className="text-sm font-semibold text-brand-end mb-4 uppercase tracking-wide">
                            Return
                          </h3>
                        </div>
                        <div>
                          <label className={labelClass}>Return date</label>
                          <input
                            type="date"
                            min={form.pickupDate || new Date().toISOString().split("T")[0]}
                            value={form.returnDate}
                            onChange={(e) => update("returnDate", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            {isAirportTransfer ? "Landing / pickup time" : "Return pickup time"}
                          </label>
                          <input
                            type="time"
                            value={form.returnTime}
                            onChange={(e) => update("returnTime", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        {isAirportTransfer && (
                          <div className="lg:col-span-2">
                            <label className={labelClass}>Return flight number (optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. FR5678"
                              value={form.returnFlightNumber}
                              onChange={(e) => update("returnFlightNumber", e.target.value)}
                              className={inputClass}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step: Vehicle */}
              {currentStep === "vehicle" && (
                <div>
                  <StepHeading
                    title="Choose your vehicle"
                    subtitle="Select the best fit for your party"
                  />
                  <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    {VEHICLES.map((v) => (
                      <button
                        key={v.value}
                        type="button"
                        onClick={() => update("vehicleType", v.value)}
                        className={bigCard(form.vehicleType === v.value)}
                      >
                        <Car className="w-8 h-8 text-brand mb-3" />
                        <div className="font-bold dark:text-white">{v.label}</div>
                        <div className="text-sm text-muted mt-1">{v.desc}</div>
                        <div className="text-sm font-semibold text-brand-gradient mt-3">
                          from £{v.price}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Passengers</label>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={form.passengers}
                        onChange={(e) => update("passengers", parseInt(e.target.value))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Luggage pieces</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={form.luggage}
                        onChange={(e) => update("luggage", parseInt(e.target.value))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step: Contact */}
              {currentStep === "contact" && (
                <div>
                  <StepHeading
                    title="Your details"
                    subtitle="Almost done — just need your contact info"
                  />
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Full name</label>
                      <input
                        type="text"
                        value={form.customerName}
                        onChange={(e) => update("customerName", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Phone number</label>
                      <input
                        type="tel"
                        placeholder="07xxx xxxxxx"
                        value={form.customerPhone}
                        onChange={(e) => update("customerPhone", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className={labelClass}>Email address</label>
                      <input
                        type="email"
                        value={form.customerEmail}
                        onChange={(e) => update("customerEmail", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className={labelClass}>Special requests (optional)</label>
                      <textarea
                        rows={3}
                        placeholder="Child seat, wheelchair access, etc."
                        value={form.notes}
                        onChange={(e) => update("notes", e.target.value)}
                        className={inputClass}
                      />
                    </div>
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
                {isAirportTransfer ? "Airport transfer" : "Pre-booked"}
              </span>
            </div>
            {form.journeyType === "SINGLE" && isAirportTransfer && form.tripType && (
              <div className="flex justify-between">
                <span className="text-muted">Direction</span>
                <span className="font-medium dark:text-white">
                  {form.tripType === "TO_AIRPORT" ? "To airport" : "From airport"}
                </span>
              </div>
            )}
            {isAirportTransfer && selectedAirport && !["journey", "service"].includes(currentStep) && (
              <div className="flex justify-between">
                <span className="text-muted">Airport</span>
                <span className="font-medium dark:text-white">{selectedAirport.code}</span>
              </div>
            )}
            {form.vehicleType && ["vehicle", "contact"].includes(currentStep) && (
              <div className="flex justify-between">
                <span className="text-muted">Vehicle</span>
                <span className="font-medium dark:text-white">
                  {VEHICLES.find((v) => v.value === form.vehicleType)?.label}
                </span>
              </div>
            )}
          </div>
          <div className="mt-6 pt-6 dark:border-t dark:border-white/10">
            <div className="text-sm text-muted">Estimated total</div>
            <div className="text-4xl font-bold text-brand-gradient mt-1">£{price}</div>
            {isReturn && (
              <div className="text-xs text-brand mt-1">Includes 10% return discount</div>
            )}
            <div className="text-xs text-muted mt-2">Fixed price · Pay driver on the day</div>
          </div>
        </aside>
      )}
    </div>
  );
}
