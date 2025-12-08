import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import es from './locales/es.json';
import ptBR from './locales/pt-BR.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import hi from './locales/hi.json';
import ar from './locales/ar.json';
import ru from './locales/ru.json';
import tr from './locales/tr.json';
import id from './locales/id.json';
import vi from './locales/vi.json';
import th from './locales/th.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import sv from './locales/sv.json';

const resources = {
    en: { translation: en },
    es: { translation: es },
    'pt-BR': { translation: ptBR },
    fr: { translation: fr },
    de: { translation: de },
    it: { translation: it },
    ja: { translation: ja },
    ko: { translation: ko },
    'zh-CN': { translation: zhCN },
    'zh-TW': { translation: zhTW },
    hi: { translation: hi },
    ar: { translation: ar },
    ru: { translation: ru },
    tr: { translation: tr },
    id: { translation: id },
    vi: { translation: vi },
    th: { translation: th },
    nl: { translation: nl },
    pl: { translation: pl },
    sv: { translation: sv }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

export default i18n;
