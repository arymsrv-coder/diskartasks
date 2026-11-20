"""9:16 recordings: the real site in its mobile layout (720x1280 viewport at 1.5x -> 1080x1920) and vertical mograph.
Usage: rec_vert.py [seg ...]"""
import json, os, sys, time
from playwright.sync_api import sync_playwright
import rec_full as R

OUT = "clips/vert"; os.makedirs(OUT, exist_ok=True)
R.OUT = OUT
VW = {"width": 720, "height": 1280}
MW = {"width": 1080, "height": 1920}
R.STYLE = R.STYLE.replace("top:92px", "top:78px").replace("font:700 40px", "font:700 30px").replace("padding:12px 34px", "padding:8px 26px")
R.INIT = R.INIT.split("%r")[0] if False else R.INIT  # INIT already formatted with the 16:9 label style; rebuild below
R.INIT = """
document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=%r;document.head.appendChild(s);
const l=document.createElement('div');l.id='cg-label';document.body.appendChild(l);});
""" % R.STYLE

class VSeg(R.Seg):
    def __init__(self, browser, name, start, end, state=None, mograph=False):
        self.name, self.len = name, end - start
        size = MW if mograph else VW
        kw = dict(viewport=size, record_video_dir=OUT, record_video_size=MW)
        if not mograph: kw["device_scale_factor"] = 1.5
        if state: kw["storage_state"] = state
        self.t_page = time.monotonic()
        self.ctx = browser.new_context(**kw)
        self.ctx.add_init_script(R.INIT)
        self.pg = self.ctx.new_page(); self.t0 = None
R.Seg = VSeg
offsets = {}
_begin = VSeg.begin
def begin(self): _begin(self); offsets[self.name] = R.offsets[self.name]
VSeg.begin = begin

def mograph(b, name, page, seg, start, end):
    s = VSeg(b, name, start, end, mograph=True)
    s.go(f"docs/video/mograph/{page}?v=1" + (f"&seg={seg}" if seg else ""))
    s.pg.evaluate("document.fonts.ready"); s.pg.wait_for_timeout(500)
    s.begin(); s.pg.evaluate("window.begin()"); s.finish()

def home(b, buyer):
    s = VSeg(b, "home", 59.4, 77.1, buyer); pg = s.pg
    s.go("index.html"); pg.wait_for_timeout(500)
    s.begin()
    s.at(2.0); s.scroll_to("#categories", "start")
    for i, cu in enumerate([10.0, 11.1, 13.1, 15.1, 16.4]):
        s.at(cu); s.hl("#categories > *", i)
    s.finish()

def buyer_seg(b, buyer):
    s = VSeg(b, "buyer", 77.1, 142.6, buyer); pg = s.pg
    s.go("browse.html"); pg.wait_for_timeout(400)
    s.begin()
    s.at(0.4); s.hl("#q"); s.label("Search")
    s.at(1.4); pg.click("#q"); pg.type("#q", "calculus", delay=170)
    s.at(3.3); s.label("Top Rated"); s.hl("#sort"); pg.select_option("#sort", "top")
    s.at(5.0); s.label("Price: Low to High"); pg.select_option("#sort", "low")
    s.at(9.3); s.go("gig.html?id=13")
    s.at(11.0); s.hl("#seller-strip"); s.label("SLSU verified student")
    s.at(17.0); s.scroll_to("#pkg-tabs", "center"); s.hl("#pkg-tabs"); s.label("Basic · Standard · Pro")
    s.at(18.6); pg.click("[data-pkg=Standard]")
    s.at(20.2); pg.click("[data-pkg=Pro]")
    s.at(23.9); s.go("seller.html?u=ken_c")
    s.at(25.5); s.scroll_to("#portfolio", "start"); s.hl("#portfolio-grid"); s.label("Portfolio")
    s.at(29.1); s.go("gig.html?id=13")
    s.at(29.6); s.scroll_to("#pkg-panel", "center"); s.hl("#pkg-panel"); s.label("Araw ng paggawa")
    s.at(30.8); s.scroll_to("#reviews", "start"); s.hl("#review-list"); s.label("Tapat na reviews")
    s.at(32.6); pg.evaluate("window.scrollTo({top:0,behavior:'smooth'})")
    s.at(34.3); s.go("messages.html"); pg.click(".convo[data-id=c1]")
    s.at(35.2); s.label("Kausapin ang Pay-Yuyan")
    s.at(36.6); pg.click("#draft"); pg.type("#draft", "Hello po! Free ba kayo bukas para sa Calculus?", delay=55)
    s.at(39.7); pg.click("#send")
    s.at(40.2); s.go("order.html?gig=13&pkg=Standard")
    s.at(41.4); s.label("Mag-order sa ilang pindot"); s.scroll_to("#date", "center"); pg.fill("#date", "2026-11-20")
    s.at(42.4); pg.fill("#time", "14:00")
    s.at(43.0); pg.click("#notes"); pg.type("#notes", "Tulong sa Calculus po", delay=40)
    s.at(44.8); pg.click("#place")
    s.at(45.5); s.go("profile.html")
    s.at(46.4); s.scroll_to("#orders-title", "start"); s.hl(".order-row", 0); s.label("Subaybayan ang order")
    s.at(49.0); s.hl(".pill--progress", 0)
    s.at(50.6); s.hl(".pill--done", 0)
    s.at(51.9); s.go("order.html?gig=13&pkg=Standard")
    s.at(52.6); s.scroll_to(".payment-box", "center"); s.hl(".payment-box"); s.label("Bayad sa meet-up · walang card", 6000)
    s.at(60.0); s.go("profile.html")
    s.at(60.8); pg.click("[data-review]")
    s.at(61.6); pg.click("label[for=rs5]")
    s.at(62.2); pg.type("#rv-text", "Mabilis at malinaw magturo!", delay=45)
    s.at(64.8); pg.click("#rv-submit")
    s.finish()

