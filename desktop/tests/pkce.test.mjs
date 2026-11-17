import test from 'node:test';import assert from 'node:assert/strict';import {challenge,validState} from '../electron/pkce.ts';
test('PKCE matches RFC 7636 S256 example',()=>assert.equal(challenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'),'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'));
test('OAuth callback rejects missing and mismatched states',()=>{assert.equal(validState(null,'state'),false);assert.equal(validState('wrong','state'),false);assert.equal(validState('state','state'),true);});
