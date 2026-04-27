// Pri 4–6 English + Chinese seed content, MOE-aligned. Hand-curated.
// Output: data/questions/age-12/{english,chinese}/tier-{1..4}.json
//
// English Pri 4–6 (MOE):
//   - vocabulary expansion, word forms, prefixes/suffixes
//   - tense agreement, complex sentence structure
//   - idioms, comprehension synonyms/antonyms
// Chinese Pri 4–6 (MOE):
//   - 500+ characters cumulative
//   - paragraph-level passages, idioms (成语), measure words

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENG = join(__dirname, "..", "data", "questions", "age-12", "english");
const ZH = join(__dirname, "..", "data", "questions", "age-12", "chinese");
mkdirSync(ENG, { recursive: true });
mkdirSync(ZH, { recursive: true });

function shuffle(a) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}
function mc(id, tier, skill, prompt, answer, distractors) {
  const choices = shuffle([answer, ...distractors]).slice(0, 4);
  if (!choices.includes(answer)) choices[0] = answer;
  return { id, tier, skill, format: "multiple_choice", prompt, answer, choices: shuffle(choices) };
}
function pad(id, tier, skill, prompt, answer) {
  return { id, tier, skill, format: "text_pad", prompt, answer };
}

// =================================================================
// ENGLISH
// =================================================================

// Pri 4 — Tier 1 basics: tense, plurals, simple comprehension
const enT1 = [
  mc("p4-en-t1-1", 1, "tense_present", "She ___ to school every day.", "walks", ["walk", "walking", "walked"]),
  mc("p4-en-t1-2", 1, "tense_present", "They ___ playing in the park.", "are", ["is", "am", "be"]),
  mc("p4-en-t1-3", 1, "tense_past", "Yesterday I ___ a book.", "read", ["reads", "reading", "reader"]),
  mc("p4-en-t1-4", 1, "tense_past", "He ___ his friend last week.", "met", ["meet", "meets", "meeting"]),
  mc("p4-en-t1-5", 1, "plural", "One mouse, two ___.", "mice", ["mouses", "mices", "mouse"]),
  mc("p4-en-t1-6", 1, "plural", "One leaf, two ___.", "leaves", ["leafs", "leafes", "leaf"]),
  mc("p4-en-t1-7", 1, "plural", "One child, two ___.", "children", ["childs", "childes", "childrens"]),
  mc("p4-en-t1-8", 1, "plural", "One foot, two ___.", "feet", ["foots", "feets", "feets"]),
  mc("p4-en-t1-9", 1, "synonym", "Synonym of HAPPY?", "joyful", ["sad", "tired", "angry"]),
  mc("p4-en-t1-10", 1, "synonym", "Synonym of BIG?", "large", ["small", "tiny", "low"]),
  mc("p4-en-t1-11", 1, "antonym", "Antonym of TALL?", "short", ["high", "wide", "long"]),
  mc("p4-en-t1-12", 1, "antonym", "Antonym of FAST?", "slow", ["quick", "rapid", "swift"]),
  mc("p4-en-t1-13", 1, "preposition", "The cat is ___ the table.", "on", ["in", "at", "of"]),
  mc("p4-en-t1-14", 1, "preposition", "I will see you ___ Monday.", "on", ["in", "at", "by"]),
  mc("p4-en-t1-15", 1, "article", "I bought ___ apple.", "an", ["a", "the", "of"]),
];

