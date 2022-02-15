import { measureFont } from '../../typemetry.js';

const DPR = window.devicePixelRatio || 2;

const METRICS = {
    'georgia 400 normal': {
        baseline: 0,
        ascent: 0.756,
        descent: -0.216,
        xHeight: 0.482,
        capHeight: 0.693,
        figHeight: 0.54,
        tittleHeight: 0.74,
        roundOvershoot: 0.71,
        pointedOvershoot: 0.703,
        emTop: 0.778,
        emBottom: -0.222,
        emMiddle: 0.278,
        emHeight: 1,
        bboxTop: 0.917,
        bboxBottom: -0.219,
        bboxHeight: 1.136,
        lineHeight: 1.136
    }
};

const canvas = document.getElementById('canvas');
const header = document.querySelector('.header');
const controls = document.querySelector('.controls');

const textInput = document.querySelector('#text');

const inputs = controls.querySelectorAll('input, select');
const status = controls.querySelector('#status');
const fontSizeStatus = controls.querySelector('#fontSize');
const lineHeightStatus = controls.querySelector('#lineHeight');

const copyButton = controls.querySelector('#copyButton');
const copyBanner = controls.querySelector('#copyBanner');

const lines = [];
const lineCaptions = [];

function getOptions() {
    const options = {};
    for (const input of inputs) {
        if (input.type !== 'radio' && input.type !== 'checkbox') {
            options[input.name] = input.value;
        } else {
            options[input.name] = input.checked;
        }
    }
    return options;
}

function getMetrics(options) {
    const key = `${options.fontFamily} ${options.fontWeight} ${options.fontStyle}`.toLowerCase();
    return key in METRICS ? METRICS[key] : METRICS[key] = measureFont({...options, fontSize: 1000});
}

function getContext() {
    const context = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = Math.max(0, window.innerHeight - header.offsetHeight - controls.offsetHeight);

    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';

    canvas.width *= DPR;
    canvas.height *= DPR;

    context.scale(DPR, DPR);

    return context;
}

function addLine(options) {
    lines.push({caption: options.caption, y: options.y, color: options.color});
    drawLine(options.context, options.y, options.color);
}

function drawLine(context, y, color) {
    const width = context.canvas.width / DPR;
    context.save();
    context.fillStyle = color;
    context.fillRect(0, y, width, 1);
    context.restore();
}

function round(number, decimals) {
    return +number.toFixed(decimals);
}

