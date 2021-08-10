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

//These few lines of code are totally not from stackoverflow.
//totally.
const htmlCanvas = document.getElementById('drawField'),
    context = htmlCanvas.getContext('2d');
htmlCanvas.width = window.innerWidth - 100;
const width = window.innerWidth - 100
htmlCanvas.height = window.innerHeight - 100;
const height = window.innerHeight - 100


//Do these need to be consts?
//Maybe.

//radius probably needs to be more contextual
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
let didWiggle;
//Have to render once first to get it started in an elegant way.
renderNodesAndConnections(context, nodes, nodeList, connections)
let interval = setInterval(doTick, 10, context, nodeList, nodes, connections);
function doTick(context, nodeList, nodes, connections) {
    //mess with nodes here
    context.clearRect(0, 0, htmlCanvas.width, htmlCanvas.height)
    //nodes = 
    didWiggle = generateMotionVectors(nodes, connections)
    if (!didWiggle) {
        stopInterval(interval)
    }
    // console.log(nodes)
    // nodes["a"] = [nodes["a"][0] + 1, nodes["a"][1]]
    renderNodesAndConnections(context, nodes, nodeList, connections)
}

// find how bad stable v unstable is.
// let stable = 0;
// for (let index = 0; index < 1000; index++) {
//     nodes = {
//         "a": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
//         "b": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
//         "c": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
//         "d": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
//         "e": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
//         "f": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
//         "g": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
//         "h": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
//         "i": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
//         "j": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
//         "k": [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius],
//     }
//     for (let index = 0; index < 200; index++) {
//         didWiggle = generateMotionVectors(nodes, connections)
//         if (!didWiggle) {
//             stable += 1
//             // console.log("stable")
//             break
//         }

//     }


// }
// console.log(stable)
//This is a vector, right?
//It has direction and magnitude.
//So if something has multiple vectors, I think I can just add them together, right?
//Vectors will then be applied to nodes at the end.
//Vector should be x change + y change.
//Don't I just need x change and y change.
//That implicitly has the radians.
//I hope that works.
//Should they be applied to both at like half magnitude?
//Should be called genAndApplyMotionVectors?
//Tried to be fancy, but these should be applied one at a time, not consolidated and applied all at once.
//Makes the wiggles worse, I think?
function generateMotionVectors(nodes, connections) {
    const acceptableError = 50
    const targetDistance = 300
    let motionVectors = {}
    let nodeA;
    let nodeB;
    let distance;
    let magnitude;
    let radianPointA;
    let radianPointB;
    let direction;
    let needCorrectionA;
    let needCorrectionB;
    connections.forEach(connection => {
        //unneeded but nice for readability
        nodeA = nodes[connection[0]]
        nodeB = nodes[connection[1]]
        distance = findDistance(nodeA, nodeB);
        if (distance < targetDistance - acceptableError || distance > targetDistance + acceptableError) {

            // } else {
            //we bad
            //Just do whatever, I'm only using log because I know about it lol
            //Let's only move whole integers for sake of bugfixing.
            //true means towards, false means away.
            direction = distance > targetDistance + acceptableError

            //So when it comes towards a node, we want it to be precise.
            //When it goes away, we want it to be wiggly to induce more change, so that eventually we may find a stable configuration.
            if (direction) {
                // magnitude = ((Math.floor(Math.sqrt(distance))) / 2) + 5
                magnitude = ((Math.floor(Math.sqrt(distance))) / 2)
            } else {
                // magnitude = ((Math.floor(Math.sqrt(distance))) / 2) + generateNum(20)
                magnitude = ((Math.floor(Math.sqrt(distance))) / 2)
            }
            //Want to move them magnitude distance towards each other.
            //So "blue radians" at "magnitude radius"
            //nodeA moves by radianPointA.
            //I am so bad at naming things.

            needCorrectionA = nodeA[0] >= nodeB[0]
            radianPointA = findPointFromRadians(findRadiansBetweenNodes(nodeA, nodeB), magnitude)
            radianPointA = correctRadians(radianPointA, direction, needCorrectionA)

            nodes[connection[0]] = [nodes[connection[0]][0] + radianPointA[0], nodes[connection[0]][1] + radianPointA[1]]

            needCorrectionB = nodeB[0] >= nodeA[0]
            radianPointB = findPointFromRadians(findRadiansBetweenNodes(nodeB, nodeA), magnitude)
            radianPointB = correctRadians(radianPointB, direction, needCorrectionB)
            nodes[connection[1]] = [nodes[connection[1]][0] + radianPointB[0], nodes[connection[1]][1] + radianPointB[1]]



            // if (Object.keys(motionVectors).includes(connection[0])) {
            //     motionVectors[connection[0]] = [motionVectors[connection[0]][0] + radianPointA[0], motionVectors[connection[0]][1] + radianPointA[1]]
            // } else {
            //     motionVectors[connection[0]] = radianPointA
            // }
            // if (Object.keys(motionVectors).includes(connection[1])) {
            //     motionVectors[connection[1]] = [motionVectors[connection[1]][0] + radianPointB[0], motionVectors[connection[1]][1] + radianPointB[1]]
            // } else {
            //     motionVectors[connection[1]] = radianPointB
            // }

        } else {
            return false
        }
    });
    // console.log(motionVectors)
    // if (Object.keys(motionVectors).length > 0) {
    //     Object.keys(motionVectors).forEach(element => {
    //         nodes[element] = [nodes[element][0] + motionVectors[element][0], nodes[element][1] + motionVectors[element][1]]
    //     });
    //     return true
    // } else {

    //     return false
    // }
    return true
    //want to return updated nodes
    //So go through connections.
    //Find distance between em, then check whether we want to move them away from or toward each other.
    //Move them based on like log(distance) + 1 lol I don't know.
    //have a "generous" sweet spot, like 50 +- 5
}


function stopInterval() {
    clearInterval(interval)
}

function renderNodesAndConnections(context, nodes, nodeList, connections) {

    //render all the connections, must do this first.
    context.fillStyle = "black"
    context.font = '48px serif'
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
