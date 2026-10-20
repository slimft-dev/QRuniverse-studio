import { useState, useEffect } from "react";
import type { Ecc } from "@/hooks/use-qr-svg";

export interface RapidApiQrState {
  svg: string;
  loading: boolean;
  error: string | null;
  missingKey: boolean;
}

const RAPIDAPI_HOST =
  import.meta.env.VITE_RAPIDAPI_HOST ||
  "qruniverse-vector-qr-code-generator2.p.rapidapi.com";

export function useRapidApiQr(
  payload: string,
  ecc: Ecc,
  manualKey?: string
): RapidApiQrState {
  const envKey = (import.meta.env.VITE_RAPIDAPI_KEY || "").trim();
  const effectiveKey = (manualKey || envKey).trim();

  const [state, setState] = useState<RapidApiQrState>({
    svg: "",
    loading: false,
    error: null,
    missingKey: !effectiveKey,
  });

  useEffect(() => {
    if (!effectiveKey) {
      setState({
        svg: "",
        loading: false,
        error: null,
        missingKey: true,
      });
      return;
    }

    if (!payload) {
      setState({
        svg: "",
        loading: false,
        error: null,
        missingKey: false,
      });
      return;
    }

    let isMounted = true;
    setState((prev) => ({ ...prev, loading: true, error: null, missingKey: false }));

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://${RAPIDAPI_HOST}/qr`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-rapidapi-host": RAPIDAPI_HOST,
              "x-rapidapi-key": effectiveKey,
            },
            body: JSON.stringify({
              text: payload,
              level: ecc,
              format: "svg",
            }),
          }
        );

        if (!isMounted) return;

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setState({
              svg: "",
              loading: false,
              error: "Invalid RapidAPI Key or subscription required. Please check your key.",
              missingKey: false,
            });
            return;
          }
          if (response.status === 429) {
            setState({
              svg: "",
              loading: false,
              error: "Rate limit or monthly quota exceeded on RapidAPI. Upgrade on the marketplace.",
              missingKey: false,
            });
            return;
          }
          const errData = await response.text();
          setState({
            svg: "",
            loading: false,
            error: errData || `API Error (${response.status})`,
            missingKey: false,
          });
          return;
        }

        const svgMarkup = await response.text();
        if (isMounted) {
          setState({
            svg: svgMarkup,
            loading: false,
            error: null,
            missingKey: false,
          });
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Network error contacting RapidAPI";
        setState({
          svg: "",
          loading: false,
          error: msg,
          missingKey: false,
        });
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [payload, ecc, effectiveKey]);

  return state;
}
