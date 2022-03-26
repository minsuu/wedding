convert -background none -fill white -font Kyobo-Handwriting-2019 \
          -size 48x48 -pointsize 30 -gravity center -density 120 \
          label:$1 $1.gif

# for d in 결 혼 겨 ㄹ 합 니 다; do ./convert_char.zsh $d; done