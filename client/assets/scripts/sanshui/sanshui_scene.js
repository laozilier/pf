cc.Class({
    extends: require('../Games/Game_scene'),

    properties: {

    },

    onLoad() {
        this._super();

        cc.vv.audioMgr.playBGM("sanshui/bg/bg.mp3");
        cc.sanshui_enum = require('sanshui_enum');
        let single = this.node.getChildByName('single');
        this.quanleidaNode = single.getChildByName('quanleidaNode');
        this.maNode = single.getChildByName('maNode');

        /** 抢庄按钮列表 **/
        this.multipleList = [];
        for (let i = 0; i < 5; i++) {
            let child = single.getChildByName('multipleList').getChildByName('multipleBtn'+i);
            if (!!child) {
                cc.utils.addClickEvent(child, this, this._gameName+'_scene', 'onSetMultiple', i);
                this.multipleList.push(child);
            }
        }

        /** 下注按钮列表 **/
        this.betList = [];
        for (let i = 0; i < 5; i++) {
            let child = single.getChildByName('betList').getChildByName('betBtn'+i);
            if (!!child) {
                cc.utils.addClickEvent(child, this, this._gameName+'_scene', 'onSetBet', i);
                this.betList.push(child);
            }
        }

        /** 状态提示 **/
        this.tips = single.getChildByName('tips');
        this._isBackGround = false;
        cc.game.on(cc.game.EVENT_SHOW, this.foreGround, this);
        cc.game.on(cc.game.EVENT_HIDE, this.backGround, this);
    },

    foreGround() {
        this._isBackGround = false;
    }, 

    backGround() {
        this._isBackGround = true;
    },

    onRoomInfo(need) {
        this._super(need);

        this.roomReset();
    },

    roomReset() {
        this.multipleList.forEach(el => el.active = false);
        this.betList.forEach(el => el.active = false);
        this.cleanTips();
        let goldAni = cc.find('Canvas/common/金币动画').getComponent("输金币动画");
        goldAni.clearAnimation();

        this.multipleList.forEach(el => el.active = false);
        this.betList.forEach(el => el.active = false);
        this.maNode.active = false;

        let control = this.node.getChildByName('control');
        if (!!control) {
            control.active = false;
        }

        this.quanleidaNode.getComponent(cc.Animation).stop();
        this.quanleidaNode.active = false;
    },

    /**
     * 游戏开始
     * @param data
     */
    gameBegin(data) {
        this._super(data);

        this.roomReset();

        cc.gameargs.status = cc.sanshui_enum.status.BEGIN;
        cc.vv.audioMgr.playSFX("poker/public/kaiju.mp3");
    },

    /**
     * 游戏信息
     * @param data
     */
    gameInfo(data) {
        this._super(data);

        let gameStatus = data.status;
        let zuid = data.zuid;
        if (!!zuid) {
            let p = this.getPlayerByUid(zuid);
            if(!!p) {
                let script = this.playerScript(p);
                script.setBank(true);
            }
        }

        switch (gameStatus) {
            case 0:
                break;
            case 1:
                console.log("抢庄阶段");
                if(this.isPlaying()) {
                    let me = data.players[cc.dm.user.uid];
                    if (me.status == 1) {
                        this.setTips('等待抢庄: ', Math.floor(data.surplusTime/1000));
                    } else {
                        this.pleaseRob({max: 1});
                        this.setTips('请抢庄: ', Math.floor(data.surplusTime/1000));
                    }
                } else {
                    this.setTips('等待抢庄: ', Math.floor(data.surplusTime/1000));
                }
                break;
            case 2:
                console.log("下注阶段");
                if(this.isPlaying()) {
                    let me = data.players[cc.dm.user.uid];
                    let bet = me.bet;
                    if (bet > 0) {
                        this.setTips('等待下注: ', Math.floor(data.surplusTime/1000));
                    } else {
                        this.startBet({bets: me.bets, uid: zuid});
                        this.setTips('请下注: ', Math.floor(data.surplusTime/1000));
                    }
                } else {
                    this.setTips('等待下注: ', Math.floor(data.surplusTime/1000));
                }
                
                break;
            case 3:
                this.setTips('等待摆牌: ', Math.floor(data.surplusTime/1000));
                if(this.isPlaying()) {
                    let me = data.players[cc.dm.user.uid];
                    if (me.status != 3) {
                        let playerHolds = {
                            holds: me.holds,
                            hasSpecial: me.hasSpecial,
                            renShu: data.uids.length,
                            time: Math.floor(data.surplusTime/1000)
                        };

                        this.holdArrays(playerHolds);
                    }
                }
                break;
            case 4:
                this.bipaiInfo(data.compareResult);
                this.setTips('比牌中: ', Math.floor(data.surplusTime/1000));
                break;
            case 5:
                break;
        }
    },

    /***
     *  游戏状态
     * @param data
     */
    gameStatus(data) {
        this._super(data);
        if (data.status == 0) {

        } else if (data.status == 1) {
            this.pleaseRob({max: 1});
        } else if (data.status == 2) {
            
        } else if (data.status == 3) {
            
        } else if (data.status == 4) {
            
        }
    },

    pleaseRob (data) {
        if (this.isPlaying()) { //正在玩
            let len = data.max+1;
            for (let i = 0; i < len; i++) {
                let btn = this.multipleList[i];
                btn.active = true;
            }
            this.setTips('请抢庄: ', 10);
        } else {
            this.setTips('等待抢庄: ', 10);
        }
    },

    rob(data) {
        let uid = data[0];
        let rob = data[1];
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.setRob(rob);
        }
        //隐藏抢庄按钮
        if (uid == cc.dm.user.uid) {
            this.multipleList.forEach((el) => {
                el.active = false;
            });

            this._tipsText = '等待抢庄: ';
        }
    },

    randomDeclarering(data) {
        //清空抢庄元素
        this._model._uids.forEach((uid) => {
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let script = this.playerScript(p);
                script.clearRobView();
            }
        }); 

        let uids = data.uids;
        //大于1个人抢庄，则播放抢庄音效
        if (uids.length > 1) {
            cc.vv.audioMgr.playSFX("public/random_banker_lianxu.mp3");
        }

        //播放抢庄动画
        if (uids.length === 1) {
            this.setTips('抢庄中: ', 1);
        } else {
            uids.forEach(uid => {
                let p = this.getPlayerByUid(uid);
                if (!!p) {
                    let script = this.playerScript(p);
                    script.playRobAni(0);
                }
            });

            this.setTips('抢庄中: ', 2);
        }
    },

    randomDeclarer(data) {
        let uids = data.uids;
        if (!!uids) {
            uids.forEach(uid => {
                let p = this.getPlayerByUid(uid);
                if (!!p) {
                    let script = this.playerScript(p);
                    if (uid == this._model._decl) {
                        script.playRobAni(1);
                        script.setBank(true);
                    } else {
                        script.stopRobAni();
                    }
                }
            });
        } else {
            let p = this.getPlayerByUid(this._model._decl);
            if (!!p) {
                let script = this.playerScript(p);
                script.playRobAni(1);
                script.setBank(true);
            }
        }

        if(this._model._decl == cc.dm.user.uid || !this.isPlaying()) {
            this.setTips('等待玩家下注: ', 12);
        } else {
            this.setTips('请下注: ', 12);
        }
    },

    startBet (data) {
        if (this.betList && data.uid !== cc.dm.user.uid && this.isPlaying()) {
            data.bets.forEach(function (el, i) {
                let betBtn = this.betList[i];
                betBtn.active = true;
                let str = cc.utils.getScoreStr(el);
                str = str.replace('千', 'A');
                str = str.replace('万', 'B');
                betBtn.getChildByName('Label').getComponent(cc.Label).string = str;
            }, this);
        }
    },

    bet (data) {
        //收到下注消息，当玩家为自己的时候，必须隐藏自己胡下注按钮
        if (data[0] == cc.dm.user.uid) {
            this.betList.forEach((el) => {
                el.active = false;
            });

            this._tipsText = '等待其他玩家下注: ';
        }
        let p = this.getPlayerByUid(data[0]);
        if(!!p) {
            let script = this.playerScript(p);
            script.setBet(data[1], data[2]);
        }

        cc.vv.audioMgr.playSFX("public/bet.mp3");
    },

    /**
     * 马牌
     */
    maPlayer(data) {
        let maList = [43, 48, 39];
        let maCard = maList[this._model._game_rule.maCard - 1];
        this.maNode.getComponent("poker").show(maCard);
        this.maNode.stopAllActions();
        this.maNode.scale = 0.6;

        let euid = data[0];
        let sVec = null; //点节的世界坐标位置
        /**  找到起点的节点(的位置转化成世界坐标)<返回的是一个对象>  **/
        let spos = this.maNode.getNodeToWorldTransformAR();
        sVec = cc.p(spos.tx, spos.ty);

        let p = this.getPlayerByUid(euid);
        if (!p) {
            return;
        }
        let scr = this.playerScript(p);
        let epos = scr.headNode.getNodeToWorldTransformAR();
        let ac = cc.spawn(cc.moveTo(0.3, cc.p(epos.tx - spos.tx, epos.ty - spos.ty)), cc.scaleTo(0.2, 0.35));
        this.maNode.runAction(ac);
    },

    /***
     *  抓牌
     * @param data
     */
    holdArrays(data) {
        /**
         * 加载操作预制资源  显示手牌   马牌数据
         */
        let control = this.node.getChildByName('control');
        if (control) {
            control.getComponent('sanshui_control').showControl(data, this._model._game_rule.maCard);
        } else {
            cc.utils.loadPrefabNode('sanshui/controlNode', function (control) {
                this.node.addChild(control, 1, 'control');
                control.getComponent('sanshui_control').showControl(data, this._model._game_rule.maCard);
            }.bind(this));
        }

        this.setTips('等待摆牌: ', data.time == undefined ? 60 : data.time);
    },

    /**
     * 我自己离开了房间后清除一些数据
     * @param data
     */
    leave(uid, need) { 
        this.cleanTips(); 
        this._super(uid, need);
    },

    /**
     * 出牌
     * @param data
     */
    chuPai(data) {
        if (!data) {
            return;
        }
        for (let i = 0; i < this.players.length; i++) {
            let p = this.players[i];
            if (!!p) {
                let script = this.playerScript(p);
                if (script._uid == null) {
                    continue;
                }
            } else {
                console.log('chuPai 玩家不见了 data = ', data);
            }
        }
        let uid = data.uid;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.showOutCards();
        } else {
            console.log('chuPai 玩家不见了 data = ', data);
        }

        if (uid == cc.dm.user.uid) {
            if (this.node.getChildByName('control')) {
                this.node.getChildByName('control').active = false;
            }
        }
    },

    /**
     * 比牌
     */
    bipai(data) {
        cc.vv.audioMgr.playSFX("sanshui/woman/StartCompearCard.mp3");
        let list = ['toudao', 'zhongdao', 'weidao'];
        let times = 1;
        for (let j = 0; j < 3; ++j) {
            let dao = list[j];
            let players = data[dao];
            for (let i = 0; i < players.length; ++i) {
                let player = players[i];
                let uid = player.uid;
                let p = this.getPlayerByUid(uid);
                if (!!p) {
                    let script = this.playerScript(p);
                    this.scheduleOnce(function () {
                        script.showBipai(player, j);
                    }, times);
                    times += 0.9;
                } else {
                    console.log('chuPai 玩家不见了 data = ', data);
                }
            }
        }

        //特殊牌型显示
        if (data.teshupai.length) {
            for (let i = 0; i < data.teshupai.length; ++i) {
                let uids = data.teshupai[i].uid;
                let p = this.getPlayerByUid(uids);
                if (!!p) {
                    let script = this.playerScript(p);
                    this.scheduleOnce(function () {
                        script.showTeshu(data.teshupai[i]);
                    }, times);
                    times += 0.9;
                } else {
                    console.log('chuPai 玩家不见了 data = ', data);
                }
            }
        }

        //打枪
        if (data.daqiang.length) {
            console.log("进来打枪");
            this.scheduleOnce(function () {
                cc.vv.audioMgr.playSFX("sanshui/woman/daQiang.mp3");
            }, times);
            for (let i = 0; i < data.daqiang.length; ++i) {
                //获取世界坐标
                let kUid = data.daqiang[i].uid;
                let zUid = data.daqiang[i].daUser.uid;
                let pK = this.getPlayerByUid(kUid);
                let pZ = this.getPlayerByUid(zUid);
                if (!pK || !pZ) {
                    return;
                }
                let kscr = this.playerScript(pK);
                let zscr = this.playerScript(pZ);
                let kpos = kscr.daqiangNode.getNodeToWorldTransformAR();
                let zpos = zscr.resultNode.getNodeToWorldTransformAR();
                let rotate = this.getAngle(cc.p(kpos.tx, kpos.ty), cc.p(zpos.tx, zpos.ty));
                this.scheduleOnce(function () {
                    kscr.showDaqiang(rotate);
                    zscr.showZhongqiang();
                }, times);
                times += 1.2;
            }
        }

        //全垒打
        if (data.quanleida) {
            this.scheduleOnce(function () {
                cc.vv.audioMgr.playSFX("sanshui/woman/quanLeiDa.mp3");
                this.quanleidaNode.active = true;
                this.quanleidaNode.getComponent(cc.Animation).play("quanleida");
            }, times);
            times += 2.5;
            this.scheduleOnce(function () {
                this.quanleidaNode.active = false;
            }, times);
        }
        
        this.scheduleOnce(function () {
            cc.connect.send('biPaiOver');
            this._model.bipaivalue = null;
        }, times);

        this.setTips('比牌中: ', Math.ceil(times));
    },

    /**
     * 计算打枪和中枪两个人的角度
     */
    getAngle(from, to) {
        let len_y = to.y - from.y;
        let len_x = to.x - from.x;
        if (0 == len_x && from.y < to.y) {
            return -90;
        } else if (0 == len_x && from.y > to.y) {
            return 90;
        } else if (0 == len_y && from.x > to.x) {
            return 180;
        } else if (0 == len_y && from.x < to.x) {
            return 0;
        }
        let tan_yx = Math.abs(len_y) / Math.abs(len_x);
        let angle = 0;
        if (len_y > 0 && len_x > 0) {
            angle = -Math.atan(tan_yx)* 180 / Math.PI;
        } else if (len_y > 0 && len_x < 0) {
            angle = Math.atan(tan_yx) * 180 / Math.PI - 180;
        } else if (len_y < 0 && len_x > 0) {
            angle = Math.atan(tan_yx) * 180 / Math.PI;
        } else if (len_y < 0 && len_x < 0) {
            angle = 180 - Math.atan(tan_yx) * 180 / Math.PI;
        }
        return angle;
    },

    /**
     * 断线重连比牌
     */
    bipaiInfo(data) {
        if (!data) {
            return;
        }

        let list = ['toudao', 'zhongdao', 'weidao'];
        //普通牌型显示
        for (let j = 0; j < 3; ++j) {
            for (let i = 0; i < data[list[j]].length; ++i) {
                let uids = data[list[j]][i].uid;
                let p = this.getPlayerByUid(uids);
                if (!!p) {
                    let script = this.playerScript(p);
                    script.showBipai(data[list[j]][i], j);
                } else {
                    console.log('chuPai 玩家不见了 data = ', data);
                }
            }
        }
        //特殊牌型显示
        if (data.teshupai.length) {
            for (let i = 0; i < data.teshupai.length; ++i) {
                let uids = data.teshupai[i].uid;
                let p = this.getPlayerByUid(uids);
                if (!!p) {
                    let script = this.playerScript(p);
                    script.showTeshu(data.teshupai[i]);
                } else {
                    console.log('chuPai 玩家不见了 data = ', data);
                }
            }
        }
    },

    /**
     * 游戏提示
     * @param data
     */
    gameTips(data) {

    },

    /**
     * 游戏结果
     * @param data
     */
    gameResult(data) {
        this._myReady = false;
        this.cleanTips();
        this.unscheduleAllCallbacks();
        this.resultAni(data);
        this.bipaiInfo(this._model.bipaivalue);
        for (let uid in data.allScore) {
            let score = data.allScore[uid];
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let script = this.playerScript(p);
                if(uid == cc.dm.user.uid){
                    script.setResult(score);
                }
                script.showScore(score);
            }
        }

        if (this.isPlaying()) {
            this.startEndnode(6);
        }
    },

    resultAni(data) {
        let allScore = data.allScore;
        let zuid = this._model._decl;
        let self = this;
        if (!!zuid) {
            let wins = [];
            let loses = [];
            let zscore = allScore[zuid.toString()];
            for (let uid in allScore) {
                if (parseInt(uid) == zuid) {
                    continue;
                }

                let score = allScore[uid];
                if (score > 0) {
                    wins.push(uid);
                } else if (score < 0) {
                    loses.push(uid);
                }
            }

            //庄家先进钱  再出钱
            let zplayer = this.getPlayerByUid(zuid);
            let zpos = zplayer.getChildByName('user').getChildByName('headNode').getNodeToWorldTransformAR();
            if (!!zplayer) {
                let z_chu_func = function () {
                    for (let i = 0; i < wins.length; i++) {
                        let uid = wins[i];
                        let eplayer = self.getPlayerByUid(uid);
                        if (!eplayer) {
                            continue;
                        }
                        let epos = eplayer.getChildByName('user').getChildByName('headNode').getNodeToWorldTransformAR();
                        self.chuqian(cc.p(zpos.tx, zpos.ty), cc.p(epos.tx, epos.ty), function () {
                            self.playerScript(eplayer).playSaoGuang();
                        });
                    }
                };

                let need = true;
                for (let i = 0; i < loses.length; i++) {
                    let uid = loses[i];
                    let splayer = this.getPlayerByUid(uid);
                    if (!splayer) {
                        continue;
                    }

                    need = false;
                    let spos = splayer.getChildByName('user').getChildByName('headNode').getNodeToWorldTransformAR();
                    this.chuqian(cc.p(spos.tx, spos.ty),
                        cc.p(zpos.tx, zpos.ty),
                        function () {
                            if (i == loses.length-1) {
                                z_chu_func();
                            }

                            if (zscore > 0) {
                                self.playerScript(zplayer).playSaoGuang();
                            }
                        });
                }

                if (need) {
                    z_chu_func();
                }
            }

        } else {
            let wins = [];
            let loses = [];
            for (let uid in data.allScore) {
                let score = allScore[uid];
                if (score == 0) {
                    continue;
                }

                if (score > 0) {
                    wins.push(uid);
                } else {
                    loses.push(uid);
                }
            }

            let cpos = cc.p(this.node.width/2, this.node.height/2);
            let win_func = function () {
                for (let i = 0; i < wins.length; i++) {
                    let euid = wins[i];
                    let eplayer = self.getPlayerByUid(euid);
                    if (!eplayer) {
                        continue;
                    }

                    let epos = eplayer.getChildByName('user').getChildByName('headNode').getNodeToWorldTransformAR();
                    self.chuqian(cpos, cc.p(epos.tx, epos.ty) , function () {
                        self.playerScript(eplayer).playSaoGuang();
                    });
                }
            };

            for (let i = 0; i < loses.length; i++) {
                let suid = loses[i];
                let splayer = self.getPlayerByUid(suid);
                if (!splayer) {
                    continue;
                }

                let spos = splayer.getChildByName('user').getChildByName('headNode').getNodeToWorldTransformAR();
                self.chuqian(cc.p(spos.tx, spos.ty), cpos, function () {
                    if (i == loses.length-1) {
                        win_func();
                    }
                });
            }
        }
    },

    chuqian(sp, ep, cb) {
        let goldAni = cc.find('Canvas/common/金币动画').getComponent("输金币动画");
        goldAni.flyGolds(sp, ep, this._isBackGround, cb);
    },

    /**
     * 牌不能出
     * @param data
     */
    cannotOut(data) {
        if (data == 1) {
            cc.utils.openWeakTips('头道不能大于中道');
        } else if (data == 2) {
            cc.utils.openWeakTips('中道不能大于尾道');
        }
    },

    // update (dt) {},

    /**
     * 设置提示文本
     * @param text
     * @param endTime
     */
    setTips (text, endTime) {
        this.cleanTips();
        this._tipsTime = endTime;
        this._tipsText = text;
        this.tips.active = true;
        this.nextSetTips();
    },

    nextSetTips() {
        if (this._tipsTime <= 0) {
            !!this.tips && (this.tips.active = false);
            return;
        }
        if (this.tips && this.tips.children[0]) {
            this.tips.children[0].getComponent(cc.Label).string = this._tipsText + this._tipsTime;
            this._tipsTimeout = setTimeout(() => {
                this._tipsTime -= 1;
                this.nextSetTips();
            }, 1000);
        }
    },

    cleanTips() {
        this._tipsTime = 0;
        !!this.tips && (this.tips.active = false);
        if (!!this._tipsTimeout) {
            clearTimeout(this._tipsTimeout);
        }
    },

    /**
     * 设置倍数
     */
    onSetMultiple (event, id) {
        cc.vv.audioMgr.playButtonSound();
        if (typeof id == 'number') {
            id = id.toString();
        }
        cc.connect.send("setMultiple", id);
    },

    /**
     * 下注按钮事件
     * @param event
     * @param id 0 到3
     */
    onSetBet (event, id) {
        cc.vv.audioMgr.playButtonSound();
        //此处应该在下完注后隐藏自己的下注按钮
        this.betList.forEach(function(el){
            el.active = false;
        });
        cc.connect.send('bet', id);
    },

});


