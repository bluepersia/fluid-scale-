"use strict";
var FluidScale = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);

  // bundle/src/bundle.ts
  var bundle_exports = {};
  __export(bundle_exports, {
    EventBus: () => EventBus,
    cloneDoc: () => cloneDoc,
    docClonerAssertionMaster: () => docClonerAssertionMaster,
    getQueue: () => getQueue
  });

  // ../GoldSight/dist/utils/deepClone.js
  function deepClone(value, hash = /* @__PURE__ */ new WeakMap()) {
    if (value === null || typeof value !== "object")
      return value;
    if (hash.has(value))
      return hash.get(value);
    if (value instanceof Date)
      return new Date(value.getTime());
    if (Array.isArray(value)) {
      const arr = [];
      hash.set(value, arr);
      value.forEach((item, index) => {
        arr[index] = deepClone(item, hash);
      });
      return arr;
    }
    if (value instanceof Map) {
      const map = /* @__PURE__ */ new Map();
      hash.set(value, map);
      value.forEach((v, k) => {
        map.set(k, deepClone(v, hash));
      });
      return map;
    }
    if (value instanceof Set) {
      const set = /* @__PURE__ */ new Set();
      hash.set(value, set);
      value.forEach((v) => {
        set.add(deepClone(v, hash));
      });
      return set;
    }
    const obj = Object.create(Object.getPrototypeOf(value));
    hash.set(value, obj);
    for (const key of Object.keys(value)) {
      obj[key] = deepClone(value[key], hash);
    }
    return obj;
  }

  // ../GoldSight/dist/utils/eventBus.js
  var EventBus = class {
    constructor(queueIndex = 0, events = {}) {
      this.isEventBus = true;
      this.queueIndex = 0;
      this.events = {};
      this.uninitialized = [];
      this.emitOnceEvents = {};
      this.queueIndex = queueIndex;
      this.events = events;
    }
    setQueueIndex(queueIndex) {
      this.queueIndex = queueIndex;
    }
    getQueueIndex() {
      return this.queueIndex;
    }
    emit(name, uuid, payload) {
      const uuidValue = typeof uuid === "string" ? uuid : uuid.eventUUID;
      if (!payload)
        payload = {};
      const newEvent = {
        name,
        payload,
        uuid: uuidValue
      };
      let events = this.events[name];
      if (!events) {
        events = this.events[name] = [];
      }
      events.push(newEvent);
      this.uninitialized.push(newEvent);
    }
    emitOnce(name, uuid, payload) {
      const uuidValue = typeof uuid === "string" ? uuid : uuid.eventUUID;
      let emitOnceEvents = this.emitOnceEvents[name];
      if (!emitOnceEvents)
        this.emitOnceEvents[name] = emitOnceEvents = [];
      if (emitOnceEvents.find((event) => event.uuid === uuidValue))
        return;
      emitOnceEvents.push({
        name,
        payload,
        uuid: uuidValue
      });
      this.emit(name, uuid, payload);
    }
    getEventsForUUID(uuid) {
      return Object.values(this.events).flat().filter((event) => event.uuid === uuid);
    }
  };
  function getEventBus(args) {
    for (const arg of args) {
      if (arg?.isEventBus)
        return arg;
      if (typeof arg === "object") {
        if ("events" in arg) {
          return arg.events;
        }
        if ("eventBus" in arg) {
          return arg.eventBus;
        }
        if ("event" in arg) {
          return arg.event;
        }
        for (const value of Object.values(arg)) {
          if (value?.isEventBus)
            return value;
        }
      }
    }
    return null;
  }
  function getEventUUID(args) {
    for (const arg of args) {
      if (typeof arg === "object" && "eventUUID" in arg) {
        return arg.eventUUID;
      }
    }
    return void 0;
  }
  function getEventByUUID(eventBus, name, uuid) {
    const event = eventBus.events[name]?.find((e) => e.uuid === uuid);
    return event || null;
  }
  function withEventNames(args, eventNames, func) {
    const eventBus = getEventBus(args);
    const eventUUID = getEventUUID(args);
    if (!eventBus) {
      throw new Error("Event bus not found");
    }
    if (!eventUUID) {
      throw new Error("Event UUID not found");
    }
    const events = {};
    for (const name of eventNames) {
      const event = getEventByUUID(eventBus, name, eventUUID);
      if (event) {
        events[name] = event;
      }
    }
    return func(events, ...args);
  }

  // ../GoldSight/dist/utils/absCounter.js
  var AbsCounter = class {
    constructor(targetIndex) {
      this.index = 0;
      this.targetIndex = targetIndex;
    }
    match() {
      if (this.index === this.targetIndex) {
        return true;
      }
      this.index++;
      return false;
    }
  };

  // ../GoldSight/dist/index.js
  var assertionQueues = {};
  var AssertionMaster = class {
    constructor(assertionChains, globalKey, globalOptions) {
      this.resetState = () => {
        this._state = {
          ...this.newState(),
          master: this.master,
          callStack: [],
          branchCounter: /* @__PURE__ */ new Map(),
          queueIndex: 0
        };
      };
      this.assertQueue = (options) => {
        options = {
          logMasterName: this._globalKey,
          errorAlgorithm: "firstOfDeepest",
          ...this._globalOptions?.assert || {},
          ...options || {}
        };
        const assertionQueue = assertionQueues[this.globalKey];
        const allAssertions = Array.from(assertionQueue.values());
        const verifiedAssertions = /* @__PURE__ */ new Map();
        if (!this.state?.master && options?.master === void 0)
          console.error(`No master indexes set. Provide it via options.`);
        const master = options?.master ?? this.state?.master;
        console.groupCollapsed(`\u2705 ${options.logMasterName} - \u2728${printMaster(options.master)}`);
        let groupedByName = {};
        for (const [, item] of assertionQueue.entries()) {
          if (!groupedByName[item.name])
            groupedByName[item.name] = [];
          groupedByName[item.name].push(item);
        }
        if (options.targetName) {
          if (groupedByName.hasOwnProperty(options.targetName))
            groupedByName = {
              [options.targetName]: groupedByName[options.targetName]
            };
        }
        const nameWithHighestIndex = Object.entries(groupedByName).map(([name, items]) => ({
          name,
          highestIndex: Math.max(...items.map((i) => i.funcIndex))
        }));
        nameWithHighestIndex.sort((a, b) => {
          return b.highestIndex - a.highestIndex;
        });
        let error;
        const errors = [];
        outer: for (const { name } of nameWithHighestIndex) {
          const items = groupedByName[name].sort((a, b) => {
            if (a.funcIndex === b.funcIndex) {
              return a.branchCount - b.branchCount;
            }
            if (options?.errorAlgorithm === "firstOfDeepest")
              return a.funcIndex - b.funcIndex;
            else
              return b.funcIndex - a.funcIndex;
          });
          for (const { state, args, result, id } of items) {
            const assertions = this.assertionChains[name];
            if (!assertions)
              throw Error(`Assertion chain for ${name} not found. Are you setting up the default assertion chains?`);
            for (const [key, assertion] of Object.entries(assertions)) {
              let didRun = false;
              try {
                didRun = assertion(state, args, result, allAssertions);
              } catch (e) {
                const err = e;
                let prelog = "";
                if (master) {
                  prelog = `Master:${master.index}`;
                  if (master.step) {
                    prelog += `, Step:${master.step}`;
                  }
                }
                if (id) {
                  prelog += `, ID: ${id}`;
                }
                if (prelog) {
                  prelog += ", ";
                  err.message = `${prelog}${err.message}`;
                }
                if (!options.showAllErrors) {
                  error = err;
                  break outer;
                }
                errors.push({ err, name, id });
              }
              didRun = didRun;
              let count = verifiedAssertions.get(key) || 0;
              count++;
              verifiedAssertions.set(key, count);
            }
          }
        }
        for (const [key, count] of verifiedAssertions.entries()) {
          console.log(`\u2705 ${key} - \u2728${count} times`);
        }
        console.groupEnd();
        this.reset();
        if (error)
          throw error;
        if (errors.length) {
          throw new Error(errors.map((e) => `${e.name}:${e.err.message}`).join("\n"));
        }
      };
      this.assertionChains = assertionChains;
      this._globalKey = globalKey;
      this._globalOptions = globalOptions;
      assertionQueues[globalKey] = /* @__PURE__ */ new Map();
    }
    get globalKey() {
      return this._globalKey;
    }
    set master(master) {
      this._master = master;
    }
    get master() {
      return this._master;
    }
    get state() {
      return this._state;
    }
    wrapFn(fn, name, processors) {
      return ((...args) => {
        const eventBus = getEventBus(args);
        const convertedArgs = processors?.argsConverter ? processors.argsConverter(args) : args;
        if (processors?.pre)
          processors.pre(this.state, convertedArgs);
        const deepCloneOpts = {
          result: false,
          args: false,
          ...this._globalOptions?.deepClone || {},
          ...processors?.deepClone || {}
        };
        const argsClone = deepCloneOpts.args ? deepClone(convertedArgs) : convertedArgs;
        if (!this.state)
          throw new Error("State is not initialized. The top function wrapper may not be executing");
        const parentId = this.state.callStack[this.state.callStack.length - 1] ?? -1;
        let funcIndex = parentId + 1;
        const queueIndex = this.state.queueIndex;
        this.state.queueIndex++;
        this.state.callStack.push(funcIndex);
        const branchCount = this.state.branchCounter.get(parentId) || 0;
        this.state.branchCounter.set(parentId, branchCount + 1);
        let eventUUID;
        if (eventBus) {
          eventUUID = crypto.randomUUID().toString();
          for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (typeof arg === "object" && "eventUUID" in arg) {
              args[i] = { ...arg, eventUUID };
              break;
            }
          }
        }
        const result = fn(...args);
        this.state.callStack.pop();
        function processResult(result2) {
          const convertedResult = processors?.resultConverter ? processors.resultConverter(result2, args) : result2;
          const resultClone = deepCloneOpts.result ? deepClone(convertedResult) : convertedResult;
          return resultClone;
        }
        const isAsync = fn.constructor.name === "AsyncFunction";
        const finalResult = isAsync ? result : processResult(result);
        const id = processors?.getId ? processors.getId(args, result) : "";
        const snapshot = processors?.getSnapshot ? processors.getSnapshot(this.state, args, result) : this._globalOptions?.getSnapshot ? this._globalOptions.getSnapshot(this.state, args, result) : void 0;
        const assertionData = {
          state: this.state,
          funcIndex,
          result: finalResult,
          name,
          id,
          branchCount,
          args: argsClone,
          snapshot,
          eventBus,
          eventUUID,
          postOp: () => {
          }
        };
        if (fn.constructor.name === "AsyncFunction") {
          result.then((r) => assertionData.result = processResult(r));
        }
        if (processors?.post) {
          assertionData.postOp = (state, args2, result2) => {
            processors.post(state, args2, result2);
          };
        }
        assertionQueues[this.globalKey].set(queueIndex, assertionData);
        return isAsync ? result : result;
      });
    }
    wrapAll() {
    }
    reset() {
      const assertionQueue = assertionQueues[this.globalKey];
      assertionQueue.clear();
    }
    setQueue(queue) {
      assertionQueues[this.globalKey] = queue;
    }
    getQueue() {
      return getQueue(this.globalKey);
    }
    setQueueFromArray(queue) {
      assertionQueues[this.globalKey] = new Map(queue);
    }
    runPostOps() {
      const assertionQueue = assertionQueues[this.globalKey];
      const queueIndexes = Array.from(assertionQueue.keys()).sort((a, b) => a - b);
      for (const queueIndex of queueIndexes) {
        const value = assertionQueue.get(queueIndex);
        value.state = { ...value.state };
        if (value.eventBus && value.eventUUID) {
          const events = value.eventBus.getEventsForUUID(value.eventUUID);
          for (const event of events) {
            event.state = value.state;
          }
        }
        if (value.postOp)
          value.postOp(this.state, value.args, value.result);
      }
    }
    wrapTopFn(fn, name, options) {
      return (...args) => {
        this.resetState();
        const wrappedFn = this.wrapFn(fn, name, options);
        const result = wrappedFn(...args);
        this.state.master = this.master;
        this.runPostOps();
        return result;
      };
    }
  };
  function getQueue(globalKey) {
    if (!assertionQueues[globalKey])
      throw Error(`Assertion queue for ${globalKey} not found`);
    return assertionQueues[globalKey];
  }
  function printMaster(master) {
    if (!master)
      return "";
    if (master.index !== void 0 && master.step !== void 0)
      return `Master ${master.index}, step ${master.step}`;
    else if (master.index !== void 0)
      return `Master ${master.index}`;
    else
      return "";
  }
  var dist_default = AssertionMaster;

  // src/index.types.ts
  var STYLE_RULE_TYPE = 1;
  var MEDIA_RULE_TYPE = 4;

  // src/utils/stringHelpers.ts
  function splitBySpaces(value) {
    let depth = 0;
    let currentValue = "";
    const result = [];
    for (const char of value) {
      if (char === " ") {
        if (depth === 0) {
          result.push(currentValue);
          currentValue = "";
        } else {
          currentValue += char;
        }
      } else {
        if (char === "(") {
          depth++;
        } else if (char === ")") {
          depth--;
        }
        currentValue += char;
      }
    }
    if (currentValue) {
      result.push(currentValue);
    }
    return result;
  }

  // src/parsing/serialization/docClone.ts
  var _state;
  var DocClone = class {
    constructor(state) {
      this.sheets = [];
      __privateAdd(this, _state);
      __privateSet(this, _state, state);
    }
    get state() {
      return __privateGet(this, _state);
    }
    addSheet() {
      const sheet = new SheetClone(__privateGet(this, _state));
      this.sheets.push(sheet);
      return sheet;
    }
  };
  _state = new WeakMap();
  var _state2;
  var SheetClone = class {
    constructor(state) {
      this.rules = [];
      __privateAdd(this, _state2);
      __privateSet(this, _state2, state);
    }
    get state() {
      return __privateGet(this, _state2);
    }
    addStyleRule() {
      const rule = new StyleRuleClone(__privateGet(this, _state2));
      this.rules.push(rule);
      return rule;
    }
    addMediaRule() {
      const rule = new MediaRuleClone(__privateGet(this, _state2));
      this.rules.push(rule);
      return rule;
    }
  };
  _state2 = new WeakMap();
  var _state3;
  var RuleClone = class {
    constructor(type, state) {
      __privateAdd(this, _state3);
      this.type = type;
      __privateSet(this, _state3, state);
    }
    get state() {
      return __privateGet(this, _state3);
    }
  };
  _state3 = new WeakMap();
  var StyleRuleClone = class extends RuleClone {
    constructor(state) {
      super(STYLE_RULE_TYPE, state);
      this.selector = "";
      this.style = {};
      this.specialProperties = {};
    }
  };
  var MediaRuleClone = class extends RuleClone {
    constructor(state) {
      super(MEDIA_RULE_TYPE, state);
      this.minWidth = 0;
      this.rules = [];
    }
    addStyleRule() {
      const rule = new StyleRuleClone(this.state);
      this.rules.push(rule);
      return rule;
    }
  };

  // src/parsing/serialization/docClonerConsts.ts
  var FLUID_PROPERTY_NAMES = /* @__PURE__ */ new Set([
    "font-size",
    "line-height",
    "letter-spacing",
    "word-spacing",
    "text-indent",
    "width",
    "min-width",
    "max-width",
    "height",
    "min-height",
    "max-height",
    "grid-template-columns",
    "grid-template-rows",
    "background-position-x",
    "background-position-y",
    "padding",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "margin",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
    "border-radius",
    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-right-radius",
    "border-bottom-left-radius",
    "gap",
    "column-gap",
    "row-gap",
    "--fluid-bg-size",
    "top",
    "left",
    "right",
    "bottom",
    "object-position"
  ]);
  var SHORTHAND_PROPERTIES = {
    padding: /* @__PURE__ */ new Map([
      [
        1,
        /* @__PURE__ */ new Map([
          [0, ["padding-top", "padding-right", "padding-bottom", "padding-left"]]
        ])
      ],
      [
        2,
        /* @__PURE__ */ new Map([
          [0, ["padding-top", "padding-bottom"]],
          [1, ["padding-right", "padding-left"]]
        ])
      ],
      [
        3,
        /* @__PURE__ */ new Map([
          [0, ["padding-top"]],
          [1, ["padding-right", "padding-left"]],
          [2, ["padding-bottom"]]
        ])
      ],
      [
        4,
        /* @__PURE__ */ new Map([
          [0, ["padding-top"]],
          [1, ["padding-right"]],
          [2, ["padding-bottom"]],
          [3, ["padding-left"]]
        ])
      ]
    ]),
    margin: /* @__PURE__ */ new Map([
      [
        1,
        /* @__PURE__ */ new Map([
          [0, ["margin-top", "margin-right", "margin-bottom", "margin-left"]]
        ])
      ],
      [
        2,
        /* @__PURE__ */ new Map([
          [0, ["margin-top", "margin-bottom"]],
          [1, ["margin-right", "margin-left"]]
        ])
      ],
      [
        3,
        /* @__PURE__ */ new Map([
          [0, ["margin-top"]],
          [1, ["margin-right", "margin-left"]],
          [2, ["margin-bottom"]]
        ])
      ],
      [
        4,
        /* @__PURE__ */ new Map([
          [0, ["margin-top"]],
          [1, ["margin-right"]],
          [2, ["margin-bottom"]],
          [3, ["margin-left"]]
        ])
      ]
    ]),
    border: /* @__PURE__ */ new Map([
      [
        1,
        /* @__PURE__ */ new Map([
          [0, ["border-top", "border-right", "border-bottom", "border-left"]]
        ])
      ],
      [
        2,
        /* @__PURE__ */ new Map([
          [0, ["border-top", "border-bottom"]],
          [1, ["border-right", "border-left"]]
        ])
      ],
      [
        3,
        /* @__PURE__ */ new Map([
          [0, ["border-top"]],
          [1, ["border-right", "border-left"]],
          [2, ["border-bottom"]]
        ])
      ],
      [
        4,
        /* @__PURE__ */ new Map([
          [0, ["border-top"]],
          [1, ["border-right"]],
          [2, ["border-bottom"]],
          [3, ["border-left"]]
        ])
      ]
    ]),
    "border-radius": /* @__PURE__ */ new Map([
      [
        1,
        /* @__PURE__ */ new Map([
          [
            0,
            [
              "border-top-left-radius",
              "border-top-right-radius",
              "border-bottom-right-radius",
              "border-bottom-left-radius"
            ]
          ]
        ])
      ],
      [
        2,
        /* @__PURE__ */ new Map([
          [0, ["border-top-left-radius", "border-bottom-right-radius"]],
          [1, ["border-top-right-radius", "border-bottom-left-radius"]]
        ])
      ],
      [
        3,
        /* @__PURE__ */ new Map([
          [0, ["border-top-left-radius"]],
          [1, ["border-top-right-radius", "border-bottom-left-radius"]],
          [2, ["border-bottom-right-radius"]]
        ])
      ],
      [
        4,
        /* @__PURE__ */ new Map([
          [0, ["border-top-left-radius"]],
          [1, ["border-top-right-radius"]],
          [2, ["border-bottom-right-radius"]],
          [3, ["border-bottom-left-radius"]]
        ])
      ]
    ]),
    gap: /* @__PURE__ */ new Map([[1, /* @__PURE__ */ new Map([[0, ["column-gap", "row-gap"]]])]]),
    "background-position": /* @__PURE__ */ new Map([
      [2, /* @__PURE__ */ new Map([[0, ["background-position-x", "background-position-y"]]])]
    ])
  };
  var SPECIAL_PROPERTIES = /* @__PURE__ */ new Set([
    "--lock",
    "--force",
    "--span-start",
    "--span-end"
  ]);
  var EXPLICIT_PROPS_FOR_SHORTHAND = /* @__PURE__ */ new Map([
    [
      "padding",
      ["padding-top", "padding-right", "padding-bottom", "padding-left"]
    ],
    ["margin", ["margin-top", "margin-right", "margin-bottom", "margin-left"]],
    ["border", ["border-top", "border-right", "border-bottom", "border-left"]],
    [
      "border-radius",
      [
        "border-top-left-radius",
        "border-top-right-radius",
        "border-bottom-right-radius",
        "border-bottom-left-radius"
      ]
    ],
    ["gap", ["column-gap", "row-gap"]],
    ["background-position", ["background-position-x", "background-position-y"]]
  ]);

  // src/parsing/serialization/docCloner.ts
  var cloneDoc = (doc, ctx) => {
    const docClone = new DocClone(ctx);
    const accessibleSheets = getAccessibleSheets(doc);
    for (const sheet of accessibleSheets) {
      const sheetClone = new SheetClone(ctx);
      sheetClone.rules = cloneRules(sheet.cssRules, ctx);
      docClone.sheets.push(sheetClone);
    }
    return docClone;
  };
  var getAccessibleSheets = (doc) => {
    return Array.from(doc.styleSheets).filter((sheet) => {
      try {
        const rules = sheet.cssRules;
        return rules ? true : false;
      } catch (error) {
        return false;
      }
    });
  };
  var cloneRules = (rules, ctx) => {
    const result = Array.from(rules).map((rule) => cloneRule(rule, ctx)).filter((rule) => rule !== null);
    return result;
  };
  var cloneRule = (rule, ctx) => {
    const { event } = ctx;
    let result = null;
    let type = null;
    if (rule.type === STYLE_RULE_TYPE) {
      type = STYLE_RULE_TYPE;
      result = cloneStyleRule(rule, ctx);
    } else if (rule.type === MEDIA_RULE_TYPE) {
      type = MEDIA_RULE_TYPE;
      result = cloneMediaRule(rule, ctx);
    }
    if (event) {
      if (result) event.emit("ruleCloned", ctx, { result });
      else {
        event.emit("ruleOmitted", ctx, {
          why: type ? "nullResult" : "unsupportedRuleType"
        });
      }
    }
    return result;
  };
  var cloneStyleRule = (styleRule, ctx) => {
    const { event } = ctx;
    const styleRuleClone = new StyleRuleClone(ctx);
    styleRuleClone.selector = normalizeSelector(styleRule.selectorText);
    let propsState = {
      style: {},
      specialProps: {}
    };
    for (let i = 0; i < styleRule.style.length; i++) {
      const prop = styleRule.style[i];
      propsState = cloneProp(styleRule, prop, { ...ctx, propsState });
    }
    const { style, specialProps } = propsState;
    if (Object.keys(style).length <= 0 && Object.keys(specialProps).length <= 0) {
      event?.emit("styleRuleOmitted", ctx, {
        why: "noStyleOrSpecialProps"
      });
      return null;
    }
    styleRuleClone.style = style;
    styleRuleClone.specialProperties = specialProps;
    event?.emit("styleRuleCloned", ctx, { result: styleRuleClone });
    return styleRuleClone;
  };
  var cloneProp = (styleRule, prop, ctx) => {
    const { isBrowser, event } = ctx;
    let { propsState } = ctx;
    let { style, specialProps } = propsState;
    if (FLUID_PROPERTY_NAMES.has(prop)) {
      const shorthandMap = SHORTHAND_PROPERTIES[prop];
      if (shorthandMap) {
        if (isBrowser) {
          event?.emit("propOmitted", ctx, {
            why: "browserHandlesShorthands"
          });
          return propsState;
        }
        style = { ...style };
        const values = splitBySpaces(styleRule.style.getPropertyValue(prop));
        const valuesCount = values.length;
        const innerShorthandMap = shorthandMap.get(valuesCount);
        for (const [index, value] of values.entries()) {
          const valueMap = innerShorthandMap.get(index);
          for (const valueProp of valueMap) {
            style[valueProp] = normalizeZero(value);
          }
        }
        event?.emit("shorthandExpanded", ctx, { style });
        return { style, specialProps };
      }
      style = { ...style };
      style[prop] = normalizeZero(styleRule.style.getPropertyValue(prop));
      event?.emit("fluidPropCloned", ctx, { prop, value: style[prop] });
      return { style, specialProps };
    } else if (SPECIAL_PROPERTIES.has(prop)) {
      specialProps = { ...specialProps };
      specialProps[prop] = styleRule.style.getPropertyValue(prop);
      event?.emit("specialPropCloned", ctx, { prop, value: specialProps[prop] });
      return { style, specialProps };
    }
    event?.emit("propOmitted", ctx, { prop, why: "notFluidOrSpecial" });
    return propsState;
  };
  var cloneMediaRule = (mediaRule, ctx) => {
    const { event } = ctx;
    const mediaRuleClone = new MediaRuleClone(ctx);
    const match = mediaRule.media.mediaText.match(/\(min-width:\s*(\d+)px\)/);
    if (match) {
      mediaRuleClone.minWidth = Number(match[1]);
      mediaRuleClone.rules = cloneRules(mediaRule.cssRules, ctx).filter(
        (rule) => rule.type === STYLE_RULE_TYPE
      );
      event?.emit("mediaRuleCloned", ctx, { result: mediaRuleClone });
      return mediaRuleClone;
    }
    event?.emit("mediaRuleOmitted", ctx, {
      why: "noMinWidth"
    });
    return null;
  };
  function normalizeZero(input) {
    return input.replace(
      /(?<![\d.])0+(?:\.0+)?(?![\d.])(?!(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc)\b)/g,
      "0px"
    );
  }
  function normalizeSelector(selector) {
    return selector.replace(/\*::(before|after)\b/g, "::$1").replace(/\s*,\s*/g, ", ").replace(/\s+/g, " ").trim();
  }
  function wrap(cloneDocWrapped, getAccessibleSheetsWrapped, cloneRulesWrapped, cloneRuleWrapped, cloneStyleRuleWrapped, cloneMediaRuleWrapped, clonePropWrapped) {
    cloneDoc = cloneDocWrapped;
    getAccessibleSheets = getAccessibleSheetsWrapped;
    cloneRules = cloneRulesWrapped;
    cloneRule = cloneRuleWrapped;
    cloneStyleRule = cloneStyleRuleWrapped;
    cloneMediaRule = cloneMediaRuleWrapped;
    cloneProp = clonePropWrapped;
  }

  // test/parsing/serialization/docClonerController.ts
  function findRules(doc, index) {
    const counter = new AbsCounter(index);
    for (const sheet of doc.sheets) {
      if (counter.match()) return sheet.rules;
      for (const rule of sheet.rules.filter(
        (rule2) => rule2.type === MEDIA_RULE_TYPE
      )) {
        const mediaRule = rule;
        if (counter.match()) return mediaRule.rules;
      }
    }
    return [];
  }
  function findRule(doc, index) {
    const counter = new AbsCounter(index);
    for (const sheet of doc.sheets) {
      for (const rule of sheet.rules) {
        if (counter.match()) return rule;
        if (rule.type === MEDIA_RULE_TYPE) {
          const mediaRule = rule;
          for (const styleRule of mediaRule.rules) {
            if (counter.match()) return styleRule;
          }
        }
      }
    }
    return null;
  }
  function findStyleRule(doc, index) {
    const counter = new AbsCounter(index);
    for (const sheet of doc.sheets) {
      for (const rule of sheet.rules) {
        if (rule.type === STYLE_RULE_TYPE) {
          if (counter.match()) return rule;
        } else if (rule.type === MEDIA_RULE_TYPE) {
          const mediaRule = rule;
          for (const styleRule of mediaRule.rules) {
            if (counter.match()) return styleRule;
          }
        }
      }
    }
    return null;
  }
  function findMediaRule(doc, index) {
    const counter = new AbsCounter(index);
    for (const sheet of doc.sheets) {
      for (const rule of sheet.rules) {
        if (rule.type === MEDIA_RULE_TYPE) {
          if (counter.match()) return rule;
        }
      }
    }
    return null;
  }

  // test/parsing/serialization/docClonerGoldSight.ts
  var expect;
  if (false) {
    expect = null.expect;
  }
  var cloneDocAssertionChain = {
    "should clone the document": (state, args, result) => {
      expect(result).toEqual(state.master.docClone);
    }
  };
  var getAccessibleSheetsAssertionChain = {
    "should get the accessible sheets": (state, args, result) => {
      expect(result.length).toBe(state.master.docClone.sheets.length);
    }
  };
  var cloneRulesAssertionChain = {
    "should clone the rules": (state, args, result) => {
      expect(result).toEqual(
        findRules(state.master.docClone, state.rulesIndex)
      );
    }
  };
  var cloneRuleAssertionChain = {
    "should clone the rule": (state, args, result) => withEventNames(args, ["ruleCloned", "ruleOmitted"], (events) => {
      if (events.ruleCloned) {
        expect(result).toEqual(
          findRule(state.master.docClone, state.ruleIndex)
        );
      } else if (events.ruleOmitted) {
        if (events.ruleOmitted.payload.why === "nullResult" || events.ruleOmitted.payload.why === "unsupportedRuleType") {
          expect(result).toBeNull();
        }
      } else {
        throw Error("Unexpected event route");
      }
    })
  };
  var cloneStyleRuleAssertionChain = {
    "should clone the style rule": (state, args, result) => withEventNames(args, ["styleRuleCloned", "styleRuleOmitted"], (events) => {
      if (events.styleRuleCloned) {
        expect(result).toEqual(
          findStyleRule(state.master.docClone, state.styleRuleIndex)
        );
      } else if (events.styleRuleOmitted) {
        expect(result).toBeNull();
      } else {
        throw Error("Unexpected event route");
      }
    })
  };
  var cloneMediaRuleAssertionChain = {
    "should clone the media rule": (state, args, result) => withEventNames(args, ["mediaRuleCloned", "mediaRuleOmitted"], (events) => {
      if (events.mediaRuleCloned) {
        expect(result).toEqual(
          findMediaRule(state.master.docClone, state.mediaRuleIndex)
        );
      } else if (events.mediaRuleOmitted) {
        expect(result).toBeNull();
      } else {
        throw Error("Unexpected event route");
      }
    })
  };
  var clonePropAssertionChain = {
    "should clone the prop": (state, args, result) => withEventNames(
      args,
      [
        "fluidPropCloned",
        "shorthandExpanded",
        "specialPropCloned",
        "propOmitted"
      ],
      (events) => {
        const [, prop, ctx] = args;
        const { propsState } = ctx;
        const masterRule = findStyleRule(
          state.master.docClone,
          state.styleRuleIndex - 1
        );
        if (events.fluidPropCloned) {
          expect(result.style[prop]).toBe(masterRule.style[prop]);
        } else if (events.shorthandExpanded) {
          const explicitProps = EXPLICIT_PROPS_FOR_SHORTHAND.get(prop);
          for (const explicitProp of explicitProps) {
            expect(result.style[explicitProp]).toBe(
              masterRule.style[explicitProp]
            );
          }
        } else if (events.specialPropCloned) {
          expect(result.specialProps[prop]).toBe(
            masterRule.specialProperties[prop]
          );
        } else if (events.propOmitted) {
          if (events.propOmitted.payload.why === "notFluidOrSpecial" || events.propOmitted.payload.why === "browserHandlesShorthands")
            expect(result).toBe(propsState);
        } else {
          throw Error("Unexpected event route");
        }
      }
    )
  };
  var defaultAssertions = {
    cloneDoc: cloneDocAssertionChain,
    getAccessibleSheets: getAccessibleSheetsAssertionChain,
    cloneRules: cloneRulesAssertionChain,
    cloneRule: cloneRuleAssertionChain,
    cloneStyleRule: cloneStyleRuleAssertionChain,
    cloneMediaRule: cloneMediaRuleAssertionChain,
    cloneProp: clonePropAssertionChain
  };
  var DocClonerAssertionMaster = class extends dist_default {
    constructor() {
      super(defaultAssertions, "cloneDoc");
      this.cloneDoc = this.wrapTopFn(cloneDoc, "cloneDoc");
      this.getAccessibleSheets = this.wrapFn(getAccessibleSheets, "getAccessibleSheets");
      this.cloneRules = this.wrapFn(cloneRules, "cloneRules", {
        post: (state) => {
          state.rulesIndex++;
        }
      });
      this.cloneRule = this.wrapFn(cloneRule, "cloneRule", {
        post: (state, args) => withEventNames(args, ["ruleCloned", "ruleOmitted"], (events) => {
          if (events.ruleCloned) {
            state.ruleIndex++;
          }
        })
      });
      this.cloneStyleRule = this.wrapFn(cloneStyleRule, "cloneStyleRule", {
        post: (state, args) => withEventNames(
          args,
          ["styleRuleCloned", "styleRuleOmitted"],
          (events) => {
            if (events.styleRuleCloned) {
              state.styleRuleIndex++;
            }
          }
        )
      });
      this.cloneMediaRule = this.wrapFn(cloneMediaRule, "cloneMediaRule", {
        post: (state, args) => withEventNames(
          args,
          ["mediaRuleCloned", "mediaRuleOmitted"],
          (events) => {
            if (events.mediaRuleCloned) {
              state.mediaRuleIndex++;
            }
          }
        )
      });
      this.cloneProp = this.wrapFn(cloneProp, "cloneProp");
    }
    newState() {
      return {
        rulesIndex: 0,
        ruleIndex: 0,
        styleRuleIndex: 0,
        mediaRuleIndex: 0
      };
    }
  };
  var docClonerAssertionMaster = new DocClonerAssertionMaster();
  function wrapAll() {
    wrap(
      docClonerAssertionMaster.cloneDoc,
      docClonerAssertionMaster.getAccessibleSheets,
      docClonerAssertionMaster.cloneRules,
      docClonerAssertionMaster.cloneRule,
      docClonerAssertionMaster.cloneStyleRule,
      docClonerAssertionMaster.cloneMediaRule,
      docClonerAssertionMaster.cloneProp
    );
  }

  // bundle/src/bundle.ts
  wrapAll();
  return __toCommonJS(bundle_exports);
})();
