import {
  require_node
} from "/build/_shared/chunk-G7CHZRZX.js";
import {
  createClient,
  init_module
} from "/build/_shared/chunk-XBXWO5VA.js";
import "/build/_shared/chunk-PH7FC7E6.js";
import {
  createHotContext
} from "/build/_shared/chunk-FJUA326G.js";
import "/build/_shared/chunk-UWV35TSL.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-XGOTYLZ5.js";
import "/build/_shared/chunk-7M6SC7J5.js";
import {
  __commonJS,
  __esm,
  __export,
  __toCommonJS,
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// node_modules/jose/dist/browser/lib/buffer_utils.js
var encoder, decoder, MAX_INT32;
var init_buffer_utils = __esm({
  "node_modules/jose/dist/browser/lib/buffer_utils.js"() {
    encoder = new TextEncoder();
    decoder = new TextDecoder();
    MAX_INT32 = 2 ** 32;
  }
});

// node_modules/jose/dist/browser/runtime/base64url.js
var encodeBase64, encode, decodeBase64, decode;
var init_base64url = __esm({
  "node_modules/jose/dist/browser/runtime/base64url.js"() {
    init_buffer_utils();
    encodeBase64 = (input) => {
      let unencoded = input;
      if (typeof unencoded === "string") {
        unencoded = encoder.encode(unencoded);
      }
      const CHUNK_SIZE = 32768;
      const arr = [];
      for (let i = 0; i < unencoded.length; i += CHUNK_SIZE) {
        arr.push(String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)));
      }
      return btoa(arr.join(""));
    };
    encode = (input) => {
      return encodeBase64(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    };
    decodeBase64 = (encoded) => {
      const binary = atob(encoded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    };
    decode = (input) => {
      let encoded = input;
      if (encoded instanceof Uint8Array) {
        encoded = decoder.decode(encoded);
      }
      encoded = encoded.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
      try {
        return decodeBase64(encoded);
      } catch (_a) {
        throw new TypeError("The input to be decoded is not correctly encoded.");
      }
    };
  }
});

// node_modules/jose/dist/browser/util/base64url.js
var base64url_exports = {};
__export(base64url_exports, {
  decode: () => decode2,
  encode: () => encode2
});
var encode2, decode2;
var init_base64url2 = __esm({
  "node_modules/jose/dist/browser/util/base64url.js"() {
    init_base64url();
    encode2 = encode;
    decode2 = decode;
  }
});

// node_modules/jose/dist/browser/index.js
var init_browser = __esm({
  "node_modules/jose/dist/browser/index.js"() {
    init_base64url2();
  }
});

// node_modules/@supabase/auth-helpers-shared/dist/index.mjs
var dist_exports = {};
__export(dist_exports, {
  BrowserCookieAuthStorageAdapter: () => BrowserCookieAuthStorageAdapter,
  CookieAuthStorageAdapter: () => CookieAuthStorageAdapter,
  DEFAULT_COOKIE_OPTIONS: () => DEFAULT_COOKIE_OPTIONS,
  createSupabaseClient: () => createSupabaseClient,
  isBrowser: () => isBrowser,
  parseCookies: () => export_parseCookies,
  parseSupabaseCookie: () => parseSupabaseCookie,
  serializeCookie: () => export_serializeCookie,
  stringifySupabaseSession: () => stringifySupabaseSession
});
function parseSupabaseCookie(str) {
  if (!str) {
    return null;
  }
  try {
    const session = JSON.parse(str);
    if (!session) {
      return null;
    }
    if (session.constructor.name === "Object") {
      return session;
    }
    if (session.constructor.name !== "Array") {
      throw new Error(`Unexpected format: ${session.constructor.name}`);
    }
    const [_header, payloadStr, _signature] = session[0].split(".");
    const payload = base64url_exports.decode(payloadStr);
    const decoder2 = new TextDecoder();
    const { exp, sub, ...user } = JSON.parse(decoder2.decode(payload));
    return {
      expires_at: exp,
      expires_in: exp - Math.round(Date.now() / 1e3),
      token_type: "bearer",
      access_token: session[0],
      refresh_token: session[1],
      provider_token: session[2],
      provider_refresh_token: session[3],
      user: {
        id: sub,
        factors: session[4],
        ...user
      }
    };
  } catch (err) {
    console.warn("Failed to parse cookie string:", err);
    return null;
  }
}
function stringifySupabaseSession(session) {
  var _a;
  return JSON.stringify([
    session.access_token,
    session.refresh_token,
    session.provider_token,
    session.provider_refresh_token,
    ((_a = session.user) == null ? void 0 : _a.factors) ?? null
  ]);
}
function isBrowser() {
  return typeof window !== "undefined" && typeof window.document !== "undefined";
}
function createChunkRegExp(chunkSize) {
  return new RegExp(".{1," + chunkSize + "}", "g");
}
function createChunks(key, value, chunkSize) {
  const re = chunkSize !== void 0 ? createChunkRegExp(chunkSize) : MAX_CHUNK_REGEXP;
  const chunkCount = Math.ceil(value.length / (chunkSize ?? MAX_CHUNK_SIZE));
  if (chunkCount === 1) {
    return [{ name: key, value }];
  }
  const chunks = [];
  const values = value.match(re);
  values == null ? void 0 : values.forEach((value2, i) => {
    const name = `${key}.${i}`;
    chunks.push({ name, value: value2 });
  });
  return chunks;
}
function combineChunks(key, retrieveChunk = () => {
  return null;
}) {
  let values = [];
  for (let i = 0; ; i++) {
    const chunkName = `${key}.${i}`;
    const chunk = retrieveChunk(chunkName);
    if (!chunk) {
      break;
    }
    values.push(chunk);
  }
  return values.length ? values.join("") : null;
}
function createSupabaseClient(supabaseUrl, supabaseKey, options) {
  var _a;
  const browser = isBrowser();
  return createClient(supabaseUrl, supabaseKey, {
    ...options,
    auth: {
      flowType: "pkce",
      autoRefreshToken: browser,
      detectSessionInUrl: browser,
      persistSession: true,
      storage: options.auth.storage,
      // fix this in supabase-js
      ...((_a = options.auth) == null ? void 0 : _a.storageKey) ? {
        storageKey: options.auth.storageKey
      } : {}
    }
  });
}
var __create, __defProp, __getOwnPropDesc, __getOwnPropNames, __getProtoOf, __hasOwnProp, __commonJS2, __copyProps, __toESM2, require_cookie, import_cookie2, import_cookie, DEFAULT_COOKIE_OPTIONS, MAX_CHUNK_SIZE, MAX_CHUNK_REGEXP, CookieAuthStorageAdapter, BrowserCookieAuthStorageAdapter, export_parseCookies, export_serializeCookie;
var init_dist = __esm({
  "node_modules/@supabase/auth-helpers-shared/dist/index.mjs"() {
    init_browser();
    init_module();
    __create = Object.create;
    __defProp = Object.defineProperty;
    __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    __getOwnPropNames = Object.getOwnPropertyNames;
    __getProtoOf = Object.getPrototypeOf;
    __hasOwnProp = Object.prototype.hasOwnProperty;
    __commonJS2 = (cb, mod) => function __require() {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    };
    __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    __toESM2 = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    require_cookie = __commonJS2({
      "../../node_modules/.pnpm/cookie@0.5.0/node_modules/cookie/index.js"(exports) {
        "use strict";
        exports.parse = parse3;
        exports.serialize = serialize3;
        var __toString = Object.prototype.toString;
        var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
        function parse3(str, options) {
          if (typeof str !== "string") {
            throw new TypeError("argument str must be a string");
          }
          var obj = {};
          var opt = options || {};
          var dec = opt.decode || decode3;
          var index = 0;
          while (index < str.length) {
            var eqIdx = str.indexOf("=", index);
            if (eqIdx === -1) {
              break;
            }
            var endIdx = str.indexOf(";", index);
            if (endIdx === -1) {
              endIdx = str.length;
            } else if (endIdx < eqIdx) {
              index = str.lastIndexOf(";", eqIdx - 1) + 1;
              continue;
            }
            var key = str.slice(index, eqIdx).trim();
            if (void 0 === obj[key]) {
              var val = str.slice(eqIdx + 1, endIdx).trim();
              if (val.charCodeAt(0) === 34) {
                val = val.slice(1, -1);
              }
              obj[key] = tryDecode(val, dec);
            }
            index = endIdx + 1;
          }
          return obj;
        }
        function serialize3(name, val, options) {
          var opt = options || {};
          var enc = opt.encode || encode3;
          if (typeof enc !== "function") {
            throw new TypeError("option encode is invalid");
          }
          if (!fieldContentRegExp.test(name)) {
            throw new TypeError("argument name is invalid");
          }
          var value = enc(val);
          if (value && !fieldContentRegExp.test(value)) {
            throw new TypeError("argument val is invalid");
          }
          var str = name + "=" + value;
          if (null != opt.maxAge) {
            var maxAge = opt.maxAge - 0;
            if (isNaN(maxAge) || !isFinite(maxAge)) {
              throw new TypeError("option maxAge is invalid");
            }
            str += "; Max-Age=" + Math.floor(maxAge);
          }
          if (opt.domain) {
            if (!fieldContentRegExp.test(opt.domain)) {
              throw new TypeError("option domain is invalid");
            }
            str += "; Domain=" + opt.domain;
          }
          if (opt.path) {
            if (!fieldContentRegExp.test(opt.path)) {
              throw new TypeError("option path is invalid");
            }
            str += "; Path=" + opt.path;
          }
          if (opt.expires) {
            var expires = opt.expires;
            if (!isDate(expires) || isNaN(expires.valueOf())) {
              throw new TypeError("option expires is invalid");
            }
            str += "; Expires=" + expires.toUTCString();
          }
          if (opt.httpOnly) {
            str += "; HttpOnly";
          }
          if (opt.secure) {
            str += "; Secure";
          }
          if (opt.priority) {
            var priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
            switch (priority) {
              case "low":
                str += "; Priority=Low";
                break;
              case "medium":
                str += "; Priority=Medium";
                break;
              case "high":
                str += "; Priority=High";
                break;
              default:
                throw new TypeError("option priority is invalid");
            }
          }
          if (opt.sameSite) {
            var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
            switch (sameSite) {
              case true:
                str += "; SameSite=Strict";
                break;
              case "lax":
                str += "; SameSite=Lax";
                break;
              case "strict":
                str += "; SameSite=Strict";
                break;
              case "none":
                str += "; SameSite=None";
                break;
              default:
                throw new TypeError("option sameSite is invalid");
            }
          }
          return str;
        }
        function decode3(str) {
          return str.indexOf("%") !== -1 ? decodeURIComponent(str) : str;
        }
        function encode3(val) {
          return encodeURIComponent(val);
        }
        function isDate(val) {
          return __toString.call(val) === "[object Date]" || val instanceof Date;
        }
        function tryDecode(str, decode22) {
          try {
            return decode22(str);
          } catch (e) {
            return str;
          }
        }
      }
    });
    import_cookie2 = __toESM2(require_cookie());
    import_cookie = __toESM2(require_cookie());
    DEFAULT_COOKIE_OPTIONS = {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365 * 1e3
    };
    MAX_CHUNK_SIZE = 3180;
    MAX_CHUNK_REGEXP = createChunkRegExp(MAX_CHUNK_SIZE);
    CookieAuthStorageAdapter = class {
      constructor(cookieOptions) {
        this.cookieOptions = {
          ...DEFAULT_COOKIE_OPTIONS,
          ...cookieOptions,
          maxAge: DEFAULT_COOKIE_OPTIONS.maxAge
        };
      }
      getItem(key) {
        const value = this.getCookie(key);
        if (key.endsWith("-code-verifier") && value) {
          return value;
        }
        if (value) {
          return JSON.stringify(parseSupabaseCookie(value));
        }
        const chunks = combineChunks(key, (chunkName) => {
          return this.getCookie(chunkName);
        });
        return chunks !== null ? JSON.stringify(parseSupabaseCookie(chunks)) : null;
      }
      setItem(key, value) {
        if (key.endsWith("-code-verifier")) {
          this.setCookie(key, value);
          return;
        }
        let session = JSON.parse(value);
        const sessionStr = stringifySupabaseSession(session);
        const sessionChunks = createChunks(key, sessionStr);
        sessionChunks.forEach((sess) => {
          this.setCookie(sess.name, sess.value);
        });
      }
      removeItem(key) {
        this._deleteSingleCookie(key);
        this._deleteChunkedCookies(key);
      }
      _deleteSingleCookie(key) {
        if (this.getCookie(key)) {
          this.deleteCookie(key);
        }
      }
      _deleteChunkedCookies(key, from = 0) {
        for (let i = from; ; i++) {
          const cookieName = `${key}.${i}`;
          const value = this.getCookie(cookieName);
          if (value === void 0) {
            break;
          }
          this.deleteCookie(cookieName);
        }
      }
    };
    BrowserCookieAuthStorageAdapter = class extends CookieAuthStorageAdapter {
      constructor(cookieOptions) {
        super(cookieOptions);
      }
      getCookie(name) {
        if (!isBrowser())
          return null;
        const cookies = (0, import_cookie2.parse)(document.cookie);
        return cookies[name];
      }
      setCookie(name, value) {
        if (!isBrowser())
          return null;
        document.cookie = (0, import_cookie2.serialize)(name, value, {
          ...this.cookieOptions,
          httpOnly: false
        });
      }
      deleteCookie(name) {
        if (!isBrowser())
          return null;
        document.cookie = (0, import_cookie2.serialize)(name, "", {
          ...this.cookieOptions,
          maxAge: 0,
          httpOnly: false
        });
      }
    };
    export_parseCookies = import_cookie.parse;
    export_serializeCookie = import_cookie.serialize;
  }
});

// node_modules/@supabase/auth-helpers-remix/dist/index.js
var require_dist = __commonJS({
  "node_modules/@supabase/auth-helpers-remix/dist/index.js"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var src_exports = {};
    __export2(src_exports, {
      createBrowserClient: () => createBrowserClient,
      createServerClient: () => createServerClient2
    });
    module.exports = __toCommonJS2(src_exports);
    var import_auth_helpers_shared = (init_dist(), __toCommonJS(dist_exports));
    function createBrowserClient(supabaseUrl, supabaseKey, {
      options,
      cookieOptions
    } = {}) {
      var _a;
      if (!supabaseUrl || !supabaseKey) {
        throw new Error(
          "supabaseUrl and supabaseKey are required to create a Supabase client! Find these under `Settings` > `API` in your Supabase dashboard."
        );
      }
      const storageKey = cookieOptions == null ? void 0 : cookieOptions.name;
      cookieOptions == null ? true : delete cookieOptions.name;
      return (0, import_auth_helpers_shared.createSupabaseClient)(supabaseUrl, supabaseKey, {
        ...options,
        global: {
          ...options == null ? void 0 : options.global,
          headers: {
            ...(_a = options == null ? void 0 : options.global) == null ? void 0 : _a.headers,
            "X-Client-Info": `${"@supabase/auth-helpers-remix"}@${"0.4.0"}`
          }
        },
        auth: {
          storageKey,
          storage: new import_auth_helpers_shared.BrowserCookieAuthStorageAdapter(cookieOptions)
        }
      });
    }
    var RemixServerAuthStorageAdapter = class extends import_auth_helpers_shared.CookieAuthStorageAdapter {
      constructor(request, response, cookieOptions) {
        super(cookieOptions);
        this.request = request;
        this.response = response;
        this.isServer = true;
      }
      getCookie(name) {
        var _a, _b;
        return (0, import_auth_helpers_shared.parseCookies)(((_b = (_a = this.request) == null ? void 0 : _a.headers) == null ? void 0 : _b.get("Cookie")) ?? "")[name];
      }
      setCookie(name, value) {
        const cookieStr = (0, import_auth_helpers_shared.serializeCookie)(name, value, {
          ...this.cookieOptions,
          // Allow supabase-js on the client to read the cookie as well
          httpOnly: false
        });
        this.response.headers.append("set-cookie", cookieStr);
      }
      deleteCookie(name) {
        const cookieStr = (0, import_auth_helpers_shared.serializeCookie)(name, "", {
          ...this.cookieOptions,
          maxAge: 0,
          // Allow supabase-js on the client to read the cookie as well
          httpOnly: false
        });
        this.response.headers.append("set-cookie", cookieStr);
      }
    };
    function createServerClient2(supabaseUrl, supabaseKey, {
      request,
      response,
      options,
      cookieOptions
    }) {
      var _a;
      if (!supabaseUrl || !supabaseKey) {
        throw new Error(
          "supabaseUrl and supabaseKey are required to create a Supabase client! Find these under `Settings` > `API` in your Supabase dashboard."
        );
      }
      if (!request || !response) {
        throw new Error(
          "request and response must be passed to createSupabaseClient function, when called from loader or action"
        );
      }
      return (0, import_auth_helpers_shared.createSupabaseClient)(supabaseUrl, supabaseKey, {
        ...options,
        global: {
          ...options == null ? void 0 : options.global,
          headers: {
            ...(_a = options == null ? void 0 : options.global) == null ? void 0 : _a.headers,
            "X-Client-Info": `${"@supabase/auth-helpers-remix"}@${"0.4.0"}`
          }
        },
        auth: {
          storage: new RemixServerAuthStorageAdapter(request, response, cookieOptions)
        }
      });
    }
  }
});

// app/routes/logout.tsx
var import_node = __toESM(require_node(), 1);
var import_auth_helpers_remix = __toESM(require_dist(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\routes\\\\logout.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\routes\\logout.tsx"
  );
  import.meta.hot.lastModified = "1745191572354.5205";
}
function LogoutPage() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("form", { method: "post", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { type: "submit", className: "bg-red-500 text-white px-4 py-2 rounded", children: "Ausloggen" }, void 0, false, {
    fileName: "app/routes/logout.tsx",
    lineNumber: 36,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/routes/logout.tsx",
    lineNumber: 35,
    columnNumber: 10
  }, this);
}
_c = LogoutPage;
var _c;
$RefreshReg$(_c, "LogoutPage");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  LogoutPage as default
};
/*! Bundled license information:

@supabase/auth-helpers-shared/dist/index.mjs:
  (*! Bundled license information:
  
  cookie/index.js:
    (*!
     * cookie
     * Copyright(c) 2012-2014 Roman Shtylman
     * Copyright(c) 2015 Douglas Christopher Wilson
     * MIT Licensed
     *)
  *)
*/
//# sourceMappingURL=/build/routes/logout-HFEHMEMD.js.map
