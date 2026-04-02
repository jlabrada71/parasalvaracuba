sudo docker compose  -f compose-dev.yml watch

sudo docker build -t brainstorm:1.0.0 .
sudo docker login
sudo docker images
sudo docker tag brainstorm:1.0.0 jlabrada/brainstorm:1.0.0
sudo docker push jlabrada/brainstorm:1.0.0
