import sys, subprocess
from PIL import Image
src=sys.argv[1]; out=sys.argv[2]; ts=sys.argv[3:]
cols=4; w,h=480,270; rows=(len(ts)+cols-1)//cols
s=Image.new("RGB",(cols*w,rows*h))
for i,t in enumerate(ts):
    subprocess.run(["ffmpeg","-y","-loglevel","error","-ss",t,"-i",src,"-frames:v","1","-vf",f"scale={w}:{h}","/tmp/_f.png"],check=True)
    s.paste(Image.open("/tmp/_f.png").convert("RGB"),((i%cols)*w,(i//cols)*h))
s.save(out)
