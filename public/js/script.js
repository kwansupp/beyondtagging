console.log("script.js loaded");

// preload
(function (app, $, undefined) {

    $(document).ready(function () {
        console.log('document ready');
        $("#canvas").on("mousemove", app.onCanvasMouseMove);
        $("#btnClear").on("click", app.onButtonClearClick);
        $("#btnRestore").on("click", app.onButtonRestoreClick);
        app.canvas = document.getElementById("canvas");
        // add image to canvas
        // load background image
        const ctx = app.canvas.getContext('2d');
		const img = new Image();
		img.src = '/img/plane-glacier.jpg';
	    img.onload = function() {
	    	app.canvas.width = this.naturalWidth;
	  		app.canvas.height = this.naturalHeight;
	        ctx.drawImage(this, 0, 0);
	    };
    });

    app.model = {
        point: {
            x: 0,
            y: 0
        }
    };

    app.buffer = [];

    app.onCanvasMouseMove = function (e) {
        if (e.which === 1) {
            var rect = app.canvas.getBoundingClientRect(),
                pt = Object.create(app.model.point);
            pt.x = e.clientX - rect.left;
            pt.y = e.clientY - rect.top;
            app.buffer.push(pt);
            app.drawRect(pt);
        }
    };

    app.onButtonClearClick = function (ctrl) {
        app.clearCanvas();
        app.buffer = [];
    };

    app.onButtonRestoreClick = function (ctrl) {
        var i = 0,
            pt = null,
            delay = 1000;

        app.clearCanvas();
        if (app.buffer.length > 0) {
            for (i; i < app.buffer.length; i++) {
                pt = app.buffer[i];
                app.drawRect(pt, delay);
                delay = delay + 50;
            }
        }
    };

    app.drawRect = function (pt, delay) {
        var ctx = app.canvas.getContext("2d");
        if (delay) {
            setTimeout('app.canvas.getContext("2d").fillRect(' + pt.x + ',' + pt.y + ', 8, 6);', delay);
        } else {
            ctx.fillRect(pt.x, pt.y, 8, 6);
        }

    };

    app.clearCanvas = function () {
        var c = app.canvas,
            ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
    };

})(window.app = window.app || {}, jQuery)