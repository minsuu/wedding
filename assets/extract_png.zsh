# https://imagemagick.org/script/montage.php
# https://wiki.kldp.org/HOWTO/html/Adv-Bash-Scr-HOWTO/string-manipulation.html
# for file in *.webp; magick montage -background none -scale 48x48 -geometry +0+0 $file ${file/webp/png}
for file in *.webp; magick $file -resize 200% ${file/webp/png}