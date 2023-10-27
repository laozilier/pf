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
        hua:{
            default:[],
            type:cc.SpriteFrame,
            displayName:"花牌"
        },
        type:{
            default:[],
            type:cc.SpriteFrame,
            displayName:"花色"
        },
        font:{
            default:[],
            type:cc.SpriteFrame,
            displayName:"数字"
        }
    },

    // use this for initialization
    onLoad: function () {
    },

    //显示数字
    playShow:function () {
        this.node.getChildByName("num1").runAction(cc.fadeIn(0.5));
        this.node.getChildByName("num2").runAction(cc.fadeIn(0.5));
        if (this.value > 51) {
            return;
        }

        this.node.getChildByName("xiao1").runAction(cc.fadeIn(0.5));
        this.node.getChildByName("xiao2").runAction(cc.fadeIn(0.5));
    },

    setValue : function (value) {
        this.value = value;
        this.list = this.node.getChildByName("list").children;
        this.list.forEach(function (el) {
            el.active = false;
        });
        this.node.getChildByName("hua").active = false;
        if(value !== undefined){
            let v = value%13;  //牌的值
            let t = parseInt(value/13); //牌的花色
            this.node.getChildByName("num1").opacity = 0;
            this.node.getChildByName("num2").opacity = 0;
            this.node.getChildByName("xiao1").opacity = 0;
            this.node.getChildByName("xiao2").opacity = 0;

            //打印牌花色
            // console.log(['A','2','3',"4",'5','6','7','8','9','10','J','Q','K'][v] + ":" +
            // ["♦", "♣", "♥", "♠"][t]);

            // console.log(v + (t%2) * 13);
            //牌值
            if (t > 3) {
                this.node.getChildByName("num1").getComponent(cc.Sprite).spriteFrame = this.font[v + 2 * 13];
                this.node.getChildByName("num2").getComponent(cc.Sprite).spriteFrame = this.font[v + 2 * 13];
                this.node.getChildByName("hua").active = true;
                this.node.getChildByName("hua").getComponent(cc.Sprite).spriteFrame = this.hua[12+v];
                return;
            } else {
                this.node.getChildByName("num1").getComponent(cc.Sprite).spriteFrame = this.font[v + (t%2) * 13];
                this.node.getChildByName("num2").getComponent(cc.Sprite).spriteFrame = this.font[v + (t%2) * 13];
                
                this.node.getChildByName("xiao1").getComponent(cc.Sprite).spriteFrame = this.type[t];
                this.node.getChildByName("xiao2").getComponent(cc.Sprite).spriteFrame = this.type[t];
    
                if(v >= 10){
                    this.node.getChildByName("hua").active = true;
                    this.node.getChildByName("hua").getComponent(cc.Sprite).spriteFrame = this.hua[(v-10) + (t*3)];
                    return;
                }
            }

            let arr = [];
            let x1 = 230;
            let x2 = 125;
            let x3 = 85;
            let y1 = 120;
            switch(v){
                case 0:
                    arr.push({x:0,y:0,rotation:90});
                    break;
                case 1:
                    arr.push({x:x1,y:0,rotation:90});
                    arr.push({x:-x1,y:0,rotation:-90});
                    break;
                case 2:
                    arr = [
                        {x:x1,y:0,rotation:90},
                        {x:0,y:0,rotation:90},
                        {x:-x1,y:0,rotation:-90}];
                    break;
                case 3:
                    arr=[
                        {x:x1,y:y1,rotation:90},
                        {x:x1,y:-y1,rotation:90},
                        {x:-x1,y:y1,rotation:-90},
                        {x:-x1,y:-y1,rotation:-90}];
                    break;
                case 4:
                    arr = [
                        {x:x1,y:y1,rotation:90},
                        {x:x1,y:-y1,rotation:90},
                        {x:-x1,y:y1,rotation:-90},
                        {x:-x1,y:-y1,rotation:-90},
                        {x:0,y:0,rotation:90}];
                    break;
                case 5:
                    arr = [
                        {x:x1,y:y1,rotation:90},
                        {x:x1,y:-y1,rotation:90},
                        {x:0,y:y1,rotation:90},
                        {x:0,y:-y1,rotation:90},
                        {x:-x1,y:y1,rotation:-90},
                        {x:-x1,y:-y1,rotation:-90}];
                    break;
                case 6:
                    arr = [
                        {x:x1,y:y1,rotation:90},
                        {x:x1,y:-y1,rotation:90},
                        {x:0,y:y1,rotation:90},
                        {x:0,y:-y1,rotation:90},
                        {x:-x1,y:y1,rotation:-90},
                        {x:-x1,y:-y1,rotation:-90},
                        {x:x2,y:0,rotation:90}];
                    break;
                case 7:
                    arr = [
                        {x:x1,y:y1,rotation:90},
                        {x:x1,y:-y1,rotation:90},
                        {x:0,y:y1,rotation:90},
                        {x:0,y:-y1,rotation:90},
                        {x:-x1,y:y1,rotation:-90},
                        {x:-x1,y:-y1,rotation:-90},
                        {x:x2,y:0,rotation:-90},
                        {x:-x2,y:0,rotation:-90}];
                    break;
                case 8:
                    arr = [
                        {x:x1,y:y1,rotation:90},
                        {x:x1,y:-y1,rotation:90},
                        {x:x3,y:y1,rotation:90},
                        {x:x3,y:-y1,rotation:90},
                        {x:-x1,y:y1,rotation:-90},
                        {x:-x1,y:-y1,rotation:-90},
                        {x:-x3,y:y1,rotation:-90},
                        {x:-x3,y:-y1,rotation:-90},
                        {x:0,y:0,rotation:90}];
                    break;
                case 9:
                    arr = [
                        {x:x1,y:y1,rotation:90},
                        {x:x1,y:-y1,rotation:90},
                        {x:x3,y:y1,rotation:90},
                        {x:x3,y:-y1,rotation:90},
                        {x:-x1,y:y1,rotation:-90},
                        {x:-x1,y:-y1,rotation:-90},
                        {x:-x3,y:y1,rotation:-90},
                        {x:-x3,y:-y1,rotation:-90},
                        {x:x2,y:0,rotation:90},
                        {x:-x2,y:0,rotation:-90}];
                    break;
            }

            arr.forEach(function (el, i) {
                let sp = this.list[i].getComponent(cc.Sprite);
                sp.spriteFrame = this.type[t];
                sp.node.x = el.x;
                sp.node.y = el.y;
                sp.node.rotation = el.rotation;
                sp.node.active = true;
            }.bind(this));
        }
    },
});
