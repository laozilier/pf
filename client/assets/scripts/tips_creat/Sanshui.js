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

        maxToggles:{
            default:null,
            type:cc.Node
        },

        maxLab: {
            default:null,
            type:cc.Label,
        },

        maxTips: {
            default:null,
            type:cc.Node,
        },

        btnMax: {
            default: null,
            type: cc.Button
        },

        maCardToggles:{
            default:null,
            type:cc.Node
        },

        maCardLab: {
            default:null,
            type:cc.Label,
        },

        maCardTips: {
            default:null,
            type:cc.Node,
        },

        btnMaCard: {
            default: null,
            type: cc.Button
        },

        shootScoreToggles:{
            default:null,
            type:cc.Node
        },

        shootScoreLab: {
            default:null,
            type:cc.Label,
        },

        shootScoreTips: {
            default:null,
            type:cc.Node,
        },

        btnShootScore: {
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
        this._gameName = cc.enum.GameName.sanshui;
        cc.utils.setNodeWinSize(this.node);
        this._min = 100;
        this._max = this._min*20;
    },

    showRecord () {
        //显示之前存储的
        let self = this;
        let data = this._data;
        if (!data || data.gameName != this._gameName) {
            data = null;
            let jsonstr = cc.sys.localStorage.getItem("sanshui_record");
            if (jsonstr) {
                data = JSON.parse(jsonstr);
            }
        }

        if (data) {
            let room_rule = data.room_rule || {};
            let game_rule = data.game_rule || {};
            this._anteValue = game_rule.ante == undefined ? 10000 : game_rule.ante;
            if (this._anteValue > 100000) {
                this._anteValue = 100000;
            }
            this._startNumberValue = room_rule.startNumber == undefined ? 2 : room_rule.startNumber;
            this._halfwayValue = room_rule.halfway == undefined ? true : room_rule.halfway;
            this._withOutSpecialValue = game_rule.withOutSpecial == undefined ? false : game_rule.withOutSpecial;
            this._playerMaxValue = room_rule.playerMax == undefined ? 0 : room_rule.playerMax;   //最大人数
            this._hasBankerValue = game_rule.hasBanker == undefined ? false: game_rule.hasBanker;
            this._maCardValue = game_rule.maCard == undefined ? 0 : game_rule.maCard;
            this._shootScoreValue = game_rule.shootScore == undefined ? 0 : game_rule.shootScore;
        } else {
            this._anteValue = 5000;
            this._startNumberValue = 2;
            this._halfwayValue = true;
            this._playerMaxValue = 0;   //最大人数  0 = 4 1 = 7
            this._hasBankerValue = false;
            this._maCardValue = 0;
            this._shootScoreValue = 0;
            this._withOutSpecialValue = true;
        }

        //底注
        this.anteToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self.getAnteIdx());
        });

        //开局人数
        this.numbersToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == (self._startNumberValue-2));
        });

        //最大人数
        this.maxToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._playerMaxValue);
        });

        //最大人数
        this.maxToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._playerMaxValue);
        });

        //马牌设置
        this.maCardToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._maCardValue);
        });

        //打枪分数
        this.shootScoreToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._shootScoreValue);
        });

        //房间开始后禁止加入   有无特殊牌型
        this.gaojis[0].getComponent(cc.Toggle).isChecked = this._halfwayValue;
        this.gaojis[1].getComponent(cc.Toggle).isChecked = this._withOutSpecialValue;
        this.gaojis[2].getComponent(cc.Toggle).isChecked = this._hasBankerValue;

        this.checkAnteLab();
        this.checkNmbersLab();
        this.checkMaCardLab();
        this.checkShootScoreLab();
        this.checkMaxLab();
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
        this.resetAll();
        this.showRecord();
    },

    limitTogglePressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.checkScoreLab();
    },

    checkScoreLab () {
        let score = this._anteValue*this._min;
        let instr = cc.utils.getScoreStr(score);
        let leavestr = cc.utils.getScoreStr(score*0.8);
        this.inCoinLab.getComponent(cc.Label).string = instr;
        this.leaveCoinLab.getComponent(cc.Label).string = leavestr;
    },

    getCreateData () {
        //底分 100 5000 10000 20000 50000 100000
        let data = {
            gameName:this._gameName,                //游戏类型
            room_rule: {
                halfway: this._halfwayValue,         //是否中途加入
                startNumber: this._startNumberValue,//人数
                playerMax: this._playerMaxValue,
                inning: 0,
            },

            game_rule:{
                withOutSpecial: this._withOutSpecialValue,           //是否有特殊牌型
                ante: this._anteValue,
                hasBanker: this._hasBankerValue,
                maCard: this._maCardValue,
                shootScore: this._shootScoreValue
            }
        }

        cc.sys.localStorage.setItem("sanshui_record", JSON.stringify(data));

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

    resetAll () {
        this.anteTips.active = false;
        this.btnAnte.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.numbersTips.active = false;
        this.btnNumbers.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.maxTips.active = false;
        this.btnMaCard.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.maCardTips.active = false;
        this.btnShootScore.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.shootScoreTips.active = false;
        this.btnMax.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
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
        let str = cc.utils.getScoreStr(this._anteValue);
        this.anteLab.string = str;
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

    onbtnMaxPressed () {
        cc.vv.audioMgr.playButtonSound();
        if (this.maxTips.active) {
            this.maxTips.active = false;
            this.btnMax.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.maxTips.active = true;
            this.btnMax.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onMaxTogglesPressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.resetAll();
        this._playerMaxValue = parseInt(data);
        this.checkMaxLab();

    },

    checkMaxLab() {
        this.maxLab.string = cc.enum.playerMax[this._gameName][this._playerMaxValue]+'人';
    },

    onbtnMaCardPressed () {
        cc.vv.audioMgr.playButtonSound();
        if (this.maCardTips.active) {
            this.maCardTips.active = false;
            this.btnMaCard.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.maCardTips.active = true;
            this.btnMaCard.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onMaCardTogglesPressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.resetAll();
        this._maCardValue = parseInt(data);
        this.checkMaCardLab();

    },

    checkMaCardLab() {
        switch (this._maCardValue) {
            case 0:
                this.maCardLab.string = '无';
                break;
            case 1:
                this.maCardLab.string = '黑桃5';
                break;
            case 2:
                this.maCardLab.string = '黑桃10';
                break;
            case 3:
                this.maCardLab.string = '黑桃A';
                break;
            default:
                break;
        }

    },

    onbtnShootScorePressed () {
        cc.vv.audioMgr.playButtonSound();
        if (this.shootScoreTips.active) {
            this.shootScoreTips.active = false;
            this.btnShootScore.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.shootScoreTips.active = true;
            this.btnShootScore.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onShootScoreTogglesPressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.resetAll();
        this._shootScoreValue = parseInt(data);
        this.checkShootScoreLab();

    },

    checkShootScoreLab() {
        switch (this._shootScoreValue) {
            case 0:
                this.shootScoreLab.string = '翻倍';
                break;
            case 1:
                this.shootScoreLab.string = '加一';
                break;
            default:
                break;
        }

    },

    onBtnGaojiPressed () {
        cc.vv.audioMgr.playButtonSound();
        if (this.gaojiTips.active) {
            this.gaojiTips.active = false;
        } else {
            this.resetAll();
            this.gaojiTips.active = true;
        }
    },

    onGaojiTogglesPressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.checkGaojiLab();
    },

    onGaojiAllTogglesPressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.checkGaojiLab(this.allGaojiToggle.getComponent(cc.Toggle).isChecked);
    },

    checkGaojiLab (all) {
        if (all != undefined) {
            if (all) {
                this.gaojiLab.string = '房间开始后可以加入    有特殊牌型    有庄模式';
            } else {
                this.gaojiLab.string = '无';
            }

            this._halfwayValue = all;
            this._withOutSpecialValue = all;
            this._hasBankerValue = all;

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
                        str += '房间开始后不可加入    ';
                        all = false;
                    }
                }

                if (i == 1) {
                    this._withOutSpecialValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._withOutSpecialValue) {
                        str += '无特殊牌型    ';
                    } else {
                        str += '有特殊牌型    ';
                        all = false;
                    }
                }

                if (i == 2) {
                    this._hasBankerValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._hasBankerValue) {
                        str += '有庄模式';
                    } else {
                        str += '无庄模式';
                        all = false;
                    }
                }
            }.bind(this));

            this.gaojiLab.string = str;
            this.allGaojiToggle.getComponent(cc.Toggle).isChecked = all;
        }
    },

});