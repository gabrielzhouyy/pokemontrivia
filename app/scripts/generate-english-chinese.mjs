// Seeds English and Chinese question banks (Drop 2). Hand-curated for quality.
// Re-run any time to regenerate the 8 JSON files.
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const QDIR = join(__dirname, "..", "data", "questions");

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mc(id, tier, skill, prompt, answer, distractors) {
  const choices = shuffle([answer, ...distractors]).slice(0, 4);
  if (!choices.includes(answer)) choices[0] = answer;
  return { id, tier, skill, format: "multiple_choice", prompt, answer, choices };
}

function pad(id, tier, skill, prompt, answer) {
  return { id, tier, skill, format: "text_pad", prompt, answer };
}

// =================== ENGLISH ===================

// Tier 1: letters + CVC words (multiple_choice)
const englishT1 = [
  // Letter sequence
  mc("en1-seq-a", 1, "letter_order", "Which letter comes after A?", "B", ["C", "D", "E"]),
  mc("en1-seq-c", 1, "letter_order", "Which letter comes after C?", "D", ["B", "E", "A"]),
  mc("en1-seq-f", 1, "letter_order", "Which letter comes after F?", "G", ["H", "E", "I"]),
  mc("en1-seq-m", 1, "letter_order", "Which letter comes after M?", "N", ["O", "L", "P"]),
  mc("en1-seq-y", 1, "letter_order", "Which letter comes after Y?", "Z", ["X", "A", "W"]),
  mc("en1-bet-h", 1, "letter_order", "Which letter is between G and I?", "H", ["F", "J", "K"]),
  mc("en1-bet-r", 1, "letter_order", "Which letter is between Q and S?", "R", ["T", "P", "U"]),
  // Starts-with sound
  mc("en1-starts-b", 1, "phonics", "Which word starts with 'b'?", "BAT", ["CAT", "SUN", "RUN"]),
  mc("en1-starts-c", 1, "phonics", "Which word starts with 'c'?", "CAR", ["BAR", "JAR", "TAR"]),
  mc("en1-starts-d", 1, "phonics", "Which word starts with 'd'?", "DOG", ["LOG", "FOG", "JOG"]),
  mc("en1-starts-f", 1, "phonics", "Which word starts with 'f'?", "FISH", ["DISH", "WISH", "MISH"]),
  mc("en1-starts-s", 1, "phonics", "Which word starts with 's'?", "SUN", ["RUN", "BUN", "FUN"]),
  // Spell CVC via MC
  mc("en1-spell-cat", 1, "spell_cvc", "How do you spell 'cat'? 🐱", "CAT", ["CAR", "COT", "CAB"]),
  mc("en1-spell-dog", 1, "spell_cvc", "How do you spell 'dog'? 🐶", "DOG", ["DIG", "DOT", "BOG"]),
  mc("en1-spell-pig", 1, "spell_cvc", "How do you spell 'pig'? 🐷", "PIG", ["PIC", "BIG", "PEG"]),
  mc("en1-spell-cow", 1, "spell_cvc", "How do you spell 'cow'? 🐄", "COW", ["COT", "BOW", "CAW"]),
  mc("en1-spell-sun", 1, "spell_cvc", "How do you spell 'sun'? ☀️", "SUN", ["SIN", "SON", "RUN"]),
  mc("en1-spell-bee", 1, "spell_cvc", "How do you spell 'bee'? 🐝", "BEE", ["BEA", "BEY", "SEE"]),
  mc("en1-spell-fox", 1, "spell_cvc", "How do you spell 'fox'? 🦊", "FOX", ["FIX", "BOX", "FOG"]),
  mc("en1-spell-cup", 1, "spell_cvc", "How do you spell 'cup'? ☕", "CUP", ["CAP", "CUB", "COP"]),
  mc("en1-spell-hat", 1, "spell_cvc", "How do you spell 'hat'? 🎩", "HAT", ["HAY", "HIT", "BAT"]),
  mc("en1-spell-bag", 1, "spell_cvc", "How do you spell 'bag'? 🎒", "BAG", ["BAT", "BIG", "BUG"]),
  // Identify by emoji
  mc("en1-emoji-cat", 1, "word_id", "Which word means 🐱?", "CAT", ["DOG", "BIRD", "FISH"]),
  mc("en1-emoji-dog", 1, "word_id", "Which word means 🐶?", "DOG", ["CAT", "PIG", "COW"]),
  mc("en1-emoji-fish", 1, "word_id", "Which word means 🐟?", "FISH", ["BIRD", "CAT", "FROG"]),
  mc("en1-emoji-sun", 1, "word_id", "Which word means ☀️?", "SUN", ["MOON", "STAR", "RAIN"]),
  mc("en1-emoji-moon", 1, "word_id", "Which word means 🌙?", "MOON", ["SUN", "STAR", "SKY"]),
  mc("en1-emoji-tree", 1, "word_id", "Which word means 🌳?", "TREE", ["LEAF", "FLOWER", "GRASS"]),
  // Vowels
  mc("en1-vowel-a", 1, "vowels", "Pick the vowel:", "A", ["B", "C", "D"]),
  mc("en1-vowel-e", 1, "vowels", "Which is a vowel?", "E", ["F", "G", "H"]),
  mc("en1-vowel-o", 1, "vowels", "Which is a vowel?", "O", ["P", "Q", "R"]),
];

