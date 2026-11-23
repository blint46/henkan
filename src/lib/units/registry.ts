import type { AliasOptions, UnitCategory, UnitDefinition } from './types';

const symbol = (
  text: string,
  options: Omit<AliasOptions, 'text' | 'caseSensitive'> = {},
): AliasOptions => ({ text, caseSensitive: true, ...options });

const word = (
  text: string,
  options: Omit<AliasOptions, 'text' | 'caseSensitive'> = {},
): AliasOptions => ({ text, caseSensitive: false, ...options });

const symbols = (...texts: string[]): AliasOptions[] =>
  texts.map((text) => symbol(text));

const words = (...texts: string[]): AliasOptions[] =>
  texts.map((text) => word(text));

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
    ...symbols('°C', '° C', '℃'),
    ...words('celsius', 'degree celsius', 'degrees celsius', 'degree c', 'degrees c', 'deg c', 'deg. c'),
  ]),
  unit('°F', 'Fahrenheit', 'temperature', [
    ...symbols('°F', '° F', '℉'),
    ...words('fahrenheit', 'degree fahrenheit', 'degrees fahrenheit', 'degree f', 'degrees f', 'deg f', 'deg. f'),
  ]),
  unit('K', 'Kelvin', 'temperature', [
    symbol('K', { requireSpace: true }),
    ...words('kelvin', 'kelvins', 'degree kelvin', 'degrees kelvin', 'deg k'),
  ]),
  unit('°R', 'Rankine', 'temperature', [
    ...symbols('°R', '° R'),
    ...words('rankine', 'degree rankine', 'degrees rankine'),
  ]),

  // Length
  unit('m', 'meter', 'length', [
    symbol('m', { rejectIfPrecededByCurrency: true }),
    ...words('meter', 'meters', 'metre', 'metres'),
  ]),
  unit('km', 'kilometer', 'length', [
    ...symbols('km', 'KM'),
    ...words('kilometer', 'kilometers', 'kilometre', 'kilometres'),
  ]),
  unit('cm', 'centimeter', 'length', [
    ...symbols('cm', 'CM'),
    ...words('centimeter', 'centimeters', 'centimetre', 'centimetres'),
  ]),
  unit('mm', 'millimeter', 'length', [
    symbol('mm'),
    ...words('millimeter', 'millimeters', 'millimetre', 'millimetres'),
  ]),
  unit('µm', 'micrometer', 'length', [
    ...symbols('µm', 'μm'),
    ...words('micrometer', 'micrometers', 'micrometre', 'micrometres'),
  ]),
  unit('nm', 'nanometer', 'length', [
    symbol('nm'),
    ...words('nanometer', 'nanometers', 'nanometre', 'nanometres'),
  ]),
  unit('in', 'inch', 'length', [
    symbol('in', { rejectIfFollowedByWord: true }),
    symbol('in.', { rejectIfFollowedByWord: true }),
    symbol('″'),
    symbol('′′'),
    ...words('inch', 'inches'),
  ]),
  unit('ft', 'foot', 'length', [
    ...symbols('ft', 'FT', 'ft.', '′'),
    ...words('foot', 'feet'),
  ]),
  unit('yd', 'yard', 'length', [
    ...symbols('yd', 'YD'),
    ...words('yard', 'yards'),
  ]),
  unit('mi', 'mile', 'length', [symbol('mi'), ...words('mile', 'miles')]),
  unit('nmi', 'nautical mile', 'length', [
    ...symbols('nmi', 'NM'),
    ...words('nautical mile', 'nautical miles'),
  ]),
  unit('ly', 'light-year', 'length', [
    symbol('ly'),
    ...words('light-year', 'light-years', 'light year', 'light years'),
  ]),
  unit('AU', 'astronomical unit', 'length', [
    ...symbols('AU', 'au'),
    ...words('astronomical unit', 'astronomical units'),
  ]),
  unit('pc', 'parsec', 'length', [...words('parsec', 'parsecs')]),
  unit('Å', 'angstrom', 'length', [symbol('Å'), ...words('angstrom', 'angstroms')]),

  // Mass
  unit('g', 'gram', 'mass', [symbol('g'), ...words('gram', 'grams', 'gramme', 'grammes')]),
  unit('kg', 'kilogram', 'mass', [
    ...symbols('kg', 'KG'),
    ...words('kilogram', 'kilograms', 'kilogramme', 'kilogrammes'),
  ]),
  unit('mg', 'milligram', 'mass', [
    symbol('mg'),
    ...words('milligram', 'milligrams'),
  ]),
  unit('µg', 'microgram', 'mass', [
    ...symbols('µg', 'μg', 'mcg'),
    ...words('microgram', 'micrograms'),
  ]),
  unit('t', 'tonne', 'mass', [
    symbol('t', { rejectIfFollowedByWord: true }),
    ...words('tonne', 'tonnes', 'metric ton', 'metric tons', 'metric tonne', 'metric tonnes'),
  ]),
  unit('ton', 'ton', 'mass', [
    ...words('ton', 'tons', 'short ton', 'short tons', 'long ton', 'long tons'),
  ]),
  unit('lb', 'pound', 'mass', [
    ...symbols('lb', 'lbs', 'LB', 'LBS'),
    ...words('pound', 'pounds'),
  ]),
  unit('oz', 'ounce', 'mass', [
    ...symbols('oz', 'OZ', 'Oz'),
    ...words('ounce', 'ounces'),
  ]),
  unit('st', 'stone', 'mass', [
    symbol('st', { rejectIfFollowedByWord: true }),
    ...words('stone', 'stones'),
  ]),
  unit('ct', 'carat', 'mass', [...symbols('ct', 'CT'), ...words('carat', 'carats')]),

  // Volume
  unit('L', 'liter', 'volume', [
    ...symbols('L', 'l'),
    ...words('liter', 'liters', 'litre', 'litres'),
  ]),
  unit('mL', 'milliliter', 'volume', [
    ...symbols('mL', 'ml'),
    ...words('milliliter', 'milliliters', 'millilitre', 'millilitres'),
  ]),
  unit('cL', 'centiliter', 'volume', [
    ...symbols('cL', 'cl'),
    ...words('centiliter', 'centiliters', 'centilitre', 'centilitres'),
  ]),
  unit('dL', 'deciliter', 'volume', [
    ...symbols('dL', 'dl'),
    ...words('deciliter', 'deciliters', 'decilitre', 'decilitres'),
  ]),
  unit('µL', 'microliter', 'volume', [
    ...symbols('µL', 'μL'),
    ...words('microliter', 'microliters', 'microlitre', 'microlitres'),
  ]),
  unit('m³', 'cubic meter', 'volume', [
    ...symbols('m³', 'm3', 'm^3', 'cu m', 'cu. m.'),
    ...words('cubic meter', 'cubic meters', 'cubic metre', 'cubic metres'),
  ]),
  unit('cm³', 'cubic centimeter', 'volume', [
    ...symbols('cm³', 'cm3', 'cm^3', 'cc', 'CC'),
    ...words('cubic centimeter', 'cubic centimeters', 'cubic centimetre', 'cubic centimetres'),
  ]),
  unit('mm³', 'cubic millimeter', 'volume', [
    ...symbols('mm³', 'mm3', 'mm^3'),
    ...words('cubic millimeter', 'cubic millimeters', 'cubic millimetre', 'cubic millimetres'),
  ]),
  unit('in³', 'cubic inch', 'volume', [
    ...symbols('in³', 'in3', 'in^3', 'cu in'),
    ...words('cubic inch', 'cubic inches'),
  ]),
  unit('ft³', 'cubic foot', 'volume', [
    ...symbols('ft³', 'ft3', 'ft^3', 'cu ft'),
    ...words('cubic foot', 'cubic feet'),
  ]),
  unit('yd³', 'cubic yard', 'volume', [
    ...symbols('yd³', 'yd3', 'yd^3', 'cu yd'),
    ...words('cubic yard', 'cubic yards'),
  ]),
  unit('gal', 'gallon', 'volume', [
    ...symbols('gal', 'GAL'),
    ...words('gallon', 'gallons'),
  ]),
  unit('qt', 'quart', 'volume', [
    ...symbols('qt', 'QT'),
    ...words('quart', 'quarts'),
  ]),
  unit('pt', 'pint', 'volume', [
    ...symbols('pt', 'PT'),
    ...words('pint', 'pints'),
  ]),
  unit('cup', 'cup', 'volume', [...words('cup', 'cups')]),
  unit('fl oz', 'fluid ounce', 'volume', [
    ...symbols('fl oz', 'fl. oz.', 'floz'),
    ...words('fluid ounce', 'fluid ounces', 'fluid oz'),
  ]),
  unit('tbsp', 'tablespoon', 'volume', [
    ...symbols('tbsp', 'tbsp.', 'Tbsp', 'Tbsp.'),
    ...words('tablespoon', 'tablespoons'),
  ]),
  unit('tsp', 'teaspoon', 'volume', [
    ...symbols('tsp', 'tsp.', 'Tsp', 'Tsp.'),
    ...words('teaspoon', 'teaspoons'),
  ]),
  unit('bbl', 'barrel', 'volume', [
    ...symbols('bbl', 'BBL'),
    ...words('barrel', 'barrels'),
  ]),
  unit('bu', 'bushel', 'volume', [
    ...symbols('bu', 'BU'),
    ...words('bushel', 'bushels'),
  ]),

  // Area
  unit('m²', 'square meter', 'area', [
    ...symbols('m²', 'm2', 'm^2', 'sq m', 'sqm'),
    ...words('square meter', 'square meters', 'square metre', 'square metres'),
  ]),
  unit('km²', 'square kilometer', 'area', [
    ...symbols('km²', 'km2', 'km^2', 'sq km', 'sqkm'),
    ...words('square kilometer', 'square kilometers', 'square kilometre', 'square kilometres'),
  ]),
  unit('cm²', 'square centimeter', 'area', [
    ...symbols('cm²', 'cm2', 'cm^2', 'sq cm', 'sqcm'),
    ...words('square centimeter', 'square centimeters', 'square centimetre', 'square centimetres'),
  ]),
  unit('mm²', 'square millimeter', 'area', [
    ...symbols('mm²', 'mm2', 'mm^2', 'sq mm', 'sqmm'),
    ...words('square millimeter', 'square millimeters', 'square millimetre', 'square millimetres'),
  ]),
  unit('ha', 'hectare', 'area', [symbol('ha'), ...words('hectare', 'hectares')]),
  unit('ac', 'acre', 'area', [symbol('ac'), ...words('acre', 'acres')]),
  unit('in²', 'square inch', 'area', [
    ...symbols('in²', 'in2', 'in^2', 'sq in', 'sqin'),
    ...words('square inch', 'square inches'),
  ]),
  unit('ft²', 'square foot', 'area', [
    ...symbols('ft²', 'ft2', 'ft^2', 'sq ft', 'sqft'),
    ...words('square foot', 'square feet'),
  ]),
  unit('yd²', 'square yard', 'area', [
    ...symbols('yd²', 'yd2', 'yd^2', 'sq yd', 'sqyd'),
    ...words('square yard', 'square yards'),
  ]),
  unit('mi²', 'square mile', 'area', [
    ...symbols('mi²', 'mi2', 'mi^2', 'sq mi', 'sqmi'),
    ...words('square mile', 'square miles'),
  ]),

  // Area density
  unit('kg/m²', 'kilogram per square meter', 'area-density', [
    ...symbols('kg/m²', 'kg/m2', 'kg/m^2'),
  ]),

  // Speed
  unit('m/s', 'meter per second', 'speed', [
    ...symbols('m/s', 'mps'),
    ...words('meter per second', 'meters per second', 'metre per second', 'metres per second'),
  ]),
  unit('km/h', 'kilometer per hour', 'speed', [
    ...symbols('km/h', 'kmh', 'kph', 'km/hr'),
    ...words('kilometer per hour', 'kilometers per hour', 'kilometre per hour', 'kilometres per hour'),
  ]),
  unit('mph', 'mile per hour', 'speed', [
    ...symbols('mph', 'MPH', 'mi/h'),
    ...words('mile per hour', 'miles per hour'),
  ]),
  unit('ft/s', 'foot per second', 'speed', [
    ...symbols('ft/s', 'ftps'),
    ...words('foot per second', 'feet per second'),
  ]),
  unit('kn', 'knot', 'speed', [symbol('kn'), ...words('knot', 'knots')]),
  unit('Mach', 'mach', 'speed', [...words('mach')]),

  // Acceleration
  unit('m/s²', 'meter per second squared', 'acceleration', [
    ...symbols('m/s²', 'm/s2', 'm/s^2'),
    ...words(
      'meter per second squared',
      'meters per second squared',
      'metre per second squared',
      'metres per second squared',
    ),
  ]),
  unit('ft/s²', 'foot per second squared', 'acceleration', [
    ...symbols('ft/s²', 'ft/s2', 'ft/s^2'),
    ...words('foot per second squared', 'feet per second squared'),
  ]),

  // Energy
  unit('J', 'joule', 'energy', [symbol('J'), ...words('joule', 'joules')]),
  unit('kJ', 'kilojoule', 'energy', [symbol('kJ'), ...words('kilojoule', 'kilojoules')]),
  unit('MJ', 'megajoule', 'energy', [symbol('MJ'), ...words('megajoule', 'megajoules')]),
  unit('GJ', 'gigajoule', 'energy', [symbol('GJ'), ...words('gigajoule', 'gigajoules')]),
  unit('cal', 'calorie', 'energy', [symbol('cal'), ...words('calorie', 'calories')]),
  unit('kcal', 'kilocalorie', 'energy', [
    ...symbols('kcal', 'Kcal', 'KCAL', 'Cal', 'Calories'),
    ...words('kilocalorie', 'kilocalories'),
  ]),
  unit('Wh', 'watt-hour', 'energy', [
    ...symbols('Wh', 'wh'),
    ...words('watt-hour', 'watt-hours', 'watt hour', 'watt hours'),
  ]),
  unit('kWh', 'kilowatt-hour', 'energy', [
    ...symbols('kWh', 'kwh'),
    ...words('kilowatt-hour', 'kilowatt-hours', 'kilowatt hour', 'kilowatt hours'),
  ]),
  unit('MWh', 'megawatt-hour', 'energy', [
    ...symbols('MWh', 'mwh'),
    ...words('megawatt-hour', 'megawatt-hours', 'megawatt hour', 'megawatt hours'),
  ]),
  unit('GWh', 'gigawatt-hour', 'energy', [
    ...symbols('GWh', 'gwh'),
    ...words('gigawatt-hour', 'gigawatt-hours', 'gigawatt hour', 'gigawatt hours'),
  ]),
  unit('eV', 'electronvolt', 'energy', [
    ...symbols('eV', 'ev'),
    ...words('electronvolt', 'electronvolts', 'electron volt', 'electron volts'),
  ]),
  unit('keV', 'kiloelectronvolt', 'energy', [
    symbol('keV'),
    ...words('kiloelectronvolt', 'kiloelectronvolts'),
  ]),
  unit('MeV', 'megaelectronvolt', 'energy', [
    symbol('MeV'),
    ...words('megaelectronvolt', 'megaelectronvolts'),
  ]),
  unit('GeV', 'gigaelectronvolt', 'energy', [
    symbol('GeV'),
    ...words('gigaelectronvolt', 'gigaelectronvolts'),
  ]),
  unit('TeV', 'teraelectronvolt', 'energy', [
    symbol('TeV'),
    ...words('teraelectronvolt', 'teraelectronvolts'),
  ]),
  unit('BTU', 'British thermal unit', 'energy', [
    ...symbols('BTU', 'Btu', 'btu'),
    ...words('british thermal unit', 'british thermal units'),
  ]),
  unit('therm', 'therm', 'energy', [...words('therm', 'therms')]),
  unit('erg', 'erg', 'energy', [...words('erg', 'ergs')]),
  unit('ft-lb', 'foot-pound', 'energy', [
    ...symbols('ft-lb', 'ft·lb', 'ftlb'),
    ...words('foot-pound', 'foot-pounds', 'foot pound', 'foot pounds'),
  ]),

  // Pressure
  unit('Pa', 'pascal', 'pressure', [symbol('Pa'), ...words('pascal', 'pascals')]),
  unit('kPa', 'kilopascal', 'pressure', [
    ...symbols('kPa', 'kpa'),
    ...words('kilopascal', 'kilopascals'),
  ]),
  unit('MPa', 'megapascal', 'pressure', [
    ...symbols('MPa', 'mpa'),
    ...words('megapascal', 'megapascals'),
  ]),
  unit('GPa', 'gigapascal', 'pressure', [
    ...symbols('GPa', 'gpa'),
    ...words('gigapascal', 'gigapascals'),
  ]),
  unit('hPa', 'hectopascal', 'pressure', [
    ...symbols('hPa', 'hpa'),
    ...words('hectopascal', 'hectopascals'),
  ]),
  unit('bar', 'bar', 'pressure', [...words('bar', 'bars')]),
  unit('mbar', 'millibar', 'pressure', [
    ...symbols('mbar', 'mBar'),
    ...words('millibar', 'millibars'),
  ]),
  unit('psi', 'pound per square inch', 'pressure', [
    ...symbols('psi', 'PSI'),
    ...words('pounds per square inch', 'pound per square inch'),
  ]),
  unit('atm', 'atmosphere', 'pressure', [
    ...symbols('atm', 'ATM'),
    ...words('atmosphere', 'atmospheres'),
  ]),
  unit('mmHg', 'millimeter of mercury', 'pressure', [
    ...symbols('mmHg', 'mm Hg'),
    ...words('millimeter of mercury', 'millimeters of mercury', 'millimetre of mercury', 'millimetres of mercury'),
  ]),
  unit('inHg', 'inch of mercury', 'pressure', [
    ...symbols('inHg', 'in Hg'),
    ...words('inch of mercury', 'inches of mercury'),
  ]),
  unit('torr', 'torr', 'pressure', [...words('torr')]),

  // Power
  unit('W', 'watt', 'power', [symbol('W'), ...words('watt', 'watts')]),
  unit('kW', 'kilowatt', 'power', [
    ...symbols('kW', 'kw', 'KW'),
    ...words('kilowatt', 'kilowatts'),
  ]),
  unit('MW', 'megawatt', 'power', [
    ...symbols('MW', 'mw'),
    ...words('megawatt', 'megawatts'),
  ]),
  unit('GW', 'gigawatt', 'power', [
    ...symbols('GW', 'gw'),
    ...words('gigawatt', 'gigawatts'),
  ]),
  unit('TW', 'terawatt', 'power', [
    ...symbols('TW', 'tw'),
    ...words('terawatt', 'terawatts'),
  ]),
  unit('hp', 'horsepower', 'power', [...symbols('hp', 'HP'), ...words('horsepower')]),
  unit('BTU/h', 'BTU per hour', 'power', [
    ...symbols('BTU/h', 'BTU/hr', 'Btu/h', 'btu/h'),
  ]),

  // Force
  unit('N', 'newton', 'force', [symbol('N'), ...words('newton', 'newtons')]),
  unit('kN', 'kilonewton', 'force', [symbol('kN'), ...words('kilonewton', 'kilonewtons')]),
  unit('MN', 'meganewton', 'force', [symbol('MN'), ...words('meganewton', 'meganewtons')]),
  unit('lbf', 'pound-force', 'force', [
    ...symbols('lbf', 'LBF'),
    ...words('pound-force', 'pounds-force'),
  ]),
  unit('kgf', 'kilogram-force', 'force', [
    ...symbols('kgf', 'KGF'),
    ...words('kilogram-force'),
  ]),
  unit('dyn', 'dyne', 'force', [symbol('dyn'), ...words('dyne', 'dynes')]),
  unit('kip', 'kip', 'force', [...words('kip', 'kips')]),

  // Torque
  unit('Nm', 'newton-meter', 'torque', [
    ...symbols('Nm', 'N·m', 'N m'),
    ...words('newton-meter', 'newton-meters', 'newton metre', 'newton metres'),
  ]),
  unit('kNm', 'kilonewton-meter', 'torque', [
    ...symbols('kNm', 'kN·m'),
    ...words('kilonewton-meter', 'kilonewton-meters'),
  ]),
  unit('lb-ft', 'pound-foot', 'torque', [
    ...symbols('lb-ft', 'lb·ft', 'lbft'),
    ...words('pound-foot', 'pound-feet', 'pound foot', 'pound feet'),
  ]),
  unit('kgf-m', 'kilogram-force meter', 'torque', [
    ...symbols('kgf-m', 'kgf·m'),
  ]),

  // Time
  unit('s', 'second', 'time', [
    symbol('s', { rejectIfFollowedByWord: true }),
    ...symbols('sec', 'secs'),
    ...words('second', 'seconds'),
  ]),
  unit('ms', 'millisecond', 'time', [
    ...symbols('ms', 'msec'),
    ...words('millisecond', 'milliseconds'),
  ]),
  unit('µs', 'microsecond', 'time', [
    ...symbols('µs', 'μs'),
    ...words('microsecond', 'microseconds'),
  ]),
  unit('ns', 'nanosecond', 'time', [symbol('ns'), ...words('nanosecond', 'nanoseconds')]),
  unit('min', 'minute', 'time', [...symbols('min', 'mins'), ...words('minute', 'minutes')]),
  unit('h', 'hour', 'time', [
    symbol('h', { rejectIfFollowedByWord: true }),
    ...symbols('hr', 'hrs'),
    ...words('hour', 'hours'),
  ]),
  unit('d', 'day', 'time', [
    symbol('d', { rejectIfFollowedByWord: true }),
    ...words('day', 'days'),
  ]),
  unit('wk', 'week', 'time', [...symbols('wk', 'wks'), ...words('week', 'weeks')]),
  unit('mo', 'month', 'time', [...symbols('mo', 'mos'), ...words('month', 'months')]),
  unit('yr', 'year', 'time', [...symbols('yr', 'yrs'), ...words('year', 'years')]),
  unit('decade', 'decade', 'time', [...words('decade', 'decades')]),
  unit('century', 'century', 'time', [...words('century', 'centuries')]),

  // Data
  unit('byte', 'byte', 'data', [...words('byte', 'bytes')]),
  unit('KB', 'kilobyte', 'data', [...symbols('KB', 'kB'), ...words('kilobyte', 'kilobytes')]),
  unit('MB', 'megabyte', 'data', [symbol('MB'), ...words('megabyte', 'megabytes')]),
  unit('GB', 'gigabyte', 'data', [symbol('GB'), ...words('gigabyte', 'gigabytes')]),
  unit('TB', 'terabyte', 'data', [symbol('TB'), ...words('terabyte', 'terabytes')]),
  unit('PB', 'petabyte', 'data', [symbol('PB'), ...words('petabyte', 'petabytes')]),
  unit('EB', 'exabyte', 'data', [symbol('EB'), ...words('exabyte', 'exabytes')]),
  unit('KiB', 'kibibyte', 'data', [symbol('KiB'), ...words('kibibyte', 'kibibytes')]),
  unit('MiB', 'mebibyte', 'data', [symbol('MiB'), ...words('mebibyte', 'mebibytes')]),
  unit('GiB', 'gibibyte', 'data', [symbol('GiB'), ...words('gibibyte', 'gibibytes')]),
  unit('TiB', 'tebibyte', 'data', [symbol('TiB'), ...words('tebibyte', 'tebibytes')]),
  unit('bit', 'bit', 'data', [...words('bit', 'bits')]),
  unit('kbit', 'kilobit', 'data', [
    ...symbols('kbit', 'Kbit', 'Kb'),
    ...words('kilobit', 'kilobits'),
  ]),
  unit('Mbit', 'megabit', 'data', [
    ...symbols('Mbit', 'Mb'),
    ...words('megabit', 'megabits'),
  ]),
  unit('Gbit', 'gigabit', 'data', [
    ...symbols('Gbit', 'Gb'),
    ...words('gigabit', 'gigabits'),
  ]),
  unit('Tbit', 'terabit', 'data', [
    ...symbols('Tbit', 'Tb'),
    ...words('terabit', 'terabits'),
  ]),
  unit('bps', 'bit per second', 'data', [
    ...symbols('bps', 'bit/s'),
    ...words('bits per second', 'bit per second'),
  ]),
  unit('kbps', 'kilobit per second', 'data', [
    ...symbols('kbps', 'Kbps', 'kbit/s', 'Kb/s'),
    ...words('kilobits per second', 'kilobit per second'),
  ]),
  unit('Mbps', 'megabit per second', 'data', [
    ...symbols('Mbps', 'Mbit/s', 'Mb/s'),
    ...words('megabits per second', 'megabit per second'),
  ]),
  unit('Gbps', 'gigabit per second', 'data', [
    ...symbols('Gbps', 'Gbit/s', 'Gb/s'),
    ...words('gigabits per second', 'gigabit per second'),
  ]),
  unit('Tbps', 'terabit per second', 'data', [
    ...symbols('Tbps', 'Tbit/s', 'Tb/s'),
    ...words('terabits per second', 'terabit per second'),
  ]),
  unit('KB/s', 'kilobyte per second', 'data', [
    ...symbols('KB/s', 'kB/s', 'KBps', 'kBps'),
    ...words('kilobytes per second', 'kilobyte per second'),
  ]),
  unit('MB/s', 'megabyte per second', 'data', [
    ...symbols('MB/s', 'MBps'),
    ...words('megabytes per second', 'megabyte per second'),
  ]),
  unit('GB/s', 'gigabyte per second', 'data', [
    ...symbols('GB/s', 'GBps'),
    ...words('gigabytes per second', 'gigabyte per second'),
  ]),
  unit('TB/s', 'terabyte per second', 'data', [
    ...symbols('TB/s', 'TBps'),
    ...words('terabytes per second', 'terabyte per second'),
  ]),
  unit('KiB/s', 'kibibyte per second', 'data', [
    symbol('KiB/s'),
    ...words('kibibytes per second', 'kibibyte per second'),
  ]),
  unit('MiB/s', 'mebibyte per second', 'data', [
    symbol('MiB/s'),
    ...words('mebibytes per second', 'mebibyte per second'),
  ]),
  unit('GiB/s', 'gibibyte per second', 'data', [
    symbol('GiB/s'),
    ...words('gibibytes per second', 'gibibyte per second'),
  ]),

  // Angle
  unit('rad', 'radian', 'angle', [symbol('rad'), ...words('radian', 'radians')]),
  unit('mrad', 'milliradian', 'angle', [symbol('mrad'), ...words('milliradian', 'milliradians')]),
  unit('arcmin', 'arcminute', 'angle', [symbol('arcmin'), ...words('arcminute', 'arcminutes')]),
  unit('arcsec', 'arcsecond', 'angle', [symbol('arcsec'), ...words('arcsecond', 'arcseconds')]),
  unit('grad', 'gradian', 'angle', [symbol('grad'), symbol('gon'), ...words('gradian', 'gradians')]),

  // Frequency
  unit('Hz', 'hertz', 'frequency', [symbol('Hz'), ...words('hertz')]),
  unit('kHz', 'kilohertz', 'frequency', [symbol('kHz'), ...words('kilohertz')]),
  unit('MHz', 'megahertz', 'frequency', [symbol('MHz'), ...words('megahertz')]),
  unit('GHz', 'gigahertz', 'frequency', [symbol('GHz'), ...words('gigahertz')]),
  unit('THz', 'terahertz', 'frequency', [symbol('THz'), ...words('terahertz')]),
  unit('rpm', 'revolutions per minute', 'frequency', [
    ...symbols('rpm', 'RPM'),
    ...words('revolutions per minute', 'revolution per minute'),
  ]),

  // Fuel economy
  unit('mpg', 'miles per gallon', 'fuel-economy', [
    ...symbols('mpg', 'MPG'),
    ...words('miles per gallon', 'mile per gallon'),
  ]),
  unit('L/100km', 'liters per 100 km', 'fuel-economy', [
    ...symbols('L/100km', 'l/100km', 'L/100 km', 'l/100 km'),
    ...words('liters per 100 km', 'litres per 100 km', 'liter per 100 km', 'litre per 100 km'),
  ]),
  unit('km/L', 'kilometers per liter', 'fuel-economy', [
    ...symbols('km/L', 'km/l'),
    ...words('kilometers per liter', 'kilometres per litre', 'kilometer per liter', 'kilometre per litre'),
  ]),
];
