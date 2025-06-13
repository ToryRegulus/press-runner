# Press Runner

This is the README for your extension "Press Runner". After writing up a brief description, we recommend including the following sections.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Usages

Bind your preferred shortcut to the extension command using either method below:

### Option 1: For Vim Keybindings

If you use the [VSCodeVim extension](https://marketplace.visualstudio.com/items?itemName=vscodevim.vim), add this to your `settings.json`:

```json
{
    "vim.normalModeKeyBindingsNonRecursive": [
        {
            "before": ["<leader>", "r"],  // Customize your preferred key combo
            "commands": ["press-runner.run"]
        }
    ]
}
```

### Option 2: Standard VSCode Keybinding

Alternatively, add this to your `keybindings.json`:

```json
[
    {
        "key": "ctrl+r",  // Customize your preferred shortcut
        "command": "press-runner.run",
        "when": "editorTextFocus"
    }
]
```

> **Tips**:  
>
> - Replace the key combinations with your preferred shortcuts
> - Use VSCode's command palette (`Ctrl+Shift+P`) to quickly open these files:
>   - "Preferences: Open Settings (JSON)"
>   - "Preferences: Open Keyboard Shortcuts (JSON)"

## Extension Configuration

Customize command execution by language in your `settings.json`:

```json
{
    "press-runner.commandsMap": {
        "python": {
            "commands": {
                "plugin": "python.execInDedicatedTerminal",
                "terminal": "python ${fileName}"
            },
            "useTerminal": "auto"
        },
        "c": {
            "commands": {
                "plugin": "cmake.launchTarget",
                "terminal": "cd ${dir} && gcc ${fileName} -o ${fileNameWithoutExt} && ${dir}${fileNameWithoutExt}"
            },
            "useTerminal": "auto"
        },
        "cpp": {
            "commands": {
                "plugin": "cmake.launchTarget",
                "terminal": "cd ${dir} && g++ ${fileName} -o ${fileNameWithoutExt} && ${dir}${fileNameWithoutExt}"
            },
            "useTerminal": "auto"
        }
    }
}
```

## Change Log

View the full [Change Log](https://github.com/ToryRegulus/press-runner/blob/main/CHANGELOG.md) on GitHub.
