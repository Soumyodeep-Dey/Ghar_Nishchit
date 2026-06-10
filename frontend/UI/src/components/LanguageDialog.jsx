import { useEffect } from 'react';
import { X, Languages, Check } from 'lucide-react';
import { useDarkMode } from '../useDarkMode.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

const LanguageDialog = ({ open, onClose }) => {
  const { darkMode } = useDarkMode();
  const { language, setLanguage, t, languages } = useLanguage();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const panelCls = darkMode
    ? 'bg-slate-800 border-slate-600 text-slate-100'
    : 'bg-white border-gray-200 text-gray-900';

  const optionIdle = darkMode
    ? 'border-slate-600 hover:bg-slate-700/80'
    : 'border-gray-200 hover:bg-gray-50';

  const optionActive = darkMode
    ? 'border-amber-500 bg-amber-900/30 ring-2 ring-amber-500/40'
    : 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/30';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t('common.close')}
      />
      <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl ${panelCls} animate-fadeIn`}>
        <div className="flex items-start justify-between p-6 border-b border-inherit">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${darkMode ? 'bg-yellow-900/40' : 'bg-yellow-100'}`}>
              <Languages className={`h-6 w-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <div>
              <h2 id="language-dialog-title" className="text-xl font-bold">
                {t('language.title')}
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                {t('language.subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
            aria-label={t('common.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {languages.map((lang) => {
            const selected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-all duration-200 ${selected ? optionActive : optionIdle}`}
              >
                <div className="text-left">
                  <div className="font-semibold text-lg">{lang.nativeLabel}</div>
                  <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{lang.label}</div>
                </div>
                {selected && (
                  <Check className={`h-5 w-5 flex-shrink-0 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                )}
              </button>
            );
          })}
        </div>

        <p className={`px-6 pb-6 text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
          {t('language.current')}: {languages.find((l) => l.code === language)?.nativeLabel}
        </p>
      </div>
    </div>
  );
};

export default LanguageDialog;
