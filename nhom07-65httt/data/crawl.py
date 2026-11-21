"""Collect the public khoahocre.com course catalog as JSON and Excel-friendly CSV."""
import argparse
import csv
import hashlib
import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, urljoin, urlparse
from urllib.robotparser import RobotFileParser

import requests
from bs4 import BeautifulSoup

BASE = 'https://khoahocre.com'
SHOP = BASE + '/shop-khoa-hoc'
AGENT = 'CourseCatalogCrawler/1.0'


def text(node):
    return node.get_text(' ', strip=True) if node else ''


def money(node):
    value = text(node)
    digits = re.sub(r'\D', '', value)
    if digits:
        return int(digits)
    return 0 if value.lower() in ('free', 'miễn phí') else None


def parse_catalog(html):
    soup = BeautifulSoup(html, 'html.parser')
    courses = []
    for card in soup.select('.thim-ekits-course__item'):
        title = card.select_one('.elementor-widget-thim-loop-item-title a')
        if not title or '/khoa-hoc/' not in title.get('href', ''):
            continue
        img = card.select_one('img')
        categories = card.select('a.loop-item-term')
        courses.append({
            'id': next((int(c[5:]) for c in card.get('class', []) if re.fullmatch(r'post-\d+', c)), None),
            'title': text(title),
            'url': urljoin(BASE, title['href']),
            'price_vnd': money(card.select_one('.course-item-price .price, .course-item-price .free')),
            'original_price_vnd': money(card.select_one('.origin-price')),
            'categories': list(dict.fromkeys(text(c) for c in categories)),
            'category_slugs': [c[len('course_category-'):] for c in card.get('class', []) if c.startswith('course_category-')],
            'image_url': urljoin(BASE, img.get('data-src') or img.get('src', '')) if img else '',
        })
    pages = {1}
    for a in soup.select('a[href]'):
        u = urlparse(urljoin(BASE, a['href']))
        if u.netloc != urlparse(BASE).netloc or not u.path.startswith('/shop-khoa-hoc'):
            continue
        query = parse_qs(u.query)
        if set(query) - {'paged'}:
            continue
        number = query.get('paged', [''])[0]
        match = re.search(r'/page/(\d+)/?', u.path)
        if number.isdigit():
            pages.add(int(number))
        elif match:
            pages.add(int(match[1]))
    return courses, max(pages)


class Client:
    def __init__(self, output, delay, refresh):
        self.session = requests.Session()
        self.session.headers['User-Agent'] = AGENT
        self.cache = output / 'cache'
        self.cache.mkdir(parents=True, exist_ok=True)
        self.delay = delay
        self.refresh = refresh
        self.last = 0
        self.robot = None
        robot = RobotFileParser()
        robot.parse(self.get(BASE + '/robots.txt', cache=False).splitlines())
        self.robot = robot
        self.delay = max(delay, robot.crawl_delay(AGENT) or 0)

    def get(self, url, cache=True):
        if urlparse(url).netloc != urlparse(BASE).netloc:
            raise ValueError('Only khoahocre.com URLs are allowed')
        if self.robot and not self.robot.can_fetch(AGENT, url):
            raise RuntimeError('robots.txt disallows ' + url)
        path = self.cache / (hashlib.sha256(url.encode()).hexdigest() + '.html')
        if cache and not self.refresh and path.exists():
            return path.read_text(encoding='utf-8')
        for attempt in range(4):
            time.sleep(max(0, self.delay - (time.monotonic() - self.last)))
            self.last = time.monotonic()
            try:
                r = self.session.get(url, timeout=45)
                if urlparse(r.url).netloc != urlparse(BASE).netloc:
                    raise RuntimeError('Unexpected redirect: ' + r.url)
                r.raise_for_status()
                r.encoding = 'utf-8'
                if cache:
                    path.write_text(r.text, encoding='utf-8')
                return r.text
            except requests.RequestException as error:
                status = error.response.status_code if error.response is not None else None
                if attempt == 3 or (status and status < 500 and status != 429):
                    raise
                time.sleep(2 ** (attempt + 1))


