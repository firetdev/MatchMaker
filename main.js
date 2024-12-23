// The script for MatchMaker, which creates palettes from images and recolors images to match palettes

let colorlist = [];  // Palette
let engine = 0;  // System to use to get palette
let fileSelected = false;  // Check whether file to make palette from has been selected (used when changing engines)

//
// FUNCTIONS
//

// Change engines
function swapEngine() {
    engine == 0 ? engine = 1 : engine = 0;
    document.getElementById('engine').textContent = `Engine ${engine}`;
    if (fileSelected) {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('beforeloading').style.display = 'none';
        window.setTimeout('getPalette()', 1000);
    }
}

// Alternate way to make palette
function getColors(clrs, num) {
    let centers = [];
    let oldCenters = [];
    let groups = [];
    for (let i = 0; i < num; i += 1) {
        let a = Math.floor(Math.random() * clrs.length);
        let newColor = clrs[a];
        for (let e = 0; e < centers.length; e += 1) {
            while (isSimilar(centers[e], newColor)) {
                a = Math.floor(Math.random() * clrs.length);
                newColor = clrs[a];
            }
        }
        centers.push(newColor);
        groups.push([]);
    }
    let iterations = 0;
    const maxIterations = 100;
    while (iterations < maxIterations) {
        iterations += 1;
        groups = centers.map(() => []);
        for (let u = 0; u < 3; u += 1) {
            for (let i = 0; i < clrs.length; i += 1) {
                let prevDist = 10000000;
                let point = 0;  // Index of center point which color is closest to
                for (let e = 0; e < centers.length; e += 1) {
                    const diff = {
                        r: centers[e].r - clrs[i].r,
                        g: centers[e].g - clrs[i].g,
                        b: centers[e].b - clrs[i].b
                    };
                    const dist = Math.sqrt(diff.r * diff.r + diff.g * diff.g + diff.b * diff.b);
                    if (dist < prevDist) {
                        prevDist = dist;
                        point = e;
                    }
                }
                groups[point].push(clrs[i]);
            }
            for (let i = 0; i < centers.length; i += 1) {
                const totals = {
                    r: 0,
                    g: 0,
                    b: 0
                };
                for (let e = 0; e < groups[i].length; e += 1) {
                    totals.r += groups[i][e].r;
                    totals.g += groups[i][e].g;
                    totals.b += groups[i][e].b;
                }
                oldCenters = centers;
                if (groups[i].length > 0) {
                    centers[i].r = totals.r / groups[i].length;
                    centers[i].g = totals.g / groups[i].length;
                    centers[i].b = totals.b / groups[i].length;
                }
                for (let e = 0; e < centers.length; e += 1) {
                    if (Math.abs(centers[i].r - oldCenters[i].r) > 1 || Math.abs(centers[i].g - oldCenters[i].g) > 1 || Math.abs(centers[i].b - oldCenters[i].b) > 1)
                        break;
                }
            }
        }
    }
    return centers;
}

// Color object
function Clr(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.similar = 0;
}

// Get list of pixel colors in the image
function listOfColors(img, con) {
    const list = [];
    for (let i = 0; i < img.height; i += 1) {
        for (let e = 0; e < img.width; e += 1) {
            list.push(new Clr(con.getImageData(e, i, 1, 1).data[0], con.getImageData(e, i, 1, 1).data[1], con.getImageData(e, i, 1, 1).data[2]));
        }
    }
    return list;
}

// Are two colors similar?
function isSimilar(c1, c2) {
    const difference = {
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
    const total = difference.r + difference.g + difference.b;
    if (difference.r >= 45 || difference.g >= 45 || difference.b >= 45) 
        return false;
    if (total == 0) {
        if (engine == 1)
            return true;  // Engine 1 will not cut out identical colors later
        if (engine == 0)
            return false;  // Engine 0 will, and needs them to not be included in the similar count
    }
    if (total <= 100)
        return true;
}

// Which color is most similar?
function mostSimilar(color) {
    let prevDifference = 10000000;
    let prev;
    for (let i = 0; i < colorlist.length; i += 1) {
        const difference = {
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
        let total = difference.r + difference.g + difference.b;
        if (difference.r >= 45 || difference.g >= 45 || difference.b >= 45) 
            total += 50;
        if (total < prevDifference) {
            prevDifference = total;
            prev = colorlist[i];
        }
    }
    return prev;
}

//
// PART 1 (palette making)
//

// Create canvas 1
const canvas1 = document.getElementById('canvas1');
const ctx1 = canvas1.getContext('2d', {willReadFrequently: true});
canvas1.width = 480;

// Select image 1
const image1 = document.getElementById('image1');
const image1display = document.getElementById('image1display');
image1.addEventListener('change', e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        image1display.src = event.target.result;
    };
    reader.readAsDataURL(file);
    document.getElementById('file1').textContent = e.target.files[0].name;
    document.getElementById('loading').style.display = 'block';
    document.getElementById('beforeloading').style.display = 'none';
    fileSelected = true;
    setTimeout('getPalette()', 10);
});

