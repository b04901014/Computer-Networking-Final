#Args: $1 => UserName, $2 => Token
ffmpeg -f x11grab -s 1920x1080 -framerate 15 -i :0.0 -f pulse -ac 2 -i default -c:v libx264 -preset fast -pix_fmt yuv420p -s 1280x720 -c:a aac -b:a 160k -ar 44100 -threads 0 \
-f flv "rtmp://127.0.0.1/live/$1?token=$2"
