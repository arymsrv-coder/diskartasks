#!/bin/bash
# 9:16: trim portrait segments (offsets from true clip length) and concatenate -> full_video_9x16.mp4
set -e
cd "$(dirname "$0")"; source trim_lib.sh
S=1080:1920
mkdir -p clips/trim_vert  # hook offset measured from scene-change frames (0.97 s)
ffmpeg -y -loglevel error -ss 0.97 -i clips/vert/hook.webm -vf "fps=30,scale=$S,setsar=1,tpad=stop_mode=clone:stop_duration=1" -t 59.4 -an -c:v libx264 -crf 17 -pix_fmt yuv420p clips/trim_vert/hook.mp4
trim_seg vert home 17.7 0.46 "" $S; trim_seg vert buyer 65.5 0.46 "" $S
trim_seg vert M1 8.6 0.46 "" $S; trim_seg vert seller 25.2 0.46 "" $S; trim_seg vert M2 33.8 0.46 "" $S
trim_seg vert pricing 21.2 0.46 "" $S; trim_seg vert M3 33.5 0.46 "" $S
: > clips/trim_vert/list.txt
for n in hook home buyer M1 seller M2 pricing M3; do echo "file '$n.mp4'" >> clips/trim_vert/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i clips/trim_vert/list.txt -c:v libx264 -crf 17 -pix_fmt yuv420p full_video_9x16.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 full_video_9x16.mp4
