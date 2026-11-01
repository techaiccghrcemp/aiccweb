"use client";

import axios from "axios";
import Image from "next/image";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const API = "http://localhost:5000/api";

type ClubBrandingContextValue = {
  logo: string;
  loadError: string;
  setLogo: (logo: string) => void;
  clearLoadError: () => void;
};

const ClubBrandingContext = createContext<ClubBrandingContextValue | null>(null);

export function ClubBrandingProvider({ children }: { children: ReactNode }) {
  const [logo, setLogo] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    void axios
      .get<{ logo: string }>(`${API}/club`, { signal: controller.signal })
      .then(({ data }) => {
        setLogo(typeof data.logo === "string" ? data.logo : "");
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : undefined;
        setLoadError(message || "Unable to load club branding.");
      });

    return () => controller.abort();
  }, []);

  return (
    <ClubBrandingContext.Provider
      value={{ logo, loadError, setLogo, clearLoadError: () => setLoadError("") }}
    >
      {children}
    </ClubBrandingContext.Provider>
  );
}

export function useClubBranding() {
  const context = useContext(ClubBrandingContext);
  if (!context) {
    throw new Error("Club branding must be used inside ClubBrandingProvider");
  }
  return context;
}

export function ClubLogo({
  className,
  fallback = "A.",
}: {
  className: string;
  fallback?: string;
}) {
  const { logo } = useClubBranding();

  return (
    <span
      className={`${className}${logo ? " has-club-logo" : ""}`}
      aria-hidden="true"
    >
      {logo ? (
        <Image
          src={`http://localhost:5000${logo}`}
          alt=""
          width={128}
          height={128}
          unoptimized
          className="club-logo-image"
        />
      ) : (
        fallback
      )}
    </span>
  );
}
