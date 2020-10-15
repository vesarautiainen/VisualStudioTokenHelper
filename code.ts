// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

enum TokenType {
  Font = 1,
  Color
}

function TokenItem(type: TokenType, value: string) {
  this.type = type;
  this.value = value;
}




// @TODO: When you find an item with a text style or color style add it to the structure 
// (add reference to the corresponding item so you can find it easily with that)

// @TODO: Pass the structure to the UI layer and show the structure to the user

// @TODO: Hover over a token item and show it on the page

// @TODO: Button to create a token for an item

// @TODO: Button to create all typography tokens

// @TODO: Return the same structure filtered to items the user wants to add

// @TODO: Create annotation instances of the selected tokens, inject correct data

// @TODO: Place the annotation instances to the correct location


let nodesWithStyles = {};

interface NodesWithStyles {
  ColorStyles?: any,
  TextStyles?: any
}

let nodes: NodesWithStyles = {};
// Go through the whole subtree of item from the selection
for (const node of figma.currentPage.selection) {
  if (node.type == "INSTANCE" || node.type == "GROUP" || node.type == "FRAME") {
    // Find all nodes with fill style and add to the array
    nodes.ColorStyles = node.findAll(n => 
      n.type == "RECTANGLE" && n.fillStyleId !== figma.mixed ||
      n.type == "TEXT" && n.fillStyleId !== ""
      );

    // Find all nodes with text style and add to the array
    nodes.TextStyles = node.findAll(n => n.type == "TEXT" && n.textStyleId !== "");
    
    // Handle the nodes with styles to the UI to show
    figma.ui.postMessage(nodes);

    // for (const child of node.children) {
    //   if (child.type == "RECTANGLE") {
    //     let styleId = child.fillStyleId
    //     if (styleId !== figma.mixed) {
    //       console.log(figma.getStyleById(styleId).description)
    //       figma.ui.postMessage(figma.getStyleById(styleId).description)
    //     }
    //   }
    // } 
  }
}


function createAnnotation(type: TokenType):InstanceNode {
  var component = <ComponentNode>figma.currentPage.findOne(n => n.name === "Token Annotation / Typography")
  if (component != undefined) {
    var instance:InstanceNode = component.createInstance();
    instance.name = "Font annotation";  
    return instance;
  }
}

figma.ui.onmessage = msg => {

  if (msg.type === 'create-typography-annotation-all') {
    const nodes: SceneNode[] = [];

    const annotation = createAnnotation(TokenType.Font);
    if (annotation) {
      figma.currentPage.appendChild(annotation);
      nodes.push(annotation);
      figma.currentPage.selection = nodes;
      figma.viewport.scrollAndZoomIntoView(nodes);
    } else {
      // @TODO: create a fallback annotation style
      console.log("Error: No annotation instance found")
    }

  }
  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  //figma.closePlugin();
};
