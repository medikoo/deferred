'use strict';

exports.end = function (handler) {
	this._base._next('end', arguments);
	return this;
};

exports.valueOf = function () {
	return this._base._resolved ? this._base._value : this;
};
