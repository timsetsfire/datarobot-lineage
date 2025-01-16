// const container = document.getElementById('network');
// made a changes
var edges = null;
var nodes = null;
var subEdges = null;
var subNodes = null;
var visibleNodes = []

var nodesFilter = (node) => {
  return visibleNodes.includes(node.id)
};
const edgesFilter = (edge) => { 
  return true 
}

var nodesDataset = new vis.DataSet(nodes)
var edgesDataset = new vis.DataSet(edges)
var nodesView = new vis.DataView(nodesDataset, { filter: nodesFilter });
var edgesView = new vis.DataView(edgesDataset, { filter: edgesFilter });
const dataView = {edges: edgesView, nodes: nodesView}


var container = document.getElementById("network");
// container.innerText = "Give us a moment while we grab your use cases from DataRobot"
var data = {edges: edges, nodes: nodes}

const artifactList = document.getElementById("artifact-list") 

const useCasesDropdown = document.getElementById('use-cases'); // Replace 'myuseCasesDropdown' with the ID of your useCasesDropdown
const useCasesRet = await fetch("getUseCases")
const useCases = await useCasesRet.json()
if (useCases.length > 0) { 
  for (const useCase of useCases) {
    const option = document.createElement('option');
    option.value = useCase.id; // Assuming your JSON has a 'value' field
    option.text = useCase.name;  // Assuming your JSON has a 'text' field
    useCasesDropdown.appendChild(option);
  }
}

document.querySelectorAll('.list-item').forEach(item => {
  item.addEventListener('click', function (e) {
      const nestedList = this.querySelector('.nested-list');
      if (nestedList && nestedList.contains(e.target)) {
          // If a nested-list item is clicked
          const clickedItem = e.target;
            const value = clickedItem.getAttribute('value');
            if (value) {
                alert(`Value: ${value}`);
            }
      } else if (nestedList) {
          // If a parent list-item with a nested list is clicked
          e.stopPropagation(); // Prevent event propagation
          nestedList.style.display = nestedList.style.display === 'block' ? 'none' : 'block';
      } else {
          // Leaf node without nested list
          console.log('what did the five fingers say to the face!');
      }
  });
});

var apiConfigured = false
const configureApi = document.getElementById("configure-api")
configureApi.onclick = function () { 
  apiConfigured = !apiConfigured 
  const title = document.getElementById("configure-api-title")
  const token = document.getElementById("api-token")
  const tokenLabel = document.getElementById("api-token-label")
  const endpoint = document.getElementById("endpoint")
  const endpointLabel = document.getElementById("endpoint-label")
  console.log(`api title ${title.innerText}`)
  title.innerText = apiConfigured ? "API Configuration" : ""
  token.style.display = apiConfigured ? "" : "none"
  tokenLabel.style.display = apiConfigured ? "" : "none"
  endpoint.style.display = apiConfigured ? "" : "none"
  endpointLabel.style.display = apiConfigured ? "" : "none"

}

var grabUseCases = document.getElementById("get-use-cases")
grabUseCases.onclick = function () { 
  container.innerText = "Grabbing your use cases from DataRobot.  This might take a minute"
  const token = document.getElementById("api-token")
  // token.style.display = "none"
  const tokenLabel = document.getElementById("api-token-label")
  // tokenLabel.style.display = "none"
  const endpoint = document.getElementById("endpoint")
  const endpointLabel = document.getElementById("endpoint-label")
  // endpoint.style.display = "none"
  // endpointLabel.style.display = "none"
  console.log(`endpoint => ${endpoint.value}`)
  const data = JSON.stringify( {
    token:token.value, 
      endpoint:endpoint.value
  })
  fetch("datarobotAuth", {
    headers: {'Content-Type': "application/json"},
    method: 'POST',
    body: data,
    redirect: "follow"}).then(
      (response) => response.json()
    ).then(
      (useCases) => {
        useCasesDropdown.options.length = 0;
        for (const useCase of useCases) {
          const option = document.createElement('option');
          option.value = useCase.id; // Assuming your JSON has a 'value' field
          option.text = useCase.name;  // Assuming your JSON has a 'text' field
          useCasesDropdown.appendChild(option);
        }
        container.innerText = "Select a use case from the drop down box"
        console.log(useCases)
      }
    ).catch(
      (error) => {
        container.innerText = `${error}\nThere was a problem fetching your use cases.  are you sure you provded the correct api token and endpoint?`
        console.error("there was a problem")
      }
    );
};

