
cc.Class({
    extends: cc.Component,

    properties: {

    },

    start() {
        this.joystick = this.node.getChildByName('joystick');
        this.bg = this.node.getChildByName('background');
        this.baseline = cc.v2(10, 0);

        window.heroForward = cc.v2(0, 0);

        this.registerTouchEvent();
    },

    registerTouchEvent() {
        this.bg.on(cc.Node.EventType.TOUCH_START, this.onTouchMove.bind(this));
        this.bg.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove.bind(this));
        this.bg.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd.bind(this));
        this.bg.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd.bind(this));
    },

    onTouchMove(event) {
        var world = event.getLocation();
        var pos = this.node.convertToNodeSpaceAR(world);

        this.joystick.setPosition(pos);

        var radian = this.calculateRadian(pos, this.baseline);
        window.heroRadian = radian;
        this.calculateForward(radian);
    },

    onTouchEnd(event) {
        this.joystick.setPosition(0, 0);
        window.heroRadian = -100;
    },

    calculateRadian(v2, baseline) {
        var dotProduct = v2.dot(baseline);
        var moldA = Math.sqrt(v2.dot(v2));
        var moldB = Math.sqrt(baseline.dot(baseline));
        var radian = Math.acos(dotProduct / (moldA * moldB));

        return v2.y > 0 ? radian : radian * -1;
    },

    calculateForward(radian) {

        var x = Math.cos(radian);
        var y = Math.sin(radian);

        this.setForward(x, y);
    },

    setForward(x, y) {
        window.heroForward.x = x;
        window.heroForward.y = y;
    }

    // update (dt) {},
});
