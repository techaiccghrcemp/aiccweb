"use client";

import axios from "axios";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { ClubLogo, useClubBranding } from "../../ClubBranding";

const API = "http://localhost:5000/api";

function getErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return "The club logo could not be updated.";
  return error.response?.data?.message || "The club logo could not be updated.";
}

export default function ClubLogoSettings({ token }: { token: string }) {
  const { logo, loadError, setLogo, clearLoadError } = useClubBranding();
  const [file, setFile] = useState<File | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!file) {
      setError("Choose a logo image before uploading.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("The logo must be 5 MB or smaller.");
      return;
    }

    setWorking(true);
    try {
      const formData = new FormData();
      formData.set("logo", file);
      const response = await axios.put<{ logo: string }>(
        `${API}/admin/club/logo`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setLogo(response.data.logo);
      clearLoadError();
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setMessage("Club logo updated across the website.");
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError));
    } finally {
      setWorking(false);
    }
  };

  const remove = async () => {
    setError("");
    setMessage("");
    setWorking(true);
    try {
      const response = await axios.delete<{ warning?: string }>(
        `${API}/admin/club/logo`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setLogo("");
      clearLoadError();
      setMessage(
        response.data.warning ||
          "Club logo removed. The AICC mark is now shown instead.",
      );
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError));
    } finally {
      setWorking(false);
    }
  };

  return (
    <section
      id="club-logo"
      aria-labelledby="club-logo-heading"
      className="mt-8 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex h-28 w-36 shrink-0 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <ClubLogo
            className="flex h-full w-full items-center justify-center rounded-xl bg-indigo-600 text-lg font-black text-white"
            fallback="AICC"
          />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            Website identity
          </p>
          <h2
            id="club-logo-heading"
            className="mt-2 text-xl font-black tracking-tight text-slate-950"
          >
            Club logo
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Upload the official AICC logo to replace the AICC monogram in the
            website header, portals, and footer. Use a transparent PNG for the
            cleanest result.
          </p>
        </div>
      </div>

      {loadError && (
        <p role="status" className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          {loadError}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </p>
      )}

      <form
        onSubmit={upload}
        className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-end"
      >
        <label className="min-w-0 flex-1 text-sm font-bold text-slate-700">
          Choose logo image
          <span className="mt-2 flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-500 transition hover:border-indigo-300">
            <ImagePlus className="h-4 w-4 shrink-0 text-indigo-600" />
            <span className="truncate">
              {file ? file.name : "JPEG, PNG, or WebP · up to 5 MB"}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setError("");
                setMessage("");
              }}
              className="sr-only"
            />
          </span>
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={working || !file}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {working ? "Saving..." : "Upload logo"}
          </button>
          {logo && (
            <button
              type="button"
              disabled={working}
              onClick={remove}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
