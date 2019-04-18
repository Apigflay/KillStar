cc.Class({
    extends: cc.Component,

    properties: {
        titleLabel:cc.Label,
        contentLabel:cc.Label,
        btn1Node:cc.Node,
        btn2Node:cc.Node,
        btn1Label:cc.Label,
        btn2Label:cc.Label,
    },
    // 弹出对话框
    show: function (title, content, btn1Str, btn1Cb, btn2Str, btn2Cb) {
        this.titleLabel.string = title;
        this.contentLabel.string = content;
        this.btn1Label.string = btn1Str;
        this.btn1Cb = btn1Cb;
        if(!btn2Str) {
            this.btn1Node.x = 0;
            this.btn2Node.active = false;
        }else{
            this.btn2Label.string = btn2Str;
            this.btn2Cb = btn2Cb;
        }
    },
    btn1Click:function() {
        this.btn1Cb();
        this.node.destroy();
    },
    btn2Click:function() {
        this.btn2Cb();
        this.node.destroy();
    },
    // 点击空白
    fullScreenBtnClick:function() {
        console.log("fullScreenBtnClick");
    },
    // 点击对话框内
    dialogBtnClick:function() {
        console.log("dialogBtnClick");

    },
});
