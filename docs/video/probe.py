from playwright.sync_api import sync_playwright
B="http://localhost:8077/"; W={"width":1920,"height":1080}
def pr(pg,sel,n=400):
    try: print(sel,"=>",pg.eval_on_selector(sel,"e=>e.outerHTML")[:n].replace("\n"," "))
    except Exception as ex: print(sel,"MISSING")
with sync_playwright() as p:
    b=p.chromium.launch(); c=b.new_context(viewport=W); pg=c.new_page()
    pg.goto(B+"signin.html"); pg.click("[data-demo=buyer]"); pg.click("#signin-form button[type=submit]"); pg.wait_for_timeout(1000)
    pg.goto(B+"browse.html"); pg.wait_for_timeout(500)
    pr(pg,"#main input[type=search]"); print(pg.eval_on_selector_all("input","els=>els.map(e=>e.id+'|'+e.type+'|'+e.placeholder)"))
    pg.goto(B+"gig.html?id=13"); pg.wait_for_timeout(600)
    for s in ["#seller-strip","#pkg-tabs","#pkg-cta","#gig-sticky"]: pr(pg,s,600)
    pg.goto(B+"seller.html?u=ken_c"); pg.wait_for_timeout(600)
    for s in ["#tabbar","#p-actions"]: pr(pg,s,600)
    pg.goto(B+"messages.html"); pg.wait_for_timeout(600)
    pr(pg,"#convo-list",500); pr(pg,"#composer",500)
    pg.goto(B+"profile.html"); pg.wait_for_timeout(600)
    pr(pg,"#tabbar",500); pr(pg,"#order-list",900)
    pg.goto(B+"order.html?gig=13&pkg=Standard"); pg.wait_for_timeout(600)
    pr(pg,"#date",200); pr(pg,"#time",200); pr(pg,"#place",300)
    c.close(); b.close()
