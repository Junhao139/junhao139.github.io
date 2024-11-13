const canvas_elem = document.getElementById("cool-text-canvas");

var global_data = {
    count_time_pair : [],

};

window.onload = function() {
    canvas_elem.height = window.innerHeight * window.devicePixelRatio;
    canvas_elem.width = window.innerWidth * window.devicePixelRatio;
    cool_text_main();
}

class CameraProps {
    #angle;             // float, 0 < angle < pi/2
    #tan_angle;         // precalculated tan(angle) for optimising
    #inv_tan_angle;     // precalculated 1/tan_angle, for optimising
    #pos;               // vector3
    #multiply_factor;   // vector2, >= (1, 1)
    
    constructor(angle, pos, width, height) {
        this.#angle = angle;
        this.#tan_angle = Math.tan(angle);
        this.#inv_tan_angle = 1 / this.#tan_angle;
        this.#pos = pos;
        if (width > height) {
            this.#multiply_factor = new vector2(width / height, 1);
        } else {
            this.#multiply_factor = new vector2(1, height / width);
        }
    }
    get angle() { return this.#angle; }
    get tan_angle() { return this.#tan_angle; }
    get inv_tan_angle() { return this.#inv_tan_angle; }
    get pos() { return this.#pos; }
    get multiply_factor() { return this.#multiply_factor; }

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
    #size;  // vector2
    #char;  // one char
    constructor(pos, size, char) {
        this.#pos = pos;
        this.#size = size;
        this.#char = char;
    }
    get pos() { return this.#pos; }     set pos(p) { this.#pos = p; }
    get size() { return this.#size; }   set size(s) { this.#size = s; }
    get char() { return this.#char; }   set char(c) { this.#char = c; }
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

// generate a list of number elements of characters that are in the viewport of cameraprops
// and between the camera and the furthest reachable point (max_z)
// the list will only contain the characters specified in the char_array, each one the size of char_size
function generate_random_chars_pyramid(cameraprops, char_size, max_z, number, char_array) {
    var array_size = char_array.length;
    var ret_array = new Array();
    var minimum_z = Math.max(char_size.x / cameraprops.tan_angle, char_size.y / cameraprops.tan_angle);
    for (var i = 0; i < number; ++i) {
        var char = char_array[parseInt(Math.random() * array_size)];
        var rel_z = minimum_z + (max_z - minimum_z) * Math.random();
        var rel_x = (Math.random() * 2 - 1) * cameraprops.tan_angle * rel_z * cameraprops.multiply_factor.x;
        var rel_y = (Math.random() * 2 - 1) * cameraprops.tan_angle * rel_z * cameraprops.multiply_factor.y;

        ret_array.push(new DotChar3D(
            new vector3(cameraprops.pos.x + rel_x, cameraprops.pos.y + rel_y, cameraprops.pos.z + rel_z),
            char_size,
            char
        ));
    }
    return ret_array;
}

// generate a list of number elements of characters inside the box limited by the max_z and the minimum_z
// with dimensions of the furthest x and y inside the viewport from the distance of max_z
// the list will only contain the characters specified in the char_array, each one the size of char_size
function generate_random_chars_cuboid(cameraprops, char_size, max_z, number, char_array) {
    var array_size = char_array.length;
    var ret_array = new Array();
    var minimum_z = Math.max(char_size.x / cameraprops.tan_angle, char_size.y / cameraprops.tan_angle);

    for (var i = 0; i < number; ++i) {
        var char = char_array[parseInt(Math.random() * array_size)];
        var rel_z = minimum_z + (max_z - minimum_z) * Math.random();
        var rel_x = (Math.random() * 2 - 1) * cameraprops.tan_angle * max_z * cameraprops.multiply_factor.x;
        var rel_y = (Math.random() * 2 - 1) * cameraprops.tan_angle * max_z * cameraprops.multiply_factor.y;
        ret_array.push(new DotChar3D(
            new vector3(cameraprops.pos.x + rel_x, cameraprops.pos.y + rel_y, cameraprops.pos.z + rel_z),
            char_size,
            char
        ));
    }
    return ret_array;
}

// draw a character to the canvas, if the character is not in the viewport then nothing happens
// returns true if the character meets the conditions and it has been drawn. Otherwise false.
function draw_char_to_canvas(canvas_elem, dot_char_3d, cameraprops, color, max_depth, font_family) {
    // if the character is beyond the max_depth or behind the camera,
    // don't draw it
    if (dot_char_3d.pos.z - cameraprops.pos.z >= max_depth || dot_char_3d.pos.z - cameraprops.pos.z <= 0) {
        return false;
    }

    var dot_char_3d_corners = [
        dot_char_3d.pos,
        new vector3(dot_char_3d.pos.x,                      dot_char_3d.pos.y - dot_char_3d.size.y, dot_char_3d.pos.z),
        new vector3(dot_char_3d.pos.x + dot_char_3d.size.x, dot_char_3d.pos.y,                      dot_char_3d.pos.z),
        new vector3(dot_char_3d.pos.x + dot_char_3d.size.x, dot_char_3d.pos.y - dot_char_3d.size.y, dot_char_3d.pos.z),

        new vector3(dot_char_3d.pos.x + dot_char_3d.size.x / 2, dot_char_3d.pos.y - dot_char_3d.size.y / 2, dot_char_3d.pos.z),
        new vector3(dot_char_3d.pos.x + dot_char_3d.size.x / 2, dot_char_3d.pos.y, dot_char_3d.pos.z),
        new vector3(dot_char_3d.pos.x + dot_char_3d.size.x / 2, dot_char_3d.pos.y - dot_char_3d.size.y, dot_char_3d.pos.z),
        new vector3(dot_char_3d.pos.x, dot_char_3d.pos.y - dot_char_3d.size.y / 2, dot_char_3d.pos.z),
        new vector3(dot_char_3d.pos.x + dot_char_3d.size.x, dot_char_3d.pos.y - dot_char_3d.size.y / 2, dot_char_3d.pos.z)
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
    var viewport_size = new vector2(canvas_elem.width, canvas_elem.height);
    var projection = cameraprops.project_3d_coordinate(dot_char_3d_corners[0], viewport_size);
    var projection_low = cameraprops.project_3d_coordinate(dot_char_3d_corners[1], viewport_size);
    var font_size = Math.abs(projection.y - projection_low.y);
    var opacity_factor = 1 - (dot_char_3d.pos.z - cameraprops.pos.z) / max_depth;

    // draw the char
    var canvas_context = canvas_elem.getContext("2d");
    canvas_context.fillStyle = "rgba(" + 
        (parseInt(color.r)).toString() + ", " + 
        (parseInt(color.g)).toString() + ", " + 
        (parseInt(color.b)).toString() + ", " + 
        (opacity_factor).toString() + ")";
    canvas_context.shadowColor = "rgba(" + 
        (parseInt(color.r)).toString() + ", " + 
        (parseInt(color.g)).toString() + ", " + 
        (parseInt(color.b)).toString() + ", " + 
        /*(opacity_factor).toString() + */"1)";
    canvas_context.shadowBlur = 16;
    canvas_context.shadowOffsetX = 0;
    canvas_context.shadowOffsetY = 0;
    canvas_context.font = (font_size).toString() + "px " + font_family;
    canvas_context.textAlign = "left";
    canvas_context.textBaseline = "hanging";
    canvas_context.fillText(dot_char_3d.char, projection.x, projection.y);

    return true;
}

// given CameraProps, DotChar3D array and ColorRGB array, draw all the chars
function cool_text_draw(camera_props, dot_char_array, color_array) {
    var counter = 0;
    for (var i = 0; i < dot_char_array.length; ++i) {
        counter += draw_char_to_canvas(canvas_elem, dot_char_array[i], camera_props, color_array[i], 1200, "monospace") ? 1 : 0;
    }
    return counter;
}

// timing function
function timing_function(time_factor) {
    return Math.pow(Math.E, -4*time_factor); //- 0.02*time_factor;
    //return 1 / (time_factor + 1);
    //return Math.sin(time_factor) / Math.pow(time_factor, 2);
}

// main function
function cool_text_main() {
    console.log(canvas_elem.height + " " + canvas_elem.width);
    var camera_props = new CameraProps(Math.PI / 3, new vector3(0, 0, 0), canvas_elem.width, canvas_elem.height);
    const accepted_char_array = ['J', 'U', 'N', 'H', 'A', 'O', '1', '2', '3', '%', '<'];
    var dot_char_array = generate_random_chars_pyramid(camera_props, new vector2(20, 20), 2000, 2000, accepted_char_array);
    //var dot_char_array = generate_random_chars_cuboid(camera_props, new vector2(20, 20), 1600, 2000, accepted_char_array);
    var color_array = new Array();
    for (var i = 0; i < dot_char_array.length; ++i) {
        color_array.push(new ColorRGB(128 + Math.random() * 128, 128 + Math.random() * 128, 128 + Math.random() * 128));
    }
    dot_char_array.sort((a, b) => b.pos.z - a.pos.z);
    let time_accumulation = { acculumated_time_start: performance.now() };
    setInterval(function(camera_props, dot_char_array, color_array, time_accumulation) {
        //canvas_elem.getContext("2d").clearRect(0, 0, canvas_elem.width, canvas_elem.height);
        var first = performance.now();
        canvas_elem.getContext("2d").fillStyle = "black";
        canvas_elem.getContext("2d").fillRect(0, 0, canvas_elem.width, canvas_elem.height);
        var draws_performed = cool_text_draw(camera_props, dot_char_array, color_array);
        console.log(draws_performed);
        var time_elapsed = performance.now() - time_accumulation.acculumated_time_start;
        time_elapsed /= 1000;
        if (time_elapsed < 2) {
            camera_props.pos.y = 600 * timing_function(time_elapsed);
        } else {
            camera_props.pos.y = 0;
            camera_props.pos.z = 40 * time_elapsed - 80;
        }
        var last = performance.now();
        canvas_elem.getContext("2d").font = "100px Arial";
        canvas_elem.getContext("2d").fillText((parseInt(1000 / (last - first))).toString() + "fps", 10, 10);
    }, 20, camera_props, dot_char_array, color_array, time_accumulation);
}