const resetGraph = document.getElementById("reset-button")
resetGraph.onclick = function () { 
  draw(true)
}

var directedGraphToggleOn = false
const directedGraphToggle = document.getElementById("directed-graph-toggle")
directedGraphToggle.onclick = function () { 
  directedGraphToggleOn = ! directedGraphToggleOn
  console.log(`value of toggle is ${directedGraphToggleOn}`)
  btnUD.style.display = directedGraphToggleOn ? "" : "none"
  btnDU.style.display = directedGraphToggleOn ? "" : "none"
  btnLR.style.display = directedGraphToggleOn ? "" : "none"
  btnRL.style.display = directedGraphToggleOn ? "" : "none"
  draw(false)
}

var directionInput = document.getElementById("direction");
var btnUD = document.getElementById("btn-UD");
btnUD.onclick = function () {
  directionInput.value = "UD";
  draw();
};
var btnDU = document.getElementById("btn-DU");
btnDU.onclick = function () {
  directionInput.value = "DU";
  draw();
};
var btnLR = document.getElementById("btn-LR");
btnLR.onclick = function () {
  directionInput.value = "LR";
  draw();
};
var btnRL = document.getElementById("btn-RL");
btnRL.onclick = function () {
  directionInput.value = "RL";
  draw();
};

function draw(resetFilter = true) { 
  var container = document.getElementById("network")
  var options = graphOptions()
  console.log("options in draw function")
  console.log(options)
  var data = {
    nodes: nodes, 
    edges: edges
  }
  if (resetFilter) {
    for(let i = 0; i < nodes.length; i++){
      visibleNodes.push(nodes[i].id)
    }
  } 
  
  edgesDataset = new vis.DataSet(edges)
  nodesDataset = new vis.DataSet(nodes)
  console.log(`edge dataset1`)
  console.log(edgesDataset.get()[0])
  console.log(`nodes dataset1`)
  console.log(nodesDataset.get()[0])
  edgesView = new vis.DataView(edgesDataset, { filter: edgesFilter })
  nodesView = new vis.DataView(nodesDataset, { filter: nodesFilter })
  var network = new vis.Network(container, {nodes: nodesView, edges: edgesView}, options);

  network.on('click', function (event) {
    const { nodes: selectedNodes } = event;
    const node = nodes.filter(n => n.id == selectedNodes)[0];
    if (selectedNodes.length > 0) {
      const nodeInfo = [];
      nodeInfo.push(`<strong>Node Details</strong> <br>`)
      const keys = Object.keys(node)
      for (let i = 0; i < keys.length; i++) {
        let k = keys[i]
        if (k === "url") { 
          nodeInfo.push(`<strong>${k}</strong><p><a href="${node[k]}">see asset in Datarobot</a> </p> <br>`)
        } else if (k == "parents") {
          nodeInfo.push(`<strong>parents</strong><pre id="json">${JSON.stringify(node[k], null, 2)}</pre> <br>`)
        } else {
          nodeInfo.push(`<strong>${k}</strong><p>${node[k]}</p> <br>`)
        }
      }
      sideBarContent.innerHTML = nodeInfo.join(``)
      sideBarContent.appendChild(emailInput);
      sideBarContent.appendChild(shareButton);
    }
  })

  network.on('doubleClick', function (event) {
    const { nodes: selectedNodes } = event;
    console.log(`checking edges in double clikc`)
    let edgeList = edgesDataset.get()
    console.log(edgeList)
    console.log(`checking selected node id ${selectedNodes[0]}`)
    console.log(`visible nodes before update`)
    console.log(visibleNodes)
    for(let i = 0; i <= edgeList.length; i++){
      let currentEdge = edgeList[i]
      if (currentEdge) { 
        // console.log(`viewing edge and keys ${i}`)
        // console.log(currentEdge)
        // console.log(`viewing edge from ${currentEdge.from || "no-id"}`)
        // console.log(`viewing edge to ${currentEdge.to || "no-id" }`)
        if (selectedNodes[0] == edgeList[i].from){
          visibleNodes.push(edgeList[i].to)
        } else if (selectedNodes[0] == edgeList[i].to) {
          visibleNodes.push(edgeList[i].from)
        } else {
          console.log("no match found")
        }
      } else { 
        console.log("edge appears to be undefined")
      }

    }
    console.log(`visible nodes after update`)
    console.log(visibleNodes)
    nodesView.refresh()
    edgesView.refresh()
    console.log("nodeView was refreshed")
    console.log("looking at ALL nodes")
    console.log(nodes)

  })
  console.log("graph should be visible")
  console.log(network)
}


