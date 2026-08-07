import os
from PIL import Image, ImageDraw

# Create 64x64 icon
img = Image.new("RGBA", (64, 64), (9, 9, 11, 255))
draw = ImageDraw.Draw(img)

# White Border
draw.rounded_rectangle([2, 2, 61, 61], radius=8, fill=None, outline=(255, 255, 255, 255), width=3)

# Train body
draw.rectangle([16, 16, 47, 37], fill=(24, 24, 27, 255), outline=(110, 231, 183, 255), width=3)

# Windows (Mint green)
draw.rectangle([20, 22, 29, 29], fill=(110, 231, 183, 255))
draw.rectangle([34, 22, 43, 29], fill=(110, 231, 183, 255))

# Lights
draw.ellipse([22, 31, 26, 35], fill=(255, 255, 255, 255))
draw.ellipse([38, 31, 42, 35], fill=(255, 255, 255, 255))

# Rails
draw.line([12, 46, 51, 46], fill=(255, 255, 255, 255), width=3)
draw.line([20, 46, 16, 54], fill=(255, 255, 255, 255), width=3)
draw.line([43, 46, 47, 54], fill=(255, 255, 255, 255), width=3)

# Save as favicon.ico and favicon.png in frontend/public
public_dir = os.path.join(os.path.dirname(__file__), '../frontend/public')
os.makedirs(public_dir, exist_ok=True)

ico_path = os.path.join(public_dir, 'favicon.ico')
png_path = os.path.join(public_dir, 'favicon.png')

img.save(png_path, format='PNG')
img.save(ico_path, format='ICO', sizes=[(64, 64), (32, 32), (16, 16)])

print("SAVED FAVICON.ICO AND FAVICON.PNG SUCCESSFULLY!")
