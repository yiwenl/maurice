// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uRotationMask;
uniform mat4 uInvertRotationMatrix;
uniform vec3 uDimensionMask;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;

void main(void) {
	vec4 position = uRotationMask * vec4(aVertexPosition * uDimensionMask * 2.0, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * position;
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
    vPosition = position.xyz;
}