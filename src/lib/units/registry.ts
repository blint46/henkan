import type { AliasOptions, UnitCategory, UnitDefinition } from './types';

const sym = (
  text: string,
  options: Omit<AliasOptions, 'text' | 'caseSensitive'> = {},
): AliasOptions => ({ text, caseSensitive: true, ...options });

const word = (
  text: string,
  options: Omit<AliasOptions, 'text' | 'caseSensitive'> = {},
): AliasOptions => ({ text, caseSensitive: false, ...options });

const syms = (...texts: string[]): AliasOptions[] => texts.map((text) => sym(text));
const words = (...texts: string[]): AliasOptions[] => texts.map((text) => word(text));

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-');

const unit = (
  symbol: string,
  name: string,
  category: UnitCategory,
  aliases: AliasOptions[],
): UnitDefinition => ({
  id: `${category}-${slugify(name)}`,
  symbol,
  name,
  category,
  aliases,
});

export const UNITS: UnitDefinition[] = [
  // Temperature
  unit('°C', 'Celsius', 'temperature', [
    ...syms('°C', '° C', '℃'),
    ...words('celsius', 'degree celsius', 'degrees celsius', 'degree c', 'degrees c', 'deg c', 'deg. c'),
  ]),
  unit('°F', 'Fahrenheit', 'temperature', [
    ...syms('°F', '° F', '℉'),
    ...words('fahrenheit', 'degree fahrenheit', 'degrees fahrenheit', 'degree f', 'degrees f', 'deg f', 'deg. f'),
  ]),
  unit('K', 'Kelvin', 'temperature', [
    sym('K', { requireSpace: true }),
    ...words('kelvin', 'kelvins', 'degree kelvin', 'degrees kelvin', 'deg k'),
  ]),
  unit('°R', 'Rankine', 'temperature', [
    ...syms('°R', '° R'),
    ...words('rankine', 'degree rankine', 'degrees rankine'),
  ]),

  // Length
  unit('m', 'meter', 'length', [
    sym('m', { rejectIfPrecededByCurrency: true }),
    ...words('meter', 'meters', 'metre', 'metres'),
  ]),
  unit('km', 'kilometer', 'length', [
    ...syms('km', 'KM'),
    ...words('kilometer', 'kilometers', 'kilometre', 'kilometres'),
  ]),
  unit('cm', 'centimeter', 'length', [
    ...syms('cm', 'CM'),
    ...words('centimeter', 'centimeters', 'centimetre', 'centimetres'),
  ]),
  unit('mm', 'millimeter', 'length', [
    sym('mm'),
    ...words('millimeter', 'millimeters', 'millimetre', 'millimetres'),
  ]),
  unit('µm', 'micrometer', 'length', [
    ...syms('µm', 'μm'),
    ...words('micrometer', 'micrometers', 'micrometre', 'micrometres'),
  ]),
  unit('nm', 'nanometer', 'length', [
    sym('nm'),
    ...words('nanometer', 'nanometers', 'nanometre', 'nanometres'),
  ]),
  unit('in', 'inch', 'length', [
    sym('in', { rejectIfFollowedByWord: true }),
    sym('in.', { rejectIfFollowedByWord: true }),
    sym('″'),
    sym('′′'),
    ...words('inch', 'inches'),
  ]),
  unit('ft', 'foot', 'length', [
    ...syms('ft', 'FT', 'ft.', '′'),
    ...words('foot', 'feet'),
  ]),
  unit('yd', 'yard', 'length', [
    ...syms('yd', 'YD'),
    ...words('yard', 'yards'),
  ]),
  unit('mi', 'mile', 'length', [sym('mi'), ...words('mile', 'miles')]),
  unit('nmi', 'nautical mile', 'length', [
    ...syms('nmi', 'NM'),
    ...words('nautical mile', 'nautical miles'),
  ]),
  unit('ly', 'light-year', 'length', [
    sym('ly'),
    ...words('light-year', 'light-years', 'light year', 'light years'),
  ]),
  unit('AU', 'astronomical unit', 'length', [
    ...syms('AU', 'au'),
    ...words('astronomical unit', 'astronomical units'),
  ]),
  unit('pc', 'parsec', 'length', [...words('parsec', 'parsecs')]),
  unit('Å', 'angstrom', 'length', [sym('Å'), ...words('angstrom', 'angstroms')]),

  // Mass
  unit('g', 'gram', 'mass', [sym('g'), ...words('gram', 'grams', 'gramme', 'grammes')]),
  unit('kg', 'kilogram', 'mass', [
    ...syms('kg', 'KG'),
    ...words('kilogram', 'kilograms', 'kilogramme', 'kilogrammes'),
  ]),
  unit('mg', 'milligram', 'mass', [
    sym('mg'),
    ...words('milligram', 'milligrams'),
  ]),
  unit('µg', 'microgram', 'mass', [
    ...syms('µg', 'μg', 'mcg'),
    ...words('microgram', 'micrograms'),
  ]),
  unit('t', 'tonne', 'mass', [
    sym('t', { rejectIfFollowedByWord: true }),
    ...words('tonne', 'tonnes', 'metric ton', 'metric tons', 'metric tonne', 'metric tonnes'),
  ]),
  unit('ton', 'ton', 'mass', [
    ...words('ton', 'tons', 'short ton', 'short tons', 'long ton', 'long tons'),
  ]),
  unit('lb', 'pound', 'mass', [
    ...syms('lb', 'lbs', 'LB', 'LBS'),
    ...words('pound', 'pounds'),
  ]),
  unit('oz', 'ounce', 'mass', [
    ...syms('oz', 'OZ', 'Oz'),
    ...words('ounce', 'ounces'),
  ]),
  unit('st', 'stone', 'mass', [
    sym('st', { rejectIfFollowedByWord: true }),
    ...words('stone', 'stones'),
  ]),
  unit('ct', 'carat', 'mass', [...syms('ct', 'CT'), ...words('carat', 'carats')]),

  // Volume
  unit('L', 'liter', 'volume', [
    ...syms('L', 'l'),
    ...words('liter', 'liters', 'litre', 'litres'),
  ]),
  unit('mL', 'milliliter', 'volume', [
    ...syms('mL', 'ml'),
    ...words('milliliter', 'milliliters', 'millilitre', 'millilitres'),
  ]),
  unit('cL', 'centiliter', 'volume', [
    ...syms('cL', 'cl'),
    ...words('centiliter', 'centiliters', 'centilitre', 'centilitres'),
  ]),
  unit('dL', 'deciliter', 'volume', [
    ...syms('dL', 'dl'),
    ...words('deciliter', 'deciliters', 'decilitre', 'decilitres'),
  ]),
  unit('µL', 'microliter', 'volume', [
    ...syms('µL', 'μL'),
    ...words('microliter', 'microliters', 'microlitre', 'microlitres'),
  ]),
  unit('m³', 'cubic meter', 'volume', [
    ...syms('m³', 'm3', 'm^3', 'cu m', 'cu. m.'),
    ...words('cubic meter', 'cubic meters', 'cubic metre', 'cubic metres'),
  ]),
  unit('cm³', 'cubic centimeter', 'volume', [
    ...syms('cm³', 'cm3', 'cm^3', 'cc', 'CC'),
    ...words('cubic centimeter', 'cubic centimeters', 'cubic centimetre', 'cubic centimetres'),
  ]),
  unit('mm³', 'cubic millimeter', 'volume', [
    ...syms('mm³', 'mm3', 'mm^3'),
    ...words('cubic millimeter', 'cubic millimeters', 'cubic millimetre', 'cubic millimetres'),
  ]),
  unit('in³', 'cubic inch', 'volume', [
    ...syms('in³', 'in3', 'in^3', 'cu in'),
    ...words('cubic inch', 'cubic inches'),
  ]),
  unit('ft³', 'cubic foot', 'volume', [
    ...syms('ft³', 'ft3', 'ft^3', 'cu ft'),
    ...words('cubic foot', 'cubic feet'),
  ]),
  unit('yd³', 'cubic yard', 'volume', [
    ...syms('yd³', 'yd3', 'yd^3', 'cu yd'),
    ...words('cubic yard', 'cubic yards'),
  ]),
  unit('gal', 'gallon', 'volume', [
    ...syms('gal', 'GAL'),
    ...words('gallon', 'gallons'),
  ]),
  unit('qt', 'quart', 'volume', [
    ...syms('qt', 'QT'),
    ...words('quart', 'quarts'),
  ]),
  unit('pt', 'pint', 'volume', [
    ...syms('pt', 'PT'),
    ...words('pint', 'pints'),
  ]),
  unit('cup', 'cup', 'volume', [...words('cup', 'cups')]),
  unit('fl oz', 'fluid ounce', 'volume', [
    ...syms('fl oz', 'fl. oz.', 'floz'),
    ...words('fluid ounce', 'fluid ounces', 'fluid oz'),
  ]),
  unit('tbsp', 'tablespoon', 'volume', [
    ...syms('tbsp', 'tbsp.', 'Tbsp', 'Tbsp.'),
    ...words('tablespoon', 'tablespoons'),
  ]),
  unit('tsp', 'teaspoon', 'volume', [
    ...syms('tsp', 'tsp.', 'Tsp', 'Tsp.'),
    ...words('teaspoon', 'teaspoons'),
  ]),
  unit('bbl', 'barrel', 'volume', [
    ...syms('bbl', 'BBL'),
    ...words('barrel', 'barrels'),
  ]),
  unit('bu', 'bushel', 'volume', [
    ...syms('bu', 'BU'),
    ...words('bushel', 'bushels'),
  ]),

  // Area
  unit('m²', 'square meter', 'area', [
    ...syms('m²', 'm2', 'm^2', 'sq m', 'sqm'),
    ...words('square meter', 'square meters', 'square metre', 'square metres'),
  ]),
  unit('km²', 'square kilometer', 'area', [
    ...syms('km²', 'km2', 'km^2', 'sq km', 'sqkm'),
    ...words('square kilometer', 'square kilometers', 'square kilometre', 'square kilometres'),
  ]),
  unit('cm²', 'square centimeter', 'area', [
    ...syms('cm²', 'cm2', 'cm^2', 'sq cm', 'sqcm'),
    ...words('square centimeter', 'square centimeters', 'square centimetre', 'square centimetres'),
  ]),
  unit('mm²', 'square millimeter', 'area', [
    ...syms('mm²', 'mm2', 'mm^2', 'sq mm', 'sqmm'),
    ...words('square millimeter', 'square millimeters', 'square millimetre', 'square millimetres'),
  ]),
  unit('ha', 'hectare', 'area', [sym('ha'), ...words('hectare', 'hectares')]),
  unit('ac', 'acre', 'area', [sym('ac'), ...words('acre', 'acres')]),
  unit('in²', 'square inch', 'area', [
    ...syms('in²', 'in2', 'in^2', 'sq in', 'sqin'),
    ...words('square inch', 'square inches'),
  ]),
  unit('ft²', 'square foot', 'area', [
    ...syms('ft²', 'ft2', 'ft^2', 'sq ft', 'sqft'),
    ...words('square foot', 'square feet'),
  ]),
  unit('yd²', 'square yard', 'area', [
    ...syms('yd²', 'yd2', 'yd^2', 'sq yd', 'sqyd'),
    ...words('square yard', 'square yards'),
  ]),
  unit('mi²', 'square mile', 'area', [
    ...syms('mi²', 'mi2', 'mi^2', 'sq mi', 'sqmi'),
    ...words('square mile', 'square miles'),
  ]),

  // Area density
  unit('kg/m²', 'kilogram per square meter', 'area-density', [
    ...syms('kg/m²', 'kg/m2', 'kg/m^2'),
  ]),

  // Speed
  unit('m/s', 'meter per second', 'speed', [
    ...syms('m/s', 'mps'),
    ...words('meter per second', 'meters per second', 'metre per second', 'metres per second'),
  ]),
  unit('km/h', 'kilometer per hour', 'speed', [
    ...syms('km/h', 'kmh', 'kph', 'km/hr'),
    ...words('kilometer per hour', 'kilometers per hour', 'kilometre per hour', 'kilometres per hour'),
  ]),
  unit('mph', 'mile per hour', 'speed', [
    ...syms('mph', 'MPH', 'mi/h'),
    ...words('mile per hour', 'miles per hour'),
  ]),
  unit('ft/s', 'foot per second', 'speed', [
    ...syms('ft/s', 'ftps'),
    ...words('foot per second', 'feet per second'),
  ]),
  unit('kn', 'knot', 'speed', [sym('kn'), ...words('knot', 'knots')]),
  unit('Mach', 'mach', 'speed', [...words('mach')]),

  // Acceleration
  unit('m/s²', 'meter per second squared', 'acceleration', [
    ...syms('m/s²', 'm/s2', 'm/s^2'),
    ...words(
      'meter per second squared',
      'meters per second squared',
      'metre per second squared',
      'metres per second squared',
    ),
  ]),
  unit('ft/s²', 'foot per second squared', 'acceleration', [
    ...syms('ft/s²', 'ft/s2', 'ft/s^2'),
    ...words('foot per second squared', 'feet per second squared'),
  ]),

  // Energy
  unit('J', 'joule', 'energy', [sym('J'), ...words('joule', 'joules')]),
  unit('kJ', 'kilojoule', 'energy', [sym('kJ'), ...words('kilojoule', 'kilojoules')]),
  unit('MJ', 'megajoule', 'energy', [sym('MJ'), ...words('megajoule', 'megajoules')]),
  unit('GJ', 'gigajoule', 'energy', [sym('GJ'), ...words('gigajoule', 'gigajoules')]),
  unit('cal', 'calorie', 'energy', [sym('cal'), ...words('calorie', 'calories')]),
  unit('kcal', 'kilocalorie', 'energy', [
    ...syms('kcal', 'Kcal', 'KCAL', 'Cal', 'Calories'),
    ...words('kilocalorie', 'kilocalories'),
  ]),
  unit('Wh', 'watt-hour', 'energy', [
    ...syms('Wh', 'wh'),
    ...words('watt-hour', 'watt-hours', 'watt hour', 'watt hours'),
  ]),
  unit('kWh', 'kilowatt-hour', 'energy', [
    ...syms('kWh', 'kwh'),
    ...words('kilowatt-hour', 'kilowatt-hours', 'kilowatt hour', 'kilowatt hours'),
  ]),
  unit('MWh', 'megawatt-hour', 'energy', [
    ...syms('MWh', 'mwh'),
    ...words('megawatt-hour', 'megawatt-hours', 'megawatt hour', 'megawatt hours'),
  ]),
  unit('GWh', 'gigawatt-hour', 'energy', [
    ...syms('GWh', 'gwh'),
    ...words('gigawatt-hour', 'gigawatt-hours', 'gigawatt hour', 'gigawatt hours'),
  ]),
  unit('eV', 'electronvolt', 'energy', [
    ...syms('eV', 'ev'),
    ...words('electronvolt', 'electronvolts', 'electron volt', 'electron volts'),
  ]),
  unit('keV', 'kiloelectronvolt', 'energy', [
    sym('keV'),
    ...words('kiloelectronvolt', 'kiloelectronvolts'),
  ]),
  unit('MeV', 'megaelectronvolt', 'energy', [
    sym('MeV'),
    ...words('megaelectronvolt', 'megaelectronvolts'),
  ]),
  unit('GeV', 'gigaelectronvolt', 'energy', [
    sym('GeV'),
    ...words('gigaelectronvolt', 'gigaelectronvolts'),
  ]),
  unit('TeV', 'teraelectronvolt', 'energy', [
    sym('TeV'),
    ...words('teraelectronvolt', 'teraelectronvolts'),
  ]),
  unit('BTU', 'British thermal unit', 'energy', [
    ...syms('BTU', 'Btu', 'btu'),
    ...words('british thermal unit', 'british thermal units'),
  ]),
  unit('therm', 'therm', 'energy', [...words('therm', 'therms')]),
  unit('erg', 'erg', 'energy', [...words('erg', 'ergs')]),
  unit('ft-lb', 'foot-pound', 'energy', [
    ...syms('ft-lb', 'ft·lb', 'ftlb'),
    ...words('foot-pound', 'foot-pounds', 'foot pound', 'foot pounds'),
  ]),

  // Pressure
  unit('Pa', 'pascal', 'pressure', [sym('Pa'), ...words('pascal', 'pascals')]),
  unit('kPa', 'kilopascal', 'pressure', [
    ...syms('kPa', 'kpa'),
    ...words('kilopascal', 'kilopascals'),
  ]),
  unit('MPa', 'megapascal', 'pressure', [
    ...syms('MPa', 'mpa'),
    ...words('megapascal', 'megapascals'),
  ]),
  unit('GPa', 'gigapascal', 'pressure', [
    ...syms('GPa', 'gpa'),
    ...words('gigapascal', 'gigapascals'),
  ]),
  unit('hPa', 'hectopascal', 'pressure', [
    ...syms('hPa', 'hpa'),
    ...words('hectopascal', 'hectopascals'),
  ]),
  unit('bar', 'bar', 'pressure', [...words('bar', 'bars')]),
  unit('mbar', 'millibar', 'pressure', [
    ...syms('mbar', 'mBar'),
    ...words('millibar', 'millibars'),
  ]),
  unit('psi', 'pound per square inch', 'pressure', [
    ...syms('psi', 'PSI'),
    ...words('pounds per square inch', 'pound per square inch'),
  ]),
  unit('atm', 'atmosphere', 'pressure', [
    ...syms('atm', 'ATM'),
    ...words('atmosphere', 'atmospheres'),
  ]),
  unit('mmHg', 'millimeter of mercury', 'pressure', [
    ...syms('mmHg', 'mm Hg'),
    ...words('millimeter of mercury', 'millimeters of mercury', 'millimetre of mercury', 'millimetres of mercury'),
  ]),
  unit('inHg', 'inch of mercury', 'pressure', [
    ...syms('inHg', 'in Hg'),
    ...words('inch of mercury', 'inches of mercury'),
  ]),
  unit('torr', 'torr', 'pressure', [...words('torr')]),

  // Power
  unit('W', 'watt', 'power', [sym('W'), ...words('watt', 'watts')]),
  unit('kW', 'kilowatt', 'power', [
    ...syms('kW', 'kw', 'KW'),
    ...words('kilowatt', 'kilowatts'),
  ]),
  unit('MW', 'megawatt', 'power', [
    ...syms('MW', 'mw'),
    ...words('megawatt', 'megawatts'),
  ]),
  unit('GW', 'gigawatt', 'power', [
    ...syms('GW', 'gw'),
    ...words('gigawatt', 'gigawatts'),
  ]),
  unit('TW', 'terawatt', 'power', [
    ...syms('TW', 'tw'),
    ...words('terawatt', 'terawatts'),
  ]),
  unit('hp', 'horsepower', 'power', [...syms('hp', 'HP'), ...words('horsepower')]),
  unit('BTU/h', 'BTU per hour', 'power', [
    ...syms('BTU/h', 'BTU/hr', 'Btu/h', 'btu/h'),
  ]),

  // Force
  unit('N', 'newton', 'force', [sym('N'), ...words('newton', 'newtons')]),
  unit('kN', 'kilonewton', 'force', [sym('kN'), ...words('kilonewton', 'kilonewtons')]),
  unit('MN', 'meganewton', 'force', [sym('MN'), ...words('meganewton', 'meganewtons')]),
  unit('lbf', 'pound-force', 'force', [
    ...syms('lbf', 'LBF'),
    ...words('pound-force', 'pounds-force'),
  ]),
  unit('kgf', 'kilogram-force', 'force', [
    ...syms('kgf', 'KGF'),
    ...words('kilogram-force'),
  ]),
  unit('dyn', 'dyne', 'force', [sym('dyn'), ...words('dyne', 'dynes')]),
  unit('kip', 'kip', 'force', [...words('kip', 'kips')]),

  // Torque
  unit('Nm', 'newton-meter', 'torque', [
    ...syms('Nm', 'N·m', 'N m'),
    ...words('newton-meter', 'newton-meters', 'newton metre', 'newton metres'),
  ]),
  unit('kNm', 'kilonewton-meter', 'torque', [
    ...syms('kNm', 'kN·m'),
    ...words('kilonewton-meter', 'kilonewton-meters'),
  ]),
  unit('lb-ft', 'pound-foot', 'torque', [
    ...syms('lb-ft', 'lb·ft', 'lbft'),
    ...words('pound-foot', 'pound-feet', 'pound foot', 'pound feet'),
  ]),
  unit('kgf-m', 'kilogram-force meter', 'torque', [
    ...syms('kgf-m', 'kgf·m'),
  ]),

  // Time
  unit('s', 'second', 'time', [
    sym('s', { rejectIfFollowedByWord: true }),
    ...syms('sec', 'secs'),
    ...words('second', 'seconds'),
  ]),
  unit('ms', 'millisecond', 'time', [
    ...syms('ms', 'msec'),
    ...words('millisecond', 'milliseconds'),
  ]),
  unit('µs', 'microsecond', 'time', [
    ...syms('µs', 'μs'),
    ...words('microsecond', 'microseconds'),
  ]),
  unit('ns', 'nanosecond', 'time', [sym('ns'), ...words('nanosecond', 'nanoseconds')]),
  unit('min', 'minute', 'time', [...syms('min', 'mins'), ...words('minute', 'minutes')]),
  unit('h', 'hour', 'time', [
    sym('h', { rejectIfFollowedByWord: true }),
    ...syms('hr', 'hrs'),
    ...words('hour', 'hours'),
  ]),
  unit('d', 'day', 'time', [
    sym('d', { rejectIfFollowedByWord: true }),
    ...words('day', 'days'),
  ]),
  unit('wk', 'week', 'time', [...syms('wk', 'wks'), ...words('week', 'weeks')]),
  unit('mo', 'month', 'time', [...syms('mo', 'mos'), ...words('month', 'months')]),
  unit('yr', 'year', 'time', [...syms('yr', 'yrs'), ...words('year', 'years')]),
  unit('decade', 'decade', 'time', [...words('decade', 'decades')]),
  unit('century', 'century', 'time', [...words('century', 'centuries')]),

  // Data
  unit('byte', 'byte', 'data', [...words('byte', 'bytes')]),
  unit('KB', 'kilobyte', 'data', [...syms('KB', 'kB'), ...words('kilobyte', 'kilobytes')]),
  unit('MB', 'megabyte', 'data', [sym('MB'), ...words('megabyte', 'megabytes')]),
  unit('GB', 'gigabyte', 'data', [sym('GB'), ...words('gigabyte', 'gigabytes')]),
  unit('TB', 'terabyte', 'data', [sym('TB'), ...words('terabyte', 'terabytes')]),
  unit('PB', 'petabyte', 'data', [sym('PB'), ...words('petabyte', 'petabytes')]),
  unit('EB', 'exabyte', 'data', [sym('EB'), ...words('exabyte', 'exabytes')]),
  unit('KiB', 'kibibyte', 'data', [sym('KiB'), ...words('kibibyte', 'kibibytes')]),
  unit('MiB', 'mebibyte', 'data', [sym('MiB'), ...words('mebibyte', 'mebibytes')]),
  unit('GiB', 'gibibyte', 'data', [sym('GiB'), ...words('gibibyte', 'gibibytes')]),
  unit('TiB', 'tebibyte', 'data', [sym('TiB'), ...words('tebibyte', 'tebibytes')]),
  unit('bit', 'bit', 'data', [...words('bit', 'bits')]),
  unit('kbit', 'kilobit', 'data', [
    ...syms('kbit', 'Kbit', 'Kb'),
    ...words('kilobit', 'kilobits'),
  ]),
  unit('Mbit', 'megabit', 'data', [
    ...syms('Mbit', 'Mb'),
    ...words('megabit', 'megabits'),
  ]),
  unit('Gbit', 'gigabit', 'data', [
    ...syms('Gbit', 'Gb'),
    ...words('gigabit', 'gigabits'),
  ]),
  unit('Tbit', 'terabit', 'data', [
    ...syms('Tbit', 'Tb'),
    ...words('terabit', 'terabits'),
  ]),
  unit('bps', 'bit per second', 'data', [
    ...syms('bps', 'bit/s'),
    ...words('bits per second', 'bit per second'),
  ]),
  unit('kbps', 'kilobit per second', 'data', [
    ...syms('kbps', 'Kbps', 'kbit/s', 'Kb/s'),
    ...words('kilobits per second', 'kilobit per second'),
  ]),
  unit('Mbps', 'megabit per second', 'data', [
    ...syms('Mbps', 'Mbit/s', 'Mb/s'),
    ...words('megabits per second', 'megabit per second'),
  ]),
  unit('Gbps', 'gigabit per second', 'data', [
    ...syms('Gbps', 'Gbit/s', 'Gb/s'),
    ...words('gigabits per second', 'gigabit per second'),
  ]),
  unit('Tbps', 'terabit per second', 'data', [
    ...syms('Tbps', 'Tbit/s', 'Tb/s'),
    ...words('terabits per second', 'terabit per second'),
  ]),
  unit('KB/s', 'kilobyte per second', 'data', [
    ...syms('KB/s', 'kB/s', 'KBps', 'kBps'),
    ...words('kilobytes per second', 'kilobyte per second'),
  ]),
  unit('MB/s', 'megabyte per second', 'data', [
    ...syms('MB/s', 'MBps'),
    ...words('megabytes per second', 'megabyte per second'),
  ]),
  unit('GB/s', 'gigabyte per second', 'data', [
    ...syms('GB/s', 'GBps'),
    ...words('gigabytes per second', 'gigabyte per second'),
  ]),
  unit('TB/s', 'terabyte per second', 'data', [
    ...syms('TB/s', 'TBps'),
    ...words('terabytes per second', 'terabyte per second'),
  ]),
  unit('KiB/s', 'kibibyte per second', 'data', [
    sym('KiB/s'),
    ...words('kibibytes per second', 'kibibyte per second'),
  ]),
  unit('MiB/s', 'mebibyte per second', 'data', [
    sym('MiB/s'),
    ...words('mebibytes per second', 'mebibyte per second'),
  ]),
  unit('GiB/s', 'gibibyte per second', 'data', [
    sym('GiB/s'),
    ...words('gibibytes per second', 'gibibyte per second'),
  ]),

  // Angle
  unit('rad', 'radian', 'angle', [sym('rad'), ...words('radian', 'radians')]),
  unit('mrad', 'milliradian', 'angle', [sym('mrad'), ...words('milliradian', 'milliradians')]),
  unit('arcmin', 'arcminute', 'angle', [sym('arcmin'), ...words('arcminute', 'arcminutes')]),
  unit('arcsec', 'arcsecond', 'angle', [sym('arcsec'), ...words('arcsecond', 'arcseconds')]),
  unit('grad', 'gradian', 'angle', [sym('grad'), sym('gon'), ...words('gradian', 'gradians')]),

  // Frequency
  unit('Hz', 'hertz', 'frequency', [sym('Hz'), ...words('hertz')]),
  unit('kHz', 'kilohertz', 'frequency', [sym('kHz'), ...words('kilohertz')]),
  unit('MHz', 'megahertz', 'frequency', [sym('MHz'), ...words('megahertz')]),
  unit('GHz', 'gigahertz', 'frequency', [sym('GHz'), ...words('gigahertz')]),
  unit('THz', 'terahertz', 'frequency', [sym('THz'), ...words('terahertz')]),
  unit('rpm', 'revolutions per minute', 'frequency', [
    ...syms('rpm', 'RPM'),
    ...words('revolutions per minute', 'revolution per minute'),
  ]),

  // Fuel economy
  unit('mpg', 'miles per gallon', 'fuel-economy', [
    ...syms('mpg', 'MPG'),
    ...words('miles per gallon', 'mile per gallon'),
  ]),
  unit('L/100km', 'liters per 100 km', 'fuel-economy', [
    ...syms('L/100km', 'l/100km', 'L/100 km', 'l/100 km'),
    ...words('liters per 100 km', 'litres per 100 km', 'liter per 100 km', 'litre per 100 km'),
  ]),
  unit('km/L', 'kilometers per liter', 'fuel-economy', [
    ...syms('km/L', 'km/l'),
    ...words('kilometers per liter', 'kilometres per litre', 'kilometer per liter', 'kilometre per litre'),
  ]),
];
