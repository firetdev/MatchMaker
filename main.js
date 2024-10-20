var image1 = document.getElementById("image1");
var image1display = document.getElementById("image1display");
image1.addEventListener("change", e => {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = (event) => {
        image1display.src = event.target.result;
    };
    reader.readAsDataURL(file);
});