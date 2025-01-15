## DataRobot Lineage Viewer

This is a first take at an application that allows you to view dependency graphs for DataRobot Use Cases.  
[lineage](./app.png)

## Build
```
docker build -t lineage-app .
docker run --publish 8080:8080 lineage-app   
```
## Use
Tbe go to localhost:8080 to view the app.  You'll need to provide your api token and endpoint to retrieve and view your use cases.  