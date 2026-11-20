import time, json
from playwright.sync_api import sync_playwright
B="http://localhost:8077/"
W={"width":1920,"height":1080}
res={}
with sync_playwright() as p:
    b=p.chromium.launch()
    # login (not recorded)
    c0=b.new_context(viewport=W); pg=c0.new_page()
    pg.goto(B+"signin.html"); pg.click("[data-demo=buyer]"); pg.wait_for_timeout(300)
    pg.click("#signin-form button[type=submit]"); pg.wait_for_timeout(1200)
    print("after login:", pg.url)
    state=c0.storage_state(); c0.close()

    # hook
    t_page=time.monotonic()
    c=b.new_context(viewport=W, record_video_dir="clips/rough", record_video_size=W)
    pg=c.new_page()
    pg.goto(B+"docs/video/mograph/hook.html"); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(600)
    tb=time.monotonic(); pg.evaluate("window.begin()")
    res["hook_offset"]=tb-t_page
    pg.wait_for_timeout(59500)
    c.close()

    # home
    t_page=time.monotonic()
    c=b.new_context(viewport=W, storage_state=state, record_video_dir="clips/rough", record_video_size=W)
    pg=c.new_page()
    pg.goto(B+"index.html"); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(800)
    tb=time.monotonic(); res["home_offset"]=tb-t_page
    pg.add_style_tag(content=".hl{outline:6px solid #f4b942!important;outline-offset:6px;border-radius:16px;transform:scale(1.04);transition:all .2s;position:relative;z-index:5}")
    pg.wait_for_timeout(2000)   # hero hold
    # smooth scroll to categories
    pg.evaluate("document.querySelector('#categories').scrollIntoView({behavior:'smooth',block:'center'})")
    pg.wait_for_timeout(4000)   # now ~ +6s
    n=pg.evaluate("document.querySelector('#categories').children.length"); print("tiles",n)
    cues=[9.9,11.1,13.1,15.1,16.4]  # rel to 59.4 minus 0 -> abs 69.4,70.5,72.5,74.5,75.8 → 10.0,11.1,13.1,15.1,16.4
    t_start=time.monotonic()-6.0
    for i,cu in enumerate([10.0,11.1,13.1,15.1,16.4]):
        wait=cu-(time.monotonic()-t_start)
        if wait>0: pg.wait_for_timeout(int(wait*1000))
        pg.evaluate("i=>{document.querySelectorAll('#categories .hl').forEach(e=>e.classList.remove('hl'));const el=document.querySelector('#categories').children[i];if(el)el.classList.add('hl')}", i)
    pg.wait_for_timeout(1700)
    c.close(); b.close()
json.dump(res,open("clips/rough/offsets.json","w")); print(res)
