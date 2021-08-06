// const canvas1 = document.getElementById('my-house');
// const ctx = canvas1.getContext('2d');

// function resizeCanvas(context) {
//     context.width = window.innerWidth;
//     context.height = window.innerHeight;
//     draw()
// }
// resizeCanvas(ctx)
// Set line width
// ctx.lineWidth = 1;

// Wall
// ctx.strokeRect(75, 140, 150, 110);

// // Door
// ctx.fillRect(130, 190, 40, 60);

// // Roof
// ctx.beginPath();
// ctx.moveTo(50, 140);
// ctx.lineTo(150, 60);
// ctx.lineTo(250, 140);
// ctx.closePath();
// ctx.stroke();

//So first things first, figure out where all circles are.
//They must be at least x+y units away, where x is the radius, and y is the length of the line.
//I don't know how to optimize this, so why not just try this shit sorta randomly?
//Just want to render a randomly generated graph.
//Okay it's worse though, because it may have complicated relationships...
//Uhhhh...
// Hm.

//Generate nodes.
//imagine a circle around each node, this will just be where the node letter is
//Each node is a point though.
//imagine a tiny circle around the node. This is the movement circle we'll use each frame.
//God this is dumb to do bottom up.
//So we need the rise/run, which we then get the angle from,
//then use the unit circle to figure out where on the movement circle we move to.


const htmlCanvas = document.getElementById('drawField'),
    context = htmlCanvas.getContext('2d');
htmlCanvas.width = window.innerWidth - 100;
const width = window.innerWidth - 100
htmlCanvas.height = window.innerHeight - 100;
const height = window.innerHeight - 100
// function thing() {
//     context.clearRect(0, 0, htmlCanvas.width, htmlCanvas.height)
//     draw(context, document.getElementById("firstNum").value, document.getElementById("secondNum").value)
// }
const radius = 50
let nodeA = [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius];
let nodeB = [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius];
console.log(nodeA, nodeB)
// console.log(findAngleBetweenNodes(nodeA, nodeB))
// console.log(findPointFromAngle(findAngleBetweenNodes(nodeA, nodeB), radius))
// console.log(nodeB)
context.beginPath();
context.moveTo(nodeA[0], nodeA[1]);
context.lineTo(nodeB[0], nodeB[1]);
context.closePath();
context.stroke();

// setInterval(myMethod, 500);
context.fillStyle = "white"
// function myMethod() {
drawCircle(context, nodeA[0], nodeA[1], radius)
drawCircle(context, nodeB[0], nodeB[1], radius)
let thing = findPointFromAngle(findAngleBetweenNodes(nodeA, nodeB), radius)
context.fillStyle = "blue"
if (nodeA[0] > nodeB[0]) {
    drawCircle(context, nodeA[0] - thing[0], nodeA[1] - thing[1], 10)
} else {
    drawCircle(context, nodeA[0] + thing[0], nodeA[1] + thing[1], 10)
}
thing = findPointFromAngle(findAngleBetweenNodes(nodeB, nodeA), radius)
if (nodeB[0] > nodeA[0]) {
    drawCircle(context, nodeB[0] - thing[0], nodeB[1] - thing[1], 10)
} else {
    drawCircle(context, nodeB[0] + thing[0], nodeB[1] + thing[1], 10)
}


// context.fillStyle = "blue"
// drawCircle(context, nodeA[0] + thing[0], nodeA[1] + thing[1], 10)
// }
// context.fillStyle = "white"

context.fillStyle = 'black'
context.font = '48px serif'
context.textAlign = 'center';
context.textBaseline = "middle";
drawLetter(context, nodeA[0], nodeA[1], "A")
drawLetter(context, nodeB[0], nodeB[1], "B")



//ONLY CALL AFTER FILLSTYLE IS SET
function drawCircle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill()
    ctx.stroke();
}

//ONLY CALL WHEN FILLSTYLE, FONT, TEXTALIGN, AND TEXTBASELINE ARE SET
function drawLetter(ctx, x, y, letter) {
    ctx.fillText(letter, x, y)
}

function generateNum(limit) {
    return (Math.floor(Math.random() * limit))
}

//I have no idea if this works.
function findAngleBetweenNodes(points1, points2) {
    let run = points1[0] - points2[0]
    let rise = points1[1] - points2[1]
    console.log(rise)
    console.log(run)
    console.log(rise / run)
    // let run = points1[0] > points2[0] ? points1[0] - points2[0] : points2[0] - points1[0]
    // let rise = points1[1] > points2[1] ? points1[1] - points2[1] : points2[1] - points1[1]
    return Math.atan(rise / run)
}

function findPointFromAngle(angle, r) {
    return [Math.cos(angle) * r, Math.sin(angle) * r]
}

//points 1 and 2 are arrays of 2 elements.
function findDistance(points1, points2) {
    return Math.sqrt(Math.pow(points2[0] - points1[0]) + Math.pow(points2[1] - points1[1]))
}
