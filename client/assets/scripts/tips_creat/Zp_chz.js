cc.Class({
    extends: cc.Component,

    properties: {
        anteToggles:{
            default:null,
            type:cc.Node
        },

        anteLab: {
            default:null,
            type:cc.Label,
        },

        anteTips: {
            default:null,
            type:cc.Node,
        },

        btnAnte: {
            default: null,
            type: cc.Node
        },

        numbersToggles:{
            default:null,
            type:cc.Node
        },

        numbersLab: {
            default:null,
            type:cc.Label,
        },

        numbersTips: {
            default:null,
            type:cc.Node,
        },

        btnNumbers: {
            default: null,
            type: cc.Node
        },

        inningToggles: {
            default:null,
            type:cc.Node
        },

        inningLab: {
            default:null,
            type:cc.Label,
        },

        inningTips: {
            default:null,
            type:cc.Node,
        },

        btnInning: {
            default: null,
            type: cc.Node
        },

        wangNumToggles: {
            default:null,
            type:cc.Node
        },

        wangNumLab: {
            default:null,
            type:cc.Label,
        },

        wangNumTips: {
            default:null,
            type:cc.Node,
        },

        btnWangNum: {
            default: null,
            type: cc.Node
        },
        
        fanxingToggles: {
            default:null,
            type:cc.Node
        },

        fanxingLab: {
            default:null,
            type:cc.Label,
        },

        fanxingTips: {
            default:null,
            type:cc.Node,
        },

        btnFanxing: {
            default: null,
            type: cc.Node
        },

        piaofenToggles: {
            default:null,
            type:cc.Node
        },

        piaofenLab: {
            default:null,
            type:cc.Label,
        },

        piaofenTips: {
            default:null,
            type:cc.Node,
        },

        btnPiaofen: {
            default: null,
            type: cc.Node
        },

        gameRules: {
            default: [],
            type: [cc.Toggle]
        },

        gameRulesLab: {
            default:null,
            type:cc.Label,
        },

        gameRulesTips: {
            default: null,
            type: cc.Node
        },

        btnGameRules: {
            default: null,
            type: cc.Node
        },

        allGameRulesToggle: {
            default: null,
            type: cc.Toggle
        },

        gaojis: {
            default: [],
            type: [cc.Toggle]
        },

        gaojiLab: {
            default:null,
            type:cc.Label,
        },

        gaojiTips: {
            default: null,
            type: cc.Node
        },

        btnGaoji: {
            default: null,
            type: cc.Node
        },

        allGaojiToggle: {
            default: null,
            type: cc.Toggle
        },

        inCoinLab:{
            default:null,
            type:cc.Node,
            displayName:"入场金币"
        },

        leaveCoinLab:{
            default:null,
            type:cc.Node,
            displayName:"离场金币"
        },

        moreLessFrames: {
            default: [],
            type: cc.SpriteFrame
        }

    },

    // use this for initialization
    onLoad: function () {
        this._gameName = cc.enum.GameName.zp_chz;
        cc.utils.setNodeWinSize(this.node);

        this._min = 40;
        this._innings = [0, 3, 5, 8];
    },

    showRecord: function () {
        //显示之前存储的
        let data = this._data;
        if (!data || data.gameName != this._gameName) {
            data = null;
            let jsonstr = cc.sys.localStorage.getItem(this._gameName+'_record');
            if (jsonstr) {
                data = JSON.parse(jsonstr);
            }
        }

        if (data) {
            let game_rule = data.game_rule || {};
            let room_rule = data.room_rule || {};
            this._anteValue = game_rule.ante == undefined ? 5000 : game_rule.ante;
            this._startNumberValue = room_rule.startNumber == undefined ? 3 : room_rule.startNumber;
            this._inningValue = room_rule.inningLimit == undefined ? 3 : room_rule.inningLimit;
            this._wangNumValue = game_rule.wangNum == undefined ? 2 : game_rule.wangNum;
            this._fanxingValue = game_rule.fanxing == undefined ? 1: game_rule.fanxing;
            this._piaofenValue = game_rule.piaofen == undefined ? 0: game_rule.piaofen;

            this._gameRulesValue = game_rule.gameRules == undefined ? [true, true]: game_rule.gameRules;

            this._halfwayValue = room_rule.halfway == undefined ? true : room_rule.halfway;
            this._stopCheatingsValue = game_rule.stopCheatings == undefined ? false : game_rule.stopCheatings;
        } else {
            this._anteValue = 20000;
            this._inningValue = 3;
            this._startNumberValue = 3;            //开局人数：2，3，4
            this._wangNumValue = 2;
            this._fanxingValue = 1;
            this._piaofenValue = 0;
            this._gameRulesValue = [true, true];
            this._halfwayValue = true;             //中途加入0 1
            this._stopCheatingsValue = false;       //防作弊 0 1
        }

        let self = this;
        this._anteValue = this._anteValue > 200000 ? 20000 : this._anteValue;
        //底注
        this.anteToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self.getAnteIdx());
        });

        //开局人数
        this.numbersToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == (self._startNumberValue-2));
        });

        //最少局数 0 3 5 8
        this.inningToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == (self._innings.indexOf(self._inningValue)));
        });

        //王数量
        this.wangNumToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._wangNumValue);
        });

        //翻醒
        this.fanxingToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._fanxingValue);
        });

        //飘分
        this.piaofenToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._piaofenValue);
        });

        //游戏规则
        this.gameRules.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = self._gameRulesValue[i];
        });

        //房间开始后禁止加入    防作弊
        this.gaojis[0].getComponent(cc.Toggle).isChecked = this._halfwayValue;
        this.gaojis[1].getComponent(cc.Toggle).isChecked = this._stopCheatingsValue;

        this.checkAnteLab();
        this.checkNmbersLab();
        this.checkInningLab();
        this.checkWangNumLab();
        this.checkFanxingLab();
        this.checkPiaofenLab();
        this.checkGameRulesLab();
        this.checkGaojiLab();
    },

    open (cid, cb, data) {
        this._cid = cid;
        this._cb = cb;
        this._data = data;
        this.resetAll();
        this.showRecord();
    },

    getAnteIdx () {
        let idx = 0;
        switch (this._anteValue) {
            case 1000:
                idx = 0;
                break;
            case 5000:
                idx = 1;
                break;
            case 10000:
                idx = 2;
                break;
            case 20000:
                idx = 3;
                break;
            case 50000:
                idx = 4;
                break;
        }
        return idx;
    },

    checkScoreLab () {
        let score = this._anteValue*this._min;
        let instr = cc.utils.getScoreStr(score);
        let leavestr = '小于'+cc.utils.getScoreStr(score*0.8);
        this.inCoinLab.getComponent(cc.Label).string = instr;
        this.leaveCoinLab.getComponent(cc.Label).string = leavestr;
    },

    getCreateData () {
        /** 获取创建房间的信息 */
        let data = {
            gameName: this._gameName,                   //游戏类型
            room_rule: {
                startNumber: this._startNumberValue,    //开局人数
                playerMax: this._startNumberValue-2,    //最大人数
                halfway: this._halfwayValue,            //是否中途加入
                inningLimit: this._inningValue,         //限制局数
            },

            //游戏规则
            game_rule: {
                ante: this._anteValue,
                wangNum: this._wangNumValue,
                fanxing: this._fanxingValue,
                piaofen: this._piaofenValue,
                gameRules: this._gameRulesValue,
                stopCheatings: this._stopCheatingsValue,
            }                        
        };

        cc.sys.localStorage.setItem(this._gameName+'_record', JSON.stringify(data));

        return data;
    },

    onCreate: function () {
        cc.vv.audioMgr.playButtonSound();
        let data = this.getCreateData();

        if (this._cid) {
            this.node.active = false;
            if (this._cb) {
                this._cb(data);
            }
        } else {
            cc.connect.createRoom(data, function (code, msg) {
                if(code === 200){
                    cc.connect.joinRoom(msg.rid);
                } else {
                    cc.utils.openErrorTips(code);
                }
            });
        }
    },

    onDeletePressed: function () {
        cc.vv.audioMgr.playButtonSound();

        if (this._cid) {
            cc.utils.openLoading('删除中...');
            cc.connect.post('del_private_room', {uid: cc.dm.user.uid, cid: this._cid, gameName: this._gameName}, function (msg) {
                this.node.active = false;
                cc.utils.openTips('删除成功');
            }.bind(this), function (code) {
                cc.utils.openErrorTips(code);
            });
        }
    },

    onCancel () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    resetAll () {
        this.anteTips.active = false;
        this.btnAnte.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.numbersTips.active = false;
        this.btnNumbers.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.inningTips.active = false;
        this.btnInning.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.wangNumTips.active = false;
        this.btnWangNum.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.fanxingTips.active = false;
        this.btnFanxing.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.piaofenTips.active = false;
        this.btnPiaofen.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.gameRulesTips.active = false;
        this.gaojiTips.active = false;
    },

    onBtnAntePressed () {
        if (this.anteTips.active) {
            this.anteTips.active = false;
            this.btnAnte.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.anteTips.active = true;
            this.btnAnte.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onAnteTogglesPressed (event, data) {
        this.resetAll();
        this._anteValue = parseInt(data);
        this.checkAnteLab();
    },

    checkAnteLab() {
        this.anteLab.string = cc.utils.getScoreStr(this._anteValue);
        this.checkScoreLab();
    },

    onbtnNumberssPressed () {
        if (this.numbersTips.active) {
            this.numbersTips.active = false;
            this.btnNumbers.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.numbersTips.active = true;
            this.btnNumbers.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onNumberTogglesPressed (event, data) {
        this.resetAll();
        this._startNumberValue = parseInt(data);
        this.checkNmbersLab();
    },

    checkNmbersLab() {
        this.numbersLab.string = this._startNumberValue+'人';
    },

    onBtnInningPressed () {
        if (this.inningTips.active) {
            this.inningTips.active = false;
            this.btnInning.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.inningTips.active = true;
            this.btnInning.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onInningTogglePressed (event, data) {
        this.resetAll();
        this._inningValue = parseInt(data);
        this.checkInningLab();
    },

    checkInningLab() {
        let str = '';
        switch (this._inningValue) {
            case 0:
                str = '不限';
                break;
            case 3:
                str = '3局';
                break;
            case 5:
                str = '5局';
                break;
            case 8:
                str = '8局';
                break;
            default:
                break;
        }

        this.inningLab.string = str;
    },

    onBtnWangNumPressed () {
        if (this.wangNumTips.active) {
            this.wangNumTips.active = false;
            this.btnWangNum.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.wangNumTips.active = true;
            this.btnWangNum.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onWangNumTogglePressed (event, data) {
        this.resetAll();
        this._wangNumValue = parseInt(data);
        this.checkWangNumLab();
    },

    checkWangNumLab() {
        let str = '';
        switch (this._wangNumValue) {
            case 0:
                str = '无';
                break;
            case 1:
                str = '一个王';
                break;
            case 2:
                str = '两个王';
                break;
            case 3:
                str = '三个王';
                break;
            case 4:
                str = '四个王';
                break;
            default:
                break;
        }

        this.wangNumLab.string = str;
    },

    onBtnFanxingPressed () {
        if (this.fanxingTips.active) {
            this.fanxingTips.active = false;
            this.btnFanxing.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.fanxingTips.active = true;
            this.btnFanxing.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onFanxingTogglePressed (event, data) {
        this.resetAll();
        this._fanxingValue = parseInt(data);
        this.checkFanxingLab();
    },

    checkFanxingLab() {
        let str = '';
        switch (this._fanxingValue) {
            case 0:
                str = '下醒';
                break;
            case 1:
                str = '本醒';
                break;
            case 2:
                str = '上醒';
                break;
            case 3:
                str = '跟醒';
                break;
            default:
                break;
        }

        this.fanxingLab.string = str;
    },

    onBtnPiaofenPressed () {
        if (this.piaofenTips.active) {
            this.piaofenTips.active = false;
            this.btnPiaofen.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.piaofenTips.active = true;
            this.btnPiaofen.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onPiaofenTogglePressed (event, data) {
        this.resetAll();
        this._piaofenValue = parseInt(data);
        this.checkPiaofenLab();
    },

    checkPiaofenLab() {
        let str = '';
        switch (this._piaofenValue) {
            case 0:
                str = '不飘分';
                break;
            case 1:
                str = '10倍飘分';
                break;
            case 2:
                str = '20倍飘分';
                break;
            case 3:
                str = '30倍飘分';
                break;
            default:
                break;
        }

        this.piaofenLab.string = str;
    },

    onBtnGameRulesPressed () {
        if (this.gameRulesTips.active) {
            this.gameRulesTips.active = false;
        } else {
            this.resetAll();
            this.gameRulesTips.active = true;
        }
    },

    onGameRulesTogglesPressed (event, data) {
        let idx = parseInt(data);
        this._gameRulesValue[idx] = !this._gameRulesValue[idx];
        this.checkGameRulesLab();
    },

    onGameRulesAllTogglesPressed (event, data) {
        this.checkGameRulesLab(this.allGameRulesToggle.getComponent(cc.Toggle).isChecked);
    },

    checkGameRulesLab (all) {
        if (all != undefined) {
            if (all) {
                this.gameRulesLab.string = '坐醒    兴红黑';
            } else {
                this.gameRulesLab.string = '无';
            }

            this._gameRulesValue = all ? [true,true] : [false,false];
            this.gameRules.forEach(function (t) {
                t.getComponent(cc.Toggle).isChecked = all;
            });
        } else {
            all = true;
            let str = '';
            this._gameRulesValue.forEach((v, i) => {
                if (i == 0) { str += v ? '坐醒    ' : ''; }
                if (i == 1) { str += v ? '兴红黑    ' : ''; }
                if (!v) {
                    all = false;
                }
            });
            str = (str.length == 0 ? '无' : str);
            this.gameRulesLab.string = str;
            this.allGameRulesToggle.getComponent(cc.Toggle).isChecked = all;
        }
    },

    onBtnGaojiPressed () {
        if (this.gaojiTips.active) {
            this.gaojiTips.active = false;
        } else {
            this.resetAll();
            this.gaojiTips.active = true;
        }
    },

    onGaojiTogglesPressed (event, data) {
        this.checkGaojiLab();
    },

    onGaojiAllTogglesPressed (event, data) {
        this.checkGaojiLab(this.allGaojiToggle.getComponent(cc.Toggle).isChecked);
    },

    checkGaojiLab (all) {
        if (all != undefined) {
            if (all) {
                this.gaojiLab.string = '房间开始后可以加入    防作弊';
            } else {
                this.gaojiLab.string = '无';
            }

            this._stopCheatingsValue = all;
            this._halfwayValue = all;
            this._isNotHas6Value = all ? 1 : 0;

            this.gaojis.forEach(function (t) {
                t.getComponent(cc.Toggle).isChecked = all;
            });
        } else {
            all = true;
            let str = '';
            this.gaojis.forEach(function (t, i) {
                if (i == 0) {
                    this._halfwayValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._halfwayValue) {
                        str += '房间开始后可以加入    ';
                    } else {
                        all = false;
                    }
                }

                if (i == 1) {
                    this._stopCheatingsValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._stopCheatingsValue) {
                        str += '防作弊    ';
                    } else {
                        all = false;
                    }
                }
            }.bind(this));

            str = str.length == 0 ? '无' : str;
            this.gaojiLab.string = str;
            this.allGaojiToggle.getComponent(cc.Toggle).isChecked = all;
        }
    },

});
