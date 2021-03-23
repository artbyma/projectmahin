/** @jsxRuntime classic /
 /** @jsx jsx */
import { css, jsx } from '@emotion/react'
import {useState} from "react";

export function Overview() {
  const [isHover, setHover] = useState(false);

  const set1 = new Array(25).fill(true).map((_, idx) => ({set: 'set1', type: 'svg', id: String(idx+1).padStart(2, '0')}));
  const set2 = new Array(25).fill(true).map((_, idx) => ({set: 'set2', type: 'svg', id: String(idx+1).padStart(2, '0')}));
  const set3 = new Array(5).fill(true).map((_, idx) => ({set: 'set3', type: 'png', id: String(idx+1).padStart(2, '0')}));

  const all = [...set1, ...set2, ...set3];

  return <div css={css`
    display: grid;
    grid-template-columns: repeat(11, 1fr);
  `} onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)}>
    {all.map((img) => {
      return  <img src={`/assets/${img.set}/${img.set}-${img.id}.${isHover ? '2' : '1'}.${img.type}`} style={{
        width: '100%',
        imageRendering: 'pixelated'
      }} />
    })}
  </div>
}