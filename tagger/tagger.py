# tagger.py
# Assigns TAG, TAG_FAMILY, rhyme_class to a word entry.
# Three tiers: seed list (substring) → POS heuristic → UNTAGGED

# ─────────────────────────────────────────────
# Tier 1 — Seed Lists  (root words)
# Matching is substring-based, longest root wins.
# ─────────────────────────────────────────────

SEED_LISTS: dict[str, list[str]] = {
  # ── NATURE ──────────────────────────────
  "NATURE_SKY": [
    "আকাশ", "মেঘ", "চাঁদ", "তারা", "রোদ", "সূর্য", "নীল", "গগন",
    "খগ", "আসমান", "নভ", "অম্বর", "চন্দ্র", "শশী", "রবি",
    "দিনমণি", "বিধু", "তারকা", "নক্ষত্র",
  ],
  "NATURE_WATER": [
    "নদী", "জল", "ঢেউ", "বৃষ্টি", "ঝর্ণা", "সমুদ্র", "পুকুর", "বারি",
    "সাগর", "সিন্ধু", "নীর", "বন্যা", "স্রোত", "ঝিল", "দীঘি", "খাল",
    "বিল", "হ্রদ", "শিশির", "কুয়াশা", "তরঙ্গ", "লহর",
  ],
  "NATURE_FLORA": [
    "ফুল", "পাতা", "গাছ", "বন", "তরু", "ঘাস", "ডাল", "শাখা",
    "কুসুম", "পুষ্প", "বৃক্ষ", "অরণ্য", "বনানী", "পল্লব", "মঞ্জরি",
    "কলি", "কুঁড়ি", "লতা", "বল্লরী", "বাঁশ", "শালুক", "পদ্ম",
    "কমল", "শাপলা", "গোলাপ", "বেলি", "চামেলি", "কদম", "শিউলি",
  ],
  "NATURE_FAUNA": [
    "পাখি", "প্রজাপতি", "ভ্রমর", "হরিণ", "মাছ", "কোকিল", "দোয়েল",
    "ময়না", "শালিক", "বুলবুল", "হংস", "ময়ূর", "চিল", "বক",
    "মৌমাছি", "জোনাকি", "পতঙ্গ",
  ],
  "NATURE_EARTH": [
    "মাটি", "পাহাড়", "মাঠ", "ধূলো", "পথ", "ধরা", "ভূমি", "মেদিনী",
    "বসুধা", "পৃথিবী", "পর্বত", "গিরি", "শৈল", "প্রান্তর",
    "উপত্যকা", "তীর", "কূল",
  ],

  # ── LIGHT ───────────────────────────────
  "LIGHT_BRIGHT": [
    "আলো", "কিরণ", "ঝলমল", "দীপ্তি", "জ্যোতি", "প্রভা", "দ্যুতি",
    "ঝলক", "রশ্মি", "দীপ", "প্রদীপ", "আলোক",
  ],
  "LIGHT_SOFT": [
    "ছায়া", "জ্যোৎস্না", "গোধূলি", "আভা", "স্নিগ্ধ", "ম্লান",
  ],

  # ── TIME ────────────────────────────────
  "TIME_DAWN": [
    "ভোর", "প্রভাত", "উষা", "সকাল", "অরুণ", "প্রত্যূষ",
  ],
  "TIME_DAY": [
    "দুপুর", "দিন", "মধ্যাহ্ন", "দিবা", "অপরাহ্ন", "বেলা",
  ],
  "TIME_DUSK": [
    "সন্ধ্যা", "বিকেল", "অস্তাচল", "সায়াহ্ন", "নিশি",
    "রাত", "রজনী", "নিশীথ", "যামিনী", "রাত্রি",
  ],

  # ── MOTION ──────────────────────────────
  "MOTION_GENTLE": [
    "ভাসা", "বহা", "দোলা", "উড়া", "ঢলা", "মেলা", "নামা", "ছড়া",
  ],
  "MOTION_VIVID": [
    "ছোটা", "নাচা", "ঝরা", "খেলা", "ছুটা", "লাফা", "দৌড়া",
    "ঘোরা", "চলা",
  ],

  # ── SOUND ───────────────────────────────
  "SOUND_NATURE": [
    "কলতান", "কূজন", "ঝিঁঝিঁ", "মর্মর", "কলকল", "ঝরঝর",
    "গুনগুন", "গুঞ্জন", "ঝমঝম",
  ],
  "SOUND_HUMAN": [
    "গান", "সুর", "বাঁশি", "সংগীত", "কণ্ঠ", "তান",
    "রাগিণী", "ধ্বনি", "নিনাদ",
  ],

  # ── EMOTION ─────────────────────────────
  "EMOTION_JOY": [
    "আনন্দ", "খুশি", "হাসি", "উল্লাস", "আহ্লাদ", "মোদ",
    "হর্ষ", "প্রসন্ন",
  ],
  "EMOTION_WONDER": [
    "বিস্ময়", "মুগ্ধ", "অবাক", "চমৎকার", "অপরূপ", "আশ্চর্য",
  ],
  "EMOTION_PEACE": [
    "শান্তি", "প্রশান্তি", "নিস্তব্ধ", "নীরব", "শান্ত", "ধীর",
  ],

  # ── ACTOR ───────────────────────────────
  "ACTOR_HUMAN": [
    "মানুষ", "শিশু", "কবি", "পথিক", "বালক", "বালিকা", "নারী",
    "মেয়ে", "ছেলে", "বন্ধু",
  ],
  "ACTOR_ABSTRACT": [
    "মন", "স্বপ্ন", "প্রাণ", "হৃদয়", "আত্মা", "চেতনা", "কল্পনা",
    "স্মৃতি", "বাসনা", "আশা",
  ],

  # ── DESCRIPTOR ──────────────────────────
  "DESC_COLOR": [
    "সবুজ", "হলুদ", "সোনালি", "লাল", "সাদা", "কালো",
    "বেগুনি", "কমলা", "গোলাপি", "শ্যামল", "রঙিন",
  ],
  "DESC_TEXTURE": [
    "নরম", "মসৃণ", "কোমল", "মৃদু", "শীতল", "উষ্ণ",
  ],
  "DESC_SIZE": [
    "বিশাল", "অনন্ত", "ক্ষুদ্র", "বৃহৎ", "অসীম",
  ],

  # ── CONNECTOR ───────────────────────────
  "CONN_BRIDGE": [
    "যেন", "তবু", "আবার", "মাঝে", "তাই", "যখন", "তখন",
    "যেমন", "তেমন", "হয়তো",
  ],
}

