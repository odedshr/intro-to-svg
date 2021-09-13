declare namespace gsap {
  function timeline(): Object
  function to(query: String, details: Object): Object
}

async function init() {
  Array.from(document.querySelectorAll('code')).forEach(code => {
    code.innerText = code.innerHTML.replace(/^\n/g, '').replace(/n$/g, '').replace(/\/>\s+\n\s+</g, '');
  }); //console.log(.replace(/</g, '&lt;'))

  await Promise.all(Array.from(document.querySelectorAll('img.svg')).map(elm => importSVG(elm as HTMLImageElement)));
  makeDraggable(document.querySelector('.luxury-model') as SVGElement);

  console.log('ready');
}

window.addEventListener('load', init);

async function importSVG(imgElm: HTMLImageElement): Promise<SVGElement | null> {
  try {
    const response = await fetch(imgElm.src);
    const data = await response.text();
    const svgElm: SVGElement = (new DOMParser()).parseFromString(data, 'image/svg+xml').firstChild as SVGElement;

    svgElm.classList.add(...imgElm.classList);
    imgElm?.parentNode?.replaceChild(svgElm, imgElm);

    return svgElm
  }
  catch (err) {
    console.log('no,sorry', err);
  }
  return null;
}

function minimizeDialog() {
  const rabbitDialog: HTMLElement | null = document.getElementById('rabbitDialog');
  const options = [{ x: 5, y: 0 }, { x: -20, y: 0 }, { x: -45, y: -0 }, { x: -20, y: -15, }, { x: -45, y: -15, }];

  if (rabbitDialog) {
    if (rabbitDialog.getAttribute('minimized') === 'true') {
      gsap.to('#rabbitDialog', { duration: 1, scaleX: 1, scaleY: 1, x: -40, y: -40, opacity: 1 });
      rabbitDialog.removeAttribute('minimized');
    } else {
      gsap.to('#rabbitDialog', { duration: 1, scaleX: 0.1, scaleY: 0.2, ...options[Math.floor(Math.random() * options.length)], opacity: 0 });
      rabbitDialog.setAttribute('minimized', 'true');
    }
  }

}

function makeDraggable(svg: SVGElement) {
  let selectedElement: SVGCircleElement | null = null,
    textElm: SVGTextElement | null,
    offset = { x: 0, y: 0 };
  const triangle = svg.querySelector('.triangle');

  svg.addEventListener('mousedown', startDrag);
  svg.addEventListener('mousemove', drag);
  svg.addEventListener('mouseup', endDrag);
  svg.addEventListener('mouseleave', endDrag);

  function startDrag(evt: MouseEvent) {
    evt.preventDefault();
    if ((evt.target as HTMLElement).classList.contains('draggable')) {
      selectedElement = evt.target as SVGCircleElement;
      selectedElement.setAttribute('dragged', 'true');
      offset = getMousePosition(evt);
      offset.x -= parseFloat(selectedElement.getAttributeNS(null, "cx") || '0');
      offset.y -= parseFloat(selectedElement.getAttributeNS(null, "cy") || '0');
      textElm = document.getElementById(selectedElement.getAttribute('aria-labelledby') || '') as unknown as SVGTextElement;
      triangle?.setAttribute('points', getPoints());
    }
  }

  function getPoints() {
    const circles = document.querySelectorAll('.circles circle');
    const agg: string[] = [];
    circles.forEach(circle => agg.push(`${getValue((circle as SVGCircleElement).cx)},${getValue((circle as SVGCircleElement).cy)}`));

    return agg.join(' ');
  }

  function getValue(svgAnimatedLength: SVGAnimatedLength) {
    return svgAnimatedLength.baseVal.value;
  }

  function drag(evt: MouseEvent) {
    if (selectedElement) {
      evt.preventDefault();
      const coord = getMousePosition(evt);
      selectedElement.setAttributeNS(null, "cx", `${coord.x}`);
      selectedElement.setAttributeNS(null, "cy", `${coord.y}`);

      if (textElm) {
        textElm.setAttributeNS(null, "x", `${coord.x}`);
        textElm.setAttributeNS(null, "y", `${coord.y}`);
      }

      triangle?.setAttribute('points', getPoints());
    }
  }

  function getMousePosition(evt: MouseEvent) {
    //@ts-ignore
    const CTM = svg?.getScreenCTM();
    return {
      x: ((evt.clientX - CTM.e) / CTM.a) - offset.x,
      y: ((evt.clientY - CTM.f) / CTM.d) - offset.y
    };
  }

  function endDrag(evt: MouseEvent) {
    selectedElement?.removeAttribute('dragged');
    selectedElement = null;
  }
}

function drawAnimation(svgId: string) {
  document.getElementById(svgId)?.removeAttribute('hidden');
  //@ts-ignore
  new Vivus(svgId, { duration: 200, type: 'oneByOne' }, () => { });
}