
cc.Class({
    extends: cc.Component,

    properties: {
        speed: 100,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    update(dt) {
        var radian = window.heroRadian;
        
        if (radian != -100 && radian != undefined) {
            this.node.x += Math.cos(radian) * this.speed * dt;
            this.node.y += Math.sin(radian) * this.speed * dt;
        }
    },
});
