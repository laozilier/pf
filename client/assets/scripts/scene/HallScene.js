cc.Class({
    extends: cc.Component,

    properties: {
        headNode: {
            default: null,
            type: cc.Node,
        },

        nameLab1: {
            default: null,
            type: cc.Label,
        },

        nameLab2: {
            default: null,
            type: cc.Label,
        },

        IDLab1: {
            default: null,
            type: cc.Label,
        },

        IDLab2: {
            default: null,
            type: cc.Label,
        },

        btnQinyouRoom: {
            default: null,
            type: cc.Node
        },

        tipsNode: {
            default: null,
            type: cc.Node
        },
    },

    // use this for initialization
    onLoad: function () {
        cc.utils.checkX(this.node);//645703
        cc.connect.updateLocation();
        this.btnQinyouRoom.getChildByName('noimg').active = true;
        this.btnQinyouRoom.getChildByName('clubNode').active = false;
        cc.sceneName = 'hall';
        cc.sceneSrc = this;

        this.updateInfo();
    },

    start () {
        cc.vv.audioMgr.playBGM("bg/hall.mp3");

        if (cc.sys.isNative && !!cc.version) {
            let lastversion = cc.sys.localStorage.getItem('lastversion');
            if (lastversion != cc.version) {
                this.onMessagePressed();
                cc.sys.localStorage.setItem('lastversion', cc.version);
            }
        }

        if (!!this._tipsed) {} else {
            cc.connect.hallNotice((msg) => {
                let tipsstr = msg.replace('\r', '');
                tipsstr = tipsstr.replace('\n', '');
                this.tipsNode.getComponent('NoticeNode').open(tipsstr, true);
                this._tipsed = true;
            });
        }

        //this.btnInvite.active = true;
    },

    onEnable () {

    },

    /**
     * 更新用户信息
     */
    updateInfo:function () {
        //更新房卡数
        this.setScoreStr();
        //更新uid
        this.IDLab1.string = 'ID:'+cc.dm.user.uid;
        this.IDLab2.string = 'ID:'+cc.dm.user.uid;
        //更新名字
        this.nameLab1.string = cc.dm.user.shortname;
        this.nameLab2.string = cc.dm.user.shortname;

        this.headNode.getComponent('HeadNode').updateData();
    },

    /**
     * 更新分数
     */
    setScoreStr () {
        
    },

    /***
     * 点击用户图像
     */
    onUserInfoPressed () {
        cc.vv.audioMgr.playButtonSound();
        cc.utils.openMyInfo();
    },

    /***
     * 绑定邀请码
     */
    onBindBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        cc.utils.openInputInviteCode();
    },

    /***
     * 客服
     */
    onKefuPressed:function(){
        cc.vv.audioMgr.playButtonSound();
        let kefu = this.node.getChildByName('kefu');
        if (kefu) {
            kefu.active = true;
        } else {
            cc.utils.loadPrefabNode('hall/kefu', function (kefu) {
                this.node.addChild(kefu, 99, 'kefu');
            }.bind(this));
        }
    },

    /***
     * 设置
     */
    onSettingPressed:function () {
        cc.vv.audioMgr.playButtonSound();
        cc.utils.showSetting ();
    },

    /***
     * 反赌博
     */
    onFdbPressed () {
        cc.vv.audioMgr.playButtonSound();
        let fdb = this.node.getChildByName('fdb');
        if (fdb) {
            fdb.active = true;
        } else {
            cc.utils.loadPrefabNode('tips_hall/fdb', function (fdb) {
                this.node.addChild(fdb, 99, 'fdb');
            }.bind(this));
        }
    },

    /***
     * 分享二维码
     */
    onQrcodePressed:function (event) {
        if (!!event) {
            cc.vv.audioMgr.playButtonSound();
        }

        cc.utils.openQCodeShare();
    },

    /***
     * 信息
     */
    onMessagePressed:function () {
        cc.vv.audioMgr.playButtonSound();
        let message = this.node.getChildByName('message');
        if (message) {
            message.active = true;
        } else {
            cc.utils.loadPrefabNode('tips_hall/message', function (message) {
                this.node.addChild(message, 99, 'message');
            }.bind(this));
        }
    },

    /***
     * 玩法
     */
    onPlayrulePressed:function () {
        cc.vv.audioMgr.playButtonSound();
        let playrule = this.node.getChildByName('playrule');
        if (playrule) {
            playrule.active = true;
        } else {
            cc.utils.loadPrefabNode('tips_hall/playrule', function (playrule) {
                this.node.addChild(playrule, 99, 'playrule');
            }.bind(this));
        }
    },

    /***
     * 创建亲友圈
     */
    onCreateClubPressed:function() {
        cc.vv.audioMgr.playButtonSound();
        let creatClub = this.node.getChildByName('creatClub');
        if (creatClub) {
            creatClub.active = true;
            creatClub.getComponent('CreatClub').open(function () {
                this.checkUserClub();
            }.bind(this));
        } else {
            cc.utils.loadPrefabNode('tips_hall/creatClub', function (creatClub) {
                this.node.addChild(creatClub, 1, 'creatClub');
                creatClub.getComponent('CreatClub').open(function () {
                    this.checkUserClub();
                }.bind(this));
            }.bind(this));
        }
    },

    /***
     * 绑定邀请码
     */
    onBindBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        cc.utils.openInputInviteCode(function () {
            cc.utils.openLoading('正在进入亲友群...');
            cc.connect.checkReconnectInfo();
        }.bind(this));
    },

    onDestroy() {
        cc.sceneSrc = null;
        console.log('释放大厅场景');
    }
});
