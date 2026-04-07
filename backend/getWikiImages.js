async function run() {
  const titles = [
    'Sula Vineyards', 
    'Panchavati', 
    'Nashik Road railway station', 
    'Muktidham', 
    'Pandavleni Caves',
    'Nashik',
    'Trimbakeshwar Shiva Temple',
    'Kalaram Temple'
  ];
  for (let title of titles) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(title)}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      const page = Object.values(json.query.pages)[0];
      if (page.original && page.original.source) {
        console.log(title, page.original.source);
      }
    } catch(e) {}
  }
}
run();
