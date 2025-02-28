document.addEventListener('DOMContentLoaded', function () {
    //CERINTA 1
    let canvas = document.querySelector("#canvasImagine");
    let canvasDiv = document.querySelector("#canvasDiv");
    let downloadBtn = document.querySelector("#downloadBtn");
    let openImageInput = document.querySelector("#openImage");
    let context = canvas.getContext("2d");

    function desenare(image, resetSelection = true) {
        const divWidth = canvasDiv.clientWidth;
        const divHeight = canvasDiv.clientHeight;

        let imgWidth = image.width;
        let imgHeight = image.height;

        
        if (imgWidth > divWidth || imgHeight > divHeight) {
            const scale = Math.min(divWidth / imgWidth, divHeight / imgHeight);
            imgWidth *= scale;
            imgHeight *= scale;
        }
         
        canvas.width = imgWidth; 
        canvas.height = imgHeight; 

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, imgWidth, imgHeight);

        
        currentImageData = context.getImageData(0, 0, canvas.width, canvas.height);

        
        if (resetSelection) {
            selection = null;
        }
    }

    // Drag and drop
    canvas.addEventListener('dragover', (e) => e.preventDefault());
    canvas.addEventListener('drop', function (e) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function () {
                img = new Image();
                img.onload = function () {
                    
                    desenare(img);
                    currentImageData = context.getImageData(0, 0, canvas.width, canvas.height);
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    });

    //Incarare imagine prin input
    openImageInput.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function () {
                img = new Image();
                img.onload = function () {
                    desenare(img);
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    });


    //Salvare imagine prin buton
    downloadBtn.addEventListener("click", function () {
        var imgData = canvas.toDataURL("image/png");
        var downloadLink = document.createElement("a");
        downloadLink.href = imgData;
        downloadLink.download = "imagine.png";

        downloadLink.click();
        document.body.removeChild(downloadLink);
    });



    //CERINTA 2
    let img = null; 
    let isSelecting = false;
    let x0 = 0, y0 = 0, x1 = 0, y1 = 0;
    let selection = null;

    
    let selectInput = document.querySelector("#select");
    selectInput.addEventListener("click", function () {
        if (img) {
            selection = {
                x0: 0,
                y0: 0,
                width: canvas.width,
                height: canvas.height,
            };
        }

        
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.setLineDash([5, 5]); 
        context.strokeRect(
            selection.x,
            selection.y,
            selection.width,
            selection.height
        );

        console.log("Entire image selected:", selection);

        isSelecting = true;
        canvas.style.cursor = "crosshair"; 
    });

    canvas.addEventListener("mousedown", function (e) {
        if (isSelecting) {
            const rect = canvas.getBoundingClientRect();
            x0 = e.clientX - rect.left;
            y0 = e.clientY - rect.top;
        }
    });

    
    canvas.addEventListener("mousemove", function (e) {
        if (isSelecting && e.buttons === 1) {
            const rect = canvas.getBoundingClientRect();
            x1 = e.clientX - rect.left;
            y1 = e.clientY - rect.top;

            
            if (currentImageData) {
                context.putImageData(currentImageData, 0, 0);
            }

            
            context.strokeStyle = "blue";
            context.lineWidth = 2;
            context.setLineDash([5, 5]); 
            context.strokeRect(
                Math.min(x0, x1),
                Math.min(y0, y1),
                Math.abs(x1 - x0),
                Math.abs(y1 - y0)
            );
        }
    });

    canvas.addEventListener("mouseup", function () {
        if (isSelecting) {
            isSelecting = false;
            canvas.style.cursor = "default";
            context.setLineDash([]);

            
            selection = {
                x: Math.min(x0, x1),
                y: Math.min(y0, y1),
                width: Math.abs(x1 - x0),
                height: Math.abs(y1 - y0),
            };

            console.log("Selected area:", selection);
        }
    });

    //CERINTA 3

    //Crop imagine basic
    let croptInput = document.querySelector("#crop");
    croptInput.addEventListener("click", function () {
        if (selection) {
            const croppedImg = context.getImageData(
                selection.x,
                selection.y,
                selection.width,
                selection.height
            );

            
            canvas.width = selection.width;
            canvas.height = selection.height;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.putImageData(croppedImg, 0, 0);

            
            const croppedCanvas = document.createElement("canvas");
            croppedCanvas.width = canvas.width;
            croppedCanvas.height = canvas.height;
            const croppedContext = croppedCanvas.getContext("2d");
            croppedContext.putImageData(croppedImg, 0, 0);

            
            img = new Image();
            img.src = croppedCanvas.toDataURL();

            
            currentImageData = context.getImageData(0, 0, canvas.width, canvas.height);

            
            selection = null;

            console.log("Image cropped");
        } else {
            alert("Selectați o zonă înainte de a tăia!");
        }
    });

    //CERINTA 4
    //aplicare efect ales de către utilizator pe o zonă selectată din imagine

    let effectsButton = document.querySelector("#efect");
    let effectsDropdown = document.querySelector("#effectSelect");

    effectsButton.addEventListener("click", function () {
        if (!selection) {
            alert("Selectați o zonă pentru a aplica efectul!");
            return;
        }

        const effect = effectsDropdown.value;

        const x = Math.floor(selection.x);
        const y = Math.floor(selection.y);
        const width = Math.floor(selection.width);
        const height = Math.floor(selection.height);

        const imageData = context.getImageData(x, y, width, height);
        const data = imageData.data;

        switch (effect) {
            case "grayscale":
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = avg;       
                    data[i + 1] = avg;   
                    data[i + 2] = avg;   
                }
                break;

            case "invert":
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];       
                    data[i + 1] = 255 - data[i + 1]; 
                    data[i + 2] = 255 - data[i + 2]; 
                }
                break;

            case "brightness":
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(data[i] + 50, 255);       
                    data[i + 1] = Math.min(data[i + 1] + 50, 255); 
                    data[i + 2] = Math.min(data[i + 2] + 50, 255); 
                }
                break;

            default:
                alert("Efect necunoscut!");
                return;
        }

        context.putImageData(imageData, x, y);
        currentImageData = context.getImageData(0, 0, canvas.width, canvas.height);

        console.log(`Efectul ${effect} a fost aplicat!`);
    });

    //CERINTA 5
    // Scalare imagine cu păstrarea proporțiilor
    let scaleInputButton = document.querySelector("#scale");

    scaleInputButton.addEventListener("click", function () {
        if (!img) {
            alert("Încărcați o imagine mai întâi!");
            return;
        }

        
        let newWidth = parseInt(prompt("Introduceți lățimea nouă (lăsați gol pentru a specifica doar înălțimea):", ""));
        let newHeight = parseInt(prompt("Introduceți înălțimea nouă (lăsați gol pentru a specifica doar lățimea):", ""));

        if (isNaN(newWidth) && isNaN(newHeight)) {
            alert("Trebuie să introduceți cel puțin lățimea sau înălțimea nouă!");
            return;
        }

        
        if (!isNaN(newWidth)) {
            newHeight = (newWidth / img.width) * img.height;
        } else if (!isNaN(newHeight)) {
            newWidth = (newHeight / img.height) * img.width;
        }

        
        canvas.width = newWidth;
        canvas.height = newHeight;

        
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, newWidth, newHeight);

        
        img.width = newWidth;
        img.height = newHeight;

        console.log(`Imagine scalată la dimensiunile: ${newWidth}x${newHeight}`);
    });


    //CERINTA 6
    // Adăugare text pe imagine
        let textInputButton = document.querySelector("#text");

        textInputButton.addEventListener("click", function () {
            if (!img) {
                alert("Încărcați o imagine mai întâi!");
                return;
            }

            
            let text = prompt("Introduceți textul de afișat:", "Text de test");
            if (!text) return;

            let fontSize = parseInt(prompt("Introduceți dimensiunea textului (în pixeli):", "20"));
            if (isNaN(fontSize) || fontSize <= 0) {
                alert("Dimensiunea textului trebuie să fie un număr pozitiv!");
                return;
            }

            let color = prompt("Introduceți culoarea textului (ex: 'red', '#0000FF', etc.):", "black");
            if (!color) color = "black";

            let posX = parseInt(prompt("Introduceți poziția X (în pixeli):", "50"));
            let posY = parseInt(prompt("Introduceți poziția Y (în pixeli):", "50"));

            if (isNaN(posX) || isNaN(posY)) {
                alert("Pozițiile X și Y trebuie să fie numere!");
                return;
            }

           
            context.font = `${fontSize}px Arial`;
            context.fillStyle = color;
            context.fillText(text, posX, posY);

            console.log(`Text adăugat: '${text}' la (${posX}, ${posY}) cu dimensiunea ${fontSize}px și culoarea ${color}`);
        });

    //CERINTA 7
    //afișare continuu histogramă de culoare pentru selecția curentă 
    function calculateHistogram(imageData) {
        const histogram = {
            r: new Array(256).fill(0),
            g: new Array(256).fill(0),
            b: new Array(256).fill(0),
        };

        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            histogram.r[data[i]]++;     
            histogram.g[data[i + 1]]++; 
            histogram.b[data[i + 2]]++;
        }

        return histogram;
    }

    function drawHistogram(histogram) {
        const canvas = document.getElementById("histogramCanvas");
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const maxCount = Math.max(
            ...histogram.r,
            ...histogram.g,
            ...histogram.b
        );

        
        const scale = canvas.height / maxCount;

        for (let i = 0; i < 256; i++) {
            const x = i;

            
            ctx.fillStyle = "red";
            ctx.fillRect(x, canvas.height - histogram.r[i] * scale, 1, histogram.r[i] * scale);

            
            ctx.fillStyle = "green";
            ctx.fillRect(x, canvas.height - histogram.g[i] * scale, 1, histogram.g[i] * scale);

            
            ctx.fillStyle = "blue";
            ctx.fillRect(x, canvas.height - histogram.b[i] * scale, 1, histogram.b[i] * scale);
        }
    }

    
    canvas.addEventListener("mousemove", function (e) {
        if (isSelecting) {
            const selectionData = context.getImageData(
                Math.min(x0, x1),
                Math.min(y0, y1),
                Math.abs(x1 - x0),
                Math.abs(y1 - y0)
            );

            const histogram = calculateHistogram(selectionData);
            drawHistogram(histogram);
        }
    });

    canvas.addEventListener("mouseup", function () {
        if (isSelecting) {
            const selectionData = context.getImageData(
                selection.x,
                selection.y,
                selection.width,
                selection.height
            );

            const histogram = calculateHistogram(selectionData);
            drawHistogram(histogram);
        }
    });



    //CERINTA 8
    // Mutare selecție folosind mouse-ul și tasta Shift
    


    //CERINTA 9
    // Ștergere selecție - pixelii din selecție devin albi
    let deleteInputButton = document.querySelector("#delete");

    deleteInputButton.addEventListener("click", function () {
        if (selection) {
            context.clearRect(selection.x, selection.y, selection.width, selection.height);
            context.fillStyle = "white";
            context.fillRect(selection.x, selection.y, selection.width, selection.height);

            
            currentImageData = context.getImageData(0, 0, canvas.width, canvas.height);

            console.log("Selection cleared:", selection);
            selection = null;
        } else {
            alert("Selectați o zonă înainte de a șterge!");
        }
    });


});

