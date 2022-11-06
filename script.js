window.onload = function() {
    repartAllHrefs();
    setTimeout(logo_Animation, 1000);
};

function repartAllHrefs() {
    var elems = document.getElementsByTagName("a");
    for (var i = 0, sums = 0; i < elems.length; ++i) {
        if (elems[i].getAttribute("zm-cnt-src") != null) {
            elems[i].setAttribute("id", "CNTLINK_" + sums);
            elems[i].setAttribute("href", "./reader.html?cnt=" + elems[i].getAttribute("zm-cnt-src"));

            ++sums;
        }
    }
}

function logo_Animation() {
    var elem_container = document.getElementById("welcome_logo");
    var elem_img = document.getElementById("welcome_logo_img");

    elem_container.style.marginTop = "0px";
    elem_container.style.marginBottom = "10px";
    elem_img.style.width = "64px";
}

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

function deduce_content(data) {
    var container = document.getElementById("content");
    var deduced = JSON.parse(data)

    // data is an array
    deduced.forEach(section => {
        var section_title = document.createElement("h4");
        var section_container = document.createElement("ul");

        var section_texts = section.texts;
        section_texts.forEach(a_text => {
            var link_element = document.createElement("a");
            link_element.setAttribute("href", "./reader.html?cnt=" + section.section_name + "%2F" + a_text.file);

            var list_element = document.createElement("li");
            var text_title = a_text.title;

            list_element.appendChild(document.createTextNode(text_title));
            link_element.appendChild(list_element);

            section_container.appendChild(link_element);
        });

        container.appendChild(section_title);
        container.appendChild(section_container);
    });
}