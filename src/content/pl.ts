import type { Topic } from "../lib/types";

// Each item: a word first, then sentences that put it to work.
// `accept`  = other natural ways to say it (full points, expected still shown).
// `unnatural` = understandable but off; the note explains what a native would say.
export const polishTopics: Topic[] = [
  {
    id: "basics",
    name: "Basics",
    emoji: "👋",
    items: [
      {
        id: "czesc",
        word: { text: "cześć", translation: "hi / bye (informal)", accept: ["hej"] },
        sentences: [
          {
            text: "Cześć, jak się masz?",
            translation: "Hi, how are you?",
            accept: ["Hej, jak się masz?", "Cześć, co słychać?", "Cześć, co u ciebie?"],
            unnatural: [{ text: "Cześć, jak ty się masz?", note: "Polish normally drops 'ty' here — the verb already says who." }],
          },
          {
            text: "Cześć, do zobaczenia jutro!",
            translation: "Bye, see you tomorrow!",
            accept: ["Do zobaczenia jutro, cześć!", "Na razie, do zobaczenia jutro!"],
          },
        ],
      },
      {
        id: "dziekuje",
        word: { text: "dziękuję", translation: "thank you", accept: ["dzięki"] },
        sentences: [
          {
            text: "Dziękuję bardzo za pomoc.",
            translation: "Thank you very much for the help.",
            accept: ["Bardzo dziękuję za pomoc.", "Dzięki bardzo za pomoc.", "Wielkie dzięki za pomoc."],
            unnatural: [{ text: "Dziękuję za pomoc bardzo.", note: "'Bardzo' sounds natural right next to 'dziękuję', not at the end." }],
          },
          { text: "Nie, dziękuję.", translation: "No, thank you.", accept: ["Nie, dzięki."] },
        ],
      },
      {
        id: "przepraszam",
        word: { text: "przepraszam", translation: "sorry / excuse me" },
        sentences: [
          {
            text: "Przepraszam, gdzie jest toaleta?",
            translation: "Excuse me, where is the toilet?",
            accept: ["Przepraszam, gdzie jest łazienka?", "Przepraszam, gdzie tu jest toaleta?"],
            unnatural: [{ text: "Przepraszam, gdzie toaleta jest?", note: "In questions Poles say 'gdzie jest …?' — verb right after the question word." }],
          },
          { text: "Przepraszam, nie rozumiem.", translation: "Sorry, I don't understand." },
        ],
      },
      {
        id: "imie",
        word: { text: "imię", translation: "first name" },
        sentences: [
          {
            text: "Mam na imię Anna.",
            translation: "My name is Anna.",
            accept: ["Nazywam się Anna."],
            unnatural: [{ text: "Moje imię jest Anna.", note: "Word-for-word English. Poles say 'Mam na imię …' or 'Nazywam się …'." }],
          },
          {
            text: "Jak masz na imię?",
            translation: "What's your name?",
            accept: ["Jak się nazywasz?"],
            unnatural: [{ text: "Jakie jest twoje imię?", note: "Grammatical but textbook-stiff — people ask 'Jak masz na imię?'." }],
          },
        ],
      },
      {
        id: "rozumiem",
        word: { text: "rozumiem", translation: "I understand" },
        sentences: [
          { text: "Teraz rozumiem!", translation: "Now I understand!", accept: ["Już rozumiem!"] },
          {
            text: "Czy pan rozumie po polsku?",
            translation: "Do you (sir) understand Polish?",
            accept: ["Rozumie pan po polsku?", "Czy pani rozumie po polsku?", "Rozumie pani po polsku?"],
          },
        ],
      },
      {
        id: "prosze",
        word: { text: "proszę", translation: "please / here you go" },
        sentences: [
          { text: "Kawę, proszę.", translation: "Coffee, please.", accept: ["Poproszę kawę.", "Proszę kawę."] },
          { text: "Proszę bardzo.", translation: "Here you go. / You're welcome.", accept: ["Nie ma za co."] },
        ],
      },
    ],
  },
  {
    id: "food",
    name: "Café & food",
    emoji: "☕",
    items: [
      {
        id: "kawa",
        word: { text: "kawa", translation: "coffee" },
        sentences: [
          {
            text: "Poproszę kawę z mlekiem.",
            translation: "A coffee with milk, please.",
            accept: ["Kawę z mlekiem, proszę.", "Czy mogę prosić kawę z mlekiem?"],
            unnatural: [{ text: "Chcę kawę z mlekiem.", note: "Correct, but blunt when ordering — 'Poproszę …' is the polite default." }],
          },
          { text: "Ta kawa jest za gorąca.", translation: "This coffee is too hot.", accept: ["Ta kawa jest zbyt gorąca."] },
        ],
      },
      {
        id: "woda",
        word: { text: "woda", translation: "water" },
        sentences: [
          { text: "Poproszę szklankę wody.", translation: "A glass of water, please.", accept: ["Szklankę wody, proszę."] },
          {
            text: "Czy ta woda jest gazowana?",
            translation: "Is this water sparkling?",
            accept: ["Ta woda jest gazowana?", "Czy to jest woda gazowana?"],
          },
        ],
      },
      {
        id: "rachunek",
        word: { text: "rachunek", translation: "the bill" },
        sentences: [
          {
            text: "Poproszę rachunek.",
            translation: "The bill, please.",
            accept: ["Rachunek, proszę.", "Czy mogę prosić o rachunek?"],
            unnatural: [{ text: "Chcę zapłacić rachunek.", note: "Understandable, but at a table you'd just say 'Poproszę rachunek'." }],
          },
          {
            text: "Czy mogę zapłacić kartą?",
            translation: "Can I pay by card?",
            accept: ["Mogę zapłacić kartą?", "Można zapłacić kartą?", "Czy można zapłacić kartą?"],
          },
        ],
      },
      {
        id: "smaczny",
        word: { text: "smaczny", translation: "tasty" },
        sentences: [
          { text: "To jest bardzo smaczne.", translation: "This is very tasty.", accept: ["To jest pyszne.", "Bardzo smaczne.", "To jest przepyszne."] },
          { text: "Ta zupa jest bardzo smaczna.", translation: "This soup is very tasty.", accept: ["Ta zupa jest pyszna."] },
        ],
      },
      {
        id: "glodny",
        word: { text: "głodny", translation: "hungry", accept: ["głodna"] },
        sentences: [
          {
            text: "Jestem bardzo głodny.",
            translation: "I'm very hungry.",
            accept: ["Jestem bardzo głodna.", "Jestem strasznie głodny.", "Jestem strasznie głodna."],
          },
          {
            text: "Czy jesteś głodny?",
            translation: "Are you hungry?",
            accept: ["Jesteś głodny?", "Jesteś głodna?", "Czy jesteś głodna?"],
          },
        ],
      },
      {
        id: "chleb",
        word: { text: "chleb", translation: "bread" },
        sentences: [
          { text: "Kupię chleb w piekarni.", translation: "I'll buy bread at the bakery." },
          { text: "Ten chleb jest świeży.", translation: "This bread is fresh." },
        ],
      },
    ],
  },
  {
    id: "travel",
    name: "Getting around",
    emoji: "🚆",
    items: [
      {
        id: "dworzec",
        word: { text: "dworzec", translation: "station" },
        sentences: [
          {
            text: "Gdzie jest dworzec?",
            translation: "Where is the station?",
            accept: ["Gdzie jest dworzec kolejowy?", "Gdzie tu jest dworzec?", "Przepraszam, gdzie jest dworzec?"],
          },
          { text: "Pociąg odjeżdża z dworca o ósmej.", translation: "The train leaves the station at eight." },
        ],
      },
      {
        id: "bilet",
        word: { text: "bilet", translation: "ticket" },
        sentences: [
          {
            text: "Poproszę bilet do Krakowa.",
            translation: "A ticket to Kraków, please.",
            accept: ["Bilet do Krakowa, proszę.", "Poproszę jeden bilet do Krakowa."],
          },
          {
            text: "Gdzie mogę kupić bilet?",
            translation: "Where can I buy a ticket?",
            accept: ["Gdzie można kupić bilet?", "Gdzie kupię bilet?"],
          },
        ],
      },
      {
        id: "prosto",
        word: { text: "prosto", translation: "straight ahead" },
        sentences: [
          { text: "Proszę iść prosto.", translation: "Please go straight.", accept: ["Niech pan idzie prosto.", "Idź prosto."] },
          {
            text: "Idź prosto, a potem w lewo.",
            translation: "Go straight, then left.",
            accept: ["Idź prosto, potem w lewo.", "Idź prosto, a potem skręć w lewo."],
          },
        ],
      },
      {
        id: "daleko",
        word: { text: "daleko", translation: "far" },
        sentences: [
          {
            text: "Czy to daleko stąd?",
            translation: "Is it far from here?",
            accept: ["Czy to jest daleko stąd?", "To daleko stąd?", "Czy to jest daleko?"],
          },
          { text: "Hotel nie jest daleko.", translation: "The hotel isn't far.", accept: ["Hotel jest niedaleko.", "Hotel nie jest daleko stąd."] },
        ],
      },
      {
        id: "lotnisko",
        word: { text: "lotnisko", translation: "airport" },
        sentences: [
          {
            text: "Jak dojechać na lotnisko?",
            translation: "How do I get to the airport?",
            accept: ["Jak się dostać na lotnisko?", "Jak dojadę na lotnisko?"],
          },
          { text: "Jesteśmy już na lotnisku.", translation: "We're already at the airport." },
        ],
      },
      {
        id: "mapa",
        word: { text: "mapa", translation: "map" },
        sentences: [
          { text: "Masz mapę miasta?", translation: "Do you have a map of the city?", accept: ["Czy masz mapę miasta?"] },
          { text: "Pokażę ci to na mapie.", translation: "I'll show it to you on the map.", accept: ["Pokażę ci na mapie."] },
        ],
      },
    ],
  },
  {
    id: "daily",
    name: "Everyday life",
    emoji: "🏠",
    items: [
      {
        id: "dzisiaj",
        word: { text: "dzisiaj", translation: "today", accept: ["dziś"] },
        sentences: [
          { text: "Dzisiaj jest ładna pogoda.", translation: "The weather is nice today.", accept: ["Dzisiaj pogoda jest ładna."] },
          { text: "Co robisz dzisiaj wieczorem?", translation: "What are you doing tonight?" },
        ],
      },
      {
        id: "pracowac",
        word: { text: "pracować", translation: "to work" },
        sentences: [
          { text: "Pracuję w biurze.", translation: "I work in an office." },
          { text: "Jutro nie pracuję.", translation: "I'm not working tomorrow." },
        ],
      },
      {
        id: "lubic",
        word: { text: "lubić", translation: "to like" },
        sentences: [
          { text: "Lubię czytać książki.", translation: "I like reading books." },
          {
            text: "Czy lubisz polską kuchnię?",
            translation: "Do you like Polish cuisine?",
            accept: ["Lubisz polską kuchnię?", "Lubisz polskie jedzenie?", "Czy lubisz polskie jedzenie?"],
          },
        ],
      },
      {
        id: "zmeczony",
        word: { text: "zmęczony", translation: "tired", accept: ["zmęczona"] },
        sentences: [
          { text: "Jestem dzisiaj zmęczony.", translation: "I'm tired today.", accept: ["Jestem dzisiaj zmęczona."] },
          { text: "Wyglądasz na zmęczonego.", translation: "You look tired.", accept: ["Wyglądasz na zmęczoną."] },
        ],
      },
      {
        id: "czas",
        word: { text: "czas", translation: "time" },
        sentences: [
          { text: "Nie mam teraz czasu.", translation: "I don't have time now." },
          { text: "Masz czas w sobotę?", translation: "Do you have time on Saturday?", accept: ["Czy masz czas w sobotę?"] },
        ],
      },
      {
        id: "dom",
        word: { text: "dom", translation: "home / house" },
        sentences: [
          { text: "Wracam do domu.", translation: "I'm going back home." },
          { text: "Jestem w domu.", translation: "I'm at home." },
        ],
      },
    ],
  },
];
