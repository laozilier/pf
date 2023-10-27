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
            type: cc.Button
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
            type: cc.Button
        },

        playerMaxToggles:{
            default:null,
            type:cc.Node
        },

        playerMaxLab: {
            default:null,
            type:cc.Label,
        },

        playerMaxTips: {
            default:null,
            type:cc.Node,
        },

        btnPlayerMax: {
            default: null,
            type: cc.Button
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
            type: cc.Button
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
            type: cc.Button
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

    // LIFE-CYCLE CALLBACKS:

    onLoad:function () {
        this._gameName = cc.enum.GameName.dsq;
        cc.utils.setNodeWinSize(this.node);
        this._minMul = 240;
        this._leaveMul = this._minMul*0.8;
        this._innings = [0, 3, 5, 8];
    },

    showRecord () {
        //显示之前存储的
        let self = this;
        let data = undefined;
        let jsonstr = cc.sys.localStorage.getItem(this._gameName);
        if (jsonstr) {
            data = JSON.parse(jsonstr);
        }

        if (data) {
            let room_rule = data.room_rule || {};
            let game_rule = data.game_rule || {};
            this._anteValue = game_rule.ante == undefined ? 500000 : game_rule.ante;
            if (this._anteValue < 100000) {
                this._anteValue = 100000;
            } else if (this._anteValue > 10000000) {
                this._anteValue = 10000000;
            }

            this._startNumberValue = room_rule.startNumber == undefined ? 2 : room_rule.startNumber;
            this._playerMaxValue = room_rule.playerMax == undefined ? 0 : room_rule.playerMax;   //最大人数
            this._inningValue = room_rule.inning == undefined ? 0 : room_rule.inning;
            this._halfwayValue = room_rule.halfway == undefined ? true : room_rule.halfway;
            this._stopCheatingsValue = game_rule.stopCheatings == undefined ? true : game_rule.stopCheatings;
        } else {
            this._anteValue = !!this._cid ? 20000 : 100000;
            this._startNumberValue = 2;
            this._playerMaxValue = 0;
            this._inningValue = 0;
            this._halfwayValue = true;
            this._stopCheatingsValue = false;
        }

        this._startNumberValue = 2;
        this._playerMaxValue = 0;
        //底注
        this.anteToggles.children.forEach(function (el, i) {
            el.getChildByName('Label').getComponent(cc.Label).string = cc.utils.getScoreStr(self._antes[i]);
            el.getComponent(cc.Toggle).isChecked = (self._antes[i] == self._anteValue);
        });

        //开局人数
        this.numbersToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == (self._startNumberValue-2));
        });

        //最大人数
        this.playerMaxToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == (self._playerMaxValue));
        });

        //最少局数 0 3 5 8
        this.inningToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == (self._innings.indexOf(self._inningValue)));
        });

        //房间开始后禁止加入    防作弊
        this.gaojis[0].getComponent(cc.Toggle).isChecked = this._halfwayValue;
        this.gaojis[1].getComponent(cc.Toggle).isChecked = this._stopCheatingsValue;

        this.checkAnteLab();
        this.checkNmbersLab();
        this.checkPlayerMaxLab();
        this.checkInningLab();
        this.checkGaojiLab();
    },

    open (cid, cb, data) {
        this._antes = [100000, 500000, 1000000, 2000000, 5000000, 10000000];
        this._cid = cid;
        this._cb = cb;
        this._data = data;
        this.resetAll();
        this.showRecord();
    },

    checkScoreLab () {
        let instr = '0';//cc.utils.getScoreStr(this._anteValue*this._minMul);
        let leavestr = '0';//cc.utils.getScoreStr(this._anteValue*this._leaveMul);
        this.inCoinLab.getComponent(cc.Label).string = instr;
        this.leaveCoinLab.getComponent(cc.Label).string = leavestr;
    },

    getCreateData () {
        /** 获取创建房间的信息 */
        let data = {
            gameName: this._gameName,
            room_rule: {
                startNumber: this._startNumberValue,
                playerMax: this._playerMaxValue,
                inning: this._inningValue,
                halfway: this._halfwayValue
            },

            game_rule: {
                ante: this._anteValue,
                stopCheatings: this._stopCheatingsValue,
            }
        };

        cc.sys.localStorage.setItem(this._gameName, JSON.stringify(data));
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
                if(code === 200) {
                    cc.connect.joinRoom(msg.rid);
                } else {
                    cc.utils.openErrorTips(code);
                }
            });
        }
    },

    onCancel () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

    resetAll () {
        this.anteTips.active = false;
        this.btnAnte.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.numbersTips.active = false;
        this.btnNumbers.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.playerMaxTips.active = false;
        this.btnPlayerMax.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.inningTips.active = false;
        this.btnInning.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.gaojiTips.active = false;
    },

    onBtnAntePressed () {
        cc.vv.audioMgr.playButtonSound();
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
        cc.vv.audioMgr.playButtonSound();
        this.resetAll();
        this._anteValue = this._antes[parseInt(data)];
        this.checkAnteLab();
    },

    checkAnteLab() {
        this.anteLab.string = cc.utils.getScoreStr(this._anteValue);
        this.checkScoreLab();
    },

    onbtnNumberssPressed () {
        cc.vv.audioMgr.playButtonSound();
    },

    onNumberTogglesPressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.resetAll();
        this._startNumberValue = parseInt(data);
        this.checkNmbersLab();

    },

    checkNmbersLab() {
        this.numbersLab.string = this._startNumberValue+'人';
    },

    onbtnPlayerMaxPressed () {
        cc.vv.audioMgr.playButtonSound();
    },

    onPlayerMaxTogglesPressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.resetAll();
        this._playerMaxValue = parseInt(data);
        this.checkPlayerMaxLab();
    },

    checkPlayerMaxLab() {
        this.playerMaxLab.string = cc.enum.playerMax[this._gameName][this._playerMaxValue]+'人';
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
                        str += '防作弊';
                    } else {
                        all = false;
                    }
                }
            }.bind(this));

            str = str.length == 0 ? '无':str;
            this.gaojiLab.string = str;
            this.allGaojiToggle.getComponent(cc.Toggle).isChecked = all;
        }
    },

});