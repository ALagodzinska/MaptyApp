'use strict';

import { Running, Cycling } from './workouts.js';

const form = document.querySelector('.form');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const sortBar = document.querySelector('.sort-bar');

const messageContainer = document.querySelector('.message');
const messageIcon = document.querySelector('.message-icon');
const messageText = document.querySelector('.message-text');

class Form {
  constructor(workouts, pathDrawer, storage, workoutDisplay) {
    this.#workouts = workouts;
    this.#pathDrawer = pathDrawer;
    this.#storage = storage;
    this.#workoutDisplay = workoutDisplay;

    inputType.addEventListener('change', this.#toggleElevationField.bind(this));

    form.addEventListener('submit', this.submitForm.bind(this));
  }

  #workoutPath;
  #workouts;
  #pathDrawer;
  #storage;
  #workoutDisplay;

  showForm(workoutPath) {
    // get path coordinates
    this.#workoutPath = workoutPath;
    // get distance
    const distance = this.#calculateDistance(this.#workoutPath);
    // set distance to distance field
    inputDistance.value = distance;
    // disable distance field
    inputDistance.disabled = true;

    form.classList.remove('hidden');
    inputDuration.focus();
    sortBar.classList.add('hidden');
  }

  hideForm() {
    // Empty Input
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  #calculateDistance(coords) {
    let calculatedDistance = 0.0;

    for (let i = 0; i < coords.length; i++) {
      // return if is the last point
      if (!coords[i + 1]) continue;

      calculatedDistance += this.#calculateDistanceBetweenTwoPoints(
        coords[i],
        coords[i + 1]
      );
    }

    return calculatedDistance.toFixed(1);
  }

  #calculateDistanceBetweenTwoPoints(from, to) {
    return from.distanceTo(to).toFixed(0) / 1000;
  }

  #numberInputsValidation(...inputs) {
    return inputs.every(inp => Number.isFinite(inp));
  }

  #positiveNumberValidation(...inputs) {
    return inputs.every(inp => inp > 0);
  }

  #showSuccessMessage() {
    messageContainer.classList.add('correct');
    messageContainer.classList.remove('warning');
    messageContainer.classList.remove('hidden');
    messageText.innerHTML = 'Workout successfully created!';
    messageIcon.src = 'correct.png';
  }

  #showErrorMessage() {
    messageContainer.classList.add('warning');
    messageContainer.classList.remove('correct');
    messageContainer.classList.remove('hidden');
    messageText.innerHTML = 'Inputs have to be positive numbers!';
    messageIcon.src = 'warning.png';
  }

  #hideMessage() {
    setTimeout(
      function () {
        messageContainer.classList.add('animated');
      }.bind(this),
      3000
    );

    setTimeout(
      function () {
        messageContainer.classList.add('hidden');
        messageContainer.classList.remove('animated');
      }.bind(this),
      4000
    );
  }

  async getPlaceName(lat, lng) {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=74bf4ef72eb1473c9771c37dba73afef`
      );

      if (!response.ok)
        throw new Error(`Problem with geocoding ${response.status}!`);

      const { results } = await response.json();

      const location = results[0];

      if (!location) throw new Error(`Cant find location! ${response.status}`);

      if (!location.suburb) {
        return location.address_line1;
      } else {
        return location.suburb;
      }
    } catch (err) {
      console.error(err);
    }
  }

  async getWeather(lat, lng) {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
      );

      if (!response.ok)
        throw new Error(
          `Problem with getting weather forecast ${response.status}!`
        );

      const result = await response.json();

      return result.current_weather;
    } catch (err) {
      console.error(err);
    }
  }

  async submitForm(e) {
    e.preventDefault();

    // get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const coords = this.#workoutPath;
    let workout;

    // Get middle way coords for precise location
    var middleCoords = coords[Math.round((coords.length - 1) / 2)];

    const place = await this.getPlaceName(middleCoords.lat, middleCoords.lng);
    const { temperature, weathercode: weatherCode } = await this.getWeather(
      middleCoords.lat,
      middleCoords.lng
    );

    if (type === 'running') {
      const cadence = +inputCadence.value;

      // Check if data is valid
      if (
        !this.#numberInputsValidation(distance, duration, cadence) ||
        !this.#positiveNumberValidation(distance, duration, cadence)
      ) {
        this.#showErrorMessage();
        this.#hideMessage();
        return;
      }
      // create new workout
      workout = new Running({
        coords,
        distance,
        duration,
        cadence,
        place,
        temperature,
        weatherCode,
      });
    }
    if (type === 'cycling') {
      const elevationGain = +inputElevation.value;
      if (
        !this.#numberInputsValidation(distance, duration, elevationGain) ||
        !this.#positiveNumberValidation(distance, duration)
      ) {
        this.#showErrorMessage();
        this.#hideMessage();
        return;
      }
      // Create new workout
      workout = new Cycling({
        coords,
        distance,
        duration,
        elevationGain,
        place,
        temperature,
        weatherCode,
      });
    }

    // add to workout list
    this.#workouts.push(workout);
    // show success message
    this.#showSuccessMessage();
    this.#hideMessage();
    // Hide form + clear input fields
    this.hideForm();
    // set path
    this.#pathDrawer.addPathToMap(workout);
    // Render workout on a list
    this.#workoutDisplay.renderWorkouts(this.#workouts);
    // Set local storage to all workouts
    this.#storage.set(this.#workouts);
  }

  #toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
}

export { Form };
