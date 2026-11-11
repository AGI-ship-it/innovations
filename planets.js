/* Universe level: Al Ghurair Investment (AGI) at the centre, each business area as a planet.
   Add a business area by adding one entry. The orbit layout spreads 6–8 planets across three rings.
   status: 'live' planets open their page; 'coming-soon' planets show a preview only and cannot be opened.
   surface: texture in assets/planets/. Home-page planet maps come from Solar System Scope (CC BY 4.0); coming-soon areas share the grey moon. strip (optional): a seamless surface map; the planet then turns slowly.
   tint (optional): a colour washed over the planet's lit side. */
window.ATLAS_UNIVERSE = {
  centre: { id: 'agi', name: 'AGI', fullName: 'Al Ghurair Investment' },
  planets: [
    { id: 'facilities', icon: 'layers', name: 'Facilities', status: 'live', surface: 'ice', strip: 'assets/planets/solar/2k_jupiter.jpg',
      description: 'Technology use cases for facilities management services and operations.' },
    { id: 'healthcare', icon: 'heart', name: 'Healthcare', status: 'coming-soon', surface: 'emerald', strip: 'assets/planets/solar/2k_moon.jpg',
      description: 'Technology use cases for the healthcare business are being prepared.' },
    { id: 'foods', icon: 'leaf', name: 'Foods & Agriculture', status: 'coming-soon', surface: 'marbled', strip: 'assets/planets/solar/2k_moon.jpg',
      description: 'Technology use cases for the foods and agriculture business are being prepared.' },
    { id: 'automotive', icon: 'car', name: 'Mobility & Automotive', status: 'coming-soon', surface: 'storm', strip: 'assets/planets/solar/2k_moon.jpg',
      description: 'Technology use cases for the mobility and automotive business are being prepared.' },
  ],
};
