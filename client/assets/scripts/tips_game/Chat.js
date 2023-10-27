cc.Class({
    extends: cc.Component,

    properties: {
        emojiNode:{
            default:null,
            type:cc.Node
        },

        cWordsNode:{
            default:null,
            type:cc.Node
        },

        emojiContent:{
            default:null,
            type:cc.Node
        },

        cWordsContent:{
            default:null,
            type:cc.Node
        },

        cWordsItem:{
            default:null,
            type:cc.Node
        },

        editNode:{
            default:null,
            type:cc.EditBox
        },
    },

    // use this for initialization
    onLoad: function () {
        cc.utils.setNodeWinSize(this.node);
        this.node.x = this.node.width/2;

        let emojiChildren = this.emojiContent.children;
        emojiChildren.forEach(function(el, i) {
            let eventHandler = new cc.Component.EventHandler();
            eventHandler.target = this;
            eventHandler.component = "Chat";
            eventHandler.handler = "onAnimateClick";
            eventHandler.customEventData = i+""; //自定义数据
            el.getComponent(cc.Button).clickEvents.push(eventHandler);
        }, this);

        this.emojiNode.active = false;
        this.cWordsNode.active = true;
    },

    /**
     * 表情点击事件
     */
    onAnimateClick:function(event, id){
        if (!!this._now) {
            if (Date.now()-this._now < 5000) {
                cc.utils.openWeakTips('你的动作太快了，先坐下喝杯茶吧');
                this.onClose();
                return;
            }
        }

        this._now = Date.now();

        console.log("点击表情:" + id);
        cc.connect.emoji(id);
        this.onClose();
    },

    /**
     * 常用语点击
     */
    onCWordsClick:function(event, id){
        if (!!this._now) {
            if (Date.now()-this._now < 5000) {
                cc.utils.openWeakTips('你说得太快了，先坐下喝杯茶吧');
                this.onClose();
                return;
            }
        }

        this._now = Date.now();

        console.log("点击常用语:" + id);
        cc.connect.cWord(id);
        this.onClose();
    },

    onTogglesPressed(event, data) {
        if (data == 0) {
            this.emojiNode.active = false;
            this.cWordsNode.active = true;
        } else {
            this.emojiNode.active = true;
            this.cWordsNode.active = false;
        }
    },

    /**
     * 发送聊天信息
     * @param event
     */
    onSendChat:function (event) {
        let str = this.editNode.string;
        if(str.length > 30){
            str = str.substr(0, 30);
        }
        cc.connect.chat(str);
        this.editNode.string = '';
        this.onClose();
    },

    onShow:function(gameName) {
        console.log("打开聊天界面");
        this.node.active = true;
        this.node.runAction(cc.moveTo(0.5, cc.p(0, 0)));

        if (gameName == this._gameName) {
            return;
        }

        this._gameName = gameName;

        this.cWordsContent.removeAllChildren();
        let arr = cc.enum.CWords[this._gameName];
        if (!!arr) {
            for (let i = 0; i < arr.length; i++) {
                let str = arr[i];
                if (str.length >= 15) {
                    str = str.substr(0, 12);
                    str += '...';
                }
                let item = cc.instantiate(this.cWordsItem);
                item.getChildByName('label').getComponent(cc.Label).string = str;
                this.cWordsContent.addChild(item);
                cc.utils.addClickEvent(item, this, 'Chat', 'onCWordsClick', i.toString());
            }
        }
    },

    onClose:function() {
        let self = this;
        let seq = cc.sequence(
            cc.moveTo(0.5, cc.p(this.node.width/2, 0)),
            cc.callFunc(function () {
                self.node.active = false;
            })
        );
        this.node.runAction(seq);
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
