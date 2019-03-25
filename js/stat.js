var datasets = JSON.parse(sessionStorage.getItem("datasets")) || [];
var summaries = JSON.parse(sessionStorage.getItem("summaries")) || [];
var totalDataset = JSON.parse(sessionStorage.getItem("totalDataset")) || [];
var totalSummary = JSON.parse(sessionStorage.getItem("totalSummary")) || [];
// var variable = sessionStorage.getItem("variable") || "";
// var name = sessionStorage.getItem("name") || "";
var variable = sessionStorage.getItem("variable") || ""; //variable to graph
var name = sessionStorage.getItem("name") || ""; //json property used to identify each dataset

function initialize(){
	datasets = [];
	summaries = [];
	totalDataset = [];
	totalSummary = [];

	let names = []; //prevent duplicates
	data.forEach((index) => {

		totalDataset.push(new Point("pooled",index[variable]));


		names.push(index[name]);
		if(names.filter(item => item == index[name]).length > 1){
			for(let j = 0; j < datasets.length; j++){
				if(datasets[j][0].name == index[name])
					datasets[j].push(new Point(index[name],index[variable]));

			}
		}else{
			datasets.push([]);
			datasets[datasets.length-1].push(new Point(index[name],index[variable]));
		}
	});

	for(dataset of datasets){
		dataset.sort((a, b) => a.point - b.point);
		summaries.push(new Summary(dataset.map(d => parseInt(d.point))));
	}

	totalDataset.sort((a, b) => a.point - b.point);
	totalSummary.push(new Summary(totalDataset.map(d => parseInt(d.point))));
	totalDataset = [totalDataset];

	sessionStorage.setItem("datasets", JSON.stringify(datasets));
	sessionStorage.setItem("summaries", JSON.stringify(summaries));
	sessionStorage.setItem("totalDataset", JSON.stringify(totalDataset));
	sessionStorage.setItem("totalSummary", JSON.stringify(totalSummary));
	sessionStorage.setItem("variable", variable);
	sessionStorage.setItem("name", name);
}

function reset(){
	data = [];
	datasets = [];
	summaries = [];
	totalDataset = [];
	totalSummary = [];
	variable = void 0;
	name = void 0;
}