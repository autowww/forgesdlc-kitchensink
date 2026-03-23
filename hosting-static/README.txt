Custom domain verification (Firebase Hosting)
=============================================

When Firebase asks you to verify ks.forgesdlc.com by uploading a file:

1. Click "Download file" in the Firebase Console dialog.
2. Place that file in this directory tree (same filename Firebase shows):

   hosting-static/.well-known/acme-challenge/<PASTE-EXACT-FILENAME-HERE>

3. Run ./scripts/deploy-firebase.sh

The file must be reachable at:

   https://ks.forgesdlc.com/.well-known/acme-challenge/<that-filename>

It is copied into dist/ at deploy time. Remove the file after verification if you like.

Tip: If you prefer not to commit the token file, keep it only locally before deploy.
