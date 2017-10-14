// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import View4DCube from './View4DCube';
import ViewTest from './ViewTest';
import ViewBackground from './ViewBackground';
import AnimateCube from './AnimateCube';
import Assets from './Assets';

import getCubePosition from './utils/getCubePosition';
import getRandomRotation from './utils/getRandomRotation';

const numCubes = 50;
const num = 8;
const RAD = Math.PI / 180;
const FOV = 60 * RAD;
const center = vec3.fromValues(0, 0, 0);
const up = vec3.fromValues(0, 1, 0);

var random = function(min, max) { return min + Math.random() * (max - min);	}

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 10;
		this.camera.setPerspective(FOV, GL.aspectRatio, 1, 50);

		gui.add(this, 'spin');

		this.cameraProj = new alfrid.CameraPerspective();
		this.cameraProj.setPerspective(45*RAD, 1, 1, 50);

		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);

		this._shadowMatrix = mat4.create();

		this._index = 0;

		this.resize();
	}

	_initTextures() {
		const size = 1024;
		this._fbo = new alfrid.FrameBuffer(size, size, {minFilter:GL.NEAREST, magFilter:GL.NEAREST, wrapS:GL.CLAMP_TO_EDGE, wrapT:GL.CLAMP_TO_EDGE});
	}

	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vBg = new ViewBackground();
		this._vBg.position[2] = -5;
		this._vBg.scale = [2, 2, 1];

		this._vFg = new ViewBackground();
		this._vFg.position[2] = 7.5;
		this._vFg.scale = [.5, .5, 1];

		this._cubes = [];
		
		for(let i=0; i<num; i++) {
			for(let j=0; j<num; j++) {
				let x = -num/2 + i + .5;
				let y = -num/2 + j + .5;
				let pos = [x, y, 0];

				let d = 1.25;

				const cube = new AnimateCube(pos, d);
				cube.posOrg = pos;
				cube.rotation = 0;
				cube.rotationMask = 0;

				this._cubes.push(cube);
			}
		}


		this._vTest = new ViewTest();

		this._vTest.rotation = Math.random();
		this._vTest.rotationMask = Math.random();
	}


	spin() {
		this._vBg.show();
		this._vFg.hide();
		// moveTo(mPos, mPosMask, mRot, mRotMask) {
		this._cubes.forEach( cube => {
			let d = 2;
			const { position } = cube;
			const target = [position[0] + d, position[1], position[2] + random(-2, 2)];
			const targetMask = [- d, random(-d, d), random(-d, d)];
			const rotation = getRandomRotation();
			const rotationMask = getRandomRotation();

			cube.rotation = 0;
			cube.rotationMask = 0;

			cube.moveTo(target, targetMask, rotation, rotationMask);
		});


		alfrid.Scheduler.delay(()=>this._onSpinned(), null, 2000);
	}


	_onSpinned() {
		this._vBg.hide();
		this._index ++;
		this._vFg.show();

		alfrid.Scheduler.delay(()=>{
			this.reset();
		}, null, 1000);
	}


	reset() {
		this._cubes.forEach( cube => {
			let d = 2;
			const rotation = getRandomRotation(0);
			const rotationMask = getRandomRotation(0);

			cube.setTo(cube.posOrg, [0, 0, 0], rotation, rotationMask);
		});
	}


	updateProjection() {
		// console.log('Update projection :', this.camera.position);
		this.cameraProj.lookAt(this.camera.position, center, up);
		mat4.multiply(this._shadowMatrix, this.cameraProj.projection, this.cameraProj.viewMatrix);
		mat4.multiply(this._shadowMatrix, this._biasMatrix, this._shadowMatrix);
	}

	renderDepth() {
		this._fbo.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.cameraProj);
		this._renderCubes();
		this._fbo.unbind();
	}

	render() {
		
		this.updateProjection();

		this.renderDepth();

		GL.clear(1, 1, 1, 1);
		// GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);

		// this._vCube.rotation += 0.01;
		// this._vCube.rotationMask += 0.02;
		// this._vCube.render();

		if(params.render.bg) {
			this._vBg.render(this._shadowMatrix, this.nextTexture);
		}

		this._renderCubes();

		if(params.render.fg) {
			this._vFg.render(this._shadowMatrix, this.currentTexture);
		}
		

		let s = 200;
		GL.viewport(0, 0, s, s);
		this._bCopy.draw(this._fbo.getDepthTexture());
	}


	_renderCubes() {
		if(!params.render.cube) {
			return;
		}

		this._cubes.forEach(cube => {
			cube.render(this._shadowMatrix, this._fbo.getDepthTexture(), this.currentTexture);
		});	

		// this._vTest.render(this._shadowMatrix, this._fbo.getDepthTexture());
	}


	resize() {
		console.log(window.innerWidth, window.innerHeight);
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}


	get currentTexture() {
		return Assets.get(`page${this._index}`);
	}


	get nextTexture() {
		return Assets.get(`page${this._index + 1}`);
	}
}


export default SceneApp;