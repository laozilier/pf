cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        duration:5
    },

    // use this for initialization
    onLoad: function () {
        this.label = this.node.children[1].getComponent(cc.Label);
        this.bubbleImg = this.node.children[0];
    },

    show: function (str) {
        if(str.length > 14){
            this.label.node.width = 280 + (Math.ceil((str.length - 14) / 2) * 40);
        }

        this.label.string = str;
        this.bubbleImg.width = this.label.node.width + 40;
        this.bubbleImg.height = this.label.node.height + 50;
        this.node.active = true;

        //5秒后隐藏聊天气泡
        this.scheduleOnce(function () {
            this.node.active = false;
        }, this.duration);
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // },
});
