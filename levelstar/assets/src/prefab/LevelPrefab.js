var Comm = require("../Comm.js");
cc.Class({
    extends: cc.Component,

    properties: {
        strLabel:cc.Label,
        lock:cc.Node,
    },
    setLevel:function (level) {
        this.level = level;
        var score = Comm.levelScores[level.toString()];
        if (!score){score=0;}
        this.strLabel.string = "第"+level+"关 "+score+"分";
        this.lock.active = false;
    },
    setUnlockInfoForLevel:function (level) {
        this.level = level;
        this.strLabel.string = "总分"+Comm.calcTargetScore(this.level-1)+"解锁第" + level + "关";
        this.lock.active = true;
    },
    mainButtonClick: function() {
        this.cb(this.level);
    },
    setClickCallback: function(cb) {
        this.cb = cb;
    },
});
