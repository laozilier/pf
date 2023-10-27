// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    setInfo(privateRoom, table, idx) {
        let rule = privateRoom.rule;
        rule = (typeof rule == 'string') ? JSON.parse(rule) : rule;
        this.gameName = rule.gameName;
        this.playerMax = rule.room_rule.playerMax;
        this._rule = rule;
        this._table = table;

        let name = privateRoom.name;
        this.setName(name);
        
        let game_rule = this._rule.game_rule;
        let anteNode = this.node.getChildByName('ante');
        let antestr = cc.utils.getScoreStr(game_rule.ante);
        anteNode.getComponent(cc.Label).string = antestr;
        anteNode.getChildByName('Label').getComponent(cc.Label).string = antestr;

        let infoNode = this.node.getChildByName('infoNode');
        let ridNode = infoNode.getChildByName('rid');
        if (!!table) {
            ridNode.active = true;
            let ridstr = '房号: '+table.rid;
            ridNode.getComponent(cc.Label).string = ridstr;
            ridNode.getChildByName('Label').getComponent(cc.Label).string = ridstr;

            let seats = table.seats;
            let loadtime = 2;
            for (let i = 0; i < seats.length; i++) {
                let headNode = this.node.getChildByName('head'+i);
                if (!headNode) {
                    return;
                }
                let seat = seats[i];
                if (!!seat) {
                    headNode.active = true;
                    loadtime += headNode.getComponent("HeadNode").updateData(seat.pic, 0, loadtime);
                } else {
                    headNode.active = false;
                }
            }
        } else {
            ridNode.active = false;
        }
    },

    setName(name) {
        let namestr = '';
        if (!!name) {
            namestr = name;
        } else {
            name = this._rule.gameName;
            namestr = cc.enum.GameStr[name];
            let game_rule = this._rule.game_rule;
            if (name.indexOf('pdk') > -1) {
                if (game_rule.model == 0) {
                    namestr = '跑得快16张';
                } else {
                    namestr = '跑得快15张';
                }
            } else if (name.indexOf('niuniu') > -1) {
                namestr = (name.indexOf('_mpqz') > -1) ? '明牌' : '锅底';
                if (game_rule.multipleRule > 0) {
                    namestr = '牛番';
                }
                namestr += game_rule.isLaizi ? '赖子' : '';
                namestr += game_rule.wh ? '无花' : '有花';
            } else if (name.indexOf('sangong') > -1) {
                if (game_rule.playMode > 0) {
                    namestr = '三公比金花';
                } else {
                    namestr = '经典三公';
                }
            }
        } 

        let infoNode = this.node.getChildByName('infoNode');
        let nameNode = infoNode.getChildByName('name');
        nameNode.getComponent(cc.Label).string = namestr;
        nameNode.getChildByName('Label').getComponent(cc.Label).string = namestr;
    },

    addUser(seatId, pic) {
        let headNode = this.node.getChildByName('head'+seatId);
        if (!headNode) {
            return;
        }

        headNode.active = true;
        headNode.getComponent("HeadNode").updateData(pic, 0);
    },

    delUser(seatId) {
        let headNode = this.node.getChildByName('head'+seatId);
        if (!headNode) {
            return;
        }

        headNode.active = false;
    },

    ruleBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        if (!this._rule) {
            return;
        }
        let gameName = this._rule.gameName;
        let game_rule = this._rule.game_rule;
        let room_rule = this._rule.room_rule;
        game_rule.startNumber = room_rule.startNumber;
        game_rule.halfway = room_rule.halfway;
        game_rule.inning = room_rule.inningLimit;
        let playerMax = room_rule.playerMax;
        game_rule.max = cc.enum.playerMax[gameName][playerMax];
        let ruleName = gameName+'_rule';
        if (gameName.indexOf('diantuo') > -1) {
            if (game_rule.model == 0) {
                ruleName = 'diantuo_tj_rule';
            }
        }

        if (gameName.indexOf('mj_zz') > -1) {
            ruleName = 'mj_hz_rule';
        }

        cc.utils.showRule(ruleName, game_rule);
    },

    // update (dt) {},
});
