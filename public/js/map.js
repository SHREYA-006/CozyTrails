// public/js/map.js
document.addEventListener("DOMContentLoaded", function () {
  const mapContainer = document.getElementById("map");

  // Prevent error if map doesn't exist on the page
  if (!mapContainer || !mapContainer.dataset.lat || !mapContainer.dataset.lng || !mapContainer.dataset.location) {
    return;
  }

  const lat = parseFloat(mapContainer.dataset.lat);
  const lng = parseFloat(mapContainer.dataset.lng);
  const location = mapContainer.dataset.location;

  const map = L.map('map', {
    worldCopyJump: false,
    maxBoundsViscosity: 1.0,
    maxBounds: [
      [-85, -180],
      [85, 180]
    ]
  }).setView([lat, lng], 13);


  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 16,
    attribution: '&copy; OpenStreetMap contributors',
    noWrap: true,
  }).addTo(map);

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`<b>${location}</b>`)
    .openPopup();
});