# ─────────────────────────────────────────────
# Derived maps
# ─────────────────────────────────────────────

# root → TAG  (built from seed lists)
_ROOT_TO_TAG: dict[str, str] = {}
for _tag, _roots in SEED_LISTS.items():
  for _r in _roots:
    _ROOT_TO_TAG[_r] = _tag

# TAG → TAG_FAMILY  (mechanical: first part of TAG name)
TAG_FAMILY_MAP: dict[str, str] = {tag: tag.split("_")[0] for tag in SEED_LISTS}

# ─────────────────────────────────────────────
# POS → default TAG  (Tier 2 heuristic)
# ─────────────────────────────────────────────
_POS_HEURISTIC: dict[str, str] = {
  "NNP": "NATURE_EARTH",
  "NN":  "NATURE_FLORA",
  "NNS": "NATURE_FLORA",
  "VBG": "MOTION_GENTLE",
  "VBP": "MOTION_GENTLE",
  "VBZ": "MOTION_GENTLE",
  "VBD": "MOTION_VIVID",
  "VBN": "MOTION_GENTLE",
  "VB":  "MOTION_GENTLE",
  "JJ":  "DESC_COLOR",
  "JJR": "DESC_COLOR",
  "JJS": "DESC_COLOR",
  "RB":  "CONN_BRIDGE",
  "RBR": "CONN_BRIDGE",
  "CC":  "CONN_BRIDGE",
  "IN":  "CONN_BRIDGE",
}

# ─────────────────────────────────────────────
# Rhyme class
# ─────────────────────────────────────────────

_ALL_VOWELS: set[str] = set("অআইঈউঊঋএঐওঔ") | set("ািীুূৃেৈোৌ")

def get_rhyme_class(word: str) -> str:
  for ch in reversed(word):
    if ch in _ALL_VOWELS:
      return ch
  return word[-1] if word else ""

# ─────────────────────────────────────────────
# T1 — substring match, longest root wins
# ─────────────────────────────────────────────

def _find_tag_by_substring(word: str) -> str | None:
  best_root = ""
  best_tag  = None
  for root, tag in _ROOT_TO_TAG.items():
    if len(root) >= 3 and root in word and len(root) > len(best_root):
      best_root = root
      best_tag  = tag
  return best_tag

# ─────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────

def assign_tag(word: str, pos: str) -> tuple[str, str, bool]:
  """
  Returns (TAG, TAG_FAMILY, reviewed).
  reviewed=True  → Tier 1 hit, confident
  reviewed=False → Tier 2 heuristic or UNTAGGED, needs human check
  """
  # Tier 1 — substring match against seed roots
  tag = _find_tag_by_substring(word)
  if tag:
    return tag, TAG_FAMILY_MAP[tag], True

  # Tier 2 — POS heuristic
  if pos in _POS_HEURISTIC:
    tag = _POS_HEURISTIC[pos]
    return tag, TAG_FAMILY_MAP[tag], False

  # Tier 3 — flag for manual review
  return "UNTAGGED", "UNTAGGED", False


def tag_entry(word: str, pos: str) -> dict:
  tag, tag_family, reviewed = assign_tag(word, pos)
  return {
    "TAG":       tag,
    "TAG_FAMILY":  tag_family,
    "rhyme_class": get_rhyme_class(word),
    "reviewed":    reviewed,
  }
