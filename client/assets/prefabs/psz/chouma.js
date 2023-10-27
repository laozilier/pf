cc.Class({
    extends: cc.Component,

    properties: {
        maSprite: {
            default: [],
            type: cc.SpriteFrame
        },
        choumaNode: {
            default: null,
            type: cc.Sprite
        },
        choumaNum: {
            default: null,
            type: cc.Label
        },
    },

    Chouma(maNum){
        let key = maNum;
        let value = this.changeKey(key);

        if(maNum < 1000){
            this.node.children[0].getComponent(cc.Label).string = value;
            this.node.getComponent(cc.Sprite).spriteFrame = this.maSprite[1];
        }else if(maNum <= 5000){
            this.node.children[0].getComponent(cc.Label).string = value;
            this.node.getComponent(cc.Sprite).spriteFrame = this.maSprite[1];
        }else if(maNum <= 10000){
            this.node.children[0].getComponent(cc.Label).string = value;
            this.node.getComponent(cc.Sprite).spriteFrame = this.maSprite[2];
        }else if(maNum <= 50000){
            this.node.children[0].getComponent(cc.Label).string = value;
            this.node.getComponent(cc.Sprite).spriteFrame = this.maSprite[3];
        }else if(maNum <= 100000){
            this.node.children[0].getComponent(cc.Label).string = value;
            this.node.getComponent(cc.Sprite).spriteFrame = this.maSprite[4];
        }else if(maNum < 200000){
            this.node.children[0].getComponent(cc.Label).string = value;
            this.node.getComponent(cc.Sprite).spriteFrame = this.maSprite[5];
        }else{
            this.node.children[0].getComponent(cc.Label).string = value;
            this.node.getComponent(cc.Sprite).spriteFrame = this.maSprite[5];
        }
    },

    changeKey(value){
        let string = "";
        if(value >= 10000){
            string = Math.floor(value / 10000)  + "B";
        }else if(value >= 10000){
            string = Math.floor(value /1000)  + "A";
        }else{
            string = value;
        }
        return string;
    }

});
