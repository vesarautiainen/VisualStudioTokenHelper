// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

enum TokenType2 {
  Font = 1,
  Color
}

let nodesWithStyles2: NodesWithStyles2 = {};
var colorStyleArray = [];
var textStyleArray = [];

interface NodesWithStyles2 {
  ColorStyles?: any,
  TextStyles?: any
}

function checkNodeForStyles(node) {
  // Fill style. The token name is currently embedded in the node name.
  if (node.fillStyleId != undefined && node.fillStyleId != "" && node.visible) {
    colorStyleArray.push({"nodeId": node.id, "value": extractTokenNameFromNodeName(node.name)})
  }
    // Text style. The font token name is currently in the style description.
  if (node.textStyleId != undefined && node.textStyleId != "" && node.visible) {
    textStyleArray.push({"nodeId": node.id, "value": figma.getStyleById(node.textStyleId).description})
  }
}

function extractTokenNameFromNodeName(text: string):string {
  let colorTokenId = "[token:";
  let tokenValue = text;
  let verifyString = text.toLowerCase();
  let foundIndex = verifyString.indexOf(colorTokenId);

  if (verifyString.includes(colorTokenId)) {
    tokenValue = tokenValue.slice(foundIndex + colorTokenId.length)
    tokenValue = tokenValue.replace(']', '');
    tokenValue = tokenValue.replace(' ', '');
  } else {
    tokenValue = "No token id found"
  }
  return tokenValue;
}

function traverse(node) {
  checkNodeForStyles(node)
  if ("children" in node) {
    for (const child of node.children) {
      traverse(child)    
    }
  }
}

// START

// Loading fonts
figma.loadFontAsync({family: "Consolas", style: "Regular"}).then(initSuccess, initFailure)

function initSuccess() {

  // Go through the all the nodes in the current selection
  for (const node of figma.currentPage.selection) {
    traverse(node) 
  }

  nodesWithStyles2.ColorStyles = colorStyleArray;
  nodesWithStyles2.TextStyles = textStyleArray;

  // Send nodes with styles to the UI
  figma.ui.postMessage(nodesWithStyles2);
}

function initFailure() {
  console.log("Required fonts failed to load. Exit.")
}



// -------------------Events from the UI ------------------------------
function createAnnotation2(type: TokenType2):InstanceNode {
  var component : ComponentNode;
  var instanceName : string;
  if (type == TokenType2.Font) {
    component = <ComponentNode>figma.currentPage.findOne(n => n.name === "Token Annotation / Typography")
    instanceName = "Font Annotation";  
  } else {
    component = <ComponentNode>figma.currentPage.findOne(n => n.name === "Token Annotation / Color")
    instanceName = "Color Token Annotation";  
  }
  if (component != undefined) {
    var instance:InstanceNode = component.createInstance();
    instance.name = instanceName;  
    return instance;
  } else {
    console.log("Error: Could not creat annotation instance")
  }
}

figma.ui.onmessage = msg => {

  if (msg.type === 'create-color-annotation-all') {
    const nodes: SceneNode[] = [];
    nodesWithStyles2.ColorStyles.forEach(element => {
      const annotationInstance = createAnnotation2(TokenType2.Color);
      if (annotationInstance) {
        // set data
        var label = <TextNode>annotationInstance.findOne(n => n.type === "TEXT")
        label.characters = "Color Token: " + element.value

        // find the original node and set the annotation label position
        let originalNode = <TextNode>figma.getNodeById(element.nodeId);
        console.log(originalNode.absoluteTransform)
        let xOrigin = originalNode.absoluteTransform[0][2]
        let yOrigin = originalNode.absoluteTransform[1][2]
        annotationInstance.resize(annotationInstance.width,randomInteger(30,150))
        let xPos = xOrigin - annotationInstance.width / 2 + originalNode.width / 2;
        let yPos = yOrigin - annotationInstance.height + originalNode.height / 2;
        annotationInstance.relativeTransform = [[1, 0, xPos],[0, 1, yPos]];
  
        figma.currentPage.appendChild(annotationInstance);
        nodes.push(annotationInstance);
      } else {
        // @TODO: create a fallback annotation style
        console.log("Error: No annotation instance found")
      }
      
    });
  }

  if (msg.type === 'create-typography-annotation-all') {
    const nodes: SceneNode[] = [];

    nodesWithStyles2.TextStyles.forEach(element => {
      const annotationInstance = createAnnotation2(TokenType2.Font);
      if (annotationInstance) {
        // set data
        var label = <TextNode>annotationInstance.findOne(n => n.type === "TEXT")
        label.characters = "Font Token: " + element.value

        // find the original node and set the annotation label position
        let originalNode = <TextNode>figma.getNodeById(element.nodeId);
        console.log(originalNode.absoluteTransform)
        let xOrigin = originalNode.absoluteTransform[0][2]
        let yOrigin = originalNode.absoluteTransform[1][2]
        let xPos = xOrigin - annotationInstance.width / 2 + originalNode.width / 2;
        let yPos = yOrigin + originalNode.height / 2;
        annotationInstance.relativeTransform = [[1, 0, xPos],[0, 1, yPos]];
  
        figma.currentPage.appendChild(annotationInstance);
        nodes.push(annotationInstance);
      } else {
        // @TODO: create a fallback annotation style
        console.log("Error: No annotation instance found")
      }
    });
    
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
    
  }

}
  
function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// start the traversal at the root
//figma.closePlugin()
