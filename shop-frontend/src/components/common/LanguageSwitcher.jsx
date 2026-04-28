import { useTranslation } from "react-i18next";

const languages = [
  { code: "ja", label: "日" },
  { code: "zh", label: "中" },
  { code: "en", label: "EN" },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("language", langCode);
  };

  return (
    <div className="flex items-center gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
          className={
            "px-2 py-1 text-xs rounded transition font-bold " +
            (i18n.language === lang.code
              ? "bg-amber-500 text-slate-900"
              : "text-slate-400 hover:text-amber-400")
          }
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
