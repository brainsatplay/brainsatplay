var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// src/index.ts
__export(exports, {
  dtsPlugin: () => dtsPlugin,
  util: () => util
});

// src/config.ts
var import_typescript = __toModule(require("typescript"));
var import_fs = __toModule(require("fs"));
function getTSConfig(forcepath, conf, wd = process.cwd()) {
  let f = forcepath != null ? forcepath : import_typescript.default.findConfigFile(wd, import_typescript.default.sys.fileExists, conf);
  if (!f)
    throw "No config file found";
  if (f.startsWith("."))
    f = require.resolve(f);
  const c = import_typescript.default.readConfigFile(f, (path) => (0, import_fs.readFileSync)(path, "utf-8"));
  if (c.error)
    throw c.error;
  else
    return { loc: f, conf: c.config };
}

// src/plugin.ts
var import_typescript2 = __toModule(require("typescript"));
var import_fs2 = __toModule(require("fs"));
var import_chalk = __toModule(require("chalk"));

// src/util.ts
function getLogLevel(level) {
  if (!level || level === "silent")
    return ["silent"];
  const levels = ["verbose", "debug", "info", "warning", "error", "silent"];
  for (const l of levels) {
    if (l === level) {
      break;
    } else {
      levels.splice(levels.indexOf(l), 1);
    }
  }
  return levels;
}
function humanFileSize(size) {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return Math.round(size / Math.pow(1024, i) * 100) / 100 + ["b", "kb", "mb", "gb", "tb"][i];
}

// src/plugin.ts
var import_path = __toModule(require("path"));
var import_tmp = __toModule(require("tmp"));
var import_jju = __toModule(require("jju"));
var dtsPlugin = (opts = {}) => ({
  name: "dts-plugin",
  async setup(build) {
    var _a, _b, _c;
    const l = getLogLevel(build.initialOptions.logLevel);
    const conf = getTSConfig(opts.tsconfig);
    const finalconf = conf.conf;
    if (Object.prototype.hasOwnProperty.call(conf.conf, "extends")) {
      const extendedfile = (0, import_fs2.readFileSync)((0, import_path.resolve)((0, import_path.dirname)(conf.loc), conf.conf.extends), "utf-8");
      const extended = (0, import_jju.parse)(extendedfile);
      if (Object.prototype.hasOwnProperty.call(extended, "compilerOptions") && Object.prototype.hasOwnProperty.call(finalconf, "compilerOptions")) {
        finalconf.compilerOptions = __spreadValues(__spreadValues({}, extended.compilerOptions), finalconf.compilerOptions);
      }
    }
    const copts = import_typescript2.default.convertCompilerOptionsFromJson(finalconf.compilerOptions, process.cwd()).options;
    copts.declaration = true;
    copts.emitDeclarationOnly = true;
    copts.incremental = true;
    if (!copts.declarationDir)
      copts.declarationDir = (_b = (_a = opts.outDir) != null ? _a : build.initialOptions.outdir) != null ? _b : copts.outDir;
    const pjloc = (0, import_path.resolve)(conf.loc, "../", "package.json");
    if ((0, import_fs2.existsSync)(pjloc)) {
      copts.tsBuildInfoFile = (0, import_path.resolve)(import_tmp.tmpdir, (_c = require(pjloc).name) != null ? _c : "unnamed", ".esbuild", ".tsbuildinfo");
    }
    copts.listEmittedFiles = true;
    const host = import_typescript2.default.createIncrementalCompilerHost(copts);
    const files = [];
    build.onLoad({ filter: /(\.tsx|\.ts|\.js|\.jsx)$/ }, async (args) => {
      var _a2;
      files.push(args.path);
      host.getSourceFile(args.path, (_a2 = copts.target) != null ? _a2 : import_typescript2.default.ScriptTarget.Latest, (m) => console.log(m), true);
      return {};
    });
    build.onEnd(() => {
      const finalprogram = import_typescript2.default.createIncrementalProgram({
        options: copts,
        host,
        rootNames: files
      });
      const start = Date.now();
      const emit = finalprogram.emit();
      let final = "";
      if (emit.emitSkipped || typeof emit.emittedFiles === "undefined") {
        if (l.includes("warning"))
          console.log(import_chalk.default`  {yellow Typescript did not emit anything}`);
      } else {
        for (const emitted of emit.emittedFiles) {
          if ((0, import_fs2.existsSync)(emitted) && !emitted.endsWith(".tsbuildinfo")) {
            const stat = (0, import_fs2.lstatSync)(emitted);
            final += import_chalk.default`  ${(0, import_path.resolve)(emitted).replace((0, import_path.resolve)(process.cwd()), "").replace(/^[\\/]/, "").replace((0, import_path.basename)(emitted), import_chalk.default`{bold ${(0, import_path.basename)(emitted)}}`)} {cyan ${humanFileSize(stat.size)}}\n`;
          }
        }
      }
      if (l.includes("info"))
        console.log(final + import_chalk.default`\n{green Finished compiling declarations in ${Date.now() - start}ms}`);
    });
  }
});

// src/index.ts
var util = {
  humanFileSize,
  getLogLevel,
  getTSConfig
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  dtsPlugin,
  util
});
//# sourceMappingURL=index.js.map