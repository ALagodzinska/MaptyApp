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
    this.#workoutPath = workoutPath;
    form.classList.remove('hidden');
    inputDistance.focus();
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

  submitForm(e) {
    e.preventDefault();

    // get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const coords = this.#workoutPath;
    let workout;

    ///////////////////
    let calculatedDistance = 0.0;

    const calculateDistance = function (from, to) {
      // console.log(from.distanceTo(to).toFixed(0) / 1000);
      return from.distanceTo(to).toFixed(0) / 1000;
    };

    for (let i = 0; i < coords.length; i++) {
      // return if is the last point
      if (!coords[i + 1]) continue;

      calculatedDistance += calculateDistance(coords[i], coords[i + 1]);
      console.log(calculatedDistance);
    }

    console.log(calculatedDistance);
    ///////////////////

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
      workout = new Running({ coords, distance, duration, cadence });
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
      workout = new Cycling({ coords, distance, duration, elevationGain });
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
