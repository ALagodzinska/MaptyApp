'use strict';

import { WorkoutStorage } from './storage.js';
import { Running, Cycling } from './workouts.js';
import { Map } from './map.js';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const cleanWorkoutButton = document.getElementById('clear-btn');
const sortButton = document.getElementById('sort-btn');
const sortBar = document.querySelector('.sort-bar');
const sortByType = document.querySelector('.sort-type');
const sortByDate = document.querySelector('.sort-date');
const sortByDistance = document.querySelector('.sort-distance');
const sortByTime = document.querySelector('.sort-time');
const refreshSort = document.getElementById('refresh-sort');
const messageContainer = document.querySelector('.message');
const messageIcon = document.querySelector('.message-icon');
const messageText = document.querySelector('.message-text');
const zoomOutBtn = document.getElementById('zoomOutButton');

/// Map Icons
// popup for next path ways
const pointIcon = L.icon({
  iconUrl: 'dot.png',
  iconSize: [20, 20],
});

const locationIcon = L.icon({
  iconUrl: 'location.png',
  iconSize: [30, 30],
});
///////////////////////////////////

// APPLICATION ARCHITECTURE
class App {
  // Private instance properties
  #map;
  #mapContainer;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];
  #markerGroup;
  // filtering/sorting
  #filteredWorkouts = [];
  #sortType = 'all';
  #sortDate = 'desc';
  #sortDistance = '';
  #sortTime = '';
  // draw path
  // check if path is finished
  #isPathFinished = false;
  // store all points for current path
  #markers = [];
  // main marker layer
  #mainMarkers;
  // temporary marker layer
  #tempMarkers;
  // temporary lines layer
  #tempLines;
  // main lines layer
  #lines;

  // workout storage
  #storage;

  async start() {
    // initialize storage
    this.#storage = new WorkoutStorage();

    // Get Users Position
    this.#map = new Map();
    this.#map.renderContainer();
    await this.#map.detectCurrentLocation();

    // TODO : remove this variable
    this.#mapContainer = this.#map.container;

    // similar to event listener
    // Handling clicks onb map
    // this.#map.on('click', this._showForm.bind(this));
    this.#map.container.on('click', this._onMapClick.bind(this));

    // const pathDrawer = new PathDrawer();
    // this.#map.container.on('click', pathDrawer.renderNextMarker);

    // Get data from Local storage
    this.#workouts = this.#storage.get();
    // Render workouts
    this._renderWorkouts();
    // Render markers
    this._renderWorkoutMarkers(this.#map);

    // Attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));

    // event on dropdown change
    inputType.addEventListener('change', this._toggleElevationField);

    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));

    cleanWorkoutButton.addEventListener('click', this._reset.bind(this));

    sortButton.addEventListener('click', this._showSortBar.bind(this));

    sortByType.addEventListener('click', this._sortWorkoutsByType.bind(this));

    sortByDate.addEventListener('click', this._sortWorkoutsByDate.bind(this));

    sortByDistance.addEventListener(
      'click',
      this._sortWorkoutsByDistance.bind(this)
    );

    sortByTime.addEventListener('click', this._sortWorkoutsByTime.bind(this));

    refreshSort.addEventListener('click', this._refreshFilters.bind(this));

    zoomOutBtn.addEventListener('click', this._zoomOutMap.bind(this));

    document.querySelector('#map').addEventListener(
      'keypress',
      function (e) {
        if (e.key === 'Enter' && !this.#isPathFinished) {
          this._setPath();
        }
      }.bind(this)
    );

