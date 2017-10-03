// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import View4DCube from './View4DCube';
import AnimateCube from './AnimateCube';
import Assets from './Assets';

import getCubePosition from './utils/getCubePosition';

const numCubes = 75;
const FOV = Math.PI / 3;
const center = vec3.fromValues(0, 0, 0);
const up = vec3.fromValues(0, 1, 0);

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 10;
		this.camera.setPerspective(FOV, GL.aspectRatio, 1, 50);

		gui.add(this, 'spin');

		this.pointSource = vec3.fromValues(0, 0, 10);
		this.cameraProj = new alfrid.CameraPerspective();
		this.cameraProj.setPerspective(FOV, GL.aspectRatio, 1, 50);

		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);

		this._shadowMatrix = mat4.create();

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

		// this._vModel = new ViewObjModel();

		this._cubes = [];

		for(let i=0; i<numCubes; i++) {
			let pos = getCubePosition(this._cubes, 2.5, .2);
			let d = 1.25;
			if(Math.random() > .4)  {
				d = 0.5;
			}
			const cube = new AnimateCube(pos, d);
			
			cube.randomTo();
			cube.rotation = Math.random() * Math.PI * 2;	
			cube.rotationMask = Math.random() * Math.PI * 2;

			this._cubes.push(cube);
		}
	}


	spin() {
		this._cubes.forEach( cube => {
			cube.randomTo();
		});
	}


	updateProjection() {
		this.cameraProj.lookAt(this.pointSource, center, up);
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

		// this.orbitalControl.ry.value += 0.01;
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);
		// this._bSky.draw(Assets.get('studio_radiance'));
		// this._bSky.draw(Assets.get('irr'));

		this._bAxis.draw();
		this._bDots.draw();

		// this._vModel.render(Assets.get('studio_radiance'), Assets.get('irr'), Assets.get('aomap'));

		// this._vCube.rotation += 0.01;
		// this._vCube.rotationMask += 0.02;
		// this._vCube.render();

		let s = .1;
		this._bBall.draw(this.pointSource, [s, s, s])

		this._renderCubes();


		s = 200;
		GL.viewport(0, 0, s, s);
		this._bCopy.draw(this._fbo.getDepthTexture());
	}


	_renderCubes() {
		this._cubes.forEach(cube => {
			cube.render(this._shadowMatrix, this._fbo.getDepthTexture());
		});	
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;