// Tier 2: sight words + cloze (multiple_choice)
const englishT2 = [
  mc("en2-cloze-cat", 2, "cloze", "I see ___ cat.", "A", ["AN", "OF", "BE"]),
  mc("en2-cloze-apple", 2, "cloze", "I eat ___ apple.", "AN", ["A", "OF", "ON"]),
  mc("en2-cloze-school", 2, "cloze", "I go to ___ school.", "THE", ["AN", "BE", "OF"]),
  mc("en2-cloze-park", 2, "cloze", "We are at ___ park.", "THE", ["AN", "A", "ARE"]),
  mc("en2-cloze-she", 2, "cloze", "She ___ happy.", "IS", ["ARE", "AM", "BE"]),
  mc("en2-cloze-they", 2, "cloze", "They ___ tired.", "ARE", ["IS", "AM", "BE"]),
  mc("en2-cloze-i", 2, "cloze", "I ___ a student.", "AM", ["IS", "ARE", "BE"]),
  mc("en2-cloze-we", 2, "cloze", "We ___ friends.", "ARE", ["IS", "AM", "BE"]),
  mc("en2-cloze-want", 2, "cloze", "I ___ to play.", "WANT", ["WAS", "WAY", "WALK"]),
  mc("en2-cloze-have", 2, "cloze", "You ___ a book.", "HAVE", ["HAS", "HAD", "HAT"]),
  mc("en2-cloze-can", 2, "cloze", "She ___ run fast.", "CAN", ["DOES", "IS", "WAS"]),
  // Plurals
  mc("en2-plural-cat", 2, "plural", "One cat, two ___.", "CATS", ["CAT", "CATES", "CATZ"]),
  mc("en2-plural-dog", 2, "plural", "One dog, two ___.", "DOGS", ["DOGES", "DOGZ", "DOGGS"]),
  mc("en2-plural-box", 2, "plural", "One box, two ___.", "BOXES", ["BOXS", "BOXIS", "BOXZ"]),
  mc("en2-plural-fish", 2, "plural", "One fish, two ___.", "FISH", ["FISHS", "FISHES", "FISHIES"]),
  mc("en2-plural-baby", 2, "plural", "One baby, two ___.", "BABIES", ["BABYS", "BABYES", "BABY"]),
  // Past tense
  mc("en2-past-jump", 2, "past_tense", "Yesterday I ___ high.", "JUMPED", ["JUMP", "JUMPS", "JUMPING"]),
  mc("en2-past-run", 2, "past_tense", "Yesterday I ___ home.", "RAN", ["RUN", "RUNS", "RUNNED"]),
  mc("en2-past-eat", 2, "past_tense", "Yesterday I ___ pizza.", "ATE", ["EAT", "EATED", "EATS"]),
  mc("en2-past-go", 2, "past_tense", "Yesterday I ___ to the park.", "WENT", ["GO", "GOED", "GOES"]),
  // Sight words
  mc("en2-sight-the", 2, "sight_words", "Pick the word 'the':", "THE", ["THEM", "THEN", "THIS"]),
  mc("en2-sight-and", 2, "sight_words", "Pick the word 'and':", "AND", ["AT", "AM", "AN"]),
  mc("en2-sight-was", 2, "sight_words", "Pick the word 'was':", "WAS", ["SAW", "WAY", "WAR"]),
  mc("en2-sight-said", 2, "sight_words", "Pick the word 'said':", "SAID", ["SAYS", "SAY", "SIDE"]),
  // Opposites
  mc("en2-opp-big", 2, "opposites", "Opposite of BIG?", "SMALL", ["TALL", "WIDE", "LONG"]),
  mc("en2-opp-hot", 2, "opposites", "Opposite of HOT?", "COLD", ["WARM", "WET", "DRY"]),
  mc("en2-opp-up", 2, "opposites", "Opposite of UP?", "DOWN", ["LEFT", "RIGHT", "OVER"]),
  mc("en2-opp-fast", 2, "opposites", "Opposite of FAST?", "SLOW", ["LONG", "SHORT", "WIDE"]),
  mc("en2-opp-day", 2, "opposites", "Opposite of DAY?", "NIGHT", ["MORNING", "WEEK", "MONTH"]),
  mc("en2-opp-yes", 2, "opposites", "Opposite of YES?", "NO", ["MAYBE", "OK", "HI"]),
];

