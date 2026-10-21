"""Prepare the original Romina pour as small transparent, scrollable WebP frames.

Optional tooling (kept outside app dependencies):
python -m pip install --target .local/video-tools imageio-ffmpeg pillow numpy
python scripts/prepare-beer-pour.py

The source is a moving camera shot, not green screen. These hand-traced silhouettes
follow the opening glass and hand. The clear upper glass gets a softer optical
matte; original reflections and foreground occlusions remain. Never edits source.
"""
import json, subprocess, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.local/video-tools'))
import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# Coordinates use the 540 x 960 reference frames. Matching point counts allow
# interpolation without independently segmenting each frame (avoids edge flicker).
KEYS=[
 (0, [(281,351),(324,347),(418,375),(466,403),(478,425),(459,520),(392,655),(339,754),(289,897),(297,940),(282,960),(181,960),(100,941),(102,915),(145,881),(195,718),(214,626),(232,471)], [(0,801),(70,763),(150,727),(180,710),(199,712),(194,737),(173,759),(147,783),(120,816),(126,850),(147,881),(100,915),(100,942),(132,960),(0,960)], 630),
 (.5,[(260,212),(299,207),(395,230),(441,254),(452,274),(433,380),(380,485),(328,591),(278,748),(286,791),(269,830),(189,840),(110,806),(99,779),(136,739),(188,573),(202,460),(215,323)],[(0,679),(65,647),(135,610),(165,579),(184,572),(182,599),(163,624),(135,645),(115,681),(121,706),(136,739),(99,779),(111,807),(144,834),(0,873)],460),
 (1,[(253,255),(291,249),(391,276),(433,299),(442,318),(425,412),(383,508),(329,623),(283,786),(290,828),(269,865),(187,874),(112,836),(102,807),(138,773),(188,614),(201,485),(213,369)],[(0,709),(63,681),(133,641),(169,609),(187,604),(183,631),(162,654),(138,680),(116,713),(120,746),(138,773),(102,807),(112,836),(148,864),(0,892)],490),
 (1.5,[(247,304),(286,299),(381,332),(422,359),(433,381),(411,467),(367,555),(307,671),(231,824),(210,878),(188,903),(109,893),(40,855),(29,821),(69,782),(138,625),(173,506),(203,406)],[(0,685),(51,655),(109,630),(121,600),(140,595),(139,623),(121,650),(98,674),(76,716),(76,750),(69,782),(29,821),(40,855),(74,878),(0,914)],510),
 (2,[(266,257),(306,254),(397,285),(431,312),(434,335),(413,404),(376,468),(320,571),(246,724),(225,779),(199,807),(126,803),(53,767),(43,734),(83,695),(148,539),(183,417),(220,327)],[(0,599),(54,573),(119,541),(139,513),(154,512),(152,538),(132,562),(109,589),(89,631),(87,666),(83,695),(43,734),(53,767),(87,791),(0,840)],455),
 (2.5,[(235,245),(274,242),(358,274),(391,300),(402,322),(382,391),(349,457),(295,555),(219,712),(194,786),(167,822),(96,812),(24,775),(15,743),(53,704),(118,551),(155,415),(193,321)],[(0,629),(28,608),(89,578),(108,559),(123,557),(122,583),(102,605),(79,630),(61,666),(60,687),(53,704),(15,743),(24,775),(58,800),(0,824)],445),
]

def interpolate(t):
    left,right=KEYS[0],KEYS[-1]
    for a,b in zip(KEYS,KEYS[1:]):
        if a[0]<=t<=b[0]:left,right=a,b;break
    weight=min(1,max(0,(t-left[0])/(right[0]-left[0])))
    return [np.array(left[n])*(1-weight)+np.array(right[n])*weight for n in (1,2,3)]

def main():
    out=ROOT/'public/animations/beer-pour';out.mkdir(parents=True,exist_ok=True)
    ff=imageio_ffmpeg.get_ffmpeg_exe()
    frames=61;width,height=432,768
    command=[ff,'-v','error','-i',str(ROOT/'public/video/ROMINA beer showing v3.mp4'),'-frames:v',str(frames),'-an','-vf',f'fps=24,scale={width}:{height}', '-f','rawvideo','-pix_fmt','rgb24','-']
    process=subprocess.Popen(command,stdout=subprocess.PIPE)
    yy=np.arange(height)[:,None]
    samples=[]
    for index in range(frames):
        raw=process.stdout.read(width*height*3)
        if len(raw)!=width*height*3:raise RuntimeError('Video ended before all frames were extracted')
        rgb=np.frombuffer(raw,dtype=np.uint8).reshape(height,width,3).copy()
        glass,hand,foam=interpolate(index/24)
        mask=Image.new('L',(width,height));ImageDraw.Draw(mask).polygon([tuple(p*.8) for p in glass],fill=255)
        handmask=Image.new('L',(width,height));ImageDraw.Draw(handmask).polygon([tuple(p*.8) for p in hand],fill=255)
        # Clear glass transmits the new scene, while dark nozzle/reflections and
        # bright rim details remain visible. Amber beer and foam stay solid.
        color=rgb.astype(float)
        darkness=np.clip((145-color.mean(axis=2))/100,0,1)
        highlight=np.clip((color.max(axis=2)-220)/35,0,1)*.55
        clear=np.maximum(.16,np.maximum(darkness,highlight))
        fill=np.clip((yy-(float(foam)*.8-14))/18,0,1)
        opacity=clear*(1-fill)+fill
        # Pale bar reflections in the thumb/glass gap are background, not skin.
        background=(color[:,:,1]>color[:,:,0]*.90)&(color.mean(axis=2)>100)
        hand_alpha=np.asarray(handmask)*np.where(background,0,1)
        alpha=np.maximum(np.asarray(mask)*opacity,hand_alpha)
        # Suppress the cyan light spill on the glass edges from the original bar.
        cyan=(rgb[:,:,1].astype(float)>rgb[:,:,0]*1.15)&(rgb[:,:,2]>rgb[:,:,0]*1.08)
        rgb[cyan,1]=np.minimum(rgb[cyan,1],rgb[cyan,0]*1.12).astype(np.uint8)
        rgb[cyan,2]=np.minimum(rgb[cyan,2],rgb[cyan,0]*1.08).astype(np.uint8)
        alpha=Image.fromarray(alpha.clip(0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.65))
        im=Image.fromarray(rgb);im.putalpha(alpha)
        im=im.crop((0,160,width,height))
        im.save(out/f'{index:03}.webp',quality=80,method=4)
        if index in (0,30,60):samples.append(im.copy())
    process.stdout.close();process.wait()
    if process.returncode:raise RuntimeError('FFmpeg extraction failed')
    samples[-1].save(out/'poster.webp',quality=88,method=6)
    height-=160
    metadata={'frames':frames,'width':width,'height':height,'fps':24,'sourceSeconds':[0,2.5]}
    (out/'manifest.json').write_text(json.dumps(metadata,indent=2)+'\n')
    # Review matte on both light and dark backgrounds.
    proof=Image.new('RGB',(width*3,height*2))
    for row,bg in enumerate(('#fff4e1','#24120c')):
        for col,im in enumerate(samples):
            layer=Image.new('RGB',im.size,bg);layer.paste(im,mask=im.getchannel('A'));proof.paste(layer,(col*width,row*height))
    preview=ROOT/'.local/previews';preview.mkdir(parents=True,exist_ok=True)
    proof.save(preview/'pour-matte-review.jpg')
    print(f'{frames} transparent frames: {sum(p.stat().st_size for p in out.glob("*.webp"))/1024/1024:.2f} MB')

if __name__=='__main__':main()
