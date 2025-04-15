let __ScriptGlobal = {
    last_visited_section: 0
};

function set_scroll_camera_blur() {
    let vert = window.scrollY;
    let size_y = window.innerHeight;
    let proportion = Math.min(1.0, vert / size_y);
    __RainyTextGlobal.camera.manual_focal_radius_param = proportion * 0.015;
}

function set_scroll_section_highlight() {
    let all_sections = document.getElementsByClassName("content-section");
    let all_nav_elems = document.getElementsByClassName("navbar-bar-option");
    let window_middle = window.innerHeight / 2;
    let visiting_index = 0;
    let found = false;
    // check which one is 
    for (; visiting_index < all_sections.length; ++visiting_index) {
        if (all_sections[visiting_index].getBoundingClientRect().bottom >= window_middle) {
            all_sections[visiting_index].style.opacity = "1";
            all_nav_elems[visiting_index].style.color = "#FFFFFF";
            found = true;
            break;
        }
    }
    if (found) {
        __ScriptGlobal.last_visited_section = visiting_index;
        for (let i = 0; i < all_sections.length; ++i) {
            if (i != visiting_index) {
                all_sections[i].style.opacity = "0.2";
                all_nav_elems[i].style.color = "#7875B0";
            }
        }
    }
}