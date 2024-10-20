function Clr (r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.similar = 0;
}

function listOfColors (img) {
    var list = [];
    img.willReadFrequently = true;
    for (var i = 0; i < img.height; i++) {
        for (var e = 0; e < img.width; e++) {
            list.push(new Clr(ctx1.getImageData(e, i, 1, 1).data[0], ctx1.getImageData(e, i, 1, 1).data[1], ctx1.getImageData(e, i, 1, 1).data[2]));
        }
    }
    return list;
}

//Create canvas 1
var canvas1 = document.getElementById("canvas1");
var ctx1 = canvas1.getContext("2d");
canvas1.width = 640;

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
    window.setTimeout("next()", 10);
});

//Activates when image is selected
function next () {
    var number = parseInt(document.getElementById("number"));
    canvas1.height = (image1display.height / image1display.width) * canvas1.width;
    ctx1.drawImage(image1display, 0, 0, canvas1.width, canvas1.height);
    var image1list2 = listOfColors(image1display);
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
    console.log(image1list);
}