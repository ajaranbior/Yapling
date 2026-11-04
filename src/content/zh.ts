import type { Topic } from "../lib/types";

// Mandarin (Simplified). Same shape as the Polish content.
export const mandarinTopics: Topic[] = [
  {
    id: "basics",
    name: "Basics",
    emoji: "👋",
    items: [
      {
        id: "nihao",
        word: { text: "你好", romanization: "nǐ hǎo", translation: "hello" },
        sentences: [
          {
            text: "你好，很高兴认识你。",
            romanization: "nǐ hǎo, hěn gāoxìng rènshi nǐ.",
            translation: "Hello, nice to meet you.",
            accept: ["你好，认识你很高兴。", "你好，我很高兴认识你。"],
          },
          { text: "你好吗？", romanization: "nǐ hǎo ma?", translation: "How are you?", accept: ["你最近好吗？"] },
        ],
      },
      {
        id: "xiexie",
        word: { text: "谢谢", romanization: "xièxie", translation: "thank you" },
        sentences: [
          {
            text: "谢谢你的帮助。",
            romanization: "xièxie nǐ de bāngzhù.",
            translation: "Thanks for your help.",
            accept: ["谢谢你帮我。", "谢谢您的帮助。"],
            unnatural: [{ text: "谢谢为你的帮助。", note: "Don't translate 'for' — just put what you're thankful for after 谢谢." }],
          },
          { text: "不用谢。", romanization: "bú yòng xiè.", translation: "You're welcome.", accept: ["不客气。", "不谢。"] },
        ],
      },
      {
        id: "duibuqi",
        word: { text: "对不起", romanization: "duìbuqǐ", translation: "sorry" },
        sentences: [
          {
            text: "对不起，我来晚了。",
            romanization: "duìbuqǐ, wǒ lái wǎn le.",
            translation: "Sorry, I'm late.",
            accept: ["不好意思，我来晚了。", "对不起，我迟到了。", "不好意思，我迟到了。"],
            unnatural: [{ text: "对不起，我是晚的。", note: "Word-for-word 'I am late'. Say 我来晚了 or 我迟到了." }],
          },
          {
            text: "对不起，我听不懂。",
            romanization: "duìbuqǐ, wǒ tīng bu dǒng.",
            translation: "Sorry, I don't understand (what I hear).",
            accept: ["不好意思，我听不懂。"],
          },
        ],
      },
      {
        id: "mingzi",
        word: { text: "名字", romanization: "míngzi", translation: "name" },
        sentences: [
          {
            text: "你叫什么名字？",
            romanization: "nǐ jiào shénme míngzi?",
            translation: "What's your name?",
            accept: ["您叫什么名字？"],
            unnatural: [{ text: "你的名字是什么？", note: "Understandable, but people ask 你叫什么名字？" }],
          },
          {
            text: "我叫安娜。",
            romanization: "wǒ jiào Ānnà.",
            translation: "My name is Anna.",
            accept: ["我的名字叫安娜。"],
            unnatural: [{ text: "我的名字是安娜。", note: "Correct but stiff — natives just say 我叫…" }],
          },
        ],
      },
      {
        id: "shi",
        word: { text: "是", romanization: "shì", translation: "to be (A is B)" },
        sentences: [
          {
            text: "我是学生。",
            romanization: "wǒ shì xuésheng.",
            translation: "I'm a student.",
            unnatural: [{ text: "我是一个学生。", note: "Fine, but 一个 is usually dropped here." }],
          },
          { text: "你是哪国人？", romanization: "nǐ shì nǎ guó rén?", translation: "Which country are you from?", accept: ["你是哪里人？"] },
        ],
      },
      {
        id: "zaijian",
        word: { text: "再见", romanization: "zàijiàn", translation: "goodbye" },
        sentences: [
          { text: "明天见！", romanization: "míngtiān jiàn!", translation: "See you tomorrow!", accept: ["明天再见！"] },
          { text: "再见，路上小心。", romanization: "zàijiàn, lùshang xiǎoxīn.", translation: "Bye, take care on the way." },
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
        id: "kafei",
        word: { text: "咖啡", romanization: "kāfēi", translation: "coffee" },
        sentences: [
          {
            text: "我要一杯咖啡。",
            romanization: "wǒ yào yì bēi kāfēi.",
            translation: "I'd like a cup of coffee.",
            accept: ["请给我一杯咖啡。", "我想要一杯咖啡。", "来一杯咖啡。"],
            unnatural: [{ text: "我要一个咖啡。", note: "You'll hear it, but 杯 is the proper measure word for drinks." }],
          },
          { text: "这杯咖啡太烫了。", romanization: "zhè bēi kāfēi tài tàng le.", translation: "This coffee is too hot." },
        ],
      },
      {
        id: "shui",
        word: { text: "水", romanization: "shuǐ", translation: "water" },
        sentences: [
          {
            text: "请给我一杯水。",
            romanization: "qǐng gěi wǒ yì bēi shuǐ.",
            translation: "Please give me a glass of water.",
            accept: ["我要一杯水。", "给我一杯水。"],
          },
          { text: "我想喝水。", romanization: "wǒ xiǎng hē shuǐ.", translation: "I want to drink some water.", accept: ["我要喝水。"] },
        ],
      },
      {
        id: "maidan",
        word: { text: "买单", romanization: "mǎidān", translation: "the bill / to pay the bill" },
        sentences: [
          { text: "服务员，买单！", romanization: "fúwùyuán, mǎidān!", translation: "Waiter, the bill please!", accept: ["服务员，结账！"] },
          { text: "可以刷卡吗？", romanization: "kěyǐ shuā kǎ ma?", translation: "Can I pay by card?", accept: ["能刷卡吗？", "我可以刷卡吗？"] },
        ],
      },
      {
        id: "haochi",
        word: { text: "好吃", romanization: "hǎochī", translation: "tasty" },
        sentences: [
          {
            text: "这个菜很好吃。",
            romanization: "zhège cài hěn hǎochī.",
            translation: "This dish is delicious.",
            accept: ["这个菜真好吃。", "这道菜很好吃。"],
            unnatural: [{ text: "这个菜是好吃。", note: "Adjectives don't take 是 — use 很 (or 真)." }],
          },
          { text: "你做的饭太好吃了！", romanization: "nǐ zuò de fàn tài hǎochī le!", translation: "The food you made is so tasty!" },
        ],
      },
      {
        id: "e",
        word: { text: "饿", romanization: "è", translation: "hungry" },
        sentences: [
          {
            text: "我饿了。",
            romanization: "wǒ è le.",
            translation: "I'm hungry.",
            accept: ["我好饿。", "我很饿。"],
            unnatural: [{ text: "我是饿。", note: "Adjectives don't take 是 — say 我饿了." }],
          },
          { text: "你饿不饿？", romanization: "nǐ è bu è?", translation: "Are you hungry?", accept: ["你饿吗？", "你饿了吗？"] },
        ],
      },
      {
        id: "mifan",
        word: { text: "米饭", romanization: "mǐfàn", translation: "(cooked) rice" },
        sentences: [
          {
            text: "我要一碗米饭。",
            romanization: "wǒ yào yì wǎn mǐfàn.",
            translation: "I'd like a bowl of rice.",
            accept: ["来一碗米饭。", "请给我一碗米饭。"],
          },
          { text: "我每天都吃米饭。", romanization: "wǒ měitiān dōu chī mǐfàn.", translation: "I eat rice every day." },
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
        id: "huochezhan",
        word: { text: "火车站", romanization: "huǒchēzhàn", translation: "train station" },
        sentences: [
          {
            text: "火车站在哪儿？",
            romanization: "huǒchēzhàn zài nǎr?",
            translation: "Where's the train station?",
            accept: ["请问火车站在哪儿？"],
            unnatural: [{ text: "哪儿是火车站？", note: "Chinese puts the place first: 火车站在哪儿？" }],
          },
          { text: "我们去火车站吧。", romanization: "wǒmen qù huǒchēzhàn ba.", translation: "Let's go to the train station." },
        ],
      },
      {
        id: "piao",
        word: { text: "票", romanization: "piào", translation: "ticket" },
        sentences: [
          {
            text: "我要买一张去北京的票。",
            romanization: "wǒ yào mǎi yì zhāng qù Běijīng de piào.",
            translation: "I want to buy a ticket to Beijing.",
            accept: ["我想买一张去北京的票。"],
          },
          { text: "票多少钱？", romanization: "piào duōshao qián?", translation: "How much is the ticket?", accept: ["一张票多少钱？"] },
        ],
      },
      {
        id: "yizhizou",
        word: { text: "一直走", romanization: "yìzhí zǒu", translation: "go straight" },
        sentences: [
          {
            text: "一直走，然后左转。",
            romanization: "yìzhí zǒu, ránhòu zuǒ zhuǎn.",
            translation: "Go straight, then turn left.",
            accept: ["一直往前走，然后左转。", "一直走，然后往左拐。"],
          },
          { text: "一直走就到了。", romanization: "yìzhí zǒu jiù dào le.", translation: "Go straight and you're there." },
        ],
      },
      {
        id: "yuan",
        word: { text: "远", romanization: "yuǎn", translation: "far" },
        sentences: [
          { text: "离这儿远吗？", romanization: "lí zhèr yuǎn ma?", translation: "Is it far from here?", accept: ["远不远？", "离这儿远不远？"] },
          { text: "酒店不远。", romanization: "jiǔdiàn bù yuǎn.", translation: "The hotel isn't far.", accept: ["酒店不太远。", "酒店离这儿不远。"] },
        ],
      },
      {
        id: "jichang",
        word: { text: "机场", romanization: "jīchǎng", translation: "airport" },
        sentences: [
          {
            text: "怎么去机场？",
            romanization: "zěnme qù jīchǎng?",
            translation: "How do I get to the airport?",
            accept: ["去机场怎么走？", "请问怎么去机场？"],
          },
          { text: "我们已经到机场了。", romanization: "wǒmen yǐjīng dào jīchǎng le.", translation: "We've already arrived at the airport." },
        ],
      },
      {
        id: "ditie",
        word: { text: "地铁", romanization: "dìtiě", translation: "subway / metro" },
        sentences: [
          { text: "坐地铁比较快。", romanization: "zuò dìtiě bǐjiào kuài.", translation: "Taking the subway is faster.", accept: ["坐地铁更快。"] },
          {
            text: "地铁站在附近吗？",
            romanization: "dìtiězhàn zài fùjìn ma?",
            translation: "Is the subway station nearby?",
            accept: ["附近有地铁站吗？"],
          },
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
        id: "jintian",
        word: { text: "今天", romanization: "jīntiān", translation: "today" },
        sentences: [
          {
            text: "今天天气很好。",
            romanization: "jīntiān tiānqì hěn hǎo.",
            translation: "The weather is nice today.",
            accept: ["今天天气不错。", "今天的天气很好。"],
          },
          {
            text: "你今天晚上做什么？",
            romanization: "nǐ jīntiān wǎnshang zuò shénme?",
            translation: "What are you doing tonight?",
            accept: ["今天晚上你做什么？", "你今天晚上干什么？"],
          },
        ],
      },
      {
        id: "gongzuo",
        word: { text: "工作", romanization: "gōngzuò", translation: "work / to work" },
        sentences: [
          {
            text: "我在办公室工作。",
            romanization: "wǒ zài bàngōngshì gōngzuò.",
            translation: "I work in an office.",
            unnatural: [{ text: "我工作在办公室。", note: "The place goes before the verb: 我在办公室工作。" }],
          },
          { text: "明天我不工作。", romanization: "míngtiān wǒ bù gōngzuò.", translation: "I'm not working tomorrow.", accept: ["我明天不工作。"] },
        ],
      },
      {
        id: "xihuan",
        word: { text: "喜欢", romanization: "xǐhuan", translation: "to like" },
        sentences: [
          { text: "我喜欢看书。", romanization: "wǒ xǐhuan kàn shū.", translation: "I like reading.", accept: ["我很喜欢看书。", "我喜欢读书。"] },
          {
            text: "你喜欢中国菜吗？",
            romanization: "nǐ xǐhuan Zhōngguó cài ma?",
            translation: "Do you like Chinese food?",
            accept: ["你喜不喜欢中国菜？", "你喜欢吃中国菜吗？"],
          },
        ],
      },
      {
        id: "lei",
        word: { text: "累", romanization: "lèi", translation: "tired" },
        sentences: [
          {
            text: "我今天很累。",
            romanization: "wǒ jīntiān hěn lèi.",
            translation: "I'm very tired today.",
            accept: ["今天我很累。", "我今天好累。"],
            unnatural: [{ text: "我今天是累。", note: "Adjectives don't take 是 — use 很." }],
          },
          { text: "你看起来很累。", romanization: "nǐ kàn qǐlái hěn lèi.", translation: "You look tired.", accept: ["你好像很累。"] },
        ],
      },
      {
        id: "shijian",
        word: { text: "时间", romanization: "shíjiān", translation: "time" },
        sentences: [
          {
            text: "我现在没有时间。",
            romanization: "wǒ xiànzài méiyǒu shíjiān.",
            translation: "I don't have time now.",
            accept: ["现在我没有时间。"],
            unnatural: [{ text: "我现在不有时间。", note: "有 is always negated with 没, never 不." }],
          },
          {
            text: "你星期六有时间吗？",
            romanization: "nǐ xīngqīliù yǒu shíjiān ma?",
            translation: "Do you have time on Saturday?",
            accept: ["星期六你有时间吗？", "你星期六有空吗？"],
          },
        ],
      },
      {
        id: "jia",
        word: { text: "家", romanization: "jiā", translation: "home" },
        sentences: [
          { text: "我要回家了。", romanization: "wǒ yào huí jiā le.", translation: "I'm going home now.", accept: ["我得回家了。"] },
          { text: "我在家。", romanization: "wǒ zài jiā.", translation: "I'm at home.", accept: ["我在家里。"] },
        ],
      },
    ],
  },
];
