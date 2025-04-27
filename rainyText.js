class CameraProps {
    #angle;             // float, 0 < angle < pi/2
    #tan_angle;         // precalculated tan(angle) for optimising
    #inv_tan_angle;     // precalculated 1/tan_angle, for optimising
    #pos;               // vector3
    #multiply_factor;   // vector2, >= (1, 1)

    #focal_length;  // Focal length
    #f_aperture;    // Aperture value
    #focus_dist;    // Focus distance

    #manual_focal_radius_param; // A param to manually intervene the focal blur radius
    
    constructor(angle, pos, width, height, focal_len, f_ap, focus_d) {
        this.#angle = angle;
        this.#tan_angle = Math.tan(angle);
        this.#inv_tan_angle = 1 / this.#tan_angle;
        this.#pos = pos;
        if (width > height) {
            this.#multiply_factor = new vector2(width / height, 1);
        } else {
            this.#multiply_factor = new vector2(1, height / width);
        }
        this.#focal_length = focal_len;
        this.#f_aperture = f_ap;
        this.#focus_dist = focus_d;
        this.#manual_focal_radius_param = 0;
    }
    get angle() { return this.#angle; }
    set angle(a) { this.#angle = a; this.#tan_angle = Math.tan(a); this.#inv_tan_angle = 1 / Math.tan(a); }
    get tan_angle() { return this.#tan_angle; }
    get inv_tan_angle() { return this.#inv_tan_angle; }
    get pos() { return this.#pos; }
    set pos(p) { this.#pos = p; }
    get multiply_factor() { return this.#multiply_factor; }

    get focal_length() { return this.#focal_length; }
    set focal_length(fl) { this.#focal_length = fl; }
    get f_aperture() { return this.#f_aperture; }
    set f_aperture(fa) { this.#f_aperture = fa; }
    get focus_dist() { return this.#focus_dist; }
    set focus_dist(fd) { this.#focus_dist = fd; }

    get manual_focal_radius_param() { return this.#manual_focal_radius_param; }
    set manual_focal_radius_param(mf) { this.#manual_focal_radius_param = mf; } 

    // given the object's position in vector3
    // it computes the blur radius based on the camera settings
    // this is an pretty accurate aproximation
    blur_radius(obj_pos) {
        let obj_distance = Math.sqrt(Math.pow(this.#pos.x - obj_pos.x, 2) + Math.pow(this.#pos.y - obj_pos.y, 2) + Math.pow(this.#pos.z - obj_pos.z, 2), 2);
        return Math.pow(this.#manual_focal_radius_param, 2) +
            Math.pow(this.#focal_length, 2) *
            Math.abs(obj_distance - this.#focus_dist) /
            (this.#f_aperture * obj_distance * this.#focus_dist)
        ;
    }

    // returns if the coordinate is in viewport if projected
    coordinate_in_viewport(v) {
        var point_relative = new vector3(v.x - this.#pos.x, v.y - this.#pos.y, v.z - this.#pos.z);
        return point_relative.z > 0 && 
            Math.abs(point_relative.x) <= this.#tan_angle * this.#multiply_factor.x * point_relative.z &&
            Math.abs(point_relative.y) <= this.#tan_angle * this.#multiply_factor.y * point_relative.z;
    }

    // returns the projected coordinate, the coordinate should be in viewport (checked with coordinate_in_viewport)
    project_3d_coordinate(coord, vp) {
        var point_relative = new vector3(coord.x - this.#pos.x, coord.y - this.#pos.y, coord.z - this.#pos.z);
        var ret = new vector2(0, 0);

        // assume the point is in viewport
        // ret.y negated because the canvas' y increases downwards, while the conceptual model increases upwards
        ret.x = vp.x * 0.5 * (1 + point_relative.x * this.#inv_tan_angle / (point_relative.z * this.#multiply_factor.x));
        ret.y = vp.y * 0.5 * (1 - point_relative.y * this.#inv_tan_angle / (point_relative.z * this.#multiply_factor.y));

        return ret;
    }
}

class vector2 {
    #x; #y;
    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }
    get x() { return this.#x; }     set x(x) { this.#x = x; }
    get y() { return this.#y; }     set y(y) { this.#y = y; }
}

class vector3 {
    #x; #y; #z;
    constructor(x, y, z) {
        this.#x = x;
        this.#y = y;
        this.#z = z;
    }
    get x() { return this.#x; }     set x(x) { this.#x = x; }
    get y() { return this.#y; }     set y(y) { this.#y = y; }
    get z() { return this.#z; }     set z(z) { this.#z = z; }
}

class DotChar3D {
    #pos;   // vector3
    #speed; // vector3
    #size;  // vector2
    #char;  // one char
    #dom;   // HTML DOM elem
    #color; // ColorRGB elem
    #regenerate; // if the raindrop needs to be regenerated. default true
    #text_anim; // a list of 2 elems: used (true if it's used for text animation); char (the character it should be, will be set back after the animation)
    constructor(pos, speed, size, char, dom, color) {
        this.#pos = pos;
        this.#speed = speed;
        this.#size = size;
        this.#char = char;
        this.#dom = dom;
        this.#color = color;
        this.#regenerate = true;
        this.#text_anim = {
            used: false,
            char: ""
        };
    }
    get pos() { return this.#pos; }                 set pos(p) { this.#pos = p; }
    get speed() { return this.#speed; }             set speed(s) { this.#speed = s; }
    get size() { return this.#size; }               set size(s) { this.#size = s; }
    get char() { return this.#char; }               set char(c) { this.#char = c; }
    get dom() { return this.#dom; }                 set dom(d) { this.#dom = d; }
    get color() { return this.#color; }             set color(c) { this.#color = c; }
    get regenerate() { return this.#regenerate; }   set regenerate(r) { this.#regenerate = r; }
    get text_anim() { return this.#text_anim; }     set text_anim(t) { this.#text_anim = t; }
}

class ColorRGB {
    #r; #g; #b;
    constructor(r, g, b) {
        this.#r = r;
        this.#g = g;
        this.#b = b;
    }
    get r() { return this.#r; }     set r(r) { this.#r = r; }
    get g() { return this.#g; }     set g(g) { this.#g = g; }
    get b() { return this.#b; }     set b(b) { this.#b = b; }
}





// All global variables for RainyText effect
let __RainyTextGlobal = {
    // general definitions
    bigdrops_pool_size: 0,
    bigdrops_pool: [],
    tinydrops_pool: [],
    pool_DOM_elem: null,
    base_font_size: 50.0, // base font size in px
    camera: null,   // CameraProps element
    accepted_char_array: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    tinydrops_factor: 2, // for each Bigdrop how many Tinydrop is generated
    raindrop_color: new ColorRGB(101, 92, 198),
    highlight_color: new ColorRGB(255, 255, 255),
    lowlight_color: new ColorRGB(0, 0, 0),
    //accepted_char_array: ['€', '$'],

    // for animation computing
    last_timestamp: null,
    max_obj_speed: 250, // an point in space can reach at max this speed
    regenerate_drop: true, // only false when the rain is stopped
    physics_scaling_factor: 1, // the speed-up of physics computation
    computation_ms: 20, // every how many ms should the animation be computed

    // for text animation
    text_anim: {
        reserve: "",    // the text that is going to be displayed
        trigger: false, // set this to true, and the animation will autom. proceed to display
        chosen_idx: -1,   // the index of the first character chosen (among bigdrops_pool) to be used for the animation
        start_point: null   // the timestamp of the beginning of the animation (set when trigger == true)
    },

    // for debugging
    debug_text: false
};

window.onload = function() {
    __RainyTextGlobal.pool_DOM_elem = document.getElementById("rainyText-pool");
    rainy_text_main();
}





// Generate raindrops in the form of DotChar3D and push them in the bigdrops_pool in the global vars.
// Given camera properties, desired size of the char, furthest z-value, number and the lookup char array.
// All characters will share the same y-value (on the closest ceiling plane invisible to the camera), prepared
// to fall later. 
function generate_random_chars_ini(cameraprops, char_size, max_z, number, char_array) {
    var array_size = char_array.length;
    var ret_array = new Array();
    var minimum_z = 3*Math.max(char_size.x / cameraprops.tan_angle, char_size.y / cameraprops.tan_angle);

    for (var i = 0; i < number; ++i) {
        var char = char_array[parseInt(Math.random() * array_size)];

        let new_char_dom_elem = document.createElement("span");
        new_char_dom_elem.innerText = char;
        new_char_dom_elem.setAttribute("class", "raindrop");
        __RainyTextGlobal.pool_DOM_elem.appendChild(new_char_dom_elem);

        var rel_z = minimum_z + (max_z - minimum_z) * Math.random();
        var rel_x = (Math.random() * 2 - 1) * cameraprops.tan_angle * Math.abs(cameraprops.pos.z - max_z) * cameraprops.multiply_factor.x;
        var rel_y = Math.abs(cameraprops.tan_angle * Math.abs(cameraprops.pos.z - max_z) * (1 + 0.5*Math.random()) * cameraprops.multiply_factor.y);
        ret_array.push(new DotChar3D(
            new vector3(cameraprops.pos.x + rel_x, cameraprops.pos.y + rel_y, cameraprops.pos.z + rel_z),
            new vector3(-30, -__RainyTextGlobal.max_obj_speed, 0),
            char_size,
            char,
            new_char_dom_elem,
            __RainyTextGlobal.raindrop_color
            //new ColorRGB(parseInt(Math.random() * 256), parseInt(Math.random() * 256), parseInt(Math.random() * 256))
        ));
    }
    return ret_array;
}

// draw a character to the canvas, if the character is not in the viewport then nothing happens
// returns true if the character meets the conditions and it has been drawn. Otherwise false.
function draw_char_dom(dot_char_3d, cameraprops, max_depth, tinydrop = false) {
    // if the character is beyond the max_depth or behind the camera,
    // don't draw it
    if (dot_char_3d.pos.z - cameraprops.pos.z >= max_depth || dot_char_3d.pos.z - cameraprops.pos.z <= 0) {
        //dot_char_3d.dom.style.opacity = "0";
        dot_char_3d.dom.style.display = "none";
        return false;
    }
    dot_char_3d.dom.style.display = "inline-block";
    //dot_char_3d.dom.style.opacity = "1";

    
    var dot_char_3d_corners = [
        dot_char_3d.pos,
        new vector3(dot_char_3d.pos.x,                      dot_char_3d.pos.y - dot_char_3d.size.y, dot_char_3d.pos.z),
        /*new vector3(dot_char_3d.pos.x + dot_char_3d.size.x, dot_char_3d.pos.y,                      dot_char_3d.pos.z),
        new vector3(dot_char_3d.pos.x + dot_char_3d.size.x, dot_char_3d.pos.y - dot_char_3d.size.y, dot_char_3d.pos.z),

        new vector3(dot_char_3d.pos.x + dot_char_3d.size.x / 2, dot_char_3d.pos.y - dot_char_3d.size.y / 2, dot_char_3d.pos.z)/*,
        new vector3(dot_char_3d.pos.x + dot_char_3d.size.x / 2, dot_char_3d.pos.y, dot_char_3d.pos.z),
        new vector3(dot_char_3d.pos.x + dot_char_3d.size.x / 2, dot_char_3d.pos.y - dot_char_3d.size.y, dot_char_3d.pos.z),
        new vector3(dot_char_3d.pos.x, dot_char_3d.pos.y - dot_char_3d.size.y / 2, dot_char_3d.pos.z),
        new vector3(dot_char_3d.pos.x + dot_char_3d.size.x, dot_char_3d.pos.y - dot_char_3d.size.y / 2, dot_char_3d.pos.z)*/
    ];

    // if none of the corners is inside the viewport, then the char is not inside the viewport
    // this might not work for characters too close to the camera
    /*
    var in_viewport = false;
    for (var i = 0; !in_viewport && i < dot_char_3d_corners.length; ++i) {
        in_viewport = in_viewport || cameraprops.coordinate_in_viewport(dot_char_3d_corners[i]);
    }
    if (!in_viewport) {
        return false;
    }*/

    // project the character and get the font_size
    var viewport_size = new vector2(__RainyTextGlobal.pool_DOM_elem.offsetWidth, __RainyTextGlobal.pool_DOM_elem.offsetHeight);
    var projection = cameraprops.project_3d_coordinate(dot_char_3d_corners[0], viewport_size);
    //console.log(projection.y);
    var projection_low = cameraprops.project_3d_coordinate(dot_char_3d_corners[1], viewport_size);
    var font_size_scale = parseFloat(Math.abs(projection.y - projection_low.y)) / __RainyTextGlobal.base_font_size;
   
    // apply the visual changes to the char
    let translate = projection;
    let scale = font_size_scale;
    var blur_rad = 600000 * cameraprops.blur_radius(dot_char_3d.pos) / scale;

    let tinydrop_opacity = 1;
    if (dot_char_3d.speed.y < 0) {
        let opacity_scale = 3.0;
        tinydrop_opacity = Math.min(Math.abs(dot_char_3d.pos.y), opacity_scale);
        tinydrop_opacity /= opacity_scale;
    }
    //if (tinydrop) scale *= tinydrop_opacity;
    
    Object.assign(dot_char_3d.dom.style, {
        textShadow: "0 0 " + (blur_rad).toString() + "px " + "rgba(" + 
            (parseInt(dot_char_3d.color.r)).toString() + ", " + 
            (parseInt(dot_char_3d.color.g)).toString() + ", " + 
            (parseInt(dot_char_3d.color.b)).toString() + ", " + 
            (tinydrop ? (tinydrop_opacity).toString() : "1") +
        ")",
        transform: "translate(" + translate.x + "px, " + translate.y + "px) " +
            "scale(" + scale + ")"//,
        //opacity: tinydrop ? tinydrop_opacity.toString() : "1"
    });

    return true;
}

function sign(num) {
    return num < 0 ? -1 : 1;
}

// to create a tinydrop given the info about the bigdrop from which it derives
function physics_create_tinydrops(global_props, bigdrop) {
    let new_char_dom_elem = document.createElement("span");
    let the_char = bigdrop.char;
    if (bigdrop.text_anim.used) {
        the_char = bigdrop.text_anim.char;
        console.log(the_char);
    }
    new_char_dom_elem.innerText = the_char;
    new_char_dom_elem.setAttribute("class", "raindrop");
    global_props.pool_DOM_elem.appendChild(new_char_dom_elem);
    
    return new DotChar3D(
        new vector3(bigdrop.pos.x, -bigdrop.pos.y, bigdrop.pos.z),
        new vector3((2*Math.random() - 1) * (bigdrop.speed.x + global_props.max_obj_speed*0.1), -bigdrop.speed.y *0.2, (2*Math.random() - 1) * (bigdrop.speed.z + global_props.max_obj_speed*0.1)),
        new vector2(bigdrop.size.x / 3.0, bigdrop.size.y / 3.0),
        new_char_dom_elem.innerText,
        new_char_dom_elem,
        bigdrop.color
    );
}

// physics computation
// "delta" is the time difference between the last frame and the current, in ms
// "global_props" should be the __RainyTextGlobal
function physics(delta, global_props) {
    // if time invariance is too small
    if (Math.abs(delta) < 1e-6) {
        return;
    }

    const gravity = -500;//-9.8;
    let bigdrops = global_props.bigdrops_pool;
    let tinydrops = global_props.tinydrops_pool;

    // apply acceleration and ensure the speed doesn't surpass 30
    for (let i = 0; i < bigdrops.length; ++i) {
        if (!bigdrops[i].regenerate) continue;
        bigdrops[i].speed.y += delta*gravity;
        //bigdrops[i].speed.x = sign(bigdrops[i].speed.x) * max(abs(bigdrops[i].speed.x), global_props.max_obj_speed);
        bigdrops[i].speed.y = sign(bigdrops[i].speed.y) * Math.min(Math.abs(bigdrops[i].speed.y), global_props.max_obj_speed);
        //bigdrops[i].speed.z = sign(bigdrops[i].speed.z) * max(abs(bigdrops[i].speed.z), global_props.max_obj_speed);
    }
    for (let i = 0; i < tinydrops.length; ++i) {
        tinydrops[i].speed.y += delta*gravity;
        //tinydrops[i].speed.x = sign(tinydrops[i].speed.x) * max(abs(tinydrops[i].speed.x), global_props.max_obj_speed);
        tinydrops[i].speed.y = sign(tinydrops[i].speed.y) * Math.min(Math.abs(tinydrops[i].speed.y), global_props.max_obj_speed);
        //tinydrops[i].speed.z = sign(tinydrops[i].speed.z) * max(abs(tinydrops[i].speed.z), global_props.max_obj_speed);
    }

    // apply speed
    for (let i = 0; i < bigdrops.length; ++i) {
        if (!bigdrops[i].regenerate) continue;
        bigdrops[i].pos.x += bigdrops[i].speed.x * delta;
        bigdrops[i].pos.y += bigdrops[i].speed.y * delta;
        bigdrops[i].pos.z += bigdrops[i].speed.z * delta;
    }
    for (let i = 0; i < tinydrops.length; ++i) {
        tinydrops[i].pos.x += tinydrops[i].speed.x * delta;
        tinydrops[i].pos.y += tinydrops[i].speed.y * delta;
        tinydrops[i].pos.z += tinydrops[i].speed.z * delta;
    }

    // when a bigdrop falls to y=0, it "disappears" (in fact it appears back at ceiling) and is split into multiple tinydrops,
    // and when a tinydrop falls to y=0, it vanishes.
    for (let i = 0; i < bigdrops.length; ++i) {
        if (bigdrops[i].pos.y < 0) {
            for (let j = 0; j < global_props.tinydrops_factor; ++j) {
                tinydrops.push(
                    physics_create_tinydrops(global_props, bigdrops[i])
                );
            }

            // if the drop is used for text animation
            if (bigdrops[i].text_anim.used) {
                bigdrops[i].dom.innerText = bigdrops[i].text_anim.char;
                //bigdrops[i].color = new ColorRGB(255, 0, 0);
                // calculate how many chars will be there and therefore the x position
                let width = 2 * global_props.camera.tan_angle * Math.abs(global_props.camera.pos.z - bigdrops[i].pos.z) * global_props.camera.multiply_factor.x;
                let height = Math.abs(global_props.camera.tan_angle * Math.abs(global_props.camera.pos.z - bigdrops[i].pos.z) * global_props.camera.multiply_factor.y);
                let str_len = global_props.text_anim.reserve.length;
                let rel_idx = i - global_props.text_anim.chosen_idx;
                bigdrops[i].pos.x = global_props.camera.pos.x - 0.5 * width + width * rel_idx / str_len + 30 * 2.5 * Math.sqrt(__RainyTextGlobal.physics_scaling_factor);
                /// !!!!!
                bigdrops[i].pos.y = global_props.camera.pos.y + height*1.5 + global_props.max_obj_speed * (Math.sqrt(__RainyTextGlobal.physics_scaling_factor) - performance.now()/1000 + global_props.text_anim.start_point);

                console.log(bigdrops[i].pos.y + " " + height + " " + global_props.camera.pos.y);

                bigdrops[i].text_anim.used = false;
            } else {
                //bigdrops[i].dom.color = new ColorRGB(255, 255, 255);
                bigdrops[i].color = global_props.raindrop_color;
                bigdrops[i].dom.innerText = bigdrops[i].char;
                bigdrops[i].pos.x = global_props.camera.pos.x + (Math.random() * 2 - 1) * global_props.camera.tan_angle * Math.abs(global_props.camera.pos.z - bigdrops[i].pos.z) * global_props.camera.multiply_factor.x;
                bigdrops[i].pos.y = global_props.camera.pos.y + Math.abs(global_props.camera.tan_angle * Math.abs(global_props.camera.pos.z - bigdrops[i].pos.z) * global_props.camera.multiply_factor.y) + bigdrops[i].size.y;
            }

            bigdrops[i].speed.y = -global_props.max_obj_speed;
            //bigdrops[i].color = new ColorRGB(parseInt(Math.random() * 256), parseInt(Math.random() * 256), parseInt(Math.random() * 256));

            bigdrops[i].regenerate = global_props.regenerate_drop;
        }
    }

    for (let i = 0; i < tinydrops.length; ++i) {
        if (tinydrops[i].pos.y < 0) {
            // exchange with the last one and pop it (equivalent to remove the element, but since we are in an array...)
            //console.log(global_props.pool_DOM_elem.childElementCount);
            tinydrops[i].dom.remove();
            //console.log("// " + global_props.pool_DOM_elem.childElementCount);
            tinydrops[i] = tinydrops[tinydrops.length - 1];
            tinydrops.pop();
            //console.log(".");
        }
    }
}

// Text pause Animation processing function
function text_pause_animation() {
    // [0] 1s for text preparation
    // [1] 2s for slow-mo transition
    // [2] 0.4s paused - [3] 2s for capturing attention - [4] 0.4s pause
    // [5] 2s for going back to normal
    let anim_durations = [1, 2, 0.6, 1, 0.4, 2];
    let anim_computed_stamps = [anim_durations[0]];
    for (let i = 1; i < anim_durations.length; ++i) anim_computed_stamps.push(anim_computed_stamps[i-1] + anim_durations[i]);
    //anim_durations.forEach((x,i) => (anim_computed_stamps.push(anim_computed_stamps[i-1] || 0) + x));

    //console.log(anim_computed_stamps);

    let tanim = __RainyTextGlobal.text_anim;
    if (tanim.start_point === null) {
        // nothing configured yet
        tanim.start_point = performance.now() / 1000;
    }

    // time lapse occured, measured in s
    let lapse = performance.now() / 1000 - tanim.start_point;
    let pause_factor = 0.05;
    if (lapse < anim_computed_stamps[0]) {

    } else if (lapse < anim_computed_stamps[1]) {
        // slow-mo phase
        // tried different methods, the quadratic works fine
        // :: Inverse Exponential:  __RainyTextGlobal.physics_scaling_factor = Math.exp(-mult_factor*lapse);
        __RainyTextGlobal.physics_scaling_factor = pause_factor + (1.0-pause_factor)*Math.pow((anim_durations[1] - lapse + anim_durations[0]) / anim_durations[1], 2);
    } else if (lapse < anim_computed_stamps[2]) {
        // first pause
        __RainyTextGlobal.physics_scaling_factor = pause_factor;
        let phase_factor = 1 - (anim_durations[2] - lapse + anim_computed_stamps[1]) / anim_durations[2];
        let index = parseInt(__RainyTextGlobal.bigdrops_pool.length * phase_factor * 0.999);
        //let index = parseInt(__RainyTextGlobal.text_anim.reserve.length * phase_factor * 0.999);
        //__RainyTextGlobal.bigdrops_pool[index + __RainyTextGlobal.text_anim.chosen_idx].color = __RainyTextGlobal.highlight_color;
        if (index >= __RainyTextGlobal.text_anim.chosen_idx && index < __RainyTextGlobal.text_anim.chosen_idx + __RainyTextGlobal.text_anim.reserve.length) {
            __RainyTextGlobal.bigdrops_pool[index].color = __RainyTextGlobal.highlight_color;
        } else {
            __RainyTextGlobal.bigdrops_pool[index].color = __RainyTextGlobal.lowlight_color;
        }
    } else if (lapse < anim_computed_stamps[3]) {
        // letters capturing attention
        //let phase_factor = (anim_durations[3] - lapse + anim_computed_stamps[2]) / anim_durations[3];
        //let functioned_factor = Math.exp(-30*Math.pow(phase_factor-0.5, 2));
        //__RainyTextGlobal.camera.angle = Math.PI/3 + functioned_factor * Math.PI/18;
        //__RainyTextGlobal.camera.focus_dist = 50 + functioned_factor * 150;
        //console.log("__RainyTextGlobal.text_anim.reserve.length: " + __RainyTextGlobal.text_anim.reserve.length);
    } else if (lapse < anim_computed_stamps[4]) {
        // second pause
        __RainyTextGlobal.physics_scaling_factor = pause_factor;
    } else if (lapse < anim_computed_stamps[5]) {
        // fasten back
        // :: Inverse Exponential:  __RainyTextGlobal.physics_scaling_factor = 1-Math.exp(-mult_factor*(lapse-anim_computed_stamps[3]));

        __RainyTextGlobal.physics_scaling_factor = pause_factor + (1.0-pause_factor)*Math.pow(1 - (anim_durations[5] - lapse + anim_computed_stamps[4]) / anim_durations[5], 2);            
    } else {
        __RainyTextGlobal.physics_scaling_factor = 1;
        // animation complete, reset the params
        tanim.start_point = null;
        tanim.trigger = false;
    }

    //console.log(factor + " " + __RainyTextGlobal.physics_scaling_factor);
}

// this function is called per frame
function physics_and_animate() {
    timestamp = performance.now();
    if (__RainyTextGlobal.last_timestamp === null) {
        __RainyTextGlobal.last_timestamp = timestamp;
        requestAnimationFrame(physics_and_animate);
        return;
    }

    let delta = (timestamp - __RainyTextGlobal.last_timestamp) / 1000;
    
    // if the text animation is triggered
    if (__RainyTextGlobal.text_anim.trigger) {
        text_pause_animation();
    }

    // compute the physics
    // delta is in ms, now convert it to s
    physics(__RainyTextGlobal.physics_scaling_factor*delta, __RainyTextGlobal);

    // apply logics and animation

    let max_depth = 400;
    for (let i = 0; i < __RainyTextGlobal.bigdrops_pool.length; ++i) {
        draw_char_dom(__RainyTextGlobal.bigdrops_pool[i], __RainyTextGlobal.camera, max_depth);
    }
    for (let i = 0; i < __RainyTextGlobal.tinydrops_pool.length; ++i) {
        draw_char_dom(__RainyTextGlobal.tinydrops_pool[i], __RainyTextGlobal.camera, max_depth, true);
    }

    __RainyTextGlobal.last_timestamp = timestamp;
    //requestAnimationFrame(physics_and_animate);
    if (__RainyTextGlobal.debug_text) {
        document.getElementById("rainyText-debug-msg").innerText = 
            "Render FPS: " + (parseInt(1000/(performance.now() - timestamp))).toString() + "\n" +
            "Childcount: " + (__RainyTextGlobal.pool_DOM_elem.childElementCount).toString() + "\n" +
            "Bigdrops: " + (__RainyTextGlobal.bigdrops_pool.length).toString() + "\n" + 
            "Tinydrops: " + (__RainyTextGlobal.tinydrops_pool.length).toString();
    }
}

// text pause animation
// "str" is the string what want to be displayed
function run_text_pause_animation(str) {
    if (str.length > __RainyTextGlobal.bigdrops_pool.length) {
        console.log("TEXT PAUSE ANIMATION: TOO FEW BIGDROPS TO USE.");
        return;
    }
    let tanim = __RainyTextGlobal.text_anim;
    tanim.reserve = str;
    tanim.chosen_idx = parseInt((__RainyTextGlobal.bigdrops_pool.length - str.length) / 2);
    tanim.trigger = true;
    
    for (let i = 0; i < str.length; ++i) {
        __RainyTextGlobal.bigdrops_pool[tanim.chosen_idx + i].text_anim.used = true;
        __RainyTextGlobal.bigdrops_pool[tanim.chosen_idx + i].text_anim.char = str[i];
    }
}

// main function
function rainy_text_main() {
    const viewport_width = __RainyTextGlobal.pool_DOM_elem.offsetWidth;
    const viewport_height = __RainyTextGlobal.pool_DOM_elem.offsetHeight;
    console.log(viewport_width + " " + viewport_height);

    if (__RainyTextGlobal.debug_text) {
        document.getElementById("debugging").style.display = "inline-block";
    } else {
        document.getElementById("debugging").style.display = "none";
    }

    __RainyTextGlobal.camera = new CameraProps(Math.PI / 3, new vector3(0, 60 * Math.max(viewport_height, viewport_width) / viewport_width, 0), viewport_width, viewport_height, 0.05, 1.5, 120);

    let furthest_gen_relative_distance = 200;
    let char_size = new vector2(10, 20);
    __RainyTextGlobal.bigdrops_pool_size = 30;

    __RainyTextGlobal.bigdrops_pool = generate_random_chars_ini(__RainyTextGlobal.camera, char_size, furthest_gen_relative_distance, __RainyTextGlobal.bigdrops_pool_size, __RainyTextGlobal.accepted_char_array);
    __RainyTextGlobal.bigdrops_pool.sort((a, b) => b.pos.z - a.pos.z);
    for (let i = 0; i < __RainyTextGlobal.bigdrops_pool.length; ++i) {
        __RainyTextGlobal.bigdrops_pool[i].dom.style.zIndex = (i).toString();
    }

    // begin simulation
    //requestAnimationFrame(physics_and_animate);
    setInterval(physics_and_animate, __RainyTextGlobal.computation_ms, 0);
}
