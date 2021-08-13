# node_map_gen
This program takes in an assortment of nodes with random positions, and their hardcoded connections to other nodes, and tries to arrange them in such a way that each node is within a margin of error away from their connected nodes.

This is achieved with a simple system where if nodes are further away than they should be, they are moved closer together. If they are closer together than they should be, they are moved apart.

# Description
This program is written entirely in JS, leveraging Canvas to draw to the HTML page. There are no dependencies.

# Motivation
I was trying to find a way to display an arbitrary node graph in HTML and the only stuff I found were large libraries on top of large libraries, so I decided to make this.
Hopefully will eventually be used to demonstrate pathfinding algorithms.

This is mostly a learning experience for a dynamic system using JS and canvas.

# Instillation
Just clone it.

# Contributing
No contributions will be taken at this time.

# Testing
Currently run a test at the end of each “simulation” that checks if each node is within the bounds of the canvas. Planning on significantly more testing as this project develops.

# Live Site
https://brandonminard.github.io/node_map_gen/

