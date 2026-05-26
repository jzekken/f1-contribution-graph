const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'src/pacman/assets/images');
const f1GraphicsPath = path.join(__dirname, 'src/pacman/core/f1-graphics.ts');

const upSvg = fs.readFileSync(path.join(imgDir, 'rb-up.svg'), 'utf8');
const downSvg = fs.readFileSync(path.join(imgDir, 'rb-down.svg'), 'utf8');
const leftSvg = fs.readFileSync(path.join(imgDir, 'rb-left.svg'), 'utf8');
const rightSvg = fs.readFileSync(path.join(imgDir, 'rb-right.svg'), 'utf8');

const b64 = (str) => 'data:image/svg+xml;base64,' + Buffer.from(str).toString('base64');

const fileContent = `/* ───────────── F1 Car Images (Base64 Encoded) ───────────── */
// Custom F1 car SVG images for each direction
export const F1_CAR_IMAGES = {
	up: '${b64(upSvg)}',
	down: '${b64(downSvg)}',
	left: '${b64(leftSvg)}',
	right: '${b64(rightSvg)}'
};

/* ───────────── Checkered Flag SVG Pattern ───────────── */
// SVG pattern for checkered flag (like GitHub contribution grid but with F1 theme)
export const CHECKERED_FLAG_PATTERN = \`
	<defs>
		<pattern id="checkered-flag" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
			<rect x="0" y="0" width="5" height="5" fill="white"/>
			<rect x="5" y="0" width="5" height="5" fill="black"/>
			<rect x="0" y="5" width="5" height="5" fill="black"/>
			<rect x="5" y="5" width="5" height="5" fill="white"/>
		</pattern>
	</defs>
\`;
`;

fs.writeFileSync(f1GraphicsPath, fileContent);
console.log('Successfully updated f1-graphics.ts with the new rb SVG files.');
