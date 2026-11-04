const STATE_BASELINES = {
  maharashtra: 412.5, gujarat: 365.2, 'tamil nadu': 328, 'uttar pradesh': 384.6,
  rajasthan: 224.8, karnataka: 215.3, 'madhya pradesh': 204.1, 'andhra pradesh': 192.4,
  'west bengal': 168.2, telangana: 182, punjab: 172.5, haryana: 158.4,
  kerala: 84.6, bihar: 112.3, odisha: 105.7, delhi: 126.8
};

export function predictElectricity(weather) {
  const region = (weather?.region_name || '').toLowerCase();
  const baseline = STATE_BASELINES[region] || 185;
  const temp = Math.max(-10, Math.min(55, (weather?.temperature ?? 28) + (weather?.delta_temperature ?? 0)));
  const humidity = Math.max(0, Math.min(100, (weather?.relative_humidity ?? 55) + (weather?.delta_humidity ?? 0)));
  const cloud = Math.max(0, Math.min(100, (weather?.cloud_cover ?? 30) + (weather?.delta_cloud_cover ?? 0)));
  const wind = Math.max(0, (weather?.wind_speed ?? 3.5) + (weather?.delta_wind_speed ?? 0));
  const tempEffect = Math.max(0, temp - 24) * 0.028 - Math.min(0, temp - 18) * 0.015;
  const humidityEffect = Math.max(0, humidity - 55) * 0.0012;
  const cloudEffect = (cloud / 100) * -0.015;
  const windEffect = (wind - 3.5) * -0.004;
  const consumption = Math.max(35, baseline * (1 + tempEffect + humidityEffect + cloudEffect + windEffect));
  return { consumption: Number(consumption.toFixed(2)), baseline, temperature: temp, humidity, cloud, wind,
    variance: Number((consumption * 0.068).toFixed(2)), stress: consumption > baseline * 1.15 ? 'Critical peak stress' : consumption > baseline * 1.05 ? 'Elevated demand' : 'Nominal load' };
}

export function optimizeWeather(weather, target) {
  const baseline = predictElectricity(weather).baseline;
  let best = null;
  for (let temp = -5; temp <= 50; temp += 0.25) {
    for (let humidity = 10; humidity <= 95; humidity += 1) {
      const candidate = { ...weather, temperature: temp, relative_humidity: humidity, delta_temperature: 0, delta_humidity: 0, cloud_cover: weather?.cloud_cover ?? 30, wind_speed: weather?.wind_speed ?? 3.5, delta_cloud_cover: 0, delta_wind_speed: 0 };
      const result = predictElectricity(candidate);
      const error = Math.abs(result.consumption - target);
      if (!best || error < best.error) best = { temperature: temp, humidity, consumption: result.consumption, error };
    }
  }
  return { ...best, attainable: target >= predictElectricity({ ...weather, temperature: -5, relative_humidity: 10 }).consumption && target <= predictElectricity({ ...weather, temperature: 50, relative_humidity: 95 }).consumption };
}

export function consumptionWeatherSeries(weather) {
  return Array.from({ length: 13 }, (_, i) => {
    const temperature = -5 + i * 4.5;
    const result = predictElectricity({ ...weather, temperature, delta_temperature: 0 });
    return { temperature, consumption: result.consumption };
  });
}

export function consumptionHistorySeries(items) {
  return items.slice(0, 12).reverse().map((item, index) => ({ run: index + 1, consumption: item.consumption, temperature: item.temperature }));
}
