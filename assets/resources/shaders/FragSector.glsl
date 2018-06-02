#ifdef GL_ES
precision mediump float;
#endif

float calulateAngle (vec2 posA, vec2 posB);
void makeCircle (out vec4 fragColor, in vec2 fragCoord);

uniform float sectorAngle;
uniform float saturation;
uniform float maxRadius;
uniform float minRadius;
uniform vec2 forward;
uniform vec3 areaColor;

varying vec2 v_texCoord;

void main( void ) {
	makeCircle(gl_FragColor, gl_FragCoord.xy);
}

float calulateAngle (vec2 posA, vec2 posB) {
    float pro = dot(posA, posB);
    float radian = acos( pro / (length(posA) * length(posB)) );
    float angle = degrees(radian);

    return angle;
}

void makeCircle (out vec4 fragColor, in vec2 fragCoord) {
	vec2 uv = v_texCoord.xy;
	vec2 position = vec2(0.5 - uv.x, 0.5 - uv.y) * vec2(1.0, 1.0);

	float mold = length(position);
    float angle = abs(calulateAngle(position, forward));

	vec4 tex = texture2D(CC_Texture0, uv);
	if (abs(mold) > maxRadius || abs(mold) < minRadius || angle > sectorAngle) {
		discard;
    }
    else {
        tex.r = areaColor.r;
        tex.g = areaColor.g;
        tex.b = areaColor.b;
        tex.a = (mold - minRadius) / (1.0 - minRadius) * saturation;
        fragColor = tex;
    }
}