def save(output, rows, report):
    output.mkdir(parents=True, exist_ok=True)
    (output / 'courses.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
    if rows:
        fields = list(dict.fromkeys(k for row in rows for k in row))
        with (output / 'courses.csv').open('w', encoding='utf-8-sig', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            for row in rows:
                values = {k: ' | '.join(v) if isinstance(v, list) else v for k, v in row.items()}
                # Prevent untrusted page text becoming spreadsheet formulas.
                writer.writerow({k: "'" + v if isinstance(v, str) and v.startswith(('=', '+', '-', '@', '\t', '\r')) else v for k, v in values.items()})
    (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=Path('data'))
    parser.add_argument('--max-pages', type=int, default=0, help='0 = all pages')
    parser.add_argument('--delay', type=float, default=1.5)
    parser.add_argument('--refresh', action='store_true', help='Ignore saved HTML cache')
    parser.add_argument('--details', action='store_true', help='Add public SEO description and publication dates')
    args = parser.parse_args()
    if args.delay < 0 or args.max_pages < 0:
        parser.error('delay and max-pages must be nonnegative')
    rows = {}
    report = {'source': SHOP, 'started_at': datetime.now(timezone.utc).isoformat(), 'pages_crawled': 0, 'complete': False, 'errors': []}
    try:
        client = Client(args.output, args.delay, args.refresh)
        page, total = 1, 1
        while page <= total and (not args.max_pages or page <= args.max_pages):
            html = client.get(SHOP if page == 1 else SHOP + '?paged=' + str(page))
            items, discovered = parse_catalog(html)
            total = max(total, discovered)
            if not items:
                raise RuntimeError(f'Page {page} has no courses; HTML structure may have changed')
            new = [r for r in items if r['url'] not in rows]
            if not new:
                raise RuntimeError(f'Page {page} repeats previous courses; pagination needs inspection')
            for row in new:
                row['crawled_at'] = datetime.now(timezone.utc).isoformat()
                rows[row['url']] = row
            report.update(pages_crawled=page, pages_discovered=total, course_count=len(rows))
            save(args.output, list(rows.values()), report)
            print(f'Page {page}/{total}: {len(items)} courses, {len(rows)} unique', flush=True)
            page += 1
        if args.details:
            for index, row in enumerate(rows.values(), 1):
                try:
                    soup = BeautifulSoup(client.get(row['url']), 'html.parser')
                    title = soup.select_one('h1')
                    if not title:
                        raise RuntimeError('Detail page missing h1')
                    meta = soup.select_one('meta[name="description"]')
                    row['description'] = meta.get('content', '') if meta else ''
                    for script in soup.select('script[type="application/ld+json"]'):
                        try:
                            obj = json.loads(script.get_text())
                        except (ValueError, TypeError):
                            continue
                        if isinstance(obj, dict):
                            for node in obj.get('@graph', [obj]):
                                if node.get('@type') == 'WebPage':
                                    row['date_published'] = node.get('datePublished', '')
                                    row['date_modified'] = node.get('dateModified', '')
                    print(f'Detail {index}/{len(rows)}', flush=True)
                except Exception as error:
                    report['errors'].append({'url': row['url'], 'error': str(error)})
                save(args.output, list(rows.values()), report)
        report['complete'] = report['pages_crawled'] == total and not report['errors']
    except (Exception, KeyboardInterrupt) as error:
        report['errors'].append({'error': str(error) or 'Interrupted'})
        print(f'Incomplete crawl: {error}', flush=True)
    finally:
        report['finished_at'] = datetime.now(timezone.utc).isoformat()
        save(args.output, list(rows.values()), report)
    return 1 if report['errors'] else 0


if __name__ == '__main__':
    raise SystemExit(main())
