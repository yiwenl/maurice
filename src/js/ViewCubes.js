// ViewCubes.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/cubes.vert';
import fs from 'shaders/cubes.frag';
import Assets from './Assets';

const numCubes = 50;
var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewCubes extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const s = 1;
		this.mesh = alfrid.Geom.cube(s, s, s);
		const posOffset = [];

		function getPos() {
			const r = 3;
			return [
				random(-r, r),
				random(-r, r),
				random(-r, r)
			]
		}

		for(let i=0; i<numCubes; i++) {
			posOffset.push(getPos());
		}

		this.mesh.bufferInstance(posOffset, 'aPosOffset');
	}


	render(mShadowMatrices, mDepthTextures) {
		this.shader.bind();
		this.shader.uniform("uBias", "float", params.bias);

		this.shader.uniform("texture0", "uniform1i", 0);
		Assets.get('page0').bind(0);
		this.shader.uniform("texture1", "uniform1i", 1);
		Assets.get('page1').bind(1);
		this.shader.uniform("texture2", "uniform1i", 2);
		Assets.get('page2').bind(2);

		for(let i=0; i<3; i++) {
			this.shader.uniform(`uShadowMatrix${i}`, "mat4", mShadowMatrices[i]);

			this.shader.uniform(`textureDepth${i}`, "uniform1i", i+3);
			mDepthTextures[i].bind(i+3);
		}
		GL.draw(this.mesh);
	}


}

export default ViewCubes;