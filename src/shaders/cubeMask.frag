// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;


uniform vec3 lightDir;
uniform vec3 uDimension;
varying vec3 vNormal;
varying vec3 vPosition;


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

void main(void) {
	float offset = 1.0;
	const float s = .5;
	if(vPosition.x > uDimension.x * s) {
		offset = 0.0;
	} else if(vPosition.x < -uDimension.x * s) {
		offset = 0.0;
	}

	if(vPosition.y > uDimension.y * s) {
		offset = 0.0;
	} else if(vPosition.y < -uDimension.y * s) {
		offset = 0.0;
	}

	if(vPosition.z > uDimension.z * s) {
		offset = 0.0;
	} else if(vPosition.z < -uDimension.z * s) {
		offset = 0.0;
	}

	if(offset <= 0.0) {
		discard;
	}

	float _diffuse = diffuse(vNormal, lightDir);
    gl_FragColor = vec4(vec3(_diffuse), 1.0);

    gl_FragColor = vec4(vec3(offset), 1.0);
}