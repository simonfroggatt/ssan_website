import sys
import os
from pathlib import Path


png_thumb_path = 'image/catalog/bespoke/thumbs/'
png_path = 'image/catalog/bespoke/'

p = Path(os.path.abspath(__file__)).parents[2]

p2 = p / png_thumb_path
p3 = p / png_path

print(p2)
print(p3)

