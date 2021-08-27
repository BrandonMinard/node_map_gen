
//TODO modify foreach loops into for loops with a static comparison.
//Constants.
const fullAlpha = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

const connections = [
    ["a", "b"], ["b", "c"], ["c", "d"], ["d", "e"], ["e", "f"], ["f", "g"], ["g", "h"], ["h", "i"], ["i", "j"], ["j", "k"], ["a", "k"],
    ["a", "c"], ["c", "e"], ["e", "g"], ["g", "i"], ["i", "k"],
    ["b", "d"], ["d", "f"], ["f", "h"], ["h", "j"]]
//create canvas to a reasonable size based on window
//also sets good constants
const htmlCanvas = document.getElementById('drawField')
const context = htmlCanvas.getContext('2d');
const width = window.innerWidth - 100
htmlCanvas.width = width;
const height = window.innerHeight - 100
htmlCanvas.height = height;

//radius determines the circles drawn, and the ndoe exclusion around them.
//The exclusion circle is 3*radius
const radius = 35
//amount of nodes to generate
const numToGen = 11

//the "wiggle" factor.
//I manually tuned this wiggle factor for radius 35, target 300, acceptableerror 50.
//I need to look into how it's related to those constants.
//For now, 22 is about as close to the magic number as I can get.
//I think the RNG was seeded in a way that worked out.
//22 is as random as any other number :/
//Should probably write my own RNG function.
const wiggle = 22

//acceptable distance between connections
const targetDistance = 300
//and the acceptable error
const acceptableError = 50

//acceptable distance between nodes.
const exclusion = radius * 4;
//and the acceptable error
const exclusionError = 40;

//for dev
const iterLimit = 500;
const totalRuns = 1000;


//Wait but we want to find the ones that move often, but don't move much.
//not those that don't move at all.
//Could look at total distance moved by it over so many iters, and then check it's distance from where it was.
//If those aren't good, we do something?

//So, distance moved over x turns, and then how far it's moved over those turns.
//But like, what should the requisite value be.

//how many iterations we keep memory of, and check against.
//Long as they've moved somewhat, we don't force them out.
const problemChildFreqCheck = 10;
//The distance the problem child has to move for it not to be forced out??
const problemChildAreaCheck = 35;


//OPTIMIZED METHODS FOR V8

//call after fillstyle is set
const genNodePositionsWithNumOfNodes = (alphabet, numOfNodes) => {
    //temporary.
    if (numOfNodes > alphabet.length) {
        alert("Don't generate more nodes than there are letters of the alphabet")
    }

}

const drawCircle = (ctx, x, y, r) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill()
    ctx.stroke();
}

//This works, unsure the math reasons why, but it does.
const correctRadians = (pointA, direction, needsCorrection) => {
    if (needsCorrection && direction) {
        pointA = [-pointA[0], -pointA[1]]
    } else if (!needsCorrection && !direction) {
        pointA = [-pointA[0], -pointA[1]]
    }
    return pointA
}

