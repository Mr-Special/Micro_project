/**
 * Open-Meteo Zero-Key Weather API Service
 * Fetches live weather for Indian locations and supports anomaly simulations.
 */

export const INDIAN_STATES_AND_UTS = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry'
];

export const CITIES_BY_STATE = {
  'Andaman and Nicobar Islands': ['Port Blair', 'Diglipur', 'Car Nicobar'],
  'Andhra Pradesh': ['Amaravati', 'Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kurnool'],
  'Arunachal Pradesh': ['Itanagar', 'Tawang', 'Pasighat', 'Ziro'],
  Assam: ['Guwahati', 'Dispur', 'Dibrugarh', 'Jorhat', 'Silchar', 'Tezpur'],
  Bihar: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'],
  Chandigarh: ['Chandigarh'],
  Chhattisgarh: ['Raipur', 'Bilaspur', 'Durg', 'Korba', 'Jagdalpur'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Silvassa', 'Diu'],
  Delhi: ['New Delhi', 'Delhi'],
  Goa: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'],
  Gujarat: ['Ahmedabad', 'Gandhinagar', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  Haryana: ['Gurugram', 'Faridabad', 'Panipat', 'Hisar', 'Ambala', 'Rohtak', 'Karnal'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Manali', 'Mandi', 'Solan'],
  Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Shivamogga'],
  Kerala: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Chhatrapati Sambhajinagar', 'Kolhapur'],
  Manipur: ['Imphal', 'Churachandpur', 'Thoubal'],
  Meghalaya: ['Shillong', 'Tura', 'Jowai'],
  Mizoram: ['Aizawl', 'Lunglei', 'Champhai'],
  Nagaland: ['Kohima', 'Dimapur', 'Mokokchung'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur', 'Puri'],
  Puducherry: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  Punjab: ['Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
  Sikkim: ['Gangtok', 'Namchi', 'Gyalshing'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  Tripura: ['Agartala', 'Udaipur', 'Dharmanagar'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Noida', 'Meerut'],
  Uttarakhand: ['Dehradun', 'Haridwar', 'Rishikesh', 'Haldwani', 'Nainital'],
  'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla'],
  Ladakh: ['Leh', 'Kargil'],
  Lakshadweep: ['Kavaratti', 'Agatti', 'Amini']
};

export const ANOMALY_PRESETS = [
  {
    id: 'super_heatwave',
    name: '🔥 Super-Heatwave (+14°C)',
    description: 'Extreme thermal spike inducing rapid workpiece thermal expansion and dielectric cooling deficit.',
    deltas: { temp: 14.0, humidity: -20.0, pressure: -6.0 }
  },
  {
    id: 'arctic_freeze',
    name: '❄️ Arctic Polar Vortex (-22°C)',
    description: 'Severe freezing plunge increasing dielectric fluid kinematic viscosity and lowering initial spark ionization.',
    deltas: { temp: -22.0, humidity: -10.0, pressure: 12.0 }
  },
  {
    id: 'monsoon_cyclone',
    name: '⛈️ Monsoon & Cyclonic Squall',
    description: 'Torrential atmospheric humidity surge (98% RH) and barometric depression provoking oxidation and gap instability.',
    deltas: { temp: 4.0, humidity: 45.0, pressure: -48.0 }
  },
  {
    id: 'barometric_drop',
    name: '🌪️ Low Pressure Depression (-65 hPa)',
    description: 'Sudden barometric vacuum drop altering dielectric cavitation bubble collapse and debris expulsion.',
    deltas: { temp: -2.0, humidity: 15.0, pressure: -65.0 }
  },
  {
    id: 'desert_sirocco',
    name: '🏜️ Saharan Sirocco Drought',
    description: 'Desiccating arid thermal winds causing static particulate accumulation and thermal degradation.',
    deltas: { temp: 18.0, humidity: -38.0, pressure: -12.0 }
  }
];

export function decodeWmoWeather(code) {
  const codes = {
    0: { label: 'Clear Sky', icon: 'Sun' },
    1: { label: 'Mainly Clear', icon: 'Sun' },
    2: { label: 'Partly Cloudy', icon: 'CloudSun' },
    3: { label: 'Overcast', icon: 'Cloud' },
    45: { label: 'Foggy', icon: 'CloudFog' },
    48: { label: 'Depositing Rime Fog', icon: 'CloudFog' },
    51: { label: 'Light Drizzle', icon: 'CloudDrizzle' },
    53: { label: 'Moderate Drizzle', icon: 'CloudDrizzle' },
    55: { label: 'Dense Drizzle', icon: 'CloudDrizzle' },
    61: { label: 'Slight Rain', icon: 'CloudRain' },
    63: { label: 'Moderate Rain', icon: 'CloudRain' },
    65: { label: 'Heavy Rain', icon: 'CloudRain' },
    71: { label: 'Slight Snow', icon: 'CloudSnow' },
    73: { label: 'Moderate Snow', icon: 'CloudSnow' },
    75: { label: 'Heavy Snow', icon: 'CloudSnow' },
    80: { label: 'Rain Showers', icon: 'CloudRain' },
    95: { label: 'Thunderstorm', icon: 'CloudLightning' }
  };
  return codes[code] || { label: 'Overcast', icon: 'Cloud' };
}

export async function fetchLiveWeather(lat, lon, cityName = 'City', location = {}) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,wind_speed_10m,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API returned ${res.status}`);
    const data = await res.json();
    const cur = data.current;
    const wmo = decodeWmoWeather(cur.weather_code);

    return {
      city_name: cityName,
      region_name: location.admin1 || location.selected_state || '',
      country_name: location.country || '',
      temperature: Number(cur.temperature_2m.toFixed(1)),
      apparent_temperature: Number(cur.apparent_temperature.toFixed(1)),
      relative_humidity: Number(cur.relative_humidity_2m.toFixed(0)),
      pressure: Number(cur.surface_pressure.toFixed(1)),
      wind_speed: Number(cur.wind_speed_10m.toFixed(1)),
      weather_code: cur.weather_code,
      weather_condition: wmo.label,
      icon: wmo.icon,
      is_live: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  } catch (err) {
    // Elegant fallback data if device is offline
    return {
      city_name: cityName,
      region_name: location.admin1 || location.selected_state || '',
      country_name: location.country || '',
      temperature: 19.5,
      apparent_temperature: 19.0,
      relative_humidity: 52,
      pressure: 1014.2,
      wind_speed: 3.4,
      weather_code: 0,
      weather_condition: 'Clear Sky',
      icon: 'Sun',
      is_live: false,
      timestamp: 'Cached'
    };
  }
}

export async function searchCities(query, state) {
  if (!query || query.trim().length < 2 || !state) return [];
  try {
    const params = new URLSearchParams({
      name: `${query.trim()}, ${state}`,
      count: '10',
      language: 'en',
      format: 'json',
      countryCode: 'IN'
    });
    const url = `https://geocoding-api.open-meteo.com/v1/search?${params}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];
    return data.results.filter(r => r.country_code === 'IN').map(r => ({
      name: r.name,
      country: r.country || '',
      admin1: r.admin1 || '',
      lat: r.latitude,
      lon: r.longitude
    }));
  } catch {
    return [];
  }
}
