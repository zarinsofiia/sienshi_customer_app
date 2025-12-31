// contexts/LanguageContext.tsx
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en, { EnTranslationKey } from "../locales/en";
import zh from "../locales/zh";
import { API_BASE_URL } from "../config/api";

type Language = "en" | "zh";

const translations = { en, zh };

type TranslationKey = EnTranslationKey;

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void; // local-only set + persist
  changeLang: (lang: Language) => Promise<boolean>; // persist + (optional) call API
  t: (key: TranslationKey) => string;
  langReady: boolean;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

const LANG_STORAGE_KEY = "appLang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [langReady, setLangReady] = useState(false);

  // Load saved language
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LANG_STORAGE_KEY);
        if (saved === "en" || saved === "zh") {
          setLangState(saved);
        }
      } catch (e) {
        console.log("[LanguageContext] load lang failed:", e);
      } finally {
        setLangReady(true);
      }
    })();
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    AsyncStorage.setItem(LANG_STORAGE_KEY, newLang).catch((e) =>
      console.log("[LanguageContext] save lang failed:", e)
    );
  }, []);

  /**
   * Persist locally + try backend.
   * If backend fails, UI still uses the selected language locally.
   */
  const changeLang = useCallback(
    async (newLang: Language) => {
      const prev = lang;

      // optimistic UI
      setLang(newLang);

      try {
        const token = await AsyncStorage.getItem("authToken");

        const res = await fetch(`${API_BASE_URL}/api/settings/changeLang`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ lang: newLang }),
        });

        if (!res.ok) {
          console.log("[changeLang] backend failed status:", res.status);
          // revert to previous if you want strict server truth:
          // setLang(prev);
          // return false;

          // or keep local language (recommended for customer app UX):
          return false;
        }

        return true;
      } catch (e) {
        console.log("[changeLang] backend error:", e);
        // keep local language; do not revert
        return false;
      }
    },
    [lang, setLang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      changeLang,
      langReady,
      t: (key: TranslationKey) =>
        translations[lang][key] ?? translations.en[key] ?? key,
    }),
    [lang, setLang, changeLang, langReady]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
}
