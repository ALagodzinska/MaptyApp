'use strict';

const containerWorkouts = document.querySelector('.workouts');
const form = document.querySelector('.form');

class WorkoutDisplay {
  constructor(workouts, mapContainer, storage, pathDrawer) {
    this.#workouts = workouts;
    this.#mapContainer = mapContainer;
    this.#storage = storage;
    this.#pathDrawer = pathDrawer;

    containerWorkouts.addEventListener('click', this.#moveToPopup.bind(this));
  }

  #workouts;
  #mapContainer;
  #storage;
  #pathDrawer;
  #mapZoomLevel = 13;

  renderWorkouts(workouts) {
    // clear list of workouts html
    containerWorkouts.querySelectorAll('.workout').forEach(el => el.remove());
    // render
    workouts.forEach(this.#renderWorkout.bind(this));
  }

  #renderWorkout(workout) {
    let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <div style="grid-column: 1/5;">
            <h2 class="workout__title">${workout.description}</h2>
            <span class="delete-workout">X</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;

    if (workout.type === 'running')
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;

    if (workout.type === 'cycling')
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
    form.insertAdjacentHTML('afterend', html);
  }

  #moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;

    const workout = this.#workouts.find(
      workout => workout.id === workoutEl.dataset.id
    );

    if (e.target.classList.contains('delete-workout')) {
      this.#deleteWorkout(workout);
      return;
    }

    // move map to object position
    const lineArea = L.polyline(workout.coords).getBounds();

    this.#mapContainer.fitBounds(lineArea, {
      animate: true,
    });
  }

  #deleteWorkout(workout) {
    // find index of workout
    const index = this.#workouts.indexOf(workout);
    // remove from workout list
    this.#workouts.splice(index, 1);
    // set storage with new list (rewrites existing item)
    this.#storage.set(this.#workouts);
    // foreach display new workout
    this.renderWorkouts(this.#workouts);
    // render markers
    this.#pathDrawer.renderWorkoutsOnMap(this.#workouts);
  }
}

export { WorkoutDisplay };
