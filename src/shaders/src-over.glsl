vec4 blend(vec4 background, vec4 foreground) {
    return (foreground.rgba * foreground.a) + background.rgba * (1.0 - foreground.a);
}

#pragma glslify: export(blend)