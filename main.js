//Create canvas 1
var canvas1 = document.getElementById("canvas1");
var ctx1 = canvas1.getContext("2d");
canvas1.width = 640;
//Select image 1
var image1 = document.getElementById("image1");
var image1display = document.getElementById("image1display");
image1.addEventListener("change", e => {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = (event) => {
        image1display.src = event.target.result;
    };
    reader.readAsDataURL(file);
    window.setTimeout("next()", 10);
});
//Display image 1
function next() {
    canvas1.height = (image1display.height / image1display.width) * canvas1.width;
    ctx1.drawImage(image1display, 0, 0, canvas1.width, canvas1.height);
}