// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform mat4 uShadowMatrix0;
uniform mat4 uShadowMatrix1;
uniform mat4 uShadowMatrix2;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vShadowCoord0;
varying vec4 vShadowCoord1;
varying vec4 vShadowCoord2;

void main(void) {
	vec3 position = aVertexPosition + aPosOffset;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;

    vShadowCoord0 = uShadowMatrix0 * uModelMatrix * vec4(position, 1.0);
    vShadowCoord1 = uShadowMatrix1 * uModelMatrix * vec4(position, 1.0);
    vShadowCoord2 = uShadowMatrix2 * uModelMatrix * vec4(position, 1.0);
}