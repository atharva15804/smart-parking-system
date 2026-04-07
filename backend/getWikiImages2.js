async function run() {
  const titles = [
    'Nashik City Centre Mall',
    'Sula Vineyards',
    'Ramkund',
    'Nashik Road railway station',
    'Muktidham',
    'Nashik College Road',
    'Nashik Central Bus Stand',
    'Gangapur Dam Nashik',
    'Pandavleni Caves',
    'Nashik Municipal Corporation'
  ];
  for (let title of titles) {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&utf8=&format=json&srnamespace=6`;
    try {
      const res = await fetch(searchUrl);
      const json = await res.json();
      if (json.query.search.length > 0) {
        const fileTitle = json.query.search[0].title;
        const imgUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&format=json`;
        const imgRes = await fetch(imgUrl);
        const imgJson = await imgRes.json();
        const pages = imgJson.query.pages;
        const pageId = Object.keys(pages)[0];
        console.log(title, 'KEY=>', pages[pageId].imageinfo[0].url);
      } else {
        console.log(title, 'KEY=> Not found');
      }
    } catch(e) {}
  }
}
run();
