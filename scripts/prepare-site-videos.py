"""Requires the optional local tools documented in docs/BEER-POUR.md."""
import sys,subprocess,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.local/video-tools'))
import imageio_ffmpeg
ff=imageio_ffmpeg.get_ffmpeg_exe()
out=ROOT/'public/media/romina';out.mkdir(parents=True,exist_ok=True)
recipes=[
 ('pizza-kitchen','pizza making V2.mp4',2,15,1280,720,3),
 ('coffee-ritual','PORTRAIT VIDEO V2.mp4',7,8,576,1024,7),
 ('arrival','ROMINA NEW VIDEO .mp4',3,5.5,1280,720,6),
]
manifest=[]
for name,source,start,duration,width,height,poster in recipes:
 path=ROOT/'public/video'/source
 command=[ff,'-hide_banner','-loglevel','error','-y','-ss',str(start),'-i',str(path),'-t',str(duration),'-map','0:v:0','-an','-vf',f'scale={width}:{height},fps=24','-c:v','libx264','-preset','medium','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',str(out/(name+'.mp4'))]
 subprocess.run(command,check=True)
 subprocess.run([ff,'-v','error','-y','-ss',str(poster),'-i',str(path),'-frames:v','1','-vf',f'scale={width}:{height}','-c:v','libwebp','-quality','85',str(out/(name+'-poster.webp'))],check=True)
 manifest.append({'name':name,'source':source,'start':start,'duration':duration,'width':width,'height':height,'audio':False,'bytes':(out/(name+'.mp4')).stat().st_size})
 print(name,round(manifest[-1]['bytes']/1024/1024,2),'MB',flush=True)
(out/'videos.json').write_text(json.dumps(manifest,indent=2)+'\n')
