// Hub: one list of everything. `live: true` shows a card as coming soon.
const ITEMS = [
  { url: 'https://garthyoung45.github.io/stonesong/', name: 'Stonesong', text: 'A pond that plays the stones you lay on it.', tags: ['Hands', 'Seated', 'Music'], live: true },
  { url: 'bearing.html', name: 'Bad Bearing', text: 'Six motors, one failing. Find it by ear.', tags: ['Spatial audio', 'Room scale', 'Maintenance'], live: true },
  { url: 'drums.html', name: 'Air Kit', text: 'A drum kit made of light. Hit it with your hands.', tags: ['Hands', 'Rhythm'], live: true },
  { url: 'moon.html', name: 'Moonwalk', text: 'Walk around a lunar landing zone and pick a safe site.', tags: ['Room scale', 'Space'], live: true },
  { url: 'ruler.html', name: 'Room Ruler', text: 'Measure your real room by pinching two points.', tags: ['Passthrough', 'Useful'], live: true },
  { url: 'labels.html', name: 'Label Check', text: 'Inspect equipment tags. Pass the good, fail the bad.', tags: ['Passthrough', 'Maintenance'], live: true },
  { url: 'fireflies.html', name: 'Fireflies', text: 'Catch drifting lights in your own room.', tags: ['Passthrough', 'Game'], live: true },
  { url: 'clay.html', name: 'Clay Wheel', text: 'Shape a spinning pot with your hands.', tags: ['Hands', 'Create'], live: true },
  { url: 'still.html', name: 'Still Room', text: 'A slow breathing room with sound all around you.', tags: ['Spatial audio', 'Calm'], live: true },
];
const grid = document.getElementById('grid')!;
for (const it of ITEMS) {
  const a = document.createElement('a');
  a.className = 'card' + (it.live ? '' : ' soon');
  a.href = it.url;
  a.innerHTML = `<h2>${it.name}</h2><p>${it.text}${it.live ? '' : ' (coming soon)'}</p>` + it.tags.map((t) => `<span class="tag">${t}</span>`).join('');
  grid.appendChild(a);
}
export {};
