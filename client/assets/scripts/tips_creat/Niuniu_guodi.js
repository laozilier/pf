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
            type: cc.Node
        },

        multipleRuleToggles:{
            default:null,
            type:cc.Node
        },

        multipleRuleLab: {
            default:null,
            type:cc.Label,
        },

        multipleRuleTips: {
            default:null,
            type:cc.Node,
        },

        btnMultipleRule: {
            default: null,
            type: cc.Node
        },

        betsToggles:{
            default:null,
            type:cc.Node
        },

        betsLab: {
            default:null,
            type:cc.Label,
        },

        betsTips: {
            default:null,
            type:cc.Node,
        },

        btnBets: {
            default: null,
            type: cc.Node
        },

        shouInningToggles:{
            default:null,
            type:cc.Node
        },

        shouInningLab: {
            default:null,
            type:cc.Label,
        },

        shouInningTips: {
            default:null,
            type:cc.Node,
        },

        btnShouInning: {
            default: null,
            type: cc.Node
        },

        maxCountToggles:{
            default:null,
            type:cc.Node
        },

        maxCountLab: {
            default:null,
            type:cc.Label,
        },

        maxCountTips: {
            default:null,
            type:cc.Node,
        },

        btnMaxCount: {
            default: null,
            type: cc.Node
        },

        minBankMulToggles:{
            default:null,
            type:cc.Node
        },

        minBankMulLab: {
            default:null,
            type:cc.Label,
        },

        minBankMulTips: {
            default:null,
            type:cc.Node,
        },

        btnMinBankMul: {
            default: null,
            type: cc.Node
        },

        maxBankMulToggles:{
            default:null,
            type:cc.Node
        },

        maxBankMulLab: {
            default:null,
            type:cc.Label,
        },

        maxBankMulTips: {
            default:null,
            type:cc.Node,
        },

        btnMaxBankMul: {
            default: null,
            type: cc.Node
        },

        teshus: {
            default: [],
            type: [cc.Toggle]
        },

        teshuLab: {
            default:null,
            type:cc.Label,
        },

        teshuTips: {
            default: null,
            type: cc.Node
        },

        btnTeshu: {
            default: null,
            type: cc.Node
        },

        allTeshuToggle: {
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

    // LIFE-CYCLE CALLBACKS:

    onLoad:function () {
        this._gameName = cc.enum.GameName.niuniu_guodi;
        cc.utils.setNodeWinSize(this.node);
        this._min = 2*8;
        this._max = this._min*20;

        this._minBankMuls = [0, 0.1, 0.2];
        this._maxBankMuls = [5, 10, 20, 40, 80];
    },

    showRecord () {
        //显示之前存储的
        let self = this;
        let data = this._data;
        if (!data || data.gameName != this._gameName) {
            data = null;
            let jsonstr = cc.sys.localStorage.getItem("niuniu_guodi_record");
            if (jsonstr) {
                data = JSON.parse(jsonstr);
            }
        }

        if (data) {
            let room_rule = data.room_rule || {};
            let game_rule = data.game_rule || {};
            this._anteValue = game_rule.ante == undefined ? 100000 : game_rule.ante;
            if (this._anteValue < 50000) {
                this._anteValue = 100000;
            } else if (this._anteValue > 800000) {
                this._anteValue = 800000;
            }

            this._startNumberValue = room_rule.startNumber == undefined ? 2 : room_rule.startNumber;
            this._anteDoubleValue = game_rule.anteDouble == undefined ? false : game_rule.anteDouble;
            this._tuizhuValue = game_rule.tuizhu == undefined ? 0 : game_rule.tuizhu;
            this._multipleValue = game_rule.multiple == undefined ? 0 : game_rule.multiple;
            this._isWhnValue = game_rule.isWhn == undefined ? true : game_rule.isWhn;   //this.五花牛,
            this._isSnValue = game_rule.isSn == undefined ? true : game_rule.isSn;      //this.顺子牛,
            this._isThnValue = game_rule.isThn == undefined ? true : game_rule.isThn;   //this.同花牛,
            this._isHlnValue = game_rule.isHln == undefined ? true : game_rule.isHln;   //this.葫芦牛,
            this._isZdnValue = game_rule.isZdn == undefined ? true : game_rule.isZdn;   //this.炸弹牛,
            this._isWxnValue = game_rule.isWxn == undefined ? true : game_rule.isWxn;   //this.五小牛,
            this._isQdnValue = game_rule.isQdn == undefined ? false : game_rule.isQdn;  //this.全大牛,
            this._isJpnValue = game_rule.isJpn == undefined ? false : game_rule.isJpn;  //this.金牌牛,
            this._isThsValue = game_rule.isThs == undefined ? false : game_rule.isThs;  //this.同花顺,

            this._halfwayValue = room_rule.halfway == undefined ? true : room_rule.halfway;
            this._cuopaiValue = game_rule.cuopai == undefined ? true : game_rule.cuopai;
            this._whValue = game_rule.wh == undefined ? false : game_rule.wh;    //无花,
            this._mpHoldsValue = game_rule.mpHolds == undefined ? false : game_rule.mpHolds;    //明牌,

            if (this._whValue) {
                this._playerMaxValue = 0;
            } else {
                this._playerMaxValue = room_rule.playerMax == undefined ? 0 : room_rule.playerMax;   //最大人数
            }

            this._multipleRuleValue = game_rule.multipleRule == undefined ? 0 : game_rule.multipleRule;
            this._betsValue = game_rule.bets == undefined ? 0 : game_rule.bets;
            this._maxCountValue = game_rule.maxCount == undefined ? 1 : game_rule.maxCount;
            this._shouInningValue = game_rule.shouInning == undefined ? 3 : game_rule.shouInning;
            this._minBankMulValue = game_rule.minBankMul == undefined ? 0 : game_rule.minBankMul;
            this._maxBankMulValue = game_rule.maxBankMul == undefined ? 10 : game_rule.maxBankMul;

            this._isLaiziValue = game_rule.isLaizi == undefined ? false : game_rule.isLaizi;    //赖子,
        } else {
            this._anteValue = 100000;
            this._startNumberValue = 2;
            this._halfwayValue = true;
            this._cuopaiValue = true;
            this._whValue = false;

            this._isWhnValue = true;    //this.五花牛,
            this._isSnValue = true;     //this.顺子牛,
            this._isThnValue = true;    //this.同花牛,
            this._isHlnValue = true;    //this.葫芦牛,
            this._isZdnValue = true;    //this.炸弹牛,
            this._isWxnValue = true;    //this.五小牛,
            this._isThsValue = true;    //this.同花顺,
            this._isQdnValue = false;
            this._isJpnValue = false;

            this._playerMaxValue = 0;   //最大人数  0 = 6 1 = 8 2 = 10
            this._multipleRuleValue = 0;
            this._betsValue = 0;
            this._maxCountValue = 1;
            this._shouInningValue = 3;
            this._isLaiziValue = false;
            this._mpHoldsValue = fasle;

            this._minBankMulValue = 0;
            this._maxBankMulValue = 10;
        }

        this._playerMaxValue = this._playerMaxValue > 1 ? 1 : this._playerMaxValue;
        this._isJpnValue_save = this._isJpnValue;

        if (this._multipleRuleValue > 0) {
            this._multipleValue > 1 && (this._multipleValue = 1);
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

        //翻倍规则
        this.multipleRuleToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._multipleRuleValue);
        });

        //下注
        this.betsToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._betsValue);
        });

        //收庄局数
        let shouInnings = [3,5,8];
        this.shouInningToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == shouInnings.indexOf(self._shouInningValue));
        });

        //连庄次数
        this.maxCountToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._maxCountValue);
        });

        //强制下庄
        this.minBankMulToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._minBankMuls.indexOf(self._minBankMulValue));
        });

        //强制收庄
        this.maxBankMulToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._maxBankMuls.indexOf(self._maxBankMulValue));
        });

        //五花牛(5倍)    顺子牛(5倍)    同花牛(6倍) 葫芦牛(5倍)    炸弹牛(7倍)    五小牛(8倍)    全大牛(6倍)
        this.teshus[0].getComponent(cc.Toggle).isChecked = this._isWhnValue;
        this.teshus[1].getComponent(cc.Toggle).isChecked = this._isSnValue;
        this.teshus[2].getComponent(cc.Toggle).isChecked = this._isThnValue;
        this.teshus[3].getComponent(cc.Toggle).isChecked = this._isHlnValue;
        this.teshus[4].getComponent(cc.Toggle).isChecked = this._isZdnValue;
        this.teshus[5].getComponent(cc.Toggle).isChecked = this._isWxnValue;
        this.teshus[6].getComponent(cc.Toggle).isChecked = this._isQdnValue;
        this.teshus[7].getComponent(cc.Toggle).isChecked = this._isThsValue;
        this.teshus[8].getComponent(cc.Toggle).isChecked = this._isJpnValue;

        //房间开始后禁止加入    禁止搓牌
        this.gaojis[0].getComponent(cc.Toggle).isChecked = this._halfwayValue;
        this.gaojis[1].getComponent(cc.Toggle).isChecked = this._cuopaiValue;
        this.gaojis[2].getComponent(cc.Toggle).isChecked = this._whValue;
        this.gaojis[3].getComponent(cc.Toggle).isChecked = this._isLaiziValue;
        this.gaojis[4].getComponent(cc.Toggle).isChecked = this._mpHoldsValue;

        this.checkAnteLab();
        this.checkNmbersLab();
        this.checkMaxLab();
        this.checkMultipleRuleLab();
        this.checkBetsLab();
        this.checkShouInningLab();
        this.checkMaxCountLab();
        this.checkMinBankMulLab();
        this.checkMaxBankMulLab();
        this.checkTeshuLab();
        this.checkGaojiLab();
    },

    getAnteIdx () {
        let idx = 0;
        switch (this._anteValue) {
            case 50000:
                idx = 0;
                break;
            case 100000:
                idx = 1;
                break;
            case 200000:
                idx = 2;
                break;
            case 400000:
                idx = 3;
                break;
            case 800000:
                idx = 4;
                break;
            default:
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
        let instr = cc.utils.getScoreStr(this._anteValue*1.2);
        let leavestr = cc.utils.getScoreStr(this._anteValue);
        this.inCoinLab.getComponent(cc.Label).string = instr;
        this.leaveCoinLab.getComponent(cc.Label).string = leavestr;
    },

    getCreateData () {
        //底分 100 5000 10000 20000 50000 100000
        //推注 0 1 2 3
        //倍数 0 1 2 3
        //人数 2 3 4 5 6
        let data = {
            gameName:this._gameName,                //游戏类型
            room_rule: {
                halfway:this._halfwayValue,         //是否中途加入
                startNumber: this._startNumberValue,//开局人数
                playerMax: this._playerMaxValue,    //最大人数
                inningLimit: 0,                     //局数限制
            },
            game_rule: {
                cuopai:this._cuopaiValue,           //是否搓牌
                ante:this._anteValue,               //底注
                multiple:1,                         //抢庄倍数
                maxCount:this._maxCountValue,       //连庄次数
                shouInning:this._shouInningValue,   //收庄局数
                minBankMul:this._minBankMulValue,
                maxBankMul:this._maxBankMulValue,
                isWhn:this._isWhnValue,     //this.五花牛,
                isSn:this._isSnValue,       //this.顺子牛,
                isThn:this._isThnValue,     //this.同花牛,
                isHln:this._isHlnValue,     //this.葫芦牛,
                isZdn:this._isZdnValue,     //this.炸弹牛,
                isWxn:this._isWxnValue,     //this.五小牛,
                isThs:this._isThsValue,     //this.同花顺,
                isQdn:this._isQdnValue,     //全大牛
                isJpn:this._isJpnValue,     //金牌牛
                wh: this._whValue,          //无花
                multipleRule: this._multipleRuleValue,  //翻倍规则
                bets:0,                     //下注选项
                isLaizi: this._isLaiziValue, //是否有赖子
                mpHolds: this._mpHoldsValue //是否明牌
            }
        };

        cc.sys.localStorage.setItem("niuniu_guodi_record", JSON.stringify(data));

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

    resetAll () {
        this.anteTips.active = false;
        this.btnAnte.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.numbersTips.active = false;
        this.btnNumbers.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.maxTips.active = false;
        this.btnMax.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.multipleRuleTips.active = false;
        this.btnMultipleRule.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.betsTips.active = false;
        this.btnBets.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.shouInningTips.active = false;
        this.btnShouInning.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.maxCountTips.active = false;
        this.btnMaxCount.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.minBankMulTips.active = false;
        this.btnMinBankMul.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.maxBankMulTips.active = false;
        this.btnMaxBankMul.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];

        this.teshuTips.active = false;
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

    onbtnMaxPressed () {
        cc.vv.audioMgr.playButtonSound();
        if (this._whValue) {
            cc.utils.openTips('无花玩法最多人数为6人');
            return;
        }

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
        this.maxLab.string = (6+this._playerMaxValue*2)+'人';
    },

    resetMax() {
        let self = this;
        self._playerMaxValue = 0;
        //最大人数
        self.maxToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._playerMaxValue);
        });

        self.checkMaxLab();
    },

    onBtnMultipleRulePressed () {
        cc.vv.audioMgr.playButtonSound();
        if (this.multipleRuleTips.active) {
            this.multipleRuleTips.active = false;
            this.btnMultipleRule.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.multipleRuleTips.active = true;
            this.btnMultipleRule.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onMultipleRuleTogglePressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.resetAll();
        this._multipleRuleValue = parseInt(data);
        this.checkMultipleRuleLab();
    },

    checkMultipleRuleLab() {
        let str = '';
        switch (this._multipleRuleValue) {
            case 0:
                str = '牛牛4倍 牛九3倍 牛八牛七2倍';
                this.multipleRuleLab.fontSize = 20;
                this.teshus.forEach(function (el, i) {
                    switch (i) {
                        case 0:
                            el.node.getChildByName('Label').getComponent(cc.Label).string = '五花牛(5倍)';
                            break;
                        case 1:
                            el.node.getChildByName('Label').getComponent(cc.Label).string = '顺子牛(6倍)';
                            break;
                        case 2:
                            el.node.getChildByName('Label').getComponent(cc.Label).string = '同花牛(7倍)';
                            break;
                        case 3:
                            el.node.getChildByName('Label').getComponent(cc.Label).string = '葫芦牛(8倍)';
                            break;
                        case 4:
                            el.node.getChildByName('Label').getComponent(cc.Label).string = '炸弹牛(9倍)';
                            break;
                        case 5:
                            el.node.getChildByName('Label').getComponent(cc.Label).string = '五小牛(10倍)';
                            break;
                        case 6:
                            el.node.getChildByName('Label').getComponent(cc.Label).string = '全大牛(10倍)';
                            break;
                        case 7:
                            el.node.getChildByName('Label').getComponent(cc.Label).string = '同花顺(10倍)';
                            break;
                        default:
                            break;
                    }
                });
                break;
            case 1:
                str = '牛番';
                this.multipleRuleLab.fontSize = 30;
                this.teshus.forEach(function (el, i) {
                    switch (i) {
                        case 0:
                            el.node.getChildByName('Label').getComponent(cc.Label).string = '五花牛(11倍)';
                            break;
                        case 1:
                            el.node.getChildByName('Label').getComponent(cc.Label).string = '顺子牛(12倍)';
                            break;
                        case 2:
                            el.node.getChildByName('Label').getComponent(cc.Label).string = '同花牛(13倍)';
                            break;
                        case 3:
                            el.node.getChildByName('Label').getComponent(cc.Label).string = '葫芦牛(14倍)';
                            break;
                        case 4:
                            el.node.getChildByName('Label').getComponent(cc.Label).string = '炸弹牛(15倍)';
                            break;
                        case 5:
                            el.node.getChildByName('Label').getComponent(cc.Label).string = '五小牛(16倍)';
                            break;
                        case 6:
                            el.node.getChildByName('Label').getComponent(cc.Label).string = '全大牛(16倍)';
                            break;
                        case 7:
                            el.node.getChildByName('Label').getComponent(cc.Label).string = '同花顺(16倍)';
                            break;
                        default:
                            break;
                    }
                });
                break;
            default:
                break;
        }

        this.multipleRuleLab.string = str;
        this.checkTeshuLab();
    },

    onBtnBetsPressed () {
        cc.vv.audioMgr.playButtonSound();
        if (this.betsTips.active) {
            this.betsTips.active = false;
            this.btnBets.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.betsTips.active = true;
            this.btnBets.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onBetsTogglePressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.resetAll();
        this._betsValue = parseInt(data);
        this.checkBetsLab();
    },

    checkBetsLab() {
        let str = '';
        switch (this._betsValue) {
            case 0:
                str = '底注(10/5/4)分之一';
                break;
            case 1:
                str = '底注 1/2/3/4/5倍';
                break;
            default:
                break;
        }

        this.betsLab.string = str;
    },

    onBtnShouInningPressed () {
        cc.vv.audioMgr.playButtonSound();
        if (this.shouInningTips.active) {
            this.shouInningTips.active = false;
            this.btnShouInning.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.shouInningTips.active = true;
            this.btnShouInning.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onShouInningTogglePressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.resetAll();
        this._shouInningValue = parseInt(data);
        this.checkShouInningLab();
    },

    checkShouInningLab() {
        let str = this._shouInningValue+'局';
        this.shouInningLab.string = str;
    },

    onBtnMaxCountPressed () {
        cc.vv.audioMgr.playButtonSound();
        if (this.maxCountTips.active) {
            this.maxCountTips.active = false;
            this.btnMaxCount.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.maxCountTips.active = true;
            this.btnMaxCount.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onMaxCountTogglePressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.resetAll();
        this._maxCountValue = parseInt(data);
        this.checkMaxCountLab();
    },

    checkMaxCountLab() {
        let maxCounts = ['不能连庄', '一次', '两次'];
        let str = maxCounts[this._maxCountValue];
        this.maxCountLab.string = str;
    },

    onBtnMinBankMulPressed () {
        cc.vv.audioMgr.playButtonSound();
        if (this.minBankMulTips.active) {
            this.minBankMulTips.active = false;
            this.btnMinBankMul.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.minBankMulTips.active = true;
            this.btnMinBankMul.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onMinBankMulTogglePressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.resetAll();
        this._minBankMulValue = this._minBankMuls[parseInt(data)];
        this.checkMinBankMulLab();
    },

    checkMinBankMulLab() {
        let strs = ['锅底输光', '小于锅底1/10', '小于锅底1/5'];
        let idx = this._minBankMuls.indexOf(this._minBankMulValue);
        let str = strs[idx];
        this.minBankMulLab.string = str;
    },

    onBtnMaxBankMulPressed () {
        cc.vv.audioMgr.playButtonSound();
        if (this.maxBankMulTips.active) {
            this.maxBankMulTips.active = false;
            this.btnMaxBankMul.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.maxBankMulTips.active = true;
            this.btnMaxBankMul.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onMaxBankMulTogglePressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.resetAll();
        this._maxBankMulValue = parseInt(data);
        this.checkMaxBankMulLab();
    },

    checkMaxBankMulLab() {
        this.maxBankMulLab.string = this._maxBankMulValue+'倍锅底';
    },

    onBtnTeshuPressed () {
        cc.vv.audioMgr.playButtonSound();
        if (this.teshuTips.active) {
            this.teshuTips.active = false;
        } else {
            this.resetAll();
            this.teshuTips.active = true;
        }
    },

    onTeshuTogglesPressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.checkTeshuLab(null, true);
    },

    onTeshuAllTogglesPressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.checkTeshuLab(this.allTeshuToggle.getComponent(cc.Toggle).isChecked);
    },

    checkTeshuLab (all, isClick) {
        if (all != undefined) {
            if (all) {
                if (this._multipleRuleValue > 0) {
                    this.teshuLab.string = '五花牛(11倍)    顺子牛(12倍)    同花牛(13倍)    葫芦牛(14倍)    炸弹牛(15倍)    五小牛(16倍)    全大牛(16倍)    同花顺(16倍)    金牌牛';
                } else {
                    this.teshuLab.string = '五花牛(5倍)    顺子牛(6倍)    同花牛(7倍)    葫芦牛(8倍)    炸弹牛(9倍)    五小牛(10倍)    全大牛(10倍)    同花顺(10倍)    金牌牛';
                }

            } else {
                this.teshuLab.string = '无';
            }

            this._isWhnValue = all;    //this.五花牛,
            if (!this._whValue) {
                this._isSnValue = all;     //this.顺子牛,
            }

            this._isThnValue = all;    //this.同花牛,
            this._isHlnValue = all;    //this.葫芦牛,
            this._isZdnValue = all;    //this.炸弹牛,
            this._isWxnValue = all;    //this.五小牛,
            this._isThsValue = all;    //this.同花顺,
            if (this._whValue) {
                this._isQdnValue = all;    //this.全大牛,
            }

            this._isJpnValue = all;    //this.金牌牛,

            this.teshus.forEach(function (t) {
                t.getComponent(cc.Toggle).isChecked = all;
            });
        } else {
            all = true;
            let str = '';
            this.teshus.forEach(function (t, i) {
                if (i == 0) {
                    this._isWhnValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._isWhnValue) {
                        str += this._multipleRuleValue > 0 ? '五花牛(11倍)    ' : '五花牛(5倍)    ';
                    } else {
                        if (!this._whValue) {
                            all = false;
                        }
                    }
                }

                if (i == 1) {
                    this._isSnValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._isSnValue) {
                        str += this._multipleRuleValue > 0 ? '顺子牛(12倍)    ' : '顺子牛(6倍)    ';
                    }  else {
                        all = false;
                    }
                }

                if (i == 2) {
                    this._isThnValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._isThnValue) {
                        str += this._multipleRuleValue > 0 ? '同花牛(13倍)    ' : '同花牛(7倍)    ';
                    } else {
                        all = false;
                    }
                }

                if (i == 3) {
                    this._isHlnValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._isHlnValue) {
                        str += this._multipleRuleValue > 0 ? '葫芦牛(14倍)    ' : '葫芦牛(8倍)    ';
                    } else {
                        all = false;
                    }
                }

                if (i == 4) {
                    this._isZdnValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._isZdnValue) {
                        str += this._multipleRuleValue > 0 ? '炸弹牛(15倍)    ' : '炸弹牛(9倍)    ';
                    } else {
                        all = false;
                    }
                }

                if (i == 5) {
                    this._isWxnValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._isWxnValue) {
                        str += this._multipleRuleValue > 0 ? '五小牛(16倍)    ' : '五小牛(10倍)    ';
                    } else {
                        all = false;
                    }
                }

                if (i == 6) {
                    this._isQdnValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._isQdnValue) {
                        str += this._multipleRuleValue > 0 ? '全大牛(16倍)    ' : '全大牛(10倍)    ';
                    } else {
                        if (this._whValue) {
                            all = false;
                        }
                    }
                }

                if (i == 7) {
                    this._isThsValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._isThsValue) {
                        str += this._multipleRuleValue > 0 ? '同花顺(16倍)    ' : '同花顺(10倍)    ';
                    } else {
                        all = false;
                    }
                }

                if (i == 8) {
                    this._isJpnValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._isJpnValue) {
                        str += '金牌牛';
                    } else {
                        all = false;
                    }

                    if (isClick) {
                        this._isJpnValue_save = this._isJpnValue;
                    }
                }
            }.bind(this));

            str = str.length == 0 ? '无':str;
            this.teshuLab.string = str;
            this.allTeshuToggle.getComponent(cc.Toggle).isChecked = all;
        }
    },

    checkWhTeshu() {
        if (this._whValue) {
            let toggle0 = this.teshus[0];
            toggle0.isChecked = false;
            toggle0.node.active = false;

            let toggle6 = this.teshus[6];
            toggle6.isChecked = true;
            toggle6.node.active = true;

            let toggle7 = this.teshus[7];
            toggle7.isChecked = this._isJpnValue_save;
        } else {
            let toggle0 = this.teshus[0];
            toggle0.isChecked = true;
            toggle0.node.active = true;

            let toggle6 = this.teshus[6];
            toggle6.isChecked = false;
            toggle6.node.active = false;

            let toggle7 = this.teshus[7];
            toggle7.isChecked = this._isJpnValue_save;
        }

        this.checkTeshuLab();
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
                this.gaojiLab.string = '房间开始后可以加入    可搓牌    无花    有赖子    明牌';
            } else {
                this.gaojiLab.string = '房间开始后不可加入    不可搓牌    有花    无赖子    暗牌';
            }

            this._halfwayValue = all;
            this._cuopaiValue = all;
            this._whValue = all;

            this.gaojis.forEach(function (t) {
                t.getComponent(cc.Toggle).isChecked = all;
            });

            if (all) {
                this.resetMax();
            }

            this.checkWhTeshu();
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
                    this._cuopaiValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._cuopaiValue) {
                        str += '可搓牌    ';
                    } else {
                        str += '不可搓牌    ';
                        all = false;
                    }
                }

                if (i == 2) {
                    this._whValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._whValue) {
                        str += '无花    ';
                        this.resetMax();
                    } else {
                        str += '有花    ';
                        all = false;
                    }
                    this.checkWhTeshu();
                }

                if (i == 3) {
                    this._isLaiziValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._isLaiziValue) {
                        str += '有赖子    ';
                    } else {
                        str += '无赖子    ';
                        all = false;
                    }
                }

                if (i == 4) {
                    this._mpHoldsValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._mpHoldsValue) {
                        str += '明牌';
                    } else {
                        str += '暗牌';
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