// Tier 3: 5-6 letter spelling, mixed prompt styles (text_pad)
const englishT3 = [
  // Clue-based
  pad("en3-clue-house", 3, "spell_clue", "Where you live (5 letters)", "HOUSE"),
  pad("en3-clue-water", 3, "spell_clue", "You drink it (5 letters)", "WATER"),
  pad("en3-clue-apple", 3, "spell_clue", "A red fruit (5 letters)", "APPLE"),
  pad("en3-clue-happy", 3, "spell_clue", "Feeling good (5 letters)", "HAPPY"),
  pad("en3-clue-green", 3, "spell_clue", "Color of grass (5 letters)", "GREEN"),
  pad("en3-clue-music", 3, "spell_clue", "What your ears hear with rhythm (5 letters)", "MUSIC"),
  pad("en3-clue-mouse", 3, "spell_clue", "A tiny squeaky animal (5 letters)", "MOUSE"),
  pad("en3-clue-bread", 3, "spell_clue", "You make sandwiches with it (5 letters)", "BREAD"),
  // Missing-letter
  pad("en3-miss-house", 3, "spell_missing", "H_USE", "HOUSE"),
  pad("en3-miss-water", 3, "spell_missing", "W_TER", "WATER"),
  pad("en3-miss-table", 3, "spell_missing", "T_BLE", "TABLE"),
  pad("en3-miss-chair", 3, "spell_missing", "CH_IR", "CHAIR"),
  pad("en3-miss-paper", 3, "spell_missing", "PAP_R", "PAPER"),
  pad("en3-miss-light", 3, "spell_missing", "L_GHT", "LIGHT"),
  pad("en3-miss-night", 3, "spell_missing", "N_GHT", "NIGHT"),
  pad("en3-miss-sleep", 3, "spell_missing", "SL__P", "SLEEP"),
  // Rote-copy
  pad("en3-copy-smile", 3, "spell_copy", "Spell: SMILE", "SMILE"),
  pad("en3-copy-dance", 3, "spell_copy", "Spell: DANCE", "DANCE"),
  pad("en3-copy-cloud", 3, "spell_copy", "Spell: CLOUD", "CLOUD"),
  pad("en3-copy-river", 3, "spell_copy", "Spell: RIVER", "RIVER"),
  pad("en3-copy-tiger", 3, "spell_copy", "Spell: TIGER", "TIGER"),
  // Emoji clue
  pad("en3-emoji-house", 3, "spell_emoji", "🏠 (5 letters)", "HOUSE"),
  pad("en3-emoji-mouse", 3, "spell_emoji", "🐭 (5 letters)", "MOUSE"),
  pad("en3-emoji-apple", 3, "spell_emoji", "🍎 (5 letters)", "APPLE"),
  pad("en3-emoji-snake", 3, "spell_emoji", "🐍 (5 letters)", "SNAKE"),
  pad("en3-emoji-train", 3, "spell_emoji", "🚂 (5 letters)", "TRAIN"),
  pad("en3-emoji-pizza", 3, "spell_emoji", "🍕 (5 letters)", "PIZZA"),
  pad("en3-emoji-tiger", 3, "spell_emoji", "🐅 (5 letters)", "TIGER"),
  pad("en3-emoji-zebra", 3, "spell_emoji", "🦓 (5 letters)", "ZEBRA"),
  pad("en3-emoji-cloud", 3, "spell_emoji", "☁️ (5 letters)", "CLOUD"),
  pad("en3-emoji-snail", 3, "spell_emoji", "🐌 (5 letters)", "SNAIL"),
];

