sudo docker compose  -f compose-dev.yml up

sudo docker login
sudo docker images

export VERSION=1.1.0
sudo docker build -t brainstorm:$VERSION .
sudo docker tag brainstorm:$VERSION jlabrada/brainstorm:$VERSION
sudo docker push jlabrada/brainstorm:$VERSION