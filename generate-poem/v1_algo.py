import os
import re
import json
import random
from typing import List, Dict, Tuple, Any

class PoemGenerator:
  def __init__(self, pattern: str = '4|4|2'):
    self.pattern = pattern
    self.database_path = 'database/db/words.json'
    self.words_cache: Dict[int, List[Dict[str, Any]]] = {}  # cache valid words by matra
    self.grammar = {
      # Poem structure
      "Poem":   [["CoupletA", "CoupletB"]],
      "CoupletA": [["LineA1", "LineA2"]],
      "CoupletB": [["LineB1", "LineB2"]],
      # Lines
      "LineA1": [["NP", "VP", "RhymeA"]],
      "LineA2": [["NP", "VP", "RhymeB"]],
      "LineB1": [["NP", "VP", "RhymeA"]],
      "LineB2": [["NP", "VP", "RhymeB"]],
      # Phrases
      "NP":   [["PRON"], ["DT", "NOUN"], ["ADJ", "NOUN"]],
      "VP":   [["VERB"], ["VERB", "NP"], ["VERB", "ADV"]],
      # Rhymes
      "RhymeA": [["NOUN"], ["ADJ"]],
      "RhymeB": [["NOUN"], ["ADJ"]],
      # POS expansions
      "PRON":   [["PRP"], ["WP"]],
      "NOUN":   [["NN"], ["NNS"], ["NNP"], ["NNPS"], ["NPF"]],
      "ADJ":    [["JJ"], ["JJR"], ["JJS"]],
      "VERB":   [["VBD"], ["VBG"], ["VBN"], ["VBP"], ["VBZ"]],
      "ADV":    [["RB"], ["RBR"], ["RBS"]]
    }
    self.fallback_map: Dict[str, List[str]] = {
      # nouns
      "NNPS": ["NNS", "NNP", "NPF", "NN"],
      "NNS":  ["NNPS", "NNP", "NPF", "NN"],
      "NNP":  ["NNPS", "NNS", "NPF", "NN"],
      "NPF":  ["NNPS", "NNS", "NNP", "NN"],
      "NN": ["NNS", "NNP", "NPF", "NNPS"],
      # adjectives
      "JJS":  ["JJR", "JJ"],
      "JJR":  ["JJ", "JJS"],
      "JJ": ["JJR", "JJS"],
      # verbs
      "VBD":  ["VBP", "VBZ", "VBG", "VBN"],
      "VBP":  ["VBZ", "VBD", "VBG", "VBN"],
      "VBZ":  ["VBP", "VBD", "VBG", "VBN"],
      "VBG":  ["VBD", "VBP", "VBZ", "VBN"],
      "VBN":  ["VBD", "VBP", "VBZ", "VBG"],
      # adverbs
      "RBS":  ["RBR", "RB"],
      "RBR":  ["RB", "RBS"],
      "RB": ["RBR", "RBS"],
      # pronouns, determiners, etc: fallback to any POS if needed
    }

  def determine_chhondo(self, pattern) -> Tuple[str, List[int]]:
    if not pattern:
      raise Exception("pattern not found")
    if not re.fullmatch(r'(\d+\|)*\d+', pattern):
      raise Exception("Invalid pattern format. Use <num>|<num>|...|<num> (e.g., 4|4|4|2)")
    extracted_pattern = list(map(int, pattern.split('|')))
    highest_matra = max(extracted_pattern)
    if highest_matra < 2:
      raise Exception("matra should at least be 2")
    if 2 <= highest_matra <= 4:
      chhondo = "স্বরবৃত্ত"
    elif 5 <= highest_matra <= 7:
      chhondo = "মাত্রাবৃত্ত"
    elif 8 <= highest_matra <= 12:
      chhondo = "অক্ষরবৃত্ত"
    else:
      raise Exception("matra at max can be 10")
    return chhondo, extracted_pattern

  def find_valid_words(self, words_list: List[Dict[str, Any]], chhondo: str, matra: int) -> List[Dict[str, Any]]:
    # fetch from cache if available
    if matra in self.words_cache:
      return self.words_cache[matra]
    valid = [w for w in words_list if w['totalMatra'].get(chhondo, 0) == matra]
    self.words_cache[matra] = valid
    return valid

  def get_allowed_splits(self, m: int) -> List[List[int]]:
    match m:
      case 2 | 3:
        return [[m]]
      case 4:
        return [[4], [2, 2]]
        # ---
      case 5:
        return [[5], [2, 3], [1, 4]]
      case 6:
        return [[2, 4], [3, 3]]
      case 7:
        return [[2, 5], [3, 4]]
        # ---
      case 8:
        return [[5, 3], [2, 6], [4, 4]]
      case 9:
        return [[3, 6], [4, 5]]
      case 10:
        return [[3,4,3], [4, 6], [5, 5]]
      case _:
        return [[m]]

  def generate_random_poem(self, lines_to_generate: int = 2, match_last: bool = True) -> List[str]:
    chhondo, extracted_pattern = self.determine_chhondo(self.pattern)
    if not isinstance(lines_to_generate, int):
      raise Exception("Invalid input: stanza count and lines per stanza must be integers")

    # load words once
    with open(self.database_path, 'r') as f:
      data = json.load(f)
    words_list = data.get("words") or []
    if not words_list:
      raise Exception("Unable to retrieve json words data")

    poem:List[str] = []
    is_odd_line = True
    last_word_of_prev_line = ''

    for _ in range(lines_to_generate):
      used_in_line = set()
      line_words: List[str] = []
      for matra in extracted_pattern:
        # get possible splits
        splits = self.get_allowed_splits(matra)
        # choose a split randomly
        split = random.choice(splits)
        # for each piece in split, pick a word
        for idx, piece in enumerate(split):
          candidates = self.find_valid_words(words_list, chhondo, piece)
          # avoid duplicates in same line
          fresh = [w for w in candidates if w['word'] not in used_in_line]
          if not fresh:
            fresh = candidates
          # if match_last for last piece in even line
          if match_last and not is_odd_line and idx == len(split) - 1 and last_word_of_prev_line:
            last_char = last_word_of_prev_line[-1]
            matched = [w for w in fresh if w['word'].endswith(last_char)]
            if matched:
              fresh = matched
          if not fresh:
            raise Exception(f"No words available for matra {piece}")
          choice = random.choice(fresh)
          used_in_line.add(choice['word'])
          line_words.append(choice['word'])
      poem.append(" ".join(line_words))
      is_odd_line = not is_odd_line
      last_word_of_prev_line = line_words[-1]
    return poem

  def generate_grammar(self, no_of_words: int = 5) -> List[str]:
    """
    Generate a sequence of POS tags by expanding the <Poem> grammar.
    # output ["POS1","POS2","POS3"..."POSn"] which directly can be re-written as terminals
    # like NN, PRP or JJ etc
    # final all such non-terminals here:
    # NN,NPF,NNS,NNP,NNPS,CD,JJ,JJR,JJS,PRP,VBD,VBG,VBN,VBP,VBZ,RB,RBR,RBS,IN,DT,CC,MD,UH,EX,FW,TO,WDT,WP,WRB,XX

    Args:
      no_of_words: maximum number of POS tags to return.
    Returns:
      A list of POS tags (e.g. ["DT", "NN", "VBP", ...]) of length <= no_of_words.
    """
    def is_nonterminal(symbol: str) -> bool:
      return symbol in self.grammar

    def expand(symbol: str) -> List[str]:
      # If terminal (POS tag), return it
      if symbol not in self.grammar:
        return [symbol]
      # Choose one of the productions
      production = random.choice(self.grammar[symbol])
      result: List[str] = []
      for sym in production:
        result.extend(expand(sym))
      return result

    # Expand the start symbol
    pos_sequence = expand("Poem")
    # Truncate or return full sequence
    return pos_sequence[:no_of_words]

  def _generate_couplet(self, no_of_words: int = 5) -> List[List[str]]:
    """
    Generate a 4-line couplet structure, each line expanded into POS tags.

    Args:
      no_of_words: approximate maximum number of POS tags per line.
    Returns:
      A list of four lists, each containing POS tags for one line.
    """
    def expand(symbol: str) -> List[str]:
      # Terminal POS-tag reached
      if symbol not in self.grammar:
        return [symbol]
      # Randomly select one production for this non-terminal
      production = random.choice(self.grammar[symbol])
      result: List[str] = []
      for sym in production:
        result.extend(expand(sym))
      return result

    # Define the four line symbols
    lines = ["LineA1", "LineA2", "LineB1", "LineB2"]
    expanded_lines: List[List[str]] = []

    for line_sym in lines:
      tags = expand(line_sym)
      # Truncate to at most no_of_words tags
      expanded_lines.append(tags[:no_of_words])

    return expanded_lines

  def _generate_poem_with_grammar(self, lines_to_generate: int = 2) -> List[str]:
    chhondo, extracted_pattern = self.determine_chhondo('4|4|4|2')

    with open(self.database_path, 'r') as f:
      data = json.load(f)
    words_list = data.get("words") or []
    if not words_list:
      raise Exception("Unable to retrieve json words data")

    matra_four_words = self.find_valid_words(words_list, chhondo, 4)
    matra_two_words = self.find_valid_words(words_list, chhondo, 2)

    poem:List[str] = []
    line:List[str] = []

    couplet_grammar:List[List[str]] = self.generate_couplet(4) # 4 because 4,4,4,2 now, later do 2+2,4,4,4,2
    for line_grammar in couplet_grammar:
      print(line_grammar)
      line = []
      for idx, word_pos in enumerate(line_grammar):
        print(word_pos)
        try:
          if (idx != len(line_grammar)-1):
            random_selected_word = random.choice([word for word in matra_four_words if word['POS'] == word_pos])['word']
          else:
            random_selected_word = random.choice([word for word in matra_two_words if word['POS'] == word_pos])['word']
          line.append(random_selected_word)
        except Exception as e:
          print(e)
          print("matching POS not found")
      poem.append(" ".join(line))

    return poem

  def expand(self, symbol: str) -> List[str]:
    # Terminal POS-tag reached
    if symbol not in self.grammar:
      return [symbol]
    # Randomly select one production for this non-terminal
    production = random.choice(self.grammar[symbol])
    result: List[str] = []
    for sym in production:
      result.extend(self.expand(sym))
    return result

  def generate_couplet(self, no_of_words: int = 5) -> List[List[str]]:
    # Expand each line and truncate
    lines = ["LineA1", "LineA2", "LineB1", "LineB2"]
    return [self.expand(line)[:no_of_words] for line in lines]

  def generate_poem_with_grammar(self, lines_to_generate: int = 2) -> List[str]:
    # Load word list from JSON database
    with open(self.database_path, 'r', encoding='utf-8') as f:
      data = json.load(f)
    words_list = data.get("words", [])
    if not words_list:
      raise Exception("Unable to retrieve words from database")

    # Generate the POS patterns for a single couplet (4 lines)
    couplet_patterns = self.generate_couplet(lines_to_generate)

    used_words = set()
    poem_lines: List[str] = []

    # helper to pick a word with fallback, no duplicates
    def pick_word(desired_pos: str, matra_group: List[Dict[str, Any]]) -> str:
      # try exact matches first
      candidates = [w for w in matra_group if w['POS'] == desired_pos and w['word'] not in used_words]
      # then fallbacks
      for fallback_pos in self.fallback_map.get(desired_pos, []):
        if not candidates:
          candidates = [w for w in matra_group if w['POS'] == fallback_pos and w['word'] not in used_words]
      if not candidates:
        raise Exception(f"No candidates for POS {desired_pos} or fallbacks")
      choice = random.choice(candidates)
      used_words.add(choice['word'])
      return choice['word']

    # For each line pattern, pick words
    for line_pattern in couplet_patterns:
      line_words: List[str] = []
      # decide matra group based on last word's position if needed
      # here using same matra list for all positions
      for pos in line_pattern:
        word = pick_word(pos, words_list)
        line_words.append(word)
      poem_lines.append(" ".join(line_words))

    return poem_lines

