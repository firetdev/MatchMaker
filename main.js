//The script for MatchMaker, which creates palettes from images and recolors images to match palettes

var colorlist = []  //Palette
var engine = 0;  //System to use to get palette

//
//FUNCTIONS
//

//Alternate way to make palette (INCOMPLETE; DO NOT USE)
function getColors (clrs, num, con) {
    var centers = [];
    for (var i = 0; i < num; i++) {
        var a = Math.floor(Math.random() * (canvas1.width + 1));
        var b = Math.floor(Math.random() * (canvas1.height + 1));
        var newColor = new Clr(con.getImageData(a, b, 1, 1).data[0], con.getImageData(a, b, 1, 1).data[1], con.getImageData(a, b, 1, 1).data[2]);
        for (var e = 0; e < centers.length; e++) {
            if (isSimilar(centers[e], newColor)) {
                a = Math.floor(Math.random() * (canvas1.width + 1));
                b = Math.floor(Math.random() * (canvas1.height + 1));
                newColor = new Clr(con.getImageData(a, b, 1, 1).data[0], con.getImageData(a, b, 1, 1).data[1], con.getImageData(a, b, 1, 1).data[2]);
            }
        }
        centers.push(newColor);
    }
    for (var u = 0; u < 3; u++) {
        for (var i = 0; i < clrs.length; i++) {
            var prevDist = 10000000;
            var point = 0;
            for (var e = 0; e < centers.length; e++) {
                var dist = Math.sqrt(((clrs[i].r - centers[e].r)^2) + ((clrs[i].g - centers[e].g)^2) + ((clrs[i].b - centers[e].b)^2));
                if (dist < prevDist) {
                    prevDist = dist;
                    point = e;
                }
            }
            centers[point].assignedClrs.push(clrs[i]);
        }
        for (var i = 0; i < centers.length; i++) {
            var totals = {
                r: 0,
                g: 0,
                b: 0
            }
            for (var e = 0; e < centers[i].assignedClrs.length; e++) {
                totals.r += centers[i].assignedClrs[e].r;
                totals.g += centers[i].assignedClrs[e].g;
                totals.b += centers[i].assignedClrs[e].b;
            }
            if(i == 0){
                console.log(totals);
                console.log(centers[i]);}
            centers[i].r = totals.r / centers[i].assignedClrs.length;
            centers[i].g = totals.g / centers[i].assignedClrs.length;
            centers[i].b = totals.b / centers[i].assignedClrs.length;
        }
    }
    return centers;
}

//Color object
function Clr (r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.similar = 0;
    this.assignedClrs = [];
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
var ctx1 = canvas1.getContext("2d", {willReadFrequently: true});
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
    document.getElementById("file1").textContent = e.target.files[0].name;
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
    if (engine == 0) {
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
    } else {
        image1list = getColors(image1list, number, ctx1);
    }
    //Cut down to X colors
    var finals = [];
    for (var i = 0; i < image1list.length; i++) {
        finals.push(image1list[i]);
    }
    if (engine == 0) {
        finals.sort((a, b) => b.similar - a.similar);
        for (var i = 0; i < finals.length; i++) {
            for (var e = 0; e < finals.length; e++) {
                if (isSimilar(finals[i], finals[e]) && finals.length > number) {
                    finals.splice(e, 1);
                    e--;
                }
            }
        }
        for (var i = number; i < finals.length; i++) {
            finals.splice(i, 1);
            i--;
        }
    }
    //Draw pallete
    var palette = document.getElementById("palette");
    var paletteCtx = palette.getContext("2d");
    palette.height = (finals.length * 32) / 4;
    palette.width = 128;
    var pos = {
        x: 1,
        y: 1
    };
    for (var i = 0; i < finals.length; i++) {
        paletteCtx.fillStyle = `rgb(${finals[i].r}, ${finals[i].g}, ${finals[i].b})`;
        paletteCtx.fillRect(pos.x, pos.y, 32, 32);
        pos.x += 32;
        if (pos.x > 100) {
            pos.x = 1;
            pos.y += 32;
        }
    }
    document.getElementById("pdownload").href = palette.toDataURL();
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
    document.getElementById("file2").textContent = e.target.files[0].name;
    window.setTimeout("initRender()", 10);
});

//Initial render
function initRender () {
    canvas2.height = (image2display.height / image2display.width) * canvas2.width;
    ctx2.drawImage(image2display, 0, 0, canvas2.width, canvas2.height);
    canvasDisplay.src = canvas2.toDataURL();
    document.getElementById("rdownload").href = canvas2.toDataURL();
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