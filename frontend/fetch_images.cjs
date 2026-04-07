const places = [
  'Nashik',
  'Sula Vineyards',
  'Panchavati',
  'Nashik Road railway station',
  'Muktidham',
  'Pandavleni Caves',
  'Gangapur Dam'
];

async function getImages() {
  for (const place of places) {
    try {
      const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(place)}`);
      const data = await res.json();
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      if (pageId !== '-1' && pages[pageId].original) {
        console.log(place, '->', pages[pageId].original.source);
      } else {
        console.log(place, '-> No image');
      }
    } catch (e) {
      console.log(place, '-> Error', e.message);
    }
  }
}
getImages();
