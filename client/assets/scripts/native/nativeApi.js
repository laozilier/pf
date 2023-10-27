/**
 * Created by apple on 2017/8/2.
 */

window.nativeApi = {};

/**
 * 获取版本号
 * @returns {*}
 */
window.nativeApi.getVersion = function () {
    var version = {name:"游戏", version:"1.0.0", build:10001};
    if(cc.sys.isNative){
        if(cc.sys.os == cc.sys.OS_ANDROID){
            version = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getVersion", "()Ljava/lang/String;");
            version = JSON.parse(version);
        }
        else if(cc.sys.os == cc.sys.OS_IOS){
            version = jsb.reflection.callStaticMethod("AppController", "getVersion");
            version = JSON.parse(version);
        }
    }
    return version;
};

/**
 * 获取手机信息
 */
window.nativeApi.getPhoneInfo = function () {
    var info = "{}";
    if (cc.sys.isNative) {
        if(cc.sys.os == cc.sys.OS_ANDROID){
            info = jsb.reflection.callStaticMethod("com/chesscard/othersdk/PhoneInfo", "getPhoneInfo", "()Ljava/lang/String;");
            info = JSON.parse(info);
            return info;
        }
        else if(cc.sys.os == cc.sys.OS_IOS){
            info = jsb.reflection.callStaticMethod("AppController", "getVersion");
            info = JSON.parse(info);
            return info;
        }
    }

    return {
        deviceId: Date.now()
    };
};

/**
 * 获取网络状态
 */
window.nativeApi.getNetworkStatus = function () {
    var state = "1";
    if (cc.sys.isNative) {
        if(cc.sys.os == cc.sys.OS_ANDROID){
            state = jsb.reflection.callStaticMethod("com/chesscard/othersdk/PhoneInfo", "getNetworkStatus", "()Ljava/lang/String;");
        }
        else if(cc.sys.os == cc.sys.OS_IOS){
            state = jsb.reflection.callStaticMethod("AppController", "getNetworkStatus");
        }
    }

    return parseInt(state);
};

/**
 * 获取电池状态
 */
window.nativeApi.getBattery = function () {
    if (cc.sys.isNative) {
        if(cc.sys.os == cc.sys.OS_ANDROID){
            var info = jsb.reflection.callStaticMethod("com/chesscard/othersdk/PhoneInfo", "getBattery", "()Ljava/lang/String;");
            if (!!info) {
                info = JSON.parse(info);
                return info;
            }
        }
        else if(cc.sys.os == cc.sys.OS_IOS){
            var info = jsb.reflection.callStaticMethod("AppController", "getBattery");
            if (!!info) {
                info = JSON.parse(info);
                return info;
            }
        }
    }

    return {
        battery: 0.8,
        state: 0
    };
};

/**
 * 获取二维二维码
 */
window.nativeApi.getQRCode = function (cb) {
    if (cc.sys.isNative) {
        if(cc.sys.os == cc.sys.OS_ANDROID){
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getQRCode", "()V");
        }
        else if(cc.sys.os == cc.sys.OS_IOS){
            jsb.reflection.callStaticMethod("AppController", "getQRCode");
        }
    } else {
        cc.utils.openWeakTips('请使用手机进行此操作');
        return;
    }


    this._qrcb = cb;
};

/**
 * 二维二维码回调
 */
window.nativeApi.QRCodeResp = function (url) {
    console.log('QRCodeResp = ', url);
    if (!!this._qrcb) {
        this._qrcb(url);
    }
};

/**
 * 获取房间id
 */
window.nativeApi.getRoomId = function () {
    var rid = null;
    if (cc.sys.isNative) {
        if(cc.sys.os == cc.sys.OS_ANDROID){
            rid = jsb.reflection.callStaticMethod("com/chesscard/othersdk/Model", "getRoomID", "()V");
        }
        else if(cc.sys.os == cc.sys.OS_IOS){
            rid = jsb.reflection.callStaticMethod("AppController", "getRoomID");
        }
    }

    return rid;
};


/**
 * 删除房间id
 */
window.nativeApi.delRoomId = function () {
    var rid = null;
    if (cc.sys.isNative) {
        if(cc.sys.os == cc.sys.OS_ANDROID){
            rid = jsb.reflection.callStaticMethod("com/chesscard/othersdk/Model", "delRoomID", "()V");
        }
        else if(cc.sys.os == cc.sys.OS_IOS){
            rid = jsb.reflection.callStaticMethod("AppController", "delRoomID");
        }
    }

    return rid;
};

/**
 * 获取安全防护反馈1
 */
window.nativeApi.getSaferet = function () {
    var saferet = '0';
    if(cc.sys.os == cc.sys.OS_ANDROID){
        saferet = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getSaferet", "()Ljava/lang/String;");
    }
    else if(cc.sys.os == cc.sys.OS_IOS){
        saferet = jsb.reflection.callStaticMethod("AppController", "getSaferet");
    }

    return saferet;
};

/**
 * 获取安全防护反馈2
 */
window.nativeApi.getSaferetNew = function (safekey) {
    var saferet = '0';
    if(cc.sys.os == cc.sys.OS_ANDROID){
        saferet = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getSaferetNew", "(Ljava/lang/String;)Ljava/lang/String;", safekey);
    }
    else if(cc.sys.os == cc.sys.OS_IOS){
        saferet = jsb.reflection.callStaticMethod("AppController", "getSaferetNew:", safekey);
    }

    return saferet;
};

/**
 * 保存图片
 * @param node
 */
window.nativeApi.saveImg = function (node) {
    if (!cc.sys.isNative) {
        /** 此处可能添加功能 **/
        return;
    }

    if (this.isSaveImg) {
        return;
    }

    this.isSaveImg = true;
    var position = cc.p(0, 0);
    var size = cc.director.getWinSize();
    var fileName = "result_save.jpg";
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
                if (cc.sys.os === cc.sys.OS_ANDROID) {
                    jsb.reflection.callStaticMethod(wxApi.ANDROID_APP_API, "SaveIMG", "(Ljava/lang/String;)V", fullPath);
                } else if (cc.sys.os === cc.sys.OS_IOS) {
                    jsb.reflection.callStaticMethod(wxApi.IOS_API, "SaveIMG:", fullPath);
                } else {
                    console.log("platform:" + cc.sys.os + " dosn't implement share.");
                }
                self.isSaveImg = false;
            }
            else {
                tryTimes++;
                if (tryTimes > 10) {
                    console.log("time out...");
                    self.isSaveImg = false;
                    return;
                }
                setTimeout(fn, 50);
            }
        };
        setTimeout(fn, 50);
    } else {
        this.isSaveImg = false;
    }
};

window.nativeApi.copyInfo = function (str) {
    if (cc.sys.os == cc.sys.OS_ANDROID) {
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "copyToPastboard", "(Ljava/lang/String;)V", str);
        cc.utils.openWeakTips('复制成功');
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("AppController", "copyToPastboard:", str);
        cc.utils.openWeakTips('复制成功');
    } else {
        cc.utils.openWeakTips('请在手机上复制');
    }
};