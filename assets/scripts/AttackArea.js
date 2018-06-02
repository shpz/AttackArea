
var AreaType = cc.Enum({
    SECTOR: 1,
    CIRCLE: 2,
});

var VertDefault = `

attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

void main()
{
    gl_Position = CC_PMatrix * a_position;
    v_fragmentColor = a_color;
    v_texCoord = a_texCoord;
}

`;

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

        this.vertStr = VertDefault;
        this.fragStr = 'FragSector';

        if (this.areaType == AreaType.SECTOR) {

        }
        else if (this.areaType == AreaType.CIRCLE) {
            this.fragStr = 'FragCircle';
        }

        this.loadShaderStr(this.fragStr, this.setProgram.bind(this));
    },

    loadShaderStr(shaderName, callback) {
        cc.loader.loadRes('shaders/' + shaderName, function (err, str) {
            if (err) {
                console.error('load fail, ', err);
                return;
            }

            this.fragStr = str;
            callback();
            this.updateArea();
        }.bind(this));
    },

    setProgram() {
        this.program = new cc.GLProgram();
        var vert = this.vertStr;
        var frag = this.fragStr;

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