// Pri 4 — Tier 2: sentence completion, basic conjunctions
const enT2 = [
  mc("p4-en-t2-1", 2, "conjunction", "I was tired, ___ I went to bed.", "so", ["but", "or", "if"]),
  mc("p4-en-t2-2", 2, "conjunction", "She is small ___ very strong.", "but", ["so", "or", "if"]),
  mc("p4-en-t2-3", 2, "conjunction", "Bring an umbrella ___ it might rain.", "because", ["but", "so", "or"]),
  mc("p4-en-t2-4", 2, "compound", "What is the past tense of 'go'?", "went", ["goed", "gone", "going"]),
  mc("p4-en-t2-5", 2, "compound", "What is the past tense of 'sing'?", "sang", ["singed", "sung", "singing"]),
  mc("p4-en-t2-6", 2, "compound", "What is the past tense of 'buy'?", "bought", ["buyed", "bought", "buying"]),
  mc("p4-en-t2-7", 2, "compound", "What is the past tense of 'know'?", "knew", ["knowed", "known", "knowing"]),
  mc("p4-en-t2-8", 2, "comparison", "Faster than 'fast' is ___.", "faster", ["fastest", "more fast", "fasting"]),
  mc("p4-en-t2-9", 2, "comparison", "The ___ runner won.", "fastest", ["faster", "more fast", "more faster"]),
  mc("p4-en-t2-10", 2, "comparison", "She is ___ than her sister.", "taller", ["tallest", "more tall", "more taller"]),
  mc("p4-en-t2-11", 2, "vocab", "What does 'enormous' mean?", "very big", ["very small", "very fast", "very loud"]),
  mc("p4-en-t2-12", 2, "vocab", "What does 'whisper' mean?", "speak softly", ["speak loudly", "shout", "sing"]),
  mc("p4-en-t2-13", 2, "vocab", "What does 'ancient' mean?", "very old", ["very new", "very big", "very small"]),
  mc("p4-en-t2-14", 2, "homophone", "Which one means a body part? hear / here", "hear", ["here", "neither", "both"]),
  mc("p4-en-t2-15", 2, "homophone", "Which one means belonging to them? their / there", "their", ["there", "neither", "both"]),
];

// Pri 5 — Tier 3: spelling 6-7 letters, idioms, harder grammar
const enT3 = [
  pad("p5-en-t3-1", 3, "spell_clue", "An animal that lives in water and swims (5 letters)", "WHALE"),
  pad("p5-en-t3-2", 3, "spell_clue", "Something you read with chapters (8 letters)", "TEXTBOOK"),
  pad("p5-en-t3-3", 3, "spell_clue", "Frozen water that falls from the sky (4 letters)", "SNOW"),
  pad("p5-en-t3-4", 3, "spell_clue", "A vehicle that flies (8 letters)", "AIRPLANE"),
  pad("p5-en-t3-5", 3, "spell_clue", "Where you study at school (9 letters)", "CLASSROOM"),
  pad("p5-en-t3-6", 3, "spell_missing", "TR_ANGLE", "TRIANGLE"),
  pad("p5-en-t3-7", 3, "spell_missing", "G_RDEN", "GARDEN"),
  pad("p5-en-t3-8", 3, "spell_missing", "ENV_RONMENT", "ENVIRONMENT"),
  pad("p5-en-t3-9", 3, "spell_missing", "SC_ENCE", "SCIENCE"),
  pad("p5-en-t3-10", 3, "spell_missing", "MED_CINE", "MEDICINE"),
  mc("p5-en-t3-11", 3, "idiom", "What does 'a piece of cake' mean?", "very easy", ["very hard", "delicious", "small"]),
  mc("p5-en-t3-12", 3, "idiom", "What does 'break a leg' mean?", "good luck", ["be careful", "run fast", "be hurt"]),
  mc("p5-en-t3-13", 3, "idiom", "What does 'under the weather' mean?", "feeling sick", ["feeling happy", "feeling cold", "feeling tired"]),
  mc("p5-en-t3-14", 3, "passive", "Active: She wrote the book. Passive: The book ___ by her.", "was written", ["wrote", "is wrote", "written"]),
  mc("p5-en-t3-15", 3, "passive", "Active: They built the house. Passive: The house ___ by them.", "was built", ["builds", "built", "is built"]),
];

