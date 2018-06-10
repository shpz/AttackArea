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

	if (abs(mold) > maxRadius || abs(mold) < minRadius || angle > sectorAngle) {
        discard;
    }
    else {
        fragColor = vec4(areaColor.rgb, (mold - minRadius) / (1.0 - minRadius) * saturation);
    }
}

bool checkRay (vec4 ray) {
    vec4 segment = vec4(0.0, 0.2, 0.4, 0.2);
    vec2 ray_start = vec2(ray.x, ray.y);
    vec2 ray_end = vec2(ray.z, ray.w);
    vec2 ray_delta = vec2(ray_end.x - ray_start.x, ray_end.y - ray_start.y);

    vec2 segment_start = vec2(segment.x, segment.y);
    vec2 segment_end = vec2(segment.z, segment.w);
    vec2 segment_delta = vec2(segment_end.x - segment_start.x, segment_end.y - segment_start.y);

    float ray_mold = sqrt(ray_delta.x * ray_delta.x + ray_delta.y * ray_delta.y);
    float segment_mold = sqrt(segment_delta.x * segment_delta.x + segment_delta.y * segment_delta.y);
    
    if (((ray_delta.x / ray_mold) == (segment_delta.x / segment_mold)) && ((ray_delta.y / ray_mold) == (segment_delta.y / segment_mold))) {
        return false;
    }

    // var T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx);
	// var T1 = (s_px+s_dx*T2-r_px)/r_dx;

	// if(T1<0) return null;
	// if(T2<0 || T2>1) return null;

	// Return the POINT OF INTERSECTION
	// return {
	// 	x: r_px+r_dx*T1,
	// 	y: r_py+r_dy*T1,
	// 	param: T1
	// };

    float T2 = (ray_delta.x * (segment_start.y - ray_start.y) + ray_delta.y * (ray_start.x - segment_start.x)) / (segment_delta.x * ray_delta.y - segment_delta.y * ray_delta.x);
    float T1 = (segment_start.x + segment_delta.x * T2 - ray_start.x) / ray_delta.x;

    // if ((step(T1, 0.0) * step(T2, 0.0) * step(1.0 - T2, 0.0)) < 1.0) {
    //     return false;
    // }

    if (T1 < 0.0) {
        return false;
    }

    if (T2 < 0.0 || T2 > 1.0) {
        return false;
    }

    return true;
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