cc.Class({
    extends: cc.Component,

    properties: {
        nums: {
            default: [],
            type: [cc.Label]
        },
        // strLabel: {
        //     default: null,
        //     type: cc.Node,
        // },
        _inputIndex: 0,
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        cc.utils.setNodeWinSize(this.node);
        this.isActive = false;
    },

    onEnable: function () {
        console.log("激活窗口");
        this.onResetClicked();
        this.isActive = true;
    },

    onDisable() {
        console.log("停止窗口");
        this.isActive = false;
    },

    open(cb) {
        this._cb = cb;
    },

    onInputFinished: function (rid) {
        cc.connect.joinRoom(rid);
    },

    onInput: function (num) {
        if (this._inputIndex >= this.nums.length) {
            return;
        }
        this.nums[this._inputIndex].string = num;
        this._inputIndex += 1;
        this.onInputRoom();

    },
    onInputRoom() {
        if (this._inputIndex == this.nums.length) {
            let roomId = this.parseRoomID();
            this.onInputFinished(roomId);
        }
    },
    onNumClicked: function (event, custom) {
        // this.strLabel.active = false;
        let intCustom = parseInt(custom);
        this.onInput(intCustom);
        cc.vv.audioMgr.playButtonSound();
    },

    onResetClicked: function () {
        for (let i = 0; i < this.nums.length; ++i) {
            this.nums[i].string = "";
        }
        this._inputIndex = 0;
        // this.strLabel.active = true;
    },
    onDelClicked: function () {
        if (this._inputIndex > 0) {
            this._inputIndex -= 1;
            this.nums[this._inputIndex].string = "";
        }
        if(this._inputIndex == 0){
            // this.strLabel.active = true;
        }
        cc.vv.audioMgr.playButtonSound();
    },
    onCloseClicked: function () {
        this.node.active = false;
        cc.vv.audioMgr.playButtonSound();
        if (this._cb) {
            this._cb();
        }
    },

    parseRoomID: function () {
        let str = "";
        for (let i = 0; i < this.nums.length; ++i) {
            str += this.nums[i].string;
        }
        return str;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
