var datasets = JSON.parse(sessionStorage.getItem("datasets")) || [];
var summaries = JSON.parse(sessionStorage.getItem("summaries")) || [];
var totalDataset = JSON.parse(sessionStorage.getItem("totalDataset")) || [];
var totalSummary = JSON.parse(sessionStorage.getItem("totalSummary")) || [];
var variable = sessionStorage.getItem("variable") || "";
var name = sessionStorage.getItem("name") || "";
var datasetsParam = datasets;
var summariesParam = summaries;
var type = sessionStorage.getItem("type") || "frequency";

var c = document.querySelector(".plot");
var ctx = c.getContext("2d");
yScale = 1;
c.width = window.innerWidth*.8;
c.height = window.innerHeight*yScale;

document.querySelector("#sidebar").style.width = ((window.innerWidth - c.width)*.8).toString() + "px";
document.querySelector("#sidebar").style.height = (window.innerHeight*.85).toString() + "px";

window.onresize = () => {
	c.width = window.innerWidth*.8;
	c.height = window.innerHeight*yScale;
	document.querySelector("#sidebar").style.width = ((window.innerWidth - c.width)*.8).toString() + "px";
	document.querySelector("#sidebar").style.height = (window.innerHeight*.85).toString() + "px";
	setup(datasetsParam,summariesParam);
}


var minX = .1*c.width; //bounds for graphs
var maxX =  .97*c.width;
var minY = .1*c.height
var maxY = .9*c.height;

var binSize = 0;
var interval = 10; 
var sections = [];
var sectionTitles = [];
var totalMaxPoints = 0;
var summariesPlot = [];
var datasetsPlot = [];
var xStart = Number.POSITIVE_INFINITY;
var xEnd = Number.NEGATIVE_INFINITY;
var maxLength = Number.NEGATIVE_INFINITY;
var primary;
var primaryDarkColors;
var primaryLightColors;
var modified = false;
var overlap = false;
setup(datasets,summaries);

