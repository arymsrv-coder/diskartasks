#!/bin/bash
# Rough cut of beats 1-3a: record hook + home takes, trim by measured offsets, mux VO.
set -e
cd "$(dirname "$0")"
rm -rf clips/rough
./.venv/bin/python rec_rough.py
cd clips/rough
H=$(ls -tr page@*.webm | head -1); S=$(ls -tr page@*.webm | tail -1)
HO=$(python3 -c "import json;print(round(json.load(open('offsets.json'))['hook_offset'],2))")
SO=$(python3 -c "import json;print(round(json.load(open('offsets.json'))['home_offset'],2))")
ffmpeg -y -loglevel error -ss $HO -t 59.4 -i "$H" -vf "fps=30,scale=1920:1080" -an -c:v libx264 -crf 18 -pix_fmt yuv420p hook.mp4
ffmpeg -y -loglevel error -ss $SO -t 17.7 -i "$S" -vf "fps=30,scale=1920:1080" -an -c:v libx264 -crf 18 -pix_fmt yuv420p home.mp4
printf "file 'hook.mp4'\nfile 'home.mp4'\n" > list.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i list.txt -i "../../../i like vo2.mp3" -t 77.1 -map 0:v -map 1:a -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k ../../rough_cut_beats1-3.mp4
