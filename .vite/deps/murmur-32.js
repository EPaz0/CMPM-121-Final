// node_modules/.deno/encode-utf8@2.0.0/node_modules/encode-utf8/index.js
function encodeUtf8(input) {
  const result = [];
  const size = input.length;
  for (let index = 0; index < size; index++) {
    let point = input.charCodeAt(index);
    if (point >= 55296 && point <= 56319 && size > index + 1) {
      const second = input.charCodeAt(index + 1);
      if (second >= 56320 && second <= 57343) {
        point = (point - 55296) * 1024 + second - 56320 + 65536;
        index += 1;
      }
    }
    if (point < 128) {
      result.push(point);
      continue;
    }
    if (point < 2048) {
      result.push(point >> 6 | 192);
      result.push(point & 63 | 128);
      continue;
    }
    if (point < 55296 || point >= 57344 && point < 65536) {
      result.push(point >> 12 | 224);
      result.push(point >> 6 & 63 | 128);
      result.push(point & 63 | 128);
      continue;
    }
    if (point >= 65536 && point <= 1114111) {
      result.push(point >> 18 | 240);
      result.push(point >> 12 & 63 | 128);
      result.push(point >> 6 & 63 | 128);
      result.push(point & 63 | 128);
      continue;
    }
    result.push(239, 191, 189);
  }
  return new Uint8Array(result).buffer;
}

// node_modules/.deno/fmix@1.0.0/node_modules/fmix/index.js
function fmix(input) {
  input ^= input >>> 16;
  input = Math.imul(input, 2246822507);
  input ^= input >>> 13;
  input = Math.imul(input, 3266489909);
  input ^= input >>> 16;
  return input >>> 0;
}

// node_modules/.deno/murmur-32@1.0.0/node_modules/murmur-32/index.js
var C = new Uint32Array([
  3432918353,
  461845907
]);
function rotl(m, n) {
  return m << n | m >>> 32 - n;
}
function body(key, hash) {
  const blocks = key.byteLength / 4 | 0;
  const view32 = new Uint32Array(key, 0, blocks);
  for (let i = 0; i < blocks; i++) {
    view32[i] = Math.imul(view32[i], C[0]);
    view32[i] = rotl(view32[i], 15);
    view32[i] = Math.imul(view32[i], C[1]);
    hash[0] = hash[0] ^ view32[i];
    hash[0] = rotl(hash[0], 13);
    hash[0] = Math.imul(hash[0], 5) + 3864292196;
  }
}
function tail(key, hash) {
  const blocks = key.byteLength / 4 | 0;
  const reminder = key.byteLength % 4;
  let k = 0;
  const tail2 = new Uint8Array(key, blocks * 4, reminder);
  switch (reminder) {
    case 3:
      k = k ^ tail2[2] << 16;
    case 2:
      k = k ^ tail2[1] << 8;
    case 1:
      k = k ^ tail2[0] << 0;
      k = Math.imul(k, C[0]);
      k = rotl(k, 15);
      k = Math.imul(k, C[1]);
      hash[0] = hash[0] ^ k;
  }
}
function finalize(key, hash) {
  hash[0] = hash[0] ^ key.byteLength;
  hash[0] = fmix(hash[0]);
}
function murmur(key, seed) {
  seed = seed ? seed | 0 : 0;
  if (typeof key === "string") {
    key = encodeUtf8(key);
  }
  if (!(key instanceof ArrayBuffer)) {
    throw new TypeError("Expected key to be ArrayBuffer or string");
  }
  const hash = new Uint32Array([seed]);
  body(key, hash);
  tail(key, hash);
  finalize(key, hash);
  return hash.buffer;
}
export {
  murmur as default
};
//# sourceMappingURL=murmur-32.js.map
