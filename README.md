# Dinuka Dilshan — portfolio

A responsive landing page in HTML, CSS, and vanilla JavaScript. No package installation, paid hosting, database, or secret keys required. Includes seven projects verified against public GitHub repositories, filters, featured ordering, skills, education, contact links, certificates, and a downloadable resume.

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
- Projects: edit the `projects` list in `content.json`. Each entry uses `repo`, `name`, `description`, `category` (`Security`, `Mobile`, `Web`, or `Software`), `tags`, and `visual` (`scanner`, `balance`, `volt`, `planner`, `card`, `java`, or `list`). Projects are a curated snapshot, not a live API feed; add future repositories here.
- Styling: edit `styles.css`. Google Fonts are optional; system fonts work if offline.
- Decorative project previews are explicitly labeled illustrations, not actual app screenshots.

## Content notes

The supplied resume is included unchanged. It contains a placeholder under Academic & Personal Projects; replace it with a finished PDF before sharing it with employers. The website itself does not reproduce this placeholder. No certificates were listed in the resume and no certificate files were provided, so none are claimed. LinkedIn was inaccessible to automated retrieval; its link is included, with no unverified credentials imported. Networking is presented as an interest/foundation rather than an unverified completed networking project. Credit Card Checker is identified as an educational simulation.

## Profile photo

Open `editor.html`, choose a JPG, PNG, or WebP portrait, and download the prepared image and updated `content.json`. Upload the image to the indicated `assets/profile-photo` path and replace `content.json` in the repository root. Commit both files. The photo replaces the diagram in the hero section. Until a photo is supplied, the diagram remains visible. The editor's Remove profile photo button restores the diagram after publishing the updated content.
