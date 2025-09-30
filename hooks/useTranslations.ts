import { useContext } from 'react';
import { LocaleContext } from '../context/LocaleContext';
import { translations, Translations } from '../i18n/translations';

export const useTranslations = (): Translations => {
  const { locale } = useContext(LocaleContext);
  return translations[locale];
};