// Tier 4: harder spelling/grammar (text_pad)
const englishT4 = [
  pad("en4-clue-butter", 4, "spell_clue", "Yellow spread for bread (6 letters)", "BUTTER"),
  pad("en4-clue-orange", 4, "spell_clue", "A round juicy fruit, also a color (6 letters)", "ORANGE"),
  pad("en4-clue-jungle", 4, "spell_clue", "A thick wild forest (6 letters)", "JUNGLE"),
  pad("en4-clue-pencil", 4, "spell_clue", "You write with this (6 letters)", "PENCIL"),
  pad("en4-clue-rocket", 4, "spell_clue", "Goes to space (6 letters)", "ROCKET"),
  pad("en4-clue-banana", 4, "spell_clue", "A yellow fruit monkeys love (6 letters)", "BANANA"),
  pad("en4-miss-butterfly", 4, "spell_missing", "B_TTERFLY", "BUTTERFLY"),
  pad("en4-miss-elephant", 4, "spell_missing", "ELEPH_NT", "ELEPHANT"),
  pad("en4-miss-mountain", 4, "spell_missing", "MOUNT_IN", "MOUNTAIN"),
  pad("en4-miss-rainbow", 4, "spell_missing", "R_INBOW", "RAINBOW"),
  pad("en4-miss-friend", 4, "spell_missing", "FR_END", "FRIEND"),
  pad("en4-miss-school", 4, "spell_missing", "SCH_OL", "SCHOOL"),
  pad("en4-miss-because", 4, "spell_missing", "BEC_USE", "BECAUSE"),
  pad("en4-copy-bicycle", 4, "spell_copy", "Spell: BICYCLE", "BICYCLE"),
  pad("en4-copy-monkey", 4, "spell_copy", "Spell: MONKEY", "MONKEY"),
  pad("en4-copy-window", 4, "spell_copy", "Spell: WINDOW", "WINDOW"),
  pad("en4-copy-purple", 4, "spell_copy", "Spell: PURPLE", "PURPLE"),
  pad("en4-emoji-butterfly", 4, "spell_emoji", "🦋 (9 letters)", "BUTTERFLY"),
  pad("en4-emoji-elephant", 4, "spell_emoji", "🐘 (8 letters)", "ELEPHANT"),
  pad("en4-emoji-mountain", 4, "spell_emoji", "⛰️ (8 letters)", "MOUNTAIN"),
  pad("en4-emoji-rainbow", 4, "spell_emoji", "🌈 (7 letters)", "RAINBOW"),
  pad("en4-emoji-strawberry", 4, "spell_emoji", "🍓 (10 letters)", "STRAWBERRY"),
  pad("en4-emoji-octopus", 4, "spell_emoji", "🐙 (7 letters)", "OCTOPUS"),
  pad("en4-emoji-volcano", 4, "spell_emoji", "🌋 (7 letters)", "VOLCANO"),
  pad("en4-emoji-dolphin", 4, "spell_emoji", "🐬 (7 letters)", "DOLPHIN"),
  pad("en4-emoji-penguin", 4, "spell_emoji", "🐧 (7 letters)", "PENGUIN"),
  pad("en4-clue-ocean", 4, "spell_clue", "The big salty body of water (5 letters)", "OCEAN"),
  pad("en4-clue-circle", 4, "spell_clue", "A round shape (6 letters)", "CIRCLE"),
  pad("en4-clue-yellow", 4, "spell_clue", "Color of the sun (6 letters)", "YELLOW"),
  pad("en4-clue-purple", 4, "spell_clue", "Mix of red and blue (6 letters)", "PURPLE"),
];

// =================== CHINESE ===================
// All multiple_choice with mixed direction (English→Chinese and Chinese→English).

