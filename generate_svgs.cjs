const fs = require('fs');

const carColors = { body: '#121F45', nose: '#FCD700', detail: '#CC1E4A', tire: '#222222', wing: '#111111', cockpit: '#000000' };

const svgUp = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <rect x="5" y="16" width="3" height="5" rx="1" fill="${carColors.tire}"/>
  <rect x="16" y="16" width="3" height="5" rx="1" fill="${carColors.tire}"/>
  <rect x="6" y="4" width="3" height="4" rx="1" fill="${carColors.tire}"/>
  <rect x="15" y="4" width="3" height="4" rx=\"1\" fill="${carColors.tire}"/>
  <rect x="9" y="3" width="6" height="18" rx="2" fill="${carColors.body}"/>
  <rect x="10" y="4" width="4" height="4" fill="${carColors.nose}"/>
  <rect x="11" y="8" width="2" height="4" fill="${carColors.detail}"/>
  <rect x="7" y="2" width="10" height="2" rx="0.5" fill="${carColors.wing}"/>
  <rect x="6" y="20" width="12" height="2" rx="0.5" fill="${carColors.wing}"/>
  <rect x="10" y="12" width="4" height="4" rx="1" fill="${carColors.cockpit}"/>
</svg>`;

const svgDown = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <rect x="5" y="3" width="3" height="5" rx="1" fill="${carColors.tire}"/>
  <rect x="16" y="3" width="3" height="5" rx="1" fill="${carColors.tire}"/>
  <rect x="6" y="16" width="3" height="4" rx="1" fill="${carColors.tire}"/>
  <rect x="15" y="16" width="3" height="4" rx="1" fill="${carColors.tire}"/>
  <rect x="9" y="3" width="6" height="18" rx="2" fill="${carColors.body}"/>
  <rect x="10" y="16" width="4" height="4" fill="${carColors.nose}"/>
  <rect x="11" y="12" width="2" height="4" fill="${carColors.detail}"/>
  <rect x="7" y="20" width="10" height="2" rx="0.5" fill="${carColors.wing}"/>
  <rect x="6" y="2" width="12" height="2" rx="0.5" fill="${carColors.wing}"/>
  <rect x="10" y="8" width="4" height="4" rx="1" fill="${carColors.cockpit}"/>
</svg>`;

const svgLeft = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <rect x="16" y="5" width="5" height="3" rx="1" fill="${carColors.tire}"/>
  <rect x="16" y="16" width="5" height="3" rx="1" fill="${carColors.tire}"/>
  <rect x="4" y="6" width="4" height="3" rx="1" fill="${carColors.tire}"/>
  <rect x="4" y="15" width="4" height="3" rx="1" fill="${carColors.tire}"/>
  <rect x="3" y="9" width="18" height="6" rx="2" fill="${carColors.body}"/>
  <rect x="4" y="10" width="4" height="4" fill="${carColors.nose}"/>
  <rect x="8" y="11" width="4" height="2" fill="${carColors.detail}"/>
  <rect x="2" y="7" width="2" height="10" rx="0.5" fill="${carColors.wing}"/>
  <rect x="20" y="6" width="2" height="12" rx="0.5" fill="${carColors.wing}"/>
  <rect x="12" y="10" width="4" height="4" rx="1" fill="${carColors.cockpit}"/>
</svg>`;

const svgRight = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <rect x="3" y="5" width="5" height="3" rx="1" fill="${carColors.tire}"/>
  <rect x="3" y="16" width="5" height="3" rx="1" fill="${carColors.tire}"/>
  <rect x="16" y="6" width="4" height="3" rx="1" fill="${carColors.tire}"/>
  <rect x="16" y="15" width="4" height="3" rx="1" fill="${carColors.tire}"/>
  <rect x="3" y="9" width="18" height="6" rx="2" fill="${carColors.body}"/>
  <rect x="16" y="10" width="4" height="4" fill="${carColors.nose}"/>
  <rect x="12" y="11" width="4" height="2" fill="${carColors.detail}"/>
  <rect x="20" y="7" width="2" height="10" rx="0.5" fill="${carColors.wing}"/>
  <rect x="2" y="6" width="2" height="12" rx="0.5" fill="${carColors.wing}"/>
  <rect x="8" y="10" width="4" height="4" rx="1" fill="${carColors.cockpit}"/>
</svg>`;

const b64 = (str) => 'data:image/svg+xml;base64,' + Buffer.from(str).toString('base64');

const fileContent = `/* ───────────── F1 Car Images (Base64 Encoded) ───────────── */
// Custom F1 car SVG images for each direction
export const F1_CAR_IMAGES = {
	up: '${b64(svgUp)}',
	down: '${b64(svgDown)}',
	left: '${b64(svgLeft)}',
	right: '${b64(svgRight)}'
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

fs.writeFileSync('src/pacman/core/f1-graphics.ts', fileContent);
console.log('Fixed SVG base64 strings.');
