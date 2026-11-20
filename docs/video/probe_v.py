from playwright.sync_api import sync_playwright
from PIL import Image
B="http://localhost:8077/"
pages=["browse.html?q=calculus","gig.html?id=13","messages.html","order.html?gig=13&pkg=Standard","profile.html","post-gig.html","pricing.html","index.html"]
with sync_playwright() as p:
    b=p.chromium.launch()
    c=b.new_context(viewport={"width":720,"height":1280},device_scale_factor=1.5)
    pg=c.new_page(); pg.goto(B+"signin.html"); pg.click("[data-demo=buyer]"); pg.click("#signin-form button[type=submit]"); pg.wait_for_timeout(1000)
    print(pg.url)
    ims=[]
    for i,u in enumerate(pages):
        pg.goto(B+u); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(500)
        pg.screenshot(path=f"/tmp/v{i}.png"); ims.append(Image.open(f"/tmp/v{i}.png").convert("RGB").resize((360,640)))
    s=Image.new("RGB",(360*4,640*2))
    for i,im in enumerate(ims): s.paste(im,((i%4)*360,(i//4)*640))
    s.save("clips/vert_probe.png"); print(Image.open("/tmp/v0.png").size)
    b.close()
