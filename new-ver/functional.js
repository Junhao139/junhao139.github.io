// all repeated functions
function repeated_functions() {
    // arrange the bg image's 
    arrange_bg_image();
}
setInterval(repeated_functions, 1);



// background image
const BGIMAGE_SIZE = { x : 1920, y : 1280 }

function arrange_bg_image() {
    const viewport_w = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const viewport_h = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    var body_element = document.getElementsByTagName("body")[0];
    if ((viewport_h / viewport_w) < (BGIMAGE_SIZE.y / BGIMAGE_SIZE.x)) {
        body_element.style.backgroundSize = "100% auto";
    } else {
        body_element.style.backgroundSize = "auto 100%";
    }
}