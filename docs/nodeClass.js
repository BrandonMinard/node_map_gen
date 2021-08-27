class NodeClass {
    constructor(name, position) {
        this.x = position[0];
        this.y = position[1];
        this.eleName = name;
        this.positionMem = [0, 0, 0, 0, 0, 0, 0, 0, 0, position];
        //do I go high or low here?
        //High may be better because then we don't wait 10 iterations to actually look for problems.
        //We just always look for them, and it won't trip it until we go 10 iterations deep.
        this.distMem = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.distRunningTotal = 0;
    }

    get position() {
        return [this.x, this.y]
    }

    // getPosition() {
    //     return ;
    // }

    getName() {
        return this.eleName;
    }


    updatePosition(newPosition) {
        this.x = newPosition[0];
        this.y = newPosition[1];
        this.positionMem.push(newPosition);
        this.positionMem.shift();
        const newDist = findDistance(this.positionMem[9], this.positionMem[8]);
        this.distRunningTotal += newDist
        this.distMem.push(newDist);
        this.distRunningTotal -= this.distMem.shift();
    }

    //So, we return the distance moved over 10 moves, or as many as we like
    // and the distance between it now and it ten positions ago.
    //Then compare the difference with some constant.
    //Cumulative distance and comparitive distance?
    //Or I take in a problem constant, and return the problem factor?
    isProblemChild(problemConstant) {
        const cumulativeDist = findDistance(this.positionMem[0], this.positionMem[9]);
        if ((this.distRunningTotal / cumulativeDist) > problemConstant) {
            return true;
        } else {
            return false;
        }
    }

}