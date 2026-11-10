'use client';
import { useId } from 'react';

export default function Blueprint({ variant = 'tower', small = false }: { variant?: 'tower' | 'truss' | 'foundation'; small?: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const gridId = `g-${variant}-${uid}`;

  return <svg
    className={'blueprint-svg ' + (small ? 'small' : '')}
    viewBox="0 0 660 540"
    role="img"
    aria-label={`${variant} conceptual structural wireframe illustration`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id={gridId} width="28" height="28" patternUnits="userSpaceOnUse">
        <path d="M28 0H0V28" fill="none" stroke="currentColor" strokeWidth=".6" opacity=".24"/>
      </pattern>
    </defs>
    <rect width="660" height="540" fill={`url(#${gridId})`} />
    {variant === 'tower' ? <g fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5">
      <path d="M180 433V126L294 67L452 127V433L338 492Z"/>
      <path d="M180 126L338 185L452 127M338 185V492M294 67L338 185"/>
      {Array.from({ length: 8 }, (_, i) => <g key={i}>
        <path d={`M180 ${166 + i * 34}L338 ${225 + i * 34}L452 ${167 + i * 34}`}/>
        <path d={`M180 ${166 + i * 34}L294 ${108 + i * 34}L452 ${167 + i * 34}`}/>
      </g>)}
      {[0, 1, 2].map(i => <path key={i} d={`M${180 + i * 53} ${126 + i * 20}V${433 + i * 20}`}/>)}
      <path d="M218 106V445M257 86V460M376 167V474M413 146V453" strokeDasharray="4 7" opacity=".5"/>
    </g> : variant === 'truss' ? <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M70 372H590L544 278H116Z"/>
      <path d="M70 372L116 278L162 372L208 278L254 372L300 278L346 372L392 278L438 372L484 278L530 372L544 278L590 372"/>
      <path d="M116 278H544M70 372H590"/>
      <path d="M70 387H590" strokeDasharray="6 8" opacity=".4"/>
      <path d="M116 278L162 372M208 278L254 372M300 278L346 372M392 278L438 372M484 278L530 372" opacity=".6"/>
    </g> : <g fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M170 115V300M275 115V300M380 115V300M485 115V300M170 115H485M170 200H485M170 300H485"/>
      <path d="M125 300L530 300L586 387L180 387Z"/>
      <path d="M170 300L226 387M275 300L330 387M380 300L436 387M485 300L541 387M125 300L180 387M530 300L586 387"/>
      <path d="M180 387V420H586V387M125 300V332H180V387" strokeDasharray="5 5" opacity=".6"/>
    </g>}
    <g stroke="currentColor" fill="none" strokeWidth="1">
      <path d="M65 475H595M65 469V481M595 469V481"/>
      <path d="M110 79V437M104 79H116M104 437H116"/>
      <path d="M508 166L571 128H618"/>
    </g>
    <g fill="currentColor" fontSize="12" fontFamily="monospace" letterSpacing="2">
      <text x="230" y="499">STRUCTURAL SYSTEM / {variant === 'tower' ? '01' : variant === 'truss' ? '02' : '03'}</text>
      <text x="516" y="118">DETAIL A</text>
      <text x="72" y="63">FIG. 01</text>
    </g>
  </svg>;
}
