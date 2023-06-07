'use strict';

class Map {
  container;
  workoutsLayer;
  draftWorkoutLayer;

  #loadCurrentPosition() {
    // takes two callback function - one -success, second -error
    // Geolocation api
    if (!navigator.geolocation) {
      throw new Error('No geolocation defined');
    }

    // bind this keyword to point to an object
    return this.#getCurrentPosition();
  }

  #getCurrentPosition() {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 1000,
      });
    });
  }

  renderContainer() {
    // Create map
    this.container = L.map('map');
    // set default view
    this.container.setView([49.246292, -123.116226], 13);
    // Add Layers
    this.workoutsLayer = L.layerGroup().addTo(this.container);
    this.draftWorkoutLayer = L.layerGroup().addTo(this.container);

    // styling map from openStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.container);
  }

  detectCurrentLocation() {
    this.#loadCurrentPosition()
      .then(position => {
        console.log(position);
        const { latitude, longitude } = position.coords;
        const coords = [latitude, longitude];
        this.container.setView(coords, 13);
      })
      .catch(error => alert('Could not get your position! ' + error.message));
  }
}

export { Map };
