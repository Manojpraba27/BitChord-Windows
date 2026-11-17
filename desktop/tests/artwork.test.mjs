import test from 'node:test';import assert from 'node:assert/strict';import {artwork} from '../electron/artwork.ts';
test('local raster artwork is encoded for display',()=>{assert.equal(artwork([{format:'image/png',data:new Uint8Array([1,2,3])}]),'data:image/png;base64,AQID');});
test('missing, active and oversized covers are excluded',()=>{assert.equal(artwork(),null);assert.equal(artwork([{format:'image/svg+xml',data:new Uint8Array([1])}]),null);assert.equal(artwork([{format:'image/png',data:new Uint8Array(2097153)}]),null);});
