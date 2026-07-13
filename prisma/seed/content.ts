/**
 * Seed content — hand-authored development data for the Stayze customer portal.
 *
 * DEVELOPMENT / UI TEST DATA ONLY. Not production content.
 * Every stay, owner, review, phone number and price here is invented. The
 * places (Mullayanagiri, Hebbe Falls, Baba Budangiri, Aldur, Mallandur) are
 * real Chikmagalur locations so the UI reads truthfully, but the properties
 * are not.
 *
 * Media is referenced by a SOURCES key from ./media.ts. The seed uploads the
 * object to Supabase Storage and stores only bucket + path in Postgres.
 */

export const SITE_SETTING = {
  id: "default",
  // PLACEHOLDER. Replace with the real Stayze booking number before anything ships.
  whatsappNumber: "919876543210",
  supportPhone: "+91 98765 43210",
  supportEmail: "hello@stayze.in",
  instagramUrl: "https://instagram.com/stayze.in",
};

export const OWNERS = [
  {
    key: "owner-001",
    name: "Yogesh & family",
    photoSource: "portrait-1",
    bio: "Yogesh's grandfather planted the first Arabica on this slope in 1961, and the family has picked it by hand every season since. He took over the estate in 2019 after fifteen years in Bengaluru, and started hosting because the old manager's bungalow was sitting empty. He will walk you through the plantation at 7am if you ask, and he will absolutely talk your ear off about shade trees.",
    hostingSince: 2019,
    languages: ["Kannada", "English", "Hindi"],
    location: "Lives on the estate",
    phone: "+91 98450 22114",
    email: "yogesh@example.com",
  },
  {
    key: "owner-002",
    name: "Latha & Suresh Gowda",
    photoSource: "portrait-2",
    bio: "Latha and Suresh restored this 1930s planter's bungalow over four years, keeping the Burma teak floors and the original monkey-tops. Latha cooks — properly cooks, on a wood fire when the mood takes her — and Suresh manages the 5.5 acres of coffee and pepper around the house. They have been hosting since 2015 and remember what everyone ate.",
    hostingSince: 2015,
    languages: ["Kannada", "English", "Tamil"],
    location: "Lives in the adjoining cottage",
    phone: "+91 98860 71902",
    email: "latha.gowda@example.com",
  },
  {
    key: "owner-003",
    name: "Arjun Hegde",
    photoSource: "portrait-3",
    bio: "Arjun left a product design job in 2021 to build a small cottage on his family's land above Aldur, with the fibre line he needed to keep freelancing. It turned into a stay. He is the person to ask about which trail is not crowded and which cafe in town actually roasts its own beans.",
    hostingSince: 2021,
    languages: ["Kannada", "English", "Konkani"],
    location: "Lives in Chikmagalur town, 20 minutes away",
    phone: "+91 99011 45570",
    email: "arjun.hegde@example.com",
  },
];

export const AMENITIES = [
  { name: "WiFi", icon: "wifi", category: "BASICS" },
  { name: "Hot water", icon: "shower", category: "BASICS" },
  { name: "Power backup", icon: "battery", category: "BASICS" },
  { name: "Free parking", icon: "car", category: "BASICS" },
  { name: "Bathroom essentials", icon: "soap", category: "BASICS" },
  { name: "Home-cooked meals", icon: "utensils", category: "KITCHEN" },
  { name: "Filter coffee on tap", icon: "coffee", category: "KITCHEN" },
  { name: "Kitchen access", icon: "chef-hat", category: "KITCHEN" },
  { name: "Bonfire pit", icon: "flame", category: "OUTDOOR" },
  { name: "Estate walk", icon: "footprints", category: "OUTDOOR" },
  { name: "Verandah with a view", icon: "mountain", category: "OUTDOOR" },
  { name: "Swimming pool", icon: "waves", category: "OUTDOOR" },
  { name: "Caretaker on site", icon: "user-check", category: "SAFETY" },
  { name: "First-aid kit", icon: "cross", category: "SAFETY" },
  { name: "Pet friendly", icon: "paw-print", category: "OUTDOOR" },
];

export const TAGS = [
  { name: "Couples", slug: "couples", type: "OCCASION" },
  { name: "Family", slug: "family", type: "OCCASION" },
  { name: "Friends", slug: "friends", type: "OCCASION" },
  { name: "Solo", slug: "solo", type: "OCCASION" },
  { name: "Luxury", slug: "luxury", type: "FEATURE" },
  { name: "Pet Friendly", slug: "pet-friendly", type: "FEATURE" },
  { name: "Pool", slug: "pool", type: "FEATURE" },
  { name: "Coffee Estate", slug: "coffee-estate", type: "FEATURE" },
  { name: "Workation", slug: "workation", type: "FEATURE" },
  { name: "Budget", slug: "budget", type: "BUDGET" },
];

export const GUIDE_CATEGORIES = [
  { name: "Things To Do", slug: "things-to-do" },
  { name: "Best Cafes", slug: "best-cafes" },
  { name: "Hidden Waterfalls", slug: "hidden-waterfalls" },
  { name: "Coffee Trails", slug: "coffee-trails" },
  { name: "Monsoon Travel", slug: "monsoon-travel" },
  { name: "Itineraries", slug: "itineraries" },
];

// ---------------------------------------------------------------------------
// Stays
// ---------------------------------------------------------------------------

