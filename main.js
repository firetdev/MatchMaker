//The script for MatchMaker, which creates palettes from images and recolors images to match palettes

var colorlist = []  //Palette

//
//FUNCTIONS
//

//Color object
function Clr (r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.similar = 0;
}

//Get list of pixel colors in the image
function listOfColors (img, con) {
    var list = [];
    for (var i = 0; i < img.height; i++) {
        for (var e = 0; e < img.width; e++) {
            list.push(new Clr(con.getImageData(e, i, 1, 1).data[0], con.getImageData(e, i, 1, 1).data[1], con.getImageData(e, i, 1, 1).data[2]));
        }
    }
    return list;
}

//Are two colors similar?
function isSimilar (c1, c2) {
    var difference = {
        r: 0,
        g: 0,
        b: 0
    };
    difference.r = c1.r - c2.r;
    difference.g = c1.g - c2.g;
    difference.b = c1.b - c2.b;
    if (difference.r < 0)
        difference.r *= -1;
    if (difference.g < 0)
        difference.g *= -1;
    if (difference.b < 0)
        difference.b *= -1;
    var total = difference.r + difference.g + difference.b;
    if (total == 0)
        return false;
    if (difference.r >= 45 || difference.g >= 45 || difference.b >= 45) 
        return false;
    if (total <= 100) {
        return true;
    }
}

//Which color is most similar?
function mostSimilar (color) {
    var prevDifference = 10000000;
    var prev;
    for (var i = 0; i < colorlist.length; i++) {
        var difference = {
            r: 0,
            g: 0,
            b: 0
        };
        difference.r = color.r - colorlist[i].r;
        difference.g = color.g - colorlist[i].g;
        difference.b = color.b - colorlist[i].b;
        if (difference.r < 0)
            difference.r *= -1;
        if (difference.g < 0)
            difference.g *= -1;
        if (difference.b < 0)
            difference.b *= -1;
        if (difference.r >= 45 || difference.g >= 45 || difference.b >= 45) 
            total += 50;
        var total = difference.r + difference.g + difference.b;
        if (total < prevDifference) {
            prevDifference = total;
            prev = colorlist[i];
        }
    }
    return prev;
}

//
//PART 1 (palette making)
//

//Create canvas 1
var canvas1 = document.getElementById("canvas1");
var ctx1 = canvas1.getContext("2d");
canvas1.width = 480;

//Select image 1
var image1 = document.getElementById("image1");
var image1display = document.getElementById("image1display");
image1.addEventListener ("change", e => {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = (event) => {
        image1display.src = event.target.result;
    };
    reader.readAsDataURL(file);
    window.setTimeout("getPalette()", 10);
});

//Activates when image is selected
function getPalette () {
    var number = document.getElementById("number").value;
    canvas1.height = (image1display.height / image1display.width) * canvas1.width;
    ctx1.drawImage(image1display, 0, 0, canvas1.width, canvas1.height);
    var image1list2 = listOfColors(image1display, ctx1);
    var image1list = [];
    //Speed up processing by only including 1 in 25 pixels
    for (var i = 0; i < image1list2.length; i++) {
        if (i % 25 == 0)
            image1list.push(image1list2[i]);
    }
    //Loop to count similars and remove duplicates
    for (var i = 0; i < image1list.length; i++) {
        for (var e = 0; e < image1list.length; e++) {
            //Don't count self
            if (i == e)
                continue;
            var difference = {
                r: 0,
                g: 0,
                b: 0
            };
            difference.r = image1list[i].r - image1list[e].r;
            difference.g = image1list[i].g - image1list[e].g;
            difference.b = image1list[i].b - image1list[e].b;
            //Unsigned/absolute value
            if (difference.r < 0)
                difference.r *= -1;
            if (difference.g < 0)
                difference.g *= -1;
            if (difference.b < 0)
                difference.b *= -1;
            //Remove duplicates, count similar
            if (difference.r == 0 && difference.g == 0 && difference.b == 0) {
                image1list.splice(e, 1);
                e--;
            } else if (difference.r < 25 && difference.g < 25 && difference.b < 25) {
                image1list[i].similar++;
            }
        }
    }
    //Cut down to X colors
    var finals = [];
    for (var i = 0; i < image1list.length; i++) {
        finals.push(image1list[i]);
    }
    finals.sort((a, b) => b.similar - a.similar);
    for (var i = 0; i < finals.length; i++) {
        for (var e = 0; e < finals.length; e++) {
            if (isSimilar(finals[i], finals[e])) {
                finals.splice(e, 1);
                e--;
            }
        }
    }
    for (var i = number; i < finals.length; i++) {
        finals.splice(i, 1);
        i--;
    }
    //Draw pallete
    var palette = document.getElementById("palette");
    var paletteCtx = palette.getContext("2d");
    palette.height = 32;
    palette.width = finals.length * 32;
    for (var i = 0; i < finals.length; i++) {
        paletteCtx.fillStyle = `rgb(${finals[i].r}, ${finals[i].g}, ${finals[i].b})`;
        paletteCtx.fillRect(i * 32, 0, 32, 32);
    }
    colorlist = finals;
}

//
//PART 2 (recoloring)
//

//Create canvas 2
var canvas2 = document.getElementById("canvas2");
var ctx2 = canvas2.getContext("2d");
var canvasDisplay = document.getElementById("canvasdata");
canvas2.width = 480;

//Select image2
var image2 = document.getElementById("image2");
var image2display = document.getElementById("image2display");
image2.addEventListener("change", (e) => {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = (event) => {
        image2display.src = event.target.result;
    };
    reader.readAsDataURL(file);
    window.setTimeout("initRender()", 10);
});

//Initial render
function initRender () {
    canvas2.height = (image2display.height / image2display.width) * canvas2.width;
    ctx2.drawImage(image2display, 0, 0, canvas2.width, canvas2.height);
    canvasDisplay.src = canvas2.toDataURL();
}

//Recolor image
function recolor () {
    var list = listOfColors(canvasDisplay, ctx2);
    var position = {
        x: 0,
        y: 1
    };
    for (var i = 0; i < list.length; i++) {
        position.x++;
        if (position.x > 480) {
            position.x = 1;
            position.y++;
        }
        list[i].r = mostSimilar(list[i]).r;
        list[i].g = mostSimilar(list[i]).g;
        list[i].b = mostSimilar(list[i]).b;
        ctx2.fillStyle = `rgb(${list[i].r}, ${list[i].g}, ${list[i].b})`;
        ctx2.fillRect(position.x, position.y, 1, 1);
    }
}