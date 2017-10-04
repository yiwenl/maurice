// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import ViewCubes from './ViewCubes';
import Assets from './Assets';

const RAD = Math.PI / 180;
const FOV = 60 * RAD;
const radius = 10;

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = radius;
		this.camera.setPerspective(FOV, GL.aspectRatio, 1, 50);

		this._cameraCurr = new alfrid.CameraPerspective();
		this._cameraCurr.setPerspective(FOV, GL.aspectRatio, 1, 50);
		this._camControlCurr = new alfrid.OrbitalControl(this._cameraCurr, window, radius);
		this._camControlCurr.lock(true);

		this._cameraNext = new alfrid.CameraPerspective();
		this._cameraNext.setPerspective(FOV, GL.aspectRatio, 1, 50);
		this._camControlNext = new alfrid.OrbitalControl(this._cameraNext, window, radius);
		this._camControlNext.lock(true);

		this._cameraPre = new alfrid.CameraPerspective();
		this._cameraPre.setPerspective(FOV, GL.aspectRatio, 1, 50);
		this._camControlPre = new alfrid.OrbitalControl(this._cameraPre, window, radius);
		this._camControlPre.lock(true);


		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);


		this._mtxProjCurr = mat4.create();
		this._mtxProjNext = mat4.create();
		this._mtxProjPre = mat4.create();

		this._projMatrices = [this._mtxProjPre, this._mtxProjCurr, this._mtxProjNext];
		this._projCameras = [this._cameraPre, this._cameraCurr, this._cameraNext];

		this._renderShadowMap();

		gui.add(this, 'next');
		gui.add(this, 'pre');
	}

	_initTextures() {
		console.log('init textures');
		this._textureDepths = [];
		for(let i=0; i<3; i++) {
			const fboDepth = new alfrid.FrameBuffer(1024, 1024, {minFilter:GL.NEAREST, magFilter:GL.NEAREST, wrapS:GL.CLAMP_TO_EDGE, wrapT:GL.CLAMP_TO_EDGE});
			this._textureDepths.push(fboDepth);
		}

		this._textures = this._textureDepths.map(fbo=>{
			return fbo.getDepthTexture();
		});
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();

		this._bBall = new alfrid.BatchBall();

		this._vCubes = new ViewCubes();

	}


	_updateMatrix() {

	}

	next() {
		this._renderShadowMap();
	}


	pre() {
		this._renderShadowMap();
	}


	render() {
		GL.clear(0, 0, 0, 0);
		

		this._bAxis.draw();
		this._bDots.draw();

		let s = .1;
		this._bBall.draw(this._cameraNext.position, [s, s, s], [1, .5, .5]);
		this._bBall.draw(this._cameraCurr.position, [s, s, s], [1, 1, 1]);
		this._bBall.draw(this._cameraPre.position, [s, s, s], [.5, 1, .5]);

		this._vCubes.render(this._projMatrices, this._textures);


		s = 256;
		this._textures.forEach((t, i) => {
			GL.viewport(i * s, 0, s, s);
			this._bCopy.draw(t);
		})
	}


	_renderShadowMap() {
		this._camControlCurr.ry.setTo(this.orbitalControl.ry.value);
		this._camControlPre.ry.setTo(this._camControlCurr.ry.value + Math.PI/2);
		this._camControlNext.ry.setTo(this._camControlCurr.ry.value - Math.PI/2);

		this._camControlCurr.radius.setTo(this.orbitalControl.radius.value);
		this._camControlPre.radius.setTo(this.orbitalControl.radius.value);
		this._camControlNext.radius.setTo(this.orbitalControl.radius.value);

		this._camControlCurr._loop();
		this._camControlPre._loop();
		this._camControlNext._loop();

		const cameras = ['Pre', 'Curr', 'Next'];

		cameras.forEach( (name, i) => {
			// let mtx = this._mtxProjPre
			let mtx = this[`_mtxProj${name}`];
			let camera = this[`_camera${name}`];

			mat4.multiply(mtx, camera.projection, camera.viewMatrix);
			mat4.multiply(mtx, this._biasMatrix, mtx);

			let fbo = this._textureDepths[i];
			fbo.bind();
			GL.clear(1, 0, 0, 1);
			GL.setMatrices(camera);
			this._vCubes.render(this._projMatrices, this._textures);
			fbo.unbind();
		});

		this._textures = this._textureDepths.map(fbo=>{
			return fbo.getDepthTexture();
		});
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;