function render() {
    const options = getOptions();

    if (!options.fontFamily) {
        return;
    }

    const metrics = getMetrics({fontFamily: options.fontFamily, fontWeight: options.fontWeight, fontStyle: options.fontStyle});

    const context = getContext();

    const width = context.canvas.width / DPR;
    const height = context.canvas.height / DPR;

    const fontSize = Math.round(Math.min(width * 0.125, height / metrics.lineHeight * 0.5));
    const baseline = height / 2 + metrics.emMiddle * fontSize;

    context.clearRect(0, 0, width, height);

    lines.splice(0, lines.length);

    // Add baseline
    if (options.baseline) addLine({caption: 'Baseline', y: baseline, color: options.baselineColor, context});

    // Add ascent line
    if (options.ascent) addLine({caption: 'Ascent', y: baseline - metrics.ascent * fontSize, color: options.ascentColor, context});

    // Add descent line
    if (options.descent) addLine({caption: 'Descent', y: baseline - metrics.descent * fontSize, color: options.descentColor, context});

    // Add x-height line
    if (options.xHeight) addLine({caption: 'x-Height', y: baseline - metrics.xHeight * fontSize, color: options.xHeightColor, context});

    // Add capital height line
    if (options.capHeight) addLine({caption: 'Capital Height', y: baseline - metrics.capHeight * fontSize, color: options.capHeightColor, context});

    // Add figure height line
    if (options.figHeight) addLine({caption: 'Figure Height', y: baseline - metrics.figHeight * fontSize, color: options.figHeightColor, context});

    // Add tittle line
    if (options.tittleHeight) addLine({caption: 'Tittle Height', y: baseline - metrics.tittleHeight * fontSize, color: options.tittleHeightColor, context});

    // Add round overshoot line
    if (options.roundOvershoot) addLine({caption: 'Round Letters Overshoot', y: baseline - metrics.roundOvershoot * fontSize, color: options.roundOvershootColor, context});

    // Add pointed overshoot line
    if (options.pointedOvershoot) addLine({caption: 'Pointed Letters Overshoot', y: baseline - metrics.pointedOvershoot * fontSize, color: options.pointedOvershootColor, context});

    // Add top line
    if (options.emTop) addLine({caption: 'Top', y: baseline - metrics.emTop * fontSize, color: options.emTopColor, context});

    // Add middle line
    if (options.emMiddle) addLine({caption: 'Middle', y: baseline - metrics.emMiddle * fontSize, color: options.emMiddleColor, context});

    // Add bottom line
    if (options.emBottom) addLine({caption: 'Bottom', y: baseline - metrics.emBottom * fontSize, color: options.emBottomColor, context});

    // Add bbox top line
    if (options.bboxTop && metrics.bboxTop !== undefined) addLine({caption: 'BBox Top', y: baseline - metrics.bboxTop * fontSize, color: options.bboxTopColor, context});

    // Add bbox bottom line
    if (options.bboxBottom && metrics.bboxBottom !== undefined) addLine({caption: 'BBox Bottom', y: baseline - metrics.bboxBottom * fontSize, color: options.bboxBottomColor, context});

    context.font = `${options.fontStyle} ${options.fontWeight} ${fontSize}px "${options.fontFamily}"`;
    context.textAlign = 'center';

    if (metrics.bboxHeight) {
        Object.assign(textInput.style, {
            display: 'block',
            top: `${header.offsetHeight + baseline - metrics.bboxTop * fontSize}px`,
            fontFamily: `"${options.fontFamily}"`,
            fontStyle: options.fontStyle,
            fontWeight: options.fontWeight,
            fontSize: `${fontSize}px`,
            lineHeight: metrics.bboxHeight
        });
    } else {
        context.fillText(textInput.value, width / 2, baseline);
    }

    fontSizeStatus.innerHTML = `${fontSize}px`;
    lineHeightStatus.innerHTML = `${round(metrics.lineHeight * 100, 1)}%`;
    controls.querySelectorAll('.value').forEach((element) => element.innerHTML = metrics[element.getAttribute('data-of')]);
}

for (const input of inputs) {
    input.addEventListener('change', () => {
        status.innerHTML = '⏳';
        fontSizeStatus.innerHTML = '…';
        lineHeightStatus.innerHTML = '…';
        setTimeout(() => {
            render();
            status.innerHTML = '✅';
        }, 100);
    });
}

window.addEventListener('load', () => {
    render();
    status.innerHTML = '✅';
});

window.addEventListener('resize', render);

window.addEventListener('focus', render);

copyButton.addEventListener('click', () => {
    const options = getOptions();

    if (!options.fontFamily) {
        return;
    }

    const metrics = getMetrics({fontFamily: options.fontFamily, fontWeight: options.fontWeight, fontStyle: options.fontStyle});

    const text = JSON.stringify(metrics, null, 4);

    navigator.clipboard.writeText(text).then(() => {
        copyBanner.style.display = 'block';
        setTimeout(() => {
            copyBanner.style.display = 'none';
        }, 1500);
    });
});

window.addEventListener('mousemove', (event) => {
    const canvasY = event.clientY - header.offsetHeight;

    while (lineCaptions.length > 0) {
        const caption = lineCaptions.shift();
        document.body.removeChild(caption);
    }

    for (const line of lines) {
        if (Math.abs(canvasY - line.y) <= 3) {
            const caption = document.createElement('span');
            caption.className = 'caption';
            caption.innerHTML = line.caption;
            Object.assign(caption.style, {
                top: `${event.clientY}px`,
                left: `${event.clientX + 10}px`,
                backgroundColor: line.color
            });
            document.body.appendChild(caption);
            lineCaptions.push(caption);
        }
    }
});