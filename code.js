// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
var TokenType;
(function (TokenType) {
    TokenType[TokenType["Font"] = 1] = "Font";
    TokenType[TokenType["Color"] = 2] = "Color";
})(TokenType || (TokenType = {}));
var ColorTheme;
(function (ColorTheme) {
    ColorTheme[ColorTheme["Blue"] = 1] = "Blue";
    ColorTheme[ColorTheme["Light"] = 2] = "Light";
    ColorTheme[ColorTheme["Dark"] = 3] = "Dark";
})(ColorTheme || (ColorTheme = {}));
let nodesWithStyles = {};
var colorStyleArray = [];
var textStyleArray = [];
function checkNodeForStyles(node) {
    // Fill style. The token name is currently embedded in the node name.
    var values;
    if (node.fillStyleId != undefined && node.fillStyleId != "" && node.visible) {
        colorStyleArray.push({ "nodeId": node.id, "nodeName": extractLayerName(node.name), "value": extractTokenName(node.name) });
    }
    // Text style. The font token name is currently in the style description.
    if (node.textStyleId != undefined && node.textStyleId != "" && node.visible) {
        textStyleArray.push({ "nodeId": node.id, "nodeName": extractLayerName(node.name), "value": figma.getStyleById(node.textStyleId).description });
    }
}
function extractLayerName(text) {
    let colorTokenId = "[token:";
    let layerName = text;
    let verifyString = text.toLowerCase();
    let foundIndex = verifyString.indexOf(colorTokenId);
    return foundIndex ? layerName.slice(0, foundIndex) : layerName;
}
function extractTokenName(text) {
    let colorTokenId = "[token:";
    let tokenValue = text;
    let verifyString = text.toLowerCase();
    let foundIndex = verifyString.indexOf(colorTokenId);
    if (foundIndex && verifyString.includes(colorTokenId)) {
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
    nodesWithStyles.ColorStyles = colorStyleArray;
    nodesWithStyles.TextStyles = textStyleArray;
    // Send nodes with styles to the UI
    figma.ui.postMessage(nodesWithStyles);
}
function initFailure() {
    console.log("Required fonts failed to load. Exit.");
}
// -------------------Events from the UI ------------------------------
function createAnnotation(type) {
    var component;
    var instanceName;
    if (type == TokenType.Font) {
        component = figma.currentPage.findOne(n => n.name === "Token Annotation / Typography");
        instanceName = "Font Annotation";
    }
    else {
        component = figma.currentPage.findOne(n => n.name === "Token Annotation / Color");
        instanceName = "Color Token Annotation";
    }
    if (component != undefined) {
        var instance = component.createInstance();
        instance.name = instanceName;
        return instance;
    }
    else {
        console.log("Error: Could not creat annotation instance");
    }
}
//Commands from the UI 
figma.ui.onmessage = msg => {
    if (msg.type === 'create-color-annotation-all') {
        annotateAllColorTokens();
    }
    else if (msg.type === 'create-typography-annotation-all') {
        annotateAllTypographyTokens();
    }
    else if (msg.type === 'change-theme-version') {
        // @TODO: figure out how to do this theming properly in type script.
        if (msg.themeId == "Dark") {
            changeTheme(ColorTheme.Dark);
        }
    }
};
// Annotate tokens
//------------------------------------------------------
function annotateAllColorTokens() {
    const nodes = [];
    nodesWithStyles.ColorStyles.forEach(element => {
        const annotationInstance = createAnnotation(TokenType.Color);
        if (annotationInstance) {
            // set data
            var label = annotationInstance.findOne(n => n.type === "TEXT");
            label.characters = "Color Token: " + element.value;
            // find the original node and set the annotation label position
            let originalNode = figma.getNodeById(element.nodeId);
            console.log(originalNode.absoluteTransform);
            let xOrigin = originalNode.absoluteTransform[0][2];
            let yOrigin = originalNode.absoluteTransform[1][2];
            annotationInstance.resize(annotationInstance.width, randomInteger(30, 150));
            let xPos = xOrigin - annotationInstance.width / 2 + originalNode.width / 2;
            let yPos = yOrigin - annotationInstance.height + originalNode.height / 2;
            annotationInstance.relativeTransform = [[1, 0, xPos], [0, 1, yPos]];
            figma.currentPage.appendChild(annotationInstance);
            nodes.push(annotationInstance);
        }
        else {
            // @TODO: create a fallback annotation style
            console.log("Error: No annotation instance found");
        }
    });
}
function annotateAllTypographyTokens() {
    const nodes = [];
    nodesWithStyles.TextStyles.forEach(element => {
        const annotationInstance = createAnnotation(TokenType.Font);
        if (annotationInstance) {
            // set data
            var label = annotationInstance.findOne(n => n.type === "TEXT");
            label.characters = "Font Token: " + element.value;
            // find the original node and set the annotation label position
            let originalNode = figma.getNodeById(element.nodeId);
            console.log(originalNode.absoluteTransform);
            let xOrigin = originalNode.absoluteTransform[0][2];
            let yOrigin = originalNode.absoluteTransform[1][2];
            let xPos = xOrigin - annotationInstance.width / 2 + originalNode.width / 2;
            let yPos = yOrigin + originalNode.height / 2;
            annotationInstance.relativeTransform = [[1, 0, xPos], [0, 1, yPos]];
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
// Change theme (placeholder functions)
//------------------------------------------------------
function changeTheme(theme) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            myFunction(this);
        }
    };
    xhttp.open("GET", "Themes/Theme.Dark.xml", true);
    xhttp.send();
}
function myFunction(xml) {
    var xmlDoc = xml.responseXML;
    //     var x = xmlDoc.getElementsByTagName('Category').[Name "Components"];
    //     var y = x.childNodes[0];
    //     document.getElementById("demo").innerHTML = y.nodeValue
}
// Utils 
//------------------------------------------------------
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
//figma.closePlugin()
