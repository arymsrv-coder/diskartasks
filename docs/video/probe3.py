from playwright.sync_api import sync_playwright
B="http://localhost:8077/"; W={"width":1920,"height":1080}
with sync_playwright() as p:
    b=p.chromium.launch(); c=b.new_context(viewport=W); pg=c.new_page()
    pg.goto(B+"signin.html"); pg.click("[data-demo=buyer]"); pg.wait_for_timeout(300)
    print("email val:", pg.input_value("#email"))
    pg.click("#signin-form button[type=submit]"); pg.wait_for_timeout(1500)
    print(pg.url); print("err:", pg.evaluate("document.querySelector('#auth-error')&&document.querySelector('#auth-error').textContent"))
    print(pg.evaluate("JSON.stringify([Object.keys(localStorage),Object.keys(sessionStorage)])"))
    print(pg.evaluate("document.querySelector('header').innerText.replace(/\\n/g,' | ')"))
    pg.goto(B+"messages.html"); pg.wait_for_timeout(1000); print(pg.url)
    print(pg.evaluate("JSON.stringify([Object.keys(localStorage),Object.keys(sessionStorage)])"))
    c.close(); b.close()
