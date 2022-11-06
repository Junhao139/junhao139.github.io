window.onload = function() {
    repartAllHrefs();

    getdata();
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
    var deduced = data;

    // data is an array
    deduced.forEach(section => {
        var section_title = document.createElement("h4");
        section_title.appendChild(document.createTextNode(section.section_name))

        var section_container = document.createElement("ul");

        var section_texts = section.texts;
        section_texts.forEach(a_text => {
            var link_element = document.createElement("a");
            link_element.setAttribute("href", "./reader.html?cnt=" + section.directory + "%2F" + a_text.file);

            var list_element = document.createElement("li");
            var text_title = a_text.title;

            var title_element = document.createElement("span");
            title_element.setAttribute("class", "title");

            var date_element = document.createElement("span");
            date_element.setAttribute("class", "date");

            title_element.appendChild(document.createTextNode(text_title));
            date_element.appendChild(document.createTextNode(unix_time_parse(a_text)));

            list_element.appendChild(title_element);
            list_element.appendChild(date_element);
            link_element.appendChild(list_element);

            section_container.appendChild(link_element);
        });

        container.appendChild(section_title);
        container.appendChild(section_container);
    });
}

function unix_time_parse(textnode) {
    var unix_time = textnode.time;
    var time_zone = textnode.time_zone;
    var time_lag_min = textnode.time_lag_min;

    var date = new Date(unix_time * 1000);// * 1000 + time_lag_min * 60 * 1000);

    var output_str = "";

    switch (time_zone) {
        case "es":
            output_str += "西班牙时间";
            break;
        case "cn":
            output_str += "北京时间";
            break;
    }

    output_str += " ";

    output_str += (date.getFullYear()).toString() + " 年 " + (date.getMonth() + 1).toString() + " 月 " + (date.getDate()).toString() + " 日";

    return output_str;
}