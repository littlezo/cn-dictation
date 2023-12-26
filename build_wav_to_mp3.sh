#!/bin/bash
pushd public/v
# 转换当前目录下的所有.wav文件为.mp3
for file in *.wav; do
    # 检查文件是否存在
    if [ -f "$file" ]; then
        # 获取不带扩展名的文件名
        filename="${file%.*}"
        # 使用ffmpeg转换格式
        ffmpeg -i "$file" "${filename}.mp3"
    fi
done
rm -rf *.wav
popd

