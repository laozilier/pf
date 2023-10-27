/// <reference path="../../../creator.d.ts" />

/**
 * 此为label的超集，增加了一些对文本操作的功能
 * 1.可以设置最大文字长度，超出部分会以...形式显示，
 * 默认...显示在中间
 */

cc.Class({
    extends: cc.Component,

    properties: {
        
        maxLength:{
            default:4,
            type:cc.Integer
        }
    },

    // use this for initialization
    onLoad: function () {

    },

    start: function () {
        this.setString(this.node.getComponent(cc.Label).string);
    },
    
    onEnable: function () {
        // let label = this.node.getComponent(cc.Label);
        // let str = label.string;
        // if(str.length > this.maxLength){
        //     label.string = "";
        //     label.string += str.substring(0, this.maxLength) + "...";
        // }
    },
    
    setString: function (str) {
        if(str === undefined){
            return;
        }
        let label = this.node.getComponent(cc.Label);
        if(str.length > this.maxLength){
            label.string = "";
            label.string += str.substring(0, this.maxLength) + "...";
        } else {
            label.string = str;
        }
    },


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
