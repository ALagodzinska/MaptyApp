'use strict';

class Form {
  constructor() {
    this.inputType.addEventListener(
      'change',
      this.#toggleElevationField.bind(this)
    );

    this.form.addEventListener('submit', this.submitForm.bind(this));
  }

  form = document.querySelector('.form');
  inputType = document.querySelector('.form__input--type');
  inputDistance = document.querySelector('.form__input--distance');
  inputDuration = document.querySelector('.form__input--duration');
  inputCadence = document.querySelector('.form__input--cadence');
  inputElevation = document.querySelector('.form__input--elevation');

  messageContainer = document.querySelector('.message');
  messageIcon = document.querySelector('.message-icon');
  messageText = document.querySelector('.message-text');

  #workoutPath;

  showForm(workoutPath) {
    this.#workoutPath = workoutPath;
    this.form.classList.remove('hidden');
    this.inputDistance.focus();
  }

  #hideForm() {
    // Empty Input
    this.inputDistance.value =
      this.inputDuration.value =
      this.inputCadence.value =
      this.inputElevation.value =
        '';
    this.form.style.display = 'none';
    this.form.classList.add('hidden');
    setTimeout(() => (this.form.style.display = 'grid'), 1000);
  }

  #numberInputsValidation(...inputs) {
    return inputs.every(inp => Number.isFinite(inp));
  }

  #positiveNumberValidation(...inputs) {
    return inputs.every(inp => inp > 0);
  }

  #showSuccessMessage() {
    this.messageContainer.classList.add('correct');
    this.messageContainer.classList.remove('warning');
    this.messageContainer.classList.remove('hidden');
    this.messageText.innerHTML = 'Workout successfully created!';
    this.messageIcon.src = 'correct.png';
  }

  #showErrorMessage() {
    this.messageContainer.classList.add('warning');
    this.messageContainer.classList.remove('correct');
    this.messageContainer.classList.remove('hidden');
    this.messageText.innerHTML = 'Inputs have to be positive numbers!';
    this.messageIcon.src = 'warning.png';
  }

  #hideMessage() {
    setTimeout(
      function () {
        this.messageContainer.classList.add('animated');
      }.bind(this),
      3000
    );

    setTimeout(
      function () {
        this.messageContainer.classList.add('hidden');
        this.messageContainer.classList.remove('animated');
      }.bind(this),
      4000
    );
  }

  submitForm(e) {
    e.preventDefault();

    // get data from form
    const type = this.inputType.value;
    const distance = +this.inputDistance.value;
    const duration = +this.inputDuration.value;
    const path = this.#workoutPath;

    if (type === 'running') {
      const cadence = +this.inputCadence.value;

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
      //   workout = new Running({
      //     coords: [lat, lng],
      //     distance,
      //     duration,
      //     cadence,
      //   });
    }
    if (type === 'cycling') {
      const elevation = +this.inputElevation.value;
      if (
        !this.#numberInputsValidation(distance, duration, elevation) ||
        !this.#positiveNumberValidation(distance, duration)
      ) {
        this.#showErrorMessage();
        this.#hideMessage();
        return;
      }
      // Create new workout
      //   workout = new Cycling({
      //     coords: [lat, lng],
      //     distance,
      //     duration,
      //     elevation,
      //   });
    }
  }

  #toggleElevationField() {
    this.inputElevation
      .closest('.form__row')
      .classList.toggle('form__row--hidden');
    this.inputCadence
      .closest('.form__row')
      .classList.toggle('form__row--hidden');
  }
}

export { Form };
