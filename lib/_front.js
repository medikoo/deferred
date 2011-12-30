'use strict';

exports.end = function (handler) {
	this._base.next('end', arguments);
	return this;
};

exports.valueOf = function () {
	return this._base.resolved ? this._base.value : this;
};
