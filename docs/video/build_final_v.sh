#!/bin/bash
# Final mix: video + burned captions + VO + ducked music + SFX, two-pass loudnorm to -14 LUFS / -1.5 dBTP.
set -e
cd "$(dirname "$0")"
VO="../i like vo2.mp3"
MIX="[2:a]aformat=sample_rates=44100:channel_layouts=stereo,asplit=2[vo][vosc];\
[3:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=0.55[mu];\
[mu][vosc]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=500[mud];\
[4:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=0.6[sx];\
[vo][mud][sx]amix=inputs=3:duration=first:normalize=0"
IN=(-i full_video_9x16.mp4 -f concat -safe 0 -i clips/caps_v/list.txt -i "$VO" -i music.wav -i sfx.wav)
STATS=$(ffmpeg -hide_banner -nostats -i "$VO" -i music.wav -i sfx.wav -filter_complex "$(echo "$MIX" | sed 's/\[2:a\]/[0:a]/;s/\[3:a\]/[1:a]/;s/\[4:a\]/[2:a]/'),loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json[a]" -map "[a]" -t 264.9 -f null - 2>&1)
g(){ echo "$STATS" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
ffmpeg -y -loglevel error "${IN[@]}" -filter_complex "[0:v][1:v]overlay=0:0:format=auto:shortest=0,format=yuv420p[v];$MIX,loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true[a]" \
  -map "[v]" -map "[a]" -t 264.9 -c:v libx264 -crf 18 -preset medium -c:a aac -b:a 192k -movflags +faststart campus-gigs-9x16.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 campus-gigs-9x16.mp4
