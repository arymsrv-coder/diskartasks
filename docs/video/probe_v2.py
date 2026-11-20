from playwright.sync_api import sync_playwright
from PIL import Image
B="http://localhost:8077/"
with sync_playwright() as p:
    b=p.chromium.launch()
    c=b.new_context(viewport={"width":720,"height":1280},device_scale_factor=1.5)
    pg=c.new_page(); pg.goto(B+"signin.html"); pg.click("[data-demo=seller]"); pg.click("#signin-form button[type=submit]"); pg.wait_for_timeout(1000)
    pg.goto(B+"post-gig.html"); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(500)
    pg.fill("#title","Poster at Social Media Design"); pg.click("#category-chips [data-cat=design]"); pg.wait_for_timeout(300)
    h=pg.evaluate("document.documentElement.scrollHeight"); print("page height",h)
    print(pg.evaluate("(()=>{const r=document.querySelector('#preview').getBoundingClientRect();const f=document.querySelector('#gig-form').getBoundingClientRect();return [r.top+scrollY,r.height,f.top+scrollY,f.height, getComputedStyle(document.querySelector('.postgig-preview')).position]})()"))
    pg.screenshot(path="/tmp/s0.png")
    pg.evaluate("document.querySelector('#preview').scrollIntoView({block:'center'})"); pg.wait_for_timeout(400); pg.screenshot(path="/tmp/s1.png")
    pg.goto(B+"pricing.html"); pg.wait_for_load_state("networkidle")
    print(pg.evaluate("document.querySelector('#audience').outerHTML.slice(0,500)"))
    pg.goto(B+"messages.html"); pg.wait_for_load_state("networkidle"); pg.click(".convo[data-id=c1]"); pg.wait_for_timeout(500); pg.screenshot(path="/tmp/s2.png")
    s=Image.new("RGB",(360*3,640))
    for i in range(3): s.paste(Image.open(f"/tmp/s{i}.png").convert("RGB").resize((360,640)),(i*360,0))
    s.save("clips/vert_probe2.png")
    b.close()