function setup(datasets,summaries){
	sections = [];
	sectionTitles = [];
	totalMaxPoints = 0;
	summariesPlot = [];
	datasetsPlot = [];
	xStart = Number.POSITIVE_INFINITY;
	xEnd = Number.NEGATIVE_INFINITY;
	maxLength = Number.NEGATIVE_INFINITY;
	minX = .1*c.width; //bounds for graphs
	maxX =  .97*c.width;
	minY = .1*c.height
	maxY = .9*c.height;
	ctx.clearRect(0,0,c.width,c.height);

	//filter which dataset can be graphed
	for(let i = 0; i< datasets.length; i++){
		if(datasets[i][0].name != "unknown"){ //filter which datasets to graph
			datasetsPlot.push(datasets[i]);
			summariesPlot.push(summaries[i]);
		}
	}

	for(let summary of summariesPlot){
		totalMaxPoints+=summary.max;
		if(summary.max == 0)
			totalMaxPoints+=20;
	}
	let lineHeight = (maxY-minY)/totalMaxPoints; //pixels per point

	// var xStart = Number.POSITIVE_INFINITY;
	// var xEnd = Number.NEGATIVE_INFINITY;
	// var maxLength = Number.NEGATIVE_INFINITY;
	for(let i = 0, start = minY, end = lineHeight*summariesPlot[0].max; i < summariesPlot.length; i++){
		if(i != 0){
			start += lineHeight*summariesPlot[i-1].max;
			if(summariesPlot[i-1].max == 0)
			start+=20
		}

		
		end = start + lineHeight*summariesPlot[i].max;
		if(summariesPlot[i].max == 0)
			end += 20;
		sections.push(new Section(start,end));
		sectionTitles.push(new Section(start,end));

		if(xStart > Math.min(...datasetsPlot[i].map(d => parseInt(d.point))))
			xStart = Math.min(...datasetsPlot[i].map(d => parseInt(d.point)))
			
		if(xEnd < Math.max(...(datasetsPlot[i].map(d => d.point))))
			xEnd = Math.max(...(datasetsPlot[i].map(d => d.point)));

		// if(binSize < Math.ceil(Math.max(...datasetsPlot[i].map(d => parseInt(d.point)))/interval))
		// 	binSize = Math.ceil(Math.max(...datasetsPlot[i].map(d => parseInt(d.point)))/interval);


		if(maxLength < (datasetsPlot[0].map(d => d.point)).length);
			maxLength = (datasetsPlot[0].map(d => d.point)).length;
	}

	binSize = Math.ceil((xEnd-xStart)/interval);
	
	//x-axis
	ctx.beginPath();
	ctx.strokeStyle = "black";
	ctx.lineWidth = (maxX-minX)*.0025;
	ctx.moveTo(minX,maxY+(maxY-minY)*.06);
	ctx.lineTo(maxX,maxY+(maxY-minY)*.06);
	ctx.stroke();
	ctx.font = "16px Comic Sans MS";
	for(let i = 0, num = xStart; i <= interval; i++){
		ctx.beginPath();
		ctx.arc(minX+(maxX-minX)*i/interval,maxY+(maxY-minY)*.06,(maxX-minX)*.003,0, 2*Math.PI);
		ctx.fill();
		ctx.fillText(num,minX+(maxX-minX)*i/interval - ctx.measureText(num).width/2,maxY+(maxY-minY)*.10);
		num+=binSize;

	}
	ctx.font = "16px Comic Sans MS";
	ctx.fillText(variable,(maxX-minX) - ctx.measureText(variable).width/2-.37*c.width, maxY+(maxY-minY)*.12);

	primary = Array.from(sections, (m, i)=>`hsl(${Math.round(360*i/sections.length)}, 60%, 85%)`);
	primaryLightColors = Array.from(sections, (m, i)=>`hsl(${Math.round(360*i/sections.length)}, 60%, 90%)`);
	primaryDarkColors = Array.from(sections, (m, i)=>`hsl(${Math.round(360*i/sections.length)}, 60%, 40%)`);

	for(let i = 0; i < sections.length; i++){ 
		//sections
		
		var grd = ctx.createLinearGradient(minX,sections[i].minY,maxX-minX,sections[i].maxY-sections[i].minY);
		for(let  j= 0, interval = 0; j < primary.length; j++){
			grd.addColorStop(interval + j/primary.length, primary[j]);
		}
		ctx.fillStyle = grd;

		ctx.fillStyle = primary[i];
		ctx.fillRect(minX,sections[i].minY,maxX-minX,sections[i].maxY-sections[i].minY);

		ctx.fillStyle = primaryLightColors[i];
		ctx.fillRect(40, sections[i].minY,minX-40,sections[i].maxY-sections[i].minY);


		ctx.fillStyle = primaryDarkColors[i];
		ctx.font = "16px Comic Sans MS";
		ctx.fillText(datasetsPlot[i][0].name,(minX-ctx.measureText(datasetsPlot[i][0].name).width+40)/2,sections[i].minY+(sections[i].maxY-sections[i].minY)/1.75);

		//title
		ctx.fillStyle = "black";
		ctx.font = "26px Comic Sans MS";
		ctx.fillText(`${name} vs ${variable}`,(maxX-minX) - ctx.measureText(`${name} vs ${variable}`).width/2-.37*c.width, minY*.6);
	}
	if(type == "frequency"){
		if(overlap)
			renderBoxPlot();
		renderFrequency();
	}
	else if(type == "boxplot"){
		renderBoxPlot();
		if(overlap)
			renderFrequency();
	}
}

function renderFrequency(){
	for(let i = 0; i < sections.length; i++){ 
		let frequencies = getFrequency(datasetsPlot[i],binSize);
		let maxPoint = datasetsPlot[i][datasetsPlot[i].length-1].point;
		let maxFrequency = Number.NEGATIVE_INFINITY;
		for(key in frequencies){
			if(maxFrequency < frequencies[key])
				maxFrequency = frequencies[key];
		}
		ctx.lineWidth = (maxX-minX)*.001;
		for(key in frequencies){ //key is x, frequencies[key] is y
			ctx.beginPath();
			ctx.strokeStyle = primaryDarkColors[i];
			ctx.moveTo(minX+(key-xStart)/(xEnd-xStart)*(maxX-minX), sections[i].maxY);
			ctx.lineTo(minX+(key-xStart)/(xEnd-xStart)*(maxX-minX), sections[i].maxY - frequencies[key]/maxFrequency*(sections[i].maxY-sections[i].minY));
			ctx.stroke();
		}
	}
}

