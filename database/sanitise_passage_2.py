import os, re

def clean_and_rewrite_file(filename: str):
  with open(filename, "r", encoding="utf-8") as f:
    text = f.read()

  # drop header lines (=== ... ===)
  text = re.sub(r"===.*?===\n?", "", text)

  # keep only Bengali Unicode block + whitespace
  text = re.sub(r"[^\u0980-\u09FF\s]", "", text)

  words = text.split()
  unique_words = list(dict.fromkeys(words))

  with open(filename, "w", encoding="utf-8") as f:
    f.write(" ".join(unique_words))

  print(f"Lexicon size: {len(unique_words)} unique words")

if __name__ == "__main__":
  file = os.path.join(os.getcwd(), "database", "passage_prakriti.txt")
  clean_and_rewrite_file(file)
