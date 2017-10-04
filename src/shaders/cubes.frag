// copy.frag

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D textureDepth0;
uniform sampler2D textureDepth1;
uniform sampler2D textureDepth2;
uniform float uBias;


varying vec4 vShadowCoord0;
varying vec4 vShadowCoord1;
varying vec4 vShadowCoord2;

const vec4 baseColor = vec4(1.0);
const float PI = 3.141592653;
const float MIN_ANGLE = PI * 0.99;


vec4 getMapColor(sampler2D texture, sampler2D textureDepth, vec4 vShadowCoord) {
	vec4 color = baseColor;

	vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
	
	vec2 uv = shadowCoord.xy;
    float d = texture2D(textureDepth, uv).r;

    float visibility = 1.0;
    if(d < shadowCoord.z - uBias) {
    	visibility = 0.0;
    }


    vec4 colorMap = texture2D(texture, uv);
    visibility *= colorMap.a;

    color.rgb = mix(baseColor.rgb, colorMap.rgb, visibility);

	return color;
}


void main(void) {
	vec4 color0 = getMapColor(texture0, textureDepth0, vShadowCoord0);
	vec4 color1 = getMapColor(texture1, textureDepth1, vShadowCoord1);
	vec4 color2 = getMapColor(texture2, textureDepth2, vShadowCoord2);

    gl_FragColor = color0 * color1 * color2;
}