// Pri 6 — Tier 4: harder spelling, conditionals, formal grammar
const enT4 = [
  pad("p6-en-t4-1", 4, "spell_clue", "A long-distance race (8 letters)", "MARATHON"),
  pad("p6-en-t4-2", 4, "spell_clue", "Person who studies the past (10 letters)", "HISTORIAN"),
  pad("p6-en-t4-3", 4, "spell_clue", "The home of a king or queen (6 letters)", "PALACE"),
  pad("p6-en-t4-4", 4, "spell_clue", "A book of maps (5 letters)", "ATLAS"),
  pad("p6-en-t4-5", 4, "spell_missing", "ACQU_INTANCE", "ACQUAINTANCE"),
  pad("p6-en-t4-6", 4, "spell_missing", "RE_TAURANT", "RESTAURANT"),
  pad("p6-en-t4-7", 4, "spell_missing", "M_LLENNIUM", "MILLENNIUM"),
  pad("p6-en-t4-8", 4, "spell_missing", "NECE_SARY", "NECESSARY"),
  mc("p6-en-t4-9", 4, "conditional", "If I ___ rich, I would buy a yacht.", "were", ["was", "am", "be"]),
  mc("p6-en-t4-10", 4, "conditional", "If it rains, we ___ stay home.", "will", ["would", "shall", "could"]),
  mc("p6-en-t4-11", 4, "conditional", "I wish I ___ play the piano.", "could", ["can", "will", "would"]),
  mc("p6-en-t4-12", 4, "passive", "The cake ___ baked by mom yesterday.", "was", ["is", "has", "been"]),
  mc("p6-en-t4-13", 4, "reported", "He said: \"I am tired.\" → He said he ___ tired.", "was", ["is", "had", "be"]),
  mc("p6-en-t4-14", 4, "reported", "She asked: \"Where is John?\" → She asked where John ___.", "was", ["is", "be", "had"]),
  mc("p6-en-t4-15", 4, "vocab_advanced", "What does 'meticulous' mean?", "very careful", ["very fast", "very loud", "very lazy"]),
];

// =================================================================
// CHINESE — Pri 4-6 (MOE-aligned, ~500-1200 character vocabulary)
// =================================================================

// Pri 4 — Tier 1: family + simple verbs
const zhT1 = [
  mc("p4-zh-t1-1", 1, "family", "What does 哥哥 mean?", "older brother", ["younger brother", "older sister", "father"]),
  mc("p4-zh-t1-2", 1, "family", "What does 弟弟 mean?", "younger brother", ["older brother", "younger sister", "cousin"]),
  mc("p4-zh-t1-3", 1, "family", "What does 姐姐 mean?", "older sister", ["younger sister", "mother", "aunt"]),
  mc("p4-zh-t1-4", 1, "family", "What does 妹妹 mean?", "younger sister", ["older sister", "younger brother", "cousin"]),
  mc("p4-zh-t1-5", 1, "verb_basic", "What does 吃 mean?", "eat", ["drink", "sleep", "run"]),
  mc("p4-zh-t1-6", 1, "verb_basic", "What does 喝 mean?", "drink", ["eat", "sleep", "talk"]),
  mc("p4-zh-t1-7", 1, "verb_basic", "What does 看 mean?", "look/watch", ["listen", "speak", "read"]),
  mc("p4-zh-t1-8", 1, "verb_basic", "What does 听 mean?", "listen", ["speak", "look", "write"]),
  mc("p4-zh-t1-9", 1, "verb_basic", "What does 说 mean?", "speak", ["listen", "look", "read"]),
  mc("p4-zh-t1-10", 1, "verb_basic", "What does 跑 mean?", "run", ["walk", "jump", "swim"]),
  mc("p4-zh-t1-11", 1, "object", "What does 桌子 mean?", "table", ["chair", "bed", "door"]),
  mc("p4-zh-t1-12", 1, "object", "What does 椅子 mean?", "chair", ["table", "bed", "door"]),
  mc("p4-zh-t1-13", 1, "object", "What does 房子 mean?", "house", ["car", "school", "tree"]),
];

