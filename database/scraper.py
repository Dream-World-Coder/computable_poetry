from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup, NavigableString
import time, os

BASE_URL  = "https://www.bangla-kobita.com"
CATEGORY  = "prokritir-kobita"
PAGE_RANGE  = range(1, 5)
OUTPUT_FILE = os.path.join(os.getcwd(), "database", "passage_nature.txt")

# ── Selenium setup ─────────────────────────────────────────────────────────────
opts = Options()
opts.add_argument("--headless")
opts.add_argument("--disable-gpu")
opts.add_argument("--no-sandbox")
driver = webdriver.Chrome(
  service=Service(ChromeDriverManager().install()),
  options=opts
)

# ── Helpers ────────────────────────────────────────────────────────────────────
def make_soup(url, wait=2):
  driver.get(url)
  time.sleep(wait)
  return BeautifulSoup(driver.page_source, "html.parser")

def get_poem_links(soup):
  """
  Listing page structure:
    table.post-list > tbody > tr
    td > div.row
      div.col-sm-6      ← poem title + link  (first)
      div.col-sm-6.author-name  ← poet name link (second)
  """
  results = []
  for row in soup.select("table.post-list tbody tr"):
    # skip header row and ad-placeholder rows
    title_cell = row.select_one("div.col-sm-6:not(.author-name) a")
    poet_cell  = row.select_one("div.author-name a")
    if not title_cell:
      continue
    title   = title_cell.get_text(strip=True)
    poet_name = poet_cell.get_text(strip=True) if poet_cell else "unknown"
    href    = title_cell.get("href", "")
    url     = href if href.startswith("http") else BASE_URL + href
    results.append((title, poet_name, url))
  return results

def get_poem_text(soup):
  """
  Poem content lives in:  div[itemprop="text"].post-content
  <br> tags are line breaks; strip surrounding whitespace per line.
  """
  content_div = soup.find("div", itemprop="text", class_="post-content")
  if not content_div:
    return None

  lines = []
  for node in content_div.children:
    if isinstance(node, NavigableString):
      txt = node.strip()
      if txt:
        lines.append(txt)
    elif node.name == "br":
      lines.append("\n")
    else:
      txt = node.get_text(separator="\n").strip()
      if txt:
        lines.append(txt)

  # collapse runs of blank lines to a single blank line
  text = "".join(lines)
  import re
  text = re.sub(r'\n{3,}', '\n\n', text).strip()
  return text or None

# ── Main scrape ────────────────────────────────────────────────────────────────
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

with open(OUTPUT_FILE, "a", encoding="utf-8") as fout:
  for page in PAGE_RANGE:
    url = f"{BASE_URL}/{CATEGORY}/?p={page}"
    print(f"\n── Page {page}: {url}")
    soup  = make_soup(url)
    links = get_poem_links(soup)

    if not links:
      print("  No links found.")
      continue

    print(f"  Found {len(links)} poems")

    for title, poet_name, poem_url in links:
      print(f"  → {poet_name} — {title}")
      poem_soup = make_soup(poem_url)
      text = get_poem_text(poem_soup)
      if not text:
        print("    (no content)")
        continue
      fout.write(f"=== {poet_name} — {title} ===\n")
      fout.write(text + "\n\n")
      time.sleep(1)

driver.quit()
print(f"\nDone. Output: {OUTPUT_FILE}")
