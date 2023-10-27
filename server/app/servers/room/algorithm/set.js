
class Set {

    constructor(){
        this.dataStore = new Array();
    }

    //添加
    add(item) {
        if (this.dataStore.indexOf(item) > -1) {
            return false;
        } else {
            this.dataStore.push(item);
            return true;
        }
    }

    remove(item) {
        var pos = this.dataStore.indexOf(item);
        if (pos > -1) {
            this.dataStore.splice(pos, 1);
            return true;
        }
        return false;
    }

    size() {
        return this.dataStore.length;
    }

    contains(item) {
        return this.dataStore.indexOf(item) > -1;
    }

    has(item)
    {
        return this.contains(item);
    }

    show() {
        return this.dataStore;
    }

    // 并集
    union(set) {
        var tempSet = new Set();
        // 1:将当前的集合元素插入临时集合
        this.dataStore.forEach(function (item) {
            tempSet.add(item);
        });
        set.dataStore.forEach(function (item) {
            if (!tempSet.contains(item)) {
                tempSet.add(item);
            }
        })
        return tempSet;
    }

    // 交集
    intersect(set) {
        var tempSet = new Set();
        var that = this;
        set.dataStore.forEach(function (item) {
            if (that.dataStore.indexOf(item)>-1) {
                tempSet.add(item);
            }
        })
        return tempSet;
    }

    // 是否子集
    subset(set) {
        return this.dataStore.every(function (item) {
            return set.dataStore.indexOf(item)>-1
        })
    }

    // 补集,产生一个集合,某个元素属于一个集合不属于另外一个集合
    difference(set){
        var tempSet=new Set();
        this.dataStore.forEach(function(item){
            if( !set.contains(item)){
                tempSet.add(item);
            }
        })
        return tempSet;
    }

    //重置
    reset(){
        this.dataStore.splice(0,this.dataStore.length);
    }

}

module.exports =  Set;

/**
 function priTest() {
    let game = new Game();

    game.GetChiHuActionScore(524288)
}
 priTest();
 */