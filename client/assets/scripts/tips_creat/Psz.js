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

        mustMenToggles: {
            default:null,
            type:cc.Node
        },

        mustMenLab: {
            default:null,
            type:cc.Label,
        },

        mustMenTips: {
            default:null,
            type:cc.Node,
        },

        btnMustMen: {
            default: null,
            type: cc.Button
        },

        flushBTAbcToggles: {
            default:null,
            type:cc.Node
        },

        flushBTAbcLab: {
            default:null,
            type:cc.Label,
        },

        flushBTAbcTips: {
            default:null,
            type:cc.Node,
        },

        btnFlushBTAbc: {
            default: null,
            type: cc.Button
        },

        maxRoundToggles: {
            default:null,
            type:cc.Node
        },

        maxRoundLab: {
            default:null,
            type:cc.Label,
        },

        maxRoundTips: {
            default:null,
            type:cc.Node,
        },

        btnMaxRound: {
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
        this._gameName = cc.enum.GameName.psz;
        cc.utils.setNodeWinSize(this.node);
        this._innings = [0, 3, 5, 8];
        this._maxRounds = [7, 10, 12];
        this._minMuls = [100, 120, 160];
        this._minMul = this._minMuls[0];
        this._leaveMul = this._minMul*0.8;
    },

    showRecord () {
        //显示之前存储的
        let self = this;
        let data = this._data;
        if (!data || data.gameName != this._gameName) {
            data = null;
            let jsonstr = cc.sys.localStorage.getItem(this._gameName);
            if (jsonstr) {
                data = JSON.parse(jsonstr);
            }
        }

        if (data) {
            let room_rule = data.room_rule;
            let game_rule = data.game_rule;
            this._anteValue = game_rule.ante == undefined ? 5000 : game_rule.ante;
            if (this._anteValue > 10000) {
                this._anteValue = 5000;
            }
            this._startNumberValue = room_rule.startNumber == undefined ? 2 : room_rule.startNumber;
            this._playerMaxValue = room_rule.playerMax == undefined ? 0 : room_rule.playerMax;   //最大人数
            this._inningValue = room_rule.inning == undefined ? 2 : room_rule.inning;
            this._mustMenValue = game_rule.mustMen == undefined ? 0 : game_rule.mustMen;
            this._flushBTAbcValue = game_rule.flushBTAbc == undefined ? true : game_rule.flushBTAbc;
            this._maxRoundValue = game_rule.maxRound == undefined ? 7 : game_rule.maxRound;
            this._halfwayValue = room_rule.halfway == undefined ? true : room_rule.halfway;
            this._stopCheatingsValue = game_rule.stopCheatings == undefined ? true : game_rule.stopCheatings;
        } else {
            this._anteValue = 5000;
            this._startNumberValue = 2;
            this._playerMaxValue = 0;
            this._inningValue = 0;
            this._mustMenValue = 0;
            this._flushBTAbcValue = true;
            this._maxRoundValue = 7;

            this._halfwayValue = true;
            this._stopCheatingsValue = false;
        }

        this._playerMaxValue = 2;
        //底注
        this.anteToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self.getAnteIdx());
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

        //必闷轮数
        this.mustMenToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._mustMenValue);
        });

        //金花顺子谁大
        this.flushBTAbcToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = ((self._flushBTAbcValue && i == 0) || (!self._flushBTAbcValue && i == 1));
        });

        //最大轮数 7 10 12 15
        this.inningToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == (self._maxRounds.indexOf(self._maxRoundValue)));
        });

        //房间开始后禁止加入    防作弊
        this.gaojis[0].getComponent(cc.Toggle).isChecked = this._halfwayValue;
        this.gaojis[1].getComponent(cc.Toggle).isChecked = this._stopCheatingsValue;

        this.checkAnteLab();
        this.checkNmbersLab();
        this.checkPlayerMaxLab();
        this.checkInningLab();
        this.checkMustMenLab();
        this.checkFlushBTAbcLab();
        this.checkMaxRoundLab();
        this.checkGaojiLab();
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
            case 100000:
                idx = 5;
                break;
        }
        return idx;
    },

    open (cid, cb, data) {
        this._cid = cid;
        this._cb = cb;
        this._data = data;
        this._first = true;
        this.resetAll();
        this.showRecord();
    },

    checkScoreLab () {
        let idx = this._maxRounds.indexOf(this._maxRoundValue);
        this._minMul = this._minMuls[idx] || 100;
        let instr = cc.utils.getScoreStr(this._anteValue*this._minMul);
        this._leaveMul = this._minMul*0.8;
        let leavestr = cc.utils.getScoreStr(this._anteValue*this._leaveMul);
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
                mustMen: this._mustMenValue,
                flushBTAbc: this._flushBTAbcValue,
                maxRound: this._maxRoundValue,
                stopCheatings: this._stopCheatingsValue
            }
        };

        cc.sys.localStorage.setItem(this._gameName, JSON.stringify(data));
        return data;
    },

    onCreate: function () {
        cc.vv.audioMgr.playButtonSound();
        var data = this.getCreateData();

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
        this.mustMenTips.active = false;
        this.btnMustMen.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.flushBTAbcTips.active = false;
        this.btnFlushBTAbc.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.maxRoundTips.active = false;
        this.btnMaxRound.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
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
        this._anteValue = parseInt(data);
        this.checkAnteLab();
    },

    checkAnteLab() {
        this.anteLab.string = cc.utils.getScoreStr(this._anteValue);
        this.checkScoreLab();
    },

    onbtnNumberssPressed () {
        cc.vv.audioMgr.playButtonSound();
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
        cc.utils.openTips('敬请期待更多人数场次');
        return;

        if (this.playerMaxTips.active) {
            this.playerMaxTips.active = false;
            this.btnPlayerMax.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.playerMaxTips.active = true;
            this.btnPlayerMax.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
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

    onBtnMustMenPressed () {
        if (this.mustMenTips.active) {
            this.mustMenTips.active = false;
            this.btnMustMen.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.mustMenTips.active = true;
            this.btnMustMen.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onMustMenTogglePressed (event, data) {
        this.resetAll();
        this._mustMenValue = parseInt(data);
        this.checkMustMenLab();
    },

    checkMustMenLab() {
        this.mustMenLab.string = this._mustMenValue > 0 ? this._mustMenValue+'轮' : '无';
    },

    onBtnFlushBTAbcPressed () {
        if (this.flushBTAbcTips.active) {
            this.flushBTAbcTips.active = false;
            this.btnFlushBTAbc.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.flushBTAbcTips.active = true;
            this.btnFlushBTAbc.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onFlushBTAbcTogglePressed (event, data) {
        this.resetAll();
        this._flushBTAbcValue = (parseInt(data) == 0);
        this.checkFlushBTAbcLab();
    },

    checkFlushBTAbcLab() {
        this.flushBTAbcLab.string = this._flushBTAbcValue ? '金花大于顺子' : '顺子大于金花';
    },

    onBtnMaxRoundPressed () {
        if (this.maxRoundTips.active) {
            this.maxRoundTips.active = false;
            this.btnMaxRound.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.maxRoundTips.active = true;
            this.btnMaxRound.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onMaxRoundTogglePressed (event, data) {
        this.resetAll();
        this._maxRoundValue = parseInt(data);
        this.checkMaxRoundLab();
    },

    checkMaxRoundLab() {
        this.maxRoundLab.string = this._maxRoundValue+'轮';
        this.checkScoreLab();
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