function drawSubgraph(id) { 
  subEdges = []
  subNodes = []
  var container = document.getElementById("network")
  var options = graphOptions()
  visibleNodes.length = 0
  for( let i = 0; i < edges.length; i++) {
    if( edges[i].from == id || edges[i].to == id) {
      visibleNodes.push(edges[i].from)
      visibleNodes.push(edges[i].to)
    }
  }

  // nodesView.refresh()
  draw(false)
}

function graphOptions() { 
  if (! directedGraphToggleOn) { 
    return {
      nodes: { shape: 'dot', size: 20 },
      edges: {
      smooth: true,
      arrows: { to: true },
    },
    }}
  else { 
    return { 
      autoResize: false, 
      nodes: { shape: 'dot', size: 20 },
      edges: {
        smooth: {
          type: "cubicBezier",
          forceDirection:
            directionInput.value == "UD" || directionInput.value == "DU"
              ? "vertical"
              : "horizontal",
            roundness: 0.5
        },
        arrows: { to: true },
      },
        layout: {
          hierarchical: {
            direction: directionInput.value,
            sortMethod: "directed",
            shakeTowards: "roots"
          },
        }
      }
    }
}

async function updateGraph() {
  console.log("updating graph!")
  const retNodes = await fetch("getNodes",{mode: 'no-cors'})
  const retEdges = await fetch("getEdges",{mode: 'no-cors'})
  nodes = await retNodes.json()
  edges = await retEdges.json()
  console.log("nodes and edges retrieved")
  console.log(nodes)
  console.log(edges)
  draw()
  updateArtifactList()
}

console.log("network data")
console.log(network)


useCasesDropdown.addEventListener("change", () => {
  const h2Title = document.getElementById("title")
  const selectedValue = useCasesDropdown.value;
  h2Title.innerText = `Graph of Use Case ${useCasesDropdown.options[useCasesDropdown.selectedIndex].innerHTML}`
  console.log(`attempting to graph graph use case id ${selectedValue}`)
  document.getElementById("artifact-list").innerHTML = ""
  container.innerText = "Updating Graph - this might take a minute"
  sideBarContent.innerHTML = "Select a node to see its detials!!"
  fetch(`useCases/${selectedValue}`).then(response => {
    console.log(`useCases/${selectedValue}`)
    console.log("use case graph has been retrieved")
    console.log(response)
    container.innerText = "Done.  Hang tight while we populate the drop down box"
    return response.status
  }
  ).then(resp => { 
    console.log("checking response from graph update request")
    console.log(resp)
    console.log("nodes and edges have been updated") 
    if (resp == 200) {
      updateGraph()
    } else {
      container.innerText = "Something unexpected happened.  check logs"
    }
  })
}
)

