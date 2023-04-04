const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

import { Colors } from './colors.js';
const colorStorage = new Colors();

class Workout {
  clicks = 0;

  constructor(item) {
    const { coords, distance, duration, id, date, color } = item;

    this.coords = coords; // [lat,lng],[lat,lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
    this.id = id ? (this.id = id) : (this.id = (Date.now() + '').slice(-10));
    this.date = date ? (this.date = new Date(date)) : new Date();
    this.color = color ? (this.color = color) : colorStorage.getRandomColor();
  }

  _setDescription() {
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(item) {
    const { coords, distance, duration, cadence, id, date, color } = item;
    super({ coords, distance, duration, id, date, color });
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(item) {
    const { coords, distance, duration, elevationGain, id, date, color } = item;
    super({ coords, distance, duration, id, date, color });
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    //km/h
    this.speed = this.distance / this.duration / 60;
    return this.speed;
  }
}

export { Cycling, Running };
