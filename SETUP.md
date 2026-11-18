# Put your portfolio on GitHub

## First deployment

1. Extract `dinuka-portfolio.zip` on your computer.
2. Sign in to [GitHub](https://github.com/new).
3. Create a **public** repository named **dinuka0987.github.io**.
4. Upload the extracted files into the repository root, keeping folders intact. `index.html` must be at the root. Include the `assets` directory.
5. For the simplest deployment, open **Settings → Pages**. Choose **Deploy from a branch**, branch **main**, folder **/(root)**, then **Save**.
6. Wait for the Pages deployment to finish. GitHub will display the published address in Settings → Pages. The expected address is **https://dinuka0987.github.io/**.

If you include the provided `.github/workflows/pages.yml` workflow, choose **GitHub Actions** as the Pages source instead. Run **Deploy portfolio to GitHub Pages** from Actions if necessary. See README.md for details. Use one deployment method.

## Make updates later

Open **https://dinuka0987.github.io/editor.html** after publication.

- Select your featured projects and order them.
- Add certificates: enter title and issuer, and select your PDF or image.
- Select a replacement resume PDF.
- Download `content.json` and any new asset files using the buttons.
- Replace `content.json` in the GitHub repository root. Upload the resume to `assets/Dinuka_Dilshan_Resume.pdf` and certificates to `assets/certificates/`.
- Commit your changes. GitHub Pages publishes the update.

The editor prepares downloads locally; your GitHub commit is what publishes them. There is no public admin password or remote write endpoint.

## Before sharing

The included resume is the exact PDF you supplied. Its project section contains an unfinished placeholder; replace that PDF with your completed resume before sending the portfolio to employers.

Certificates can be displayed, but none were supplied or listed in the resume. Upload them with the editor when ready.

## Profile photo

Open `editor.html`, choose a JPG, PNG, or WebP portrait, and download the prepared image and updated `content.json`. Upload the image to the indicated `assets/profile-photo` path and replace `content.json` in the repository root. Commit both files. The photo replaces the diagram in the hero section. Until a photo is supplied, the diagram remains visible. The editor's Remove profile photo button restores the diagram after publishing the updated content.