// Activates when image is selected
function getPalette() {
    const number = document.getElementById('number').value;
    canvas1.height = (image1display.height / image1display.width) * canvas1.width;
    ctx1.drawImage(image1display, 0, 0, canvas1.width, canvas1.height);
    const image1list2 = listOfColors(image1display, ctx1);
    let image1list = [];
    // Speed up processing by only including 1 in 25 pixels
    for (let i = 0; i < image1list2.length; i += 1) {
        if (i % 25 == 0)
            image1list.push(image1list2[i]);
    }
    if (engine == 0) {
        // Loop to count similars and remove duplicates
        for (let i = 0; i < image1list.length; i += 1) {
            for (let e = 0; e < image1list.length; e += 1) {
                // Don't count self
                if (i == e)
                    continue;
                const difference = {
                    r: 0,
                    g: 0,
                    b: 0
                };
                difference.r = image1list[i].r - image1list[e].r;
                difference.g = image1list[i].g - image1list[e].g;
                difference.b = image1list[i].b - image1list[e].b;
                // Unsigned/absolute value
                if (difference.r < 0)
                    difference.r *= -1;
                if (difference.g < 0)
                    difference.g *= -1;
                if (difference.b < 0)
                    difference.b *= -1;
                // Remove duplicates, count similar
                if (difference.r == 0 && difference.g == 0 && difference.b == 0) {
                    image1list.splice(e, 1);
                    e -= 1;
                } else if (difference.r < 25 && difference.g < 25 && difference.b < 25) {
                    image1list[i].similar += 1;
                }
            }
        }
    } else {
        image1list = getColors(image1list, number);
    }
    // Cut down to X colors
    const finals = [];
    for (let i = 0; i < image1list.length; i += 1) {
        finals.push(image1list[i]);
    }
    if (engine == 0) {
        finals.sort((a, b) => b.similar - a.similar);
        for (let i = 0; i < finals.length; i += 1) {
            for (let e = 0; e < finals.length; e += 1) {
                if (isSimilar(finals[i], finals[e]) && finals.length > number) {
                    finals.splice(e, 1);
                    e -= 1;
                }
            }
        }
        for (let i = number; i < finals.length; i += 1) {
            finals.splice(i, 1);
            i -= 1;
        }
    }
    // Draw pallete
    const palette = document.getElementById('palette');
    const paletteCtx = palette.getContext('2d');
    palette.height = (finals.length * 32) / 4;
    palette.width = 128;
    const pos = {
        x: 1,
        y: 1
    };
    for (let i = 0; i < finals.length; i += 1) {
        paletteCtx.fillStyle = `rgb(${finals[i].r}, ${finals[i].g}, ${finals[i].b})`;
        paletteCtx.fillRect(pos.x, pos.y, 32, 32);
        pos.x += 32;
        if (pos.x > 100) {
            pos.x = 1;
            pos.y += 32;
        }
    }
    document.getElementById('pdownload').href = palette.toDataURL();
    for (let i = 0; i < finals.length; i += 1) {
        document.getElementById('txtcontent').textContent += `rgb(${finals[i].r},${finals[i].g},${finals[i].b})\n`;
    }
    const contentBlob = new Blob([document.getElementById('txtcontent').textContent], {type: 'text/plain'});
    document.getElementById('pdownload2').href = URL.createObjectURL(contentBlob);
    colorlist = finals;
    document.getElementById('loading').style.display = 'none';
    document.getElementById('beforeloading').style.display = 'block';
}

//
// PART 2 (recoloring)
//

// Create canvas 2
const canvas2 = document.getElementById('canvas2');
const ctx2 = canvas2.getContext('2d', {willReadFrequently: true});
const canvasDisplay = document.getElementById('canvasdata');
canvas2.width = 480;

// Select image2
const image2 = document.getElementById('image2');
const image2display = document.getElementById('image2display');
image2.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        image2display.src = event.target.result;
    };
    reader.readAsDataURL(file);
    document.getElementById('file2').textContent = e.target.files[0].name;
    setTimeout('initRender()', 10);
});

// Initial render
function initRender() {
    canvas2.height = (image2display.height / image2display.width) * canvas2.width;
    ctx2.drawImage(image2display, 0, 0, canvas2.width, canvas2.height);
    canvasDisplay.src = canvas2.toDataURL();
    document.getElementById('rdownload').href = canvas2.toDataURL();
}

// Recolor image
function recolor() {
    const list = listOfColors(canvasDisplay, ctx2);
    const position = {
        x: 0,
        y: 1
    };
    for (let i = 0; i < list.length; i += 1) {
        position.x += 1;
        if (position.x > 480) {
            position.x = 1;
            position.y += 1;
        }
        list[i].r = mostSimilar(list[i]).r;
        list[i].g = mostSimilar(list[i]).g;
        list[i].b = mostSimilar(list[i]).b;
        ctx2.fillStyle = `rgb(${list[i].r}, ${list[i].g}, ${list[i].b})`;
        ctx2.fillRect(position.x, position.y, 1, 1);
    }
}