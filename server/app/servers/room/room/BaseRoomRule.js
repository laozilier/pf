/**
 *  创建者： THB
 *  日期：2020/4/23
 */

class BaseRoomRule {
    constructor(props) {
        this.playerMax = props.playerMax || 0;
        this.halfway = !!props.halfway;
        this.startNumber = props.startNumber || 99999;
        this.inningLimit = props.inningLimit || 0;
    }
}

module.exports = BaseRoomRule;
