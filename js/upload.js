var data = JSON.parse(sessionStorage.getItem("data")) || [];
var variable = sessionStorage.getItem("variable") || "";
var name = sessionStorage.getItem("name") || "";

document.querySelector("#upload-file").onchange = (evt) => {
	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {
  		// Great success! All the File APIs are supported.
  	} else {
  		alert('The File APIs are not fully supported in this browser.');
  	}


  	document.querySelector("#alert-invalid").style.display = "none";

    var file = evt.target.files[0]; // FileList object

    var extension = file.name.split('.').pop().toLowerCase();  //file extension from input file

    if(extension != "txt" && extension != "json"){
    	document.querySelector("#alert-invalid").innerHTML = '<strong>Invalid file type!</strong> You should upload a JSON or text file that contains a JSON array.<button type=\"button\" class=\"close\"><span aria-hidden=\"true\">&times;</span></button>'
    	document.querySelector("#alert-invalid").style.display = "block";
    	document.querySelector(".custom-file-label").classList.add("border-danger");
    	document.querySelector(".custom-file-label").innerText = "Choose file";
    	return;
    }
    var reader = new FileReader();


    data = "";
    reader.onload = event => {
    	try {
    		data = JSON.parse(event.target.result);
    		document.querySelector(".custom-file-label").classList.remove("border-danger");
    		document.querySelector(".custom-file-label").classList.add("border-success");
    		document.querySelector("#feedback-file").classList.remove("invalid-feedback");
    		document.querySelector("#feedback-file").classList.add("valid-feedback");
    		document.querySelector("#feedback-file").innerHTML = 'Looks good!';
    		document.querySelector("#feedback-file").style.display = "block";
    		document.querySelector(".custom-file-label").innerText = file.name;
    		setVariables();
    		sessionStorage.setItem("data", JSON.stringify(data));
    	} catch(e) {
    		document.querySelector("#alert-invalid").innerHTML = '<strong>Invalid file type!</strong> You should upload a JSON or text file that contains a JSON array.<button type=\"button\" class=\"close\"><span aria-hidden=\"true\">&times;</span></button>';
    		document.querySelector('.close').onclick = () => document.querySelector('#alert-invalid').style.display = 'none';
    		document.querySelector("#alert-invalid").style.display = "block";
    		document.querySelector(".custom-file-label").classList.remove("border-success");
    		document.querySelector("#feedback-file").classList.remove("valid-feedback");
    		document.querySelector("#feedback-file").classList.add("invalid-feedback");
    		document.querySelector("#feedback-file").innerHTML = '<strong>Invalid file type!</strong> You should upload a JSON or text file that contains a JSON array.';
    		document.querySelector(".invalid-feedback").style.display = "block";
    		document.querySelector(".custom-file-label").classList.add("border-danger");
    		document.querySelector(".custom-file-label").innerText = "Choose file";
    		document.querySelector(".selection").style.display = "none";
    		document.querySelector("#quantitative").innerHTML = "";
    		document.querySelector("#categorical").innerHTML = "";
    		for(let node of document.querySelectorAll(".selection"))
    			node.style.display = "none";
    		reset();
    		return;
    	}

    };
    reader.onerror = error => reject(error);
    

    // Read in the file as a string.
    reader.readAsText(file);
    
};


document.querySelector("#upload-url-btn").onclick = uploadURL;
document.querySelector("#upload-url").onkeyup = (e) => {if(e.keyCode == 13) uploadURL()}; //enter

function uploadURL(){
	document.querySelector("#alert-invalid").style.display = "none";

	var url = document.querySelector("#upload-url").value;
	url = url.includes("https://") ? url : ("https://" + url);
	fetch(url)
	.then( (response)=>{
		return response.json();
	})
	.then( (json)=>{
		data = json;
		document.querySelector("#upload-url").classList.remove("border-danger");
		document.querySelector("#upload-url").classList.add("border-success");
		document.querySelector("#feedback-url").classList.remove("invalid-feedback");
		document.querySelector("#feedback-url").classList.add("valid-feedback");
		document.querySelector("#feedback-url").innerHTML = 'Looks good!';
		document.querySelector("#feedback-url").style.display = "block";
		setVariables();
		sessionStorage.setItem("data", JSON.stringify(data));
	})
	.catch(e => {
		document.querySelector("#alert-invalid").innerHTML = '<strong>Improper URL!</strong> The URL should be valid and should direct to a JSON array.<button type=\"button\" class=\"close\"><span aria-hidden=\"true\">&times;</span></button>';
		document.querySelector('.close').onclick = () => document.querySelector('#alert-invalid').style.display = 'none';
		document.querySelector("#alert-invalid").style.display = "block";
		document.querySelector("#upload-url").classList.remove("border-success");
		document.querySelector("#upload-url").classList.add("border-danger");
		document.querySelector("#feedback-url").classList.remove("valid-feedback");
		document.querySelector("#feedback-url").classList.add("invalid-feedback");
		document.querySelector("#feedback-url").innerHTML = '<strong>Improper URL!</strong> The URL should be valid and should direct to a JSON array.';
		document.querySelector(".invalid-feedback").style.display = "block";
		document.querySelector(".selection").style.display = "none";
		document.querySelector("#quantitative").innerHTML = "";
		document.querySelector("#categorical").innerHTML = "";
		for(let node of document.querySelectorAll(".selection"))
			node.style.display = "none";
		return;
		reset();
	});;
}

