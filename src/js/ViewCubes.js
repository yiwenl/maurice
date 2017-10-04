// ViewCubes.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/cubes.vert';
import fs from 'shaders/cubes.frag';

const numCubes = 50;
var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewCubes extends alfrid.View {
	
	constructor() {
		super(vs);
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


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewCubes;