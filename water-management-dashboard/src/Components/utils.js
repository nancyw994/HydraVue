export function calculateETc({ temperature, humidity, windSpeed, cropType }) {
    const defaultSunlightHours = 7;
    const defaultSolarRadiation = defaultSunlightHours * 0.5; // MJ/m²/day
  
    const KcValues = {
      Corn: 1.2,
      Wheat: 1.15,
      Soybean: 1.15,
      Default: 1.0
    };
  
    const Kc = KcValues[cropType] || KcValues.Default;
  
    const ET0 = (0.0023 * (temperature + 17) * Math.sqrt(temperature + 17)) *
                (defaultSolarRadiation / (temperature + 273)) *
                (1 - humidity / 100) *
                (1 + 0.1 * windSpeed);
  
    const ETc = ET0 * Kc;
    return parseFloat(ETc.toFixed(2));
  }
  
  export function normalizeWaterIndex(etValue) {
    const maxET = 10; // liters/acre/day upper bound
    const index = Math.min(100, Math.round((etValue / maxET) * 100));
    return index;
  }
  