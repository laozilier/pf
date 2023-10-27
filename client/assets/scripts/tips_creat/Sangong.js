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

        anteEditBox: {
            default:null,
            type:cc.EditBox,
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

        anteDoubleToggles:{
            default:null,
            type:cc.Node
        },

        anteDoubleLab: {
            default:null,
            type:cc.Label,
        },

        anteDoubleTips: {
            default:null,
            type:cc.Node,
        },

        btnAnteDouble: {
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

        playModeToggles: {
            default:null,
            type:cc.Node
        },

        playModeLab: {
            default:null,
            type:cc.Label,
        },

        playModeTips: {
            default:null,
            type:cc.Node,
        },

        btnPlayMode: {
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

        tuizhuToggles: {
            default:null,
            type:cc.Node
        },

        tuizhuLab: {
            default:null,
            type:cc.Label,
        },

        tuizhuTips: {
            default:null,
            type:cc.Node,
        },

        btnTuizhu: {
            default: null,
            type: cc.Button
        },

        multipleToggles: {
            default:null,
            type:cc.Node
        },

        multipleLab: {
            default:null,
            type:cc.Label,
        },

        multipleTips: {
            default:null,
            type:cc.Node,
        },

        btnMultiple: {
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
        this._gameName = cc.enum.GameName.sangong;
        cc.utils.setNodeWinSize(this.node);
        this._min = 2*8;
        this._max = this._min*20;
    },

    showRecord () {
        //显示之前存储的
        let self = this;
        let data = this._data;
        if (!data || data.gameName != this._gameName) {
            data = null;
            let jsonstr = cc.sys.localStorage.getItem("sangong_record");
            if (jsonstr) {
                data = JSON.parse(jsonstr);
            }
        }

        if (data) {
            let room_rule = data.room_rule || {};
            let game_rule = data.game_rule || {};
            this._anteValue = game_rule.ante == undefined ? 5000 : game_rule.ante;
            if (this._anteValue > 20000) {
                this._anteValue = 20000;
            }
            this._startNumberValue = room_rule.startNumber == undefined ? 2 : room_rule.startNumber;
            this._playerMaxValue = 0;//room_rule.playerMax == undefined ? 0 : room_rule.playerMax;   //最大人数
            this._playModeValue = game_rule.playMode == undefined ? 0 : game_rule.playMode;
            this._inningValue = room_rule.inning == undefined ? 0 : room_rule.inning;
            this._anteDoubleValue = game_rule.anteDouble == undefined ? false : game_rule.anteDouble;
            this._tuizhuValue = game_rule.tuizhu == undefined ? 0 : game_rule.tuizhu;
            this._multipleValue = game_rule.multiple == undefined ? 0 : game_rule.multiple;
            this._halfwayValue = room_rule.halfway == undefined ? true : room_rule.halfway;
            this._cuopaiValue = game_rule.cuopai == undefined ? true : game_rule.cuopai;
        } else {
            this._anteValue = 5000;
            this._startNumberValue = 2;
            this._playModeValue = 0;
            this._inningValue = 0;
            this._anteDoubleValue = false;
            this._tuizhuValue = 0;
            this._multipleValue = 0;
            this._halfwayValue = true;
            this._cuopaiValue = true;

            this._playerMaxValue = 0;   //最大人数  0 = 6 1 = 8 2 = 10
        }

        //底注
        this.anteToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self.getAnteIdx());
        });

        //开局人数
        this.numbersToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == (self._startNumberValue-2));
        });

        //游戏模式
        this.playModeToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._playModeValue);
        });

        //最大人数
        this.maxToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._playerMaxValue);
        });

        //抢庄加倍
        this.anteDoubleToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._anteDoubleValue);
        });

        //推注
        this.tuizhuToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._tuizhuValue);
        });

        //抢庄倍数
        this.multipleToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._multipleValue);
        });

        //房间开始后禁止加入    禁止搓牌
        this.gaojis[0].getComponent(cc.Toggle).isChecked = this._halfwayValue;
        this.gaojis[1].getComponent(cc.Toggle).isChecked = this._cuopaiValue;

        this.checkAnteLab();
        this.checkNmbersLab();
        this.checkPlayModeLab();
        this.checkMaxLab();
        this.checkAnteDoubleLab();
        this.checkTuizhuLab();
        this.checkMultipleLab();
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
        let score = this._anteValue*this._min*(this._multipleValue+1);
        let instr = cc.utils.getScoreStr(score);
        let leavestr = cc.utils.getScoreStr(score*0.8);
        this.inCoinLab.getComponent(cc.Label).string = instr;
        this.leaveCoinLab.getComponent(cc.Label).string = leavestr;
    },

    getCreateData () {
        let data = {
            gameName:this._gameName,                //游戏类型
            room_rule: {
                halfway:this._halfwayValue,             //是否中途加入
                startNumber: this._startNumberValue,    //开局人数
                playerMax: this._playerMaxValue,        //最大人数
                inning: this._inningValue,              //最少局数
            },
            game_rule:{
                playMode: this._playModeValue,      //游戏模式
                cuopai:this._cuopaiValue,           //是否搓牌
                ante:this._anteValue,               //底注
                entryLimit: 100,                    //入场限制
                anteDouble: this._anteDoubleValue,  //抢庄加倍
                tuizhu:this._tuizhuValue,           //推注
                multiple:this._multipleValue,       //抢庄倍数
            }
        };

        cc.sys.localStorage.setItem("sangong_record", JSON.stringify(data));

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
        this.btnMax.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.playModeTips.active = false;
        this.btnPlayMode.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.inningTips.active = false;
        this.btnInning.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.anteDoubleTips.active = false;
        this.btnAnteDouble.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.tuizhuTips.active = false;
        this.btnTuizhu.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.multipleTips.active = false;
        this.btnMultiple.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
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

    onAnteEditBoxEndEditing() {
        let anteValue = parseInt(this.editBox.string || '5000');
        if (anteValue > 100000) {
            anteValue = 100000;
        }

        if (anteValue < 100) {
            anteValue = 100;
        }

        anteValue-=anteValue%100;

        this._anteValue = anteValue;
        this.checkAnteLab();
    },

    checkAnteLab() {
        let str = cc.utils.getScoreStr(this._anteValue);
        this.anteLab.string = str;
        this.anteEditBox.string = str;
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

    onbtnAnteDoublePressed () {
        cc.vv.audioMgr.playButtonSound();
        if (this.anteDoubleTips.active) {
            this.anteDoubleTips.active = false;
            this.btnAnteDouble.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.anteDoubleTips.active = true;
            this.btnAnteDouble.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onAnteDoubleTogglesPressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.resetAll();
        this._anteDoubleValue = parseInt(data);
        this.checkAnteDoubleLab();

    },

    checkAnteDoubleLab() {
        this.anteDoubleLab.string = this._anteDoubleValue ? '加倍' : '不加';
    },

    onbtnMaxPressed () {
        cc.vv.audioMgr.playButtonSound();
        cc.utils.openWeakTips('敬请期待更多人数场次');
        return;

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
        cc.utils.openWeakTips('敬请期待更多人数场次');
        return;

        this.resetAll();
        this._playerMaxValue = parseInt(data);
        this.checkMaxLab();

    },

    checkMaxLab() {
        this.maxLab.string = (6+this._playerMaxValue*2)+'人';
    },

    onBtnPlayModePressed () {
        if (this.playModeTips.active) {
            this.playModeTips.active = false;
            this.btnPlayMode.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.playModeTips.active = true;
            this.btnPlayMode.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onPlayModeTogglePressed (event, data) {
        this.resetAll();
        this._playModeValue = parseInt(data);
        this.checkPlayModeLab();
    },

    checkPlayModeLab() {
        let str = '';
        switch (this._playModeValue) {
            case 0:
                str = '经典三公';
                break;
            default:
                str = '三公比金花';
                break;
        }

        this.playModeLab.string = str;
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

    onBtnTuizhuPressed () {
        cc.vv.audioMgr.playButtonSound();
        if (this.tuizhuTips.active) {
            this.tuizhuTips.active = false;
            this.btnTuizhu.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.tuizhuTips.active = true;
            this.btnTuizhu.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onTuizhuTogglePressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.resetAll();
        this._tuizhuValue = parseInt(data);
        this.checkTuizhuLab();
    },

    checkTuizhuLab() {
        let str = '';
        switch (this._tuizhuValue) {
            case 0:
                str = '无';
                break;
            case 1:
                str = '5倍';
                break;
            case 2:
                str = '10倍';
                break;
            case 3:
                str = '20倍';
                break;
            default:
                break;
        }

        this.tuizhuLab.string = str;
    },

    onBtnMultiplePressed () {
        cc.vv.audioMgr.playButtonSound();
        if (this.multipleTips.active) {
            this.multipleTips.active = false;
            this.btnMultiple.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.multipleTips.active = true;
            this.btnMultiple.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onMultipleTogglesPressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.resetAll();
        this._multipleValue = parseInt(data);
        this.checkMultipleLab();
        this.checkScoreLab();
    },

    checkMultipleLab() {
        let str = '';
        switch (this._multipleValue) {
            case 0:
                str = '1倍';
                break;
            case 1:
                str = '2倍';
                break;
            case 2:
                str = '3倍';
                break;
            case 3:
                str = '4倍';
                break;
            default:
                break;
        }

        this.multipleLab.string = str;
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
                this.gaojiLab.string = '房间开始后可以加入    可搓牌';
            } else {
                this.gaojiLab.string = '无';
            }

            this._halfwayValue = all;
            this._cuopaiValue = all;

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
                    this._cuopaiValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._cuopaiValue) {
                        str += '可搓牌';
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