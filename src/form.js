'use strict';

class Form {
  form = document.querySelector('.form');
  inputType = document.querySelector('.form__input--type');
  inputDistance = document.querySelector('.form__input--distance');
  inputDuration = document.querySelector('.form__input--duration');
  inputCadence = document.querySelector('.form__input--cadence');
  inputElevation = document.querySelector('.form__input--elevation');

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

  submitForm() {
    // get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const path = this.#workoutPath;

    if (type === 'running') {
      const cadence = +inputCadence.value;

      // Check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        errorMessage();
        hideMessage();
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
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        errorMessage();
        hideMessage();
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
}

export { Form };
