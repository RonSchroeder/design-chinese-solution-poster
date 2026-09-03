# Chinese Solution Poster Skill

A Codex skill for creating and revising Chinese vertical enterprise solution posters as editable HTML and rendered PNG files. It includes design references, an editable starter canvas, image-generation guidance, and deterministic rendering and QA helpers.

## Install

Ask Codex to install the repository with the built-in skill installer:

```text
$skill-installer Install the skill from https://github.com/RonSchroeder/design-chinese-solution-poster
```

For manual installation, clone it into a user-level skills directory scanned by your Codex setup, for example:

```bash
git clone https://github.com/RonSchroeder/design-chinese-solution-poster.git ~/.agents/skills/design-chinese-solution-poster
```

Some existing Codex desktop installations use `$CODEX_HOME/skills` (commonly `~/.codex/skills`) for personal skills. If Codex does not detect the skill immediately, restart Codex. Local skills are discovered from their `SKILL.md` metadata.

## Use

Invoke the skill explicitly in Codex:

```text
$design-chinese-solution-poster Create a Chinese vertical solution poster from the following material. Deliver editable HTML, PNG, and local assets: ...
```

You can also ask Codex to revise an existing poster and provide the source HTML, latest render, and requested changes.

## Output

The normal deliverables are:

- editable HTML;
- a rendered PNG;
- referenced local image assets;
- a short report of dimensions and unresolved assumptions.

Visible poster copy is Chinese by default. Source-required product names, standards, or acronyms may remain in Latin characters when explicitly marked in the HTML.
