cc.Class({
    extends: cc.Component,

    properties: {
        modelLab: {
            default:null,
            type:cc.Node,
        },

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

        firstToggles: {
            default:null,
            type:cc.Node
        },

        firstLab: {
            default:null,
            type:cc.Label,
        },

        firstTips: {
            default:null,
            type:cc.Node,
        },

        btnFirst: {
            default: null,
            type: cc.Node
        },

        isVisiblesToggles: {
            default:null,
            type:cc.Node
        },

        isVisiblesLab: {
            default:null,
            type:cc.Label,
        },

        isVisiblesTips: {
            default:null,
            type:cc.Node,
        },

        btnIsVisibles: {
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

        playTypes: {
            default: [],
            type: [cc.Toggle]
        },

        playTypesLab: {
            default:null,
            type:cc.Label,
        },

        playTypesTips: {
            default: null,
            type: cc.Node
        },

        btnPlayTypes: {
            default: null,
            type: cc.Node
        },

        allPlayTypesToggle: {
            default: null,
            type: cc.Toggle
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
        this._gameName = cc.enum.GameName.poker_pdk;
        cc.utils.setNodeWinSize(this.node);

        this._min = 2*4*8;
        this._max = this._min*20;

        this._innings = [0, 3, 5, 8];
    },

    showRecord: function () {
        //显示之前存储的
        let data = this._data;
        if (!data || data.gameName != this._gameName) {
            data = null;
            let jsonstr = cc.sys.localStorage.getItem("pdk_record");
            if (jsonstr) {
                data = JSON.parse(jsonstr);
            }
        }

        if (data) {
            let game_rule = data.game_rule || {};
            let room_rule = data.room_rule || {};
            this._anteValue = game_rule.ante == undefined ? 5000 : game_rule.ante;
            this._startNumberValue = room_rule.startNumber == undefined ? 2 : room_rule.startNumber;
            this._firstValue = game_rule.first == undefined ? 0 : game_rule.first;
            this._isVisiblesValue = game_rule.isVisibles == undefined ? false : game_rule.isVisibles;
            this._inningValue = room_rule.inningLimit == undefined ? 3 : room_rule.inningLimit;
            this._playTypesValue = game_rule.playTypes || [1,1,1,1,0,0];
            this._gameRulesValue = game_rule.gameRules || [0,0,0,1];
            this._halfwayValue = room_rule.halfway == undefined ? true : room_rule.halfway;
            this._stopCheatingsValue = game_rule.stopCheatings == undefined ? false : game_rule.stopCheatings;
        } else {
            this._anteValue = 5000;
            this._startNumberValue = 2; //开局人数：3，2
            this._firstValue = 1;   //0：黑桃3先出 1：随机庄家先出
            this._inningValue = 3;
            this._isVisiblesValue = false;          //显示牌数 0 1
            this._playTypesValue = [1,1,1,1,0,0];   //123456 游戏玩法
            this._gameRulesValue = [0,0,0,1];       //1234   特殊规则
            this._halfwayValue = true;             //中途加入0 1
            this._stopCheatingsValue = false;       //防作弊 0 1
        }

        let self = this;
        this._anteValue = this._anteValue > 50000 ? 5000 : this._anteValue;
        //底注
        this.anteToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self.getAnteIdx());
        });

        //人数 0、3人   1、2人
        this.numbersToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == (self._startNumberValue-2));
        });

        //最少局数 0 3 5 8
        this.inningToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == (self._innings.indexOf(self._inningValue)));
        });

        //首局先出 0、黑桃三先出  1、随机庄家先出
        this.firstToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._firstValue);
        });

        //显示手牌 0、不显示手牌数  1、显示手牌数
        this.isVisiblesToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self._isVisiblesValue);
        });

        //1、三张可少带出完    2、三张可少带接完    3、飞机可少带出完  4、飞机可少带接完    5、小通机制   6、双报
        this.playTypes.forEach(function (t, i) {
            t.getComponent(cc.Toggle).isChecked = (self._playTypesValue[i] > 0);
        });

        //1、炸弹不可拆    2、允许4带2    3、允许4带3  4、红桃10扎鸟
        this.gameRules.forEach(function (t, i) {
            t.getComponent(cc.Toggle).isChecked = (self._gameRulesValue[i] > 0);
        });

        //房间开始后禁止加入    防作弊
        this.gaojis[0].getComponent(cc.Toggle).isChecked = this._halfwayValue;
        this.gaojis[1].getComponent(cc.Toggle).isChecked = this._stopCheatingsValue;

        this.checkAnteLab();
        this.checkNmbersLab();
        this.checkInningLab();
        this.checkFirstLab();
        this.checkIsVisiblesLab();
        this.checkPlayTypesLab();
        this.checkGameRulesLab();
        this.checkGaojiLab();
    },

    open (cid, cb, data, model) {
        this._cid = cid;
        this._cb = cb;
        this._modelValue = model;
        let modelStr = '';
        if (model == 0) {
            modelStr = '16张';
        } else {
            modelStr = '15张';
        }

        this.modelLab.getComponent(cc.Label).string = modelStr;
        this.modelLab.children.forEach(el=> {
            el.getComponent(cc.Label).string = modelStr;
        });
        
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
            case 100000:
                idx = 5;
                break;
        }
        return idx;
    },

    checkScoreLab () {
        let score = this._anteValue*this._min;
        let instr = cc.utils.getScoreStr(score);
        let leavestr = '小于'+cc.utils.getScoreStr(score*0.2);
        this.inCoinLab.getComponent(cc.Label).string = instr;
        this.leaveCoinLab.getComponent(cc.Label).string = leavestr;
    },

    getCreateData () {
        /** 获取创建房间的信息 */
        let game_rule = {
            
        };

        game_rule.ante = this._anteValue;
        game_rule.model = this._modelValue;
        game_rule.first = this._startNumberValue == 2 ? 1 : this._firstValue;
        game_rule.isVisibles = this._isVisiblesValue;
        game_rule.playTypes = this._playTypesValue;
        game_rule.gameRules = this._gameRulesValue;
        game_rule.stopCheatings = this._stopCheatingsValue;

        let data = {
            gameName: this._gameName,                   //游戏类型
            room_rule: {
                startNumber: this._startNumberValue,    //开局人数
                playerMax: this._startNumberValue-2,    //最大人数
                halfway: this._halfwayValue,            //是否中途加入
                inningLimit: this._inningValue,         //限制局数
            },
            game_rule: game_rule                        //游戏规则
        };

        console.log('跑得快规则 = ', data);
        cc.sys.localStorage.setItem("pdk_record", JSON.stringify(data));

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
        this.firstTips.active = false;
        this.btnFirst.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.isVisiblesTips.active = false;
        this.btnIsVisibles.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.playTypesTips.active = false;
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

    onBtnNumberssPressed () {
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
        if (this._startNumberValue == 3) {
        } else {
            this._firstValue = 1;
            this.checkFirstLab();
            //首局先出 0、黑桃三先出  1、随机庄家先出
            this.firstToggles.children.forEach(function (el, i) {
                el.getComponent(cc.Toggle).isChecked = (i == this._firstValue);
            }.bind(this));
        }
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

    onBtnFirstPressed () {
        if (this._startNumberValue < 3) {
            cc.utils.openWeakTips('两人模式必须随机先出');
            return;
        }

        if (this.firstTips.active) {
            this.firstTips.active = false;
            this.btnFirst.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.firstTips.active = true;
            this.btnFirst.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onFirstTogglePressed (event, data) {
        this.resetAll();
        this._firstValue = parseInt(data);
        this.checkFirstLab();
    },

    checkFirstLab() {
        let str = '';
        switch (this._firstValue) {
            case 0:
                str = '黑桃三';
                break;
            case 1:
                str = '随机';
                break;
            default:
                break;
        }

        this.firstLab.string = str;
    },

    onBtnIsVisiblesPressed () {
        if (this.isVisiblesTips.active) {
            this.isVisiblesTips.active = false;
            this.btnIsVisibles.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.isVisiblesTips.active = true;
            this.btnIsVisibles.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onIsVisiblesTogglesPressed (event, data) {
        this.resetAll();
        this._isVisiblesValue = parseInt(data) == 0 ? false : true;
        this.checkIsVisiblesLab();
    },

    checkIsVisiblesLab() {
        let str = '';
        switch (this._isVisiblesValue) {
            case false:
                str = '不显示牌数';
                break;
            case true:
                str = '显示牌数';
                break;
            default:
                break;
        }

        this.isVisiblesLab.string = str;
    },

    onBtnPlayTypesPressed () {
        if (this.playTypesTips.active) {
            this.playTypesTips.active = false;
        } else {
            this.resetAll();
            this.playTypesTips.active = true;
        }
    },

    onPlayTypesTogglesPressed (event, data) {
        let type = parseInt(data);
        if (this._playTypesValue[type] > 0) {
            this._playTypesValue[type] = 0;
        } else {
            this._playTypesValue[type] = 1;
        }

        this.checkPlayTypesLab();
    },

    onPlayTypesAllTogglesPressed (event, data) {
        this.checkPlayTypesLab(this.allPlayTypesToggle.getComponent(cc.Toggle).isChecked);
    },

    checkPlayTypesLab (all) {
        if (all != undefined) {
            if (all) {
                this.playTypesLab.string = '三张可少带出完    三张可少带接完    飞机可少带出完    飞机可少带接完    小通机制    双报';
            } else {
                this.playTypesLab.string = '无';
            }

            this._playTypesValue = all ? [1,1,1,1,1,1] : [0,0,0,0,0,0];
            this.playTypes.forEach(function (t) {
                t.getComponent(cc.Toggle).isChecked = all;
            });
        } else {
            all = true;
            let str = '';
            this.playTypes.forEach(function (t, i) {
                if (this._playTypesValue[i] > 0) {
                    if (i == 0) {
                        str += '三张可少带出完    ';
                    }

                    if (i == 1) {
                        str += '三张可少带接完    ';
                    }

                    if (i == 2) {
                        str += '飞机可少带出完    ';
                    }

                    if (i == 3) {
                        str += '飞机可少带接完    ';
                    }

                    if (i == 4) {
                        str += '小通机制    ';
                    }

                    if (i == 5) {
                        str += '双报    ';
                    }

                    t.getComponent(cc.Toggle).isChecked = true;
                } else {
                    all = false;
                    t.getComponent(cc.Toggle).isChecked = false;
                }
            }.bind(this));
            str = str.length == 0 ? '无':str;
            this.playTypesLab.string = str;
            this.allPlayTypesToggle.getComponent(cc.Toggle).isChecked = all;
        }
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
        let type = parseInt(data);

        let idx = this._gameRulesValue.indexOf(type);
        if (this._gameRulesValue[type] > 0) {
            this._gameRulesValue[type] = 0;
        } else {
            this._gameRulesValue[type] = 1;
        }

        this.checkGameRulesLab();
    },

    onGameRulesAllTogglesPressed (event, data) {
        this.checkGameRulesLab(this.allGameRulesToggle.getComponent(cc.Toggle).isChecked);
    },

    checkGameRulesLab (all) {
        if (all != undefined) {
            if (all) {
                this.gameRulesLab.string = '炸弹不可拆    允许4带2    允许4带3    红桃10扎鸟';
            } else {
                this.gameRulesLab.string = '无';
            }

            this._gameRulesValue = all ? [1,1,1,1] : [0,0,0,0];
            this.gameRules.forEach(function (t) {
                t.getComponent(cc.Toggle).isChecked = all;
            });
        } else {
            all = true;
            let str = '';
            this.gameRules.forEach(function (t, i) {
                if (this._gameRulesValue[i] > 0) {
                    if (i == 0) {
                        str += '炸弹不可拆    ';
                    }

                    if (i == 1) {
                        str += '允许4带2    ';
                    }

                    if (i == 2) {
                        str += '允许4带3    ';
                    }

                    if (i == 3) {
                        str += '红桃10扎鸟    ';
                    }

                    t.getComponent(cc.Toggle).isChecked = true;
                } else {
                    all = false;
                    t.getComponent(cc.Toggle).isChecked = false;
                }
            }.bind(this));
            str = str.length == 0 ? '无':str;
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
