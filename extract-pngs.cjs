const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'src/pacman/assets/images');
const f1GraphicsPath = path.join(__dirname, 'src/pacman/core/f1-graphics.ts');

function extractPngBase64(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/(data:image\/png;base64,[A-Za-z0-9+/=]+)/);
    if (match) {
        return match[1];
    }
    // Fallback if it's already an SVG, just b64 the whole thing
    return 'data:image/svg+xml;base64,' + Buffer.from(content).toString('base64');
}

const upSvg = extractPngBase64(path.join(imgDir, 'rb-up.svg'));
const downSvg = extractPngBase64(path.join(imgDir, 'rb-down.svg'));
const leftSvg = extractPngBase64(path.join(imgDir, 'rb-left.svg'));
const rightSvg = extractPngBase64(path.join(imgDir, 'rb-right.svg'));

const fileContent = `/* ───────────── F1 Car Images (Base64 Encoded) ───────────── */
// Custom F1 car SVG images for each direction
export const F1_CAR_IMAGES = {
	up: '${upSvg}',
	down: '${downSvg}',
	left: '${leftSvg}',
	right: '${rightSvg}'
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
console.log('Successfully extracted PNG base64 strings and updated f1-graphics.ts.');
