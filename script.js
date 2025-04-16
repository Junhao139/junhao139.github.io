let __ScriptGlobal = {
    last_visited_section: 0
};

function set_scroll_camera_blur() {
    let vert = window.scrollY;
    let size_y = window.innerHeight;
    let proportion = Math.min(1.0, vert / size_y);
    __RainyTextGlobal.camera.manual_focal_radius_param = proportion * 0.008;
}

setInterval(set_scroll_section_highlight, 200);

function set_scroll_section_highlight() {
    let all_sections = document.getElementsByClassName("content-section");
    let all_nav_elems = document.getElementsByClassName("navbar-bar-option");
    let nav_gradient_bar = document.getElementById("navbar-bar-gradient");
    let window_middle = window.innerHeight / 2;
    let visiting_index = 0;
    let found = false;
    // check which one is 
    for (; visiting_index < all_sections.length; ++visiting_index) {
        if (all_sections[visiting_index].getBoundingClientRect().bottom >= window_middle) {
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
            } else {
                let bounding_rect = all_nav_elems[i].getBoundingClientRect();
                let full_rect = nav_gradient_bar.getBoundingClientRect();
                let center_x = (bounding_rect.right - bounding_rect.left) / 2.0;
                let start_x = bounding_rect.left - full_rect.left;
                let full_len = full_rect.right - full_rect.left;
                let pos = (start_x + center_x) / full_len;
                all_sections[i].style.opacity = "1";
                all_nav_elems[i].style.color = "#FFFFFF";
                nav_gradient_bar.style.backgroundImage = "linear-gradient(to right, #fff0 0%, #ffff " + (pos * 100).toString() + "%, #fff0 100%)"; 
            }
        }
    }
}

function set_scroll_to_section(idx) {
    let all_sections = document.getElementsByClassName("content-section");
    window.scrollTo({
        top: Math.max(0, window.scrollY + all_sections[idx].getBoundingClientRect().top - 120),
        behavior: "smooth"
    });

    console.log(window.scrollY + all_sections[idx].getBoundingClientRect().top - 120);
}