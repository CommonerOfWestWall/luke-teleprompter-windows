"""Generate application artwork and a seven-resolution Windows icon.

Development only: python -m pip install Pillow
Run from any directory: python src-tauri/icons/make_icon.py
"""
from pathlib import Path
import struct
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
SIZES = (16, 24, 32, 48, 64, 128, 256)


def render(size):
    scale = 4
    side = size * scale
    unit = side / 256
    image = Image.new('RGBA', (side, side))
    mask = Image.new('L', image.size)
    ImageDraw.Draw(mask).rounded_rectangle((8*unit, 8*unit, 248*unit, 248*unit), radius=53*unit, fill=255)
    draw = ImageDraw.Draw(image)
    for y in range(side):
        t = min(1, max(0, (y / unit - 8) / 240))
        color = tuple(round(a + (b-a)*t) for a,b in zip((255, 206, 84), (239, 157, 33)))
        draw.line((0, y, side, y), fill=(*color, 255))
    image.putalpha(mask)
    draw = ImageDraw.Draw(image)

    def polygon(points, color):
        draw.polygon([(x*unit, y*unit) for x,y in points], fill=color)

    # Slanted prompter glass, with clipped corners and a stable stand.
    ink = '#1B242F'
    polygon([(73,46),(207,46),(216,55),(190,174),(181,182),(47,182),(39,173),(65,54)], ink)
    polygon([(111,184),(137,184),(133,201),(178,201),(175,214),(76,214),(79,201),(107,201)], ink)
    # Muted upcoming/previous lines recede behind the white reading line.
    polygon([(85,77),(184,77),(182,87),(83,87)], '#929388')
    polygon([(72,141),(145,141),(143,151),(70,151)], '#929388')
    polygon([(79,107),(178,107),(175,122),(76,122)], '#FFF8E8')
    polygon([(50,103),(65,114),(46,126)], '#FFBD43')
    return image.resize((size,size), Image.Resampling.LANCZOS)


def bitmap(image):
    size = image.width
    pixels = image.tobytes('raw', 'BGRA')
    rows = b''.join(pixels[y*size*4:(y+1)*size*4] for y in range(size-1,-1,-1))
    stride = ((size+31)//32)*4
    mask = bytearray(stride*size)
    alpha = image.getchannel('A')
    for y in range(size):
        for x in range(size):
            if alpha.getpixel((x,size-1-y)) < 128:
                mask[y*stride+x//8] |= 128 >> (x%8)
    header = struct.pack('<IiiHHIIiiII',40,size,size*2,1,32,0,len(rows),0,0,0,0)
    return header + rows + mask


def main():
    chunks = [bitmap(render(size)) for size in SIZES]
    offset = 6 + len(SIZES)*16
    entries = []
    for size, chunk in zip(SIZES,chunks):
        entries.append(struct.pack('<BBBBHHII',size%256,size%256,0,0,1,32,len(chunk),offset))
        offset += len(chunk)
    (ROOT/'icon.ico').write_bytes(struct.pack('<HHH',0,1,len(SIZES)) + b''.join(entries) + b''.join(chunks))
    render(1024).save(ROOT/'icon.png')
    print('Generated icon.ico:', ', '.join(map(str,SIZES)), 'px; icon.png: 1024 px')


if __name__ == '__main__':
    main()
