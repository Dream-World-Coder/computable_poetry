from itertools import combinations
from typing import List, Dict,Tuple, Any

def __find_valid_words(words_list, chhondo, matra): # not feasible
    # filter words with matra>0
    filtered_words_list = [word for word in words_list if word['totalMatra'].get(chhondo, 0) > 0]

    valid_combinations = []

    # try all possible non-empty combinations
    for r in range(1, len(filtered_words_list) + 1):
        for combo in combinations(filtered_words_list, r):
            total = sum(word['totalMatra'][chhondo] for word in combo)
            if total == matra:
                valid_combinations.append(combo)

    return valid_combinations


def _find_valid_combinations(words_list, chhondo, matra, max_words=1)->list[list[dict[str, Any]]]:
    results = []

    # Preprocess: keep only words with positive matra for given chhondo
    valid_words = [w for w in words_list if w['totalMatra'].get(chhondo, 0) > 0]
    valid_words.sort(key=lambda w: w['totalMatra'][chhondo])  # optional but helps with pruning

    def backtrack(start, path, current_sum):
        if current_sum == matra:
            results.append(path[:])
            return
        if current_sum > matra or len(path) >= max_words:
            return

        for i in range(start, len(valid_words)):
            word = valid_words[i]
            mat = word['totalMatra'][chhondo]
            if current_sum + mat > matra:
                break  # pruning
            path.append(word)
            backtrack(i + 1, path, current_sum + mat)
            path.pop()

    backtrack(0, [], 0)
    return results


def get_allowed_splits(m: int) -> List[List[int]]:
    match m:
        case 2 | 3:
            return [[m]]
        case 4:
            return [[4], [2, 2]]
        case 5:
            return [[5], [2, 3]]
        case 6:
            return [[6], [2, 4]]
        case 7:
            return [[7], [2, 5]]
        case 8:
            return [[8], [2, 6], [4, 4]]
        case _:
            return [[m]]   # x > 8

def __find_valid_combinations(words_list: List[Dict[str, Any]], chhondo: str, matra: int, max_words=1) -> List[List[Dict[str, Any]]]:
    results = []

    # Filter and group words by their matra value
    filtered_words = [w for w in words_list if w['totalMatra'].get(chhondo, 0) > 0]
    matra_to_words = {}
    for word in filtered_words:
        m = word['totalMatra'][chhondo]
        if m not in matra_to_words:
            matra_to_words[m] = []
        matra_to_words[m].append(word)

    allowed_splits = get_allowed_splits(matra)

    for split in allowed_splits:
        if len(split) > max_words:
            continue

        def backtrack(index, path, used_ids):
            if index == len(split):
                results.append(path[:])
                return
            m = split[index]
            for word in matra_to_words.get(m, []):
                if id(word) in used_ids:
                    continue  # prevent reusing the same word object
                path.append(word)
                used_ids.add(id(word))
                backtrack(index + 1, path, used_ids)
                path.pop()
                used_ids.remove(id(word))

        backtrack(0, [], set())

    return results


