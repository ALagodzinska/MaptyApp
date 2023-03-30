'use strict';

class PathDrawer {
  constructor(map) {
    this.#map = map;
  }

  #map;
  #markers = [];
  #isPathFinished = false;

  #pointIcon = L.icon({
    iconUrl: 'dot.png',
    iconSize: [20, 20],
  });

  #locationIcon = L.icon({
    iconUrl: 'location.png',
    iconSize: [30, 30],
  });

  drawPath(coords) {
    if (this.#isPathFinished) return;

    let marker;
    // create marker
    if (this.#markers.length === 0) {
      marker = this.#renderMarker(coords);
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
    if (this.#markers[0] === markerPosition && !this.#isPathFinished) {
      // add point to array
      this.#markers.push(markerPosition);
      this.finishPath();
    }
    // add event if element is last
    else if (
      this.#markers[this.#markers.length - 1] === markerPosition &&
      !this.#isPathFinished
    ) {
      this.finishPath();
    }
  }

  // Create main marker
  #renderMarker(coords) {
    const marker = L.marker(coords, { icon: this.#locationIcon }).addTo(
      this.#map.workoutsLayer
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

  // returns all path coordinates
  finishPath() {
    // change boolean
    this.#isPathFinished = true;
    // create path
    this.#renderPath();
    // render last marker
    const lastMarker = this.#markers[this.#markers.length - 1];
    if (lastMarker !== this.#markers[0]) {
      this.#renderMarker(lastMarker);
    }
    this.#clearTemporaryLayer();
    // Keep focus on map
    document.querySelector('#map').focus();

    return this.#markers;
  }

  // Create Final path
  #renderPath() {
    const polyline = L.polyline(this.#markers, {
      color: this.#generateRandomColor(),
      weight: 5,
    }).addTo(this.#map.workoutsLayer);
    return polyline;
  }

  #generateRandomColor() {
    var randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return '#' + randomColor;
  }

  #clearTemporaryLayer() {
    // remove temporary markers and lines
    this.#map.draftWorkoutLayer.clearLayers();
  }
}

export { PathDrawer };
