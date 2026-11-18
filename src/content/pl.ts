import type { Phrase, Topic } from "../lib/types";
import { withSentences } from "./util";

// Each item: a word first, then sentences that put it to work.
// `accept`  = other natural ways to say it (full points, expected still shown).
// `unnatural` = understandable but off; the note explains what a native would say.
const baseTopics: Topic[] = [
  {
    id: "basics",
    name: "Basics",
    emoji: "👋",
    interests: ["social", "travel"],
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
    interests: ["food", "travel"],
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
    interests: ["travel"],
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
    interests: ["daily"],
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

// ---------------------------------------------------------------- levelled sentences
// Intermediate (I) and advanced (A) sentences for the words above. Learners on a
// higher level get these instead of the beginner sentences.
const I = "intermediate" as const;
const A = "advanced" as const;

const levelled: Record<string, Phrase[]> = {
  czesc: [
    { level: I, text: "Cześć! Dawno się nie widzieliśmy.", translation: "Hi! Long time no see.", accept: ["Cześć! Dawno się nie widziałyśmy.", "Hej! Dawno się nie widzieliśmy."] },
    { level: A, text: "Wpadłem tylko powiedzieć cześć, zanim wyjadę.", translation: "I just dropped by to say hi before I leave.", accept: ["Wpadłam tylko powiedzieć cześć, zanim wyjadę."] },
  ],
  dziekuje: [
    {
      level: I,
      text: "Dziękuję, że przyszedłeś na moje urodziny.",
      translation: "Thanks for coming to my birthday.",
      accept: ["Dziękuję, że przyszłaś na moje urodziny.", "Dzięki, że przyszedłeś na moje urodziny.", "Dzięki, że przyszłaś na moje urodziny."],
      unnatural: [{ text: "Dziękuję za przyjście na moje urodziny.", note: "Correct but formal — with friends it's 'Dzięki, że przyszedłeś…'." }],
    },
    { level: A, text: "Z góry dziękuję za szybką odpowiedź.", translation: "Thank you in advance for a quick reply.", accept: ["Dziękuję z góry za szybką odpowiedź."] },
  ],
  przepraszam: [
    { level: I, text: "Przepraszam za spóźnienie, był straszny korek.", translation: "Sorry I'm late, there was terrible traffic.", accept: ["Przepraszam za spóźnienie, był okropny korek."] },
    { level: A, text: "Przepraszam, że cię wtedy nie wysłuchałem.", translation: "I'm sorry I didn't hear you out back then.", accept: ["Przepraszam, że cię wtedy nie wysłuchałam."] },
  ],
  imie: [
    { level: I, text: "Nie pamiętam, jak on ma na imię.", translation: "I don't remember what his name is.", accept: ["Nie pamiętam, jak ma na imię."] },
    { level: A, text: "Daliśmy synowi na imię Jan po dziadku.", translation: "We named our son Jan after his grandfather." },
  ],
  rozumiem: [
    { level: I, text: "Nie rozumiem, co do mnie mówisz.", translation: "I don't understand what you're saying to me.", accept: ["Nie rozumiem, co mówisz."] },
    { level: A, text: "Rozumiem twój punkt widzenia, ale się nie zgadzam.", translation: "I understand your point of view, but I don't agree.", accept: ["Rozumiem twój punkt widzenia, ale nie zgadzam się."] },
  ],
  prosze: [
    { level: I, text: "Proszę mówić trochę wolniej.", translation: "Please speak a little more slowly.", accept: ["Proszę mówić wolniej.", "Czy może pan mówić trochę wolniej?"] },
    { level: A, text: "Proszę dać mi znać, jeśli coś się zmieni.", translation: "Please let me know if anything changes.", accept: ["Proszę mi dać znać, jeśli coś się zmieni.", "Daj mi znać, jeśli coś się zmieni."] },
  ],
  kawa: [
    { level: I, text: "Piję kawę bez cukru, ale z mlekiem.", translation: "I drink coffee without sugar, but with milk." },
    {
      level: A,
      text: "Gdybym nie wypił rano kawy, nie dałbym rady pracować.",
      translation: "If I hadn't had coffee this morning, I couldn't work.",
      accept: ["Gdybym nie wypiła rano kawy, nie dałabym rady pracować."],
    },
  ],
  woda: [
    { level: I, text: "Wezmę wodę niegazowaną bez lodu.", translation: "I'll have still water without ice.", accept: ["Poproszę wodę niegazowaną bez lodu."] },
    { level: A, text: "W taki upał trzeba pić dużo wody.", translation: "In heat like this you have to drink a lot of water.", accept: ["W tym upale trzeba pić dużo wody."] },
  ],
  rachunek: [
    { level: I, text: "Czy możemy zapłacić osobno?", translation: "Can we pay separately?", accept: ["Możemy zapłacić osobno?", "Czy możemy płacić osobno?"] },
    { level: A, text: "Wydaje mi się, że w rachunku jest pomyłka.", translation: "I think there's a mistake in the bill.", accept: ["Wydaje mi się, że jest pomyłka w rachunku.", "Chyba jest pomyłka w rachunku."] },
  ],
  smaczny: [
    { level: I, text: "Wszystko było bardzo smaczne, dziękujemy.", translation: "Everything was very tasty, thank you.", accept: ["Wszystko było bardzo smaczne, dziękuję."] },
    { level: A, text: "To były najsmaczniejsze pierogi, jakie w życiu jadłem.", translation: "Those were the tastiest pierogi I've ever eaten.", accept: ["To były najsmaczniejsze pierogi, jakie w życiu jadłam."] },
  ],
  glodny: [
    { level: I, text: "Nie jestem głodny, zjadłem duże śniadanie.", translation: "I'm not hungry, I had a big breakfast.", accept: ["Nie jestem głodna, zjadłam duże śniadanie."] },
    {
      level: A,
      text: "Jak wrócisz z pracy głodny, w lodówce jest zupa.",
      translation: "If you get back from work hungry, there's soup in the fridge.",
      accept: ["Jeśli wrócisz z pracy głodny, w lodówce jest zupa.", "Jak wrócisz z pracy głodna, w lodówce jest zupa."],
    },
  ],
  chleb: [
    { level: I, text: "Czy macie chleb bezglutenowy?", translation: "Do you have gluten-free bread?", accept: ["Macie chleb bezglutenowy?", "Czy jest chleb bezglutenowy?"] },
    { level: A, text: "Babcia zawsze piekła chleb na zakwasie.", translation: "Grandma always baked sourdough bread." },
  ],
  dworzec: [
    { level: I, text: "Spotkajmy się przed dworcem o piątej.", translation: "Let's meet in front of the station at five.", accept: ["Spotkajmy się o piątej przed dworcem."] },
    {
      level: A,
      text: "Zanim dojechaliśmy na dworzec, pociąg już odjechał.",
      translation: "By the time we got to the station, the train had already left.",
      accept: ["Zanim dotarliśmy na dworzec, pociąg już odjechał."],
    },
  ],
  bilet: [
    { level: I, text: "Ile kosztuje bilet w obie strony?", translation: "How much is a return ticket?", accept: ["Ile kosztuje bilet powrotny?"] },
    {
      level: A,
      text: "Musiałem kupić bilet u konduktora, bo automat nie działał.",
      translation: "I had to buy a ticket from the conductor because the machine wasn't working.",
      accept: ["Musiałam kupić bilet u konduktora, bo automat nie działał."],
    },
  ],
  prosto: [
    { level: I, text: "Proszę jechać prosto do drugich świateł.", translation: "Please drive straight on to the second traffic lights." },
    { level: A, text: "Powiem ci prosto z mostu: to był zły pomysł.", translation: "I'll be blunt with you: that was a bad idea." },
  ],
  daleko: [
    { level: I, text: "Mieszkam niedaleko centrum.", translation: "I live not far from the centre.", accept: ["Mieszkam blisko centrum."] },
    { level: A, text: "Bez twojej pomocy nie zaszlibyśmy tak daleko.", translation: "We wouldn't have got this far without your help.", accept: ["Nie zaszlibyśmy tak daleko bez twojej pomocy."] },
  ],
  lotnisko: [
    { level: I, text: "Muszę być na lotnisku dwie godziny przed odlotem.", translation: "I have to be at the airport two hours before departure." },
    {
      level: A,
      text: "Gdyby nie korki, zdążylibyśmy na lotnisko.",
      translation: "If it weren't for the traffic, we'd have made it to the airport in time.",
      accept: ["Gdyby nie korki, zdążylibyśmy na lotnisko na czas."],
    },
  ],
  mapa: [
    { level: I, text: "Zgubiłem się, nawet z mapą w telefonie.", translation: "I got lost, even with a map on my phone.", accept: ["Zgubiłam się, nawet z mapą w telefonie."] },
    { level: A, text: "To miasteczko trudno znaleźć na mapie.", translation: "This little town is hard to find on the map.", accept: ["Trudno znaleźć to miasteczko na mapie."] },
  ],
  dzisiaj: [
    { level: I, text: "Dzisiaj muszę wcześniej wyjść z pracy.", translation: "Today I have to leave work early.", accept: ["Muszę dzisiaj wcześniej wyjść z pracy."] },
    { level: A, text: "Jak na dzisiejsze standardy, to całkiem tanie.", translation: "By today's standards, that's quite cheap.", accept: ["Jak na dzisiejsze czasy, to całkiem tanie."] },
  ],
  pracowac: [
    { level: I, text: "Pracuję zdalnie dwa dni w tygodniu.", translation: "I work remotely two days a week.", accept: ["Dwa dni w tygodniu pracuję zdalnie."] },
    {
      level: A,
      text: "Pracuję tu od trzech lat i wciąż się uczę.",
      translation: "I've been working here for three years and I'm still learning.",
      accept: ["Pracuję tu od trzech lat i ciągle się uczę.", "Pracuję tutaj od trzech lat i wciąż się uczę."],
      unnatural: [{ text: "Pracowałem tu od trzech lat i wciąż się uczę.", note: "For something still going on, Polish uses the present: 'Pracuję tu od…'." }],
    },
  ],
  lubic: [
    { level: I, text: "Nie lubię wstawać wcześnie rano.", translation: "I don't like getting up early in the morning.", accept: ["Nie lubię wcześnie wstawać."] },
    { level: A, text: "Kiedyś nie lubiłem warzyw, a teraz je uwielbiam.", translation: "I used to dislike vegetables, and now I love them.", accept: ["Kiedyś nie lubiłam warzyw, a teraz je uwielbiam.", "Kiedyś nie lubiłem warzyw, ale teraz je uwielbiam."] },
  ],
  zmeczony: [
    { level: I, text: "Jestem zbyt zmęczony, żeby dziś wyjść.", translation: "I'm too tired to go out today.", accept: ["Jestem zbyt zmęczona, żeby dziś wyjść.", "Jestem za zmęczony, żeby dziś wyjść."] },
    { level: A, text: "Jestem zmęczony ciągłym tłumaczeniem się.", translation: "I'm tired of constantly explaining myself.", accept: ["Jestem zmęczona ciągłym tłumaczeniem się.", "Mam dość ciągłego tłumaczenia się."] },
  ],
  czas: [
    { level: I, text: "Ile czasu zajmuje ci dojazd do pracy?", translation: "How long does it take you to get to work?", accept: ["Ile czasu zajmuje dojazd do pracy?"] },
    { level: A, text: "Szkoda czasu na takie kłótnie.", translation: "Arguments like that are a waste of time." },
  ],
  dom: [
    { level: I, text: "Po pracy od razu wracam do domu.", translation: "After work I go straight home.", accept: ["Po pracy wracam od razu do domu."] },
    { level: A, text: "Wszędzie dobrze, ale w domu najlepiej.", translation: "East or west, home is best. (proverb)" },
  ],
};

// ---------------------------------------------------------------- interest topics

const moreTopics: Topic[] = [
  {
    id: "work",
    name: "Work",
    emoji: "💼",
    interests: ["work"],
    items: [
      {
        id: "spotkanie",
        word: { text: "spotkanie", translation: "meeting" },
        sentences: [
          { text: "Mam spotkanie o dziesiątej.", translation: "I have a meeting at ten." },
          { level: I, text: "Czy możemy przełożyć spotkanie na jutro?", translation: "Can we move the meeting to tomorrow?", accept: ["Możemy przełożyć spotkanie na jutro?"] },
          { level: A, text: "Spotkanie się przeciągnęło, więc się spóźnię.", translation: "The meeting ran over, so I'll be late." },
        ],
      },
      {
        id: "szef",
        word: { text: "szef", translation: "boss" },
        sentences: [
          { text: "Mój szef jest bardzo miły.", translation: "My boss is very nice." },
          { level: I, text: "Muszę zapytać szefa o urlop.", translation: "I need to ask my boss about time off." },
          { level: A, text: "Szef dał mi wolną rękę w tym projekcie.", translation: "My boss gave me a free hand on this project." },
        ],
      },
      {
        id: "termin",
        level: I,
        word: { text: "termin", translation: "deadline" },
        sentences: [
          { level: I, text: "Termin mija w piątek.", translation: "The deadline is on Friday.", accept: ["Termin upływa w piątek."] },
          { level: I, text: "Nie zdążę przed terminem.", translation: "I won't make it before the deadline." },
          {
            level: A,
            text: "Gdyby termin był dłuższy, zrobilibyśmy to lepiej.",
            translation: "If the deadline were longer, we'd do it better.",
          },
        ],
      },
      {
        id: "wynagrodzenie",
        level: A,
        word: { text: "wynagrodzenie", translation: "salary" },
        sentences: [
          {
            level: A,
            text: "Chciałbym porozmawiać o podwyżce wynagrodzenia.",
            translation: "I'd like to talk about a pay raise.",
            accept: ["Chciałabym porozmawiać o podwyżce wynagrodzenia.", "Chciałbym porozmawiać o podwyżce."],
          },
          { level: A, text: "Wynagrodzenie zależy od doświadczenia.", translation: "The salary depends on experience." },
        ],
      },
    ],
  },
  {
    id: "social",
    name: "Friends",
    emoji: "🫶",
    interests: ["social"],
    items: [
      {
        id: "znajomy",
        word: { text: "znajomy", translation: "friend / acquaintance", accept: ["znajoma"] },
        sentences: [
          { text: "To jest mój znajomy z pracy.", translation: "This is my friend from work.", accept: ["To mój znajomy z pracy."] },
          { level: I, text: "Wychodzę dziś wieczorem ze znajomymi.", translation: "I'm going out with friends tonight.", accept: ["Dziś wieczorem wychodzę ze znajomymi."] },
          { level: A, text: "Poznałem ją przez wspólnych znajomych.", translation: "I met her through mutual friends.", accept: ["Poznałam ją przez wspólnych znajomych."] },
        ],
      },
      {
        id: "impreza",
        word: { text: "impreza", translation: "party" },
        sentences: [
          { text: "Idziesz na imprezę?", translation: "Are you going to the party?", accept: ["Czy idziesz na imprezę?"] },
          { level: I, text: "Impreza była świetna, szkoda, że cię nie było.", translation: "The party was great, too bad you weren't there." },
          {
            level: A,
            text: "Gdybym wiedział o imprezie, na pewno bym przyszedł.",
            translation: "If I'd known about the party, I'd definitely have come.",
            accept: ["Gdybym wiedziała o imprezie, na pewno bym przyszła."],
          },
        ],
      },
      {
        id: "umowic",
        level: I,
        word: { text: "umówić się", translation: "to arrange to meet" },
        sentences: [
          { level: I, text: "Umówmy się na kawę w przyszłym tygodniu.", translation: "Let's meet up for coffee next week." },
          { level: A, text: "Umówiliśmy się, że nikt się nie spóźni.", translation: "We agreed that nobody would be late." },
        ],
      },
      {
        id: "zgadzac",
        level: I,
        word: { text: "zgadzać się", translation: "to agree" },
        sentences: [
          { level: I, text: "Zgadzam się z tobą.", translation: "I agree with you.", accept: ["Zgadzam się."] },
          { level: A, text: "Nie do końca się z tym zgadzam.", translation: "I don't entirely agree with that.", accept: ["Nie do końca zgadzam się z tym."] },
        ],
      },
    ],
  },
  {
    id: "hobbies",
    name: "Free time",
    emoji: "🎸",
    interests: ["hobbies"],
    items: [
      {
        id: "muzyka",
        word: { text: "muzyka", translation: "music" },
        sentences: [
          { text: "Lubię słuchać muzyki.", translation: "I like listening to music." },
          { level: I, text: "Jakiej muzyki najczęściej słuchasz?", translation: "What music do you listen to most?" },
          {
            level: A,
            text: "Od dziecka gram na gitarze, ale nigdy nie brałem lekcji.",
            translation: "I've played guitar since I was a kid, but I never took lessons.",
            accept: ["Od dziecka gram na gitarze, ale nigdy nie brałam lekcji."],
          },
        ],
      },
      {
        id: "film",
        word: { text: "film", translation: "film / movie" },
        sentences: [
          { text: "Obejrzyjmy dziś film.", translation: "Let's watch a movie tonight.", accept: ["Obejrzyjmy dzisiaj film."] },
          { level: I, text: "Ten film był lepszy niż książka.", translation: "That movie was better than the book." },
          {
            level: A,
            text: "Nie zdradzaj zakończenia, jeszcze nie widziałem tego filmu.",
            translation: "Don't spoil the ending, I haven't seen that movie yet.",
            accept: ["Nie zdradzaj zakończenia, jeszcze nie widziałam tego filmu."],
          },
        ],
      },
      {
        id: "biegac",
        level: I,
        word: { text: "biegać", translation: "to run / go running" },
        sentences: [
          { level: I, text: "Biegam trzy razy w tygodniu.", translation: "I go running three times a week." },
          { level: A, text: "Odkąd zacząłem biegać, lepiej śpię.", translation: "Since I started running, I sleep better.", accept: ["Odkąd zaczęłam biegać, lepiej śpię."] },
        ],
      },
    ],
  },
];

export const polishTopics: Topic[] = withSentences([...baseTopics, ...moreTopics], levelled);
