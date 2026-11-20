#!/bin/bash
# 16:9: trim each recorded segment using offsets derived from true clip length, then concatenate -> full_video.mp4
set -e
cd "$(dirname "$0")"; source trim_lib.sh
HOOKRAW=$(ls -tr clips/rough/page@*.webm | head -1)
off=0.58; mkdir -p clips/trim_full  # measured from scene-change frames in the raw hook clip
ffmpeg -y -loglevel error -ss $off -i "$HOOKRAW" -vf "fps=30,scale=1920:1080,setsar=1,tpad=stop_mode=clone:stop_duration=1" -t 59.4 -an -c:v libx264 -crf 17 -pix_fmt yuv420p clips/trim_full/hook.mp4
trim_seg full home 17.7; trim_seg full buyer 65.5; trim_seg full M1 8.6; trim_seg full seller 25.2
trim_seg full M2 33.8; trim_seg full pricing 21.2; trim_seg full M3 33.5
: > clips/trim_full/list.txt
for n in hook home buyer M1 seller M2 pricing M3; do echo "file '$n.mp4'" >> clips/trim_full/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i clips/trim_full/list.txt -c:v libx264 -crf 17 -pix_fmt yuv420p full_video.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 full_video.mp4
