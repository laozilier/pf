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
        scoreLab1: {
            default: null,
            type: cc.Label
        },

        scoreLab2: {
            default: null,
            type: cc.Label
        },

        tipsScoreLab: {
            default: null,
            type: cc.Label
        },

        myHead: {
            default: null,
            type: cc.Sprite
        },

        myScoreLab: {
            default: null,
            type: cc.Label
        },

        myNameLab: {
            default: null,
            type: cc.Label
        },

        setScoreNode: {
            default: null,
            type: cc.Node
        },

        setEditBox: {
            default: null,
            type: cc.EditBox
        },

        chessBoard: {
            default: null,
            type: cc.Node
        },

        white: {
            default: null,
            type: cc.Node
        },

        black: {
            default: null,
            type: cc.Node
        },

        btnFreeStart: {
            default: null,
            type: cc.Node
        },

        btnSetScore: {
            default: null,
            type: cc.Node
        },

        imgStart: {
            default: null,
            type: cc.Node
        },

        resNode: {
            default: null,
            type: cc.Node
        },

        resLab1: {
            default: null,
            type: cc.Label
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
        cc.utils.setBgScale(this.node.getChildByName('bg'));
        this._minscore = 1000000;
    },

    start () {

    },

    open(cb) {
        this._score = 0;
        this._marginx = 45;
        this._marginy = 45;
        this._marginSize = 42.5;
        this.reset();

        this._cb = cb;
        this.myHead.getComponent('superSprite').loadUrl(cc.dm.user.pic);
        let namestr = cc.dm.user.shortname;
        this.myNameLab.string = namestr;
        this.myNameLab.node.getChildByName('Label').getComponent(cc.Label).string = namestr;
        this.setMyScore();

        this._score = 0;
        this.setMoneyScore();

        this.chessBoard.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.chessBoard.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);

        this.btnFreeStart.active = true;

        let sysHead = this.node.getChildByName('head0');
        let sysNameNode = sysHead.getChildByName('name');
        let sysNamestr = this.getSysName();
        sysNameNode.getComponent(cc.Label).string = sysNamestr;
        sysNameNode.getChildByName('Label').getComponent(cc.Label).string = sysNamestr;
    },

    getSysName() {
        let familyNames = [
            "赵", "钱", "孙", "李", "周", "吴", "郑", "王", "冯", "陈",
            "褚", "卫", "蒋", "沈", "韩", "杨", "朱", "秦", "尤", "许",
            "何", "吕", "施", "张", "孔", "曹", "严", "华", "金", "魏",
            "陶", "姜", "戚", "谢", "邹", "喻", "柏", "水", "窦", "章",
            "云", "苏", "潘", "葛", "奚", "范", "彭", "郎", "鲁", "韦",
            "昌", "马", "苗", "凤", "花", "方", "俞", "任", "袁", "柳",
            "酆", "鲍", "史", "唐", "费", "廉", "岑", "薛", "雷", "贺",
            "倪", "汤", "滕", "殷", "罗", "毕", "郝", "邬", "安", "常",
            "乐", "于", "时", "傅", "皮", "卞", "齐", "康", "伍", "余",
            "元", "卜", "顾", "孟", "平", "黄", "和", "穆", "萧", "尹"
        ];
        let givenNames = [
            "子璇", "淼", "国栋", "夫子", "瑞堂", "甜", "敏", "尚", "国贤", "贺祥", "晨涛",
            "昊轩", "易轩", "益辰", "益帆", "益冉", "瑾春", "瑾昆", "春齐", "杨", "文昊",
            "东东", "雄霖", "浩晨", "熙涵", "溶溶", "冰枫", "欣欣", "宜豪", "欣慧", "建政",
            "美欣", "淑慧", "文轩", "文杰", "欣源", "忠林", "榕润", "欣汝", "慧嘉", "新建",
            "建林", "亦菲", "林", "冰洁", "佳欣", "涵涵", "禹辰", "淳美", "泽惠", "伟洋",
            "涵越", "润丽", "翔", "淑华", "晶莹", "凌晶", "苒溪", "雨涵", "嘉怡", "佳毅",
            "子辰", "佳琪", "紫轩", "瑞辰", "昕蕊", "萌", "明远", "欣宜", "泽远", "欣怡",
            "佳怡", "佳惠", "晨茜", "晨璐", "运昊", "汝鑫", "淑君", "晶滢", "润莎", "榕汕",
            "佳钰", "佳玉", "晓庆", "一鸣", "语晨", "添池", "添昊", "雨泽", "雅晗", "雅涵",
            "清妍", "诗悦", "嘉乐", "晨涵", "天赫", "玥傲", "佳昊", "天昊", "萌萌", "若萌"
        ];
        let i = parseInt(familyNames.length * Math.random());
        let familyName = familyNames[i];
        let j = parseInt(givenNames.length * Math.random());
        let givenName = givenNames[j];
        let name = familyName + givenName;
        return name;
    },

    setMyScore() {
        let scorestr = cc.utils.getScoreStr();
        this.myScoreLab.string = scorestr;
        this.myScoreLab.node.getChildByName('Label').getComponent(cc.Label).string = scorestr;
    },

    setMoneyScore() {
        let scorestr1 = cc.utils.getScoreStr(this._score);
        this.scoreLab1.string = scorestr1;
        let scorestr2 = '0';
        if (cc.dm.user.withdraw_count > 2) {
            scorestr2 = cc.utils.getScoreStr(Math.floor(this._score*0.02));
        }

        this.scoreLab2.string = scorestr2;
    },

    reset() {
        this._chesses = [];
        this._wins = [];
        this._gameStart = false;
        this._isMe = false;
        this._losed = false;
        for (let i = 0; i < 15; i++) {
            this._chesses[i] = [];
            this._wins[i] = [];
            for (let j = 0; j < 15; j++) {
                this._chesses[i][j] = 0;
                this._wins[i][j] = [];
            }
        }

        this.chessBoard.removeAllChildren();

        //赢法数组
        this.win = [];
        //赢法统计数组
        this.myWin = [];
        this.computerWin = [];

        //赢法数组初始化
        for (let i = 0; i < 15; i++) {
            this.win[i] = [];
            for (let j = 0; j < 15; j++) {
                this.win[i][j] = [];
            }
        }
        //赢法数组具体
        this.count = 0;
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 11; j++) {
                for (let k = 0; k < 5; k++) {
                    this.win[i][j + k][this.count] = true;
                }
                this.count++;
            }
        }
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 11; j++) {
                for (let k = 0; k < 5; k++) {
                    this.win[j + k][i][this.count] = true;
                }
                this.count++;
            }
        }
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                for (let k = 0; k < 5; k++) {
                    this.win[i + k][j + k][this.count] = true;
                }
                this.count++;
            }
        }
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                for (let k = 0; k < 5; k++) {
                    this.win[i + k][14 - j - k][this.count] = true;
                }
                this.count++;
            }
        }

        //赢法统计数组初始化
        for (let i = 0; i < this.count; i++) {
            this.myWin[i] = 0;
            this.computerWin[i] = 0;
        }
    },

    onLoseBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        if (this._score < this._minscore) {
            cc.utils.openTips('学费不能少于100万');
            return;
        }

        let self = this;
        cc.utils.openTips('确定认输?', function () {
            self.gameOver(false);
        }, function () {

        });
    },

    gameOver (win) {
        this._gameStart = false;
        if (win != undefined) {
            this.scheduleOnce(function () {
                this.openRes(win);
                this.btnSetScore.active = true;
                this.btnFreeStart.active = true;
            }, 0.5);
            if (win) {
                cc.vv.audioMgr.playSFX("public/sng_winner.mp3");
            } else {
                cc.vv.audioMgr.playSFX("public/lose.mp3");
            }
        } else {
            this.btnSetScore.active = true;
            this.btnFreeStart.active = true;
        }
    },

    openRes (win) {
        this.resNode.active = true;
        let lab2 = this.resNode.getChildByName('resLab2');
        if (win) {
            this.resLab1.string = '恭喜你，你赢了';
            lab2.getComponent(cc.Label).string = '厉害!';
        } else {
            this.resLab1.string = '很遗憾，你输了';
        }

        this.resLab1.node.getChildByName('Lab').getComponent(cc.Label).string = this.resLab1.string;
        if (this._losed) {
            let fee = (this._score*0.02);
            let lab2str = '学费：'+cc.utils.getScoreStr(this._score)+'  手续费：'+cc.utils.getScoreStr(fee);
            lab2.getComponent(cc.Label).string = lab2str;
            cc.dm.user.score-=this._score;
            if (cc.dm.user.withdraw_count > 2) {
                cc.dm.user.score-=fee;
            }
            this.setMyScore();
            cc.dm.user.withdraw_count+=1;
        } else {
            if (this._score > 0) {
                lab2.getComponent(cc.Label).string = '你的学费已退还';
            } else {
                lab2.getComponent(cc.Label).string = '再接再厉!';
            }
        }

        this._losed = false;
        this._score = 0;
        this.setMoneyScore();
    },

    closeRes () {
        cc.vv.audioMgr.playButtonSound();
        this.resNode.active = false;
    },

    onSetBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        this.tipsScoreLab.string = cc.utils.getScoreStr(cc.dm.user.score);
        this.setScoreNode.active = true;
        this.setEditBox.string = '';
    },

    onSettingBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        cc.utils.showSetting('gobang', function () {
            this.onCloseBtnPressed();
        }.bind(this));
    },

    onWxBtnPressed () {
        cc.vv.audioMgr.playButtonSound();

    },

    onStartBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        this.reset();
        this.gameStart();
    },

    gameStart () {
        this._gameStart = true;
        this.btnFreeStart.active = false;
        this.btnSetScore.active = false;
        this.imgStart.active = true;
        this.imgStart.opacity = 0;
        this.imgStart.scale = 1;
        cc.vv.audioMgr.playSFX("public/audio_ready.mp3");
        this.imgStart.runAction(
            cc.sequence(
                cc.spawn(
                    cc.fadeTo(0.3, 255),
                    cc.scaleTo(0.3, 0.7)
                ),
                cc.delayTime(1),
                cc.fadeTo(0.2, 0),
                cc.callFunc(function () {
                    this.computeAI(true);
                }.bind(this))
            )
        );
    },

    onEditCloseBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        this.setScoreNode.active = false;
    },

    onEditAllBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        let a = cc.dm.user.score%this._minscore;
        let score = cc.dm.user.score-a;
        let b = score*0.02;
        while (b > a) {
            score -= this._minscore;
            a += this._minscore;
            b = score*0.02;
        }

        if (score < this._minscore) {
            cc.utils.openTips('学费不能少于100万');
        } else {
            this.setEditBox.string = score/10000;
        }
    },

    onEditOkBtnPressed () {
        if (!!this.setEditBox.string) {
            let score = parseInt(this.setEditBox.string)*10000;
            score -= score%this._minscore;
            if (score < this._minscore) {
                cc.utils.openTips('学费不能少于100万');
                cc.vv.audioMgr.playButtonSound();
                return;
            }

            if (score*1.02 > cc.dm.user.score) {
                cc.utils.openTips('学费及手续费不能超过所拥有金币数');
                cc.vv.audioMgr.playButtonSound();
                return;
            }

            this._score = score;
            this.setMoneyScore();

            this.onEditCloseBtnPressed();
            this.reset();
            this.gameStart();
        } else {
            cc.utils.openTips('请输入你的学费');
        }
    },

    onLeftClosePressed () {
        cc.vv.audioMgr.playButtonSound();
        cc.utils.openTips('确定退出五子棋?',function () {
            this.onCloseBtnPressed();
        }.bind(this), function () {

        });
    },

    onContactPressed () {
        cc.vv.audioMgr.playButtonSound();
        if (!cc.sys.isNative) {
            cc.log("only native can add str to pasteboard!");
            return;
        }

        let ret = jsb.reflection.callStaticMethod(nativeApi.IOS_API, "addStringToPasteboard:", '');
        if (ret) {
            cc.log("paste ok:" + str);
        }

        return ret;
    },

    onCloseBtnPressed () {
        this.node.active = false;
        this.gameOver();
        if (this._cb) {
            this._cb();
        }
    },

    // update (dt) {},

    onTouchStart: function (touch, event) {
        return true;
    },

    // 我，下棋
    onTouchEnd: function (touch, event) {
        // 游戏结束
        if(!this._gameStart){
            return;
        }

        if(!this._isMe){
            return;
        }

        let p = this.chessBoard.convertTouchToNodeSpace(touch);
        let x = p.x-this._marginx/2;
        let y = p.y-this._marginy/2;
        let i = Math.floor(x/this._marginSize);
        let j = Math.floor(y/this._marginSize);
        if (i < 0 || i > 14 || j < 0 || j > 14) {
            return;
        }

        if (this._chesses[i][j] != 0) {
            return;
        }

        this.onStep(i, j, this._isMe);
        this._chesses[i][j] = 1;
        for (let k = 0; k < this.count; k++) {
            if (this.win[i][j][k]) {
                this.myWin[k]++;
                this.computerWin[k] = 6;
                if (this.myWin[k] == 5) {
                    this.gameOver(true);
                }
            }
        }

        if (!this._gameStart) {
            return;
        }

        this._isMe = !this._isMe;
        this.scheduleOnce(function () {
            this.computeAI();
        }, 0.3);
    },

    onStep (i, j, isMe) {
        cc.vv.audioMgr.playButtonSound();
        let item = null;
        if (isMe) {
            item = cc.instantiate(this.white);
        } else {
            item = cc.instantiate(this.black);
        }

        item.active = true;
        item.x = this._marginx+i*this._marginSize;
        item.y = this._marginy+j*this._marginSize;
        this.chessBoard.addChild(item);

        item.opacity = 100;
        item.scale = 1.5;
        item.runAction(cc.spawn(cc.fadeTo(0.3, 255), cc.scaleTo(0.3, 1)));
    },

    computeAI(first) {
        //得分数据
        let u = 0; let v = 0;
        if (first) {
            u = 7;
            v = 7;
        } else {
            let myScore = [];
            let computerScore = [];
            let max = 0;
            //得分初始化
            for (let i = 0; i < 15; i++) {
                myScore[i] = [];
                computerScore[i] = [];
                for (let j = 0; j < 15; j++) {
                    myScore[i][j] = 0;
                    computerScore[i][j] = 0;
                }
            }
            for (let i = 0; i < 15; i++) {
                for (let j = 0; j < 15; j++) {
                    if (this._chesses[i][j] == 0) //不能下在我下过的地方
                        for (let k = 0; k < this.count; k++) {
                            if (this.win[i][j][k]) {//下这里可以赢
                                if (this.myWin[k] == 1)
                                { myScore[i][j] += 200; }
                                else if (this.myWin[k] == 2)
                                { myScore[i][j] += 400; }
                                else if (this.myWin[k] == 3)
                                { myScore[i][j] += 2000; }
                                else if (this.myWin[k] == 4)
                                { myScore[i][j] += 10000; }
                                if (this.computerWin[k] == 1)
                                { computerScore[i][j] += 200; }
                                else if (this.computerWin[k] == 2)
                                { computerScore[i][j] += 420; }
                                else if (this.computerWin[k] == 3)
                                { computerScore[i][j] += 2100; }
                                else if (this.computerWin[k] == 4)
                                { computerScore[i][j] += 20000; }
                            }
                        }
                    if (myScore[i][j] > max) {
                        max = myScore[i][j];
                        u = i;
                        v = j;
                    }
                    else if (myScore[i][j] == max) {
                        if (computerScore[i][j] > computerScore[u][v]) {
                            u = i;
                            v = j;
                        }
                    }
                    if (computerScore[i][j] > max) {
                        max = computerScore[i][j];
                        u = i;
                        v = j;
                    }
                    else if (computerScore[i][j] == max) {
                        if (myScore[i][j] > myScore[u][v]) {
                            u = i;
                            v = j;
                        }
                    }
                }
            }
        }

        this.onStep(u, v, false);
        this._chesses[u][v] = 2;

        for (let k = 0; k < this.count; k++) {
            if (this.win[u][v][k]) {
                this.computerWin[k]++;
                this.myWin[k] = 6;
                if (this.computerWin[k] == 5) {
                    this.gameOver(false);
                }
            }
        }

        if (this._gameStart) {
            this._isMe = !this._isMe;
        }
    },

    //判断输赢
    checkWin(num, x, y) {
        let n1 = 0, //左右方向
            n2 = 0, //上下方向
            n3 = 0, //左上到右下方向
            n4 = 0; // 右上到左下方向
        //***************左右方向*************
        //先从点击的位置向左寻找，相同颜色的棋子n1自加，直到不是相同颜色的棋子，则跳出循环
        for (let i = x; i >= 0; i--) {
            if (this._chesses[i][y] != num) {
                break;
            }
            n1++;
        }
        //然后从点击的位置向右下一个位置寻找，相同颜色的棋子n1自加，直到不是相同颜色的棋子，则跳出循环
        for (let i = x + 1; i < 15; i++) {
            if (this._chesses[i][y] != num) {
                break;
            }
            n1++;
        }
        //****************上下方向************
        for (let i = y; i >= 0; i--) {
            if (this._chesses[x][i] != num) {
                break;
            }
            n2++;
        }
        for (let i = y + 1; i < 15; i++) {
            if (this._chesses[x][i] != num) {
                break;
            }
            n2++;
        }
        //****************左上到右下斜方向***********
        for(let i = x, j = y; i >=0, j >= 0; i--, j--) {
            if (i < 0 || j < 0 || this._chesses[i][j] != num) {
                break;
            }
            n3++;
        }
        for(let i = x+1, j = y+1; i < 15, j < 15; i++, j++) {
            if (i >= 15 || j >= 15 || this._chesses[i][j] != num) {
                break;
            }
            n3++;
        }
        //****************右上到左下斜方向*************
        for(let i = x, j = y; i >= 0, j < 15; i--, j++) {
            if (i < 0 || j >= 15 || this._chesses[i][j] != num) {
                break;
            }
            n4++;
        }
        for(let i = x+1, j = y-1; i < 15, j >= 0; i++, j--) {
            if (i >= 15 || j < 0 || this._chesses[i][j] != num) {
                break;
            }
            n4++;
        }
        //用一个定时器来延时，否则会先弹出对话框，然后才显示棋子
        let str;
        if (n1 >= 5 || n2 >= 5 || n3 >= 5 || n4 >= 5) {
            if (num == 2) {
                //白棋
                str = "白棋赢了，游戏结束！"
            } else {//黑棋
                str = "黑棋赢了，游戏结束！"
            }

            console.log('check win = ', str);
            this._gameStart = false;
            this.btnFreeStart.active = true;
            this.btnSetScore.active = true;
            return true;
        }

        return false;
    }

});
