# Media optimisation commands

Image to webp (max 1600px wide):
    ffmpeg -i in.png -vf "scale='min(1600,iw)':-2" -quality 82 out.webp

Video to web mp4 (keeps audio, fast start):
    ffmpeg -i in.mp4 -c:v libx264 -preset veryfast -crf 26 -vf "scale='min(1080,iw)':-2" -c:a aac -b:a 96k -movflags +faststart out.mp4

Poster frame:
    ffmpeg -i in.mp4 -ss 1 -frames:v 1 poster.webp

After adding a file, register it in site/js/media.js: window.MEDIA.im.key or window.MEDIA.vd.key.
