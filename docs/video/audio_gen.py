"""Synthesise a music bed and sound effects (all generated here, no downloaded audio). Writes music.wav, sfx.wav."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter
SR = 44100; DUR = 264.9; N = int(SR * DUR)
rng = np.random.default_rng(7)
def tarr(): return np.arange(N) / SR
def bp(x, lo, hi): b, a = butter(2, [lo/(SR/2), hi/(SR/2)], 'band'); return lfilter(b, a, x)
def lp(x, f): b, a = butter(2, f/(SR/2), 'low'); return lfilter(b, a, x)
def hp(x, f): b, a = butter(2, f/(SR/2), 'high'); return lfilter(b, a, x)
def add(buf, t, sig, gain=1.0):
    i = int(t * SR); j = min(N, i + len(sig))
    if i < N: buf[i:j] += gain * sig[:j - i]
def env_exp(n, decay): return np.exp(-np.arange(n) / (SR * decay))
def midi(m): return 440 * 2 ** ((m - 69) / 12)

# ---------------- music ----------------
M = np.zeros(N); t = tarr()
# Act 1: dark drone (0 - 46.7), tension rising
dark_end = 46.7
def pad(freqs, t0, t1, amp, trem=0.25):
    seg = np.zeros(N); m = (t >= t0) & (t < t1)
    for f in freqs:
        seg += np.sin(2*np.pi*f*t + 0.3*np.sin(2*np.pi*0.2*t))
        seg += 0.5*np.sin(2*np.pi*f*2.005*t)
    e = np.clip((t - t0)/2.0, 0, 1) * np.clip((t1 - t)/1.5, 0, 1)
    return seg * m * e * amp * (0.75 + 0.25*np.sin(2*np.pi*trem*t))
M += pad([midi(45), midi(52), midi(57)], 0, 17.3, 0.05)
M += pad([midi(45), midi(52), midi(60)], 17.3, 36.5, 0.06, 0.4)
M += pad([midi(43), midi(50), midi(58)], 36.5, dark_end, 0.07, 0.6)
# heartbeat pulse rising 17 -> 43.5
for k, tt in enumerate(np.arange(17.4, 43.5, 1.0 if True else 1)):
    g = 0.25 + 0.5 * (tt - 17.4) / 26
    s = np.sin(2*np.pi*55*np.arange(int(.3*SR))/SR) * env_exp(int(.3*SR), 0.08)
    add(M, tt, s, g); add(M, tt + 0.25, s, g*0.6)
# Act 2+: bright, 100 bpm
beat = 60/100
chords = [[60,64,67],[67,71,74],[69,72,76],[65,69,72]]
bar = beat*4
tt = dark_end; k = 0
while tt < DUR - 0.1:
    ch = chords[k % 4]; t1 = min(tt + bar, DUR)
    M += pad([midi(c-12) for c in ch], tt, t1 + 0.4, 0.045, 0.1)
    for q in range(8):  # arpeggio eighths
        n = ch[q % 3] + (12 if q % 4 == 3 else 0)
        dur = int(0.5*SR)
        s = (np.sin(2*np.pi*midi(n)*np.arange(dur)/SR)) * env_exp(dur, 0.18)
        add(M, tt + q*beat/2, s, 0.05)
    for q in range(4):  # soft kick on beats, hat on offbeats
        kk = np.sin(2*np.pi*(50+60*env_exp(int(.25*SR),0.03))*np.arange(int(.25*SR))/SR) * env_exp(int(.25*SR), 0.09)
        add(M, tt + q*beat, kk, 0.28)
        hh = hp(rng.standard_normal(int(.06*SR)), 7000) * env_exp(int(.06*SR), 0.02)
        add(M, tt + q*beat + beat/2, hh, 0.07)
    tt += bar; k += 1
fade = np.clip((DUR - t)/4.0, 0, 1); M *= fade
M = M / np.max(np.abs(M)) * 0.9

# ---------------- sfx ----------------
S = np.zeros(N)
def hit(t0, g=1.0, low=50):
    n = int(1.2*SR); x = np.arange(n)/SR
    s = np.sin(2*np.pi*(low + 90*np.exp(-x*18))*x) * env_exp(n, 0.25)
    s += 0.6*lp(rng.standard_normal(n), 1500) * env_exp(n, 0.07)
    add(S, t0, s, 0.7*g)
def whoosh(t0, dur=0.7, g=1.0):
    n = int(dur*SR); x = np.arange(n)/n
    nz = rng.standard_normal(n); out = np.zeros(n)
    for lo in range(0, 6):
        c = 300 + x*3500*(1+lo*0.2)
        out += np.sin(np.cumsum(2*np.pi*c/SR)) * 0.0  # placeholder to keep structure simple
    s = bp(nz, 400, 5000) * np.sin(np.pi*x)**2
    add(S, t0, s, 0.5*g)
def tick(t0, g=1.0, f=2500):
    n = int(.03*SR); s = bp(rng.standard_normal(n), f, f*2.2) * env_exp(n, 0.006); add(S, t0, s, 0.9*g)
def typing(t0, t1, step, g=0.5):
    x = t0
    while x < t1:
        tick(x + rng.uniform(0, 0.015), g*rng.uniform(.6, 1), rng.choice([1800, 2200, 2800])); x += step * rng.uniform(.8, 1.2)
def chime(t0, f=880, g=1.0):
    n = int(1.0*SR); x = np.arange(n)/SR
    s = (np.sin(2*np.pi*f*x) + 0.5*np.sin(2*np.pi*f*2*x)) * env_exp(n, 0.25); add(S, t0, s, 0.35*g)
def applause(t0, dur, g=1.0):
    n = int(dur*SR); nz = bp(rng.standard_normal(n), 1200, 6500)
    claps = np.zeros(n)
    for _ in range(int(dur*90)):
        i = rng.integers(0, n-800); claps[i:i+800] += rng.uniform(.3, 1) * hp(rng.standard_normal(800), 1500) * env_exp(800, 0.012)
    e = np.minimum(1, np.arange(n)/(0.5*SR)) * np.minimum(1, (n - np.arange(n))/(1.2*SR))
    add(S, t0, (0.25*nz + claps) * e, 0.7*g)
def cheer(t0, dur, g=1.0):
    n = int(dur*SR); x = np.arange(n)/SR
    s = bp(rng.standard_normal(n), 500, 3200)
    s *= (0.6 + 0.4*np.sin(2*np.pi*7*x)) * np.minimum(1, x/0.3) * np.exp(-np.maximum(0, x-1.0)*1.3)
    add(S, t0, s, 0.9*g)
# clock ticks in the 11:00 scene
for tt in np.arange(0.2, 3.4, 1.0): tick(tt, 1.0, 900)
hit(3.5, .8, 70); hit(17.3, .7, 80)
whoosh(5.5, .4, .6); whoosh(36.2, .35, .5)
hit(36.5, 1.0, 60); hit(39.4, 1.0, 60)
typing(19.9, 23.6, 0.06); chime(30.2, 700, .6)
hit(43.6, 1.1, 50); hit(44.7, 1.2, 45); hit(45.6, 1.5, 40)
whoosh(46.3, .8, 1.0); whoosh(50.0, .6, 1.0)
applause(51.2, 3.6, .8)
whoosh(59.2, .5, .8)
typing(78.5, 80.2, 0.17); chime(80.4, 1100, .5); chime(82.1, 1300, .5)
typing(113.7, 116.4, 0.055); typing(120.1, 121.1, 0.04); typing(139.3, 140.6, 0.045)
tick(122.0, 1.2, 1500)
whoosh(142.6, .6, .9)
typing(152.0, 154.9, 0.07); typing(157.2, 158.6, 0.022); typing(160.0, 161.0, 0.06); typing(166.7, 170.6, 0.11)
whoosh(176.3, .6, .9)
for tt in (179.4, 182.0, 183.0, 185.1): chime(tt, 1200, .7)
chime(187.7, 880, 1.0); chime(187.9, 1320, .8)
whoosh(190.0, .5, .9); hit(190.3, .6, 80); hit(195.9, .6, 80); hit(201.7, .6, 80)
cheer(207.9, 2.8, 1.0); hit(207.9, 1.0, 55)
whoosh(231.2, .6, .7)
whoosh(247.5, .5, .8); hit(247.8, .7, 70); hit(254.9, 1.3, 45)
applause(254.9, 4.2, 1.0)
S = S / max(1e-6, np.max(np.abs(S))) * 0.9
wavfile.write("music.wav", SR, (M * 32767).astype(np.int16))
wavfile.write("sfx.wav", SR, (S * 32767).astype(np.int16))
print("ok", len(M)/SR)