//Blue circles means the angle towards another connected node.
//Green circles means the angle away from another connected node.
const drawCircleOnNodeRadiansRadius = (context, nodes, radians, radius1) => {
    context.fillStyle = "blue"
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
const drawLetter = (ctx, x, y, letter) => {
    ctx.fillText(letter, x, y)
}

const generateNum = (limit) => (Math.floor(Math.random() * limit))

const findRadiansBetweenNodes = (points1, points2) => Math.atan((points1[1] - points2[1]) / (points1[0] - points2[0]))

//Finds a point on a unit circle of radius r, with angle.
const findPointFromRadians = (angle, r) => [Math.cos(angle) * r, Math.sin(angle) * r]


//points 1 and 2 are arrays of 2 elements.
const findDistance = (points1, points2) => Math.sqrt(Math.pow(points2[0] - points1[0], 2) + Math.pow(points2[1] - points1[1], 2))


const reducer = (accumulator, currentValue) => accumulator + currentValue;
//---------------------
//ACTUAL CODE START


//Brain storm for untangling
//expand/collapse
//identify problem child and flip it about a connected node
//Nodes that have connections that intersect many other connections get a magnitude boost in their movement.
//Nodes that jiggle in a small area get rocketed to 0,0, or some random coord.
//wrap around? Roflmao. This one was a 5-10% reduction
//change the angle nodes move randomly. This has some potential, I believe.

let didWiggle;
let interval;
let nodeList;
let nodes;
function startRegularly() {
    [nodes, nodeList] = generateNodes(fullAlpha, numToGen)
    didWiggle = false;
    renderNodesAndConnections(context, nodes, nodeList, connections)
    //skip every 10 render steps.
    interval = setInterval(doTick, 1, context, nodeList, nodes, connections);
    function doTick(context, nodeList, nodes, connections) {
        context.clearRect(0, 0, htmlCanvas.width, htmlCanvas.height)
        //can make it faster with this, really cuts down on jitteriness.
        //Is a TODO for the future.
        // for (let index = 0; index < 5; index++) {
        //     
        // }
        didWiggle = moveNodes(nodes, connections)
        if (!didWiggle) {
            stopInterval(interval)
        }
        renderNodesAndConnections(context, nodes, nodeList, connections)
    }
}

//TODO It's runninng twice in specific cases where we log a single word a lot of times.
async function startInDev() {
    context.fillStyle = "black"
    context.textAlign = 'center';
    context.textBaseline = "middle";
    let didWiggle = false;
    context.clearRect(0, 0, htmlCanvas.width, htmlCanvas.height)
    context.font = '50px serif'

    drawLetter(context, 300, 300, "Please wait")
    //just a sleep to make sure "please wait" renders.
    await new Promise(r => setTimeout(r, 100));

    // find how bad stable v unstable is.
    let stable = 0;
    let itersNeeded = []
    //This isn't breaking for some reason...
    //What
    let i;
    for (let index1 = 0; index1 < totalRuns; index1++) {
        i++
        [nodes, nodeList] = generateNodes(fullAlpha, numToGen)
        for (let index = 0; index < iterLimit; index++) {
            didWiggle = moveNodes(nodes, connections)
            if (!didWiggle) {
                stable += 1
                itersNeeded.push(index)
                break
            }
        }
    }
    console.log("completed run")
    context.clearRect(0, 0, htmlCanvas.width, htmlCanvas.height)
    context.font = '40px serif'
    //statistical stuff
    //only runs once, so let is fine here.
    let max = Math.max(...itersNeeded);
    let min = Math.min(...itersNeeded);
    let median = itersNeeded.sort((a, b) => a - b)[Math.floor(stable / 2)]
    let avgIters = itersNeeded.reduce(reducer) / stable
    drawLetter(context, 300, 300, "iterLimit: " + iterLimit)
    drawLetter(context, 300, 340, "min: " + min)
    drawLetter(context, 300, 380, "median: " + median)
    drawLetter(context, 300, 420, "max: " + max)
    drawLetter(context, 300, 460, "avgIters: " + Math.round(avgIters))
    drawLetter(context, 300, 500, "stable: " + stable + " / " + totalRuns)
}

//The main functions that moves nodes around
//Move connected nodes if they're too far away or too close together.
//Move nodes away from each other if they're too close together.
function moveNodes(nodes, connections) {
    let didWiggle = false;
    let a, b;
    let changeArr;
    connections.forEach(connection => {
        [a, b] = [connection[0], connection[1]]
        //iterate through connections forward and backwards in less code.
        for (let index = 0; index < 2; index++) {
            //Check that nodes[a] is not too close to any other node that is not itself.
            nodeList.forEach(nodeB => {
                if (nodeB != a) {
                    changeArr = moveNodeBasedOnDistanceToAnother(a, nodeB, exclusion, exclusionError, 1)
                    //Change did wiggle to true if it wiggled and it's not already false.
                    if (!didWiggle) { didWiggle = changeArr[2] }
                    //Use whether it moved in changeArr[2] (a bool), and move it.
                    //Else nothing.
                    if (changeArr[2]) {
                        //REPLACE with object
                        nodes[a]["position"] = [changeArr[0], changeArr[1]]
                    }
                }
            });

            changeArr = moveNodeBasedOnDistanceToAnother(a, b, targetDistance, acceptableError, 2)
            if (!didWiggle) { didWiggle = changeArr[2] }
            if (changeArr[2]) {
                //REPLACE with object
                nodes[a]["position"] = [changeArr[0], changeArr[1]]
                //This really shouldn't be here, oh god.
                //Classifying nodes seems like a better idea every moment...
                //Or modulize it?
                //Should just push/unshift.
                nodes[a]["positionMem"].push([changeArr[0], changeArr[1]])
                nodes[a].shift()

            }

            [a, b] = [b, a]
        }
    });
    return didWiggle
}

//returns new coords, and whether it should change as a flat array.
//newX, newY, moved
function moveNodeBasedOnDistanceToAnother(nodeA, nodeB, targetDistance, acceptableError, comparison) {
    let nextX;
    let nextY;
    let magnitude;
    let radianPoint;
    let direction;
    let needCorrection;
    let didWiggle = false
    //REPLACE with objects
    let nodeAPosition = nodes[nodeA]["position"]
    let nodeBPosition = nodes[nodeB]["position"]

    let distance = findDistance(nodeAPosition, nodeBPosition);

    let compVar;
    //comp var is the result of whatever the comparison stuff below outputs.
    //Either towards, away, or both.
    //Represented by 0, 1, and 2.
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
        //Somewhere within this, we add to the memories.
        //And we check it.
        //Should be a function.
        //Add to memory here, check further up?
        //Should memory only be added to when it's moving towards or away? or always?
        //Seems like always will give me more false positives.
        //Adding to all is significantly easier, so jsut do that now, add coarseness later.

        didWiggle = true;
        //towards or away.
        direction = distance > (targetDistance + acceptableError);
        //moves it by the sqrt of the distance + rand num between -wiggle and +wiggle
        //The randomness alone increases success over 500 iterations by 200%
        magnitude = ((Math.floor(Math.sqrt(distance)))) + generateNum(wiggle * 2) - wiggle
        // generateNum(Math.floor(Math.sqrt(distance))) - Math.floor(Math.sqrt(distance)) / 2;
        needCorrection = nodeAPosition[0] >= nodeBPosition[0];
        radianPoint = findPointFromRadians(findRadiansBetweenNodes(nodeAPosition, nodeBPosition), magnitude);
        radianPoint = correctRadians(radianPoint, direction, needCorrection);
        nextX = nodeAPosition[0] + radianPoint[0]
        nextY = nodeAPosition[1] + radianPoint[1]

        //Wrapping does not help, tried it.
        if (nextX > (width - radius)) {
            nextX = width - radius;
        } else if (nextX < radius) {
            nextX = radius;
        }
        if (nextY > (height - radius)) {
            nextY = height - radius;
        } else if (nextY < radius) {
            nextY = radius;
        }
    }
    if (didWiggle == false) {
        //Mostly for finding bugs, probably bad practice.
        return [0, 0, didWiggle];
    } else {
        return [nextX, nextY, didWiggle];
    }
}

