cc.Class({
    extends: require('../Games/Game_player'),

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._super();

        this.resTypes = [];
        this.resNodes = [];
        this.resultNode = this.node.getChildByName('result');
        this.qkNode = this.node.getChildByName('qkNode');
        this.qkNodes = [];
        for (let i = 0; i < 4; i++) {
            let resType = this.resultNode.getChildByName('resType'+i);
            !!resType && this.resTypes.push(resType);
            let resPokers = this.resultNode.getChildByName('resPokers'+i);
            !!resPokers && this.resNodes.push(resPokers);
            let qk = this.qkNode.getChildByName('qk'+i);
            !!qk && this.qkNodes.push(qk);
        } 

        this.betNode = this.node.getChildByName('bet');
        this.holdNodes = this.node.getChildByName('holds').children;
        this.robNode = this.userNode.getChildByName('rob');
        this.robAni = this.userNode.getChildByName('robAni').getComponent(sp.Skeleton);
        this.saoguangAni = this.userNode.getChildByName('saoguangAni').getComponent(sp.Skeleton);
        this.bankNode = this.userNode.getChildByName('bank');
        this.dqNode = this.userNode.getChildByName('daqiangNode');
        this.daqiangNode = this.dqNode.getChildByName('daqiang');
    },

    /**
     * 设置游戏数据  断线重连后
     * @param data
     */
    set(data) {
        if (!this.node.active) {
            return;
        }

        switch(cc.gameargs.status) {
            case cc.sanshui_enum.status.BEGIN:
                this.fapaiAnimat();
                break;
            case cc.sanshui_enum.status.WAIT_BANKER:
                this.fapaiAnimat();
                if (data.status == 1) {
                    this.setRob(data.isRob);
                }
                break;
            case cc.sanshui_enum.status.WAIT_BETS:
                this.fapaiAnimat();
                this.setBet(data.bet);
                break;
            case cc.sanshui_enum.status.CHU_PAI:
                this.setBet(data.bet);
                if (data.status != 3) {
                    this.fapaiAnimat();
                } else {
                    this.showOutCards();
                }
                break;
            case cc.sanshui_enum.status.BI_PAI:
                break;
            case cc.sanshui_enum.status.END:
                break;
            default:
                break
        }
    },

    /**
     * 游戏开始
     */
    gameBegin() {
        this._super();
        this.fapaiAnimat();
    },

    /**
     * 重置所有节点
     */
    resetNodes() {
        this._super();

        this.robNode.getComponent('rob').reset();
        this.betNode.getComponent('bet').reset();
        this.robAni.clearTracks();
        this.robAni.node.active = false;

        this.resTypes.forEach((el) => {
            el.active = false;
        });
        this.resNodes.forEach((el) => {
            el.active = false;
        });

        this.holdNodes.forEach(el => {
            el.stopAllActions();
            el.active = false;
        });
        this.qkNodes.forEach(el => {
            el.stopAllActions();
            el.active = false;
        });

        this.bankNode.active = false;

        this.daqiangNode.getComponent(cc.Animation).stop();
        this.daqiangNode.active = false;
    },

    resetStatus() {},

    compare(a, b) {
        let aa = a % 13;
        if (aa === 0 && a != 52) {
            aa = 100;
        } else if (aa === 1 && a != 53) {
            aa = 200;
        } else if (a === 52) {
            aa = 300;
        } else if (a === 53) {
            aa = 400;
        }

        let bb = b % 13;
        if (bb === 0 && b != 52) {
            bb = 100;
        } else if (bb === 1 && b != 53) {
            bb = 200;
        } else if (b === 52) {
            bb = 300;
        } else if (b === 53) {
            bb = 400
        }

        if (aa == bb) {
            return b - a;
        }
        return bb - aa;
    },

    fapaiAnimat(ani) {
        for (let i = 0; i < this.holdNodes.length; i++) {
            let poker = this.holdNodes[i];
            if (ani != undefined && ani == false) {
                poker.getComponent("poker").show();
            } else {
                let p1 = this.node.parent.convertToWorldSpaceAR(cc.v2(0, 0));
                let p2 = this.node.getChildByName("holds").convertToNodeSpaceAR(p1);
                poker.getComponent("poker").send_ani({start: p2, i: i});
            }
        }
    },

    

    // update (dt) {},
    /**
     * 小结算
     * @param playerData
     */
    setResult(score) {
        if (score >= 0) {
            cc.vv.audioMgr.playSFX("sanshui/bg/endWin.mp3");
        } else {
            cc.vv.audioMgr.playSFX("sanshui/bg/endLose.mp3");
        }
    },

    /**
     * 牌整理完成
     */
    showOutCards() {
        console.log('showOutCards');
        this.holdNodes.forEach(el => {
            el.stopAllActions();
            el.active = false;
        });

        this.resNodes.forEach((el) => {
            el.active = true;
            el.children.forEach((poker) => {
                poker.stopAllActions();
                this.pokerScript(poker).show();
            })
        });
    },

    /**
     * 播放声音
     * @param type
     * @param values
     */
    playSound(type) {
        if (type != -1) {
            this.chatNode.active = false;

            switch (type) {
                /** 乌龙 **/
                case 0:
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/WuLong.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/WuLong.mp3");
                    break;
                /** 对子 **/
                case 1:
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/DuiZi.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/DuiZi.mp3");
                    break;
                case 2:
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/LiangDui.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/LiangDui.mp3");
                    break;
                case 3:
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/SanTiao.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/SanTiao.mp3");
                    break;
                case 4:
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/ShunZi.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/ShunZi.mp3");
                    break;
                case 5:
                    /** 同花 **/
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/TongHua.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/TongHua.mp3");
                    break;
                case 6:
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/HuLu.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/HuLu.mp3");
                    break;
                case 7:
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/TieZhi.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/TieZhi.mp3");
                    break;
                case 8:
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/TongHuaShun.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/TongHuaShun.mp3");
                    break;
                case 9:
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/WuTong.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/WuTong.mp3");
                    break;
                case 10:
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/ChongSan.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/ChongSan.mp3");
                    break;
                case 11:
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/ZhongDunHuLu.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/ZhongDunHuLu.mp3");
                    break;
                case 12:/** 三同花 **/
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/SanTongHua.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/SanTongHua.mp3");
                    break;
                case 13:/** 六小 **/
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/liuxiao.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/liuxiao.mp3");
                    break;
                case 14: /** 三顺子 **/
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/SanShunZi.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/SanShunZi.mp3");
                    break;
                case 15: /** 六对半 **/
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/LiuDuiBan.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/LiuDuiBan.mp3");
                    break;
                case 16: /** 五对三条 **/
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/WuDuiSanTiao.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/WuDuiSanTiao.mp3");
                    break;
                case 17: /** 四套三条 **/
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/SiTaoSanTiao.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/SiTaoSanTiao.mp3");
                    break;
                case 18: /** 凑一色 **/
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/CouYiSe.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/CouYiSe.mp3");
                    break;
                case 19: /** 全小 **/
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/QuanXiao.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/QuanXiao.mp3");
                    break;
                case 20: /** 全大 **/
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/QuanDa.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/QuanDa.mp3");
                    break;
                case 21: /** 三分天下 **/
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/SanFenTianXia.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/SanFenTianXia.mp3");
                    break;
                case 22: /** 三同花顺 **/
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/SanTongHuaShun.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/SanTongHuaShun.mp3");
                    break;
                case 23: /** 十二皇族 **/
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/ShiErHuangZu.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/ShiErHuangZu.mp3");
                    break;
                case 24: /** 一条龙 **/
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/YiTiaoLong.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/YiTiaoLong.mp3");
                    break;
                case 25: /** 青龙 **/
                    if (this._sex === 1)
                        cc.vv.audioMgr.playSFX("sanshui/man/QingLong.mp3");
                    else
                        cc.vv.audioMgr.playSFX("sanshui/woman/QingLong.mp3");
                    break;
            }
        }
    },

    /**
     * 显示比牌
     * @param {*} data 
     * @param {*} num 
     */
    showBipai(data, num) {
        let resNode = this.resNodes[num];
        resNode.active = true;
        let cards = data.cards;
        for (let i = 0; i < cards.length; ++i) {
            let v = cards[i];
            this.pokerScript(resNode.children[i]).tran_ani(v);
        }

        let typeNode = this.resTypes[num];
        typeNode.active = true;
        typeNode.getComponent('sanshui_resType').checkType(data, num);
        this.playSound(cc.sanshui_enum.cardType[data.pattern]);
    },

    /**
     * 显示打枪
     */
    showDaqiang(data, length) {
        this.daqiangNode.scaleX = 1;
        this.daqiangNode.active = true;
        if(data > 90) {
            this.daqiangNode.scaleX = -1;
            data = data - 180;
        }
        if(data < -90) {
            this.daqiangNode.scaleX = -1;
            data = data + 180;
        }
        this.daqiangNode.rotation = data;
        this.daqiangNode.getComponent(cc.Animation).play("daqiang");
        this.scheduleOnce(function () {
            cc.vv.audioMgr.playSFX("sanshui/bg/qiangSheng.mp3");
        }, 0.15);

    },
    /**
     * 显示中枪
     */
    showZhongqiang() {
        this.qkNodes.forEach((el) => {
            el.active = true;
            el.stopAllActions();
            el.runAction(cc.sequence(cc.delayTime(0.3), cc.fadeTo(0.05, 255), cc.delayTime(1.2),cc.fadeTo(0.3, 0)));
        });
    },

    /**
     * 显示特殊牌型
     */
    showTeshu(data) {
        this.resTypes.forEach((el) => {
            el.active = false;
        });
        this.resNodes.forEach((el) => {
            el.active = false;
        });

        for (let i = 0; i < data.cards.length; ++i) {
            let poker = this.holdNodes[i];
            poker.active = true;
            poker.stopAllActions();
            let script = this.pokerScript(poker);
            poker.position = script.endPos;
            script.tran_ani(data.cards[i]);
        }

        let typeNode = this.resTypes[3];
        typeNode.getComponent('sanshui_resType').checkType(data);
        this.playSound(cc.sanshui_enum.cardType[data.pattern]);
    },

    setRob(rob) {
        if (!this.node.active) {
            return;
        }

        if(rob === undefined) {
            return;
        }

        //当庄家标记已经出现,则不再显示抢庄的相关信息
        if(this.bankNode.active) {
            return;
        }
        
        this.robNode.getComponent('rob').startRob(rob);
    },

    /**
     * 播放抢庄动画
     */
    playRobAni: function (id) {
        if (!this.node.active) {
            return;
        }

        let names = ["animation", "animation2"];
        this.robAni.node.active = true;
        this.robAni.clearTracks();
        if (id === 0) {
            this.robAni.setAnimation(id, names[id], true);
        } else {
            this.robAni.setAnimation(id, names[id], false);
        }
    },
    /**
     * 暂停抢庄动画
     */
    stopRobAni: function () {
        if (!this.node.active) {
            return;
        }

        this.robAni.clearTracks();
        this.robAni.node.active = false;
    },
    /**
     * 清除抢庄的元素
     */
    clearRobView: function () {
        if (!this.node.active) {
            return;
        }

        this.robNode.getComponent('rob').reset();
    },

    /**
     * 设置庄家
     * @param {*} value 
     */
    setBank (value) {
        if (!this.node.active) {
            return;
        }

        if (!!this.bankNode) {
            this.bankNode.active = value;
            if (value) {
                this.bankNode.getComponent(cc.Animation).play();
                //let lab = this.bankNode.getChildByName('Label');
                //lab.getComponent(cc.Label).string = `N1M`;
            }
        }
    },

    /**
     * 下注
     * @param score
     */
    setBet (score) {
        if (!this.node.active) {
            return;
        }

        if (score > 0) {
            this.betNode.active = true;
            this.betNode.setLocalZOrder(1);
            this.betNode.getComponent("bet").show(parseInt(score));
        }
    },
});
