# SwiftGLB catalog

Public files are in `site/`. They are generated on the server from the WordPress catalog with Simply Static, then published to https://swiftglb.github.io/.

WordPress, the database, and login details stay on the server. This repository only receives the static pages, images, CSS, and JavaScript.

## Publish again

On the server, after products or 3D models change:

```bash
/var/www/form-studio/publish-swiftglb.sh
```

The script exports the site, commits `site/`, pushes `main`, and starts the Pages workflow. Pushing alone does not update the live site; the workflow packages `site/` and deploys it.
