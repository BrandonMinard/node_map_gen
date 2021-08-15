const devMode = 0;

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
const radius = 35

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
    interval = setInterval(doTick, 10, context, nodeList, nodes, connections);
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
        for (let index = 0; index < 200; index++) {
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


//So the logic here was flawed.
//Set a flag, then set it within a 2 loop.
//So it could be true, false
//or false, true.
//And the result would be true or false, when it should be true.
//Oh I fixed it.
function moveNodes(nodes, connections) {
    //Acceptable error should grow over time so that we always get something eventually.
    const acceptableError = 50
    const targetDistance = 300
    //3 because reasons.
    const exclusion = radius * 4;
    const exclusionError = 60;
    let didWiggle = false;
    let a, b, c;
    let changeArr;
    connections.forEach(connection => {
        //iterate through connections forward and backwards in less code.
        a = connection[0]
        b = connection[1]
        for (let index = 0; index < 2; index++) {
            changeArr = moveNodeBasedOnDistanceToAnother(a, b, targetDistance, acceptableError, 2)
            //The fix, which should've been obvious.
            if (!didWiggle) {
                didWiggle = changeArr[2]
            }
            //these are for different purposes.
            if (changeArr[2]) {
                nodes[a] = [changeArr[0], changeArr[1]]
            }
            nodeList.forEach(nodeB => {
                if (nodeB != a) {
                    changeArr = moveNodeBasedOnDistanceToAnother(a, nodeB, exclusion, exclusionError, 1)
                    //The fix, which should've been obvious.
                    if (!didWiggle) {
                        didWiggle = changeArr[2]
                    }
                    //these are for different purposes.
                    if (changeArr[2]) {
                        nodes[a] = [changeArr[0], changeArr[1]]
                    }
                }
            });
            //swap a and b using a third value, c.
            c = a;
            a = b;
            b = c;
        }
    });
    //do circle comparisons here
    //so compare all circles to all other circles.
    //If the distance is within unacceptable bounds, move them away from each other.
    //Else do nothing.

    //This is n^n rather than n!, which is signifcantly more computation.
    //However the additional randomness and movement introduced should hopefully help it find stability sooner.
    //This is a potential point of optimization
    //Could just find the all mathematical combinations of 2 elements within nodeList.
    //But that is only one way, not both ways.
    //I am not nearly as math inclined as I need to be elegant, so both ways will work out better.
    // nodeList.forEach(nodeA => {
    //     // console.log(nodes[nodeA])
    //     nodeList.forEach(nodeB => {
    //         changeArr = moveNodeBasedOnDistanceToAnother(nodeA, nodeB, exclusion, exclusionError, 0)
    //         //The fix, which should've been obvious.
    //         if (!didWiggle) {
    //             didWiggle = changeArr[2]
    //         }
    //         //these are for different purposes.
    //         if (changeArr[2]) {
    //             nodes[nodeA] = [changeArr[0], changeArr[1]]
    //         }
    //     });
    // });

    return didWiggle
}

//Moves nodes directly towards or away from each other.
//If they're beyond the distance and acceptable error, they get moved closer.
//Else they get moved further apart.
//Magnitude needs to become a global constant so that tuning is easier.
//There needs to be another value that changes the radians something moves by, for more randomness.
//This won't support circle exclusion.
//It does towards and away only, never one or the other.
//So this function needs to take in towards/away, or one or the other.
//So, I guess, 0 1 or 2?
//It will run a LOT, so I think integers would be prudent.
//The integer determines the main if comparison on whether things should change or not.
function moveNodeBasedOnDistanceToAnother(nodeA, nodeB, targetDistance, acceptableError, comparison) {
    let nextX;
    let nextY;
    let magnitude;
    let radianPointA;
    let direction;
    let needCorrectionA;
    let didWiggle = false
    let distance = findDistance(nodes[nodeA], nodes[nodeB]);
    //comp var is the result of whatever the comparison stuff below outputs.
    let compVar;
    //This if should become a variable that's used depending on a comparison variable.
    //Either towards, away, or both.
    //Represented by 0, 1, and 2?
    //That makes sense to me.
    if (comparison == 0) {
        //should move towards
        compVar = distance > targetDistance + acceptableError
    } else if (comparison == 1) {
        //should move away
        compVar = distance < targetDistance - acceptableError
    } else if (comparison == 2) {
        //should move towards or away.
        compVar = distance < (targetDistance - acceptableError) || distance > (targetDistance + acceptableError)

    }
    if (compVar) {
        didWiggle = true;
        //This may need to be changed?
        //I think direction works for all cases.
        direction = distance > (targetDistance + acceptableError);
        //moves it by the sqrt of the distance + rand num between -25 and 25 for the sake of randomness.
        //This is the main tuning, how much it wiggles is integral to how quick it finds stability.
        magnitude = ((Math.floor(Math.sqrt(distance)))) + generateNum(50) - 25;
        needCorrectionA = nodes[nodeA][0] >= nodes[nodeB][0];
        radianPointA = findPointFromRadians(findRadiansBetweenNodes(nodes[nodeA], nodes[nodeB]), magnitude);
        radianPointA = correctRadians(radianPointA, direction, needCorrectionA);
        nextX = nodes[nodeA][0] + radianPointA[0]
        nextY = nodes[nodeA][1] + radianPointA[1]
        if (nextX > (width - (2 * radius)) + radius) {
            nextX = (width - (2 * radius)) + radius;
        } else if (nextX < 0) {
            nextX = (2 * radius);
        }
        if (nextY > (height - (2 * radius)) + radius) {
            nextY = (height - (2 * radius)) + radius;
        } else if (nextY < 0) {
            nextY = (2 * radius);
        }
    }
    if (didWiggle == false) {
        //Mostly for finding bugs, probably bad practice.
        return [0, 0, didWiggle];
    } else {
        return [nextX, nextY, didWiggle];
    }
}


function stopInterval() {
    const acceptableError = 50
    const targetDistance = 300
    clearInterval(interval)
    //check boundaries at the end.
    let good = true
    nodeList.forEach(node => {
        if (nodes[node][0] > (width - (2 * radius)) + radius) {
            good = false
        } else if (nodes[node][0] < 0) {
            good = false
        }
        if (nodes[node][1] > (height - (2 * radius)) + radius) {
            good = false
        } else if (nodes[node][1] < 0) {
            good = false
        }

    });
    let distance;
    let alsoGood = true;
    //check that all connections are within acceptable bounds.
    connections.forEach(connection => {
        distance = findDistance(nodes[connection[0]], nodes[connection[1]])
        if (!(distance >= targetDistance - acceptableError && distance <= targetDistance + acceptableError)) {
            alsoGood = false
        }
    });

    console.log(alsoGood)
    console.log(good)
}

function renderNodesAndConnections(context, nodes, nodeList, connections) {
    //set up text render
    context.fillStyle = "black"
    context.font = '30px serif'
    context.textAlign = 'center';
    context.textBaseline = "middle";
    let radians;
    let node;
    //render all the connections, must do this first.
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

    //this isn't useful anymore.
    connections.forEach(connection => {
        radians = findPointFromRadians(findRadiansBetweenNodes(nodes[connection[0]], nodes[connection[1]]), radius)
        drawCircleOnNodeRadiansRadius(context, [nodes[connection[0]], nodes[connection[1]]], radians, 3.5)
        radians = findPointFromRadians(findRadiansBetweenNodes(nodes[connection[1]], nodes[connection[0]]), radius)
        drawCircleOnNodeRadiansRadius(context, [nodes[connection[1]], nodes[connection[0]]], radians, 3.5)
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

//This isn't useful anymore, I know the idea behind it works now.
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