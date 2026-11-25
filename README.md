# Dinuka Dilshan — portfolio

A responsive landing page in HTML, CSS, and vanilla JavaScript. No package installation, paid hosting, database, or secret keys required. Automatically loads public projects from GitHub, filters, featured ordering, skills, education, contact links, certificates, and a downloadable resume.

## Preview locally

Serve this folder with any static HTTP server. For example, with Python installed:

```sh
python -m http.server 4173 --bind 127.0.0.1
```

Visit http://127.0.0.1:4173. Use a server: opening index.html directly as a file can prevent loading content.json.

## Publish on GitHub Pages

1. Sign in to GitHub as `dinuka0987`.
2. Create a public repository named `dinuka0987.github.io` for your main portfolio address. This name was not present among the public repositories inspected during creation. Do not overwrite an existing repository if you already have one.
3. Upload the contents of this folder into the repository root. Include `assets` and `.github/workflows/pages.yml`, preserving their paths. Do not upload the enclosing `portfolio` directory or the ZIP itself.
4. In repository Settings → Pages → Build and deployment, set Source to **GitHub Actions**.
5. Open Actions → Deploy portfolio to GitHub Pages → Run workflow if a deployment has not started. Wait for the workflow to succeed.
6. Your expected URL is https://dinuka0987.github.io/; it is live only after GitHub reports a successful deployment.

The workflow deploys only the public website files. Subsequent commits to `main` redeploy automatically. A project repository with another name also works because all local asset links are relative; its address will include the repository name.

Alternative without workflows: upload the page files and assets, then choose **Deploy from a branch**, `main`, `/(root)` in Settings → Pages. The included `.nojekyll` disables Jekyll processing.

Official guidance: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site and https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Pin projects, upload certificates, and update the resume