def seller_seg(b, seller):
    s = VSeg(b, "seller", 151.2, 176.4, seller); pg = s.pg
    s.go("post-gig.html"); pg.wait_for_timeout(400)
    s.begin()
    s.at(0.4); s.label("Mag-post ng gig"); s.hl("#f-title")
    s.at(0.8); pg.click("#title"); pg.type("#title", "Poster at Social Media Design para sa Org", delay=70)
    s.at(4.2); s.hl("#f-category"); pg.click("#category-chips [data-cat=design]")
    s.at(5.2); s.hl("#f-description"); pg.click("#description"); pg.type("#description", "Malinis na poster at post designs para sa org o event mo.", delay=22)
    s.at(7.6); s.hl("#skill-input"); s.label("Mga kasanayan"); pg.click("#skill-input"); pg.type("#skill-input", "Canva", delay=60); pg.keyboard.press("Enter"); pg.type("#skill-input", "Photoshop", delay=60); pg.keyboard.press("Enter")
    s.at(9.6); s.hl("#f-packages"); s.scroll_to("#f-packages", "start"); s.label("Hanggang 3 packages")
    s.at(10.2); pg.fill("#p-Basic-price", "300")
    s.at(12.2); pg.click("[data-add-tier=Standard]"); pg.wait_for_timeout(200); pg.fill("#p-Standard-price", "500")
    s.at(13.4); pg.click("[data-add-tier=Pro]"); pg.wait_for_timeout(200); pg.fill("#p-Pro-price", "800")
    s.at(14.6); pg.evaluate("window.scrollTo({top:0,behavior:'smooth'})")
    s.at(15.4); s.hl("#preview"); s.label("Live preview", 6000)
    s.at(15.6); pg.click("#title"); pg.keyboard.press("Meta+A"); pg.type("#title", "Logo, Poster at Social Media Design", delay=110)
    s.at(21.8); s.label("Walang hulaan. Kitang-kita mo na.", 3500)
    s.finish()

def pricing_seg(b):
    s = VSeg(b, "pricing", 210.2, 231.4); pg = s.pg
    s.go("pricing.html"); pg.wait_for_timeout(300)
    s.begin()
    s.at(0.2); pg.evaluate("document.querySelectorAll('.plan-card')[0].scrollIntoView({behavior:'smooth',block:'center'})")
    s.at(1.5); s.hl(".plan-card", 0); s.label("Basic · Libre")
    s.at(6.7); s.scroll_to(".plan-card >> nth=1", "start") if False else pg.evaluate("document.querySelectorAll('.plan-card')[1].scrollIntoView({behavior:'smooth',block:'center'})"); s.hl(".plan-card", 1); s.label("Campus Plus · ₱99 / buwan")
    s.at(13.6); pg.evaluate("window.scrollTo({top:0,behavior:'smooth'})"); pg.click("[data-audience=sellers]"); pg.wait_for_timeout(500)
    pg.evaluate("document.querySelectorAll('.plan-card')[1].scrollIntoView({behavior:'smooth',block:'center'})"); s.hl(".plan-card", 1); s.label("Pro Seller · ₱149 / buwan · 0% fee", 6000)
    s.finish()

if __name__ == "__main__":
    want = sys.argv[1:] or ["hook", "home", "buyer", "M1", "seller", "M2", "pricing", "M3"]
    with sync_playwright() as p:
        b = p.chromium.launch()
        def login(who):
            c = b.new_context(viewport=VW); pg = c.new_page(); pg.goto(R.B + "signin.html")
            pg.click(f"[data-demo={who}]"); pg.click("#signin-form button[type=submit]"); pg.wait_for_timeout(1200)
            assert "signin" not in pg.url; st = c.storage_state(); c.close(); return st
        buyer = login("buyer") if {"home", "buyer"} & set(want) else None
        seller = login("seller") if "seller" in want else None
        for name in want:
            before = set(os.listdir(OUT))
            if name == "hook": mograph(b, "hook", "hook.html", None, 0, 59.4)
            elif name == "home": home(b, buyer)
            elif name == "buyer": buyer_seg(b, buyer)
            elif name == "seller": seller_seg(b, seller)
            elif name == "pricing": pricing_seg(b)
            elif name == "M1": mograph(b, "M1", "acts.html", "M1", 142.6, 151.2)
            elif name == "M2": mograph(b, "M2", "acts.html", "M2", 176.4, 210.2)
            elif name == "M3": mograph(b, "M3", "acts.html", "M3", 231.4, 264.9)
            new = [f for f in os.listdir(OUT) if f.endswith(".webm") and f not in before]
            if new: os.replace(f"{OUT}/{new[0]}", f"{OUT}/{name}.webm")
            old = json.load(open(f"{OUT}/offsets.json")) if os.path.exists(f"{OUT}/offsets.json") else {}
            old[name] = offsets[name]; json.dump(old, open(f"{OUT}/offsets.json", "w"))
            print(name, "done", round(offsets[name], 2), flush=True)
        b.close()
