const devMode = 1;

//create canvas to a reasonable size based on window
//also sets good constants
const htmlCanvas = document.getElementById('drawField')
const context = htmlCanvas.getContext('2d');
const width = window.innerWidth - 100
htmlCanvas.width = width;
const height = window.innerHeight - 100
htmlCanvas.height = height;

//radius probably needs to be more contextual
//radius determines the circles drawn, and the exclusion circles around them.
//The exclusion circle is 4*radius
//Because it's node to node, and I want 2*radius between each circle.
const radius = 40

const nodeList = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"]
let nodes = {
    "a": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
    "b": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
    "c": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
    "d": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
    "e": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
    "f": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
    "g": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
    "h": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
    "i": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
    "j": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
    "k": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
}
const connections = [["a", "b"], ["b", "c"], ["c", "d"],
["d", "e"], ["e", "f"], ["f", "g"], ["g", "h"], ["h", "i"], ["i", "j"], ["j", "k"], ["a", "k"],
["a", "c"], ["c", "e"], ["e", "g"], ["g", "i"], ["i", "k"],
["b", "d"], ["d", "f"], ["f", "h"], ["h", "j"]]

const reducer = (accumulator, currentValue) => accumulator + currentValue;

let didWiggle;
let interval;
if (devMode == 0) {
    //Have to render once first to get it started elegantly.
    renderNodesAndConnections(context, nodes, nodeList, connections)
    interval = setInterval(doTick, 16, context, nodeList, nodes, connections);
    function doTick(context, nodeList, nodes, connections) {
        context.clearRect(0, 0, htmlCanvas.width, htmlCanvas.height)
        didWiggle = moveNodes(nodes, connections)
        if (!didWiggle) {
            stopInterval(interval)
        }
        renderNodesAndConnections(context, nodes, nodeList, connections)
    }
} else {
    // find how bad stable v unstable is.
    let stable = 0;
    let itersNeeded = []
    for (let index = 0; index < 1000; index++) {
        nodes = {
            "a": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
            "b": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
            "c": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
            "d": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
            "e": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
            "f": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
            "g": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
            "h": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
            "i": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
            "j": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
            "k": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
        }
        for (let index = 0; index < 500; index++) {
            didWiggle = moveNodes(nodes, connections)
            if (!didWiggle) {
                stable += 1
                itersNeeded.push(index)
                break
            }
        }
    }
    //statistical stuff
    //only runs once, so let is fine here.
    let max = Math.max(...itersNeeded);
    let min = Math.min(...itersNeeded);
    let median = itersNeeded.sort((a, b) => a - b)[Math.floor(stable / 2)]
    let avgIters = itersNeeded.reduce(reducer) / stable
    console.log("min: ", min)
    console.log("median: ", median)
    console.log("max: ", max)
    console.log("avg: ", avgIters)
    console.log("stable: ", stable)
}

//Function figures out the next position of each node in the graph.
//Nodes that are not within acceptable distances of their connections-
//either go towards or away from their partner depending on distance.
//All nodes stay 4*radius away from each other.
//All nodes stay within the bounds of the canvas at all times.
function moveNodes(nodes, connections) {
    const acceptableError = 50
    const targetDistance = 300
    const exclusion = radius * 4;
    // let motionVectors = {}
    let nodeA;
    let nodeB;
    let distance;
    let magnitude;
    let radianPointA;
    let radianPointB;
    let direction;
    let needCorrectionA;
    let needCorrectionB;
    let didWiggle = false;
    let a;
    let b;
    let c;
    let nextX;
    let nextY;
    connections.forEach(connection => {
        // console.log(connection)
        //unneeded but nice for readability
        a = connection[0]
        b = connection[1]

        for (let index = 0; index < 2; index++) {
            distance = findDistance(nodes[a], nodes[b]);
            if (distance < targetDistance - acceptableError || distance > targetDistance + acceptableError) {
                didWiggle = true;
                direction = distance > targetDistance + acceptableError;
                magnitude = ((Math.floor(Math.sqrt(distance))) / 2) + 2;
                needCorrectionA = nodes[a][0] >= nodes[b][0]
                radianPointA = findPointFromRadians(findRadiansBetweenNodes(nodes[a], nodes[b]), magnitude)
                radianPointA = correctRadians(radianPointA, direction, needCorrectionA)
                nextX = nodes[a][0] + radianPointA[0]
                nextY = nodes[a][1] + radianPointA[1]
                if (nextX > (width - (2 * radius)) + width) {
                    nextX = (width - (2 * radius)) + width
                }
                if (nextY > (height - (2 * radius)) + radius) {
                    nextY = (height - (2 * radius)) + radius
                }
                nodes[a] = [nextX, nextY]
            }

            c = a;
            a = b;
            b = c;

        }
    });

    //do circle comparisons now


    //Don't need to return nodes because it's pass by reference.
    //This is sloppy but nice.
    return didWiggle
}


