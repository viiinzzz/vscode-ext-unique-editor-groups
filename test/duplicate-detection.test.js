const test = require("node:test");
const assert = require("node:assert/strict");
const { findDuplicateEditor } = require("../extension");

function editor(uri, column) {
    return {
        document: { uri: { toString: () => uri } },
        viewColumn: column
    };
}

test("finds an existing editor for the same URI in another group", () => {
    const original = editor("file:///workspace/app.js", 1);
    const active = editor("file:///workspace/app.js", 2);
    assert.equal(findDuplicateEditor(active, [original, active]), original);
});

test("does not treat different files as duplicates", () => {
    const other = editor("file:///workspace/other.js", 1);
    const active = editor("file:///workspace/app.js", 2);
    assert.equal(findDuplicateEditor(active, [other, active]), undefined);
});

test("does not report a duplicate when only the active editor exists", () => {
    const active = editor("file:///workspace/app.js", 1);
    assert.equal(findDuplicateEditor(active, [active]), undefined);
});

test("handles editors without a document URI", () => {
    assert.equal(findDuplicateEditor({}, []), undefined);
});