export const STAYS = [
  {
    propertyCode: "P001",
    folder: "property-001",
    slug: "coffeecharm",
    name: "CoffeeCharm",
    type: "Coffee Estate Stay",
    tagline: "A working coffee estate that happens to let you sleep in it.",
    story: `The road to CoffeeCharm stops being a road about a kilometre before you arrive. What replaces it is a track through shade coffee — silver oak overhead, Arabica below, and the particular green half-light that only exists under a plantation canopy.

The house was the estate manager's bungalow, built in 1974 and empty for most of the decade before Yogesh moved back. It has three bedrooms, a verandah that runs the full length of the front, and a kitchen that still has the original wood-fired stove alongside the gas one. Nothing about it is designer. The floors are red oxide, worn smooth in the doorways.

What you are actually here for is the estate. Two acres of it, and Yogesh will take you through it at seven in the morning while the mist is still sitting in the valley — showing you how the berries ripen unevenly, why the pepper vines climb the silver oaks, and what a bad year looks like. In November and December you can pick.

The rest of the time there is very little to do, which is the point. The verandah faces west. The coffee is from forty metres away. By the second evening most people have stopped checking their phone, partly by choice and partly because the signal is honest about its limits.`,
    storyExcerpt:
      "The estate manager's bungalow on a working two-acre Arabica plantation. Red oxide floors, a west-facing verandah, and coffee picked forty metres from where you drink it.",
    area: "Mallandur",
    addressLine:
      "Mallandur Estate Road, near Mallandur Village, Chikmagalur 577101",
    latitude: 13.3861,
    longitude: 75.7089,
    distanceFromTownKm: 22,
    basePricePerNight: 6500,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 3,
    acres: 2,
    checkInTime: "2:00 PM",
    checkOutTime: "11:00 AM",
    fitScore: 89,
    tier: "PREMIUM",
    inspectedOn: "2026-03-14",
    inspectedBy: "Rohan Shetty",
    verification: "VERIFIED",
    caretakerName: "Ramu",
    caretakerPhone: "+91 98450 11223",
    cancellationPolicy:
      "Free cancellation up to 7 days before check-in. Within 7 days we will try to rebook the dates; if we can, there is no charge. Nothing is taken up front, so a cancellation is a message, not a refund.",
    isFeatured: true,
    featuredOrder: 1,
    metaTitle: "CoffeeCharm — Coffee Estate Stay in Mallandur, Chikmagalur",
    metaDescription:
      "A working two-acre Arabica estate 22 km from Chikmagalur. Three bedrooms, a west-facing verandah, estate walks at dawn, and coffee picked on the property.",
    ownerKey: "owner-001",
    amenities: [
      "WiFi",
      "Hot water",
      "Power backup",
      "Free parking",
      "Bathroom essentials",
      "Home-cooked meals",
      "Filter coffee on tap",
      "Bonfire pit",
      "Estate walk",
      "Verandah with a view",
      "Caretaker on site",
      "First-aid kit",
    ],
    tags: ["couples", "family", "coffee-estate", "workation"],
    images: [
      {
        source: "estate-shade-1",
        isHero: true,
        alt: "Shade-grown coffee under silver oak at CoffeeCharm estate",
        caption: "Two acres of Arabica under a silver oak canopy.",
      },
      {
        source: "verandah",
        alt: "The west-facing verandah at CoffeeCharm",
        caption: "The verandah runs the full length of the house.",
      },
      {
        source: "interior-1",
        alt: "Living room with red oxide floors",
        caption: "Red oxide floors, worn smooth in the doorways.",
      },
      {
        source: "room-1",
        alt: "The Estate Room at CoffeeCharm",
        caption: "The Estate Room looks directly into the plantation.",
      },
      {
        source: "breakfast",
        alt: "Home-cooked breakfast on the verandah",
        caption: "Breakfast is akki roti and estate coffee, on the verandah.",
      },
      {
        source: "bonfire",
        alt: "Evening bonfire in the clearing",
        caption: "Ramu lights the bonfire once it gets dark.",
      },
      {
        source: "mullayanagiri-1",
        alt: "Mullayanagiri ridge seen from the estate",
        caption: "The Mullayanagiri ridge, visible on a clear morning.",
      },
      {
        source: "coffee-cup",
        alt: "Filter coffee from beans grown on the estate",
        caption: "Grown, dried and roasted within forty metres.",
      },
    ],
    rooms: [
      {
        slug: "estate-room",
        name: "The Estate Room",
        description:
          "The largest of the three, on the corner, with windows on two sides looking straight into the coffee. Gets the morning light.",
        bedType: "1 King bed",
        maxGuests: 2,
        source: "room-1",
      },
      {
        slug: "silver-oak-room",
        name: "The Silver Oak Room",
        description:
          "Two singles that can be pushed together, and a day bed under the window. The quietest room in the house.",
        bedType: "2 Single beds + 1 day bed",
        maxGuests: 3,
        source: "room-2",
      },
    ],
    highlights: [
      { label: "Working coffee estate", icon: "coffee" },
      { label: "Estate walk at dawn", icon: "footprints" },
      { label: "Free breakfast", icon: "utensils" },
      { label: "Bonfire", icon: "flame" },
      { label: "2 Acres", icon: "trees" },
    ],
    experiences: [
      {
        slug: "morning-coffee-walk",
        title: "Morning coffee walk",
        description:
          "Yogesh takes you through the plantation at 7am, before the mist lifts. How the berries ripen unevenly, why pepper climbs the silver oaks, what a bad year looks like.",
        source: "estate-shade-2",
      },
      {
        slug: "pick-your-own",
        title: "Pick your own (Nov–Dec)",
        description:
          "During harvest you can pick alongside the crew. You will be slow, and they will be kind about it.",
        source: "estate-canara",
      },
      {
        slug: "roast-and-brew",
        title: "Roast and brew session",
        description:
          "Green beans from the estate, a pan, and a filter. You will learn why your coffee at home tastes the way it does.",
        source: "coffee-cup",
      },
      {
        slug: "bonfire-evening",
        title: "Bonfire evening",
        description:
          "Ramu builds it in the clearing behind the house once the light goes. Bring a jacket; it drops to 14°C in December.",
        source: "bonfire",
      },
      {
        slug: "estate-breakfast",
        title: "Breakfast on the verandah",
        description:
          "Akki roti, chutney pudi, and coffee from forty metres away. Served whenever you surface.",
        source: "breakfast",
      },
    ],
    nearby: [
      {
        slug: "mullayanagiri",
        name: "Mullayanagiri Peak",
        description:
          "The highest point in Karnataka at 1,930m. Go at sunrise or not at all — by ten it is a car park with a view.",
        category: "VIEWPOINT",
        distanceKm: 24,
        driveTimeMinutes: 55,
        source: "mullayanagiri-2",
        mapsUrl: "https://maps.google.com/?q=Mullayanagiri",
      },
      {
        slug: "baba-budangiri",
        name: "Baba Budangiri",
        description:
          "The range where coffee entered India, smuggled in as seven beans in the 1600s. The shrine at the top is shared by Hindus and Muslims.",
        category: "TREK",
        distanceKm: 31,
        driveTimeMinutes: 70,
        source: "bababudangiri-1",
        mapsUrl: "https://maps.google.com/?q=Baba+Budangiri",
      },
      {
        slug: "hebbe-falls",
        name: "Hebbe Falls",
        description:
          "A 168-foot fall reached by a jeep track through the Kemmangundi estates. The last stretch is on foot, through water.",
        category: "WATERFALL",
        distanceKm: 42,
        driveTimeMinutes: 95,
        source: "hebbe-1",
        mapsUrl: "https://maps.google.com/?q=Hebbe+Falls",
      },
      {
        slug: "hirekolale-lake",
        name: "Hirekolale Lake",
        description:
          "A quiet irrigation lake ringed by hills. Almost nobody comes here in the evening, which is when it is best.",
        category: "LAKE",
        distanceKm: 18,
        driveTimeMinutes: 35,
        source: "ghats-2",
        mapsUrl: "https://maps.google.com/?q=Hirekolale+Lake",
      },
      {
        slug: "town-cafes",
        name: "Chikmagalur town cafes",
        description:
          "Two or three places in town roast their own. Ask Yogesh which one is currently worth the drive; it changes.",
        category: "CAFE",
        distanceKm: 22,
        driveTimeMinutes: 40,
        source: "chikmagalur-town",
        mapsUrl: "https://maps.google.com/?q=Chikmagalur",
      },
    ],
    reviews: [
      {
        guestName: "Meera Raghunathan",
        rating: 5,
        title: "The estate walk is the whole thing",
        comment:
          "We booked it for the house and left talking about the plantation. Yogesh walked us through at 7am and explained more about coffee in ninety minutes than I had picked up in twenty years of drinking it. The house is simple and spotless. Ramu is lovely. Go in the morning mist.",
        stayedOn: "2026-05-18",
        source: "DIRECT",
        images: ["review-1", "review-2"],
      },
      {
        guestName: "Karthik Iyer",
        rating: 5,
        title: "Genuinely quiet",
        comment:
          "Three days and I did not once hear a car. The verandah faces west so the evenings are the point. Signal is patchy, which everyone should be told and nobody should mind. Breakfast was excellent.",
        stayedOn: "2026-04-02",
        source: "DIRECT",
      },
      {
        guestName: "Anjali & Rohan",
        rating: 4,
        title: "Beautiful, but bring warm clothes",
        comment:
          "Nobody warned us it drops to 14 at night in December and we packed like it was Bengaluru. Our fault, not theirs. The bonfire saved us. The Estate Room is the one to ask for — windows on two sides.",
        stayedOn: "2025-12-21",
        source: "AIRBNB",
      },
      {
        guestName: "Deepa Shenoy",
        rating: 5,
        title: "Took my parents, they have not stopped talking about it",
        comment:
          "Three generations, one verandah, no arguments. That is the review. My father spent an entire afternoon watching the pepper vines and declared it the best holiday he has had.",
        stayedOn: "2026-06-08",
        source: "GOOGLE",
      },
      {
        guestName: "Sameer Bhat",
        rating: 4,
        title: "Great stay, road is rough",
        comment:
          "The last kilometre is a track, not a road, and a low sedan will scrape. Take an SUV or accept your fate. Everything after that is excellent — especially the coffee, obviously.",
        stayedOn: "2026-02-14",
        source: "MMT",
      },
    ],
  },

  {
    propertyCode: "P002",
    folder: "property-002",
    slug: "mistwood-bungalow",
    name: "Mistwood Bungalow",
    type: "Heritage Plantation Bungalow",
    tagline: "A 1930s planter's bungalow, restored down to the monkey-tops.",
    story: `Mistwood was built in 1934 for a British planter who wanted the valley in front of him and the ridge behind, and whoever chose the site knew exactly what they were doing. On a clear morning you can see thirty kilometres. On most mornings you can see about forty feet, because the mist comes up the valley and settles, and that is arguably better.

Latha and Suresh bought it in 2011 as a ruin — the roof had gone in two places and a tree was growing through the back verandah. They spent four years on it. What they kept: the Burma teak floors, the monkey-top windows, the fireplaces in both the main rooms, and the proportions, which are the thing you cannot fake. What they added: plumbing that works, four proper bathrooms, and a pool that sits below the house where it does not fight the view.

It sleeps eight across four bedrooms, so it tends to get booked whole — families, a set of friends, the occasional company that has confused a plantation with an offsite venue. Latha cooks. This is not a minor detail. She will ask you at breakfast what you want for dinner, and then quietly cook something better.

The 5.5 acres around the house are coffee and pepper, still worked. Suresh will show you if you are interested and leave you alone if you are not.`,
    storyExcerpt:
      "A 1934 planter's bungalow above a mist-filled valley — Burma teak floors, monkey-top windows, four bedrooms, and a cook whose reputation precedes her.",
    area: "Kanathi",
    addressLine: "Kanathi Estate, off Mudigere Road, Chikmagalur 577132",
    latitude: 13.4102,
    longitude: 75.6743,
    distanceFromTownKm: 28,
    basePricePerNight: 9200,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 4,
    acres: 5.5,
    checkInTime: "1:00 PM",
    checkOutTime: "11:00 AM",
    fitScore: 94,
    tier: "PREMIUM",
    inspectedOn: "2026-04-02",
    inspectedBy: "Rohan Shetty",
    verification: "VERIFIED",
    caretakerName: "Shivanna",
    caretakerPhone: "+91 98861 40337",
    cancellationPolicy:
      "Free cancellation up to 14 days before check-in — the house is booked whole, so a late cancellation is hard to fill. Within 14 days, talk to us; we have never charged anyone who had a real reason.",
    isFeatured: true,
    featuredOrder: 2,
    metaTitle: "Mistwood Bungalow — Heritage Plantation Stay in Chikmagalur",
    metaDescription:
      "A restored 1934 planter's bungalow on 5.5 acres of coffee near Kanathi. Four bedrooms, a pool below the house, and home cooking that people come back for.",
    ownerKey: "owner-002",
    amenities: [
      "WiFi",
      "Hot water",
      "Power backup",
      "Free parking",
      "Bathroom essentials",
      "Home-cooked meals",
      "Filter coffee on tap",
      "Kitchen access",
      "Bonfire pit",
      "Estate walk",
      "Verandah with a view",
      "Swimming pool",
      "Caretaker on site",
      "First-aid kit",
    ],
    tags: ["family", "friends", "luxury", "pool", "coffee-estate"],
    images: [
      {
        source: "ghats-1",
        isHero: true,
        alt: "The valley below Mistwood Bungalow at dawn",
        caption:
          "The valley fills with mist most mornings. This is the view from the front steps.",
      },
      {
        source: "room-3",
        alt: "Bedroom with Burma teak floors",
        caption: "Burma teak floors, original to the house.",
      },
      {
        source: "dining",
        alt: "The dining room at Mistwood",
        caption: "Latha will ask at breakfast what you want for dinner.",
      },
      {
        source: "pool",
        alt: "The pool below the bungalow",
        caption: "Set below the house, so it does not fight the view.",
      },
      {
        source: "bababudangiri-2",
        alt: "The Baba Budangiri range behind the estate",
        caption: "The ridge behind the house is the Baba Budangiri range.",
      },
      {
        source: "hammock",
        alt: "Hammock on the lawn",
        caption: "The lawn, and the only thing anyone does on it.",
      },
      {
        source: "stars",
        alt: "Night sky over the plantation",
        caption: "No town for twenty kilometres. The sky does what it should.",
      },
      {
        source: "room-4",
        alt: "The Planter's Room at Mistwood",
        caption: "The Planter's Room still has its fireplace.",
      },
    ],
    rooms: [
      {
        slug: "planters-room",
        name: "The Planter's Room",
        description:
          "The original master. Fireplace, four-poster, and the monkey-top window that the restoration was built around. Faces the valley.",
        bedType: "1 King bed",
        maxGuests: 2,
        source: "room-4",
      },
      {
        slug: "valley-room",
        name: "The Valley Room",
        description:
          "Corner room on the east side, so it gets the sunrise straight through the window. Two queens — the room families put the children in.",
        bedType: "2 Queen beds",
        maxGuests: 4,
        source: "room-3",
      },
    ],
    highlights: [
      { label: "Built 1934", icon: "landmark" },
      { label: "Swimming pool", icon: "waves" },
      { label: "Latha's cooking", icon: "chef-hat" },
      { label: "Sleeps 8", icon: "users" },
      { label: "5.5 Acres", icon: "trees" },
    ],
    experiences: [
      {
        slug: "cook-with-latha",
        title: "Cook with Latha",
        description:
          "She does not really teach so much as hand you things and correct you. You will come away able to make one Malnad dish properly.",
        source: "dining",
      },
      {
        slug: "estate-and-pepper-walk",
        title: "Estate and pepper walk",
        description:
          "Suresh walks the 5.5 acres most evenings. Coffee, pepper, cardamom, and a running commentary on the price of all three.",
        source: "estate-shade-1",
      },
      {
        slug: "mist-morning",
        title: "Mist on the verandah",
        description:
          "Not an activity. Get up at six, take coffee to the front steps, and watch the valley fill. This is what the house was built for.",
        source: "ghats-2",
      },
      {
        slug: "pool-afternoon",
        title: "The pool, all afternoon",
        description:
          "It is below the house, it is quiet, and nobody will bother you. Bring a book you have been meaning to finish.",
        source: "pool",
      },
      {
        slug: "stargazing",
        title: "Stargazing from the lawn",
        description:
          "Shivanna drags the chairs out. No town for twenty kilometres in any direction, so on a clear night the Milky Way is just there.",
        source: "stars",
      },
    ],
    nearby: [
      {
        slug: "baba-budangiri",
        name: "Baba Budangiri",
        description:
          "The ridge behind the house. The shrine at the top is shared by Hindus and Muslims, and the road up is one of the best drives in the district.",
        category: "TREK",
        distanceKm: 19,
        driveTimeMinutes: 45,
        source: "bababudangiri-2",
        mapsUrl: "https://maps.google.com/?q=Baba+Budangiri",
      },
      {
        slug: "mullayanagiri",
        name: "Mullayanagiri Peak",
        description:
          "Karnataka's highest point. Forty minutes from the gate if you leave before six, twice that if you do not.",
        category: "VIEWPOINT",
        distanceKm: 21,
        driveTimeMinutes: 50,
        source: "mullayanagiri-1",
        mapsUrl: "https://maps.google.com/?q=Mullayanagiri",
      },
      {
        slug: "kemmanagundi",
        name: "Kemmanagundi",
        description:
          "A hill station and a garden laid out in the 1930s, plus the trailhead for Z Point. Go on a weekday.",
        category: "VIEWPOINT",
        distanceKm: 38,
        driveTimeMinutes: 85,
        source: "kemmanagundi",
        mapsUrl: "https://maps.google.com/?q=Kemmanagundi",
      },
      {
        slug: "hebbe-falls",
        name: "Hebbe Falls",
        description:
          "168 feet, reached by jeep through the estates and then on foot through the stream. Do not attempt it in your own car.",
        category: "WATERFALL",
        distanceKm: 40,
        driveTimeMinutes: 90,
        source: "hebbe-2",
        mapsUrl: "https://maps.google.com/?q=Hebbe+Falls",
      },
      {
        slug: "belur-halebidu",
        name: "Belur & Halebidu",
        description:
          "Hoysala temple carving from the 12th century, about ninety minutes out. A full day, and worth it.",
        category: "TEMPLE",
        distanceKm: 62,
        driveTimeMinutes: 105,
        source: "chikmagalur-town",
        mapsUrl: "https://maps.google.com/?q=Belur+Halebidu",
      },
    ],
    reviews: [
      {
        guestName: "The Menon family",
        rating: 5,
        title: "Nine of us, zero complaints",
        comment:
          "We took the whole house for a 60th birthday. Four bedrooms, eight of us plus a baby, and it absorbed all of it. Latha cooked every meal and we have been trying to reverse-engineer the pork curry ever since. The mist in the morning is not an exaggeration.",
        stayedOn: "2026-06-14",
        source: "DIRECT",
        images: ["review-3", "review-4"],
      },
      {
        guestName: "Vikram Sathe",
        rating: 5,
        title: "The house is the destination",
        comment:
          "I have stayed in a lot of restored bungalows and most of them are a lobby with a theme. This is the real thing — the proportions, the teak, the fireplaces that actually work. Suresh's evening walk is worth doing twice.",
        stayedOn: "2026-03-30",
        source: "DIRECT",
      },
      {
        guestName: "Nisha Kulkarni",
        rating: 5,
        title: "Latha should be on the homepage",
        comment:
          "The bungalow is stunning, the pool is lovely, the view is the view. But the reason to come back is dinner. She asks you at breakfast and then makes something better than what you said.",
        stayedOn: "2026-05-02",
        source: "GOOGLE",
      },
      {
        guestName: "Rahul & Tanvi",
        rating: 4,
        title: "Wonderful, but not for a quick trip",
        comment:
          "It is 28 km from town on roads that take their time, so if you are coming for one night you will spend most of it driving. We stayed three and it was perfect. Book the Planter's Room.",
        stayedOn: "2026-01-25",
        source: "AIRBNB",
      },
      {
        guestName: "Farhan Qureshi",
        rating: 4,
        title: "Heritage means heritage",
        comment:
          "Beautiful old house — which also means the plumbing groans and the floors creak and one window does not close properly. None of it bothered us and honestly it is part of the charm, but if you want a hotel, this is not a hotel.",
        stayedOn: "2026-02-08",
        source: "MMT",
      },
    ],
  },

  {
    propertyCode: "P003",
    folder: "property-003",
    slug: "kaapi-nest",
    name: "Kaapi Nest",
    type: "Hillside Cottage",
    tagline: "One room, fast fibre, and a valley to look at while you think.",
    story: `Kaapi Nest is small on purpose. Arjun built it in 2021 on a corner of his family's land above Aldur, and the brief he gave himself was: somewhere he could work for a month without wanting to leave.

So there is a desk, and it faces the window, and the window faces the valley. There is fibre — real fibre, 100 Mbps, which up here is close to a miracle and which he will tell you about at length. There is a small kitchen if you want to cook and a caretaker, Manjunath, who lives ten minutes down the hill and will bring you breakfast if you do not.

It sleeps four across two rooms, but it is really built for two, or for one person with a deadline. The cottage sits at the top of a slope of coffee and the nearest other building is far enough away to be a light rather than a neighbour.

This is the cheapest thing Stayze lists and it is on the list because of what it does, not despite the price. It does one thing — quiet, connected, with a view — and it does it better than places charging three times as much.`,
    storyExcerpt:
      "A two-room cottage above Aldur built for working somewhere better. Real fibre, a desk facing the valley, and the nearest building far enough away to be a light.",
    area: "Aldur",
    addressLine: "Hegde Estate, Aldur–Balehonnur Road, Chikmagalur 577111",
    latitude: 13.2874,
    longitude: 75.6301,
    distanceFromTownKm: 16,
    basePricePerNight: 4200,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    acres: 1.2,
    checkInTime: "12:00 PM",
    checkOutTime: "10:00 AM",
    fitScore: 82,
    tier: "STANDARD",
    inspectedOn: "2026-05-20",
    inspectedBy: "Priya Nair",
    verification: "VERIFIED",
    caretakerName: "Manjunath",
    caretakerPhone: "+91 99012 88461",
    cancellationPolicy:
      "Free cancellation up to 48 hours before check-in. It is one small cottage and it rebooks easily, so we would rather you came another time than felt trapped into coming now.",
    isFeatured: true,
    featuredOrder: 3,
    metaTitle: "Kaapi Nest — Workation Cottage near Aldur, Chikmagalur",
    metaDescription:
      "A two-room hillside cottage above Aldur with 100 Mbps fibre, a desk facing the valley, and a coffee slope below. Built for working somewhere better.",
    ownerKey: "owner-003",
    amenities: [
      "WiFi",
      "Hot water",
      "Power backup",
      "Free parking",
      "Bathroom essentials",
      "Home-cooked meals",
      "Filter coffee on tap",
      "Kitchen access",
      "Estate walk",
      "Verandah with a view",
      "Pet friendly",
      "First-aid kit",
    ],
    tags: [
      "couples",
      "solo",
      "workation",
      "budget",
      "pet-friendly",
      "coffee-estate",
    ],
    images: [
      {
        source: "estate-shade-2",
        isHero: true,
        alt: "The coffee slope below Kaapi Nest",
        caption:
          "The cottage sits at the top of the slope. This is what is below it.",
      },
      {
        source: "desk",
        alt: "The desk at Kaapi Nest, facing the valley",
        caption:
          "The desk faces the window. The window faces the valley. That is the design.",
      },
      {
        source: "room-5",
        alt: "The Fibre Room at Kaapi Nest",
        caption: "The Fibre Room — the one with the desk.",
      },
      {
        source: "book-nook",
        alt: "Reading corner in the cottage",
        caption: "The corner everyone ends up in by the second evening.",
      },
      {
        source: "rain",
        alt: "Monsoon rain over the Aldur valley",
        caption: "June to September, this is most of the day. Bring a jumper.",
      },
      {
        source: "kemmanagundi",
        alt: "Hills above Aldur",
        caption: "The ridge above Aldur, twenty minutes' walk up.",
      },
      {
        source: "coffee-cup",
        alt: "Filter coffee at the cottage",
        caption: "Manjunath brings it at seven unless you tell him not to.",
      },
      {
        source: "room-6",
        alt: "The Valley Room at Kaapi Nest",
        caption: "The second bedroom, for when there are four of you.",
      },
    ],
    rooms: [
      {
        slug: "fibre-room",
        name: "The Fibre Room",
        description:
          "The one with the desk. Faces the valley, gets the light until about four, and has the router in it — which matters more than it should.",
        bedType: "1 Queen bed",
        maxGuests: 2,
        source: "room-5",
      },
      {
        slug: "valley-room",
        name: "The Valley Room",
        description:
          "The second bedroom, at the back. Quieter, darker, better for sleeping. Two singles.",
        bedType: "2 Single beds",
        maxGuests: 2,
        source: "room-6",
      },
    ],
    highlights: [
      { label: "100 Mbps fibre", icon: "wifi" },
      { label: "Desk with a view", icon: "monitor" },
      { label: "Pet friendly", icon: "paw-print" },
      { label: "16 km from town", icon: "map-pin" },
      { label: "Best value listed", icon: "tag" },
    ],
    experiences: [
      {
        slug: "work-with-a-view",
        title: "A month at the desk",
        description:
          "The reason the place exists. 100 Mbps, a UPS that covers the outages, and nothing outside the window but coffee and hills.",
        source: "desk",
      },
      {
        slug: "aldur-ridge-walk",
        title: "The Aldur ridge walk",
        description:
          "Twenty minutes straight up from the cottage, and the whole valley opens out. Arjun's favourite, and he will draw you a map.",
        source: "trek",
      },
      {
        slug: "monsoon-mornings",
        title: "Monsoon mornings",
        description:
          "June to September it rains most of the day. Sit on the covered verandah with coffee and do not go anywhere. This is a legitimate plan.",
        source: "rain",
      },
      {
        slug: "morning-coffee",
        title: "Coffee at seven",
        description:
          "Manjunath brings a flask up at seven unless you tell him not to. Most people do not tell him not to.",
        source: "coffee-cup",
      },
      {
        slug: "sunrise-yoga",
        title: "Sunrise on the lawn",
        description:
          "The lawn faces east and there is nothing between it and the sun. Take a mat out, or just sit.",
        source: "yoga",
      },
    ],
    nearby: [
      {
        slug: "hirekolale-lake",
        name: "Hirekolale Lake",
        description:
          "Twenty minutes down the hill. Go in the evening, when the water goes flat and there is nobody there.",
        category: "LAKE",
        distanceKm: 12,
        driveTimeMinutes: 25,
        source: "ghats-2",
        mapsUrl: "https://maps.google.com/?q=Hirekolale+Lake",
      },
      {
        slug: "mullayanagiri",
        name: "Mullayanagiri Peak",
        description:
          "The highest point in Karnataka. Closer from here than from most stays — leave at five and you will have it briefly to yourself.",
        category: "VIEWPOINT",
        distanceKm: 26,
        driveTimeMinutes: 60,
        source: "mullayanagiri-2",
        mapsUrl: "https://maps.google.com/?q=Mullayanagiri",
      },
      {
        slug: "kudremukh",
        name: "Kudremukh",
        description:
          "The horse-face peak, and a long day out. A proper trek with a permit, not a viewpoint you drive to.",
        category: "TREK",
        distanceKm: 58,
        driveTimeMinutes: 110,
        source: "kudremukh-1",
        mapsUrl: "https://maps.google.com/?q=Kudremukh",
      },
      {
        slug: "aldur-coffee-curing",
        name: "Aldur coffee curing works",
        description:
          "Where half the district's crop gets cured. Not a tourist thing at all, which is exactly why it is interesting. Ask Arjun to call ahead.",
        category: "ESTATE",
        distanceKm: 4,
        driveTimeMinutes: 10,
        source: "estate-canara",
        mapsUrl: "https://maps.google.com/?q=Aldur",
      },
      {
        slug: "town-cafes",
        name: "Chikmagalur town cafes",
        description:
          "Sixteen kilometres, so town is actually doable for dinner from here — which is not true of most estate stays.",
        category: "CAFE",
        distanceKm: 16,
        driveTimeMinutes: 30,
        source: "chikmagalur-town",
        mapsUrl: "https://maps.google.com/?q=Chikmagalur",
      },
    ],
    reviews: [
      {
        guestName: "Priya Venkatesh",
        rating: 5,
        title: "Worked from here for three weeks",
        comment:
          "The fibre is real and it did not drop once, including through two days of heavy rain. I took calls with the valley behind me and everyone asked where I was. Manjunath is quietly excellent. I will be back in the monsoon.",
        stayedOn: "2026-06-20",
        source: "DIRECT",
        images: ["review-2", "review-3"],
      },
      {
        guestName: "Aditya Rao",
        rating: 5,
        title: "Small, cheap, and better than places at 3x",
        comment:
          "It is one cottage and it does one thing. The desk, the window, the coffee at seven. I have paid a lot more for a lot less. Bring your own snacks — there is no shop for eight kilometres.",
        stayedOn: "2026-04-11",
        source: "DIRECT",
      },
      {
        guestName: "Shruti Pillai",
        rating: 4,
        title: "Took the dog, no drama",
        comment:
          "Genuinely pet friendly, not pet-tolerated. She had the run of the lawn for four days and Manjunath fed her things he should not have. Only note: the second bedroom is quite dark.",
        stayedOn: "2026-05-09",
        source: "GOOGLE",
      },
      {
        guestName: "Nikhil Menon",
        rating: 4,
        title: "Great value, thin walls",
        comment:
          "Two rooms and you can hear everything in both. Fine for a couple, less fine for four adults who do not know each other well. Everything else — the view, the connection, the price — is spot on.",
        stayedOn: "2026-03-17",
        source: "AIRBNB",
      },
      {
        guestName: "Ananya Desai",
        rating: 5,
        title: "The monsoon is the season",
        comment:
          "Everyone told us not to come in July. They were wrong. It rained for three days, we did not leave the verandah, and it was the best break we have had in years. Arjun was right about the ridge walk.",
        stayedOn: "2025-07-28",
        source: "MMT",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Travel guides
// ---------------------------------------------------------------------------

export const GUIDES = [
  {
    slug: "2-day-chikmagalur-itinerary",
    title: "A 2-day Chikmagalur itinerary that is not a checklist",
    excerpt:
      "Most two-day plans try to see nine things and see none of them. This one does four, properly.",
    categorySlug: "itineraries",
    coverSource: "mullayanagiri-1",
    readTimeMinutes: 7,
    author: "Rohan Shetty",
    stays: ["coffeecharm", "mistwood-bungalow"],
    metaTitle: "A 2-Day Chikmagalur Itinerary — Stayze",
    metaDescription:
      "Four things done properly beats nine done badly. A realistic two-day plan for Chikmagalur, with drive times that are honest.",
    body: `Most two-day Chikmagalur itineraries you will find online are a list of nine places with no drive times attached. Chikmagalur's roads do not work like that. The hills are slow, the last mile to anywhere good is usually a track, and if you try to see nine things you will spend eleven hours in a car and see the inside of it.

## Day one

**Arrive by noon.** From Bengaluru that means leaving at six. The drive is about four hours if the Hassan stretch behaves.

**Afternoon: do nothing.** This is not filler. If you are staying on an estate, the afternoon of day one is when you walk it — you will learn more about coffee in an hour with someone who grows it than in a day of reading.

**Evening: the town, or the bonfire.** Chikmagalur town is small and has two or three cafes that roast their own. If you are more than 20 km out, skip it and stay put.

## Day two

**Mullayanagiri at sunrise.** Leave at five. This is the only way to do it — by ten it is a car park with a view. It is the highest point in Karnataka at 1,930 metres and the last stretch is 500-odd steps.

**Late morning: Baba Budangiri.** The range next door, and the reason coffee exists in India at all — seven beans, smuggled in from Yemen in the 1600s, planted on this ridge.

**Afternoon: leave, or stay.** If you are driving back, leave by three. If you have a third day, spend it at a waterfall.

## What this itinerary leaves out

Hebbe Falls, Kudremukh, Belur and Halebidu are all excellent and none of them fit in two days. Do not try. Come back.`,
  },
  {
    slug: "hidden-waterfalls-chikmagalur",
    title: "Four Chikmagalur waterfalls, ranked by how hard they are to reach",
    excerpt:
      "The good ones require a jeep, a walk, or both. That is the filter, and it works.",
    categorySlug: "hidden-waterfalls",
    coverSource: "hebbe-1",
    readTimeMinutes: 6,
    author: "Priya Nair",
    stays: ["coffeecharm", "mistwood-bungalow", "kaapi-nest"],
    metaTitle: "Hidden Waterfalls in Chikmagalur — Stayze",
    metaDescription:
      "Hebbe, Kalhatti, Manikyadhara and Jhari. What each one actually takes to reach, and which are worth it in which season.",
    body: `There is a rough rule in the Western Ghats: the effort required to reach a waterfall is inversely proportional to the number of people standing in front of it. These four are ranked easiest to hardest.

## 1. Kalhatti Falls — roadside

You can more or less park and look at it. Which means, on a Sunday in August, so can four hundred other people. Go early or go on a weekday.

## 2. Manikyadhara Falls — a short walk

Below the Baba Budangiri shrine. More of a cascade than a fall, and considered sacred, so people bathe in it. Ten minutes from the road.

## 3. Jhari Falls (Buttermilk Falls) — jeep required

The road ends and a local jeep takes you the rest of the way through the estates. Do not attempt it in your own car; people do, and they regret it.

## 4. Hebbe Falls — jeep, then water

168 feet, in two stages, at the end of a 9 km jeep track through the Kemmangundi coffee estates. The last stretch is on foot through the stream itself. This is the one worth building a day around.

## When to go

**June–September** is when they are full, and when the leeches are out. Wear closed shoes and carry salt. **October–November** is the sweet spot: still heavy, fewer leeches. By **March** most of them are a trickle.`,
  },
  {
    slug: "coffee-trail-baba-budangiri",
    title: "The coffee trail: how seven beans became an industry",
    excerpt:
      "Coffee entered India on the Baba Budangiri ridge in the 1600s, smuggled from Yemen. You can walk to the spot.",
    categorySlug: "coffee-trails",
    coverSource: "estate-shade-1",
    readTimeMinutes: 8,
    author: "Rohan Shetty",
    stays: ["coffeecharm", "mistwood-bungalow"],
    metaTitle: "The Coffee Trail — Baba Budangiri, Chikmagalur — Stayze",
    metaDescription:
      "How coffee arrived in India: seven smuggled beans on the Baba Budangiri ridge. The history, the estates, and what shade-grown actually means.",
    body: `The story is almost too neat to be true, and it is largely true. In the 1600s a Sufi saint named Baba Budan, returning from the Haj, passed through the port of Mocha in Yemen. Coffee was Yemen's monopoly and exporting fertile beans was forbidden. He is said to have strapped seven to his body and carried them out.

He planted them on the ridge above what is now Chikmagalur. The ridge is named after him.

## What "shade-grown" actually means

Walk into an estate here and the first thing you notice is that you cannot see the sky. Arabica in the Western Ghats is grown under a canopy — silver oak, mostly, plus jackfruit and the odd rosewood. The canopy keeps the temperature down and the pepper vines climb the same trees.

This is not how most of the world grows coffee. Sun-grown plantations yield more, faster. Shade-grown is slower, and the cup is better, and the biodiversity that survives in it is the reason these estates still have hornbills in them.

## Doing the trail

Start at the **Baba Budangiri shrine** — shared by Hindus and Muslims, which in the current climate is worth noticing. Then drop into any working estate. Most owners will walk you through if you ask; ask in the morning, when the mist is still down.

Finish at a **curing works** — Aldur has one. It is loud, dusty, entirely unglamorous, and it is where the crop actually becomes a commodity.`,
  },
  {
    slug: "chikmagalur-in-the-monsoon",
    title: "Chikmagalur in the monsoon: what nobody tells you",
    excerpt:
      "Everyone says don't come in July. Everyone is wrong, with three specific caveats.",
    categorySlug: "monsoon-travel",
    coverSource: "ghats-1",
    readTimeMinutes: 5,
    author: "Priya Nair",
    stays: ["kaapi-nest", "coffeecharm"],
    metaTitle: "Chikmagalur in the Monsoon — Stayze",
    metaDescription:
      "The monsoon is the best and worst time to visit Chikmagalur. Leeches, landslides, viewpoints you cannot see — and why it is still worth it.",
    body: `The standard advice is to visit Chikmagalur between October and March. The standard advice is fine. It is also how you end up sharing Mullayanagiri with six hundred people.

The monsoon — June through September — is the other option, and it is genuinely better, if you accept what it is.

## What you get

The Ghats in full flood. Waterfalls at maximum. Coffee flowering after the first rains, which smells like jasmine across an entire valley and lasts about three days. Estates to yourself. And rates that are, frankly, a different business.

## What you give up

**Views.** Mullayanagiri in August is a cloud. You will drive up, stand in white, and drive down. Accept this or do not go.

**Roads.** Landslides close the ghat sections without much warning. Build in a spare day.

**Leeches.** Real, numerous, harmless. Closed shoes, tuck your trousers in, carry salt.

## The three caveats

1. **Do not plan around viewpoints.** Plan around a verandah.
2. **Book a place with a covered outdoor space.** You will spend a lot of time on it.
3. **Do not come for two days.** The rain will take one of them, and then you will have come for one.

If what you want from Chikmagalur is a view from a peak, come in December. If what you want is the place at full volume, come now.`,
  },
  {
    slug: "best-cafes-chikmagalur-town",
    title: "Where to actually drink coffee in Chikmagalur town",
    excerpt:
      "You are in the birthplace of Indian coffee. It would be a shame to drink an instant.",
    categorySlug: "best-cafes",
    coverSource: "chikmagalur-town",
    readTimeMinutes: 4,
    author: "Arjun Hegde",
    stays: ["kaapi-nest"],
    metaTitle: "The Best Cafes in Chikmagalur Town — Stayze",
    metaDescription:
      "Which places in Chikmagalur town roast their own beans, which do a proper filter coffee, and which are worth the drive from an estate.",
    body: `Chikmagalur town is small — you can walk the useful part of it in twenty minutes — and its relationship with coffee is stranger than you would expect. This is the district that grows some of India's best Arabica, and for decades the town itself mostly drank instant, because the good stuff was for export.

That has changed in the last ten years. Here is the honest state of it.

## Places that roast their own

There are two or three at any given time, and which is best genuinely rotates depending on who is running the roaster that season. Ask whoever owns the estate you are staying on. They will know, they will have an opinion, and they will be right.

## The filter coffee question

A proper South Indian filter coffee — decoction, chicory, hot milk, poured between tumbler and dabarah until it foams — is a different drink from an espresso, and it is what most people here actually drink. The small places near the bus stand do it best. Ask for it *kadak* if you want it strong.

## Worth the drive?

**From Kaapi Nest (16 km), yes** — you can come in for dinner and coffee and be back within the hour.

**From an estate 25 km+ out, probably not.** The coffee on the estate came from forty metres away. Drive an hour for a worse cup and you have made a poor trade.`,
  },
  {
    slug: "things-to-do-chikmagalur",
    title: "Things to do in Chikmagalur, honestly ranked",
    excerpt:
      "Including the ones that are not worth it, which is the part the other lists leave out.",
    categorySlug: "things-to-do",
    coverSource: "kudremukh-1",
    readTimeMinutes: 9,
    author: "Rohan Shetty",
    stays: ["coffeecharm", "mistwood-bungalow", "kaapi-nest"],
    metaTitle: "Things To Do in Chikmagalur, Honestly Ranked — Stayze",
    metaDescription:
      "Mullayanagiri, Baba Budangiri, Hebbe Falls, Kudremukh, Belur and Halebidu — what is worth your day and what is not, with real drive times.",
    body: `Every list of things to do in Chikmagalur contains the same eleven items in the same order, and none of them tell you which ones are a waste of a morning. This one does.

## Worth building a day around

**Kudremukh.** A real trek — 20-odd kilometres round trip, a permit, and a guide. The horse-face peak. If you are fit and you have the day, this is the best thing in the district and nothing else is close.

**Hebbe Falls.** A jeep through nine kilometres of coffee estate, then a walk through the stream. 168 feet. Full day.

**Belur and Halebidu.** Hoysala carving from the 12th century, ninety minutes out. Not a Chikmagalur thing at all, and better than most things in Chikmagalur.

## Worth a morning

**Mullayanagiri.** Karnataka's highest point. Go at sunrise. Do not go at eleven.

**Baba Budangiri.** Where coffee entered India. The drive up is genuinely one of the best in the state.

**An estate walk.** Free, if you are staying on one. Consistently the thing people remember.

## Skip, or lower your expectations

**Coffee Museum.** Twenty minutes, a lot of laminated panels.

**Hirekolale Lake.** Pleasant. It is a lake. Go at sunset if you are passing, do not make a trip.

**"Adventure parks" on the Mudigere road.** Zip lines and paintball. You have driven into the Western Ghats. Please do not.

## The thing nobody lists

Sit on a verandah for an entire afternoon and watch the mist move up a valley. Every single guest who does this mentions it afterwards. Nobody plans for it.`,
  },
];

// ---------------------------------------------------------------------------
// Bookings, timeline, contact
// ---------------------------------------------------------------------------

/** dayOffset is relative to the seed run date. Negative = in the past. */
export const BOOKINGS = [
  {
    reference: "STZ-8F3K2",
    staySlug: "coffeecharm",
    guestName: "Ritika Sharma",
    guestPhone: "+91 98800 12345",
    guestEmail: "ritika.sharma@example.com",
    checkInOffset: 21,
    nights: 2,
    adults: 2,
    children: 0,
    note: "Anniversary trip — is the Estate Room available? Also, we are vegetarian.",
    status: "CONFIRMED",
  },
  {
    reference: "STZ-4M9P7",
    staySlug: "mistwood-bungalow",
    guestName: "Vivek Nambiar",
    guestPhone: "+91 99450 66123",
    guestEmail: "vivek.n@example.com",
    checkInOffset: 34,
    nights: 3,
    adults: 6,
    children: 2,
    note: "Family reunion, taking the whole house. One of us is 78 — are there stairs?",
    status: "CONFIRMED",
  },
  {
    reference: "STZ-2Q6R1",
    staySlug: "kaapi-nest",
    guestName: "Sneha Prabhu",
    guestPhone: "+91 97400 33218",
    guestEmail: null,
    checkInOffset: 9,
    nights: 5,
    adults: 1,
    children: 0,
    note: "Working remotely — can you confirm the fibre actually holds up on video calls?",
    status: "CONTACTED",
  },
  {
    reference: "STZ-7B3X5",
    staySlug: "coffeecharm",
    guestName: "Manoj Pillai",
    guestPhone: "+91 98860 77451",
    guestEmail: "manoj.pillai@example.com",
    checkInOffset: 47,
    nights: 2,
    adults: 4,
    children: 1,
    note: null,
    status: "NEW",
  },
  {
    reference: "STZ-5T1W8",
    staySlug: "kaapi-nest",
    guestName: "Aparna Krishnan",
    guestPhone: "+91 99001 55672",
    guestEmail: "aparna.k@example.com",
    checkInOffset: -24,
    nights: 4,
    adults: 2,
    children: 0,
    note: "Bringing our dog. Confirmed with Arjun on the phone.",
    status: "COMPLETED",
  },
];

/** The nine steps of the post-booking timeline, in order. */
export const TIMELINE_STEPS = [
  {
    stepKey: "BOOKING_CONFIRMED",
    title: "Your stay is confirmed",
    content:
      "We have you down for {{nights}} nights at {{stay}}. Your reference is {{reference}} — keep it, it is how you get back to this page.",
  },
  {
    stepKey: "WEATHER",
    title: "What the weather is doing",
    content:
      "Chikmagalur sits at around 1,000m, so it runs cooler than you expect. Evenings drop to 14–16°C between November and February. If you are coming in the monsoon, assume rain most of the day and pack accordingly.",
  },
  {
    stepKey: "DIRECTIONS",
    title: "Getting here",
    content:
      "From Bengaluru it is roughly four hours via Hassan. The last stretch to the property is not a highway — take it slowly, and do not trust your maps app for the final kilometre. We will send a pin the day before.",
  },
  {
    stepKey: "CARETAKER_CONTACT",
    title: "{{caretaker}}, your caretaker",
    content:
      "{{caretaker}} looks after the property and will meet you when you arrive. Their number is on this page from 48 hours before check-in. They are the person to call for anything at all — a leaking tap, an extra blanket, or where to eat.",
  },
  {
    stepKey: "CHECKIN_GUIDE",
    title: "Checking in",
    content:
      "Check-in is from {{checkIn}}, checkout by {{checkOut}}. If you are going to arrive after dark, tell us — the approach is unlit and it is genuinely easier with someone at the gate.",
  },
  {
    stepKey: "THINGS_TO_PACK",
    title: "What to bring",
    content:
      "Closed shoes if you plan to walk the estate — there are leeches in the monsoon and they are harmless but nobody enjoys the surprise. A jumper, even in summer. A torch. And less than you think: there is nowhere to wear it.",
  },
  {
    stepKey: "NEARBY_ATTRACTIONS",
    title: "Around the stay",
    content:
      "We have put the five places actually worth your time on the stay page, with honest drive times. The short version: go to the peaks at sunrise, not at eleven, and build a whole day around a waterfall rather than squeezing one in.",
  },
  {
    stepKey: "ENJOY_STAY",
    title: "Enjoy it",
    content:
      "The thing every guest mentions afterwards is not a peak or a waterfall. It is an afternoon on the verandah watching the mist come up the valley. Nobody plans for that one. Leave room for it.",
  },
  {
    stepKey: "LEAVE_REVIEW",
    title: "Tell us how it went",
    content:
      "Honestly, please — including what was not good. We inspect every property ourselves and guest reviews are how we find out what we missed.",
  },
];

export const CONTACT_MESSAGES = [
  {
    name: "Harish Bhatt",
    phone: "+91 98450 90211",
    email: "harish.bhatt@example.com",
    message:
      "Do any of your stays have wheelchair access? My mother uses one and most homestays we call have not thought about it at all.",
    channel: "EMAIL",
  },
  {
    name: "Divya Rangan",
    phone: "+91 99160 45009",
    email: null,
    message:
      "Is CoffeeCharm available the last weekend of August? The calendar shows blocked but I wanted to check if that is firm.",
    channel: "WHATSAPP",
  },
  {
    name: "Ravi Shastri",
    phone: "+91 98801 22456",
    email: "ravi.s@example.com",
    message:
      "We are 14 people. Can we book Mistwood and one more property together for the same dates?",
    channel: "CALL",
  },
  {
    name: "Kavya Suresh",
    phone: "+91 97310 88123",
    email: "kavya@example.com",
    message:
      "How bad is the road to Kaapi Nest in the monsoon? We drive a hatchback.",
    channel: "WHATSAPP",
  },
  {
    name: "Imran Sheikh",
    phone: "+91 99720 31445",
    email: "imran.sheikh@example.com",
    message:
      "Do you take corporate bookings? We are a team of 10 looking for somewhere to work for a week in October.",
    channel: "EMAIL",
  },
];
