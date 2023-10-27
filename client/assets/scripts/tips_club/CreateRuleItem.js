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
        ruleLab: {
            default: null,
            type: cc.Node, 
        },

        nameBtn: {
            default: null,
            type: cc.Node, 
        },

        maxBtn: {
            default: null,
            type: cc.Node, 
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
    },

    // update (dt) {},

    check(privateRoom) {
        this._prid = privateRoom.prid;
        let rule = privateRoom.rule;
        rule = (typeof rule == 'string') ? JSON.parse(rule) : rule;
        this._rule = rule;
        this.checkName(privateRoom.name);
        this.checkMax(privateRoom.max);
        // let str = '';
        // str += this.getAnteStr(rule);
        //str += this.getStartNumberStr(rule);
        //str += this.getPlayerMaxStr(rule);
        // str += this.getInningStr(rule);
        
        //str += this.getNiuniuStr(rule);
        //str += this.getSangongStr(rule);
        //str += this.getPszStr(rule);
        //str += this.getPdkStr(rule);
        //str += this.getSanshuiStr(rule);

        // str += this.getIn_Outstr(rule);
        // this.ruleLab.getComponent(cc.Label).string = str;
        // this.ruleLab.getChildByName('Label').getComponent(cc.Label).string = str;
    },

    checkName(name) {
        let str = '';
        this._name = name;
        let nameLab = this.nameBtn.getChildByName('Label');
        if (!!this._name) {
            nameLab.color = cc.hexToColor('#333333');
            nameLab.getComponent(cc.Label).string = this._name;
        } else {
            nameLab.color = cc.hexToColor('#999999');
            nameLab.getComponent(cc.Label).string = '点击修改';
            str += this.getGameNameStr(this._rule);
        }

        str += this.getAnteStr(this._rule);
        this.ruleLab.getComponent(cc.Label).string = str;
        this.ruleLab.getChildByName('Label').getComponent(cc.Label).string = str;
    },

    checkMax(max) {
        let maxLab = this.maxBtn.getChildByName('Label');
        let str = '开桌数: ';
        if (max > 0) {
            str += max;
        } else {
            str += '不限';
        }

        maxLab.getComponent(cc.Label).string = str;
    },

    getNiuniuStr(rule) {
        let name = rule.gameName; 
        if (name.indexOf(cc.enum.GameName.niuniu) < 0) {
            return '';
        }

        let game_rule = rule.game_rule;
        let str = '翻倍规则:\n';
        if (game_rule.multipleRule > 0) {
            str += '牛番\n';
        } else {
            str += '牛牛x4牛九x3牛八牛七x2\n';
        }

        if (name == cc.enum.GameName.niuniu_mpqz) {
            str += '抢庄倍数: '+(game_rule.multiple+1)+'倍\n';
            str += '抢庄加倍: '+(game_rule.anteDouble ? '加倍' : '不加倍')+'\n';
            str += '下注规则:\n'+(game_rule.bets > 0 ? '底注 1/2/3/4/5倍' : '底注 1/2倍')+'\n';
            str += '闲家推注: '+['无', '5倍', '10倍', '20倍'][game_rule.tuizhu]+'\n';
        } else {
            str += '下注规则:\n'+'锅底 10/5分之一\n';
            str += '收庄局数: '+game_rule.shouInning+'局\n';
            let maxCounts = ['不能连庄', '一次', '两次']
            str += '连庄次数: '+maxCounts[game_rule.maxCount]+'\n';
        }

        let niuType = [];
        game_rule.isWhn && niuType.push(game_rule.multipleRule > 0 ? "五花牛(11倍)" : "五花牛(5倍)");
        game_rule.isSn && niuType.push(game_rule.multipleRule > 0 ? "顺子牛(12倍)" : "顺子牛(6倍)");
        game_rule.isThn && niuType.push(game_rule.multipleRule > 0 ? "同花牛(13倍)" : "同花牛(7倍)");
        game_rule.isHln && niuType.push(game_rule.multipleRule > 0 ? "葫芦牛(14倍)" : "葫芦牛(8倍)");
        game_rule.isZdn && niuType.push(game_rule.multipleRule > 0 ? "炸弹牛(15倍)" : "炸弹牛(9倍)");
        game_rule.isQdn && niuType.push(game_rule.multipleRule > 0 ? "全大牛(16倍)" : "全大牛(10倍)");
        game_rule.isWxn && niuType.push(game_rule.multipleRule > 0 ? "五小牛(16倍)" : "五小牛(10倍)");
        game_rule.isThs && niuType.push(game_rule.multipleRule > 0 ? "同花顺(16倍)" : "同花顺(10倍)");
        game_rule.isJpn && niuType.push("金牌牛");
        if (niuType.length > 0) {
            str += '特殊牌型\n';
            for (let i = 0; i < niuType.length; i++) {
                if (i > 0) {
                    if (i%2 == 0) {
                        str += '\n';
                    } else {
                        str += ' ';
                    }
                } 

                str += niuType[i];
            }
            str += '\n';
        } else {
            str += '无特殊牌型\n';
        }

        let room_rule = rule.room_rule;
        str += room_rule.halfway ? '允许中途加入' : '禁止中途加入';
        str += '\n';

        str += game_rule.cuopai ? '可搓牌' : '禁止搓牌';
        str += '\n';

        str += game_rule.isLaizi ? '有赖子' : '无赖子';
        str += '\n';

        return str;
    },

    getSangongStr(rule) {
        let name = rule.gameName; 
        if (name != cc.enum.GameName.sangong) {
            return '';
        }

        let str = '';
        let game_rule = rule.game_rule;
        str += '抢庄倍数: '+(game_rule.multiple+1)+'倍\n';
        str += '抢庄加倍: '+(game_rule.anteDouble ? '加倍' : '不加倍')+'\n';
        str += '下注规则: 底注 1/2倍\n';
        str += '闲家推注: '+['无', '5倍', '10倍', '20倍'][game_rule.tuizhu]+'\n';

        str += rule.halfway ? '允许中途加入' : '禁止中途加入';
        str += '\n';

        str += game_rule.cuopai ? '可搓牌' : '禁止搓牌';
        str += '\n';

        return str;
    },

    getPszStr(rule) {
        let name = rule.gameName; 
        if (name != cc.enum.GameName.psz) {
            return '';
        }

        let str = '';
        let game_rule = rule.game_rule;
        str += '必闷轮数: '+(game_rule.mustMen > 0 ? game_rule.mustMen+'轮' : '无')+'\n';
        str += '特殊: '+(!game_rule.flushBTAbc ? '顺子大于金花':'金花大于顺子')+'\n';
        str += '最大轮数: '+(game_rule.maxRound > 0 ? game_rule.maxRound+'轮' : '7轮')+'\n';
        return str;
    },

    getPdkStr(rule) {
        let name = rule.gameName; 
        if (name != cc.enum.GameName.pdk) {
            return '';
        }

        let str = '';
        let game_rule = rule.game_rule;

        str += '先出: '+(game_rule.throwCards ? '随机庄家先出' : '黑桃三先出')+'\n';
        str += '显示剩余牌: '+(game_rule.isVisibles ? '显示' : '不显示')+'\n';

        let playTypes = game_rule.playTypes;
        let playstrs = {1: '三张可少带出完', 2: '三张可少带接完', 3: '飞机可少带出完', 4: '飞机可少带接完', 5: '小通机制', 6: '双报'};
        
        if (playTypes.length > 0) {
            str += '特殊玩法:\n';
        }
        for (let i = 0; i < playTypes.length; i++) {
            let type = playTypes[i];
            str += (playstrs[type]+'\n');
        }

        let gameRules = game_rule.gameRules;
        let rulestrs = {1: '炸弹不可拆', 2: '允许4带2', 3: '允许4带3', 4: '红桃10扎鸟'};
        if (gameRules.length > 0) {
            str += '特殊规则:\n';
        }
        for (let i = 0; i < gameRules.length; i++) {
            let type = gameRules[i];
            str += (rulestrs[type]+'\n');
        }

        return str;
    },

    getSanshuiStr(rule) {
        let name = rule.gameName; 
        if (name != cc.enum.GameName.sanshui) {
            return '';
        }

        let str = '';
        let game_rule = rule.game_rule;

        str += '打枪: '+(game_rule.shootScore ? '加一' : '翻倍')+'\n';
        str += '马牌: '+ ['无', '黑桃5', '黑桃10', '黑桃A'][game_rule.maCard || 0]+'\n';

        let room_rule = rule.room_rule;
        str += room_rule.halfway ? '允许中途加入' : '禁止中途加入';
        str += '\n';

        str += game_rule.withOutSpecial ? '无特殊牌型' : '有特殊牌型';
        str += '\n';

        str += game_rule.hasBanker ? '有庄模式' : '无庄模式';
        str += '\n';

        return str;
    },

    getGameNameStr(rule) {
        let name = rule.gameName;
        let namestr = cc.enum.GameStr[name];
        let game_rule = rule.game_rule;
        if (name.indexOf('pdk') > -1) {
            if (game_rule.model == 0) {
                namestr = '跑得快16张';
            } else {
                namestr = '跑得快15张';
            }
        } else if (name.indexOf('niuniu') > -1) {
            if (name == cc.enum.GameName.niuniu_mpqz) {
                if (game_rule.multipleRule > 0) {
                    namestr = '牛番';
                } else {
                    namestr = '明牌';
                }
            } else {
                namestr = '锅底';
            }

            if (game_rule.isLaizi) {
                namestr = '赖子'+namestr;
            }

            if (game_rule.wh) {
                namestr += '无花';
            } else {
                namestr += '有花';
            }
        } else if (name.indexOf('sangong') > -1) {
            if (game_rule.playMode > 0) {
                namestr = '三公比金花';
            } else {
                namestr = '经典三公';
            }
        }

        return namestr+'\n';
    },

    getAnteStr(rule) {
        let game_rule = rule.game_rule;
        let ante = game_rule.ante || 0;
        let antestr= '底: '+cc.utils.getScoreStr(ante);
        return antestr;
    },

    getStartNumberStr(rule) {
        let room_rule = rule.room_rule;
        let startNumber = room_rule.startNumber || 0;
        let startNumberstr= '开局: '+startNumber+'人';
        return startNumberstr+'\n';
    },


    getPlayerMaxStr(rule) {
        let room_rule = rule.room_rule;
        let name = rule.gameName;
        let playerMax = room_rule.playerMax || 0;
        let max = cc.enum.playerMax[name][playerMax];
        let playerMaxstr = '最大: '+max+'人';
        return playerMaxstr+'\n';
    },

    getInningStr(rule) {
        let room_rule = rule.room_rule;
        let inning = room_rule.inning;
        if (!!inning) {
            return '最少: '+inning+'局\n';
        }
        
        return '';
    },

    getIn_Outstr(rule) {
        let in_outstr = '';
        let name = rule.gameName;
        let game_rule = rule.game_rule;
        let ante = game_rule.ante;
        if (name == cc.enum.GameName.niuniu_mpqz || name == cc.enum.GameName.sangong) {
            let multiple = game_rule.multiple+1;
            let score = ante*16*(multiple+1);
            let instr = cc.utils.getScoreStr(score);
            in_outstr += '入场分数: '+instr;
            let leavestr = cc.utils.getScoreStr(score*0.8);
            in_outstr += '\n离场分数: '+leavestr;
        } else if (name == cc.enum.GameName.niuniu_guodi) {
            let instr = cc.utils.getScoreStr(ante*1.2);
            in_outstr += '入场分数: '+instr;
            let leavestr = cc.utils.getScoreStr(ante);
            in_outstr += '\n离场分数: '+leavestr;
        } else if (name == cc.enum.GameName.pdk) {
            let instr = cc.utils.getScoreStr(ante*64);
            in_outstr += '入场分数: '+instr;
            let leavestr = cc.utils.getScoreStr(ante*12.8);
            in_outstr += '\n离场分数: '+leavestr;
        } else if (name == cc.enum.GameName.psz) {
            let maxRounds = [7, 10, 12];
            let idx = maxRounds.indexOf(game_rule.maxRound);
            let minMuls = [100, 120, 160];
            let minMul = minMuls[idx] || 100;
            let instr = cc.utils.getScoreStr(ante*minMul);
            in_outstr += '入场分数: '+instr;
            let leavestr = cc.utils.getScoreStr(ante*minMul*0.8);
            in_outstr += '\n离场分数: '+leavestr;
        }
        
        return in_outstr;
    },

    onNameEditedPressed() {
        cc.vv.audioMgr.playButtonSound();
        let editRoomName = cc.find('Canvas').getChildByName('editRoomName');
        let self = this;
        if (!!editRoomName) {
            editRoomName.getComponent('EditRoomName').openEditRoomName(self._name, (name) => {
                if (self._name != name) {
                    cc.connect.changePrivateRoomName(cc.dm.clubInfo.cid, self._prid, name, (msg) => {
                        this.checkName(name);
                    });
                }
            });
        } else {
            cc.utils.loadPrefabNode('tips_club/editRoomName', (editRoomName)=> {
                cc.find('Canvas').addChild(editRoomName, 99, 'editRoomName');
                editRoomName.getComponent('EditRoomName').openEditRoomName(self._name, (name) => {
                    if (self._name != name) {
                        cc.connect.changePrivateRoomName(cc.dm.clubInfo.cid, self._prid, name, (msg) => {
                            this.checkName(name);
                        });
                    }
                });
            });
        }
    },

    onMaxEditedPressed() {
        cc.vv.audioMgr.playButtonSound();
        let inputMaxTable = cc.find('Canvas').getChildByName('inputMaxTable');
        let self = this;
        if (!!inputMaxTable) {
            inputMaxTable.getComponent('InputMaxTable').openInputMaxTable((max) => {
                cc.connect.changePRMax(cc.dm.clubInfo.cid, self._prid, max, (msg) => {
                    this.checkMax(max);
                    cc.dm.changePRMax({cid: cc.dm.clubInfo.cid, prid: self._prid, max: max});
                });
            });
        } else {
            cc.utils.loadPrefabNode('tips_club/inputMaxTable', (inputMaxTable)=> {
                cc.find('Canvas').addChild(inputMaxTable, 99, 'inputMaxTable');
                inputMaxTable.getComponent('InputMaxTable').openInputMaxTable((max) => {
                    cc.connect.changePRMax(cc.dm.clubInfo.cid, self._prid, max, (msg) => {
                        this.checkMax(max);
                        cc.dm.changePRMax({cid: cc.dm.clubInfo.cid, prid: self._prid, max: max});
                    });
                });
            });
        }
    }
});
