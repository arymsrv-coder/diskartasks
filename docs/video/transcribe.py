import json, sys
from faster_whisper import WhisperModel
audio = sys.argv[1]
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, info = m.transcribe(audio, language="tl", word_timestamps=True, vad_filter=False, beam_size=5)
out = []
for s in segs:
    out.append({"start": round(s.start,2), "end": round(s.end,2), "text": s.text.strip(),
                "words": [{"w": w.word, "s": round(w.start,2), "e": round(w.end,2)} for w in (s.words or [])]})
json.dump({"duration": info.duration, "segments": out}, open("transcript.json","w"), ensure_ascii=False, indent=1)
print(len(out), "segments")
