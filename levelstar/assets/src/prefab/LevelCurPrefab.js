var Comm = require("../Comm.js");
cc.Class({
    extends: cc.Component,

    properties: {
        strLabel:cc.Label,
    },
    setLevel:function (level) {
        this.level = level;
        var score = Comm.levelScores[level.toString()];
        if (!score){score=0;}
        this.strLabel.string = "第"+level+"关 "+score+"分";
    },
    mainButtonClick: function() {
        this.cb(this.level);
    },
    setClickCallback: function(cb) {
        this.cb = cb;
    },
});
