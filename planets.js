/* Universe level: Al Ghurair Investment (AGI) at the centre, each business area as a planet.
   Add a business area by adding one entry. The orbit layout spreads 6–8 planets across three rings.
   status: 'live' planets open their page; 'coming-soon' planets show a preview only and cannot be opened.
   surface: texture in assets/planets/. strip (optional): a seamless surface map; the planet then turns slowly.
   tint (optional): a colour washed over the planet's lit side. */
window.ATLAS_UNIVERSE = {
  centre: { id: 'agi', name: 'AGI', fullName: 'Al Ghurair Investment' },
  planets: [
    { id: 'facilities', name: 'Facilities', status: 'live', surface: 'ice', strip: 'assets/planets/families/strip-facilities.png',
      description: 'Technology use cases for facilities management services and operations.' },
    { id: 'healthcare', name: 'Healthcare', status: 'coming-soon', surface: 'emerald',
      description: 'Technology use cases for the healthcare business are being prepared.' },
  ],
};
