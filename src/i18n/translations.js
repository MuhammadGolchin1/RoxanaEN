import french from './fr.json' with { type: 'json' };

export const LANGUAGE_KEY = 'roxana-language';
export const LANGUAGES = ['en', 'fr'];

export function translate(value, language = 'en', parameters = {}) {
  if (value === undefined || value === null) return '';
  const text = String(value);
  let result = text;
  if (language === 'fr') {
    const key = text.trim();
    const translated = french[key];
    if (translated !== undefined) {
      const leading = text.match(/^\s*/)[0];
      const trailing = text.match(/\s*$/)[0];
      result = leading + translated + trailing;
    } else {
      const lengthError = /^Please shorten your answer to no more than (\d+) characters\.$/.exec(key);
      if (lengthError) return translate('Please shorten your answer to no more than {max} characters.', language, { max: lengthError[1] });
    }
  }
  return result.replace(/\{(\w+)\}/g, (match, name) => Object.hasOwn(parameters, name) ? String(parameters[name]) : match);
}

export function readLanguage(storage) {
  try {
    const language = (storage ?? globalThis.localStorage)?.getItem(LANGUAGE_KEY);
    return LANGUAGES.includes(language) ? language : 'en';
  } catch { return 'en'; }
}

export function rememberLanguage(language, storage) {
  if (!LANGUAGES.includes(language)) return;
  try { (storage ?? globalThis.localStorage)?.setItem(LANGUAGE_KEY, language); } catch {}
}

export function localizedBmi(result, language = 'en') {
  if (!result) return '';
  // The calculator's canonical display protects the exact BMI 30 cutoff.
  const value = Number(result.display.replaceAll(',', ''));
  return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
    minimumFractionDigits: 1, maximumFractionDigits: 2,
  }).format(value);
}
