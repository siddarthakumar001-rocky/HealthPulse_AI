import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "te", label: "తెలుగు" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ta", label: "தமிழ்" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("i18nextLng", langCode);
  };

  const currentLang = languages.find(
    (l) => l.code === i18n.language || i18n.language?.startsWith(l.code)
  ) || languages[0];

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-foreground/80 dark:text-white/80 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4 text-foreground/80 dark:text-white/80" />
        <span className="hidden sm:inline text-xs font-semibold">
          {currentLang.label}
        </span>
      </button>
      <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-border bg-popover p-1 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              currentLang.code === lang.code
                ? "bg-primary/15 text-primary font-bold"
                : "hover:bg-muted text-popover-foreground"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
