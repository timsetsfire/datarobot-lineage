// const container = document.getElementById('network');
// made a changes
var edges = null;
var nodes = null;
var container = document.getElementById("network");
// container.innerText = "Give us a moment while we grab your use cases from DataRobot"
var data = {edges: edges, nodes: nodes}


const grabUseCases = document.getElementById("grabUseCases")
const dropdown = document.getElementById('myDropdown'); // Replace 'myDropdown' with the ID of your dropdown
// const dropdownInit = document.createElement('option')
// dropdown.appendChild(dropdownInit)
const useCasesRet = await fetch("getUseCases")
const useCases = await useCasesRet.json()
if (useCases.length > 0) { 
  for (const useCase of useCases) {
    const option = document.createElement('option');
    option.value = useCase.id; // Assuming your JSON has a 'value' field
    option.text = useCase.name;  // Assuming your JSON has a 'text' field
    dropdown.appendChild(option);
  }
}

// var useCases = null
// var out  = fetch(datarobotEndpoint + "/user", {
//   method: "GET",
//   headers: { "Authorization": `Bearer ${datarobotToken}` }
// }).then( response => response.json()).then( resp => console.log(resp))

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
        dropdown.options.length = 0;
        for (const useCase of useCases) {
          const option = document.createElement('option');
          option.value = useCase.id; // Assuming your JSON has a 'value' field
          option.text = useCase.name;  // Assuming your JSON has a 'text' field
          dropdown.appendChild(option);
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

var directedGraphToggleOn = false
const directedGraphToggle = document.getElementById("directed-graph-toggle")
directedGraphToggle.onclick = function () { 
  directedGraphToggleOn = ! directedGraphToggleOn
  console.log(`value of toggle is ${directedGraphToggleOn}`)
  btnUD.style.display = directedGraphToggleOn ? "" : "none"
  btnDU.style.display = directedGraphToggleOn ? "" : "none"
  btnLR.style.display = directedGraphToggleOn ? "" : "none"
  btnRL.style.display = directedGraphToggleOn ? "" : "none"
  draw()
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

function draw() { 
  var container = document.getElementById("network")
  var options = graphOptions()
  console.log("options in draw function")
  console.log(options)
  var data = {
    nodes: nodes, 
    edges: edges
  }
  var network = new vis.Network(container, data, options);
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
  console.log("graph should be visible")
  console.log(network)
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
}

console.log("network data")
console.log(network)




dropdown.addEventListener("change", () => {
  const h2Title = document.getElementById("title")
  const selectedValue = dropdown.value;
  h2Title.innerText = `Graph of Use Case ${dropdown.options[dropdown.selectedIndex].innerHTML}`
  console.log(`attempting to graph graph use case id ${selectedValue}`)
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

const sidebar = document.getElementById("sidebar")
const sideBarContent = document.getElementById("sidebar-content")
// Create a text box (input element)
const emailInput = document.createElement('input');
emailInput.type = 'email'; // Ensure the input is for emails
emailInput.placeholder = 'Enter email'; // Add placeholder text
emailInput.id = 'emailInput'; // Optional: Set an ID for the input

// Create a button
const shareButton = document.createElement('button');
shareButton.textContent = 'Share Node Asset and Parents'; // Set the button text

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

