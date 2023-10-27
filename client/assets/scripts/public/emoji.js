

let overtime = -1;
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
    },

    // use this for initialization
    onLoad: function () {

    },

    play:function(name){
        this.node.getComponent(cc.Animation).play(name);
        this.node.active = true;
        overtime = 3;
    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(overtime > 0){
            if((overtime -= dt) < 0){
                this.node.getComponent(cc.Animation).stop();
                this.node.active = false;
            }
        }
    },
});
