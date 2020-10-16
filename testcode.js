// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
var TokenType2;
(function (TokenType2) {
    TokenType2[TokenType2["Font"] = 1] = "Font";
    TokenType2[TokenType2["Color"] = 2] = "Color";
})(TokenType2 || (TokenType2 = {}));
let nodesWithStyles2 = {};
var colorStyleArray = [];
var textStyleArray = [];
function checkNodeForStyles(node) {
    // Fill style. The token name is currently embedded in the node name.
    if (node.fillStyleId != undefined && node.fillStyleId != "") {
        colorStyleArray.push({ "nodeId": node.id, "value": extractTokenNameFromNodeName(node.name) });
    }
    // Text style. The font token name is currently in the style description.
    if (node.textStyleId != undefined && node.textStyleId != "") {
        textStyleArray.push({ "nodeId": node.id, "value": figma.getStyleById(node.textStyleId).description });
    }
}
function extractTokenNameFromNodeName(text) {
    let colorTokenId = "[token:";
    let tokenValue = text;
    let verifyString = text.toLowerCase();
    let foundIndex = verifyString.indexOf(colorTokenId);
    if (verifyString.includes(colorTokenId)) {
        tokenValue = tokenValue.slice(foundIndex + colorTokenId.length);
        tokenValue = tokenValue.replace(']', '');
        tokenValue = tokenValue.replace(' ', '');
    }
    else {
        tokenValue = "No token id found";
    }
    return tokenValue;
}
function traverse(node) {
    checkNodeForStyles(node);
    if ("children" in node) {
        for (const child of node.children) {
            traverse(child);
        }
    }
}
// START
// Loading fonts
figma.loadFontAsync({ family: "Consolas", style: "Regular" }).then(initSuccess, initFailure);
function initSuccess() {
    // Go through the all the nodes in the current selection
    for (const node of figma.currentPage.selection) {
        traverse(node);
    }
    nodesWithStyles2.ColorStyles = colorStyleArray;
    nodesWithStyles2.TextStyles = textStyleArray;
    // Send nodes with styles to the UI
    figma.ui.postMessage(nodesWithStyles2);
}
function initFailure() {
    console.log("Required fonts failed to load. Exit.");
}
// -------------------Events from the UI ------------------------------
function createAnnotation2(type) {
    var component = figma.currentPage.findOne(n => n.name === "Token Annotation / Typography");
    if (component != undefined) {
        var instance = component.createInstance();
        instance.name = "Font annotation";
        return instance;
    }
}
figma.ui.onmessage = msg => {
    if (msg.type === 'create-typography-annotation-all') {
        const nodes = [];
        nodesWithStyles2.TextStyles.forEach(element => {
            const annotationInstance = createAnnotation2(TokenType2.Font);
            if (annotationInstance) {
                // set data
                var label = annotationInstance.findOne(n => n.type === "TEXT");
                label.characters = element.value;
                figma.currentPage.appendChild(annotationInstance);
                nodes.push(annotationInstance);
            }
            else {
                // @TODO: create a fallback annotation style
                console.log("Error: No annotation instance found");
            }
        });
        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);
    }
};
// start the traversal at the root
//figma.closePlugin()