function stopInterval() {
    clearInterval(interval)
}

function renderNodesAndConnections(context, nodes, nodeList, connections) {

    //render all the connections, must do this first.
    context.fillStyle = "black"
    context.font = '40px serif'
    context.textAlign = 'center';
    context.textBaseline = "middle";
    let radians;
    let node;
    connections.forEach(connection => {

        context.beginPath();
        //This looks bad, but it's fine, probably.
        context.moveTo(nodes[connection[0]][0], nodes[connection[0]][1]);
        context.lineTo(nodes[connection[1]][0], nodes[connection[1]][1]);
        context.closePath();
        context.stroke();
    });
    //then render all nodes and letters within

    nodeList.forEach(nodeLetter => {
        context.fillStyle = "white"
        node = nodes[nodeLetter]
        drawCircle(context, node[0], node[1], radius)
        //swapping fillstyle so often seems not great.
        context.fillStyle = 'black'
        drawLetter(context, node[0], node[1], nodeLetter)
    });
    //render the "motion vectors" (???)
    //This is terrible, should figure them out then render them
    //Now both steps are done at once.
    connections.forEach(connection => {
        radians = findPointFromRadians(findRadiansBetweenNodes(nodes[connection[0]], nodes[connection[1]]), radius)
        drawCircleOnNodeRadiansRadius(context, [nodes[connection[0]], nodes[connection[1]]], radians, 10)
        radians = findPointFromRadians(findRadiansBetweenNodes(nodes[connection[1]], nodes[connection[0]]), radius)
        drawCircleOnNodeRadiansRadius(context, [nodes[connection[1]], nodes[connection[0]]], radians, 10)
    });
}

//ONLY CALL AFTER FILLSTYLE IS SET
function drawCircle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill()
    ctx.stroke();
}

//This should be better, but I don't care.
function correctRadians(pointA, direction, needsCorrection) {
    if (needsCorrection && direction) {
        pointA = [-pointA[0], -pointA[1]]
    } else if (!needsCorrection && !direction) {
        pointA = [-pointA[0], -pointA[1]]
    }
    return pointA
}

function drawCircleOnNodeRadiansRadius(context, nodes, radians, radius1) {
    context.fillStyle = "blue"
    //This logic should be somewhere else, why is it here...
    if (nodes[0][0] >= nodes[1][0]) {
        //towards
        drawCircle(context, nodes[0][0] - radians[0], nodes[0][1] - radians[1], radius1)
        context.fillStyle = "green"
        //away
        drawCircle(context, nodes[0][0] + radians[0], nodes[0][1] + radians[1], radius1)
    } else {
        drawCircle(context, nodes[0][0] + radians[0], nodes[0][1] + radians[1], radius1)
        context.fillStyle = "green"
        drawCircle(context, nodes[0][0] - radians[0], nodes[0][1] - radians[1], radius1)
    }
}


//ONLY CALL WHEN FILLSTYLE, FONT, TEXTALIGN, AND TEXTBASELINE ARE SET
function drawLetter(ctx, x, y, letter) {
    ctx.fillText(letter, x, y)
}

function generateNum(limit) {
    return (Math.floor(Math.random() * limit))
}

//Works, neato.
function findRadiansBetweenNodes(points1, points2) {
    return Math.atan((points1[1] - points2[1]) / (points1[0] - points2[0]))
}
//Finds a point on a unit circle of radius r, with angle.
//I don't know.
function findPointFromRadians(angle, r) {
    return [Math.cos(angle) * r, Math.sin(angle) * r]
}

//points 1 and 2 are arrays of 2 elements.
function findDistance(points1, points2) {
    return Math.sqrt(Math.pow(points2[0] - points1[0], 2) + Math.pow(points2[1] - points1[1], 2))
}
