
var AreaType = cc.Enum({
    SECTOR: 1,
    CIRCLE: 2,
});

cc.Class({
    extends: cc.Component,

    properties: {
        areaSprite: cc.Sprite,
        obstacle: cc.Node,
    },

    start() {
        cc.dynamicAtlasManager.enabled = false;

        this.forward = cc.v2(1, 0);

        this.initiateObstacle();
    },

    initiateObstacle() {
        let worldBox = this.obstacle.getBoundingBoxToWorld();

        let material = this.areaSprite.getMaterial(0);
        material.setProperty('world1', [worldBox.x, worldBox.y, worldBox.x, worldBox.y + worldBox.height]);
        material.setProperty('world2', [worldBox.x, worldBox.y, worldBox.x + worldBox.width, worldBox.y]);
        material.setProperty('world3', [worldBox.x + worldBox.width, worldBox.y, worldBox.x + worldBox.width, worldBox.y + worldBox.height]);
        material.setProperty('world4', [worldBox.x + worldBox.width, worldBox.y + worldBox.height, worldBox.x, worldBox.y + worldBox.height]);
    },

    updateArea() {
        let material = this.areaSprite.getMaterial(0);
        material.setProperty('forward', [this.forward.x, this.forward.y, 0, 0]);
    },

    update(dt) {
        if (!cc.Vec2.ZERO.equals(window.heroForward)) {
            this.forward.x = window.heroForward.x;
            this.forward.y = window.heroForward.y;

            this.updateArea();
        }
    }
});
