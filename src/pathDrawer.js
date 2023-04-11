'use strict';

import { getWeatherEmoji } from './weather.js';

class PathDrawer {
  constructor(map) {
    this.#map = map;
  }

  #map;
  #markers = [];
  isPathFinished = false;

  #pointIcon = L.icon({
    iconUrl: 'img/dot.png',
    iconSize: [20, 20],
  });

  #locationIcon = L.icon({
    iconUrl: 'img/location.png',
    iconSize: [30, 30],
  });

  drawPath(coords) {
    if (this.isPathFinished) return;

    let marker;
    // create marker
    if (this.#markers.length === 0) {
      marker = this.#renderStartEndMarker(coords);
    } else {
      marker = this.#renderPoint(coords);
      // draw temporary line
      const temporaryLineCoords = [
        this.#markers[this.#markers.length - 1],
        marker.getLatLng(),
      ];
      this.#renderTemporaryLine(temporaryLineCoords);
    }
    // marker position
    const markerPosition = marker.getLatLng();
    // add event on click to marker
    marker.addEventListener(
      'click',
      this.#finishEventForMarker.bind(this, markerPosition)
    );
    // Add Marker to array
    this.#markers.push(markerPosition);

    return marker;
  }

  #finishEventForMarker(markerPosition) {
    if (this.#markers.length <= 1) return;
    // add event for the first element
    if (this.#markers[0] === markerPosition && !this.isPathFinished) {
      // add point to array
      this.#renderTemporaryLine([
        this.#markers[this.#markers.length - 1],
        this.#markers[0],
      ]);
      this.#markers.push(markerPosition);
      this.finishPath();
    }
    // add event if element is last
    else if (
      this.#markers[this.#markers.length - 1] === markerPosition &&
      !this.isPathFinished
    ) {
      this.finishPath();
    }
  }
  // Create temporary marker
  #renderStartEndMarker(coords) {
    const marker = L.marker(coords, { icon: this.#locationIcon }).addTo(
      this.#map.draftWorkoutLayer
    );
    return marker;
  }
  // Create temporary points
  #renderPoint(coords) {
    // create marker
    const point = L.marker(coords, { icon: this.#pointIcon }).addTo(
      this.#map.draftWorkoutLayer
    );
    return point;
  }
  // Create temporary line
  #renderTemporaryLine(lineCoords) {
    const temporaryLine = L.polyline(lineCoords, {
      color: 'red',
      opacity: 0.5,
      dashArray: '10, 10',
      dashOffset: '20',
    }).addTo(this.#map.draftWorkoutLayer);
    return temporaryLine;
  }
  // callback method
  onFinish = function (markers) {};
  // returns all path coordinates
  finishPath() {
    // return if it is only one point
    if (this.#markers.length <= 1) return;

    // change boolean
    this.isPathFinished = true;
    // create path
    // this.#renderPath();
    // render last marker
    const lastMarker = this.#markers[this.#markers.length - 1];
    if (lastMarker !== this.#markers[0]) {
      this.#renderStartEndMarker(lastMarker);
    }
    // this.#clearTemporaryLayer();
    // Keep focus on map
    document.querySelector('#map').focus();

    // callback on path finish
    this.onFinish(this.#markers);

    // reset markers
    this.#markers = [];
  }

  renderWorkoutsOnMap(workouts) {
    // renew marker array
    this.#markers = [];

    this.#clearTemporaryLayer();
    this.#clearWorkoutsLayer();
    workouts.forEach(workout => {
      this.addPathToMap(workout);
    });
  }

  // Create Final path
  addPathToMap(workout) {
    // add markers
    this.#renderWorkoutMarkers(workout);
    // add line
    this.#renderPath(workout);
    // clear temporary
    this.#clearTemporaryLayer();
    // set path finished to false
    this.isPathFinished = false;
  }

  #renderPath(workout) {
    if (workout.coords.length === 0) return;

    const polyline = L.polyline(workout.coords, {
      color: workout.color,
      weight: 5,
    }).addTo(this.#map.workoutsLayer);

    this.#addPopup(polyline, workout).openPopup();

    return polyline;
  }

  #renderWorkoutMarkers(workout) {
    const firstPoint = workout.coords[0];
    const lastPoint = workout.coords[workout.coords.length - 1];

    const createMarker = function (coordinates) {
      const marker = L.marker(coordinates, { icon: this.#locationIcon }).addTo(
        this.#map.workoutsLayer
      );
      this.#addPopup(marker, workout);
    }.bind(this);

    if (firstPoint === lastPoint || !lastPoint) {
      createMarker(firstPoint);
    } else {
      createMarker(firstPoint);
      createMarker(lastPoint);
    }
  }

  getTimeEmoji(hours) {
    if (hours >= 6 && hours <= 12) {
      return '🌅';
    } else if (hours > 12 && hours < 18) {
      return '🌄';
    } else if (hours >= 18) {
      return '🌆';
    } else if (hours >= 0 && hours < 6) {
      return '🌃';
    }
  }

  #addPopup(item, workout) {
    const popup = item
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
        `<div>
          <div style="grid-column: 1/5;">
            <h2 class="popup__title">${workout.description}</h2>
          </div>
          <div class="popup__data">
            <div class="workout__details">
              <div class="workout__details">
                <span class="workout__icon">${this.getTimeEmoji(
                  workout.date.getHours()
                )}</span>
                <span class="workout__value">${workout.date.getHours()}:${workout.date.getMinutes()}</span>
              </div>
                <span class="workout__icon">${getWeatherEmoji(
                  workout.weatherCode
                )}</span>
                <span class="workout__value">${workout.temperature}</span>
                <span class="workout__unit">°C</span>
              </div>            
          </div>`
      );

    return popup;
  }

  #clearTemporaryLayer() {
    // remove temporary markers and lines
    this.#map.draftWorkoutLayer.clearLayers();
  }

  #clearWorkoutsLayer() {
    this.#map.workoutsLayer.clearLayers();
  }
}

export { PathDrawer };
