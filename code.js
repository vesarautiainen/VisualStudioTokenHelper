// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
var AnnotationType;
(function (AnnotationType) {
    AnnotationType[AnnotationType["Font"] = 1] = "Font";
    AnnotationType[AnnotationType["Color"] = 2] = "Color";
})(AnnotationType || (AnnotationType = {}));
for (const node of figma.currentPage.selection) {
    if (node.type == "INSTANCE") {
        for (const child of node.children) {
            if (child.type == "RECTANGLE") {
                let styleId = child.fillStyleId;
                if (styleId !== figma.mixed) {
                    console.log(figma.getStyleById(styleId).description);
                    figma.ui.postMessage(figma.getStyleById(styleId).description);
                }
            }
        }
    }
}
function getComponent(type) {
    var component = figma.currentPage.findOne(n => n.name === "Token Annotation / Typography");
    if (component != undefined) {
        var instance = component.createInstance();
        instance.name = "Font annotation";
        return instance;
    }
}
figma.ui.onmessage = msg => {
    if (msg.type === 'create-typography-annotation') {
        const nodes = [];
        const annotation = getComponent(AnnotationType.Font);
        if (annotation) {
            figma.currentPage.appendChild(annotation);
            nodes.push(annotation);
            figma.currentPage.selection = nodes;
            figma.viewport.scrollAndZoomIntoView(nodes);
        }
        else {
            console.log("No annotation instance found");
        }
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
};
