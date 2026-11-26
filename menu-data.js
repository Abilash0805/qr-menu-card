/*
  Menu content for the sample venue.
  Edit this file to change the restaurant, sections and dishes —
  the guest menu and the table cards both read from it.

  diet:  "veg" | "nonveg" | "egg"
  spice: 0–3
  tags:  "chef" (Chef's pick), "signature", "new", "seasonal"
*/
window.MENU = {
  venue: {
    restaurant: "Sample",
    tagline: "Coastal kitchen & bar",
    hours: "Lunch 12:00–15:30 · Dinner 19:00–23:00",
    wifi: { name: "Sample-Guest", password: "welcome2026" },
    footnote:
      "All prices in Indian Rupees and exclusive of 5% GST. A discretionary service charge is not levied. Please tell your server about any allergies before ordering — our kitchen handles nuts, gluten, dairy and shellfish."
  },

  sections: [
    {
      id: "small-plates",
      title: "Small Plates",
      note: "To share, or not.",
      items: [
        { id: "sp1", name: "Kozhi Varuthathu", desc: "Crisp country-chicken fry, curry leaf, crushed black pepper, shallots fried in coconut oil.", price: 420, diet: "nonveg", spice: 2, tags: ["signature"], allergens: [] },
        { id: "sp2", name: "Kappa & Meen Curry", desc: "Mashed tapioca with turmeric and green chilli, a small pot of red fish curry on the side.", price: 380, diet: "nonveg", spice: 2, tags: [], allergens: ["fish"] },
        { id: "sp3", name: "Banana Flower Vada", desc: "Chana dal fritters folded with banana blossom, mint-coconut chutney.", price: 290, diet: "veg", spice: 1, tags: ["chef"], allergens: [] },
        { id: "sp4", name: "Kallumakkaya Fry", desc: "Green mussels from Thalassery, rice-flour crust, kokum salt.", price: 520, diet: "nonveg", spice: 2, tags: ["seasonal"], allergens: ["shellfish"] },
        { id: "sp5", name: "Mushroom Pepper Roast", desc: "Button and oyster mushrooms tossed dry with roasted coconut and tellicherry pepper.", price: 340, diet: "veg", spice: 2, tags: [], allergens: [] },
        { id: "sp6", name: "Mutta Roast Toast", desc: "Slow-cooked onion-tomato masala, halved eggs, served on buttered pav.", price: 260, diet: "egg", spice: 1, tags: ["new"], allergens: ["gluten", "dairy", "egg"] }
      ]
    },
    {
      id: "curries",
      title: "Curries",
      note: "Best with appam or a bowl of matta rice.",
      items: [
        { id: "cu1", name: "Alleppey Fish Curry", desc: "Seer fish simmered with raw mango and coconut milk, finished with fried shallots.", price: 680, diet: "nonveg", spice: 2, tags: ["signature"], allergens: ["fish"] },
        { id: "cu2", name: "Chemmeen Moilee", desc: "Tiger prawns in a mild, turmeric-gold coconut stew with ginger and green chilli.", price: 760, diet: "nonveg", spice: 1, tags: ["chef"], allergens: ["shellfish"] },
        { id: "cu3", name: "Nadan Kozhi Curry", desc: "Home-style chicken curry, roasted coconut paste, a long simmer.", price: 540, diet: "nonveg", spice: 3, tags: [], allergens: [] },
        { id: "cu4", name: "Mutton Pepper Fry", desc: "Bone-in goat, slow-dried in a black iron kadai with crushed pepper and curry leaf.", price: 720, diet: "nonveg", spice: 3, tags: [], allergens: [] },
        { id: "cu5", name: "Vegetable Ishtu", desc: "Potato, carrot and beans in a light coconut milk stew with whole spices.", price: 390, diet: "veg", spice: 0, tags: [], allergens: [] },
        { id: "cu6", name: "Kadala Curry", desc: "Black chickpeas in a dark roasted-coconut gravy — the traditional partner to puttu.", price: 340, diet: "veg", spice: 2, tags: [], allergens: [] },
        { id: "cu7", name: "Paneer Kurumulaku", desc: "Soft paneer in a peppercorn and cashew gravy.", price: 460, diet: "veg", spice: 1, tags: [], allergens: ["dairy", "nuts"] }
      ]
    },
    {
      id: "grill",
      title: "From the Grill",
      note: "Charcoal-fired, cooked to order. Allow 25 minutes.",
      items: [
        { id: "gr1", name: "Karimeen Pollichathu", desc: "Pearl spot marinated in red masala, wrapped in banana leaf and grilled over coals.", price: 890, diet: "nonveg", spice: 2, tags: ["signature"], allergens: ["fish"] },
        { id: "gr2", name: "Catch of the Day", desc: "Ask your server for today's fish. Grilled whole with lime and green-chilli butter.", price: null, priceNote: "Market price", diet: "nonveg", spice: 1, tags: ["seasonal"], allergens: ["fish", "dairy"] },
        { id: "gr3", name: "Lobster Thermidor, Kochi Style", desc: "Half rock lobster, mustard and coconut cream, gratinated.", price: 2400, diet: "nonveg", spice: 0, tags: ["chef"], allergens: ["shellfish", "dairy"] },
        { id: "gr4", name: "Grilled Pineapple & Paneer", desc: "Kashmiri chilli glaze, charred pineapple, pickled onion.", price: 480, diet: "veg", spice: 1, tags: [], allergens: ["dairy"] }
      ]
    },
    {
      id: "breads-rice",
      title: "Breads & Rice",
      items: [
        { id: "br1", name: "Appam", desc: "Lace-edged fermented rice pancakes. Two per portion.", price: 120, diet: "veg", spice: 0, tags: [], allergens: [] },
        { id: "br2", name: "Malabar Parotta", desc: "Flaky, layered, torn at the table. Two per portion.", price: 140, diet: "veg", spice: 0, tags: [], allergens: ["gluten", "dairy"] },
        { id: "br3", name: "Puttu", desc: "Steamed rice-flour cylinders layered with fresh coconut.", price: 160, diet: "veg", spice: 0, tags: [], allergens: [] },
        { id: "br4", name: "Kerala Matta Rice", desc: "Red parboiled rice, steamed.", price: 150, diet: "veg", spice: 0, tags: [], allergens: [] },
        { id: "br5", name: "Thalassery Chicken Biryani", desc: "Short-grain kaima rice, ghee-fried onions, cashews and raisins. Served with raita.", price: 620, diet: "nonveg", spice: 1, tags: ["signature"], allergens: ["dairy", "nuts"] },
        { id: "br6", name: "Vegetable Biryani", desc: "Kaima rice, seasonal vegetables, ghee, mint.", price: 460, diet: "veg", spice: 1, tags: [], allergens: ["dairy", "nuts"] }
      ]
    },
    {
      id: "desserts",
      title: "Desserts",
      items: [
        { id: "de1", name: "Ada Pradhaman", desc: "Rice flakes in jaggery and coconut milk, with cardamom and fried cashew. Served warm.", price: 280, diet: "veg", spice: 0, tags: ["chef"], allergens: ["nuts"] },
        { id: "de2", name: "Tender Coconut Pudding", desc: "Set coconut cream with soft tender coconut, palm-sugar syrup.", price: 320, diet: "veg", spice: 0, tags: [], allergens: ["dairy"] },
        { id: "de3", name: "Banana Fritter & Ice Cream", desc: "Nendran banana pazham pori, vanilla bean ice cream.", price: 260, diet: "veg", spice: 0, tags: [], allergens: ["gluten", "dairy"] }
      ]
    },
    {
      id: "drinks",
      title: "Drinks",
      note: "Bar menu available on request.",
      items: [
        { id: "dr1", name: "Filter Coffee", desc: "Chicory blend, brewed in brass, served in a dabara.", price: 140, diet: "veg", spice: 0, tags: [], allergens: ["dairy"] },
        { id: "dr2", name: "Sulaimani", desc: "Black tea, lemon, a whisper of cardamom.", price: 110, diet: "veg", spice: 0, tags: [], allergens: [] },
        { id: "dr3", name: "Kulukki Sarbath", desc: "Shaken lime, basil seed, green chilli, sugar syrup.", price: 180, diet: "veg", spice: 1, tags: ["signature"], allergens: [] },
        { id: "dr4", name: "Tender Coconut", desc: "Served in the shell.", price: 160, diet: "veg", spice: 0, tags: [], allergens: [] },
        { id: "dr5", name: "Fresh Lime Soda", desc: "Sweet, salted or mixed.", price: 150, diet: "veg", spice: 0, tags: [], allergens: [] }
      ]
    }
  ]
};
