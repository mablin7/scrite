"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var faunadb_1 = require("faunadb");
var nanoid_1 = require("nanoid");
var secret = 'fnADonFCZdACAAdB7vblq2-RDhtF3AmtArrD8aEh';
var client;
if (secret) {
    client = new faunadb_1["default"].Client({ secret: secret });
}
exports["default"] = (function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var _a, _b, req_title, _c, content, url, title, is_id_free, error_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 6, , 7]);
                if (!client) {
                    res.status(500).json({ error: 'Database not available' });
                    return [2 /*return*/];
                }
                _a = req.body || {}, _b = _a.req_title, req_title = _b === void 0 ? nanoid_1.nanoid() : _b, _c = _a.content, content = _c === void 0 ? '' : _c;
                url = new URL(req.url, "http://" + req.headers.host);
                if (url.searchParams.has('title'))
                    req_title = url.searchParams.get('title');
                title = void 0, is_id_free = false;
                _d.label = 1;
            case 1:
                title = title ? req_title : nanoid_1.nanoid();
                return [4 /*yield*/, client.query(faunadb_1.query.IsEmpty(faunadb_1.query.Match(faunadb_1.query.Index('notes_by_title'), title)))];
            case 2:
                is_id_free = _d.sent();
                _d.label = 3;
            case 3:
                if (!is_id_free) return [3 /*break*/, 1];
                _d.label = 4;
            case 4: return [4 /*yield*/, client.query(faunadb_1.query.Create(faunadb_1.query.Collection('notes'), { data: { title: title, content: content } }))];
            case 5:
                _d.sent();
                res.json({ title: title });
                return [3 /*break*/, 7];
            case 6:
                error_1 = _d.sent();
                res.status(500).json({ error: error_1 });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
