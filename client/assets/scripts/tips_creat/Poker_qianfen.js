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

        xiScoreModeToggles: {
            default:null,
            type:cc.Node
        },

        xiScoreModeLab: {
            default:null,
            type:cc.Label,
        },

        xiScoreModeTips: {
            default:null,
            type:cc.Node,
        },

        btnXiScoreMode: {
            default: null,
            type: cc.Button
        },

        rewardScoreToggles: {
            default:null,
            type:cc.Node
        },

        rewardScoreLab: {
            default:null,
            type:cc.Label,
        },

        rewardScoreTips: {
            default:null,
            type:cc.Node,
        },

        btnRewardScore: {
            default: null,
            type: cc.Button
        },

        rewardScoreModeToggles: {
            default:null,
            type:cc.Node
        },

        rewardScoreModeLab: {
            default:null,
            type:cc.Label,
        },

        rewardScoreModeTips: {
            default:null,
            type:cc.Node,
        },

        btnRewardScoreMode: {
            default: null,
            type: cc.Button
        },

        rankScore3Node: {
            default:null,
            type:cc.Node
        },
        
        rankScore3Toggles: {
            default:null,
            type:cc.Node
        },

        rankScore3Lab: {
            default:null,
            type:cc.Label,
        },

        rankScore3Tips: {
            default:null,
            type:cc.Node,
        },

        btnRankScore3: {
            default: null,
            type: cc.Button
        },

        rankScore2Node: {
            default:null,
            type:cc.Node
        },

        rankScore2Toggles: {
            default:null,
            type:cc.Node
        },

        rankScore2Lab: {
            default:null,
            type:cc.Label,
        },

        rankScore2Tips: {
            default:null,
            type:cc.Node,
        },

        btnRankScore2: {
            default: null,
            type: cc.Button
        },

        settleScoreToggles: {
            default:null,
            type:cc.Node
        },

        settleScoreLab: {
            default:null,
            type:cc.Label,
        },

        settleScoreTips: {
            default:null,
            type:cc.Node,
        },

        btnSettleScore: {
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

    // use this for initialization
    onLoad: function () {
        this._gameName = cc.enum.GameName.poker_qianfen;
        cc.utils.setNodeWinSize(this.node);

        this._min = 1000;
        this._rewardScores = [100, 200];
        this._settleScores = [300, 500, 800, 1000];
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
            this._anteValue = game_rule.ante == undefined ? 2000 : game_rule.ante;
            this._startNumberValue = room_rule.startNumber == undefined ? 2 : room_rule.startNumber;
            this._xiScoreModeValue = game_rule.xiScoreMode == undefined ? 0 : game_rule.xiScoreMode;
            this._rewardScoreValue = game_rule.rewardScore == undefined ? 100 : game_rule.rewardScore;
            this._rewardScoreModeValue = game_rule.rewardScoreMode == undefined ? 0 : game_rule.rewardScoreMode;
            this._rankScore_2Value = game_rule.rankScore_2 == undefined ? 0 : game_rule.rankScore_2;
            this._rankScore_3Value = game_rule.rankScore_3 == undefined ? 0 : game_rule.rankScore_3;
            this._settleScoreValue = game_rule.settleScore == undefined ? 1000 : game_rule.settleScore;

            this._halfwayValue = room_rule.halfway == undefined ? true : room_rule.halfway;
            this._stopCheatingsValue = game_rule.stopCheatings == undefined ? false : game_rule.stopCheatings;
            this._isHas67Value = game_rule.isHas67 == undefined ? 1 : game_rule.isHas67;
        } else {
            this._anteValue = 2000;
            this._startNumberValue = 2;            //开局人数：2，3
            this._xiScoreModeValue = 0;
            this._rewardScoreValue = 100;
            this._rewardScoreModeValue = 0;
            this._rankScore_2Value = 0;
            this._rankScore_3Value = 0;
            this._settleScoreValue = 1000;

            this._halfwayValue = true;             //中途加入0 1
            this._stopCheatingsValue = false;       //防作弊 0 1
            this._isHas67Value = 1;
        }

        let self = this;
        this._anteValue = this._anteValue > 10000 ? 2000 : this._anteValue;
        //底注
        this.anteToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self.getAnteIdx());
        });

        //开局人数 0、2人   1、3人
        this.numbersToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == (self._startNumberValue-2));
        });

        //喜分模式
        this.xiScoreModeToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._xiScoreModeValue);
        });

        //奖励分
        this.xiScoreModeToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._rewardScores.indexOf(self._rewardScoreValue));
        });

        //奖励分模式
        this.xiScoreModeToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._xiScoreModeValue);
        });

        //2人奖惩
        this.rankScore2Toggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._rankScore_2Value);
        });

        //3人奖惩
        this.rankScore3Toggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._rankScore_3Value);
        });

        //结算分
        this.settleScoreToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._settleScores.indexOf(self._settleScoreValue));
        });

        //房间开始后禁止加入    防作弊
        this.gaojis[0].getComponent(cc.Toggle).isChecked = this._halfwayValue;
        this.gaojis[1].getComponent(cc.Toggle).isChecked = this._stopCheatingsValue;
        this.gaojis[2].getComponent(cc.Toggle).isChecked = this._isHas67Value == 1 ? false : true;

        this.checkAnteLab();
        this.checkNmbersLab();
        this.checkXiScoreModeLab();
        this.checkRewardScoreLab();
        this.checkRewardScoreModeLab();
        this.checkRankScore2Lab();
        this.checkRankScore3Lab();
        this.checkSettleScoreLab();
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
            case 2000:
                idx = 1;
                break;
            case 5000:
                idx = 2;
                break;
            case 10000:
                idx = 3;
                break;
            case 20000:
                idx = 4;
                break;
            case 50000:
                idx = 5;
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
                playerMax: this._startNumberValue == 2 ? 0 : 1, //最大人数
                halfway: this._halfwayValue,            //是否中途加入
                inningLimit: 0,         //限制局数
            },

            //游戏规则
            game_rule: {
                ante: this._anteValue,
                xiScoreMode: this._xiScoreModeValue,
                rewardScore: this._rewardScoreValue,
                rewardScoreMode: this._rewardScoreModeValue,
                rankScore_2 : this._rankScore_2Value,
                rankScore_3 : this._rankScore_3Value,
                settleScore: this._settleScoreValue,
                stopCheatings: this._stopCheatingsValue,
                isHas67: this._isHas67Value
            }                        
        };

        console.log('沅江千分规则 = ', data);
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
        this.xiScoreModeTips.active = false;
        this.btnXiScoreMode.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.rewardScoreTips.active = false;
        this.btnRewardScore.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.rewardScoreModeTips.active = false;
        this.btnRewardScoreMode.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.rankScore2Tips.active = false;
        this.btnRankScore2.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.rankScore3Tips.active = false;
        this.btnRankScore3.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.settleScoreTips.active = false;
        this.btnSettleScore.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
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

        if (this._startNumberValue == 2) {
            this.rankScore2Node.active = true;
            this.rankScore3Node.active = false;
        } else {
            this.rankScore2Node.active = false;
            this.rankScore3Node.active = true;
        }
    },

    onBtnXiScoreModePressed () {
        if (this.xiScoreModeTips.active) {
            this.xiScoreModeTips.active = false;
            this.btnXiScoreMode.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.xiScoreModeTips.active = true;
            this.btnXiScoreMode.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onXiScoreModeTogglePressed (event, data) {
        this.resetAll();
        this._xiScoreModeValue = parseInt(data);
        this.checkXiScoreModeLab();
    },

    checkXiScoreModeLab() {
        let str = '';
        switch (this._xiScoreModeValue) {
            case 0:
                str = '加法';
                break;
            case 1:
                str = '乘法';
                break;
            default:
                break;
        }

        this.xiScoreModeLab.string = str;
    },

    onBtnRewardScorePressed () {
        if (this.rewardScoreTips.active) {
            this.rewardScoreTips.active = false;
            this.btnRewardScore.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.rewardScoreTips.active = true;
            this.btnRewardScore.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onRewardScoreTogglePressed (event, data) {
        this.resetAll();
        this._rewardScoreValue = parseInt(data);
        this.checkRewardScoreLab();
    },

    checkRewardScoreLab() {
        this.rewardScoreLab.string = this._rewardScoreValue+'分';
    },

    onBtnRewardScoreModePressed () {
        if (this.rewardScoreModeTips.active) {
            this.rewardScoreModeTips.active = false;
            this.btnRewardScoreMode.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.rewardScoreModeTips.active = true;
            this.btnRewardScoreMode.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onRewardScoreModeTogglePressed (event, data) {
        this.resetAll();
        this._rewardScoreModeValue = parseInt(data);
        this.checkXiScoreModeLab();
    },

    checkRewardScoreModeLab() {
        let str = '';
        switch (this._xiScoreModeValue) {
            case 0:
                str = '上游得';
                break;
            case 1:
                str = '最高分得';
                break;
            default:
                break;
        }

        this.rewardScoreModeLab.string = str;
    },

    onBtnRankScore2Pressed () {
        if (this.rankScore2Tips.active) {
            this.rankScore2Tips.active = false;
            this.btnRankScore2.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.rankScore2Tips.active = true;
            this.btnRankScore2.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onRankScore2TogglePressed (event, data) {
        this.resetAll();
        this._rankScore_2Value = parseInt(data);
        this.checkRankScore2Lab();
    },

    checkRankScore2Lab() {
        let str = '';
        switch (this._rankScore_2Value) {
            case 0:
                str = '上游奖励60分    下游扣60分';
                break;
            case 1:
                str = '上游奖励40分    下游扣40分';
                break;
            default:
                break;
        }

        this.rankScore2Lab.string = str;
    },

    onBtnRankScore3Pressed () {
        if (this.rankScore3Tips.active) {
            this.rankScore3Tips.active = false;
            this.btnRankScore3.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.rankScore3Tips.active = true;
            this.btnRankScore3.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onRankScore3TogglePressed (event, data) {
        this.resetAll();
        this._rankScore_3Value = parseInt(data);
        this.checkRankScore3Lab();
    },

    checkRankScore3Lab() {
        let str = '';
        switch (this._rankScore_3Value) {
            case 0:
                str = '上游奖100分  中游扣40分  下游扣60分';
                break;
            case 1:
                str = '上游奖励100分  中游扣30分  下游扣70分';
                break;
            case 2:
                str = '上游奖励100分  中游扣0分  下游扣100分';
                break;
            default:
                break;
        }

        this.rankScore3Lab.string = str;
    },

    onBtnSettleScorePressed () {
        if (this.settleScoreTips.active) {
            this.settleScoreTips.active = false;
            this.btnSettleScore.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.settleScoreTips.active = true;
            this.btnSettleScore.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onSettleScoreTogglePressed (event, data) {
        this.resetAll();
        this._settleScoreValue = parseInt(data);
        this.checkSettleScoreLab();
    },

    checkSettleScoreLab() {
        this.settleScoreLab.string = this._settleScoreValue+'分';
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
                this.gaojiLab.string = '房间开始后可以加入    防作弊    去掉6、7';
            } else {
                this.gaojiLab.string = '无';
            }

            this._stopCheatingsValue = all;
            this._halfwayValue = all;
            this._isHas67Value = all ? 0 : 1;

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
                    this._isHas67Value = t.getComponent(cc.Toggle).isChecked ? 0 : 1;
                    if (this._isHas67Value) {
                        str += '不去掉6、7';
                        all = false;
                    } else {
                        str += '去掉6、7';
                        
                    }
                }
            }.bind(this));

            str = str.length == 0 ? '无':str;
            this.gaojiLab.string = str;
            this.allGaojiToggle.getComponent(cc.Toggle).isChecked = all;
        }
    },

});
