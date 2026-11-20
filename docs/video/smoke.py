import time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width":1920,"height":1080}, record_video_dir="clips/_smoke", record_video_size={"width":1920,"height":1080})
    pg = ctx.new_page()
    pg.goto("http://localhost:8077/signin.html"); pg.wait_for_timeout(800)
    pg.click("[data-demo=buyer]"); pg.wait_for_timeout(500)
    print(pg.inner_text("body")[:200].replace("\n"," | "))
    pg.screenshot(path="clips/_smoke/signin.png")
    pg.goto("http://localhost:8077/browse.html"); pg.wait_for_timeout(600)
    pg.locator("input[type=search], #q, input[name=q]").first.type("calculus", delay=90); pg.wait_for_timeout(1200)
    pg.screenshot(path="clips/_smoke/browse.png")
    ctx.close(); b.close()