def generate_poem_with_grammar1(self, lines_to_generate: int = 2):
    # lines_to_generate: int = 2, not to be as param
    # first check the self.pattern,
    # chhondo, extracted_pattern = self.determine_chhondo(self.pattern)
    # the sentence will have len(extracted_pattern) words [for now, later i will wrap a sentence in 2-4 lines, for more poetic feel]
    # so make the sentence with the grammar,
    # eg final sentence = <NOUN> <NOUN> <VERB> <ADJ> <NOUN>
    # now we know the matra and chhondo, but as we also have access to POS now, we will look por word.POS and match the resultant sentence
    # this is the only difference from generate_random_poem, that is consideration of the word.POS alongside word.totalMatra.chhondo
    # NOW MAKE IT, CAREFULLY OBSERVE THE generate_random_poem
    # ——————————————————————
    # 1) determine chhondo & pattern
    chhondo, extracted_pattern = self.determine_chhondo(self.pattern)
    L = len(extracted_pattern)

    # 2) define a tiny POS-sequence grammar for child-poem feel
    grammar_rules: Dict[int, List[str]] = {
        2: ["NOUN", "VERB"],
        3: ["NOUN", "ADJ", "NOUN"],
        4: ["ADJ", "NOUN", "VERB", "ADJ"],
        5: ["NOUN", "NOUN", "VERB", "ADJ", "NOUN"],
        # extend as needed...
    }
    if L not in grammar_rules:
        raise Exception(f"No grammar rule for sentence length {L}")

    pos_sequence = grammar_rules[L]

    # 3) load word database
    with open(self.database_path, 'r') as f:
        data = json.load(f)
    words_list = data.get("words") or []
    if not words_list:
        raise Exception("Unable to retrieve json words data")

    # 4) pick one word per slot
    used = set()
    sentence_tokens: List[str] = []

    for _ in range(lines_to_generate):
        for idx, matra in enumerate(extracted_pattern):
            desired_pos = pos_sequence[idx]
            # matra-filtered
            candidates = self.find_valid_words(words_list, chhondo, matra)
            # POS-filtered
            pos_candidates = [w for w in candidates if w.get("pos") == desired_pos]
            pool = pos_candidates or candidates  # fallback if no POS match
            # avoid repetition
            fresh = [w for w in pool if w["word"] not in used] or pool
            if not fresh:
                raise Exception(f"No words for matra={matra}, POS={desired_pos}")
            choice = random.choice(fresh)
            used.add(choice["word"])
            sentence_tokens.append(choice["word"])

    # 5) return the joined sentence
    return " ".join(sentence_tokens)

def generate_poem_with_grammar2(self, lines_to_generate: int = 2) -> List[str]:
    # Build a 4-line poem with AABB rhyme scheme
    ch, pattern = self.determine_chhondo(self.pattern)
    words = self.load_words()

    # Phrase grammar rules
    grammar = {
        'NP': [['PRON'], ['DT','NOUN'], ['ADJ','NOUN']],
        'VP': [['VERB'], ['VERB','NP'], ['VERB','ADV']],
    }
    # number of slots before rhyme = total pattern length -1
    slots_before = len(pattern) - 1

    # Precompute valid NP+VP rule pairs matching slots_before
    valid_pairs = []  # List of (np_rule, vp_rule)
    for np_rule in grammar['NP']:
        np_count = sum(1 for t in np_rule if t not in ['NP','VP'])
        for vp_rule in grammar['VP']:
            vp_count = sum(1 for t in vp_rule if t not in ['NP','VP'])
            if np_count + vp_count == slots_before:
                valid_pairs.append((np_rule, vp_rule))
    if not valid_pairs:
        raise Exception(f"No NP+VP combination fits pattern length {len(pattern)}")

    def make_line(rhyme_pos: str) -> str:
        # choose one NP and VP rule that fit
        np_rule, vp_rule = random.choice(valid_pairs)
        tokens = []
        # generate NP tokens
        for t in np_rule:
            matra = pattern[len(tokens)]
            candidates = self.find_valid(words, ch, matra, pos=t)
            tokens.append(random.choice(candidates)['word'])
        # generate VP tokens
        for t in vp_rule:
            if t in ['NP','VP']:
                continue
            matra = pattern[len(tokens)]
            candidates = self.find_valid(words, ch, matra, pos=t)
            tokens.append(random.choice(candidates)['word'])
        # rhyme slot
        matra = pattern[len(tokens)]
        rhyme_candidates = self.find_valid(words, ch, matra, pos=rhyme_pos)
        tokens.append(random.choice(rhyme_candidates)['word'])
        return ' '.join(tokens)

    # generate four lines: lines 1-2 rhyme with NOUN, 3-4 rhyme with ADJ
    line1 = make_line('NOUN')
    line2 = make_line('NOUN')
    line3 = make_line('ADJ')
    line4 = make_line('ADJ')

    # enforce rhyme by last character match
    def enforce_rhyme(prev: str, current: str, pos: str) -> str:
        end_char = prev.split()[-1][-1]
        last_word = current.split()[-1]
        if last_word.endswith(end_char):
            return current
        # find replacement
        repl = [w for w in words if w['word'].endswith(end_char) and w.get('pos')==pos]
        if repl:
            return ' '.join(current.split()[:-1] + [random.choice(repl)['word']])
        return current

    line2 = enforce_rhyme(line1, line2, 'NOUN')
    line4 = enforce_rhyme(line3, line4, 'ADJ')

    return [line1, line2, line3, line4]
