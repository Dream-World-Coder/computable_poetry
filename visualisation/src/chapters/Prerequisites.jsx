import {
  Code,
  Placeholder,
  Tag,
  SectionLabel,
  P,
  H3,
} from "../components/components";

export function ChapterPrerequisites() {
  return (
    <section id="prerequisites" style={{ paddingTop: "5rem" }}>
      <SectionLabel num="04" title="Prerequisites" />

      <P>
        Before the generation pipeline can run, two foundational pieces must be
        built: a syllable splitter that can decompose any Bangla word and assign
        it a mātrā, and a tagger that assigns each word a semantic role.
      </P>

      <H3>Syllable splitting</H3>
      <P>
        The splitter in <Tag>splitBanglaSyllables.py</Tag> applies regex pattern
        matching over the Unicode character stream of a word, classifying
        characters as consonants or vowels using two declared sets. It then
        matches patterns in priority order: CVC &rarr; CCV &rarr; CV &rarr; VC.
        Each matched unit is examined to determine whether it is a মুক্তদল or
        রুদ্ধদল, and a হসন্ত (্) is appended to closed syllables.
      </P>

      <Code lang="python">
        {`# The two character classes
bangla_vowels = {("অ",""),("আ","া"),("ই","ি"),("ঈ","ী"),
                 ("উ","ু"),("ঊ","ূ"),("ঋ","ৃ"),("এ","ে"),
                 ("ঐ","ৈ"),("ও","ো"),("ঔ","ৌ")}

bangla_consonants = {"ক","খ","গ","ঘ","ঙ","চ","ছ",... }

# Pattern priority: CVC | CCV | CV | VC
pattern = f'{c}{v}{c}|{c}{{2}}{v}|{c}{v}|{v}{c}'`}
      </Code>

      <P>
        Once syllables are in hand, mātrā is assigned per-syllable according to
        the target Chhondo. In স্বরবৃত্ত every syllable &mdash; open or closed
        &mdash; contributes exactly 1. In মাত্রাবৃত্ত a closed syllable
        contributes 2. In অক্ষরবৃত্ত a closed syllable at word-end contributes
        2; elsewhere it contributes 1.
      </P>

      <Code lang="python">
        {`def get_matra(syllables, chhondo):
    total = 0
    for i, syl in enumerate(syllables):
        if is_swaranto(syl):          # open syllable — always 1
            total += 1
        elif is_banjonanto(syl):      # closed syllable
            if chhondo == "স্বরবৃত্ত":
                total += 1            # equal weight
            elif chhondo == "মাত্রাবৃত্ত":
                total += 2            # always heavier
            elif chhondo == "অক্ষরবৃত্ত":
                # word-final or standalone → 2, otherwise → 1
                if i == len(syllables)-1:
                    total += 2
                else:
                    total += 1
    return total`}
      </Code>

      <Placeholder
        label="Animation: word → syllables → mātrā assignment"
        height={180}
      />

      <H3>Tagging</H3>
      <P>
        The tagger in <Tag>tagger.py</Tag> assigns three attributes to every
        word: a semantic <Tag>TAG</Tag>, a <Tag>TAG_FAMILY</Tag>, and a{" "}
        <Tag>rhyme_class</Tag>. It operates in three tiers, stopping at the
        first match.
      </P>

      <div
        style={{
          margin: "1.5rem 0",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {[
          {
            tier: "Tier 1",
            name: "Seed list substring match",
            desc: "The word is checked against a curated list of root words for each tag. Longest matching root wins. A hit here is confident — the tag is marked reviewed=True.",
          },
          {
            tier: "Tier 2",
            name: "POS heuristic fallback",
            desc: "If no seed root matches, the POS tag from the model drives a default tag assignment. A noun defaults to NATURE_FLORA, a verb to MOTION_GENTLE, and so on. Not confident — reviewed=False.",
          },
          {
            tier: "Tier 3",
            name: "UNTAGGED",
            desc: "If neither tier matches, the word is flagged for manual review. It will not appear in the index until tagged.",
          },
        ].map((t) => (
          <div
            key={t.tier}
            style={{
              display: "flex",
              gap: "1.5rem",
              alignItems: "flex-start",
              padding: "1.2rem 1.5rem",
              background: "#faf8f4",
              border: "1px solid #e8e0d4",
              borderRadius: "2px",
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.62rem",
                color: "#b0a090",
                letterSpacing: "0.06em",
                minWidth: "3.5rem",
                paddingTop: "0.15rem",
              }}
            >
              {t.tier}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.72rem",
                  color: "#5a4e42",
                  marginBottom: "0.4rem",
                }}
              >
                {t.name}
              </div>
              <P style={{ margin: 0, fontSize: "0.95rem" }}>{t.desc}</P>
            </div>
          </div>
        ))}
      </div>

      <P>
        The rhyme class is simply the last vowel character found by scanning the
        word backwards. Words sharing the same last vowel will rhyme
        phonetically.
      </P>

      <Code lang="python">
        {`def get_rhyme_class(word):
    ALL_VOWELS = set("অআইঈউঊঋএঐওঔ") | set("ািীুূৃেৈোৌ")
    for ch in reversed(word):
        if ch in ALL_VOWELS:
            return ch
    return word[-1] if word else ""`}
      </Code>
    </section>
  );
}
