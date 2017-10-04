// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import ViewCubes from './ViewCubes';
import Assets from './Assets';

const RAD = Math.PI / 180;
const FOV = 60 * RAD;

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;
		this.camera.setPerspective(FOV, GL.aspectRatio, .1, 50);

		this._cameraCurr = new alfrid.CameraPerspective();
		this._camControlCurr = new alfrid.OrbitalControl(this._cameraCurr, window, 5);
		this._camControlCurr.lock(true);

		this._cameraNext = new alfrid.CameraPerspective();
		this._camControlNext = new alfrid.OrbitalControl(this._cameraNext, window, 5);
		this._camControlNext.lock(true);

		this._cameraPre = new alfrid.CameraPerspective();
		this._camControlPre = new alfrid.OrbitalControl(this._cameraPre, window, 5);
		this._camControlPre.lock(true);


		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);


		this._mtxProjCurr = mat4.create();
		this._mtxProjNext = mat4.create();


	}

	_initTextures() {
		console.log('init textures');
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

	}


	pre() {

	}


	render() {
		GL.clear(0, 0, 0, 0);
		this._camControlPre.ry.setTo(this.orbitalControl.ry.value + Math.PI/2);
		this._camControlNext.ry.setTo(this.orbitalControl.ry.value - Math.PI/2);

		this._bAxis.draw();
		this._bDots.draw();

		let s = .1;
		this._bBall.draw(this._cameraNext.position, [s, s, s], [1, .5, .5]);
		this._bBall.draw(this._cameraPre.position, [s, s, s], [.5, 1, .5]);

		this._vCubes.render();
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;