function updateArtifactList() {
  var artifacts = {}
  for( let i = 0; i < nodes.length; i++) {
      var node = nodes[i]
      var nodeType = node["label"]
      var nodeName = node.name || `${nodeType}-${node.assetId}`
      if ( artifacts[nodeType]) {
          artifacts[nodeType].push(node)
      } else {
          artifacts[nodeType] = [node]
      }
  }
  const artifactList = document.getElementById("artifact-list") 
  const htmlString = []
  for (const k of Object.keys(artifacts)) { 
    htmlString.push(`<li class="list-item">${k}`)
    htmlString.push(`<ul class="nested-list">`)
    for( node of artifacts[k]) {
        const name = node.name || `${node.label}-${node.id}`
        htmlString.push(`<li class="list-item" value=${node.id}>${name}`)
    }
    htmlString.push(`</ul>`)
    htmlString.push(`</li>`)
  }
  const htmlFinalString = htmlString.join(``)
  artifactList.innerHTML = htmlFinalString

  document.querySelectorAll('.list-item').forEach(item => {
    item.addEventListener('click', function (e) {
        const nestedList = this.querySelector('.nested-list');
        if (nestedList && nestedList.contains(e.target)) {
            // If a nested-list item is clicked
            const clickedItem = e.target;
              const value = clickedItem.getAttribute('value');
              if (value) {
                  // alert(`Value: ${value}`);
                  drawSubgraph(value)
              }
        } else if (nestedList) {
            // If a parent list-item with a nested list is clicked
            e.stopPropagation(); // Prevent event propagation
            nestedList.style.display = nestedList.style.display === 'block' ? 'none' : 'block';
        } else {
            // Leaf node without nested list
            console.log('what did the five fingers say to the face!');
        }
    });
  })
// document.querySelectorAll('.list-item').forEach(item => {
//   item.addEventListener('click', function (e) {
//       const nestedList = this.querySelector('.nested-list');
//       console.log(nestedList)
//       if (nestedList) {
//           console.log("looking at nest list")
//           console.log(nestedList)
//           e.stopPropagation();
//           nestedList.style.display = nestedList.style.display === 'block' ? 'none' : 'block';
//       } else {
//         alert("Surprise")
//       }
//   });
// });
// document.querySelectorAll('.list-item').forEach(item => {
//   item.addEventListener('click', function (e) {
//       const nestedList = this.querySelector('.nested-list');
//       if (nestedList && nestedList.contains(e.target)) {
//           // If a nested-list item is clicked
//           alert('Surprise!');
//       } else if (nestedList) {
//           // If a parent list-item with a nested list is clicked
//           e.stopPropagation(); // Prevent event propagation
//           nestedList.style.display = nestedList.style.display === 'block' ? 'none' : 'block';
//       } else {
//           // Leaf node without nested list
//           alert('Surprise!');
//       }
//   });
// });

}






const sidebar = document.getElementById("sidebar")
const sideBarContent = document.getElementById("sidebar-content")
// Create a text box (input element)
const emailInput = document.createElement('input');
emailInput.type = 'email'; // Ensure the input is for emails
emailInput.placeholder = 'Enter email'; // Add placeholder text
emailInput.id = 'emailInput'; // Optional: Set an ID for the input

// Create a button
const shareButton = document.createElement('button');
shareButton.textContent = 'Share Node Asset and Parents (not working)'; // Set the button text

// Append the input and button to the container


// Add an event listener to the button
shareButton.addEventListener('click', () => {
  const email = emailInput.value; // Get the email from the input
  if (email) {
    alert(`Node asset and parents shared with ${email}`); // Replace with your desired action
  } else {
    alert('Please enter a valid email.');
  }
});

;

