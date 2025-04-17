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

    // for animation computing
    last_timestamp: null,
    max_obj_speed: 250, // an point in space can reach at max this speed
    regenerate_drop: true, // only false when the rain is stopped
    physics_scaling_factor: 1, // the speed-up of physics computation

    // for debugging
    debug_text: false
};

// All time-related are measured in seconds
// duration -1 means infinitely (and all the followings are omitted)
let __RainyTextAnimationIndex = 0;
let __RainyTextAnimationList = [
    {
        type: "raining",
        duration: 1
    },
    {
        type: "title",
        duration: {
            prep: 0.5,
            pause: 0.5,
            out: 0.5
        }
    },
    {
        type: "raining",
        duration: -1
    }
];

window.onload = function() {
    __RainyTextGlobal.pool_DOM_elem = document.getElementById("rainyText-pool");
    rainy_text_main();
}

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
    constructor(pos, speed, size, char, dom, color) {
        this.#pos = pos;
        this.#speed = speed;
        this.#size = size;
        this.#char = char;
        this.#dom = dom;
        this.#color = color;
    }
    get pos() { return this.#pos; }     set pos(p) { this.#pos = p; }
    get speed() { return this.#speed; } set speed(s) { this.#speed = s; }
    get size() { return this.#size; }   set size(s) { this.#size = s; }
    get char() { return this.#char; }   set char(c) { this.#char = c; }
    get dom() { return this.#dom; }     set dom(d) { this.#dom = d; }
    get color() { return this.#color; } set color(c) { this.#color = c; }
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

// Generate raindrops in the form of DotChar3D and push them in the bigdrops_pool in the global vars.
// Given camera properties, desired size of the char, furthest z-value, number and the lookup char array.
// All characters will share the same y-value (on the closest ceiling plane invisible to the camera), prepared
// to fall later. 
function generate_random_chars_ini(cameraprops, char_size, max_z, number, char_array) {
    var array_size = char_array.length;
    var ret_array = new Array();
    var minimum_z = 2*Math.max(char_size.x / cameraprops.tan_angle, char_size.y / cameraprops.tan_angle);

    for (var i = 0; i < number; ++i) {
        var char = char_array[parseInt(Math.random() * array_size)];

        let new_char_dom_elem = document.createElement("span");
        new_char_dom_elem.innerText = char;
        new_char_dom_elem.setAttribute("class", "raindrop");
        __RainyTextGlobal.pool_DOM_elem.appendChild(new_char_dom_elem);

        var rel_z = minimum_z + (max_z - minimum_z) * Math.random();
        var rel_x = (Math.random() * 2 - 1) * cameraprops.tan_angle * (cameraprops.pos.z + max_z) * cameraprops.multiply_factor.x;
        var rel_y = Math.abs(cameraprops.tan_angle * (cameraprops.pos.z + max_z) * cameraprops.multiply_factor.y);
        ret_array.push(new DotChar3D(
            new vector3(cameraprops.pos.x + rel_x, cameraprops.pos.y + rel_y, cameraprops.pos.z + rel_z),
            new vector3(-30, -__RainyTextGlobal.max_obj_speed, 0),
            char_size,
            char,
            new_char_dom_elem,
            new ColorRGB(parseInt(Math.random() * 256), parseInt(Math.random() * 256), parseInt(Math.random() * 256))
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
        new vector3(dot_char_3d.pos.x + dot_char_3d.size.x, dot_char_3d.pos.y,                      dot_char_3d.pos.z),
        new vector3(dot_char_3d.pos.x + dot_char_3d.size.x, dot_char_3d.pos.y - dot_char_3d.size.y, dot_char_3d.pos.z),

        new vector3(dot_char_3d.pos.x + dot_char_3d.size.x / 2, dot_char_3d.pos.y - dot_char_3d.size.y / 2, dot_char_3d.pos.z)/*,
        new vector3(dot_char_3d.pos.x + dot_char_3d.size.x / 2, dot_char_3d.pos.y, dot_char_3d.pos.z),
        new vector3(dot_char_3d.pos.x + dot_char_3d.size.x / 2, dot_char_3d.pos.y - dot_char_3d.size.y, dot_char_3d.pos.z),
        new vector3(dot_char_3d.pos.x, dot_char_3d.pos.y - dot_char_3d.size.y / 2, dot_char_3d.pos.z),
        new vector3(dot_char_3d.pos.x + dot_char_3d.size.x, dot_char_3d.pos.y - dot_char_3d.size.y / 2, dot_char_3d.pos.z)*/
    ];

    // if none of the corners is inside the viewport, then the char is not inside the viewport
    // this might not work for characters too close to the camera
    var in_viewport = false;
    for (var i = 0; !in_viewport && i < dot_char_3d_corners.length; ++i) {
        in_viewport = in_viewport || cameraprops.coordinate_in_viewport(dot_char_3d_corners[i]);
    }
    if (!in_viewport) {
        return false;
    }

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

    let opacity_scale = 3.0;
    let tinydrop_opacity = Math.min(Math.abs(dot_char_3d.pos.y), opacity_scale);
    tinydrop_opacity /= opacity_scale;
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
    new_char_dom_elem.innerText = bigdrop.char;
    new_char_dom_elem.setAttribute("class", "raindrop");
    global_props.pool_DOM_elem.appendChild(new_char_dom_elem);
    
    return new DotChar3D(
        new vector3(bigdrop.pos.x, -bigdrop.pos.y, bigdrop.pos.z),
        new vector3((2*Math.random() - 1) * (bigdrop.speed.x + global_props.max_obj_speed*0.1), -bigdrop.speed.y *0.2, (2*Math.random() - 1) * (bigdrop.speed.z + global_props.max_obj_speed*0.1)),
        new vector2(bigdrop.size.x / 3.0, bigdrop.size.y / 3.0),
        (' ' + bigdrop.char).slice(1),
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
            for (let j = 0; j < 2; ++j) {
                tinydrops.push(
                    physics_create_tinydrops(global_props, bigdrops[i])
                );
            }
            bigdrops[i].pos.x = (Math.random() * 2 - 1) * global_props.camera.tan_angle * Math.abs(global_props.camera.pos.z - bigdrops[i].pos.z) * global_props.camera.multiply_factor.x;
            bigdrops[i].pos.y = Math.abs(global_props.camera.tan_angle * Math.abs(global_props.camera.pos.z - bigdrops[i].pos.z) * global_props.camera.multiply_factor.y) + bigdrops[i].size.y*2;

            if (global_props.regenerate_drop) {
                // "reuse" this character
                bigdrops[i].speed.y = -global_props.max_obj_speed;
                //bigdrops[i].char = global_props.accepted_char_array[parseInt(Math.random() * global_props.accepted_char_array.length)];
                bigdrops[i].color = new ColorRGB(parseInt(Math.random() * 256), parseInt(Math.random() * 256), parseInt(Math.random() * 256));
            } else {
                bigdrops[i].dom.style.display = "none";
            }
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

// this function is called per frame
function physics_and_animate(timestamp) {
    timestamp = performance.now();
    if (__RainyTextGlobal.last_timestamp === null) {
        __RainyTextGlobal.last_timestamp = timestamp;
        requestAnimationFrame(physics_and_animate);
        return;
    }

    let delta = timestamp - __RainyTextGlobal.last_timestamp;

    // compute the physics
    // delta is in ms, now convert it to s
    physics(__RainyTextGlobal.physics_scaling_factor*delta/1000, __RainyTextGlobal);

    //__RainyTextGlobal.camera.focus_dist += (timestamp - __RainyTextGlobal.last_timestamp) * 0.01;

    // apply logics and animation

    let max_depth = 400;
    for (let i = 0; i < __RainyTextGlobal.bigdrops_pool.length; ++i) {
        draw_char_dom(__RainyTextGlobal.bigdrops_pool[i], __RainyTextGlobal.camera, max_depth);
    }
    for (let i = 0; i < __RainyTextGlobal.tinydrops_pool.length; ++i) {
        draw_char_dom(__RainyTextGlobal.tinydrops_pool[i], __RainyTextGlobal.camera, max_depth, true);
        //console.log("?");
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

    __RainyTextGlobal.camera = new CameraProps(Math.PI / 3, new vector3(0, 40, 0), viewport_width, viewport_height, 0.05, 1.5, 100);

    let furthest_gen_relative_distance = 200;
    let char_size = new vector2(10, 20);
    __RainyTextGlobal.bigdrops_pool_size = 40;

    __RainyTextGlobal.bigdrops_pool = generate_random_chars_ini(__RainyTextGlobal.camera, char_size, furthest_gen_relative_distance, __RainyTextGlobal.bigdrops_pool_size, __RainyTextGlobal.accepted_char_array);
    __RainyTextGlobal.bigdrops_pool.sort((a, b) => b.pos.z - a.pos.z);

    // begin simulation
    //requestAnimationFrame(physics_and_animate);
    setInterval(physics_and_animate, 16, 0);
}