// Tier 1: numbers + basic single characters
const chineseT1 = [
  // English → Chinese
  mc("zh1-en2zh-1", 1, "char_en2zh", "What is one?", "一", ["二", "三", "四"]),
  mc("zh1-en2zh-2", 1, "char_en2zh", "What is two?", "二", ["一", "三", "五"]),
  mc("zh1-en2zh-3", 1, "char_en2zh", "What is three?", "三", ["二", "四", "五"]),
  mc("zh1-en2zh-4", 1, "char_en2zh", "What is four?", "四", ["三", "五", "六"]),
  mc("zh1-en2zh-5", 1, "char_en2zh", "What is five?", "五", ["四", "六", "三"]),
  mc("zh1-en2zh-6", 1, "char_en2zh", "What is six?", "六", ["七", "八", "五"]),
  mc("zh1-en2zh-7", 1, "char_en2zh", "What is seven?", "七", ["八", "九", "六"]),
  mc("zh1-en2zh-big", 1, "char_en2zh", "What is big?", "大", ["小", "中", "上"]),
  mc("zh1-en2zh-small", 1, "char_en2zh", "What is small?", "小", ["大", "中", "下"]),
  mc("zh1-en2zh-water", 1, "char_en2zh", "What is water?", "水", ["火", "木", "山"]),
  mc("zh1-en2zh-fire", 1, "char_en2zh", "What is fire?", "火", ["水", "木", "土"]),
  mc("zh1-en2zh-mountain", 1, "char_en2zh", "What is mountain?", "山", ["水", "木", "石"]),
  mc("zh1-en2zh-up", 1, "char_en2zh", "What is up?", "上", ["下", "中", "左"]),
  mc("zh1-en2zh-down", 1, "char_en2zh", "What is down?", "下", ["上", "中", "右"]),
  mc("zh1-en2zh-tree", 1, "char_en2zh", "What is tree?", "木", ["水", "火", "山"]),
  // Chinese → English
  mc("zh1-zh2en-1", 1, "char_zh2en", "What does 一 mean?", "one", ["two", "three", "four"]),
  mc("zh1-zh2en-2", 1, "char_zh2en", "What does 二 mean?", "two", ["one", "three", "five"]),
  mc("zh1-zh2en-5", 1, "char_zh2en", "What does 五 mean?", "five", ["four", "six", "three"]),
  mc("zh1-zh2en-8", 1, "char_zh2en", "What does 八 mean?", "eight", ["seven", "nine", "six"]),
  mc("zh1-zh2en-10", 1, "char_zh2en", "What does 十 mean?", "ten", ["nine", "eleven", "five"]),
  mc("zh1-zh2en-big", 1, "char_zh2en", "What does 大 mean?", "big", ["small", "tall", "long"]),
  mc("zh1-zh2en-small", 1, "char_zh2en", "What does 小 mean?", "small", ["big", "short", "wide"]),
  mc("zh1-zh2en-water", 1, "char_zh2en", "What does 水 mean?", "water", ["fire", "tree", "mountain"]),
  mc("zh1-zh2en-fire", 1, "char_zh2en", "What does 火 mean?", "fire", ["water", "wood", "earth"]),
  mc("zh1-zh2en-tree", 1, "char_zh2en", "What does 木 mean?", "tree", ["water", "fire", "mountain"]),
  mc("zh1-zh2en-mountain", 1, "char_zh2en", "What does 山 mean?", "mountain", ["river", "tree", "sky"]),
  mc("zh1-zh2en-up", 1, "char_zh2en", "What does 上 mean?", "up", ["down", "left", "right"]),
  mc("zh1-zh2en-down", 1, "char_zh2en", "What does 下 mean?", "down", ["up", "middle", "side"]),
  mc("zh1-zh2en-left", 1, "char_zh2en", "What does 左 mean?", "left", ["right", "up", "down"]),
  mc("zh1-zh2en-right", 1, "char_zh2en", "What does 右 mean?", "right", ["left", "up", "down"]),
];

