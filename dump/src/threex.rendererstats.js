/**
 * @author mrdoob / http://mrdoob.com/
 * @author jetienne / http://jetienne.com/
 */
/** @namespace */
var THREEx = THREEx || {}

/**
 * provide info on THREE.WebGLRenderer
 * 
 * @param {Object} renderer the renderer to update
 * @param {Object} Camera the camera to update
 */
THREEx.RendererStats = function () {
	var msMin = 100;
	var msMax = 0;

	var container = document.createElement("div");
	var msDiv = document.createElement("div");
	msDiv.style.cssText = "background-color: #000;";
	container.appendChild(msDiv);

	var msText = document.createElement("div");
	msText.style.cssText = "color: #fff; font-size: 14px; font-weight: bold; line-height: 24px; padding: 2px 4px;";
	msText.innerHTML = "WebGLRenderer";
	msDiv.appendChild(msText);

	var msTexts = [];
	var nLines = 9;
	for (var i = 0; i < nLines; i++) {
		msTexts[i] = document.createElement("div");
		msTexts[i].style.cssText = "color: #fff; background-color: #111; font-size: 14px; font-weight: bold; line-height: 24px; padding: 0 4px 2px;";
		msTexts[i].innerHTML = "-";
		msDiv.appendChild(msTexts[i]);
	}

	var lastTime = Date.now();
	return {
		domElement: container,
		update: function (webGLRenderer) {
			// Sanity check
			console.assert(webGLRenderer instanceof THREE.WebGLRenderer)

			// Refresh only 30time per second
			if (Date.now() - lastTime < 1000 / 30) return;
			lastTime = Date.now();

			var i = 0;
			msTexts[i++].textContent = "== Memory =====";
			msTexts[i++].textContent = "Programs: " + webGLRenderer.info.memory.programs;
			msTexts[i++].textContent = "Geometries: " + webGLRenderer.info.memory.geometries;
			msTexts[i++].textContent = "Textures: " + webGLRenderer.info.memory.textures;
			msTexts[i++].textContent = "== Render =====";
			msTexts[i++].textContent = "Calls: " + webGLRenderer.info.render.calls;
			msTexts[i++].textContent = "Vertices: " + webGLRenderer.info.render.vertices;
			msTexts[i++].textContent = "Faces: " + webGLRenderer.info.render.faces;
			msTexts[i++].textContent = "Points: " + webGLRenderer.info.render.points;
		}
	}
};
