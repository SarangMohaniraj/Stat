class Point{
	constructor(name,point,extra){
		this.name = name;
		this.point = point;

		if(this.name == "")
			this.name = "unknown";

		if(this.point == "" || this.point == void 0){
			this.point = 0;
		}
	}
}
class Summary{
	constructor(dataset){
		this.number = dataset.length;
		this.min = Math.min(...dataset);
		this.max = Math.max(...dataset);
		this.mean = ((dataset.reduce((a,b) => a + b))/this.number).toFixed(2);
		this.stdPopulation = (Math.sqrt(dataset.map(point => Math.pow(point-this.mean,2)).reduce((a,b) => a + b)/this.number)).toFixed(2);
		this.stdSample = (Math.sqrt(dataset.map(point => Math.pow(point-this.mean,2)).reduce((a,b) => a + b)/this.number-1)).toFixed(2);
		this.q1 = getPercentile(dataset,25);
		this.median = getPercentile(dataset,50);
		this.q3 = getPercentile(dataset,75);
		this.range = this.max-this.min;
		this.iqr = this.q3-this.q1;
		this.lowOutliers = [];
		this.highOutliers = [];
		for(let point of dataset){
			if(point < this.q1-this.iqr*1.5 && !this.lowOutliers.includes(point))
				this.lowOutliers.push(point);
			else if(point > this.q3+this.iqr*1.5 && !this.highOutliers.includes(point))
				this.highOutliers.push(point);
		}
	}
}
class Section{
	constructor(minY,maxY){
		this.minY = minY;
		this.maxY = maxY;
	}
}
function getPercentile(dataset, percentile) { //k-th percentile
    //data is already sorted
    let index = dataset.length*percentile/100;
	if(Math.floor(index) === index){
		return (dataset[index]+dataset[index-1])/2;
	} else {
		return dataset[Math.floor(index)];
	}
}
function getFrequency(array,binSize){
	let object = {};
	for(let i = 0; i< array.length; i++){
		typeof object[array[i].point] === "undefined" ? object[array[i].point] = 1 : object[array[i].point]++;
	}
	return object;
}