// Pri 4 — Tier 2: measure words, common adjectives
const zhT2 = [
  mc("p4-zh-t2-1", 2, "measure_word", "Measure word for books: ___ 书", "本", ["个", "条", "只"]),
  mc("p4-zh-t2-2", 2, "measure_word", "Measure word for cars: ___ 车", "辆", ["个", "条", "只"]),
  mc("p4-zh-t2-3", 2, "measure_word", "Measure word for fish: ___ 鱼", "条", ["个", "只", "本"]),
  mc("p4-zh-t2-4", 2, "measure_word", "Measure word for cats: ___ 猫", "只", ["个", "条", "本"]),
  mc("p4-zh-t2-5", 2, "measure_word", "Measure word for people: ___ 人", "个", ["只", "条", "本"]),
  mc("p4-zh-t2-6", 2, "adjective", "What does 高兴 mean?", "happy", ["sad", "tired", "angry"]),
  mc("p4-zh-t2-7", 2, "adjective", "What does 漂亮 mean?", "beautiful", ["ugly", "fast", "tall"]),
  mc("p4-zh-t2-8", 2, "adjective", "What does 聪明 mean?", "smart/clever", ["dumb", "tall", "happy"]),
  mc("p4-zh-t2-9", 2, "adjective", "What does 累 mean?", "tired", ["happy", "hungry", "thirsty"]),
  mc("p4-zh-t2-10", 2, "adjective", "What does 饿 mean?", "hungry", ["thirsty", "tired", "full"]),
  mc("p4-zh-t2-11", 2, "color", "What does 红色 mean?", "red", ["blue", "green", "yellow"]),
  mc("p4-zh-t2-12", 2, "color", "What does 蓝色 mean?", "blue", ["red", "green", "yellow"]),
  mc("p4-zh-t2-13", 2, "color", "What does 绿色 mean?", "green", ["red", "blue", "yellow"]),
  mc("p4-zh-t2-14", 2, "color", "What does 黄色 mean?", "yellow", ["red", "blue", "green"]),
];

// Pri 5 — Tier 3: idioms (成语), longer phrases, time
const zhT3 = [
  mc("p5-zh-t3-1", 3, "idiom", "What does 一心一意 mean?", "wholeheartedly", ["always different", "halfhearted", "two minds"]),
  mc("p5-zh-t3-2", 3, "idiom", "What does 不可思议 mean?", "unimaginable/incredible", ["thoughtful", "thinking carefully", "must think"]),
  mc("p5-zh-t3-3", 3, "idiom", "What does 入乡随俗 mean?", "when in Rome, do as Romans", ["return home", "follow customs", "go to countryside"]),
  mc("p5-zh-t3-4", 3, "time", "What does 早上 mean?", "morning", ["afternoon", "evening", "night"]),
  mc("p5-zh-t3-5", 3, "time", "What does 下午 mean?", "afternoon", ["morning", "evening", "midnight"]),
  mc("p5-zh-t3-6", 3, "time", "What does 晚上 mean?", "evening/night", ["morning", "afternoon", "noon"]),
  mc("p5-zh-t3-7", 3, "time", "What does 昨天 mean?", "yesterday", ["today", "tomorrow", "last week"]),
  mc("p5-zh-t3-8", 3, "time", "What does 明天 mean?", "tomorrow", ["yesterday", "today", "next week"]),
  mc("p5-zh-t3-9", 3, "time", "What does 星期一 mean?", "Monday", ["Sunday", "Tuesday", "Friday"]),
  mc("p5-zh-t3-10", 3, "time", "What does 星期天 mean?", "Sunday", ["Saturday", "Monday", "Friday"]),
  mc("p5-zh-t3-11", 3, "phrase", "How do you say 'I love you' in Chinese?", "我爱你", ["我喜欢你", "你爱我", "我想你"]),
  mc("p5-zh-t3-12", 3, "phrase", "How do you say 'I'm sorry' formally?", "对不起", ["谢谢", "再见", "请进"]),
  mc("p5-zh-t3-13", 3, "phrase", "What does 慢慢来 mean?", "take it slow", ["come quickly", "go slowly", "walk slowly"]),
];