function renderBoxPlot(){
	for(let i = 0; i< sections.length; i++){
		ctx.strokeStyle = primaryDarkColors[i];
		ctx.fillStyle = primaryLightColors[i];

		//iqr
		ctx.beginPath();
		ctx.rect(minX+(summariesPlot[i].q1-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - 3*(sections[i].maxY-sections[i].minY)/4,(summariesPlot[i].iqr-xStart)/(xEnd-xStart)*(maxX-minX),(sections[i].maxY-sections[i].minY)/2);
		if(!overlap)
			ctx.fill();
		ctx.stroke();

		//median
		ctx.beginPath();
		ctx.moveTo(minX+(summariesPlot[i].median-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - (sections[i].maxY-sections[i].minY)/4);
		ctx.lineTo(minX+(summariesPlot[i].median-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - 3*(sections[i].maxY-sections[i].minY)/4);
		ctx.stroke();

		ctx.fillStyle = primaryDarkColors[i];

		if(modified){
			var max;
			var min;
			if(summariesPlot[i].highOutliers.length>0)
				max = parseInt(datasetsPlot[i][datasetsPlot[i].map(d => parseInt(d.point)).indexOf(summariesPlot[i].highOutliers[0])-1].point);
			else 
				max = summariesPlot[i].max;
			if(summariesPlot[i].lowOutliers.length>0)
				var min = parseInt(datasetsPlot[i][datasetsPlot[i].map(d => parseInt(d.point)).indexOf(summariesPlot[i].lowOutliers[summariesPlot[i].lowOutliers.length-1])+1].point);
			else 
				min = summariesPlot[i].min;
			
			//min
			ctx.beginPath();
			ctx.moveTo(minX+(min-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - 3*(sections[i].maxY-sections[i].minY)/8);
			ctx.lineTo(minX+(min-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - 5*(sections[i].maxY-sections[i].minY)/8);
			ctx.stroke();

			//max
			ctx.beginPath();
			ctx.moveTo(minX+(max-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - 3*(sections[i].maxY-sections[i].minY)/8);
			ctx.lineTo(minX+(max-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - 5*(sections[i].maxY-sections[i].minY)/8);
			ctx.stroke();

			//left fence
			ctx.beginPath();
			ctx.moveTo(minX+(min-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - (sections[i].maxY-sections[i].minY)/2);
			ctx.lineTo(minX+(summariesPlot[i].q1-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - (sections[i].maxY-sections[i].minY)/2);
			ctx.stroke();
			
			//right fence
			ctx.beginPath();
			ctx.moveTo(minX+(summariesPlot[i].q3-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - (sections[i].maxY-sections[i].minY)/2);
			ctx.lineTo(minX+(max-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - (sections[i].maxY-sections[i].minY)/2);
			ctx.stroke();

			//low outliers
			for(let low of summariesPlot[i].lowOutliers){
				ctx.beginPath();
				ctx.arc(minX+(low-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - (sections[i].maxY-sections[i].minY)/2,(maxX-minX)*.003,0, 2*Math.PI);
				ctx.fill();
			}
			
			//high outliers
			for(let high of summariesPlot[i].highOutliers){
				ctx.beginPath();
				ctx.arc(minX+(high-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - (sections[i].maxY-sections[i].minY)/2,(maxX-minX)*.003,0, 2*Math.PI);
				ctx.fill();
			}


		}
		else{
			//min
			ctx.beginPath();
			ctx.moveTo(minX+(summariesPlot[i].min-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - 3*(sections[i].maxY-sections[i].minY)/8);
			ctx.lineTo(minX+(summariesPlot[i].min-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - 5*(sections[i].maxY-sections[i].minY)/8);
			ctx.stroke();

			//max
			ctx.beginPath();
			ctx.moveTo(minX+(summariesPlot[i].max-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - 3*(sections[i].maxY-sections[i].minY)/8);
			ctx.lineTo(minX+(summariesPlot[i].max-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - 5*(sections[i].maxY-sections[i].minY)/8);
			ctx.stroke();

			//left fence
			ctx.beginPath();
			ctx.moveTo(minX+(summariesPlot[i].min-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - (sections[i].maxY-sections[i].minY)/2);
			ctx.lineTo(minX+(summariesPlot[i].q1-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - (sections[i].maxY-sections[i].minY)/2);
			ctx.stroke();

			//right fence
			ctx.beginPath();
			ctx.moveTo(minX+(summariesPlot[i].q3-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - (sections[i].maxY-sections[i].minY)/2);
			ctx.lineTo(minX+(summariesPlot[i].max-xStart)/(xEnd-xStart)*(maxX-minX),sections[i].maxY - (sections[i].maxY-sections[i].minY)/2);
			ctx.stroke();
		}
	}
}
function getFrequency(array,binSize){
	let object = {};
	for(let i = 0; i< array.length; i++){
		typeof object[array[i].point] === "undefined" ? object[array[i].point] = 1 : object[array[i].point]++;
	}
	return object;
}
document.querySelector("#sidebar").innerHTML += 
	`<div class="card" id="summary">
	    <h5 class="card-header">Summary</h5>
	    <div class="card-body">
	        <p class="card-text"><strong>Number<strong>: </p>
	        <p class="card-text"><strong>Mean<strong>: </p>
	        <p class="card-text"><strong>σ<strong>: </p>
	        <p class="card-text"><strong>S<sub>x</sub><strong>: </p>
	        <p class="card-text"><strong>Min<strong>: </p>
	        <p class="card-text"><strong>Q<sub>1</sub><strong>: </p>
	        <p class="card-text"><strong>Median<strong>: </p>
	        <p class="card-text"><strong>Q<sub>3</sub><strong>: </p>
	        <p class="card-text"><strong>Max<strong>: </p>
	        <p class="card-text"><strong>Range<strong>: </p>
	        <p class="card-text"><strong>IQR<strong>: </p>
	        <text class="card-text"><strong>Low Outliers<strong>: </text>
	        <text class="card-text"><strong>High Outliers<strong>: </text>
	    </div>
	</div>`;
document.querySelector(".bottomnav").innerHTML += 
	`<div class ="row">
	<div class "col-lg-4 col-md-3 col-xs-2">
	<div class="card" id="select">
	    <h5 class="card-header">${name}</h5>
	    <div class="card-body"></div>
	</div>
	</div>
	<div class "col-lg-4 col-md-3 col-xs-2">
		<div class="card" id="range">
	    <h5 class="card-header">${variable} range</h5>
	    <div class="card-body">
	        <div class="input-group">
	            <div class="input-group-prepend">
	                <span class="input-group-text">Minimum</span>
	            </div>
	            <input type="text" class="form-control" id="min">
	        </div>
	        <div class="input-group">
	            <div class="input-group-prepend">
	                <span class="input-group-text">Maximum</span>
	            </div>
	            <input type="text" class="form-control" id="max">
	            
	        </div>
	    </div>
	</div>
	</div>
	<div class "col-lg-4 col-md-3 col-xs">
	<div class="card" id="extras">
	    <h5 class="card-header">Extras</h5>
	    <div class="card-body">
	        <div class="input-group">
	            <div class="input-group-prepend">
	                <span class="input-group-text">y-scale</span>
	            </div>
	            <input type="text" class="form-control" id="y-scale">
			</div>
			<div class="input-group">
	            <div class="input-group-prepend">
	                <span class="input-group-text">Intervals</span>
	            </div>
	            <input type="text" class="form-control" id="interval">
	        </div>
	        <div class="input-group">
	        	<div class="form-check form-check-inline">
		        	<input class="form-check-input" type="checkbox" value="overlap" id="overlap">
		        	<label class="form-check-label" for="overlap">Overlap</label>
	        	</div>
    		</div>
	    </div>
	</div>
	</div>
	<br>
	</div>
	</div>
	<button id="filter" type="submit" class="btn btn-primary">Filter</button>
	<button id="reset" type="submit" class="btn btn-primary">Reset</button>`;
if(type == "boxplot" && !document.querySelector("#extras .card-body").contains(document.getElementById("modified-group"))){
	document.querySelector("#extras .card-body").innerHTML += 
	`<div class="input-group" id="modified-group">
		<div class="form-check form-check-inline">
			<input class="form-check-input" type="checkbox" value="modified" id="modified">
			<label class="form-check-label" for="modified">Modified</label>
		</div>
    </div>`;
}
c.onmousemove = (e) =>{
      let xPos = e.clientX - c.getBoundingClientRect().left;
      let yPos = e.clientY - c.getBoundingClientRect().top;
      let hover = false;
	if(sections != []){
		for(let i = 0; i< sections.length; i++){
			if(xPos >= minX-40 && xPos < maxX && yPos >= sections[i].minY && yPos < sections[i].maxY){
				hover = true;
				document.querySelector("#summary").innerHTML = 
				`<div class="card" id="summary">
					<h5 class="card-header">Summary</h5>
					<div class="card-body">
						<p class="card-text" style='color:${primaryDarkColors[i]};'><strong>Number</strong>: ${summariesPlot[i].number}</p>
						<p class="card-text" style='color:${primaryDarkColors[i]};'><strong>Mean</strong>: ${summariesPlot[i].mean}</p>
						<p class="card-text" style='color:${primaryDarkColors[i]};'><strong>σ</strong>: ${summariesPlot[i].stdPopulation}</p>
						<p class="card-text" style='color:${primaryDarkColors[i]};'><strong>S<sub>x</sub></strong>: ${summariesPlot[i].stdSample}</p>
						<p class="card-text" style='color:${primaryDarkColors[i]};'><strong>Min</strong>: ${summariesPlot[i].min}</p>
						<p class="card-text" style='color:${primaryDarkColors[i]};'><strong>Q<sub>1</sub></strong>: ${summariesPlot[i].q1}</p>
						<p class="card-text" style='color:${primaryDarkColors[i]};'><strong>Median</strong>: ${summariesPlot[i].median}</p>
						<p class="card-text" style='color:${primaryDarkColors[i]};'><strong>Q<sub>3</sub></strong>: ${summariesPlot[i].q3}</p>
						<p class="card-text" style='color:${primaryDarkColors[i]};'><strong>Max</strong>: ${summariesPlot[i].max}</p>
						<p class="card-text" style='color:${primaryDarkColors[i]};'><strong>Range</strong>: ${summariesPlot[i].range}</p>
						<p class="card-text" style='color:${primaryDarkColors[i]};'><strong>IQR</strong>: ${summariesPlot[i].iqr}</p>
						<text class="card-text" style='color:${primaryDarkColors[i]};'><strong>Low Outliers</strong>: ${summariesPlot[i].lowOutliers.join(', ')}</text>
						<text class="card-text" style='color:${primaryDarkColors[i]};'><strong>High Outliers</strong>: ${summariesPlot[i].highOutliers.join(', ')}</text>
					</div>
				</div>`
			}
		}
	}
	if(!hover){
		document.querySelector("#summary").innerHTML = 
			`<div class="card" id="summary">
			    <h5 class="card-header">Summary</h5>
			    <div class="card-body">
			        <p class="card-text"><strong>Number<strong>: </p>
			        <p class="card-text"><strong>Mean<strong>: </p>
			        <p class="card-text"><strong>σ<strong>: </p>
			        <p class="card-text"><strong>S<sub>x</sub><strong>: </p>
			        <p class="card-text"><strong>Min<strong>: </p>
			        <p class="card-text"><strong>Q<sub>1</sub><strong>: </p>
			        <p class="card-text"><strong>Median<strong>: </p>
			        <p class="card-text"><strong>Q<sub>3</sub><strong>: </p>
			        <p class="card-text"><strong>Max<strong>: </p>
			        <p class="card-text"><strong>Range<strong>: </p>
			        <p class="card-text"><strong>IQR<strong>: </p>
			        <text class="card-text"><strong>Low Outliers<strong>: </text>
			        <text class="card-text"><strong>High Outliers<strong>: </text>
			    </div>
			</div>`
	}
}
document.querySelector("#select .card-body").innerHTML = "";
for(let i = 0; i< datasetsPlot.length; i++){
	document.querySelector("#select .card-body").innerHTML += 
	`<div class="form-check form-check-inline">
		<input checked class="form-check-input" type="checkbox" value="${datasetsPlot[i][0].name}" id="categorical${i}">
		<label class="form-check-label" for="categorical${i}">${datasetsPlot[i][0].name}</label>
	</div>`;
}
document.querySelector("#filter").onclick = () => {
	if(document.body.contains(document.querySelector("#modified")) && document.querySelector("#modified").checked)
		modified = true
	else
		modified = false;
	let min = parseInt(document.querySelector("#min").value);
	let max = parseInt(document.querySelector("#max").value);
	if(document.querySelector("#interval").value == ""){
		document.querySelector("#interval").value = 10;
	}
	interval = parseInt(document.querySelector("#interval").value);
	if(document.querySelector("#y-scale").value == ""){
		document.querySelector("#y-scale").value = 1;
	}
	yScale = parseFloat(document.querySelector("#y-scale").value);
	if(document.querySelector("#min").value == ""){
		document.querySelector("#min").value = Math.min(...summariesParam.map(s=>s.min));
		min = Math.min(...summariesParam.map(s=>s.min));
	}
	if(document.querySelector("#max").value == ""){
		document.querySelector("#max").value = Math.max(...summariesParam.map(s=>s.max));
		max = Math.max(...summariesParam.map(s=>s.max));
	}
	if(document.querySelector("#overlap").checked)
		overlap = true;
	else
		overlap = false;
	
	c.height = window.innerHeight*yScale;
	let filteredSummaries = [];
	let names = Array.from(document.querySelectorAll("#select .card-body .form-check input:checked")).map(t => t.value);
	if(document.querySelector("#pooled").checked){
		for(let input of Array.from(document.querySelectorAll("#select .card-body .form-check input")))
			input.checked = true;
		let filteredDatasets = totalDataset.map(d => d.filter(p=> p.point>=min && p.point<=max)).filter(arr => arr.length > 0);
		for(dataset of filteredDatasets)
			filteredSummaries.push(new Summary(dataset.map(d => parseInt(d.point))));
		setup(filteredDatasets,filteredSummaries);
		datasetsParam = filteredDatasets;
		summariesParam = filteredSummaries;
	}
	else{
		let filteredDatasets = datasets.filter(arr => names.includes(arr.map(d => d.name)[0])).map(d => d.filter(p=> p.point>=min && p.point<=max)).filter(arr => arr.length > 0);
		for(dataset of filteredDatasets)
			filteredSummaries.push(new Summary(dataset.map(d => parseInt(d.point))));
		setup(filteredDatasets,filteredSummaries);
		datasetsParam = filteredDatasets;
		summariesParam = filteredSummaries;
	}
};

document.querySelector("#select .card-body").innerHTML += 
	`<div class="form-check">
		<input class="form-check-input" type="checkbox" value="" id="pooled" ">
		<label class="form-check-label" for="pooled">pooled</label>
	</div>`;
document.querySelector("#reset").onclick = () => {
	for(let input of Array.from(document.querySelectorAll("#select .card-body .form-check input")))
		input.checked = true;
	document.querySelector("#pooled").checked = false;
	document.querySelector("#min").value = Math.min(totalSummary[0].min);
	document.querySelector("#max").value = Math.min(totalSummary[0].max);
	document.querySelector("#interval").value = 10;
	document.querySelector("#y-scale").value = 1;
	yScale = 1;
	interval = 10;
	c.height = window.innerHeight*yScale;
	if(document.body.contains(document.querySelector("#modified")))
		document.querySelector("#modified").checked = false;
	modified = false;
	overlap = false;
	setup(datasets, summaries);
	}

document.querySelector("#min").value = Math.min(totalSummary[0].min);
document.querySelector("#max").value = Math.min(totalSummary[0].max);
document.querySelector("#interval").value = interval;
document.querySelector("#y-scale").value = yScale;

document.querySelector("#nav-item-frequency").onclick = () => {
	sessionStorage.setItem("type", "frequency");
	type = "frequency";
	if(document.querySelector("#extras .card-body").contains(document.getElementById("modified-group")))
		document.querySelector("#extras .card-body").removeChild(document.getElementById("modified-group"));
	document.querySelector("#interval").value = 10;
	document.querySelector("#y-scale").value = 1;
	yScale = 1;
	interval = 10;
	c.height = window.innerHeight*yScale;
	modified = false;
	overlap = false;
	setup(datasets,summaries);
};
document.querySelector("#nav-item-boxplot").onclick = () => {
	sessionStorage.setItem("type", "boxplot");
	type = "boxplot";
	if(!document.querySelector("#extras .card-body").contains(document.getElementById("modified-group"))){
		document.querySelector("#extras .card-body").innerHTML += 
		`<div class="input-group" id="modified-group">
			<div class="form-check form-check-inline">
				<input class="form-check-input" type="checkbox" value="modified" id="modified">
				<label class="form-check-label" for="modified">Modified</label>
			</div>
	    </div>`;
	}
	document.querySelector("#interval").value = 10;
	document.querySelector("#y-scale").value = 1;
	yScale = 1;
	interval = 10;
	c.height = window.innerHeight*yScale;
	modified = false;
	overlap = false;
	document.querySelector("#pooled").checked = false;
	setup(datasets,summaries);
};