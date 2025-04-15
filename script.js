function set_scroll_camera_blur() {
    let vert = window.scrollY;
    let size_y = window.innerHeight;
    let proportion = Math.min(1.0, vert / size_y);
    __RainyTextGlobal.camera.manual_focal_radius_param = proportion * 0.015;
}