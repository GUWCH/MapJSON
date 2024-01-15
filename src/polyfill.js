if (!window.requestAnimationFrame) (function() {
	'use strict';

	function requestAnimationFrame(callback) {
		var
		currentTime = now(),
		delay = Math.max(0, 16 - (currentTime - lastTime));

		lastTime = currentTime;

		return setTimeout(function () {
			lastTime = now();

			callback(lastTime - startTime);
		}, delay);
	}

	function cancelAnimationFrame(id) {
		clearTimeout(id);
	}

	var
	raf = 'RequestAnimationFrame',
	caf = 'CancelAnimationFrame',
	webkit = 'webkit',
	moz = 'moz',
	now = Date.now || function () {
		return new Date().getTime();
	},
	startTime = now(),
	lastTime = startTime;

	window.requestAnimationFrame = window[moz + raf] || window[webkit + raf] || requestAnimationFrame;
	window.cancelAnimationFrame = window[moz + caf] || window[webkit + caf] || window[webkit + 'CancelRequestAnimationFrame'] || cancelAnimationFrame;
})();