// Tier 2: greetings + common words (multi-character phrases)
const chineseT2 = [
  // English → Chinese
  mc("zh2-en2zh-hello", 2, "phrase_en2zh", "How do you say hello?", "你好", ["再见", "谢谢", "请"]),
  mc("zh2-en2zh-thanks", 2, "phrase_en2zh", "How do you say thank you?", "谢谢", ["你好", "再见", "请"]),
  mc("zh2-en2zh-bye", 2, "phrase_en2zh", "How do you say goodbye?", "再见", ["你好", "谢谢", "对不起"]),
  mc("zh2-en2zh-please", 2, "phrase_en2zh", "How do you say please?", "请", ["谢谢", "你好", "再见"]),
  mc("zh2-en2zh-sorry", 2, "phrase_en2zh", "How do you say sorry?", "对不起", ["谢谢", "请", "你好"]),
  mc("zh2-en2zh-welcome", 2, "phrase_en2zh", "How do you say you're welcome?", "不客气", ["谢谢", "请", "再见"]),
  mc("zh2-en2zh-i", 2, "phrase_en2zh", "What is 'I'?", "我", ["你", "他", "她"]),
  mc("zh2-en2zh-you", 2, "phrase_en2zh", "What is 'you'?", "你", ["我", "他", "她"]),
  mc("zh2-en2zh-he", 2, "phrase_en2zh", "What is 'he'?", "他", ["她", "我", "你"]),
  mc("zh2-en2zh-she", 2, "phrase_en2zh", "What is 'she'?", "她", ["他", "我", "你"]),
  mc("zh2-en2zh-yes", 2, "phrase_en2zh", "How do you say yes?", "是", ["不", "好", "可以"]),
  mc("zh2-en2zh-no", 2, "phrase_en2zh", "How do you say no?", "不", ["是", "好", "可以"]),
  mc("zh2-en2zh-good", 2, "phrase_en2zh", "How do you say good?", "好", ["不", "是", "可以"]),
  mc("zh2-en2zh-name", 2, "phrase_en2zh", "What is 'name'?", "名字", ["朋友", "家", "学校"]),
  mc("zh2-en2zh-friend", 2, "phrase_en2zh", "What is 'friend'?", "朋友", ["家", "名字", "学校"]),
  // Chinese → English
  mc("zh2-zh2en-nihao", 2, "phrase_zh2en", "What does 你好 mean?", "hello", ["goodbye", "thanks", "please"]),
  mc("zh2-zh2en-xiexie", 2, "phrase_zh2en", "What does 谢谢 mean?", "thank you", ["hello", "sorry", "please"]),
  mc("zh2-zh2en-zaijian", 2, "phrase_zh2en", "What does 再见 mean?", "goodbye", ["hello", "sorry", "please"]),
  mc("zh2-zh2en-qing", 2, "phrase_zh2en", "What does 请 mean?", "please", ["thanks", "hello", "no"]),
  mc("zh2-zh2en-duibuqi", 2, "phrase_zh2en", "What does 对不起 mean?", "sorry", ["thanks", "hello", "yes"]),
  mc("zh2-zh2en-buke", 2, "phrase_zh2en", "What does 不客气 mean?", "you're welcome", ["thanks", "hello", "sorry"]),
  mc("zh2-zh2en-wo", 2, "phrase_zh2en", "What does 我 mean?", "I", ["you", "he", "she"]),
  mc("zh2-zh2en-ni", 2, "phrase_zh2en", "What does 你 mean?", "you", ["I", "he", "she"]),
  mc("zh2-zh2en-ta-he", 2, "phrase_zh2en", "What does 他 mean?", "he", ["she", "I", "you"]),
  mc("zh2-zh2en-ta-she", 2, "phrase_zh2en", "What does 她 mean?", "she", ["he", "I", "you"]),
  mc("zh2-zh2en-shi", 2, "phrase_zh2en", "What does 是 mean?", "yes/is", ["no", "good", "want"]),
  mc("zh2-zh2en-bu", 2, "phrase_zh2en", "What does 不 mean?", "no/not", ["yes", "good", "want"]),
  mc("zh2-zh2en-hao", 2, "phrase_zh2en", "What does 好 mean?", "good", ["bad", "yes", "no"]),
  mc("zh2-zh2en-mingzi", 2, "phrase_zh2en", "What does 名字 mean?", "name", ["friend", "home", "school"]),
  mc("zh2-zh2en-pengyou", 2, "phrase_zh2en", "What does 朋友 mean?", "friend", ["family", "name", "teacher"]),
];

