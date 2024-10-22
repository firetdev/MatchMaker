# MatchMaker

A program to create a palette from an image, and recolor an image to match a palette.
The program has two engines for creating a palette, engine 0 and engine 1. You can switch between them as you like.

## Engine 0
Engine 0 runs using nested for loops to compare the similarity of every pixel in the image. It then selects X unique pixels, prioritizing those with the most other pxiels similar to them. Excludes duplicates.

## Engine 1
Engine 1 uses an implementation of a k-Means clustering function to find X colors from the image.
