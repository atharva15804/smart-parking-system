const fs = require('fs');
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
  let output = '';
  for (const place of places) {
    try {
      const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(place)}`);
      const data = await res.json();
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      if (pageId !== '-1' && pages[pageId].original) {
        output += `${place} -> ${pages[pageId].original.source}\n`;
      } else {
        output += `${place} -> No image\n`;
      }
    } catch (e) {
      output += `${place} -> Error ${e.message}\n`;
    }
  }
  fs.writeFileSync('images_output.txt', output);
}
getImages();
