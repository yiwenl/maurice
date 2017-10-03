precision highp float;

uniform vec3 lightDir;
uniform vec3 uDimension;
uniform vec3 uDimensionMask;
uniform mat4 uInvertRotationMatrix;

uniform sampler2D texture;
uniform sampler2D textureDepth;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vPositionRotated;

varying vec4 vShadowCoord;

const float bias = -0.001;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}


float pointDistToPlane(vec3 v, vec4 plane) {
	vec3 n = normalize(plane.xyz);
	return v.x * n.x + v.y * n.y + v.z * n.z;
}


void main(void) {
	float offset = 1.0;
	if(vPosition.x > uDimension.x * 0.5) {
		offset = 0.0;
	} else if(vPosition.x < -uDimension.x * 0.5) {
		offset = 0.0;
	}

	if(vPosition.y > uDimension.y * 0.5) {
		offset = 0.0;
	} else if(vPosition.y < -uDimension.y * 0.5) {
		offset = 0.0;
	}

	if(vPosition.z > uDimension.z * 0.5) {
		offset = 0.0;
	} else if(vPosition.z < -uDimension.z * 0.5) {
		offset = 0.0;
	}

	vec4 adjustedPos = uInvertRotationMatrix * vec4(vPositionRotated, 1.0);
	if(adjustedPos.x > uDimensionMask.x) {
		offset = 0.0;
	} else if(adjustedPos.x < -uDimensionMask.x) {
		offset = 0.0;
	}

	if(adjustedPos.y > uDimensionMask.y) {
		offset = 0.0;
	} else if(adjustedPos.y < -uDimensionMask.y) {
		offset = 0.0;
	}

	if(adjustedPos.z > uDimensionMask.z) {
		offset = 0.0;
	} else if(adjustedPos.z < -uDimensionMask.z) {
		offset = 0.0;
	}


	if(offset < 1.0) {
		discard;
	}

	float _diffuse   = diffuse(vNormal, lightDir);
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