let __ScriptGlobal = {
    last_visited_section: 0,
    menu_is_opened: false
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
    let all_nav_elems_m = document.getElementsByClassName("navbar-bar-option-m");
    let nav_gradient_bar = document.getElementById("navbar-bar-gradient");
    let window_middle = window.innerHeight / 2;
    let visiting_index = 0;
    let found = false;
    // check which one is
    // if even the first one is far (.top >= window_middle * 3/4), then no one is
    if (all_sections[0].getBoundingClientRect().top >= window_middle) {
        visiting_index = -1;
    }
    else for (; visiting_index < all_sections.length; ++visiting_index) {
        if (all_sections[visiting_index].getBoundingClientRect().bottom >= window_middle) {
            found = true;
            break;
        }
    }
    if (found) {
        nav_gradient_bar.style.opacity = "1";
        __ScriptGlobal.last_visited_section = visiting_index;
        for (let i = 0; i < all_sections.length; ++i) {
            if (i != visiting_index) {
                all_sections[i].style.opacity = "0.2";
                all_nav_elems[i].style.color = "#7875B0";
                all_nav_elems_m[i].style.color = "#7875B0";
            } else {
                let bounding_rect = all_nav_elems[i].getBoundingClientRect();
                let full_rect = nav_gradient_bar.getBoundingClientRect();
                let center_x = (bounding_rect.right - bounding_rect.left) / 2.0;
                let start_x = bounding_rect.left - full_rect.left;
                let full_len = full_rect.right - full_rect.left;
                let pos = (start_x + center_x) / full_len;
                all_sections[i].style.opacity = "1";
                all_nav_elems[i].style.color = "#FFFFFF";
                all_nav_elems_m[i].style.color = "#FFFFFF";
                nav_gradient_bar.style.backgroundImage = "linear-gradient(to right, #fff0 0%, #ffff " + (pos * 100).toString() + "%, #fff0 100%)"; 
            }
        }
    } else {
        nav_gradient_bar.style.opacity = "0";
        for (let i = 0; i < all_sections.length; ++i) {
            all_sections[i].style.opacity = "0.2";
            all_nav_elems[i].style.color = "#7875B0";
            all_nav_elems_m[i].style.color = "#7875B0";
        }
    }
}

function set_scroll_to_section(idx) {
    let all_sections = document.getElementsByClassName("content-section");
    let rect = all_sections[idx].getBoundingClientRect();
    window.scrollTo({
        top: Math.min(
            window.scrollY + rect.bottom - window.innerHeight / 2 - 10,
            window.scrollY + rect.top - 120
        ),
        behavior: "smooth"
    });

    console.log(window.scrollY + all_sections[idx].getBoundingClientRect().top - 120);
}

function trigger_menu() {
    var navbar_whole = document.getElementById("navbar");
    var menu_mobile = document.getElementById("navbar-mobile-ctner");

    if (__ScriptGlobal.menu_is_opened) {
        navbar_whole.style.background = "#17173700";
        menu_mobile.style.height = "0px";
    } else {
        navbar_whole.style.background = "#171737ff";
        menu_mobile.style.height = "360px";
    }
    
    __ScriptGlobal.menu_is_opened = !__ScriptGlobal.menu_is_opened;

}