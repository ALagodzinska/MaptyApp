'use strict';

import { WorkoutStorage } from './storage.js';
import { Map } from './map.js';
import { PathDrawer } from './pathDrawer.js';
import { Form } from './form.js';
import { WorkoutDisplay } from './workoutDisplay.js';
import { Filter } from './filter.js';

const cleanWorkoutButton = document.getElementById('clear-btn');
const zoomOutBtn = document.getElementById('zoomOutButton');

///////////////////////////////////

// APPLICATION ARCHITECTURE
class App {
  // Private instance properties
  #map;
  #mapContainer;
  #workouts = [];

  // workout storage
  #storage;
  // path
  #pathDrawer;
  // form
  #form;

  async start() {
    // initialize storage
    this.#storage = new WorkoutStorage();

    // Get Users Position
    this.#map = new Map();
    this.#map.renderContainer();
    await this.#map.detectCurrentLocation();

    // initialize path drawer
    this.#pathDrawer = new PathDrawer(this.#map);

    // remove this variable
    this.#mapContainer = this.#map.container;

    // Get data from Local storage
    this.#workouts = this.#storage.get();

    // Handling clicks onb map
    this.#map.container.on('click', e => this.#pathDrawer.drawPath(e.latlng));
    // Render workouts
    const workoutDisplay = new WorkoutDisplay(
      this.#workouts,
      this.#mapContainer,
      this.#storage,
      this.#pathDrawer
    );
    workoutDisplay.renderWorkouts(this.#workouts);
    // this._renderWorkouts();
    // Render markers
    this.#pathDrawer.renderWorkoutsOnMap(this.#workouts);

    // Add form class
    this.#form = new Form(
      this.#workouts,
      this.#pathDrawer,
      this.#storage,
      workoutDisplay
    );

    const filter = new Filter(this.#workouts, workoutDisplay);

    // Attach event handlers
    // Override method to show form in the end of the path
    this.#pathDrawer.onFinish = markers => {
      this.#form.showForm(markers);
      filter.refreshFilters();
    };

    cleanWorkoutButton.addEventListener('click', this._reset.bind(this));

    zoomOutBtn.addEventListener('click', this._zoomOutMap.bind(this));

    document.querySelector('#map').addEventListener(
      'keypress',
      function (e) {
        if (e.key === 'Enter' && !this.#pathDrawer.isPathFinished) {
          // finish path
          this.#pathDrawer.finishPath();
        }
      }.bind(this)
    );

    document.querySelector('#map').addEventListener(
      'keydown',
      function (e) {
        if (e.key === 'Escape') {
          this._quitCreateWorkout();
        }
      }.bind(this)
    );

    document.querySelector('.form').addEventListener(
      'keydown',
      function (e) {
        if (e.key === 'Escape') {
          this._quitCreateWorkout();
        }
      }.bind(this)
    );
  }

  _quitCreateWorkout() {
    // remove drawings from map
    this.#pathDrawer.renderWorkoutsOnMap(this.#workouts);
    // // close form
    this.#form.hideForm();
    // set path finished to false
    this.#pathDrawer.isPathFinished = false;
  }

  _zoomOutMap() {
    const bounds = [];

    this.#workouts.forEach(workout => {
      let { _southWest, _northEast } = L.polyline(workout.coords).getBounds();
      bounds.push(_southWest);
      bounds.push(_northEast);
    });

    this.#mapContainer.fitBounds(L.polyline(bounds).getBounds());
  }

  // method to remove workouts from local storage
  _reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

export { App };
