cc.Class({
    extends: cc.Component,

    properties: {
        tipLabel:cc.Label,
        tipBg:cc.Node,
    },
    // 显示一个tip
    show: function (tipStr) {
        var self = this;
        this.tipLabel.string = tipStr;
        this.node.setPosition(cc.director.getWinSize().width/2, 100);
        this.node.runAction(cc.sequence(
            cc.delayTime(2),
            cc.fadeOut(0.3),
            cc.callFunc(function(){
                self.node.destroy();
            })
            ));
    },
});
