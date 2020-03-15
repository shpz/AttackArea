#ifdef GL_ES
precision mediump float;
#endif

float calulateAngle (vec2 posA, vec2 posB);
void makeCircle (out vec4 fragColor, in vec2 fragCoord);
bool checkRay(vec4 ray);
// bool isInRect (in vec2 pInUV);

uniform float sectorAngle;
uniform float saturation;
uniform float maxRadius;
uniform float minRadius;
uniform vec2 forward;
uniform vec3 areaColor;
uniform vec2 obstacleStart;
uniform vec2 obstacleSize;

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

	if (abs(mold) > maxRadius || abs(mold) < minRadius || angle > sectorAngle || checkRay(vec4(0.5, 0.5, uv.x, uv.y))) { 
        discard;
    }
    else {
        fragColor = vec4(areaColor.rgb, (mold - minRadius) / (1.0 - minRadius) * saturation);
    }
}

bool checkRay (vec4 ray) {
    vec2 a1 = vec2(ray.x, ray.y);
    vec2 a2 = vec2(ray.z, ray.w);

    vec2 b1 = vec2(0.0, 0.3);
    vec2 b2 = vec2(1.0, 0.3);

    float ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
    float ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
    float u_b  = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

    if ( u_b != 0.0 ) {
        float ua = ua_t / u_b;
        float ub = ub_t / u_b;

        if ( 0.0 <= ua && ua <= 1.0 && 0.0 <= ub && ub <= 1.0 ) {
            return true;
        }
    }

    return false;
}

// bool isInRect (in vec2 pInUV) {
//     vec2 pInRect = vec2(pInUV.x - obstacleStart.x, pInUV.y - obstacleStart.y);

//     vec3 vab = vec3(0, obstacleSize.y, 0);
//     vec3 vap = vec3(obstacleSize.x, obstacleSize.y, 0);
//     vec3 vcd = vec3(0, -obstacleSize.y, 0);
//     vec3 vcp = vec3(-(obstacleSize.x - pInRect.x), obstacleSize.y - pInRect.y, 0);
//     float dotProduct1 = dot(cross(vab, vap), cross(vcd, vcp));

//     vec3 vda = vec3(0, -obstacleSize.x, 0);
//     vec3 vdp = vec3(-(obstacleSize.x - pInRect.x), -pInRect.y, 0);
//     vec3 vbc = vec3(obstacleSize.x, 0, 0);
//     vec3 vbp = vec3(pInRect.x, obstacleSize.y - pInRect.y, 0);
//     float dotProduct2 = dot(cross(vda, vdp), cross(vbc, vbp));

//     if (dotProduct1 >= 0.0 && dotProduct2 >= 0.0) {
//         return true;
//     }

//     return false;
// }