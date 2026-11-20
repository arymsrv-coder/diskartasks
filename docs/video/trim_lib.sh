# Shared helpers. A Playwright video starts when the page is created and ends at ctx.close(), which happens
# `len + 0.46 (measured against flash/scene-change frames)` s after the segment began, so the true offset of timeline t=0 is: raw_duration - (len + 0.6).
rawdur(){ ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
trim_seg(){ # dir name len [extra]  -> clips/trim_$dir/name.mp4  (extra = seconds added to len for the close delay, default 0.6)
  local dir=$1 name=$2 len=$3 extra=${4:-0.46} src=$5
  [ -z "$src" ] && src=clips/$dir/$name.webm
  local d; d=$(rawdur "$src")
  local off; off=$(python3 -c "print(round($d-($len+$extra),3))")
  mkdir -p clips/trim_$dir
  ffmpeg -y -loglevel error -ss $off -i "$src" -vf "$7fps=30,scale=${6:-1920:1080},setsar=1,tpad=stop_mode=clone:stop_duration=1" -t $len -an -c:v libx264 -crf 17 -pix_fmt yuv420p clips/trim_$dir/$name.mp4
}
