// Creating map for the main page
function buildMap() {
  // The location of Ballard
  const Ballard = { lat: 47.677, lng: -122.385 };
  // Build a map centered at Ballard
  const map = new google.maps.Map(document.getElementById("welcome-map"), {
    zoom: 14,
    center: Ballard,
  });
  // The marker, positioned at Ballard
  const marker = new google.maps.Marker({
    position: Ballard,
    map: map,
  });
}