    document.querySelector('#map').addEventListener(
      'keydown',
      function (e) {
        if (e.key === 'Escape') {
          // clear temporary drawings
          // remove temporary markers
          this._clearTempData();
          // remove main marker from the map
          this.#map.removeLayer(this.#mainMarkers);
          this.#mainMarkers = L.layerGroup().addTo(this.#map);
          // remove path from the map
          this.#map.removeLayer(this.#lines);
          this.#lines = L.layerGroup().addTo(this.#map);
          // clear markers array
          this.#markers = [];
          // close form
          // allow to add new workout
          this.#isPathFinished = false;
        }
      }.bind(this)
    );
  }

  _onMapClick(e) {
    // return if path is finished
    if (this.#isPathFinished) return;

    let marker;

    // create map pints
    if (this.#markers.length === 0) {
      marker = this._createStartPoint(e);
    } else {
      marker = this._createPoint(e);
    }
    // add coordinates to list
    const coords2 = marker.getLatLng();
    this.#markers.push(coords2);
  }

  _createStartPoint(e) {
    // create marker
    const marker = this._createMainMarker(e.latlng);

    // .openPopup();
    // add event to marker
    marker.addEventListener(
      'click',
      function () {
        if (this.#markers.length > 1 && !this.#isPathFinished) {
          this.#markers.push(marker.getLatLng());
          this._setPath();
        }
      }.bind(this)
    );
    // add marker to main markers layer
    marker.addTo(this.#mainMarkers);

    return marker;
  }

  _createPoint(e) {
    // create marker
    const marker = L.marker(e.latlng, { icon: pointIcon }).addTo(
      this.#mapContainer
    );
    // add marker to temporary layer
    marker.addTo(this.#tempMarkers);
    // draw temp line
    this._drawTempLine(marker);
    // add event onclick
    marker.addEventListener(
      'click',
      function () {
        if (
          this.#markers[this.#markers.length - 1] === marker.getLatLng() &&
          !this.#isPathFinished
        ) {
          this._setPath();
          document.querySelector('#map').focus();
        }
      }.bind(this)
    );

    return marker;
  }

  _drawTempLine(marker) {
    // get temp coords to draw a line
    const tempLineCoords = [
      this.#markers[this.#markers.length - 1],
      marker.getLatLng(),
    ];
    // draw
    const templine = L.polyline(tempLineCoords, {
      color: 'red',
      opacity: 0.5,
      dashArray: '10, 10',
      dashOffset: '20',
    }).addTo(this.#mapContainer);
    // add temporary line to layer
    templine.addTo(this.#tempLines);
  }

  _createMainMarker(latlng) {
    const marker = L.marker(latlng, { icon: locationIcon }).addTo(
      this.#mapContainer
    );
    marker
      .bindPopup(
        // specify popup
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent(`Main Point!<br/> Start! `);

    return marker;
  }

  _createRandomColor() {
    var randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return '#' + randomColor;
  }

  _lastPoint(latlng) {
    const marker = L.marker(latlng, { icon: locationIcon }).addTo(
      this.#mapContainer
    );
    marker.addTo(this.#mainMarkers);

    return marker;
  }

  _clearTempData() {
    // remove temporary markers
    this.#mapContainer.removeLayer(this.#tempMarkers);
    this.#tempMarkers = L.layerGroup().addTo(this.#mapContainer);

    // remove temporary lines
    this.#mapContainer.removeLayer(this.#tempLines);
    this.#tempLines = L.layerGroup().addTo(this.#mapContainer);
  }

  _setPath() {
    // make path variable finished
    this.#isPathFinished = true;

    // set final line!
    const polyline = L.polyline(this.#markers, {
      color: this._createRandomColor(),
      weight: 5,
    }).addTo(this.#mapContainer);

    // add popup to line
    polyline
      .bindPopup(
        // specify popup
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent(`Line Popup!<br/> Hello! `)
      .openPopup();

    // add line to a layer
    polyline.addTo(this.#lines);
    // add last point
    const lastmarker =
      this.#markers[this.#markers.length - 1] !== this.#markers[0]
        ? this.#markers[this.#markers.length - 1]
        : null;
    if (lastmarker) {
      this._lastPoint(lastmarker);
    }

    // remove temporary lines and points
    this._clearTempData();
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    sortBar.classList.add('hidden');
    inputDistance.focus();
    this._refreshFilters();
  }

  _hideForm() {
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

  _toggleElevationField() {
    // selecting parent
    // toggle - one of them id hidden other is visible
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    // can take an arbitrary number of inputs!
    // if one is false every will return false
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();
    // Get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    const successMessage = function () {
      messageContainer.classList.add('correct');
      messageContainer.classList.remove('warning');
      messageContainer.classList.remove('hidden');
      messageText.innerHTML = 'Workout successfully created!';
      messageIcon.src = 'correct.png';
    };

    const errorMessage = function () {
      messageContainer.classList.add('warning');
      messageContainer.classList.remove('correct');
      messageContainer.classList.remove('hidden');
      messageText.innerHTML = 'Inputs have to be positive numbers!';
      messageIcon.src = 'warning.png';
    };

    const hideMessage = function () {
      setTimeout(function () {
        messageContainer.classList.add('animated');
      }, 3000);

      setTimeout(function () {
        messageContainer.classList.add('hidden');
        messageContainer.classList.remove('animated');
      }, 4000);
    };

    // Check if data is valid

    // If workout running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // Check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
      ) {
        errorMessage();
        hideMessage();
        return;
      }

      workout = new Running({
        coords: [lat, lng],
        distance,
        duration,
        cadence,
      });
    }

    // If workout cycling, create cycling object
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

      workout = new Cycling({
        coords: [lat, lng],
        distance,
        duration,
        elevation,
      });
    }

    // Add new object to workout array
    this.#workouts.push(workout);
    // console.log(this.#workouts);

    // Render workout on map as marker
    // console.log(this.#mapEvent);
    // take longitude and latitude of click
    this._renderWorkoutMarker(workout);
    // Render workout on list
    this._renderWorkout(workout);
    // display success message
    successMessage();
    hideMessage();

    // Hide form + clear input fields
    this._hideForm();

    // Set local storage to all workouts
    this.#storage.set(this.#workouts);
  }

  _renderWorkoutMarkers(map) {
    // clear markers
    map.workoutsLayer.clearLayers();
    // add present markers
    this.#workouts.forEach(workout => {
      this._renderWorkoutMarker(workout, map.workoutsLayer);
    });
  }

  _renderWorkoutMarker(workout, workoutsLayer) {
    const marker = L.marker(workout.coords);
    marker
      .addTo(workoutsLayer)
      .bindPopup(
        // specify popup
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
          autoPan: false,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <div>
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

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;

    const workout = this.#workouts.find(
      workout => workout.id === workoutEl.dataset.id
    );

    if (e.target.classList.contains('delete-workout')) {
      this._deleteWorkout(workout);
      return;
    }

    // console.log(workout);
    // move map to object position
    this.#mapContainer.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    // Count clicks using the public interface
    // workout.click();
  }

  _deleteWorkout(workout) {
    // find index of workout
    const index = this.#workouts.indexOf(workout);
    // remove from workout list
    this.#workouts.splice(index, 1);
    // set storage with new list (rewrites existing item)
    this.#storage.set(this.#workouts);
    // foreach display new workout
    this._renderWorkouts();
    // clear markers
    this.#mapContainer.removeLayer(this.#markerGroup);
    // add present markers
    this.#markerGroup = L.layerGroup().addTo(this.#mapContainer);
    this.#workouts.forEach(workout => {
      this._renderWorkoutMarker(workout);
    });
  }

  _renderWorkouts() {
    // clear list of workouts html
    containerWorkouts.querySelectorAll('.workout').forEach(el => el.remove());
    // render
    this.#workouts.forEach(this._renderWorkout);
  }

  _showSortBar() {
    sortBar.classList.toggle('hidden');
    this._refreshFilters();
  }

  _sortWorkoutsByType() {
    if (this.#sortType === 'all') {
      this.#sortType = 'run';
      this.#filteredWorkouts = this.#workouts.filter(
        workout => workout.type === 'running'
      );
      sortByType.innerHTML = '🏃🏻‍♂️←🚴‍♀️';
      this._updateUI();
    } else if (this.#sortType === 'run') {
      this.#sortType = 'bike';
      this.#filteredWorkouts = this.#workouts.filter(
        workout => workout.type === 'cycling'
      );
      sortByType.innerHTML = '🏃🏻‍♂️→🚴‍♀️';
      this._updateUI();
    } else if (this.#sortType === 'bike') {
      this.#sortType = 'all';
      this.#filteredWorkouts = [...this.#workouts];
      sortByType.innerHTML = '🏃🏻‍♂️↔🚴‍♀️';
      this._updateUI();
    }
  }

  _sortWorkoutsByDate() {
    if (this.#sortDate === 'desc') {
      this.#sortDate = 'asc';
      sortByDate.innerHTML = '📅↑';
      this.#filteredWorkouts.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
    } else if (this.#sortDate === 'asc') {
      this.#sortDate = 'desc';
      sortByDate.innerHTML = '📅↓';
      this.#filteredWorkouts.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
    }
    this._updateUI();
  }

  _sortWorkoutsByDistance() {
    if (!this.#sortDistance) {
      this.#sortDistance = 'desc';
      this.#filteredWorkouts.sort((a, b) => {
        return b.distance - a.distance;
      });
      sortByDistance.innerHTML = '📏↓';
      this._updateUI();
    } else if (this.#sortDistance === 'desc') {
      this.#sortDistance = 'asc';
      this.#filteredWorkouts.sort((a, b) => {
        return a.distance - b.distance;
      });
      sortByDistance.innerHTML = '📏↑';
      this._updateUI();
    } else if (this.#sortDistance === 'asc') {
      this.#sortDistance = '';
      this.#filteredWorkouts.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      sortByDistance.innerHTML = '📏↕';
      this._updateUI();
    }
  }

  _sortWorkoutsByTime() {
    if (!this.#sortTime) {
      this.#sortTime = 'desc';
      this.#filteredWorkouts.sort((a, b) => {
        return b.duration - a.duration;
      });
      sortByTime.innerHTML = '⏱↓';
      this._updateUI();
    } else if (this.#sortTime === 'desc') {
      this.#sortTime = 'asc';
      this.#filteredWorkouts.sort((a, b) => {
        return a.duration - b.duration;
      });
      sortByTime.innerHTML = '⏱↑';
      this._updateUI();
    } else if (this.#sortTime === 'asc') {
      this.#sortTime = '';
      this.#filteredWorkouts.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      sortByTime.innerHTML = '⏱↕';
      this._updateUI();
    }
  }

  _refreshFilters() {
    this.#filteredWorkouts = [...this.#workouts];
    this._updateUI();
  }

  _zoomOutMap() {
    const maxValLat = Math.max(...this.#workouts.map(work => work.coords[0]));
    const minValLat = Math.min(...this.#workouts.map(work => work.coords[0]));
    const maxValLng = Math.max(...this.#workouts.map(work => work.coords[1]));
    const minValLng = Math.min(...this.#workouts.map(work => work.coords[1]));
    var latlngbounds = new L.latLngBounds(
      [maxValLat, maxValLng],
      [minValLat, minValLng]
    );
    this.#mapContainer.fitBounds(latlngbounds);
  }

  _updateUI() {
    // clear
    containerWorkouts.querySelectorAll('.workout').forEach(el => el.remove());
    // add workouts
    this.#filteredWorkouts.forEach(workout => {
      this._renderWorkout(workout);
    });
  }

  // method to remove workouts from local storage
  _reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

export { App };