Open `/editor.html` on your hosted site (or locally at http://127.0.0.1:4173/editor.html).

- **Pin projects:** select the projects you want featured and adjust their order. Download `content.json`, then replace the file in your repository root and commit. Featured projects appear first with a badge; visitors can filter them.
- **Resume:** choose a new PDF in the editor. Download the prepared resume and replace `assets/Dinuka_Dilshan_Resume.pdf` in the repository. Its stable filename keeps all download links current. A resume replacement alone does not require changing content.json.
- **Certificates:** add a title, issuer, optional date and verification link, and PDF/image. Download `content.json` plus every prepared file. Upload certificate files into `assets/certificates/`, upload `content.json` at the root, and commit. Use distinct filenames for different certificates.

The editor has no remote write access. It creates downloads on your device; GitHub sign-in and a repository commit are required to publish. Visitors cannot modify the website through it. Existing certificate files can be reused by entering their paths. To remove a certificate, remove its entry and download/commit the updated content.json.

## Other edits

- Biography, skills, education, and contact: edit `index.html`.
- Projects: edit the `projects` list in `content.json`. Each entry uses `repo`, `name`, `description`, `category` (`Security`, `Mobile`, `Web`, or `Software`), `tags`, and `visual` (`scanner`, `balance`, `volt`, `planner`, `card`, `java`, or `list`). These entries provide optional presentation overrides and a fallback snapshot; new public repositories are discovered automatically.
- Styling: edit `styles.css`. Google Fonts are optional; system fonts work if offline.
- Decorative project previews are explicitly labeled illustrations, not actual app screenshots.

## Content notes

The supplied resume is included unchanged. It contains a placeholder under Academic & Personal Projects; replace it with a finished PDF before sharing it with employers. The website itself does not reproduce this placeholder. No certificates were listed in the resume and no certificate files were provided, so none are claimed. LinkedIn was inaccessible to automated retrieval; its link is included, with no unverified credentials imported. Networking is presented as an interest/foundation rather than an unverified completed networking project. Credit Card Checker is identified as an educational simulation.

## Profile photo

Open `editor.html`, choose a JPG, PNG, or WebP portrait, and download the prepared image and updated `content.json`. Upload the image to the indicated `assets/profile-photo` path and replace `content.json` in the repository root. Commit both files. The photo replaces the diagram in the hero section. Until a photo is supplied, the diagram remains visible. The editor's Remove profile photo button restores the diagram after publishing the updated content.

## Automatic GitHub projects

The project section loads all public repositories owned by `dinuka0987` on every page visit and refreshes every five minutes while the tab is visible. Pagination includes repositories beyond the first 100. New repositories require no portfolio edit or redeployment after this fix is installed. Private repositories are never displayed. Forks and archived public repositories are included unless excluded below.

Featured projects retain the order in `featured`; other projects show newest-created first. Existing custom names, descriptions, categories, and illustrations are preserved. Newly discovered projects use their GitHub descriptions, language, and topics; categories are inferred and can be overridden in `content.json`. Set a repository description on GitHub for useful automatic summaries.

The editor also discovers new repositories, so you can pin them immediately. To hide a repository, add its exact name to `github.excludeRepos` in `content.json`. An empty array includes every public repository.

No token or credentials are embedded in the page. If GitHub is offline or rate-limits requests, visitors see their last successfully loaded list, or the bundled project snapshot on a first visit. A status message identifies this fallback. The next scheduled refresh retries. Never put a GitHub token in browser code.

Deploy `github-projects.js` together with both HTML files, app.js, editor.js, content.json, and the updated workflow. The workflow explicitly includes this shared script. Tests: `node --test tests/github-projects.test.cjs`.

## Soft UI component guide

The reference skin uses warm cream, deep teal, raised surfaces and inset controls. All design tokens live in the **first `:root` block of `styles.css`**. The existing token names (`--bg`, `--panel`, `--green`, etc.) remain supported. The skin is appended after the existing component rules, without changing layout grids, routes or section order.

### Components used by the portfolio

| Component | Location and usage |
| --- | --- |
| Primary and secondary buttons | Existing `.button.primary` / `.button.secondary` links and buttons. Native `disabled` uses muted beige; use the actual `disabled` attribute for buttons. All links keep their destinations. |
| Pressed/loading state | `:active` adds an inset shadow. Set `aria-busy="true"` on a real asynchronous action's button and show its actual loading label, such as `Sending...`; a spinner is generated in CSS. Clear it when the operation finishes. No fake contact submission was added to the existing email link. |
| Checkboxes and text fields | Existing editor controls use native input behavior, teal focus rings, inset surfaces and disabled styling. Existing required/URL validation now adds `aria-invalid`, an associated inline error and red boundary. `.ui-helper` provides supplementary helper text. |
| Filter tabs | Existing `.filters` buttons retain their `role="group"` and `aria-pressed` semantics, since these filter a collection rather than change tab panels. Active filters use a raised surface. Tab and Space/Enter work natively. |
| Cards and badges | Existing `.project-card`, `.project-link`, `.tags span` and `.featured-label` hooks receive the new skin. Existing descriptions, tags, featured order and certificate links are unchanged. |
| Tooltip | The hero GitHub link has a labelled, hoverable `role="tooltip"`. Hover/focus opens it; Escape dismisses it. `.ui-tooltip-trigger` contains `.ui-tooltip`; associate them with `aria-describedby`. |
| Skeleton and spinner | Initial placeholders live inside the existing project grid and are hidden from assistive technology. The grid and loading status use `aria-busy`; existing project loading replaces them. |
| Empty state | An empty project filter displays its existing message with a new `Clear Filters` button. It invokes the original All work filter. |
| Confirmation modal | Existing editor removal buttons open `#ui-confirm-dialog`. Cancel and Escape preserve the item; Delete calls the existing local removal handler. Native dialog focus containment is retained and focus returns to the relevant editor control. This does not delete files from GitHub. |
| Toast stack and alert banner | Existing editor status messages drive up to three success/info/error toasts. The same message remains in the persistent `#editor-status` banner. Only the toast stack announces it, avoiding duplicate live-region announcements. Toasts disappear after six seconds. |
| Icons | `.ui-icon` uses inline SVG with a 24-unit viewBox, 2px rounded strokes and teal color. `data-size="16"` or `"20"` selects smaller sizes. Decorative icons use `aria-hidden="true"`. |

### Reusable patterns, intentionally not mounted

The current site has no table, multi-page collection, multi-step form, team list, settings toggle or percentage setting. The following **CSS patterns** are provided in the existing stylesheet for future real content; no unrelated widgets, fake team members, or new workflows were introduced. Their application behavior must be wired to real data when used.

| Pattern | Minimal usage |
| --- | --- |
| Surface / elevation | `.ui-surface` with `data-layer="raised"`, `"inset"`, or `"pressed"`; optionally `data-elevation="1"` through `"5"`. Default surface is flat. |
| Radio | Native `<input type="radio" name="choice">` inside labelled controls; group options in a fieldset with a legend. Native arrow-key selection is preserved. |
| Switch | `<input type="checkbox" class="ui-switch" role="switch" aria-label="Your real setting">`. Set `checked` for on; native Space toggles it. Persist only through the setting's actual handler. |
| Percentage slider | `.ui-range` containing a labelled native `<input type="range" min="0" max="100" value="75">` and `<output>75%</output>`. The editor's existing input enhancement updates the floating output and `aria-valuetext` on input; initialize the output to the input value. Set `--range-value:75%` on the wrapper for initial placement. |
| True tabs | `.ui-tabs` on a `role="tablist"` and labelled tab buttons with `aria-selected`, `aria-controls` and associated panels. CSS gives the active tab its raised state. Consumers must implement roving focus, arrow keys and panel visibility; the portfolio filters intentionally remain filter buttons. |
| Breadcrumbs | A labelled navigation containing an ordered list with `.ui-breadcrumbs`; mark the final item `aria-current="page"`. |
| Pagination | A labelled `.ui-pagination` navigation with Prev / numbered / Next buttons. `aria-current="page"` gives the active number a teal fill. Wire real pagination and disable unavailable actions; do not hide existing projects merely to show this pattern. |
| Four-step indicator | An ordered `.ui-stepper` with four list items and `aria-current="step"` on the current one. Use the tooltip pattern for a `Current Step` explanation. This is a visual indicator, not an added wizard. |
| Avatar list / group | `.ui-list-item` with an image `.ui-avatar`, title and description; `.ui-avatar-group` groups supplied images and `data-active="true"` adds the teal ring. Use meaningful image alt text; don't invent people. |
| New / Beta / count badge | `.ui-badge`, optionally `data-tone="primary"`, around the real status or count. Include the meaning of numeric counts in the accessible label. |
| Compact sortable header | `.ui-table` with semantic `th` cells, `scope="col"`, `aria-sort` and a labelled button in sortable headers. CSS styles the header; actual sorting and updating `aria-sort` belong to the table's real data handler. |
| Linear progress | A labelled native `<progress class="ui-progress" max="100" value="50">50%</progress>` plus a visible percentage. Feed real progress values; no synthetic upload or GitHub sync percentage is shown. |
| Standalone spinner | `<span class="ui-spinner" aria-hidden="true"></span>` beside a textual `role="status"` label for a real pending operation. |

Button state examples (patterns only):

```html
<button class="button primary">Submit Now</button>
<button class="button primary" aria-busy="true" disabled>Sending...</button>
<button class="button primary" disabled>Not Available</button>
```

Use busy without disabled if the action must remain focusable, and guard repeated activation in its real handler. `aria-disabled` alone does not disable links: use a native button or suppress navigation explicitly in the owning handler. No existing portfolio link is disabled.

All transitions are 150-250ms. Continuous loading animations stop under `prefers-reduced-motion`; loading text remains visible. Forced-color mode retains control boundaries. Contrast regression checks cover text, muted text, teal, errors, disabled labels and control borders. Run `node --test tests/github-projects.test.cjs`.

### File-by-file change record

- `styles.css`: central tokens and in-place soft UI component skin, reusable patterns, focus/reduced-motion/forced-color rules.
- `index.html`: theme-color, stylesheet/app cache versions, one supplementary tooltip, project loading placeholders and busy attributes inside existing hooks.
- `app.js`: loading ARIA state, empty-filter recovery and tooltip dismissal; GitHub loading, sorting and filtering logic unchanged.
- `editor.html`: stylesheet/script cache versions, banner class, toast live region and one native confirmation dialog.
- `editor.js`: confirmation wrappers around existing removal actions, status-driven notifications, native validation presentation and optional range presentation.
- `tests/github-projects.test.cjs`: ARIA-state assertions and contrast regression checks alongside existing GitHub-sync tests.
- `README.md`: this guide. No source files created, renamed, moved or deleted; no dependencies or build configuration changed.