// Tier 3: family + everyday objects (~20-character recognition)
const chineseT3 = [
  mc("zh3-en2zh-mom", 3, "family_en2zh", "What is mother?", "妈妈", ["爸爸", "姐姐", "哥哥"]),
  mc("zh3-en2zh-dad", 3, "family_en2zh", "What is father?", "爸爸", ["妈妈", "弟弟", "哥哥"]),
  mc("zh3-en2zh-elder-sis", 3, "family_en2zh", "What is older sister?", "姐姐", ["妹妹", "妈妈", "哥哥"]),
  mc("zh3-en2zh-younger-sis", 3, "family_en2zh", "What is younger sister?", "妹妹", ["姐姐", "弟弟", "哥哥"]),
  mc("zh3-en2zh-elder-bro", 3, "family_en2zh", "What is older brother?", "哥哥", ["弟弟", "爸爸", "姐姐"]),
  mc("zh3-en2zh-younger-bro", 3, "family_en2zh", "What is younger brother?", "弟弟", ["哥哥", "妹妹", "爸爸"]),
  mc("zh3-en2zh-grandma", 3, "family_en2zh", "What is grandmother (paternal)?", "奶奶", ["爷爷", "妈妈", "妹妹"]),
  mc("zh3-en2zh-grandpa", 3, "family_en2zh", "What is grandfather (paternal)?", "爷爷", ["奶奶", "爸爸", "哥哥"]),
  mc("zh3-en2zh-home", 3, "object_en2zh", "What is home?", "家", ["学校", "朋友", "房间"]),
  mc("zh3-en2zh-school", 3, "object_en2zh", "What is school?", "学校", ["家", "朋友", "公园"]),
  mc("zh3-en2zh-apple", 3, "object_en2zh", "What is apple?", "苹果", ["香蕉", "鱼", "饭"]),
  mc("zh3-en2zh-banana", 3, "object_en2zh", "What is banana?", "香蕉", ["苹果", "鱼", "饭"]),
  mc("zh3-en2zh-fish", 3, "object_en2zh", "What is fish?", "鱼", ["鸡", "肉", "饭"]),
  mc("zh3-en2zh-rice", 3, "object_en2zh", "What is rice?", "饭", ["鱼", "肉", "面"]),
  mc("zh3-en2zh-tea", 3, "object_en2zh", "What is tea?", "茶", ["水", "牛奶", "咖啡"]),
  mc("zh3-zh2en-mama", 3, "family_zh2en", "What does 妈妈 mean?", "mother", ["father", "sister", "brother"]),
  mc("zh3-zh2en-baba", 3, "family_zh2en", "What does 爸爸 mean?", "father", ["mother", "brother", "uncle"]),
  mc("zh3-zh2en-jiejie", 3, "family_zh2en", "What does 姐姐 mean?", "older sister", ["younger sister", "mother", "aunt"]),
  mc("zh3-zh2en-meimei", 3, "family_zh2en", "What does 妹妹 mean?", "younger sister", ["older sister", "younger brother", "mother"]),
  mc("zh3-zh2en-gege", 3, "family_zh2en", "What does 哥哥 mean?", "older brother", ["younger brother", "father", "uncle"]),
  mc("zh3-zh2en-didi", 3, "family_zh2en", "What does 弟弟 mean?", "younger brother", ["older brother", "younger sister", "cousin"]),
  mc("zh3-zh2en-jia", 3, "object_zh2en", "What does 家 mean?", "home", ["school", "friend", "park"]),
  mc("zh3-zh2en-xuexiao", 3, "object_zh2en", "What does 学校 mean?", "school", ["home", "park", "store"]),
  mc("zh3-zh2en-pingguo", 3, "object_zh2en", "What does 苹果 mean?", "apple", ["banana", "orange", "fish"]),
  mc("zh3-zh2en-xiangjiao", 3, "object_zh2en", "What does 香蕉 mean?", "banana", ["apple", "orange", "fish"]),
  mc("zh3-zh2en-yu", 3, "object_zh2en", "What does 鱼 mean?", "fish", ["chicken", "meat", "rice"]),
  mc("zh3-zh2en-fan", 3, "object_zh2en", "What does 饭 mean?", "rice/meal", ["fish", "meat", "tea"]),
  mc("zh3-zh2en-cha", 3, "object_zh2en", "What does 茶 mean?", "tea", ["water", "milk", "coffee"]),
  mc("zh3-zh2en-shu", 3, "object_zh2en", "What does 书 mean?", "book", ["pen", "paper", "desk"]),
  mc("zh3-zh2en-bi", 3, "object_zh2en", "What does 笔 mean?", "pen/pencil", ["book", "paper", "desk"]),
];

