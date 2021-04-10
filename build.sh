# #!/bin/bash
# build the build for public url 
npm run build
# make sure to add dist 
git add build -f

# commit the GH pages changes 
git commit -m "gh-pages commit"
# push to subtree remote 
git subtree push --prefix build origin build
