// View4DCube.js

import alfrid, { GL, GLShader, EaseNumber } from 'alfrid';
import Assets from './Assets';


import vsCube from 'shaders/cube.vert';
import fsCube from 'shaders/cube.frag';

import vsPlane from 'shaders/plane.vert';
import fsPlane from 'shaders/plane.frag';

import vsCubeMask from 'shaders/cubeMask.vert';
import fsCubeMask from 'shaders/cubeMask.frag';

import getRandomAxis from './utils/getRandomAxis';

var random = function(min, max) { return min + Math.random() * (max - min);	}


class View4DCube extends alfrid.View {
	
	constructor(mPosition=[0, 0, 0]) {
		super(vsCube, fsCube);

		this._ease = random( 0.02, 0.05 ) * 0.5;
		this._shaderPlane = new GLShader(vsPlane, fsPlane);
		this._shaderMask = new GLShader(vsCubeMask, fsCubeMask);

		this._isDirty = true;
		this._scale = new EaseNumber(1, this._ease);
		this._mtxScale = mat4.create();

		this.dimension = vec3.fromValues(1, 1, 1);
		this._rotation = 0;
		this._rotationAxis = getRandomAxis();
		this._position = vec3.clone(mPosition);

		
		this._rotationMask = 0;
		this._rotationAxisMask = getRandomAxis();
		this._positionMask = vec3.create();

		this._modelMatrix = mat4.create();
		this._mtxRotation = mat4.create();
		this._mtxRotationMask = mat4.create();
		this._mtxRotationMaskInvert = mat4.create();

		this._dx = new EaseNumber(.5, this._ease);
		this._dy = new EaseNumber(.5, this._ease);
		this._dz = new EaseNumber(.5, this._ease);

		this._boundRight = vec4.fromValues(1, 0, 0., this._dx.value);
		this._boundLeft = vec4.fromValues(-1, 0, 0., this._dx.value);
		this._boundUp = vec4.fromValues(0.001, 1, 0, this._dy.value);
		this._boundBottom = vec4.fromValues(0.001, -1, 0, this._dy.value);
		this._boundFront = vec4.fromValues(0, 0, 1, this._dz.value);
		this._boundBack = vec4.fromValues(0, 0, -1, this._dz.value);

		this.dimensionMask = vec3.fromValues(this.dx, this.dy, this.dz);

		this._bounds = [
			this._boundUp,
			this._boundBottom,
			this._boundRight,
			this._boundLeft,
			this._boundFront,
			this._boundBack
		];

	}


	_init() {
		this.mesh = alfrid.Geom.cube(1, 1, 1);
		const s = 2;
		this.plane = alfrid.Geom.plane(s, s, 1);
	}


	render(mShadowMatrix, mDepthTexture) {
		this.update();

		const bounds = this._bounds.map( bound => {
			const boundTransformed = vec4.create();
			vec4.transformMat4(boundTransformed, bound, this._mtxRotationMask);

			return boundTransformed;
		});


		this.shader.bind();
		this.shader.uniform("uPositionMask", "vec3", this._positionMask);
		this.shader.uniform(params.light);
		this.shader.uniform("uShadowMatrix", "mat4", mShadowMatrix);
		this.shader.uniform("textureDepth", "uniform1i", 0);
		mDepthTexture.bind(0);
		this.shader.uniform("texture", "uniform1i", 0);
		Assets.get('page1').bind(0);
		bounds.forEach( (bound, i) => {
			this.shader.uniform(`uPlane${i}`, "vec4", bound);
		});
		GL.rotate(this._modelMatrix);
		GL.draw(this.mesh);


		this._shaderMask.bind();
		this._shaderMask.uniform(params.light);
		this._shaderMask.uniform("uRotationMask", "mat4", this._mtxRotationMask);
		this._shaderMask.uniform("uInvertRotationMatrix", "mat4", this._mtxRotationMaskInvert);
		this._shaderMask.uniform("uDimension", "vec3", this.dimension);
		this._shaderMask.uniform("uDimensionMask", "vec3", this.dimensionMask);

		this._shaderMask.uniform("uShadowMatrix", "mat4", mShadowMatrix);
		this._shaderMask.uniform("textureDepth", "uniform1i", 0);
		mDepthTexture.bind(0);
		this._shaderMask.uniform("texture", "uniform1i", 0);
		Assets.get('page1').bind(0);
		
		GL.draw(this.mesh);
	}


	update() {
		if(this._isDirty) {
			this._updateRotationMatrices();
			this._isDirty = false;
		}

		const scale = this._scale.value;
		mat4.fromScaling(this._mtxScale, vec3.fromValues(scale, scale, scale));

		mat4.fromTranslation(this._modelMatrix, this._position);
		mat4.multiply(this._modelMatrix, this._modelMatrix, this._mtxScale);
		mat4.multiply(this._modelMatrix, this._modelMatrix, this._mtxRotation);

		this._boundRight[3] = this._dx.value;
		this._boundLeft[3] = this._dx.value;
		this._boundUp[3] = this._dy.value;
		this._boundBottom[3] = this._dy.value;
		this._boundFront[3] = this._dz.value;
		this._boundBack[3] = this._dz.value;

		this.dimensionMask = vec3.fromValues(this.dx, this.dy, this.dz);
	}


	_updateRotationMatrices() {
		let q = quat.create();

		quat.setAxisAngle(q, this._rotationAxis, this._rotation);
		mat4.fromQuat(this._mtxRotation, q);

		quat.setAxisAngle(q, this._rotationAxisMask, this._rotationMask);
		mat4.fromQuat(this._mtxRotationMask, q);
		mat4.invert(this._mtxRotationMaskInvert, this._mtxRotationMask);
	}



	get rotation() {
		return this._rotation;
	}

	set rotation(mValue) {
		this._rotation = mValue;
		this._isDirty = true;
	}

	get scale() {
		return this._scale.value;
	}

	set scale(mValue) {
		this._scale.value = mValue;
	}


	get rotationMask() {
		return this._rotationMask;
	}

	set rotationMask(mValue) {
		this._rotationMask = mValue;
		this._isDirty = true;
	}

	get position() {
		return this._position;
	}

	set position(mValue) {
		vec3.copy(this._position, mValue);
	}


	get dx() { return this._dx.value; }
	set dx(value) { this._dx.value = value; }

	get dy() { return this._dy.value; }
	set dy(value) { this._dy.value = value; }

	get dz() { return this._dz.value; }
	set dz(value) { this._dz.value = value; }
}

export default View4DCube;