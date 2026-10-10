import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import init, { create_xgwx_project,parse_xgwx, insert_xgwx_ladder_row, edit_xgwx_ladder_cell,
  insert_xgwx_iec_ld_single_element } from '../media/libxgwx.js';
import { attachGrowingCanvas, xgkCanvasRowValues } from '../media/ladder-canvas.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm', import.meta.url))});
const source = family => create_xgwx_project(family==='xgk'?'XGK-CPUSN':'XGI-CPUE','LD');
test('scroll growth is view state, windows stay bounded, and format limits stop growth', () => {
  const sizes = [], windows = [];
  const viewport = {scrollTop:0, clientHeight:560, addEventListener(_event, listener) {this.scroll = listener;}};
  const canvas = attachGrowingCanvas(viewport, {initialRows:1, maxRows:16383, pitch:68, top:32,
    resize:count => sizes.push(count), renderWindow:(first,last) => windows.push([first,last])});
  viewport.scrollTop = 600; viewport.scroll();
  assert.ok(sizes.at(-1)>16);
  canvas.ensureRow(10000);
  viewport.scrollTop = 680000; viewport.scroll();
  assert.ok(windows.at(-1)[1] - windows.at(-1)[0] < 30);
  canvas.ensureRow(20000); assert.equal(sizes.at(-1),16383);
});
test('XGK distant blank insertion uses wide sparse coordinates and preserves existing contact', () => {
  let bytes = edit_xgwx_ladder_cell(source('xgk'),0,{rawY:0,column:0,expected:null,replacement:{kind:'NormallyOpen',operand:'M00000'}});
  bytes = edit_xgwx_ladder_cell(bytes,0,{rawY:262136,column:0,expected:null,replacement:{kind:'NormallyClosed',operand:'M00001'}});
  const ladder = parse_xgwx(bytes).ladder[0];
  assert.equal(ladder.rungs.length,65535);
  assert.deepEqual(ladder.cells.filter(c=>c.value).map(c=>[c.rawY,c.value]),[[0,'M00000'],[262136,'M00001']]);
  assert.throws(()=>edit_xgwx_ladder_cell(bytes,0,{rawY:262140,column:0,expected:null,replacement:{kind:'NormallyOpen',operand:'M00002'}}));
  assert.equal(xgkCanvasRowValues(ladder,70000).length,65535);
});
test('IEC distant single-cell insertion keeps sparse gaps and existing rows', () => {
  let bytes = insert_xgwx_iec_ld_single_element(source('xgi'),0,100,1,'contact','NO','%MX0');
  bytes = insert_xgwx_iec_ld_single_element(bytes,0,300,94,'coil','OUTPUT','%MX1');
  const ladder = parse_xgwx(bytes).ladder[0];
  assert.deepEqual(ladder.iecRows.map(row=>row.rowIndex),[100,300]);
  assert.deepEqual(ladder.sourceStrings.filter(item=>item.iecElementKind).map(item=>[item.iecRowIndex,item.value]),[[100,'%MX0'],[300,'%MX1']]);
  assert.throws(()=>insert_xgwx_iec_ld_single_element(bytes,0,100,1,'contact','NO','%MX2'));
  assert.throws(()=>insert_xgwx_iec_ld_single_element(bytes,0,16383,1,'contact','NO','%MX2'));
});

test('keyboard navigation reveals an offscreen row and refreshes its window', () => {
  const windows = [];
  const viewport = {scrollTop:0,clientHeight:560,addEventListener(){}};
  const canvas = attachGrowingCanvas(viewport,{initialRows:65535,maxRows:65535,pitch:76,top:32,resize(){},renderWindow:(first,last)=>windows.push([first,last])});
  canvas.showRow(65534);
  assert.ok(viewport.scrollTop>4900000);
  assert.ok(windows.at(-1)[0]<=65534 && windows.at(-1)[1]>=65534);
  assert.ok(windows.at(-1)[1]-windows.at(-1)[0]<30);
});
