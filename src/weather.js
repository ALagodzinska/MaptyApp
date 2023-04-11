'use strict';

//WMO Weather interpretation codes (WW)
const sunny = 0;
const cloudy = [1, 2, 3];
const fog = [45, 48];
const drizzle = [51, 53, 55, 56, 57];
const rain = [61, 63, 65, 66, 67, 80, 81, 82];
const snow = [71, 73, 75, 77, 85, 86];
const storm = [95, 96, 99];

const getWeatherEmoji = function (weatherCode) {
  if (weatherCode === sunny) {
    return '☀️';
  } else if (cloudy.includes(weatherCode)) {
    return '☁️';
  } else if (fog.includes(weatherCode)) {
    return '🌫️';
  } else if (drizzle.includes(weatherCode)) {
    return '🌦️';
  } else if (rain.includes(weatherCode)) {
    return '🌧️';
  } else if (snow.includes(weatherCode)) {
    return '❄️';
  } else if (storm.includes(weatherCode)) {
    return '🌩️';
  } else {
    return '🌡️';
  }
};

export { getWeatherEmoji };
