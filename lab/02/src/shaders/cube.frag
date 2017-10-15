// copy.frag
precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;

uniform vec4 uPlane0;
uniform vec4 uPlane1;
uniform vec4 uPlane2;
uniform vec4 uPlane3;
uniform vec4 uPlane4;
uniform vec4 uPlane5;

uniform sampler2D texture;
uniform sampler2D textureDepth;

uniform vec3 uPositionMask;
uniform vec3 lightDir;

varying vec4 vShadowCoord;

float pointDistToPlane(vec3 v, vec4 plane) {
	vec3 n = normalize(plane.xyz);

	float d = v.x * n.x + v.y * n.y + v.z * n.z;

	return d;
}

float isInDistance(vec3 v, vec4 plane) {
	float d = pointDistToPlane(v, plane);
	return step(d, plane.w);
}


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

void main(void) {
	// float dist = pointDistToPlane(vPosition, uPlane0);

	// if(dist > uPlane0.w) {
	// 	discard;
	// }

	float d0 = isInDistance(vPosition - uPositionMask, uPlane0);
	float d1 = isInDistance(vPosition - uPositionMask, uPlane1);
	float d2 = isInDistance(vPosition - uPositionMask, uPlane2);
	float d3 = isInDistance(vPosition - uPositionMask, uPlane3);
	float d4 = isInDistance(vPosition - uPositionMask, uPlane4);
	float d5 = isInDistance(vPosition - uPositionMask, uPlane5);

	float t = d0 * d1 * d2 * d3 * d4 * d5;

	if(t <= 0.0) {
		discard;
	}

	float _diffuse = diffuse(vNormal, lightDir);
	_diffuse = mix(_diffuse, 1.0, .5);


	vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
	vec2 uv = shadowCoord.xy;
	float d = texture2D(textureDepth, uv).r;

	const float uBias = 0.001;
	float visibility = 0.0;
	if(d < shadowCoord.z - uBias) {
		visibility = 1.0;
	}

	vec3 color = vec3(1.0);
	vec3 colorMap = texture2D(texture, uv).rgb;
	color = mix(color, colorMap, visibility);

	gl_FragColor = vec4(color * _diffuse, 1.0);
}