export const languages=[['en','English'],['am','አማርኛ']];

const dict={
  welcomeTitle:{en:'A warm welcome.\nAn unforgettable meal.',am:'የእንግድነት ስሜት።\nየማይረሳ ምግብ።'},
  welcomeSubtitle:{en:'Find your favourites. Discover something delicious.\nMake yourself at home.',am:'የወደዱትን ያግኙ። አዲስ ጣፋጭ ነገር ይፈልጉ።\nእንደ ቤትዎ ይሁኑ።'},
  viewMenu:{en:'View Menu',am:'ምግብ ዝርዝር ይዩ'},
  footnoteTable:{en:'Your table. Your menu. All at your fingertips.',am:'የእርስዎ ጠረጴዛ። የእርስዎ ምግብ ዝርዝር። ሁሉም በእጅዎ ላይ።'},
  footnoteScan:{en:'Scan the QR at your table to order and request service.',am:'ለማዘዝ እና አገልግሎት ለመጠየቅ በጠረጴዛዎ ላይ ያለውን QR ይቃኙ።'},
  openNow:{en:'Open now',am:'ክፍት ነው'},
  closedNow:{en:'Closed now',am:'ዝግ ነው'},
  shareMenu:{en:'Share menu',am:'ምግብ ዝርዝር አጋራ'},
  linkCopied:{en:'Link copied',am:'አገናኝ ተቀድቷል'},
  searchPlaceholder:{en:'Search menu items...',am:'ምግቦችን ይፍልጉ...'},
  recommended:{en:'Daily recommendations',am:'የእለቱ ምርጫዎች'},
  exploreMenu:{en:'Explore our menu',am:'ምግብ ዝርዝራችንን ይመልከቱ'},
  happeningAtOurTable:{en:'Happening at our table',am:'በጠረጴዛችን ላይ የሚሆነው'},
  exploreCategories:{en:'Explore our categories',am:'ምድቦቻችንን ይመልከቱ'},
  allDishes:{en:'All dishes',am:'ሁሉም ምግቦች'},
  allCategories:{en:'All categories',am:'ሁሉም ምድቦች'},
  searchResults:{en:'Search results',am:'የፍለጋ ውጤቶች'},
  ourMenu:{en:'Our menu',am:'ምግብ ዝርዝራችን'},
  dietaryPreference:{en:'Dietary preference',am:'የምግብ ዓይነት ምርጫ'},
  all:{en:'All',am:'ሁሉም'},
  vegan:{en:'Vegan',am:'ቪጋን'},
  nonVegan:{en:'Non-vegan',am:'ቪጋን ያልሆነ'},
  noMatchingDishes:{en:'No matching dishes.',am:'ምንም ተመጣጣኝ ምግብ አልተገኘም።'},
  tryAnother:{en:'Try another search, dietary preference, or category.',am:'ሌላ ፍለጋ፣ የምግብ ምርጫ ወይም ምድብ ይሞክሩ።'},
  printedMenu:{en:'Prefer our printed menu?',am:'የወረቀት ምግብ ዝርዝር ይፈልጋሉ?'},
  viewMenuFiles:{en:'View menu files',am:'ፋይሎችን ይዩ'},
  yourOrder:{en:'Your order',am:'ትዕዛዝዎ'},
  openMenuHome:{en:'Menu home',am:'ወደ ምግብ ዝርዝር'},
  back:{en:'Back',am:'ተመለስ'},
  addToOrder:{en:'Add',am:'ጨምር'},
  placeOrder:{en:'Place order',am:'ትዕዛዝ አስገባ'},
  sendingOrder:{en:'Sending your order…',am:'ትዕዛዝዎ እየተላከ ነው…'},
  howCanWeHelp:{en:'How can we help?',am:'እንዴት ልንታገዝዎት እንችላለን?'},
};

export function translate(language,key,fallback=''){
  return dict[key]?.[language]||dict[key]?.en||fallback;
}
