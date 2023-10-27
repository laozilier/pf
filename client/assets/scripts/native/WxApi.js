/**
 * Created by apple on 2017/7/28.
 */

window.wxApi = {
    ANDROID_WX_API: "com/chesscard/othersdk/WXAPI",
    ANDROID_MAP_API: "com/chesscard/othersdk/Map",
    ANDROID_APP_API: "org/cocos2dx/javascript/AppActivity",
    IOS_API: "AppController",
    isShareImg: false
};

/**
 * 检查是否安装微信
 * @return {*}
 */
window.wxApi.isWXAppInstalled = function () {
    if (cc.sys.isNative) {
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            return true;
            // return jsb.reflection.callStaticMethod(this.ANDROID_Wx_API, "isWXAppInstalled", "()Z");
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            return jsb.reflection.callStaticMethod("WXApi", "isWXAppInstalled");
        }
    }

    return false;
};


window.wxApi.login = function () {
    if (cc.sys.isNative) {
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            console.log('window.wxApi.login: ', this.ANDROID_WX_API);
            jsb.reflection.callStaticMethod(this.ANDROID_WX_API, "Login", "()V");
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod(this.IOS_API, "login");
        }
    } else {
        /** 此处可能添加功能 **/
        cc.utils.openWeakTips('敬请期待此平台的微信登录功能');
    }
};

/**
 * 分享图片
 * @param node
 */
window.wxApi.shareImg = function (node, scene) {
    if (!cc.sys.isNative) {
        /** 此处可能添加功能 **/
        return;
    }

    if (this.isShareImg) {
        return;
    }

    this.isShareImg = true;
    var position = cc.p(0, 0);
    var size = cc.director.getWinSize();
    var fileName = "result_share.jpg";
    var fullPath = jsb.fileUtils.getWritablePath() + fileName;
    if (jsb.fileUtils.isFileExist(fullPath)) {
        jsb.fileUtils.removeFile(fullPath);
    }

    if(!!node){
        size = node.getContentSize();
        position = node.getPosition();
    }

    var texture = cc.RenderTexture.create(Math.floor(size.width), Math.floor(size.height), cc.Texture2D.PIXEL_FORMAT_RGBA8888, gl.DEPTH24_STENCIL8_OES);

    //设置到中间
    if(!!node){
        node.setPosition(cc.v2(size.width / 2, size.height / 2));
    }

    //开始绘制
    texture.begin();
    //强制重绘
    if (!!node)
        node._sgNode.visit();
    else
        cc.director.getScene()._sgNode.visit();
    texture.end();

    //还原到以前位置
    if(!!node){
        setTimeout(function () {
            node.setPosition(position);
        }, 0);
    }

    //保存到路径
    texture.saveToFile(fileName, cc.ImageFormat.JPG);
    //只有原生平台才能分享
    if (cc.sys.os === cc.sys.OS_ANDROID || cc.sys.os === cc.sys.OS_IOS) {
        var self = this;
        var tryTimes = 0;
        var fn = function () {
            if (jsb.fileUtils.isFileExist(fullPath)) {
                var height = 60;
                var scale = height / size.height;
                var width = Math.floor(size.width * scale);
                var jsonstr = JSON.stringify({fullPath:fullPath, width: width, height: height, scene: scene});
                if (cc.sys.os === cc.sys.OS_ANDROID) {
                    jsb.reflection.callStaticMethod(self.ANDROID_WX_API, "ShareIMG", "(Ljava/lang/String;)V", jsonstr);
                } else if (cc.sys.os === cc.sys.OS_IOS) {
                    jsb.reflection.callStaticMethod(self.IOS_API, "shareIMG:", jsonstr);
                } else {
                    console.log("platform:" + cc.sys.os + " dosn't implement share.");
                }
                self.isShareImg = false;
            }
            else {
                tryTimes++;
                if (tryTimes > 10) {
                    console.log("time out...");
                    self.isShareImg = false;
                    return;
                }
                setTimeout(fn, 50);
            }
        };
        setTimeout(fn, 50);
    } else {
        this.isShareImg = false;
    }
};

window.wxApi.shareUrl = function (url, title, desc) {
    if (!cc.sys.isNative) {
        /** 此处可能添加功能 **/
        return;
    }

    if (cc.sys.os == cc.sys.OS_ANDROID) {
        jsb.reflection.callStaticMethod(this.ANDROID_WX_API, "Share", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", url, title, desc);
    }
    else if (cc.sys.os == cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod(this.IOS_API, "share:shareTitle:shareDesc:", url, title, desc);
    } else {
        console.log("platform:" + cc.sys.os + " dosn't implement share.");
    }
};

/**
 * 微信登录成功回调
 * @param code   用户换取access_token的code
 */
window.wxApi.onLoginResp = function (code) {
    if (code && code.length > 0) {
        cc.connect.wxLogin(code);
    } else {
        cc.utils.openTips('微信登录失败，请稍后重试');
    }
};

/**
 * 微信小程序支付
 * @param token_id
 */
window.wxApi.wxBuy = function (token_id) {
    if (!cc.sys.isNative) {
        /** 此处可能添加功能 **/
        return;
    }

    if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod(this.ANDROID_WX_API, "wxBuy", "(Ljava/lang/String;)V", token_id);
    }
    else if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod(this.IOS_API, "wxBuy:", token_id);
    }
};