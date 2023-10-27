cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {
        this.tempNode = undefined;
    },

    start: function () {
    },

    update: function (dt) {
        if(this.tempNode){
            this.ratioVal = this.tempNode.x;
        }
    },


    /**
     * 初始化搓牌
     * @param frontTex
     * @param backTex
     * @param endCb
     * @private
     */
    initCfg: function (frontTex, backTex, endCb) {

        if(this.isShow){
            console.log("进来多次");
            return;
        }

        this.posX = 0;  //节点位置
        this.posY = 0;  //节点位置
        this.ratioVal = 0;
        this.radiusVal = 0;
        this.szBack = "resources/poker_beimian.jpg"; //图片
        this.szFont = "resources/poker_10.jpg";      //正面图片
        this.RubCardLayer_State_Move = 0;
        this.RubCardLayer_State_Smooth = 1;
        var RubCardLayer_Pai = 3.141592;
        this.RubCardLayer_RotationFrame = 10;
        this.RubCardLayer_RotationAnger = RubCardLayer_Pai / 3;
        this.RubCardLayer_SmoothFrame = 10;
        this.RubCardLayer_SmoothAnger = RubCardLayer_Pai / 6;
        this.state = this.RubCardLayer_State_Move;
        this.frontSprite = frontTex;
        this.backSprite = backTex;
        this.endCb = endCb;
        this.isShow = true;
        this.isEnd = false;

        this.__createTextures(frontTex, backTex);
        this.__initTexAndPos(true);
        this.__initTexAndPos(false);
        this.__createGlNode();
        this.__createAllProgram();
        this.__registTouchEvent();
        this.radiusVal = this.pokerHeight / 10;

        this._per = 1.05;
        this.maxPer = 2.0;
        this.touchX = 20;
    },

    close:function () {
        if(this.isEnd)
            return;
        this.isEnd = true;
        this.node._sgNode.removeChild(this.glnode);
        this.node._sgNode.removeChild(this.layer);
        this.onDestroy();
        this.endCb && this.endCb();
    },

    quickClose:function () {
        if(this.isEnd)
            return;
        if(this.isShow){
            this.isEnd = true;
            this.node._sgNode.removeChild(this.glnode);
            this.node._sgNode.removeChild(this.layer);
            this.onDestroy();
        }
    },

    __createGlNode: function () {
        var glnode = new cc.GLNode();
        this.node._sgNode.addChild(glnode, 10);
        this.glnode = glnode;
        this.smoothFrame = 1;
        this.isCreateNum = false;

        glnode.draw = function () {
            //this.__drawByEndProgram()
            if (this.state == this.RubCardLayer_State_Move) {
                this.__drawByMoveProgram(0);
            }
            else if (this.state == this.RubCardLayer_State_Smooth) {
                if (this.smoothFrame <= this.RubCardLayer_RotationFrame) {
                    this.__drawByMoveProgram(-this.RubCardLayer_RotationAnger * this.smoothFrame / this.RubCardLayer_RotationFrame);
                }
                else if (this.smoothFrame < (this.RubCardLayer_RotationFrame + this.RubCardLayer_SmoothFrame)) {
                    var scale = (this.smoothFrame - this.RubCardLayer_RotationFrame) / this.RubCardLayer_SmoothFrame;
                    this.__drawBySmoothProgram(Math.max(0.01, this.RubCardLayer_SmoothAnger * (1 - scale)))
                }
                else {
                    //第一次到这里就铺平了
                    this.__drawByEndProgram();
                    //关闭
                    this.close();
                }
                this.smoothFrame = this.smoothFrame + 1
            }
        }.bind(this);
    },

    __registTouchEvent: function () {
        let layer = new cc.Layer();
        this.node._sgNode.addChild(layer, 10);
        this.layer = layer;
        let self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                if(self.RubCardLayer_State_Smooth === self.state){
                    return;
                }

                if(self.tempNode){
                    self.tempNode.stopAllActions();
                    self.tempNode.destroy();
                    delete self.tempNode;
                }

                var location = touch.getLocation();
                self.ratioVal = (location.y - self.touchStartY) / self.pokerHeight;
                self.ratioVal = Math.max(0, self.ratioVal);
                self.ratioVal = Math.min(self.maxPer, self.ratioVal);
                return true;
            },
            onTouchMoved: function (touch, event) {
                if(self.RubCardLayer_State_Smooth === self.state){
                    return;
                }
                var location = touch.getLocation();

                self.ratioVal = (location.y - self.touchStartY) / self.pokerHeight;
                self.ratioVal = Math.max(0, self.ratioVal);
                self.ratioVal = Math.min(self.maxPer, self.ratioVal);
                if(self.ratioVal >= self._per){
                    self.state = self.RubCardLayer_State_Smooth;
                }
                return true;
            },
            onTouchEnded: function (touch, event) {
                if (self.ratioVal >= self._per) {
                    self.state = self.RubCardLayer_State_Smooth;
                } else {
                    self.tempNode = new cc.Node();
                    self.tempNode.parent = self.node;
                    self.tempNode.x = self.ratioVal;
                    self.tempNode.runAction(
                        cc.sequence(
                            cc.moveTo(0.5, 0, 0),
                            cc.callFunc(()=>{
                                self.tempNode.destroy();
                                delete self.tempNode;
                                self.ratioVal = 0;
                            })
                        ));
                }
            },

        }, layer);
    },

    __createAllProgram: function () {
        var moveVertSource =
            "attribute vec2 a_position;\n" +
            "attribute vec2 a_texCoord;\n" +
            "uniform float ratio; \n" +
            "uniform float radius; \n" +
            "uniform float width;\n" +
            "uniform float height;\n" +
            "uniform float offx;\n" +
            "uniform float offy;\n" +
            "uniform float rotation;\n" +
            "varying vec2 v_texCoord;\n" +

            "void main()\n" +
            "{\n" +
            "   vec4 tmp_pos = vec4(0.0, 0.0, 0.0, 0.0);\n" +
            "   tmp_pos = vec4(a_position.x, a_position.y, 0.0, 1.0);\n" +

            "   float halfPeri = radius * 3.14159; \n" +
            "   float hr = height * ratio;\n" +
            "   if(tmp_pos.x < 0.0 || tmp_pos.x > width || tmp_pos.y < 0.0 || tmp_pos.y > height){\n" +
            "   tmp_pos.x = 0.0;tmp_pos.y = 0.0;}\n" +
            "   if(hr > 0.0 && hr <= halfPeri){\n" +
            "         if(tmp_pos.y < hr){\n" +
            "               float rad = hr/ 3.14159;\n" +
            "               float arc = (hr-tmp_pos.y)/rad;\n" +
            "               tmp_pos.y = hr - sin(arc)*rad;\n" +
            "               tmp_pos.z = rad * (1.0-cos(arc)); \n" +
            "          }\n" +
            "   }\n" +
            "   if(hr > halfPeri){\n" +
            "        float straight = (hr - halfPeri)/2.0;\n" +
            "        if(tmp_pos.y < straight){\n" +
            "            tmp_pos.y = hr  - tmp_pos.y;\n" +
            "            tmp_pos.z = radius * 2.0; \n" +
            "        }\n" +
            "        else if(tmp_pos.y < (straight + halfPeri)) {\n" +
            "            float dy = halfPeri - (tmp_pos.y - straight);\n" +
            "            float arc = dy/radius;\n" +
            "            tmp_pos.y = hr - straight - sin(arc)*radius;\n" +
            "            tmp_pos.z = radius * (1.0-cos(arc)); \n" +
            "        }\n" +
            "    }\n" +
            "    float y1 = tmp_pos.y;\n" +
            "    float z1 = tmp_pos.z;\n" +
            "    float y2 = height;\n" +
            "    float z2 = 0.0;\n" +
            "    float sinRat = sin(rotation);\n" +
            "    float cosRat = cos(rotation);\n" +
            "    tmp_pos.y=(y1-y2)*cosRat-(z1-z2)*sinRat+y2;\n" +
            "    tmp_pos.z=(z1-z2)*cosRat+(y1-y2)*sinRat+z2;\n" +
            "    tmp_pos.y = tmp_pos.y - height/2.0*(1.0-cosRat);\n" +
            "    tmp_pos += vec4(offx, offy, 0.0, 0.0);\n" +
            "    gl_Position = CC_MVPMatrix * tmp_pos;\n" +
            "    v_texCoord = a_texCoord;\n" +
            "}\n";

        var smoothVertSource =
            "attribute vec2 a_position;\n" +
            "attribute vec2 a_texCoord;\n" +
            "uniform float width;\n" +
            "uniform float height;\n" +
            "uniform float offx;\n" +
            "uniform float offy;\n" +
            "uniform float rotation;\n" +
            "varying vec2 v_texCoord;\n" +

            "void main()\n" +
            "{\n" +
            "   vec4 tmp_pos = vec4(0.0, 0.0, 0.0, 0.0);\n" +
            "   tmp_pos = vec4(a_position.x, a_position.y, 0.0, 1.0);\n" +
            "    if(tmp_pos.x < 0.0 || tmp_pos.x > width || tmp_pos.y < 0.0 || tmp_pos.y > height){\n" +
            "    tmp_pos.x = 0.0;tmp_pos.y = 0.0;}\n" +
            "    float cl = height/5.0;\n" +
            "    float sl = (height - cl)/2.0;\n" +
            "    float radii = (cl/rotation)/2.0;\n" +
            "    float sinRot = sin(rotation);\n" +
            "    float cosRot = cos(rotation);\n" +
            "    float distance = radii*sinRot;\n" +
            "    float centerY = height/2.0;\n" +
            "    float poxY1 = centerY - distance;\n" +
            "    float poxY2 = centerY + distance;\n" +
            "    float posZ = sl*sinRot;\n" +
            "    if(tmp_pos.y <= sl){\n" +
            "       float length = sl - tmp_pos.y;\n" +
            "       tmp_pos.y = poxY1 - length*cosRot;\n" +
            "       tmp_pos.z = posZ - length*sinRot;\n" +
            "    }\n" +
            "    else if(tmp_pos.y < (sl+cl)){\n" +
            "       float el = tmp_pos.y - sl;\n" +
            "       float rotation2 = -el/radii;\n" +
            "       float x1 = poxY1;\n" +
            "       float y1 = posZ;\n" +
            "       float x2 = centerY;\n" +
            "       float y2 = posZ - radii*cosRot;\n" +
            "       float sinRot2 = sin(rotation2);\n" +
            "       float cosRot2 = cos(rotation2);\n" +
            "       tmp_pos.y=(x1-x2)*cosRot2-(y1-y2)*sinRot2+x2;\n" +
            "       tmp_pos.z=(y1-y2)*cosRot2+(x1-x2)*sinRot2+y2;\n" +
            "    }\n" +
            "    else if(tmp_pos.y <= height){\n" +
            "        float length = tmp_pos.y - cl - sl;\n" +
            "        tmp_pos.y = poxY2 + length*cosRot;\n" +
            "        tmp_pos.z = posZ - length*sinRot;\n" +
            "    }\n" +
            "    tmp_pos += vec4(offx, offy, 0.0, 0.0);\n" +
            "    gl_Position = CC_MVPMatrix * tmp_pos;\n" +
            "    v_texCoord = vec2(1.0-a_texCoord.x, a_texCoord.y);\n" +
            "}\n";

        var endVertSource =
            "\n" +
            "attribute vec2 a_position;\n" +
            "attribute vec2 a_texCoord;\n" +
            "uniform float width;\n" +
            "uniform float height;\n" +
            "uniform float offx;\n" +
            "uniform float offy;\n" +
            "varying vec4 v_fragmentColor;\n" +
            "varying vec2 v_texCoord;\n" +

            "void main()\n" +
            "{\n" +
            "   vec4 tmp_pos = vec4(0.0, 0.0, 0.0, 0.0);\n" +
            "   tmp_pos = vec4(a_position.x, a_position.y, 0.0, 1.0);\n" +
            "    if(tmp_pos.x < 0.0 || tmp_pos.x > width || tmp_pos.y < 0.0 || tmp_pos.y > height){\n" +
            "    tmp_pos.x = 0.0;tmp_pos.y = 0.0;}\n" +
            "    tmp_pos += vec4(offx, offy, 0.0, 0.0);\n" +
            "    gl_Position = CC_MVPMatrix * tmp_pos;\n" +
            "    v_texCoord = vec2(1.0-a_texCoord.x, a_texCoord.y);\n" +
            "}\n";

        var strFragSource =
            "\n" +
            "#ifdef GL_ES\n" +
            "precision mediump float;\n" +
            "#endif\n" +
            "varying vec4 v_fragmentColor;\n" +
            "varying vec2 v_texCoord;\n" +
            "void main()\n" +
            "{\n" +
            "//TODO, 这里可以做些片段着色特效\n" +
            "gl_FragColor = texture2D(CC_Texture0, v_texCoord);\n" +
            "}\n";

        var moveGlProgram = this.moveGlProgram = this.__createProgram(moveVertSource, strFragSource);
        var smoothGlProgram = this.smoothGlProgram = this.__createProgram(smoothVertSource, strFragSource);
        var endGlProgram = this.endGlProgram = this.__createProgram(endVertSource, strFragSource);
        this.moveGlProgram.retain();
        this.smoothGlProgram.retain();
        this.endGlProgram.retain();

        moveGlProgram.rotationLc = gl.getUniformLocation(moveGlProgram.getProgram(), "rotation");
        moveGlProgram.ratio = gl.getUniformLocation(moveGlProgram.getProgram(), "ratio");
        moveGlProgram.radius = gl.getUniformLocation(moveGlProgram.getProgram(), "radius");
        moveGlProgram.offx = gl.getUniformLocation(moveGlProgram.getProgram(), "offx");
        moveGlProgram.offy = gl.getUniformLocation(moveGlProgram.getProgram(), "offy");
        moveGlProgram.Height = gl.getUniformLocation(moveGlProgram.getProgram(), "height");
        moveGlProgram.Width = gl.getUniformLocation(moveGlProgram.getProgram(), "width");

        smoothGlProgram.rotationLc = gl.getUniformLocation(smoothGlProgram.getProgram(), "rotation");
        smoothGlProgram.offx = gl.getUniformLocation(smoothGlProgram.getProgram(), "offx");
        smoothGlProgram.offy = gl.getUniformLocation(smoothGlProgram.getProgram(), "offy");
        smoothGlProgram.Height = gl.getUniformLocation(smoothGlProgram.getProgram(), "height");
        smoothGlProgram.Width = gl.getUniformLocation(smoothGlProgram.getProgram(), "width");

        endGlProgram.offx = gl.getUniformLocation(endGlProgram.getProgram(), "offx");
        endGlProgram.offy = gl.getUniformLocation(endGlProgram.getProgram(), "offy");
        endGlProgram.Height = gl.getUniformLocation(endGlProgram.getProgram(), "height");
        endGlProgram.Width = gl.getUniformLocation(endGlProgram.getProgram(), "width");
    },

    //创建着色器
    __createProgram: function (vsource, fsource) {
        var glProgram = cc.GLProgram.createWithByteArrays(vsource, fsource);
        glProgram.link();
        glProgram.updateUniforms();
        return glProgram
    },

    //绘制移动时
    __drawByMoveProgram: function (rotation) {
        var glProgram = this.moveGlProgram;
        gl.enable(gl.CULL_FACE);
        glProgram.use();
        glProgram.setUniformsForBuiltins();

        glProgram.setUniformLocationF32(glProgram.rotationLc, rotation);
        glProgram.setUniformLocationF32(glProgram.ratio, this.ratioVal);
        glProgram.setUniformLocationF32(glProgram.radius, this.radiusVal);
        glProgram.setUniformLocationF32(glProgram.offx, this.offx);
        glProgram.setUniformLocationF32(glProgram.offy, this.offy);
        glProgram.setUniformLocationF32(glProgram.Height, this.pokerHeight);
        glProgram.setUniformLocationF32(glProgram.Width, this.pokerWidth);

        gl.bindTexture(gl.TEXTURE_2D, this.backSpriteId);
        this.__drawArrays(this.backPosBuffer, this.backTexBuffer);
        gl.bindTexture(gl.TEXTURE_2D, this.frontSpriteId);
        this.__drawArrays(this.frontPosBuffer, this.frontTexBuffer);
        gl.disable(gl.CULL_FACE);
    },

    __drawBySmoothProgram: function (rotation) {
        var glProgram = this.smoothGlProgram;
        glProgram.use();
        glProgram.setUniformsForBuiltins();

        gl.bindTexture(gl.TEXTURE_2D, this.frontSpriteId);
        glProgram.setUniformLocationF32(glProgram.rotationLc, rotation);
        glProgram.setUniformLocationF32(glProgram.offx, this.offx);
        glProgram.setUniformLocationF32(glProgram.offy, this.offy);
        glProgram.setUniformLocationF32(glProgram.Height, this.pokerHeight);
        glProgram.setUniformLocationF32(glProgram.Width, this.pokerWidth);

        this.__drawArrays(this.frontPosBuffer, this.frontTexBuffer)
    },

    //绘制顶点绑定纹理
    __drawByEndProgram: function () {
        var glProgram = this.endGlProgram;
        glProgram.use();
        glProgram.setUniformsForBuiltins();

        gl.bindTexture(gl.TEXTURE_2D, this.frontSpriteId);
        glProgram.setUniformLocationF32(glProgram.offx, this.offx);
        glProgram.setUniformLocationF32(glProgram.offy, this.offy);
        glProgram.setUniformLocationF32(glProgram.Height, this.pokerHeight);
        glProgram.setUniformLocationF32(glProgram.Width, this.pokerWidth);
        this.__drawArrays(this.frontPosBuffer, this.frontTexBuffer);
    },

    //绘制顶点
    __drawArrays: function (pos, tex) {
        // var VERTEX_ATTRIB_FLAG_POSITION = 1;
        // var VERTEX_ATTRIB_FLAG_TEX_COORDS = 4;
        //
        // cc.glEnableVertexAttribs(VERTEX_ATTRIB_FLAG_TEX_COORDS | VERTEX_ATTRIB_FLAG_POSITION);

        // console.log("position: ", cc.macro.VERTEX_ATTRIB_POSITION);
        // console.log("tex_coords: ", cc.macro.VERTEX_ATTRIB_TEX_COORDS);
        gl.enableVertexAttribArray(cc.macro.VERTEX_ATTRIB_POSITION);
        gl.enableVertexAttribArray(cc.macro.VERTEX_ATTRIB_TEX_COORDS);

        var VERTEX_ATTRIB_POSITION = 0;
        var VERTEX_ATTRIB_TEX_COORDS = 2;
        gl.bindBuffer(gl.ARRAY_BUFFER, pos);
        gl.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, 0, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, tex);
        gl.vertexAttribPointer(VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, 0, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.posTexNum);
        gl.bindBuffer(gl.ARRAY_BUFFER, 0)
    },

    //初始化纹理与顶点
    __initTexAndPos: function (isBack) {
        var nDiv = 40; //将宽分成100份
        var verts = new Array(); //位置坐标
        var texs = new Array(); //纹理坐标
        var dh = this.pokerHeight / nDiv;
        var dw = this.pokerWidth;

        //计算顶点位置
        for (var c = 1; c <= nDiv; c++) {
            var x = 0;
            var y = (c - 1) * dh;
            var quad = null;
            if (isBack) {
                quad = new Array(x, y, x + dw, y, x, y + dh, x + dw, y, x + dw, y + dh, x, y + dh);
            }
            else {
                quad = new Array(x, y, x, y + dh, x + dw, y, x + dw, y, x, y + dh, x + dw, y + dh);
            }
            for (var i = 0; i <= 5; i++) {
                var quadX = quad[i * 2];
                var quadY = quad[i * 2 + 1];
                var numX = 1 - quadY / this.pokerHeight;
                var numY = quadX / this.pokerWidth;
                texs.push(Math.max(0, numX));
                texs.push(Math.max(0, numY));
            }
            for (var k in quad) {
                verts.push(quad[k]);
            }
        }

        cc.log("this.pokerWidth=" + this.pokerWidth);
        cc.log("this.pokerHeight=" + this.pokerHeight);
        cc.log("verts.length=" + verts.length);
        for (var k in verts)
        {
            cc.log(k+"="+verts[k])
        }
        var posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        this.posTexNum = verts.length / 2;

        var texBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texs), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        if (isBack) {
            this.backPosBuffer = posBuffer.buffer_id;
            this.backTexBuffer = texBuffer.buffer_id;
        }
        else {
            this.frontPosBuffer = posBuffer.buffer_id;
            this.frontTexBuffer = texBuffer.buffer_id;
        }
    },

    __createTextures: function () {
        // var imgUrl = cc.url.raw(this.szFont);
        // this.frontSprite = cc.textureCache.addImage(imgUrl);
        //
        //
        // imgUrl = cc.url.raw(this.szBack);
        // this.backSprite = cc.textureCache.addImage(imgUrl);
        // this.backSprite = this.getNode(backNode);
        this.backSprite.retain();

        // this.frontSprite = this.getNode(frontNode);
        this.frontSprite.retain();

        let pokerSize = this.backSprite.getContentSize();
        this.pokerWidth = pokerSize.height;
        this.pokerHeight = pokerSize.width;

        this.offx = this.posX - this.pokerWidth / 2;
        this.offy = this.posY - this.pokerHeight / 2;
        this.backSpriteId = this.backSprite.getName();
        this.frontSpriteId = this.frontSprite.getName();
        console.log("back getName:", this.backSpriteId);
        console.log("front getName:", this.backSpriteId);

        console.log("back _glID:", this._glID);
        console.log("front _glID:", this._glID);

        console.log("窗口高：" + cc.winSize.height + "; 牌的高:" + this.pokerHeight);

        this.touchStartY = /*cc.winSize.height*/ this.pokerHeight / 2 + this.posY - this.pokerHeight / 2 - 50;
    },

    getNode: function (node) {
        var size = cc.director.getWinSize();
        if (node !== undefined) {
            size = node.getContentSize();
        }

        var texture = cc.RenderTexture.create(Math.floor(size.height), Math.floor(size.width), cc.Texture2D.PIXEL_FORMAT_RGBA8888, gl.DEPTH24_STENCIL8_OES);
        if (node !== undefined) {
            node.setPosition(cc.v2(size.height / 2, size.width / 2));
        }
        texture.begin();
        if (node === undefined)
            cc.director.getScene()._sgNode.visit();
        else
            node._sgNode.visit();
        texture.end();

        // var fileName = "result_share.jpg";
        // var fullPath = jsb.fileUtils.getWritablePath() + fileName;
        // if (jsb.fileUtils.isFileExist(fullPath)) {
        //     jsb.fileUtils.removeFile(fullPath);
        // }
        // console.log(fullPath);
        // cc.log(fullPath);
        // texture.saveToFile(fileName, cc.ImageFormat.PNG);

        return texture.getSprite().getTexture();
    },

    //结束需要移除
    onDestroy: function () {
        if(cc.sys.isNative && this.isShow){
            gl._deleteBuffer(this.backPosBuffer);
            gl._deleteBuffer(this.backTexBuffer);
            gl._deleteBuffer(this.frontPosBuffer);
            gl._deleteBuffer(this.frontTexBuffer);
            this.moveGlProgram.release();
            this.smoothGlProgram.release();
            this.endGlProgram.release();
            this.backSprite.release();
            this.frontSprite.release();
            if(this.tempNode){
                this.tempNode.stopAllActions();
                delete this.tempNode;
            }
            console.log("释放搓牌资源");
            this.isShow = false;
        }
    },
});

