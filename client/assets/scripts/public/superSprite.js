/// <reference path="../../../creator.d.ts" />
cc.Class({
    extends: cc.Component,

    properties: {
        url:"",
        _defaultFrame: null,
    },

    // use this for initialization
    onLoad: function () {
        this.url && this.loadUrl(this.url);
    },

    /**
     * 加载网络图片
     * @param url 网址
     * @param type 图片类型 默认为jpg
     */
    loadUrl: function(url, type, cb){
        if (cc.utils._frames == null || cc.utils._frames == undefined) {
            cc.utils._frames = {};
        }

        let sp = this.node.getComponent(cc.Sprite);
        if (this._defaultFrame == null || this._defaultFrame == undefined) {
            this._defaultFrame = sp.spriteFrame;
        }
        if(!url || url.length == 0) {
            sp.spriteFrame = this._defaultFrame;
            if (!!cb) {
                cb();
            }
            return;
        }

        if (cc.utils._frames[url] != undefined) {
            let spriteFrame = cc.utils._frames[url];
            sp.spriteFrame = spriteFrame;
            if (!!cb) {
                cb();
            }
        } else {
            cc.loader.load({
                url: url,
                type: type ? type : 'jpg'
            }, function(err, tex){
                try{
                    if(err){
                        console.log(err);
                    } else if(tex instanceof cc.Texture2D){
                        let spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height));
                        sp.spriteFrame = spriteFrame;
                        cc.utils._frames[url] = spriteFrame;
                    } else {
                        console.log(tex);
                    }
                } catch (e){

                }

                if (!!cb) {
                    cb();
                }
            });
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