# unsure about the length of words, as for higher matra, there can be multiple words
# so total_words != len(extracted_pattern)
# but for smaller matra, its same [upto 3] & almost same for matra == 4
# so i'll use a fixed pattern for this,
# it will be 4(2+2)|4|4|2 pattern so 5 words in each line
# so have to expand the grammar to 5 words



if __name__ == "__main__":
  pattern = "4|4|4|2"
  lines_to_generate = 2
  match_last = True
  pg = PoemGenerator(pattern)
  out_dir = os.path.join(os.getcwd(), 'generate-poem')

  '''
  op_file = os.path.join(out_dir, 'poem-op.txt')
  poem = pg.generate_random_poem(lines_to_generate, match_last)
  with open(op_file, 'a', encoding='utf-8') as f:
    f.write(f"\n{pattern} \n----------\n")
    for line in poem:
      f.write(f"{"".join(line)}\n")
    f.write('\n')

  # ---- with grammar
  op_file = os.path.join(out_dir, 'output.txt')

  with open(op_file, 'a', encoding='utf-8') as f:
    f.write(f"\n{pattern} \n----------\n")
    f.write(f"{"".join(pg.generate_poem_with_grammar())}\n")
    f.write('\n')

  poem = pg.generate_poem_with_grammar()
  with open(op_file, 'a', encoding='utf-8') as f:
    f.write(f"\n{pattern} \n----------\n")
    for line in poem:
      f.write(f"{"".join(line)}\n")
    f.write('\n')

  '''

  poem = pg.generate_poem_with_grammar()

  op_file = os.path.join(out_dir, 'output.txt')
  with open(op_file, 'a', encoding='utf-8') as f:
    f.write(f"\n{'4|4|4|2 : fixed'} \n----------\n")
    for line in poem:
      print(line)
      f.write(f"{line}\n")
    f.write('\n')

# matra   s-b   m-b   a-b
# 1   : 1380  920   668
# 2   : 9231  1943  5235
# 3   : 7267  4690  8822
# 4   : 3170  5237  5095
# 5   : 817   4145  1712
# 6   : 189   2359  470
# 7   : 59    1644  94
# 8   : 14    806   32
# 9   : 10    394   10
# 10  : 2   222   6
# 11  : 1   88    1
# 12  : 2   40    2
# 13  : 0   33    1
# 14  : 0   10    0
# 15  : 0   7   0
# 16  : 0   6   1
# 17  : 0   5   0
