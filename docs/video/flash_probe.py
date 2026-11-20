import subprocess, sys, numpy as np, json
def spikes(path, fps=30):
    raw = subprocess.run(["ffmpeg","-v","error","-i",path,"-vf",f"fps={fps},scale=64:36,format=gray","-f","rawvideo","-"],capture_output=True).stdout
    a = np.frombuffer(raw, np.uint8).reshape(-1, 36*64).mean(1)
    d = np.diff(a); idx = np.where(d > 40)[0]
    return [round((i+1)/fps,2) for i in idx], len(a)/fps
if __name__ == "__main__":
    for p in sys.argv[1:]:
        print(p, spikes(p))
