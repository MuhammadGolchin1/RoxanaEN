const HEALTH_OPTIONS = ['Type 2 diabetes', 'High blood pressure', 'High cholesterol', 'Sleep apnea', 'other'];
const FIELDS = [
  ['name', 'Preferred name'], ['age', 'Age'], ['gender', 'Gender'],
  ['height', 'Height (cm)'], ['weight', 'Weight (kg)'], ['contact', 'Contact'],
  ['occupation', 'Occupation and daily activity'], ['goal', 'Goals'],
  ['conditions', 'Medical conditions'], ['medications', 'Medication and dosage'],
  ['pain', 'Joint, muscle or bone pain'], ['injuries', 'Past injuries or surgery'],
  ['sleep', 'Sleep'], ['photos', 'Photo preference'], ['experience', 'Exercise experience'],
  ['location', 'Training location'], ['availability', 'Time available for exercise'],
  ['equipment', 'Equipment'], ['allergies', 'Food allergies or intolerances'],
  ['dislikes', 'Foods to exclude'], ['favorites', 'Favorite home-cooked dishes'],
  ['supplements', 'Supplements and vitamins'], ['habits', 'Eating habits'],
];
function normalize(value) {
  return String(value ?? '').replace(/[۰-۹٠-٩]/g, d => String('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩'.indexOf(d) % 10));
}
function number(value, min, max) {
  const text = normalize(value).trim().replace(/[٫,]/g, '.');
  if (text.length > 12 || !/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const n = Number(text);
  return n >= min && n <= max ? Math.round(n * 100) : null;
}
function validName(name) {
  return typeof name === 'string' && name.trim().length > 0 && name.length <= 80 &&
    /^[\p{L}\p{M} .‌’'-]+$/u.test(name) && /\p{L}/u.test(name);
}
function validContact(contact, channel) {
  if (typeof contact !== 'string' || contact.length > 40) return false;
  const value = normalize(contact).trim();
  if (channel !== 'instagram') {
    const phone = value.replace(/[\s()-]/g, '');
    if (/^(?:0|\+98|0098)9\d{9}$/.test(phone) || /^\+[1-9]\d{6,14}$/.test(phone)) return true;
    if (channel === 'phone') return false;
  }
  const username = value.replace(/^@/, '');
  return /^[A-Za-z0-9_](?:[A-Za-z0-9_.]{0,28}[A-Za-z0-9_])?$/.test(username) && !username.includes('..');
}
export function validateSubmission(kind, payload) {
  if (!payload || typeof payload !== 'object' || !/^RX-[a-f0-9-]{36}$/i.test(payload.reference || '')) return 'Invalid request reference.';
  if (kind === 'assessment') {
    if (!validName(payload.name) || !['phone','instagram'].includes(payload.channel) || !validContact(payload.contact, payload.channel)) return 'Enter a valid name and contact details.';
    if (number(payload.height,70,270) === null || number(payload.weight,15,650) === null) return 'Enter a valid height and weight.';
    if (!Array.isArray(payload.health) || payload.health.length > 5 || payload.health.some(h => !HEALTH_OPTIONS.includes(h))) return 'Choose valid health conditions.';
    if (typeof payload.healthDetail !== 'string' || payload.healthDetail.length > 250) return 'Please shorten your health note.';
    return null;
  }
  if (kind !== 'questionnaire') return 'Unknown form.';
  const a = payload.answers;
  if (!a || typeof a !== 'object' || Array.isArray(a)) return 'Invalid questionnaire.';
  if (!validName(a.name) || !validContact(a.contact)) return 'Enter a valid name and contact details.';
  const age = normalize(a.age);
  if (!/^\d{1,3}$/.test(age) || +age < 1 || +age > 120) return 'Enter an age between 1 and 120.';
  if (!['Woman','Man','Other','Prefer not to say'].includes(a.gender)) return 'Choose a gender option.';
  if (number(a.height,70,270) === null || number(a.weight,15,650) === null) return 'Enter a valid height and weight.';
  for (const [id] of FIELDS) if (a[id] !== undefined && (typeof a[id] !== 'string' || a[id].length > 1800)) return 'Please shorten your answers.';
  if (a.photos && !["I'll add photos now", "I'll send them later", "I'd rather not"].includes(a.photos)) return 'Choose a photo option.';
  return null;
}
function messageParts(kind, payload) {
  const ref = `English Roxana website\nReference: ${payload.reference}\n`;
  if (kind === 'assessment') {
    const height = number(payload.height,70,270), weight = number(payload.weight,15,650);
    const bmi = weight * 1e6 / height ** 2;
    const inRange = weight * 1e6 >= 30 * height ** 2;
    const display = !inRange && Math.round(bmi * 100) === 3000 ? 29.99 : bmi;
    return [`Roxana follow-up request\n${ref}\nName: ${payload.name}\n${payload.channel}: ${payload.contact}\nHeight: ${normalize(payload.height)} cm\nWeight: ${normalize(payload.weight)} kg\nBMI: ${display.toFixed(2)}\nHealth conditions: ${payload.health.join(', ') || 'Not specified'}\nHealth note: ${payload.healthDetail || 'None'}\nResult: ${inRange ? 'Within' : 'Outside'} initial assessment range`];
  }
  const parts = []; let current = '';
  for (const [id, label] of FIELDS) {
    const answer = `${label}: ${payload.answers[id]?.trim() || 'Not answered'}\n\n`;
    if ((current + answer).length > 3200 && current) { parts.push(current); current = ''; }
    current += answer;
  }
  if(current) parts.push(current);
  return parts.map((part,index)=>`Roxana lifestyle questionnaire\n${ref}Part ${index+1} of ${parts.length}\n\n${part}`);
}

export { messageParts };