// Tier 4: simple sentences (Chinese → English meaning)
const chineseT4 = [
  mc("zh4-sent-student", 4, "sentence_zh2en", "我是学生 means…", "I am a student", ["I am a teacher", "I am hungry", "I have school"]),
  mc("zh4-sent-teacher", 4, "sentence_zh2en", "她是老师 means…", "She is a teacher", ["He is a teacher", "She is a student", "She is happy"]),
  mc("zh4-sent-happy", 4, "sentence_zh2en", "我很开心 means…", "I am very happy", ["I am sad", "I am tired", "I am hungry"]),
  mc("zh4-sent-hungry", 4, "sentence_zh2en", "我饿了 means…", "I am hungry", ["I am full", "I am thirsty", "I am tired"]),
  mc("zh4-sent-thirsty", 4, "sentence_zh2en", "我渴了 means…", "I am thirsty", ["I am hungry", "I am sleepy", "I am cold"]),
  mc("zh4-sent-tired", 4, "sentence_zh2en", "我累了 means…", "I am tired", ["I am happy", "I am hungry", "I am cold"]),
  mc("zh4-sent-love-mom", 4, "sentence_zh2en", "我爱妈妈 means…", "I love mother", ["I love father", "Mother loves me", "Mother is here"]),
  mc("zh4-sent-friend", 4, "sentence_zh2en", "他是我的朋友 means…", "He is my friend", ["She is my friend", "He is my brother", "He is here"]),
  mc("zh4-sent-go-school", 4, "sentence_zh2en", "我去学校 means…", "I go to school", ["I am at school", "I leave school", "School is here"]),
  mc("zh4-sent-eat-rice", 4, "sentence_zh2en", "我吃饭 means…", "I eat rice/meal", ["I drink tea", "I cook rice", "I want rice"]),
  mc("zh4-sent-drink-water", 4, "sentence_zh2en", "我喝水 means…", "I drink water", ["I want water", "I see water", "I have water"]),
  mc("zh4-sent-this-is", 4, "sentence_zh2en", "这是我的家 means…", "This is my home", ["That is my home", "This is your home", "I am at home"]),
  mc("zh4-sent-mom-here", 4, "sentence_zh2en", "妈妈在家 means…", "Mother is at home", ["Mother is at school", "I am at home", "Mother is happy"]),
  mc("zh4-sent-cat-cute", 4, "sentence_zh2en", "猫很可爱 means…", "Cats are very cute", ["Cats are big", "Cats are scary", "I have a cat"]),
  mc("zh4-sent-today-good", 4, "sentence_zh2en", "今天很好 means…", "Today is very good", ["Today is bad", "Yesterday was good", "Tomorrow is good"]),
  // Reverse direction (English → Chinese sentence)
  mc("zh4-en2sent-i-am-student", 4, "sentence_en2zh", "How do you say 'I am a student'?", "我是学生", ["你是学生", "我是老师", "她是学生"]),
  mc("zh4-en2sent-i-love-mom", 4, "sentence_en2zh", "How do you say 'I love mother'?", "我爱妈妈", ["我爱爸爸", "妈妈爱我", "我有妈妈"]),
  mc("zh4-en2sent-go-school", 4, "sentence_en2zh", "How do you say 'I go to school'?", "我去学校", ["我在学校", "学校很大", "我有学校"]),
  mc("zh4-en2sent-eat-rice", 4, "sentence_en2zh", "How do you say 'I eat rice'?", "我吃饭", ["我喝水", "我要饭", "饭很好"]),
  mc("zh4-en2sent-thanks-mom", 4, "sentence_en2zh", "How do you say 'Thank you, mother'?", "谢谢妈妈", ["你好妈妈", "再见妈妈", "对不起妈妈"]),
  mc("zh4-en2sent-friend", 4, "sentence_en2zh", "How do you say 'He is my friend'?", "他是我的朋友", ["她是我的朋友", "他是我的哥哥", "他在我家"]),
  mc("zh4-en2sent-good-day", 4, "sentence_en2zh", "How do you say 'Today is good'?", "今天很好", ["昨天很好", "今天不好", "今天来了"]),
  mc("zh4-en2sent-tired", 4, "sentence_en2zh", "How do you say 'I am tired'?", "我累了", ["我饿了", "我渴了", "我开心"]),
  mc("zh4-en2sent-this-home", 4, "sentence_en2zh", "How do you say 'This is my home'?", "这是我的家", ["那是我的家", "这是你的家", "我的家在这"]),
  mc("zh4-en2sent-cat-cute", 4, "sentence_en2zh", "How do you say 'The cat is cute'?", "猫很可爱", ["狗很可爱", "猫很大", "我爱猫"]),
  mc("zh4-en2sent-water-please", 4, "sentence_en2zh", "How do you say 'Water, please'?", "请给我水", ["谢谢水", "我要饭", "水好喝"]),
  mc("zh4-en2sent-no-thanks", 4, "sentence_en2zh", "How do you say 'No, thanks'?", "不用谢", ["不客气", "谢谢", "请"]),
  mc("zh4-en2sent-mom-cooks", 4, "sentence_en2zh", "How do you say 'Mom cooks rice'?", "妈妈做饭", ["我做饭", "妈妈吃饭", "妈妈在家"]),
  mc("zh4-en2sent-i-have-book", 4, "sentence_en2zh", "How do you say 'I have a book'?", "我有书", ["我有笔", "你有书", "我看书"]),
  mc("zh4-en2sent-school-big", 4, "sentence_en2zh", "How do you say 'The school is big'?", "学校很大", ["家很大", "学校很小", "学校很好"]),
];

// =================== WRITE FILES ===================

const banks = {
  english: { 1: englishT1, 2: englishT2, 3: englishT3, 4: englishT4 },
  chinese: { 1: chineseT1, 2: chineseT2, 3: chineseT3, 4: chineseT4 },
};

for (const [subject, tiers] of Object.entries(banks)) {
  for (const [tier, qs] of Object.entries(tiers)) {
    writeFileSync(
      join(QDIR, "age-7", subject, `tier-${tier}.json`),
      JSON.stringify(qs, null, 2) + "\n",
    );
    console.log(`${subject} tier ${tier}: ${qs.length} questions`);
  }
}
