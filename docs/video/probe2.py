from playwright.sync_api import sync_playwright
B="http://localhost:8077/"; W={"width":1920,"height":1080}
with sync_playwright() as p:
    b=p.chromium.launch(); c=b.new_context(viewport=W); pg=c.new_page()
    pg.on("pageerror",lambda e:print("ERR",e))
    pg.goto(B+"signin.html"); pg.click("[data-demo=buyer]"); pg.click("button[type=submit]"); pg.wait_for_timeout(1000)
    for u in ["messages.html","profile.html","order.html?gig=13&pkg=Standard"]:
        pg.goto(B+u); pg.wait_for_timeout(1200); print(u,"->",pg.url, "|", pg.inner_text("main")[:260].replace("\n"," / "))
    pg.goto(B+"messages.html"); pg.wait_for_timeout(800)
    print(pg.evaluate("document.querySelector('#main').innerHTML.slice(0,1800)"))
    c.close(); b.close()