document.querySelector("#upload-text-btn").onclick = uploadText;
document.querySelector("#upload-text").onkeyup = (e) => {if(e.keyCode == 13) uploadText()}; //enter

function uploadText(){
	document.querySelector("#alert-invalid").style.display = "none";
	try{
		data = JSON.parse(document.querySelector("#upload-text").value);
		document.querySelector("#upload-text").value;
		document.querySelector("#upload-text").classList.remove("border-danger");
		document.querySelector("#upload-text").classList.add("border-success");
		document.querySelector("#feedback-text").classList.remove("invalid-feedback");
		document.querySelector("#feedback-text").classList.add("valid-feedback");
		document.querySelector("#feedback-text").innerHTML = 'Looks good!';
		document.querySelector("#feedback-text").style.display = "block";
		setVariables();
		sessionStorage.setItem("data", JSON.stringify(data));
	}
	catch(e){
		document.querySelector("#alert-invalid").innerHTML = '<strong>The text could not be parsed.</strong> The text should be valid and contain a JSON array.<button type=\"button\" class=\"close\"><span aria-hidden=\"true\">&times;</span></button>';
		document.querySelector('.close').onclick = () => document.querySelector('#alert-invalid').style.display = 'none';
		document.querySelector("#alert-invalid").style.display = "block";
		document.querySelector("#upload-text").classList.remove("border-success");
		document.querySelector("#upload-text").classList.add("border-danger");
		document.querySelector("#feedback-text").classList.remove("valid-feedback");
		document.querySelector("#feedback-text").classList.add("invalid-feedback");
		document.querySelector("#feedback-text").innerHTML = '<strong>The text could not be parsed.</strong> The text should be valid and contain a JSON array.';
		document.querySelector(".invalid-feedback").style.display = "block";
		document.querySelector(".selection").style.display = "none";
		document.querySelector("#quantitative").innerHTML = "";
		document.querySelector("#categorical").innerHTML = "";
		for(let node of document.querySelectorAll(".selection"))
			node.style.display = "none";
		reset();
		return;
	}
}
function setVariables(){
	document.querySelector("#quantitative").innerHTML = "";
	document.querySelector("#categorical").innerHTML = "";
	
	for(let key of Object.keys(data[0])){
		document.querySelector("#quantitative").innerHTML += `<label class=\"btn btn-secondary ${(key == variable) ? 'active' : ''}\"><input type=\"radio\" name=\"options\" autocomplete=\"off\">${key}<\/label>`;
		document.querySelector("#categorical").innerHTML += `<label class=\"btn btn-secondary ${(key == name) ? 'active' : ''}\"><input type=\"radio\" name=\"options\" autocomplete=\"off\">${key}<\/label>`;
	}
	for(let node of document.querySelectorAll(".selection"))
		node.style.display = "block";
}

document.querySelector("#quantitative").ondblclick = () => {
	document.querySelector("#alert-invalid").style.display = "none";
	for(let label of document.querySelectorAll("#quantitative > label")){
		if(label.classList.contains("active") || label.classList.contains("focus")){
			variable = label.innerText;
			break;
		}
	}
	if(variable === name){
		document.querySelector("#alert-invalid").innerHTML = '<strong>The quantitative variable cannot equal the categorical variable</strong> Please select another variable.<button type=\"button\" class=\"close\"><span aria-hidden=\"true\">&times;</span></button>';
		document.querySelector('.close').onclick = () => document.querySelector('#alert-invalid').style.display = 'none';
		document.querySelector("#alert-invalid").style.display = "block";
		return;
	}
	initialize();
};

document.querySelector("#categorical").ondblclick = () => {
	document.querySelector("#alert-invalid").style.display = "none";
	for(let label of document.querySelectorAll("#categorical > label")){
		if(label.classList.contains("active") || label.classList.contains("focus")){
			name = label.innerText;
			break;
		}
	}
	if(variable === name){
		document.querySelector("#alert-invalid").innerHTML = '<strong>The quantitative variable cannot equal the categorical variable</strong> Please select another variable.<button type=\"button\" class=\"close\"><span aria-hidden=\"true\">&times;</span></button>';
		document.querySelector('.close').onclick = () => document.querySelector('#alert-invalid').style.display = 'none';
		document.querySelector("#alert-invalid").style.display = "block";
		return;
	}
	initialize();
};
$('[data-toggle="tooltip"]').tooltip({trigger : 'hover'});
if(data != [] || data != void 0 || data != null)
	try {setVariables();}catch(e){}