// Pri 6 — Tier 4: passages, harder grammar, advanced idioms
const zhT4 = [
  mc("p6-zh-t4-1", 4, "advanced_idiom", "What does 画蛇添足 mean?", "doing more than necessary", ["paint a snake well", "draw with extra feet", "add detail to art"]),
  mc("p6-zh-t4-2", 4, "advanced_idiom", "What does 守株待兔 mean?", "wait for fortune without effort", ["protect rabbits", "wait by tree stumps", "hunt rabbits"]),
  mc("p6-zh-t4-3", 4, "advanced_idiom", "What does 自相矛盾 mean?", "contradict oneself", ["fight with spear", "self-defense", "shield and spear"]),
  mc("p6-zh-t4-4", 4, "sentence", "我今天去图书馆 means ___", "Today I am going to the library", ["I went to the library yesterday", "Tomorrow I will go to the library", "The library is far"]),
  mc("p6-zh-t4-5", 4, "sentence", "请问，洗手间在哪里? means ___", "Excuse me, where is the bathroom?", ["What is the time?", "Can I help you?", "Excuse me, who are you?"]),
  mc("p6-zh-t4-6", 4, "sentence", "他比我高 means ___", "He is taller than me", ["He is shorter than me", "He is the same height as me", "He is heavier than me"]),
  mc("p6-zh-t4-7", 4, "particle", "Which particle marks a question? 你好___?", "吗", ["了", "的", "在"]),
  mc("p6-zh-t4-8", 4, "particle", "Which particle marks completed action? 我吃___饭", "了", ["吗", "的", "在"]),
  mc("p6-zh-t4-9", 4, "particle", "Which particle indicates possession? 这是我___书", "的", ["了", "吗", "在"]),
  mc("p6-zh-t4-10", 4, "comparative", "Pick the comparative form: He is taller than her", "他比她高", ["她比他高", "他和她一样高", "他没有她高"]),
  mc("p6-zh-t4-11", 4, "comparative", "Pick the negative comparative: He is NOT as tall as her", "他没有她高", ["他比她高", "他和她一样高", "她比他高"]),
  mc("p6-zh-t4-12", 4, "vocab", "What does 努力 mean?", "make effort / hard-working", ["lazy", "playful", "tired"]),
  mc("p6-zh-t4-13", 4, "vocab", "What does 重要 mean?", "important", ["heavy", "fast", "small"]),
];

// =================================================================
// WRITE
// =================================================================

writeFileSync(join(ENG, "tier-1.json"), JSON.stringify(enT1, null, 2) + "\n");
writeFileSync(join(ENG, "tier-2.json"), JSON.stringify(enT2, null, 2) + "\n");
writeFileSync(join(ENG, "tier-3.json"), JSON.stringify(enT3, null, 2) + "\n");
writeFileSync(join(ENG, "tier-4.json"), JSON.stringify(enT4, null, 2) + "\n");
writeFileSync(join(ZH, "tier-1.json"), JSON.stringify(zhT1, null, 2) + "\n");
writeFileSync(join(ZH, "tier-2.json"), JSON.stringify(zhT2, null, 2) + "\n");
writeFileSync(join(ZH, "tier-3.json"), JSON.stringify(zhT3, null, 2) + "\n");
writeFileSync(join(ZH, "tier-4.json"), JSON.stringify(zhT4, null, 2) + "\n");

console.log("English Pri 4-6:", enT1.length, "+", enT2.length, "+", enT3.length, "+", enT4.length);
console.log("Chinese Pri 4-6:", zhT1.length, "+", zhT2.length, "+", zhT3.length, "+", zhT4.length);
