import type { Phrase, Topic } from "../lib/types";
import { withSentences } from "./util";

// Mandarin (Simplified). Same shape as the Polish content.
const baseTopics: Topic[] = [
  {
    id: "basics",
    name: "Basics",
    emoji: "👋",
    interests: ["social", "travel"],
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
    interests: ["food", "travel"],
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
    interests: ["travel"],
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
    interests: ["daily"],
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

// ---------------------------------------------------------------- levelled sentences
// Intermediate (I) and advanced (A) sentences for the words above.
const I = "intermediate" as const;
const A = "advanced" as const;

const levelled: Record<string, Phrase[]> = {
  nihao: [
    { level: I, text: "你好，请问这里有人吗？", romanization: "nǐ hǎo, qǐngwèn zhèlǐ yǒu rén ma?", translation: "Hi, excuse me, is this seat taken?", accept: ["你好，这里有人吗？"] },
    { level: A, text: "好久不见，你一点儿都没变！", romanization: "hǎojiǔ bú jiàn, nǐ yìdiǎnr dōu méi biàn!", translation: "Long time no see, you haven't changed a bit!", accept: ["好久不见，你一点都没变！"] },
  ],
  xiexie: [
    { level: I, text: "谢谢你请我吃饭。", romanization: "xièxie nǐ qǐng wǒ chīfàn.", translation: "Thanks for treating me to a meal." },
    { level: A, text: "谢谢你这么耐心地等我。", romanization: "xièxie nǐ zhème nàixīn de děng wǒ.", translation: "Thank you for waiting for me so patiently." },
  ],
  duibuqi: [
    { level: I, text: "对不起，我忘了你的名字。", romanization: "duìbuqǐ, wǒ wàng le nǐ de míngzi.", translation: "Sorry, I forgot your name.", accept: ["对不起，我把你的名字忘了。"] },
    { level: A, text: "对不起，是我误会你了。", romanization: "duìbuqǐ, shì wǒ wùhuì nǐ le.", translation: "Sorry, I misunderstood you." },
  ],
  mingzi: [
    { level: I, text: "这个菜的名字很有意思。", romanization: "zhège cài de míngzi hěn yǒu yìsi.", translation: "This dish has an interesting name." },
    {
      level: A,
      text: "我只记得他长什么样，想不起来他的名字了。",
      romanization: "wǒ zhǐ jìde tā zhǎng shénme yàng, xiǎng bu qǐlái tā de míngzi le.",
      translation: "I only remember what he looks like; I can't recall his name.",
    },
  ],
  shi: [
    { level: I, text: "这是我第一次来中国。", romanization: "zhè shì wǒ dì yī cì lái Zhōngguó.", translation: "This is my first time in China." },
    {
      level: A,
      text: "我之所以学中文，是因为对中国文化感兴趣。",
      romanization: "wǒ zhī suǒyǐ xué Zhōngwén, shì yīnwèi duì Zhōngguó wénhuà gǎn xìngqù.",
      translation: "The reason I'm learning Chinese is that I'm interested in Chinese culture.",
      accept: ["我之所以学中文，是因为我对中国文化感兴趣。"],
    },
  ],
  zaijian: [
    { level: I, text: "我得走了，再见！", romanization: "wǒ děi zǒu le, zàijiàn!", translation: "I have to go, bye!", accept: ["我要走了，再见！"] },
    { level: A, text: "希望下次还有机会见面。", romanization: "xīwàng xià cì hái yǒu jīhuì jiànmiàn.", translation: "I hope we get the chance to meet again.", accept: ["希望下次有机会再见面。"] },
  ],
  kafei: [
    { level: I, text: "我喝咖啡不加糖。", romanization: "wǒ hē kāfēi bù jiā táng.", translation: "I take my coffee without sugar." },
    {
      level: A,
      text: "要是早上不喝咖啡，我一整天都没精神。",
      romanization: "yàoshi zǎoshang bù hē kāfēi, wǒ yì zhěng tiān dōu méi jīngshen.",
      translation: "If I don't have coffee in the morning, I have no energy all day.",
      accept: ["如果早上不喝咖啡，我一整天都没精神。"],
    },
  ],
  shui: [
    { level: I, text: "能给我一杯冰水吗？", romanization: "néng gěi wǒ yì bēi bīng shuǐ ma?", translation: "Could I have a glass of ice water?", accept: ["可以给我一杯冰水吗？"] },
    { level: A, text: "天气这么热，一定要多喝水。", romanization: "tiānqì zhème rè, yídìng yào duō hē shuǐ.", translation: "In heat like this, you must drink plenty of water." },
  ],
  maidan: [
    { level: I, text: "我们各付各的吧。", romanization: "wǒmen gè fù gè de ba.", translation: "Let's each pay for our own." },
    { level: A, text: "这顿我请，下次你再请我。", romanization: "zhè dùn wǒ qǐng, xià cì nǐ zài qǐng wǒ.", translation: "This meal's on me; next time you can treat me." },
  ],
  haochi: [
    { level: I, text: "这家饭馆的菜又便宜又好吃。", romanization: "zhè jiā fànguǎn de cài yòu piányi yòu hǎochī.", translation: "This restaurant's food is cheap and tasty." },
    {
      level: A,
      text: "这道菜看起来很普通，没想到这么好吃。",
      romanization: "zhè dào cài kàn qǐlái hěn pǔtōng, méi xiǎngdào zhème hǎochī.",
      translation: "This dish looks ordinary; I didn't expect it to be so tasty.",
    },
  ],
  e: [
    { level: I, text: "我没吃早饭，现在饿死了。", romanization: "wǒ méi chī zǎofàn, xiànzài è sǐ le.", translation: "I skipped breakfast and now I'm starving.", accept: ["我早饭没吃，现在饿死了。"] },
    {
      level: A,
      text: "你要是饿了，冰箱里有剩菜。",
      romanization: "nǐ yàoshi è le, bīngxiāng lǐ yǒu shèng cài.",
      translation: "If you get hungry, there are leftovers in the fridge.",
      accept: ["如果你饿了，冰箱里有剩菜。"],
    },
  ],
  mifan: [
    { level: I, text: "米饭不够了，再来一碗。", romanization: "mǐfàn bú gòu le, zài lái yì wǎn.", translation: "There's not enough rice — one more bowl, please." },
    {
      level: A,
      text: "南方人一般吃米饭，北方人更爱吃面食。",
      romanization: "nánfāng rén yìbān chī mǐfàn, běifāng rén gèng ài chī miànshí.",
      translation: "Southerners usually eat rice; northerners prefer noodles and buns.",
    },
  ],
  huochezhan: [
    { level: I, text: "从这儿到火车站要多长时间？", romanization: "cóng zhèr dào huǒchēzhàn yào duō cháng shíjiān?", translation: "How long does it take from here to the train station?" },
    {
      level: A,
      text: "我们赶到火车站的时候，火车已经开走了。",
      romanization: "wǒmen gǎndào huǒchēzhàn de shíhou, huǒchē yǐjīng kāizǒu le.",
      translation: "By the time we got to the station, the train had already left.",
    },
  ],
  piao: [
    { level: I, text: "我想买两张往返票。", romanization: "wǒ xiǎng mǎi liǎng zhāng wǎngfǎn piào.", translation: "I'd like to buy two return tickets." },
    { level: A, text: "票已经卖完了，我们只能改天再去。", romanization: "piào yǐjīng màiwán le, wǒmen zhǐ néng gǎitiān zài qù.", translation: "The tickets are sold out, so we'll have to go another day." },
  ],
  yizhizou: [
    { level: I, text: "过了红绿灯一直走，银行在右边。", romanization: "guò le hónglǜdēng yìzhí zǒu, yínháng zài yòubian.", translation: "Go straight past the traffic lights; the bank is on the right." },
    {
      level: A,
      text: "沿着这条路一直走，大概十分钟就能看到。",
      romanization: "yánzhe zhè tiáo lù yìzhí zǒu, dàgài shí fēnzhōng jiù néng kàndào.",
      translation: "Follow this road straight on and you'll see it in about ten minutes.",
    },
  ],
  yuan: [
    { level: I, text: "我家离公司不太远。", romanization: "wǒ jiā lí gōngsī bú tài yuǎn.", translation: "My home isn't too far from the office." },
    {
      level: A,
      text: "虽然路有点儿远，但是风景特别美。",
      romanization: "suīrán lù yǒudiǎnr yuǎn, dànshì fēngjǐng tèbié měi.",
      translation: "Although it's a bit far, the scenery is especially beautiful.",
      accept: ["虽然路有点远，但是风景特别美。"],
    },
  ],
  jichang: [
    { level: I, text: "我们得提前两个小时到机场。", romanization: "wǒmen děi tíqián liǎng ge xiǎoshí dào jīchǎng.", translation: "We need to get to the airport two hours early." },
    {
      level: A,
      text: "要不是堵车，我们早就到机场了。",
      romanization: "yàobúshì dǔchē, wǒmen zǎo jiù dào jīchǎng le.",
      translation: "If it weren't for the traffic, we'd have been at the airport long ago.",
    },
  ],
  ditie: [
    { level: I, text: "坐地铁要换两次车。", romanization: "zuò dìtiě yào huàn liǎng cì chē.", translation: "By subway you have to change twice." },
    { level: A, text: "上下班高峰期地铁挤得要命。", romanization: "shàngxiàbān gāofēngqī dìtiě jǐ de yàomìng.", translation: "At rush hour the subway is insanely crowded." },
  ],
  jintian: [
    { level: I, text: "今天我得早点儿下班。", romanization: "jīntiān wǒ děi zǎo diǎnr xiàbān.", translation: "Today I have to leave work a bit early.", accept: ["今天我得早点下班。", "我今天得早点下班。"] },
    { level: A, text: "今天是我这辈子最开心的一天。", romanization: "jīntiān shì wǒ zhè bèizi zuì kāixīn de yì tiān.", translation: "Today is the happiest day of my life." },
  ],
  gongzuo: [
    { level: I, text: "我每个星期在家工作两天。", romanization: "wǒ měi ge xīngqī zài jiā gōngzuò liǎng tiān.", translation: "I work from home two days a week.", accept: ["我每周在家工作两天。"] },
    {
      level: A,
      text: "我在这儿工作三年了，还在不断学习。",
      romanization: "wǒ zài zhèr gōngzuò sān nián le, hái zài búduàn xuéxí.",
      translation: "I've been working here for three years and I'm still learning.",
    },
  ],
  xihuan: [
    { level: I, text: "我不喜欢早起。", romanization: "wǒ bù xǐhuan zǎo qǐ.", translation: "I don't like getting up early." },
    {
      level: A,
      text: "我以前不喜欢吃蔬菜，现在反而很爱吃。",
      romanization: "wǒ yǐqián bù xǐhuan chī shūcài, xiànzài fǎn'ér hěn ài chī.",
      translation: "I used to dislike vegetables, but now I actually love them.",
    },
  ],
  lei: [
    { level: I, text: "我太累了，今天不想出去。", romanization: "wǒ tài lèi le, jīntiān bù xiǎng chūqu.", translation: "I'm too tired, I don't want to go out today." },
    { level: A, text: "工作再累，也要照顾好自己的身体。", romanization: "gōngzuò zài lèi, yě yào zhàogù hǎo zìjǐ de shēntǐ.", translation: "However tiring work gets, you have to look after your health." },
  ],
  shijian: [
    { level: I, text: "我们约个时间见面吧。", romanization: "wǒmen yuē ge shíjiān jiànmiàn ba.", translation: "Let's set a time to meet." },
    { level: A, text: "跟他吵架纯粹是浪费时间。", romanization: "gēn tā chǎojià chúncuì shì làngfèi shíjiān.", translation: "Arguing with him is a total waste of time." },
  ],
  jia: [
    { level: I, text: "下班以后我直接回家。", romanization: "xiàbān yǐhòu wǒ zhíjiē huí jiā.", translation: "After work I go straight home.", accept: ["下班后我直接回家。"] },
    { level: A, text: "金窝银窝，不如自己的狗窝。", romanization: "jīn wō yín wō, bùrú zìjǐ de gǒu wō.", translation: "There's no place like home. (saying)" },
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
        id: "kaihui",
        word: { text: "开会", romanization: "kāihuì", translation: "to have a meeting" },
        sentences: [
          { text: "我十点要开会。", romanization: "wǒ shí diǎn yào kāihuì.", translation: "I have a meeting at ten.", accept: ["我十点开会。"] },
          { level: I, text: "我们能不能明天再开会？", romanization: "wǒmen néng bu néng míngtiān zài kāihuì?", translation: "Could we have the meeting tomorrow instead?" },
          { level: A, text: "会开得太久了，我可能要迟到。", romanization: "huì kāi de tài jiǔ le, wǒ kěnéng yào chídào.", translation: "The meeting ran long, so I might be late." },
        ],
      },
      {
        id: "laoban",
        word: { text: "老板", romanization: "lǎobǎn", translation: "boss" },
        sentences: [
          { text: "我的老板人很好。", romanization: "wǒ de lǎobǎn rén hěn hǎo.", translation: "My boss is really nice.", accept: ["我老板人很好。"] },
          { level: I, text: "我得问老板能不能请假。", romanization: "wǒ děi wèn lǎobǎn néng bu néng qǐngjià.", translation: "I need to ask my boss if I can take time off." },
          { level: A, text: "老板让我全权负责这个项目。", romanization: "lǎobǎn ràng wǒ quánquán fùzé zhège xiàngmù.", translation: "My boss put me fully in charge of this project." },
        ],
      },
      {
        id: "jiezhi",
        level: I,
        word: { text: "截止日期", romanization: "jiézhǐ rìqī", translation: "deadline" },
        sentences: [
          { level: I, text: "截止日期是星期五。", romanization: "jiézhǐ rìqī shì xīngqīwǔ.", translation: "The deadline is Friday.", accept: ["截止日期是周五。"] },
          { level: I, text: "截止日期之前我做不完。", romanization: "jiézhǐ rìqī zhīqián wǒ zuò bu wán.", translation: "I can't finish before the deadline." },
          {
            level: A,
            text: "要是截止日期能推迟一周，我们会做得更好。",
            romanization: "yàoshi jiézhǐ rìqī néng tuīchí yì zhōu, wǒmen huì zuò de gèng hǎo.",
            translation: "If the deadline could be pushed back a week, we'd do a better job.",
          },
        ],
      },
      {
        id: "gongzi",
        level: A,
        word: { text: "工资", romanization: "gōngzī", translation: "salary / wages" },
        sentences: [
          { level: A, text: "我想跟您谈谈涨工资的事。", romanization: "wǒ xiǎng gēn nín tántan zhǎng gōngzī de shì.", translation: "I'd like to talk to you about a raise." },
          { level: A, text: "工资多少取决于经验。", romanization: "gōngzī duōshao qǔjué yú jīngyàn.", translation: "The salary depends on experience." },
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
        id: "pengyou",
        word: { text: "朋友", romanization: "péngyou", translation: "friend" },
        sentences: [
          { text: "这是我的朋友。", romanization: "zhè shì wǒ de péngyou.", translation: "This is my friend.", accept: ["这是我朋友。"] },
          { level: I, text: "今天晚上我跟朋友出去玩。", romanization: "jīntiān wǎnshang wǒ gēn péngyou chūqu wánr.", translation: "I'm going out with friends tonight.", accept: ["今晚我跟朋友出去玩。"] },
          { level: A, text: "我是通过共同的朋友认识她的。", romanization: "wǒ shì tōngguò gòngtóng de péngyou rènshi tā de.", translation: "I met her through mutual friends." },
        ],
      },
      {
        id: "juhui",
        word: { text: "聚会", romanization: "jùhuì", translation: "party / get-together" },
        sentences: [
          { text: "你去聚会吗？", romanization: "nǐ qù jùhuì ma?", translation: "Are you going to the party?", accept: ["你去不去聚会？"] },
          { level: I, text: "聚会特别好玩，可惜你没来。", romanization: "jùhuì tèbié hǎowánr, kěxī nǐ méi lái.", translation: "The party was really fun — too bad you didn't come." },
          { level: A, text: "早知道有聚会，我肯定会来。", romanization: "zǎo zhīdào yǒu jùhuì, wǒ kěndìng huì lái.", translation: "Had I known there was a party, I'd definitely have come." },
        ],
      },
      {
        id: "yue",
        level: I,
        word: { text: "约", romanization: "yuē", translation: "to arrange to meet" },
        sentences: [
          { level: I, text: "我们下周约着喝咖啡吧。", romanization: "wǒmen xià zhōu yuē zhe hē kāfēi ba.", translation: "Let's meet up for coffee next week.", accept: ["我们下个星期约着喝咖啡吧。"] },
          { level: A, text: "我们约好了谁都不许迟到。", romanization: "wǒmen yuē hǎo le shéi dōu bù xǔ chídào.", translation: "We agreed that nobody's allowed to be late." },
        ],
      },
      {
        id: "tongyi",
        level: I,
        word: { text: "同意", romanization: "tóngyì", translation: "to agree" },
        sentences: [
          { level: I, text: "我同意你的看法。", romanization: "wǒ tóngyì nǐ de kànfǎ.", translation: "I agree with you.", accept: ["我同意你的意见。", "我同意你。"] },
          { level: A, text: "这一点我不完全同意。", romanization: "zhè yì diǎn wǒ bù wánquán tóngyì.", translation: "I don't fully agree on this point." },
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
        id: "yinyue",
        word: { text: "音乐", romanization: "yīnyuè", translation: "music" },
        sentences: [
          { text: "我喜欢听音乐。", romanization: "wǒ xǐhuan tīng yīnyuè.", translation: "I like listening to music." },
          { level: I, text: "你平时喜欢听什么音乐？", romanization: "nǐ píngshí xǐhuan tīng shénme yīnyuè?", translation: "What music do you usually listen to?" },
          {
            level: A,
            text: "我从小就弹吉他，但从来没上过课。",
            romanization: "wǒ cóngxiǎo jiù tán jítā, dàn cónglái méi shàng guo kè.",
            translation: "I've played guitar since I was little, but I've never taken lessons.",
          },
        ],
      },
      {
        id: "dianying",
        word: { text: "电影", romanization: "diànyǐng", translation: "movie" },
        sentences: [
          { text: "今天晚上我们看电影吧。", romanization: "jīntiān wǎnshang wǒmen kàn diànyǐng ba.", translation: "Let's watch a movie tonight.", accept: ["今晚我们看电影吧。", "我们今天晚上看电影吧。"] },
          { level: I, text: "这部电影比小说好看。", romanization: "zhè bù diànyǐng bǐ xiǎoshuō hǎokàn.", translation: "This movie is better than the novel." },
          { level: A, text: "别剧透，这部电影我还没看过呢。", romanization: "bié jùtòu, zhè bù diànyǐng wǒ hái méi kàn guo ne.", translation: "No spoilers — I haven't seen this movie yet." },
        ],
      },
      {
        id: "paobu",
        level: I,
        word: { text: "跑步", romanization: "pǎobù", translation: "to go running" },
        sentences: [
          { level: I, text: "我一个星期跑三次步。", romanization: "wǒ yí ge xīngqī pǎo sān cì bù.", translation: "I go running three times a week.", accept: ["我每周跑三次步。", "我一周跑三次步。"] },
          { level: A, text: "自从开始跑步，我睡得好多了。", romanization: "zìcóng kāishǐ pǎobù, wǒ shuì de hǎo duō le.", translation: "Since I started running, I've been sleeping much better." },
        ],
      },
    ],
  },
];

export const mandarinTopics: Topic[] = withSentences([...baseTopics, ...moreTopics], levelled);