//Need to change this significantly.
//Needs to be an object that contains many objects.
//node has position, distance memory, and position memory.
function generateNodes(alphabet, numOfNodes) {
    let nodeList = []
    let firstGenPosition;
    if (numOfNodes > alphabet.length) {
        console.log("num requested too high, just doing max.")
        numOfNodes = alphabet.length;
    }
    let returnObj = {}
    for (let index = 0; index < numOfNodes; index++) {
        const element = alphabet[index];
        nodeList.push(element)
        firstGenPosition = [generateNum(width - (2 * radius)) + radius, generateNum(height - (2 * radius)) + radius]
        returnObj[element] = {
            //REPLACE with object

            "position": firstGenPosition,
            //add 10 values to this at first, so we never have to use an if when updating this.
            "positionMem": [0, 0, 0, 0, 0, 0, 0, 0, 0, firstGenPosition],
            //add 9 values, since we're looking at differences between each set of nodes.
            //Then check the sum?
            //should the sum be an int that also changes with the array?
            "distMem": [0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
    }
    return [returnObj, nodeList];
}

//TODO once we figure out problem children
function generateConnections(nodeList, maxConnections) {

}

function stopInterval() {
    clearInterval(interval)
    //check boundaries at the end.
    let good = true
    nodeList.forEach(node => {
        //REPLACE with object
        let nodePosition = nodes[node]["position"]
        if (nodePosition[0] > (width - radius)) {
            good = false
        } else if (nodePosition[0] < radius) {
            good = false
        }
        if (nodePosition[1] > (height - radius)) {
            good = false
        } else if (nodePosition[1] < radius) {
            good = false
        }

    });
    let distance;
    let alsoGood = true;
    //check that all connections are within acceptable bounds.
    connections.forEach(connection => {
        //REPLACE with object
        let nodePosition0 = nodes[connection[0]]["position"]
        let nodePosition1 = nodes[connection[1]]["position"]
        distance = findDistance(nodePosition0, nodePosition1)
        if (!(distance >= targetDistance - acceptableError && distance <= targetDistance + acceptableError)) {
            alsoGood = false
        }
    });

    console.log(good)
    console.log(alsoGood)
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
        //REPLACE with object
        let nodePosition0 = nodes[connection[0]]["position"]
        let nodePosition1 = nodes[connection[1]]["position"]

        context.beginPath();
        //This looks bad, but it's fine, probably.
        context.moveTo(nodePosition0[0], nodePosition0[1]);
        context.lineTo(nodePosition1[0], nodePosition1[1]);
        context.closePath();
        context.stroke();
    });
    //then render all nodes and letters within
    nodeList.forEach(nodeLetter => {
        context.fillStyle = "white"
        node = nodes[nodeLetter]["position"]
        drawCircle(context, node[0], node[1], radius)
        //swapping fillstyle so often seems not great.
        context.fillStyle = 'black'
        drawLetter(context, node[0], node[1], nodeLetter)
    });

    //this isn't useful anymore.
    connections.forEach(connection => {
        //REPLACE with object
        let nodePosition0 = nodes[connection[0]]["position"]
        let nodePosition1 = nodes[connection[1]]["position"]

        radians = findPointFromRadians(findRadiansBetweenNodes(nodePosition0, nodePosition1), radius)
        drawCircleOnNodeRadiansRadius(context, [nodePosition0, nodePosition1], radians, 3.5)
        radians = findPointFromRadians(findRadiansBetweenNodes(nodePosition1, nodePosition0), radius)
        drawCircleOnNodeRadiansRadius(context, [nodePosition1, nodePosition0], radians, 3.5)
    });
}

//Bad function, based on a bad idea.
function getLastXEle(array, x) {
    if (array.length < x) {
        console.log("asked for more elements than are in the array ", array, x)
        x = array.length;
    }
    let target = array.length - x;
    let returnArr = [];
    for (let index = 0; index < x; index++) {
        returnArr.push(array[target]);
        target++;
    }
    return returnArr;
}