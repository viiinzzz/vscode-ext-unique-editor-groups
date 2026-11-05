function uriKey(editor) {
    return editor && editor.document && editor.document.uri
        ? editor.document.uri.toString(true)
        : undefined;
}

/**
 * Returns an already-visible editor for the same resource, excluding active.
 * The first visible match is treated as the file's original/owning group.
 */
function findDuplicateEditor(activeEditor, visibleEditors) {
    const key = uriKey(activeEditor);
    if (!key) return undefined;
    return visibleEditors.find(editor =>
        editor !== activeEditor && uriKey(editor) === key
    );
}

function activate(context) {
    const vscode = require("vscode");
    let enabled = vscode.workspace.getConfiguration("uniqueEditorGroups")
        .get("enabled", true);
    let handlingDuplicate = false;

    const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10);
    status.command = "uniqueEditorGroups.toggle";
    status.tooltip = "Toggle Unique Editor Groups";
    const updateStatus = () => {
        status.text = enabled ? "$(files) Unique Groups: On" : "$(files) Unique Groups: Off";
        status.show();
    };
    updateStatus();
    context.subscriptions.push(status);

    context.subscriptions.push(
        vscode.commands.registerCommand("uniqueEditorGroups.toggle", async () => {
            enabled = !enabled;
            await vscode.workspace.getConfiguration("uniqueEditorGroups")
                .update("enabled", enabled, vscode.ConfigurationTarget.Global);
            updateStatus();
            vscode.window.showInformationMessage(
                `Unique Editor Groups ${enabled ? "enabled" : "disabled"}.`
            );
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration("uniqueEditorGroups.enabled")) {
                enabled = vscode.workspace.getConfiguration("uniqueEditorGroups")
                    .get("enabled", true);
                updateStatus();
            }
        })
    );

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(async activeEditor => {
            if (!enabled || handlingDuplicate || !activeEditor) return;

            const existingEditor = findDuplicateEditor(
                activeEditor,
                vscode.window.visibleTextEditors
            );
            if (!existingEditor) return;

            handlingDuplicate = true;
            try {
                // Never close an editor containing unsaved changes.
                if (activeEditor.document.isDirty) {
                    const warn = vscode.workspace.getConfiguration("uniqueEditorGroups")
                        .get("warnOnDirtyDuplicate", true);
                    if (warn) {
                        vscode.window.showWarningMessage(
                            "This file is already open in another editor group. " +
                            "The existing editor was focused; the duplicate was kept because it has unsaved changes."
                        );
                    }
                    await vscode.window.showTextDocument(existingEditor.document, {
                        viewColumn: existingEditor.viewColumn,
                        preserveFocus: false,
                        preview: false
                    });
                    return;
                }

                // Close only the newly activated duplicate, then focus the
                // editor that was already displaying this document.
                await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
                await vscode.window.showTextDocument(existingEditor.document, {
                    viewColumn: existingEditor.viewColumn,
                    preserveFocus: false,
                    preview: false
                });
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Unique Editor Groups could not redirect this file: ${error.message || error}`
                );
            } finally {
                handlingDuplicate = false;
            }
        })
    );
}

function deactivate() {}

module.exports = { activate, deactivate, findDuplicateEditor };
