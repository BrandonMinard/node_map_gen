//Optimized Rolling Array class
//Why? Because I can.
//Trades memory for performance, or it should at least.
//Think of it as a better shift, except when it's not.
//Going to shelve for now, just get the basic functions working in the regular section.
class ORArray {
    constructor(min, max) {
        this.array = [];
        this.min = min;
        this.max = max;
    }
    push(val) {
        if (this.array.length < 100) {
            this.array.push(val);
        } else {
            this.array = getLastXEle(this.array, this.min)
        }
    }

}

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