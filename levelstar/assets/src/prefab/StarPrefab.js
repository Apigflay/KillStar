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
        pic1:cc.SpriteFrame,
        pic2:cc.SpriteFrame,
        pic3:cc.SpriteFrame,
        pic4:cc.SpriteFrame,
        pic5:cc.SpriteFrame,
    },

    // use this for initialization
    onLoad: function () {
        var self = this;
        this.node.setScale(1.17);
        // this.node.on(cc.Node.EventType.TOUCH_START, function(e){
        //     self.ctrl.touchStar(self.gridX, self.gridY);
        // });
    },
    // 设置方块类型
    setType: function (starType) {
        this.starType = starType;
        this.getComponent(cc.Sprite).spriteFrame = this["pic" + starType];
    },
    // 设置网格坐标
    setGridXY: function (x,y) {
        this.gridX = x;
        this.gridY = y;
        this.node.setPosition((x-5)*75 + 75/2, (y-5)*75 + 75/2);
    },
    setSelected:function(selected) {
        if (!selected) {
            this.node.stopAllActions();
            this.node.setScale(1.17);
        } else {
            this.node.runAction(
                cc.repeatForever(cc.sequence(
                    cc.scaleTo(0.3, 1),
                    cc.scaleTo(0.3, 1.17)
                )));
        }
    },
    // 移动到一个网格坐标
    goTo: function (x,y, delay) {
        this.gridX = x;
        this.gridY = y;
        this.node.runAction(cc.sequence(
            cc.delayTime(delay),
            cc.moveTo(0.1, cc.p((x-5)*75 + 75/2, (y-5)*75 + 75/2))
            ));
    }
});
