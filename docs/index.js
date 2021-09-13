"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        Array.from(document.querySelectorAll('code')).forEach(code => {
            code.innerText = code.innerHTML.replace(/^\n/g, '').replace(/n$/g, '').replace(/\/>\s+\n\s+</g, '');
        });
        yield Promise.all(Array.from(document.querySelectorAll('img.svg')).map(elm => importSVG(elm)));
        makeDraggable(document.querySelector('.luxury-model'));
        console.log('ready');
    });
}
window.addEventListener('load', init);
function importSVG(imgElm) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(imgElm.src);
            const data = yield response.text();
            const svgElm = (new DOMParser()).parseFromString(data, 'image/svg+xml').firstChild;
            svgElm.classList.add(...imgElm.classList);
            (_a = imgElm === null || imgElm === void 0 ? void 0 : imgElm.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(svgElm, imgElm);
            return svgElm;
        }
        catch (err) {
            console.log('no,sorry', err);
        }
        return null;
    });
}
function minimizeDialog() {
    const rabbitDialog = document.getElementById('rabbitDialog');
    const options = [{ x: 5, y: 0 }, { x: -20, y: 0 }, { x: -45, y: -0 }, { x: -20, y: -15, }, { x: -45, y: -15, }];
    if (rabbitDialog) {
        if (rabbitDialog.getAttribute('minimized') === 'true') {
            gsap.to('#rabbitDialog', { duration: 1, scaleX: 1, scaleY: 1, x: -40, y: -40, opacity: 1 });
            rabbitDialog.removeAttribute('minimized');
        }
        else {
            gsap.to('#rabbitDialog', Object.assign(Object.assign({ duration: 1, scaleX: 0.1, scaleY: 0.2 }, options[Math.floor(Math.random() * options.length)]), { opacity: 0 }));
            rabbitDialog.setAttribute('minimized', 'true');
        }
    }
}
function makeDraggable(svg) {
    let selectedElement = null, textElm, offset = { x: 0, y: 0 };
    const triangle = svg.querySelector('.triangle');
    svg.addEventListener('mousedown', startDrag);
    svg.addEventListener('mousemove', drag);
    svg.addEventListener('mouseup', endDrag);
    svg.addEventListener('mouseleave', endDrag);
    function startDrag(evt) {
        evt.preventDefault();
        if (evt.target.classList.contains('draggable')) {
            selectedElement = evt.target;
            selectedElement.setAttribute('dragged', 'true');
            offset = getMousePosition(evt);
            offset.x -= parseFloat(selectedElement.getAttributeNS(null, "cx") || '0');
            offset.y -= parseFloat(selectedElement.getAttributeNS(null, "cy") || '0');
            textElm = document.getElementById(selectedElement.getAttribute('aria-labelledby') || '');
            triangle === null || triangle === void 0 ? void 0 : triangle.setAttribute('points', getPoints());
        }
    }
    function getPoints() {
        const circles = document.querySelectorAll('.circles circle');
        const agg = [];
        circles.forEach(circle => agg.push(`${getValue(circle.cx)},${getValue(circle.cy)}`));
        return agg.join(' ');
    }
    function getValue(svgAnimatedLength) {
        return svgAnimatedLength.baseVal.value;
    }
    function drag(evt) {
        if (selectedElement) {
            evt.preventDefault();
            const coord = getMousePosition(evt);
            selectedElement.setAttributeNS(null, "cx", `${coord.x}`);
            selectedElement.setAttributeNS(null, "cy", `${coord.y}`);
            if (textElm) {
                textElm.setAttributeNS(null, "x", `${coord.x}`);
                textElm.setAttributeNS(null, "y", `${coord.y}`);
            }
            triangle === null || triangle === void 0 ? void 0 : triangle.setAttribute('points', getPoints());
        }
    }
    function getMousePosition(evt) {
        const CTM = svg === null || svg === void 0 ? void 0 : svg.getScreenCTM();
        return {
            x: ((evt.clientX - CTM.e) / CTM.a) - offset.x,
            y: ((evt.clientY - CTM.f) / CTM.d) - offset.y
        };
    }
    function endDrag(evt) {
        selectedElement === null || selectedElement === void 0 ? void 0 : selectedElement.removeAttribute('dragged');
        selectedElement = null;
    }
}
function drawAnimation(svgId) {
    var _a;
    (_a = document.getElementById(svgId)) === null || _a === void 0 ? void 0 : _a.removeAttribute('hidden');
    new Vivus(svgId, { duration: 200, type: 'oneByOne' }, () => { });
}
