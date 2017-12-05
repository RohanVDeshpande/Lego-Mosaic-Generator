# Lego-Mosaic-Generator

The Lego Mosaic Generator app will convert high-res images into a lego mosaic.
The app downscales the image, and matches each color from the image to the closet lego brick color.
The app allows the user to manipulate the color pallates and will generate instructions for the user (using brick solver optimization algorithms).

Work In Progress:

Pull Lego brick price data from bricklink for accurate mosaic price optimization.

Base URL:
https://www.bricklink.com/catalogPG.asp?itemType=P&itemNo=3022&itemSeq=1&colorID=7&v=P&priceGroup=Y&prDec=2

https://www.bricklink.com/catalogPG.asp?itemType=P&itemNo={{{INSERT_LEGO_ID_HERE}}}&itemSeq=1&colorID={{{INSER_BRICK_COLOR_ID_HERE}}}&v=P&priceGroup=Y&prDec=2