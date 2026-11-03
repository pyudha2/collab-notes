import assert from "node:assert/strict";
import { join, leave, online } from "./presence";

join("a", "yudha", "1");
join("a", "yudha", "2");
join("a", "budi", "3");
assert.deepEqual(online("a"), ["yudha", "budi"]);
leave("a", "yudha", "1");
assert.deepEqual(online("a"), ["yudha", "budi"]);
leave("a", "yudha", "2");
assert.deepEqual(online("a"), ["budi"]);
leave("a", "budi", "3");
assert.deepEqual(online("a"), []);
assert.deepEqual(online("none"), []);
console.log("ok");
