# #!/bin/bash
# build the build for public url 
npm run build

# make sure to add deploy 
git add deploy -f

# commit the GH pages changes 
git commit -m "deploy commit"
# push to subtree remote 
git subtree push --prefix build origin deploy

# remove build directory
sudo rm -rf build

