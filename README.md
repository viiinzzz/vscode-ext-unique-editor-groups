# Unique Editor Groups

A small VS Code extension that redirects a newly activated duplicate file editor
to the editor group that already displays that file.

## Behavior

- Detects duplicate resources across visible editor groups.
- Returns focus to the already-visible editor group.
- Closes the newly activated duplicate when its document is not dirty.
- Never automatically closes an editor whose document has unsaved changes.
  In that case, it focuses the existing editor and (by default) displays a warning.
- Adds a status-bar toggle: **Unique Groups: On/Off**.

## Install

1. Unzip the project.
2. In VS Code, open this folder.
3. Press `F5` to launch an Extension Development Host and test it.
4. To install permanently, package the folder as a VSIX using `@vscode/vsce`:
   `npx @vscode/vsce package --allow-missing-repository --allow-star-activation`
5. In your normal VS Code window, run **Extensions: Install from VSIX...**
   and select the generated `.vsix` file.

## Settings

- `uniqueEditorGroups.enabled` (default `true`)
- `uniqueEditorGroups.warnOnDirtyDuplicate` (default `true`)

## Tests

Run `npm test` (requires Node.js). The tests cover duplicate-resource detection.
They do not simulate VS Code's full editor UI; please validate the live behavior
in an Extension Development Host before relying on it in a critical workflow.

## API limitation

VS Code extensions do not expose a universal pre-open interception hook for
every editor-opening path. This extension detects a duplicate after it becomes
active and redirects focus. Some special editors (such as custom webview
editors), untitled documents, and unusual extension-driven open flows may behave
differently.
