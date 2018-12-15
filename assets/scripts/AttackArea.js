
var AreaType = cc.Enum({
    SECTOR: 1,
    CIRCLE: 2,
});

cc.Class({
    extends: cc.Component,

    properties: {
        areaType: {
            type: AreaType,
            default: AreaType.SECTOR,
        },

        color: {
            default: cc.color(255, 0, 0),
        },

        fragSector: {
            default: null,
            type: cc.Asset
        },

        fragCircle: {
            default: null,
            type: cc.Asset
        },

        vertDefault: {
            default: null,
            type: cc.Asset,
        },

        saturation: 3,

        maxRadius: 100,

        minRadius: 80,

        sectorAngle: 45,
    },

    start() {
        this.forward = cc.v2(0, 1);
        this.program = null;

        this.normalizedMaxRadius = this.maxRadius / this.node.width;
        this.normalizedMinRadius = this.minRadius / this.node.width;
        this.normalizedColor = {
            x: this.color.r / 255,
            y: this.color.g / 255,
            z: this.color.b / 255
        };

        this.realAngle = this.sectorAngle == 180 ? 179 / 2 : this.sectorAngle / 2;

        this.loadShaderString(
            [
                this.fragSector.nativeUrl,
                this.fragCircle.nativeUrl,
                this.vertDefault.nativeUrl,
            ],
            () => {

                if (this.areaType == AreaType.SECTOR) {
                    this.fragString = cc.loader.getRes(this.fragSector.nativeUrl);
                }
                else if (this.areaType == AreaType.CIRCLE) {
                    this.fragString = cc.loader.getRes(this.fragCircle.nativeUrl);
                }

                this.vertString = cc.loader.getRes(this.vertDefault.nativeUrl);

                this.setProgram();
                this.updateArea();

            }
        );
    },

    loadShaderString(assets, callback) {
        cc.loader.load(assets, (err, resources) => {
            if (err) {
                console.warn('load fail, ', err);
                return;
            }

            callback && callback();
        });
    },

    setProgram() {
        this.program = new cc.GLProgram();
        var vert = this.vertString;
        var frag = this.fragString;

        if (cc.sys.isNative) {
            this.program.initWithString(vert, frag);
        }
        else {
            this.program.initWithVertexShaderByteArray(vert, frag);

            this.program.addAttribute(cc.macro.ATTRIBUTE_NAME_POSITION, cc.macro.VERTEX_ATTRIB_POSITION);
            this.program.addAttribute(cc.macro.ATTRIBUTE_NAME_COLOR, cc.macro.VERTEX_ATTRIB_COLOR);
            this.program.addAttribute(cc.macro.ATTRIBUTE_NAME_TEX_COORD, cc.macro.VERTEX_ATTRIB_TEX_COORDS);
        }
        this.program.link();
        this.program.updateUniforms();

        var sgNode = this.node.getComponent(cc.Sprite)._sgNode;
        var program = this.program;
        if (cc.sys.isNative) {
            var state = cc.GLProgramState.getOrCreateWithGLProgram(program);
            sgNode.setGLProgramState(state);
        }
        else {
            sgNode.setShaderProgram(program);
        }

    },

    updateArea() {
        if (this.program) {
            this.program.use();

            if (cc.sys.isNative) {
                var state = cc.GLProgramState.getOrCreateWithGLProgram(this.program);

                state.setUniformFloat('saturation', this.saturation);
                state.setUniformFloat('maxRadius', this.normalizedMaxRadius);
                state.setUniformFloat('minRadius', this.normalizedMinRadius);

                state.setUniformVec3('areaColor', this.normalizedColor);

                if (this.areaType === AreaType.SECTOR) {
                    state.setUniformVec2('forward', this.forward);
                    state.setUniformFloat('sectorAngle', this.realAngle);
                }
            }
            else {
                var saturation = this.program.getUniformLocationForName('saturation');
                var maxRadius = this.program.getUniformLocationForName('maxRadius');
                var minRadius = this.program.getUniformLocationForName('minRadius');
                var areaColor = this.program.getUniformLocationForName('areaColor');

                this.program.setUniformLocationWith1f(saturation, this.saturation);
                this.program.setUniformLocationWith1f(maxRadius, this.normalizedMaxRadius);
                this.program.setUniformLocationWith1f(minRadius, this.normalizedMinRadius);
                this.program.setUniformLocationWith3f(areaColor, this.normalizedColor.x, this.normalizedColor.y, this.normalizedColor.z);

                if (this.areaType === AreaType.SECTOR) {
                    var forward = this.program.getUniformLocationForName('forward');
                    var sectorAngle = this.program.getUniformLocationForName('sectorAngle');

                    this.program.setUniformLocationWith2f(forward, this.forward.x, this.forward.y);
                    this.program.setUniformLocationWith1f(sectorAngle, this.realAngle);
                }

            }

        }
    },

    update(dt) {
        if (!cc.Vec2.ZERO.equals(window.heroForward)) {
            this.forward.x = window.heroForward.x;
            this.forward.y = window.heroForward.y;

            this.updateArea();
        }
    }
});
