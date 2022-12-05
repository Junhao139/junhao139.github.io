window.onload = function() {
    resize_page_left();
    arrange_bg_image();
    getdata();
}

window.onresize = function() {
    resize_page_left();
    arrange_bg_image();
}

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


// change when resizing
function resize_page_left() {
    var mainpage_left_elem = document.getElementById("mainpage-left");
    var alltext_left_elem = document.getElementById("alltexts-left");
    var mainpage_rightbar_width = 64;

    const viewport_w = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const viewport_h = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    mainpage_left_elem.style.width = (viewport_w - mainpage_rightbar_width) + "px";
    alltext_left_elem.style.width = mainpage_left_elem.style.width;
}


// a new section
function new_a_section_elem(section_info) {
    var parent_container_elem = document.getElementById("alltexts-containers-parent");
    
    var alltexts_textctn_elem = document.createElement("div");  alltexts_textctn_elem.setAttribute("class", "alltexts-textctn");
    var textctn_title_elem = document.createElement("span");    textctn_title_elem.setAttribute("class", "textctn-title");
    textctn_title_elem.innerText = section_info["section_name"];
    var container_fluid_elem = document.createElement("div");   container_fluid_elem.setAttribute("class", "container-fluid");
    container_fluid_elem.setAttribute("style", "margin-top:1em;background-color:rgba(0, 0, 0, 0.4);border-radius:12px;backdrop-filter:blur(12px);");
    var row_elem = document.createElement("div");               row_elem.setAttribute("class", "row");
    row_elem.style.padding = "4px";

    section_info["texts"].forEach(text_element => {
        var time_str = unix_time_parse(text_element);
        var textctn_text_elem_ctn_elem = document.createElement("div"); textctn_text_elem_ctn_elem.setAttribute("class", "col-md-6 textctn-text-elem-ctn");
        var textctn_text_elem_elem = document.createElement("div");     textctn_text_elem_elem.setAttribute("class", "textctn-text-elem");
        var textctn_text_date_elem = document.createElement("span");    textctn_text_date_elem.setAttribute("class", "textctn-text-date");
        textctn_text_date_elem.innerText = time_str;
        var textctn_text_title_elem = document.createElement("span");   textctn_text_title_elem.setAttribute("class", "textctn-text-title");
        textctn_text_title_elem.innerText = text_element["title"];

        textctn_text_elem_elem.appendChild(textctn_text_date_elem);
        textctn_text_elem_elem.appendChild(textctn_text_title_elem);

        textctn_text_elem_ctn_elem.appendChild(textctn_text_elem_elem);

        row_elem.appendChild(textctn_text_elem_ctn_elem);
    });

    container_fluid_elem.appendChild(row_elem);
    alltexts_textctn_elem.appendChild(textctn_title_elem);
    alltexts_textctn_elem.appendChild(container_fluid_elem);

    parent_container_elem.appendChild(alltexts_textctn_elem);
}


// time conversion
function unix_time_parse(textnode) {
    var unix_time = textnode.time;
    var time_zone = textnode.time_zone;
    var time_lag_min = textnode.time_lag_min;

    var date = new Date(unix_time * 1000);// * 1000 + time_lag_min * 60 * 1000);

    var output_str = "";

    /*switch (time_zone) {
        case "es":
            output_str += "西班牙时间";
            break;
        case "cn":
            output_str += "北京时间";
            break;
    }*/

    output_str += " ";

    output_str += (date.getFullYear()).toString() + " 年 " + (date.getMonth() + 1).toString() + " 月 " + (date.getDate()).toString() + " 日";

    return output_str;
}

// get the info
function getdata() {
    var resource = "https://blog.zminutes.com/data/data.json"

    /* GET CONTENTS THEN PUSH THEM */
    $.get(
        resource,
        function (callback, status) {
            console.log("GETDATA STATUS: " + status);
            deduce_content(callback);
        }
    );
}

// deduce the content
function deduce_content(data) {
    data.forEach(element => {
        new_a_section_elem(element);
    });
}

// change the menu
function set_page(code) {
    var mainpage_elem = document.getElementById("mainpage-left");
    var alltexts_elem = document.getElementById("alltexts-left");

    switch (code) {
        case 0:
            mainpage_elem.style.display = "block";
            alltexts_elem.style.display = "none";

            document.getElementById('mainpage_icon').setAttribute("src", "icons/hand_filled.svg")
            document.getElementById('alltexts_icon').setAttribute("src", "icons/category.svg");
            break;
        case 1:
            mainpage_elem.style.display = "none";
            alltexts_elem.style.display = "block";

            document.getElementById('mainpage_icon').setAttribute("src", "icons/hand.svg")
            document.getElementById('alltexts_icon').setAttribute("src", "icons/category_filled.svg");
            break;
        case 2:
            break;
    }
}