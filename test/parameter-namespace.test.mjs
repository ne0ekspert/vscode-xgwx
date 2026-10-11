import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {gzipSync} from 'node:zlib';
import init,{parse_xgwx} from '../media/libxgwx.js';
await init({module_or_path:fs.readFileSync(new URL('../media/libxgwx_bg.wasm',import.meta.url))});

test('parameter namespaces preserve existing wire counts, PID fields and per-record HSC warnings',()=>{
  const xml=`<Project><Configuration Type="17">PLC<Parameter Type="HSC PARAMETER" PAYLOAD="${'0'.repeat(448)}"/><Parameter Type="PID CAL PARAMETER"><EmbedPidLoopData TargetValue="11"/></Parameter><Parameter Type="POSITION PARAMETER"><HSC_PRM_XGB_AXIS_GROUP NUM_AXIS_DATA="1"><HSC_PRM_XGB_AXIS_DATA/><HSC_PRM_XGB_AXIS_DATA/></HSC_PRM_XGB_AXIS_GROUP></Parameter></Configuration><Configuration Type="17">PLC<Parameter Type="HSC PARAMETER" PAYLOAD="XX"/><Parameter Type="PID TUNE PARAMETER"><PidTunLoopData SetPWMAtPoint="47"/></Parameter></Configuration><Parameter Type="FUTURE PARAMETER"/></Project>`;
  const bytes=Buffer.concat([Buffer.from('XG'),gzipSync(xml)]);
  const result=parse_xgwx(bytes);
  assert.equal(result.parameters.length,6);
  assert.equal(result.counts.hscParameters,1);
  assert.equal(result.hsc[0].channels.length,4);
  assert.ok(result.warnings.some(warning=>warning.startsWith('hsc:')));
  assert.equal(result.pid.calculation[0].loops[0].targetValue,11);
  assert.equal(result.pid.tuning[0].loops[0].setPwmAtPoint,47);
  assert.equal(result.pid.tuning[0].loops[0].setPwmAtAddress,'P0002F');
  assert.equal(result.position[0].axisCount,1);
  assert.equal(result.position[0].axes.length,2);
});

test('safety namespace preserves the existing first-record WASM field',()=>{
  const xml='<Project><Configuration Type="111">PLC<Safety_Comm RcvWaitTime="11" IPAddress="67305985"><FutureChannel Addr="42"/></Safety_Comm><TrendMonitoring/></Configuration><Configuration Type="111">PLC<Safety_Comm RcvWaitTime="22"/><TrendMonitoring/></Configuration></Project>';
  const result=parse_xgwx(Buffer.concat([Buffer.from('XG'),gzipSync(xml)]));
  assert.equal(result.safetyComm.rcvWaitTime,11);
  assert.equal(result.safetyComm.ipAddress,'1.2.3.4');
  assert.equal(result.safetyComm.channels.length,1);
});
