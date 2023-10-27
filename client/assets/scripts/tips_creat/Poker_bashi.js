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

        needRed2Toggles:{
            default:null,
            type:cc.Node
        },

        needRed2Lab: {
            default:null,
            type:cc.Label,
        },

        needRed2Tips: {
            default:null,
            type:cc.Node,
        },

        btnNeedRed2: {
            default: null,
            type: cc.Node
        },

        fanCountToggles:{
            default:null,
            type:cc.Node
        },

        fanCountLab: {
            default:null,
            type:cc.Label,
        },

        fanCountTips: {
            default:null,
            type:cc.Node,
        },

        btnFanCount: {
            default: null,
            type: cc.Node
        },

        fanzhuMulToggles:{
            default:null,
            type:cc.Node
        },

        fanzhuMulLab: {
            default:null,
            type:cc.Label,
        },

        fanzhuMulTips: {
            default:null,
            type:cc.Node,
        },

        btnFanzhuMul: {
            default: null,
            type: cc.Node
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
        this._gameName = cc.enum.GameName.poker_bashi;
        cc.utils.setNodeWinSize(this.node);

        this._min = 12;
        this._innings = [0, 3, 5, 8];
        this._fanCounts = [3,5,0];
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
            this._anteValue = game_rule.ante == undefined ? 20000 : game_rule.ante;
            this._startNumberValue = 4;//room_rule.startNumber == undefined ? 4 : room_rule.startNumber;
            this._inningValue = room_rule.inningLimit == undefined ? 3 : room_rule.inningLimit;

            this._needRed2Value = game_rule.needRed2 == undefined ? 0 : game_rule.needRed2;
            this._fanCountValue = game_rule.fanCount == undefined ? 0 : game_rule.fanCount;
            this._fanzhuMulValue = game_rule.fanzhuMul == undefined ? 0 : game_rule.fanzhuMul;

            this._halfwayValue = room_rule.halfway == undefined ? true : room_rule.halfway;
            this._stopCheatingsValue = game_rule.stopCheatings == undefined ? false : game_rule.stopCheatings;
            this._isNotHas6Value = game_rule.isNotHas6 == undefined ? 1 : game_rule.isNotHas6;
        } else {
            this._anteValue = 20000;
            this._inningValue = 3;
            this._startNumberValue = 4;            //开局人数：2，3
            this._needRed2Value = 0;
            this._fanCountValue = 0;
            this._fanzhuMulValue = 0;

            this._halfwayValue = true;             //中途加入0 1
            this._stopCheatingsValue = false;       //防作弊 0 1
            this._isNotHas6Value = 0;
        }

        let self = this;
        this._anteValue = this._anteValue > 200000 ? 20000 : this._anteValue;
        //底注
        this.anteToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self.getAnteIdx());
        });

        //开局人数 4人
        this.numbersToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == (self._startNumberValue-2));
        });

        //最少局数 0 3 5 8
        this.inningToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == (self._innings.indexOf(self._inningValue)));
        });

        //叫主限制
        this.needRed2Toggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._needRed2Value);
        });

        //反主次数
        this.fanCountToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._fanCounts.indexOf(self._fanCountValue));
        });

        //反主加倍
        this.fanzhuMulToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._fanzhuMulValue);
        });

        //房间开始后禁止加入    防作弊
        this.gaojis[0].getComponent(cc.Toggle).isChecked = this._halfwayValue;
        this.gaojis[1].getComponent(cc.Toggle).isChecked = this._stopCheatingsValue;
        this.gaojis[2].getComponent(cc.Toggle).isChecked = this._isNotHas6Value == 1 ? true : false;

        this.checkAnteLab();
        this.checkNmbersLab();
        this.checkInningLab();
        this.checkNeedRed2Lab();
        this.checkFanCountLab();
        this.checkFanzhuMulLab();
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
            case 10000:
                idx = 0;
                break;
            case 20000:
                idx = 1;
                break;
            case 50000:
                idx = 2;
                break;
            case 100000:
                idx = 3;
                break;
            case 200000:
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
                playerMax: 0, //最大人数
                halfway: this._halfwayValue,            //是否中途加入
                inningLimit: this._inningValue,         //限制局数
            },

            //游戏规则
            game_rule: {
                ante: this._anteValue,
                needRed2: this._needRed2Value,
                fanCount: this._fanCountValue,
                fanzhuMul: this._fanzhuMulValue,
                stopCheatings: this._stopCheatingsValue,
                isNotHas6: this._isNotHas6Value
            }                        
        };

        console.log('益阳巴十规则 = ', data);
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
        this.needRed2Tips.active = false;
        this.btnNeedRed2.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.fanCountTips.active = false;
        this.btnFanCount.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.fanzhuMulTips.active = false;
        this.btnFanzhuMul.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
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

    onBtnNeedRed2Pressed () {
        if (this.needRed2Tips.active) {
            this.needRed2Tips.active = false;
            this.btnNeedRed2.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.needRed2Tips.active = true;
            this.btnNeedRed2.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onNeedRed2TogglePressed (event, data) {
        this.resetAll();
        this._needRed2Value = parseInt(data);
        this.checkNeedRed2Lab();
    },

    checkNeedRed2Lab() {
        let str = '';
        switch (this._needRed2Value) {
            case 0:
                str = '不需带红2';
                break;
            case 1:
                str = '需带红2';
                break;
            default:
                break;
        }

        this.needRed2Lab.string = str;
    },

    onBtnFanCountPressed () {
        if (this.fanCountTips.active) {
            this.fanCountTips.active = false;
            this.btnFanCount.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.fanCountTips.active = true;
            this.btnFanCount.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onFanCountTogglePressed (event, data) {
        this.resetAll();
        this._fanCountValue = parseInt(data);
        this.checkFanCountLab();
    },

    checkFanCountLab() {
        let str = this._fanCountValue+'次';
        if (this._fanCountValue == 0) {
            str = '不限制';
        }

        this.fanCountLab.string = str;
    },

    onBtnFanzhuMulPressed () {
        if (this.fanzhuMulTips.active) {
            this.fanzhuMulTips.active = false;
            this.btnFanzhuMul.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.fanzhuMulTips.active = true;
            this.btnFanzhuMul.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onFanzhuMulTogglePressed (event, data) {
        this.resetAll();
        this._fanzhuMulValue = parseInt(data);
        this.checkFanzhuMulLab();
    },

    checkFanzhuMulLab() {
        let str = '';
        if (this._fanzhuMulValue == 0) {
            str = '倍数加1';
        } else {
            str = '倍数乘2';
        }

        this.fanzhuMulLab.string = str;
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
                this.gaojiLab.string = '房间开始后可以加入    防作弊    除6';
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

                if (i == 2) {
                    this._isNotHas6Value = t.getComponent(cc.Toggle).isChecked ? 1 : 0;
                    if (this._isNotHas6Value) {
                        str += '除6';
                    } else {
                        str += '不除6';
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
