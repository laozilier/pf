// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        zhuFrames: {   
            default: [],
            type: cc.SpriteFrame
        },

        settleFrames: {   
            default: [],
            type: cc.SpriteFrame
        },

        resFrames: {    
            default: [],
            type: cc.SpriteFrame
        },

        userBgFrames: {
            default: [],
            type: cc.SpriteFrame
        }
    },

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
        let bgNode = this.node.getChildByName('bg');
        this.zhuType = bgNode.getChildByName('zhuType');
        this.scoreNode = bgNode.getChildByName('score');
        this.players = [];
        this.bankerPlayer = bgNode.getChildByName('bankerPlayer');
        this.players.push(this.bankerPlayer);
        let xianPlayers = bgNode.getChildByName('xianPlayers');
        for (let i = 0; i < 3; i++) {
            let xianPlayer = cc.instantiate(this.bankerPlayer);
            xianPlayers.addChild(xianPlayer, i, 'xianPlayer'+i);
            this.players.push(xianPlayer);
        };

        this.settleType = bgNode.getChildByName('settleType');
        this.resNode = this.node.getChildByName('resNode');
    },

    start () {

    },

    reset() {
        this.node.active = false;
    },

    openSettleNode(data) {
        let xianScore = data.xianScore;
        this.scoreNode.getComponent(cc.Label).string = xianScore;

        let zhuType = data.zhuType;
        if (zhuType < 0) {
            this.zhuType.getComponent(cc.Sprite).spriteFrame = this.zhuFrames[4];
        } else {
            this.zhuType.getComponent(cc.Sprite).spriteFrame = this.zhuFrames[zhuType];
        }

        let settleType = data.settleType;
        this.settleType.getComponent(cc.Sprite).spriteFrame = this.settleFrames[settleType-1];
        this.playSettleTypeSound(settleType);
        let playerDatas = data.playerDatas;
        let bankerUid = data.banker;
        for (let i = 0; i < this.players.length; i++) {
            let playerNode = this.players[i];
            if (i < playerDatas.length) {
                playerNode.active = true;
                let playerData = playerDatas[i];
                let uid = playerData.uid;
                let bankerNode = playerNode.getChildByName('banker');
                bankerNode.active = (uid == bankerUid);
                let headNode = playerNode.getChildByName('headNode');
                headNode.getComponent('HeadNode').updateData(playerData.pic, playerData.sex);
                let nameNode = playerNode.getChildByName('name');
                let namestr = cc.utils.fromBase64(playerData.name, 8);
                nameNode.getComponent(cc.Label).string = namestr;
                nameNode.getChildByName('Label').getComponent(cc.Label).string = namestr;
                let resScoreNode = playerNode.getChildByName('resScore');
                let score = playerData.score;
                resScoreNode.getComponent('resScore').showScore(score);
                if (uid == cc.dm.user.uid) {
                    this.resNode.getComponent(cc.Sprite).spriteFrame = this.resFrames[score < 0 ? 1 : 0];
                    playerNode.getComponent(cc.Sprite).spriteFrame = this.userBgFrames[1];
                } else {
                    playerNode.getComponent(cc.Sprite).spriteFrame = this.userBgFrames[0];
                }
            } else {
                playerNode.active = false;
            }
        }
    },

    playSettleTypeSound(settleType, sex=2) {
        switch (settleType) {
            case 1:
                cc.vv.audioMgr.playSFX("poker/sdh/"+sex+"/qingguang1.mp3");
                break;
            case 2:
                cc.vv.audioMgr.playSFX("poker/sdh/"+sex+"/xiaoguang1.mp3");
                break;
            case 3:
                cc.vv.audioMgr.playSFX("poker/sdh/"+sex+"/guozhuang1.mp3");
                break;
            case 4:
                cc.vv.audioMgr.playSFX("poker/sdh/"+sex+"/kuazhuang1.mp3");
                break;
            case 5:
                cc.vv.audioMgr.playSFX("poker/sdh/"+sex+"/xiaodao1.mp3");
                break;
            case 6:
                cc.vv.audioMgr.playSFX("poker/sdh/"+sex+"/dadao1.mp3");
                break;
        }
    },

    //当局主花色  当局得分
    showgameResult(data,playuid,playerInfos,continueCb, backHallCb) {
        this.continueCb = continueCb;
        this.backHallCb = backHallCb;
        this.playerInfos = playerInfos;

        this.gamescore.getComponent(cc.Label).string = data.xianScore;
        this.pokerprimary.getComponent(cc.Sprite).spriteFrame = this.gameprimary[data.zhuType];

        this.zhuangType.getComponent(cc.Sprite).spriteFrame = this.zhuangsprite[data.settleType];

        for (let uid in data.allScore) {
            if (typeof uid == 'string') {
                uid = parseInt(uid);
            }

            let score = data.allScore[uid];
            let isZhuang = false;
            let iszhuangtheir = false;
            //庄家和队友
            if(data.banker == uid || data.friend== uid) {
                isZhuang = true;
                if( data.banker == uid ) {
                    iszhuangtheir = true;
                }
            }

            this.upplayeinfo(score,isZhuang,iszhuangtheir,uid,playuid);
        }

        //输赢   1赢 2输

        // NONE: 0,        //没有
        // DAGUANG: 1,     //大光
        // XIAOGUANG: 2,   //小光
        // GUO: 3,         //过庄
        // KUA: 4,         //跨庄
        // XIAOFAN: 5,     //小倒
        // DAFAN: 6,       //大倒

        let iswin = 0;
        let num = Math.floor(Math.random()*2)+1;
        let  usersex =  this.playerInfos[playuid].sex ==0?2:this.playerInfos[playuid].sex;
        

        if(data.allScore[playuid] > 0 ) {
            iswin = 1;
            setTimeout(()=> {
                cc.vv.audioMgr.playSFX("public/endWin.mp3");
            }, 500);
        }else {
            iswin = 2;
            setTimeout(()=> {
                cc.vv.audioMgr.playSFX("public/endLose.mp3");
            }, 500);
        }
        this.gameWin.getComponent(cc.Sprite).spriteFrame = this.gameresults[iswin];

        this.gameEndcountdown(30);
    },


    upplayeinfo(score,iszhuang,iszhuangtheir,uid,playuid) {
        let playerinfo = this.playerInfos[uid];

        let playerMode =null;
        let playerTYPE=0;
        if(iszhuang) {
            playerMode = this.zhuang[this.zhaungIdex];
            this.zhaungIdex +=1;
            if(iszhuangtheir) {
                playerTYPE = 1;
            }else {
                playerTYPE = 2;
            }
        }else {
            playerMode = this.xian[this.xianIdex];
            this.xianIdex +=1;
        }


        //玩家背景框
        let userbG = playerMode.getChildByName('headbg_0');
        let idex = 0;
        if(uid == playuid) idex = 1;
        userbG.getComponent(cc.Sprite).spriteFrame = this.userbg[idex];

        let zhuang = playerMode.getChildByName('zhuang');
        zhuang.getComponent(cc.Sprite).spriteFrame = this.Zhuangfriend[playerTYPE];

        //头像
        let headNode = playerMode.getChildByName('user').getChildByName('headNode');
        headNode.getComponent('HeadNode').updateData(playerinfo.pic, playerinfo.sex);

        //昵称
        let nickname_1 =   playerMode.getChildByName('user').getChildByName('name');
        let nickname_2 =   playerMode.getChildByName('user').getChildByName('name').getChildByName('Label');


        let namestr = cc.utils.fromBase64(playerinfo.name, 2);
        nickname_1.getComponent(cc.Label).string = namestr;
        nickname_2.getComponent(cc.Label).string = namestr;


        //积分
        let wincoser_str = playerMode.getChildByName('resScore').getChildByName('win');
        let losecoser_str = playerMode.getChildByName('resScore').getChildByName('lose');

        let scorestr = cc.utils.getScoreStr(score);
        scorestr = scorestr.replace("万",'B');

        if(score >= 0) {
            wincoser_str.active = true;
            losecoser_str.active =false;
            wincoser_str.getComponent(cc.Label).string =  '+'+scorestr;
        } else {
            wincoser_str.active = false;
            losecoser_str.active =true;
            losecoser_str.getComponent(cc.Label).string =  scorestr;
        }

        playerMode.active = true;
    },


    oncontinPlay() {
        !!this.continueCb && this.continueCb();
        this.reset();
    },

    oncontinHall() {
        !!this.backHallCb && this.backHallCb();
    },


    /**
     * 开始倒计时
     */
    gameEndcountdown (endTime) {
        if (this.gameEndNode.active) {
            return;
        }

        if (!!endTime) {
            this.n_endDelayTime = endTime;
        } else {
            this.n_endDelayTime = 5;
        }

        this.gameEndNode.active = true;
        this.onnextEndnode();
        this.schedule(this.onnextEndnode, 1);
    },

    /**
     * 结束倒计时
     */
    onnextEndnode() {
        this.gameEndNode.getChildByName('startTime').active = true;
        if (this.n_endDelayTime < 1) {
            this.unschedule(this.onnextEndnode);
            return;
        }
        this.gameEndNode.getChildByName('startTime').getChildByName('Label').getComponent(cc.Label).string = this.n_endDelayTime;
        this.n_endDelayTime -= 1;
    },
});
