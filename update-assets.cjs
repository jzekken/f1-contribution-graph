const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'src/pacman/assets/images');
const constantsPath = path.join(__dirname, 'src/pacman/core/constants.ts');
const f1GraphicsPath = path.join(__dirname, 'src/pacman/core/f1-graphics.ts');
const svgPath = path.join(__dirname, 'src/pacman/renderers/svg.ts');

function getSvgBase64(filename) {
    const filePath = path.join(imagesDir, filename);
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    return `data:image/svg+xml;base64,${Buffer.from(content).toString('base64')}`;
}

const fiaBase64 = getSvgBase64('fia.svg');
const wdcBase64 = getSvgBase64('wdc.svg');
const tyreBase64 = getSvgBase64('tyre.svg');

if (fiaBase64 && wdcBase64) {
    let constants = fs.readFileSync(constantsPath, 'utf8');
    
    // Replace all ghost images with fia.svg
    const ghostNames = ['blinky', 'pinky', 'inky', 'clyde'];
    ghostNames.forEach(name => {
        constants = constants.replace(new RegExp(`(${name}:\\s*{[\\s\\S]*?})`, 'g'), `${name}: {
\t\tup: '${fiaBase64}',
\t\tdown: '${fiaBase64}',
\t\tleft: '${fiaBase64}',
\t\tright: '${fiaBase64}'
\t}`);
    });

    // Replace scared ghost with wdc.svg
    constants = constants.replace(/(scared:\s*{\s*imgDate:\s*')[^']+(')/g, `$1${wdcBase64}$2`);
    
    // Replace eyes with empty SVG
    const emptySvg = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>').toString('base64')}`;
    constants = constants.replace(/(eyes:\s*{[\\s\\S]*?})/, `eyes: {
\t\tup: '${emptySvg}',
\t\tdown: '${emptySvg}',
\t\tleft: '${emptySvg}',
\t\tright: '${emptySvg}'
\t}`);

    fs.writeFileSync(constantsPath, constants);
    console.log('Updated constants.ts with fia.svg and wdc.svg');
}

if (tyreBase64) {
    let f1Graphics = fs.readFileSync(f1GraphicsPath, 'utf8');
    const tyreSymbol = `export const CHECKERED_FLAG_PATTERN = \`
	<defs>
		<symbol id="checkered-flag-cell" viewBox="0 0 20 20">
			<image href="${tyreBase64}" width="20" height="20"/>
		</symbol>
	</defs>
\`;`;
    f1Graphics = f1Graphics.replace(/export const CHECKERED_FLAG_PATTERN = `[\s\S]*?`;/, tyreSymbol);
    fs.writeFileSync(f1GraphicsPath, f1Graphics);
    console.log('Updated f1-graphics.ts with tyre.svg');
}
