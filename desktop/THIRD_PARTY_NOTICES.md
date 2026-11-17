# Source and licenses

Desktop renderer and vendor clients derive from https://github.com/kushagrasinghx/BitChord, commit acf219a7e4a7f52f026d4336d5c7ac5cf7bfafcc. The original GPLv3 license is included as LICENSE. Original source files remain in the full source distribution.

The inherited AutoMix engine contains AGPL-3.0-only code from David Finnegan's AutoMix. Its license and notice are preserved in licenses/ and renderer/src/playback/automix/. The combined desktop distribution is identified as AGPL-3.0-only; retain corresponding source with redistributions and comply with the network-interaction source requirements where applicable.

Electron includes Chromium, Node.js and their notices in the packaged distribution. React, Vite, Tailwind, YouTube.js, Shaka, Googlevideo, Essentia, ONNX Runtime, signalsmith-stretch, am-lyrics and other dependencies retain their own licenses. Exact dependency versions are in package-lock.json. Runtime dependency license files are included by electron-builder.

BitChord branding and font assets are inherited from the supplied repository. This conversion does not grant additional trademark or font redistribution rights. Review upstream asset permissions before a public commercial release. Service access remains subject to each provider's rules; no provider endorsement is implied.
