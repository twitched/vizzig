//based on http://bl.ocks.org/phil-pedruco/88cb8a51cdce45f13c7e
var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
    },
width = 300 - margin.left - margin.right,
height = 200 - margin.top - margin.bottom;

//z score for determining width of graph
z_limit = 4;

//precision for numbers
precision = 4;

var x = d3.scale.linear()
	.range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
	
d3.selectAll(".normalplot")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

d3.selectAll(".graph-container")
 	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.selectAll(".x.axis")
   	.attr("transform", "translate(0," + height + ")")
   	.call(xAxis);

d3.selectAll(".y.axis")
    .call(yAxis);
	
d3.selectAll(".control")
	.attr("r", "5")

update(x, y);

//attach event	
d3.selectAll(".inputbox").on("input", function(){
	update(x, y)
});

d3.select("#axisscalecheck").on("change", function(){
	update(x, y)
});
	
//make threshold draggable
var threshold_drag = d3.behavior.drag()
    .on("drag", move_threshold);

d3.selectAll(".threshold")
	.call(threshold_drag);

//move the threshold
function update_threshold(){
	threshold = Number(d3.select("#thresholdbox").property("value"));
	d3.selectAll(".threshold")
		.datum(threshold)
		.attr("x1", x(threshold))
		.attr("y1", 0 - margin.top)
		.attr("x2", x(threshold))
		.attr("y2", height + margin.bottom);
	
	d3.select("#thresholdcontrol")
		.datum(threshold)
		.attr("cx", x(threshold))
		.attr("cy", height / 2)
	
	update_rates(threshold);
}

//handle threshold drag event along x axis
function move_threshold(d) {
	threshold = x.invert(d3.event.x);
	d3.selectAll(".threshold")
		.datum(threshold)
	    .attr("x1", Math.max(0, Math.min(width, d3.event.x)))
		.attr("x2", Math.max(0, Math.min(width, d3.event.x)));
		
	d3.select("#thresholdcontrol")
		.datum(threshold)
		.attr("cx", x(threshold))
		.attr("cy", height / 2)
	
	d3.select("#thresholdbox").attr("value", threshold.toPrecision(precision));
	
	update_rates(threshold);
}

//make the curve controls draggable
var control_drag = d3.behavior.drag()
	.on("drag", move_control)
	.on("dragend", function() {update(x,y)});

d3.selectAll(".curvecontrol")
	.call(control_drag);

//move the control
function move_control(d){
	d.x = x.invert(d3.event.x);
	d3.select(this)
		.attr("cx", d3.event.x);
	
	//update the means
	d3.select("#mean1box").attr("value", d3.select("#curve1control").datum().x.toPrecision(precision));
	d3.select("#mean2box").attr("value", d3.select("#curve2control").datum().x.toPrecision(precision));
}

//change the curves 
function update(x, y){
	m1 = Number(d3.select("#mean1box").property("value"));
	s1 = Number(d3.select("#sigma1box").property("value"));
	m2 = Number(d3.select("#mean2box").property("value"));
	s2 = Number(d3.select("#sigma2box").property("value"));
	if(!isNaN(m1)
			&& !isNaN(m2)
			&& !isNaN(s1) 
			&& !isNaN(s2) 
			&& s1 != 0
			&& s2 != 0){
		if(d3.select("#axisscalecheck").property("checked")){
			update_x_axis(m1, s1, m2, s2, x);		
		}

		data1 = get_data(m1, s1, x);
		data2 = get_data(m2, s2, x);

		if(d3.select("#axisscalecheck").property("checked")){
			update_y_axis(data1.concat(data2), y);
		}

		var line = d3.svg.line()
		    .x(function(d) {
		        return x(d.q);
		    })
		    .y(function(d) {
		        return y(d.p);
		    });	

		var fill = d3.svg.area()
		    .x(function(d) {
		        return x(d.q);
		    })
		    .y1(function(d) {
		        return y(d.p);
		    })
		    .y0(function(d) {
	     		return y(0);
 		    });

		d3.selectAll(".curve1")
			.datum(data1)
			.transition()
			.attr("d", line);

		d3.selectAll(".curve2")
			.datum(data2)
			.transition()
			.attr("d", line);
			
		d3.selectAll(".curve1-filled")
			.datum(data1)
			.transition()
			.attr("d", fill);

		d3.selectAll(".curve2-filled")
			.datum(data2)
			.transition()
			.attr("d", fill);
		
		control_y1 = y(gaussian_pdf(m1, m1, s1));
		d3.select("#curve1control")
			.datum({x: m1, y: control_y1})
			.attr("cx", x(m1))
			.attr("cy", control_y1);

		control_y2 = y(gaussian_pdf(m2, m2, s2));
		d3.select("#curve2control")
			.datum({x: m2, y: control_y2})
			.attr("cx", x(m2))
			.attr("cy", control_y2);
			
			update_threshold();
	}
}

//update the confustion matrix
function update_rates(threshold){
	m1 = Number(d3.select("#mean1box").property("value"));
	s1 = Number(d3.select("#sigma1box").property("value"));
	m2 = Number(d3.select("#mean2box").property("value"));
	s2 = Number(d3.select("#sigma2box").property("value"));
	
	tpr = 1 - gaussian_cdf(threshold, m2, s2);
	tnr = gaussian_cdf(threshold, m1, s1);
	fpr = 1 - gaussian_cdf(threshold, m1, s1);
	fnr = gaussian_cdf(threshold, m2, s2);
	
	d3.select("#tpr").html(tpr.toPrecision(4));
	d3.select("#tnr").html(tnr.toPrecision(4));
	d3.select("#fpr").html(fpr.toPrecision(4));
	d3.select("#fnr").html(fnr.toPrecision(4));
}

//make the x axis min and max scale with the data
//needed before data generation
function update_x_axis(m1, s1, m2, s2, x){
	x.domain(d3.extent([m1 - (z_limit * s1), m2 - (z_limit * s2), m1 + (z_limit * s1), m2 + (z_limit * s2)]));
	d3.selectAll(".x").transition().call(xAxis);		
}

//make the y axis min and max scale with the data
//needed after data generation
function update_y_axis(data, y){
	y.domain(d3.extent(data, function(d) {
	    return d.p;
	}));
	d3.selectAll(".y").transition().call(yAxis);
}

//given a mean, sigma, and an x scale, return a an array 
//representing the y points of a normal distribution 
function get_data(mean, sigma, x){
	data = []; //erase current data

	//populate the data
	for (i = 0; i < width; i++) {
		q = x.invert(i);
	    p = gaussian_pdf(q, mean, sigma); // calc prob of each point
	    el = {
	        "q": q,
	        "p": p
	    }
		//console.log(el);
	    data.push(el);
	};
	return data 	
}

//taken from Jason Davies science library
// https://github.com/jasondavies/science.js/blob/master/src/stats/distribution/gaussian.js
function gaussian_pdf(x, mean, sigma) {
	var gaussianConstant = 1 / Math.sqrt(2 * Math.PI),
    x = (x - mean) / sigma;
    return gaussianConstant * Math.exp(-.5 * x * x) / sigma;
};

//taken from Jason Davies science library
// https://github.com/jasondavies/science.js/blob/master/src/stats/distribution/gaussian.js
function gaussian_cdf(x, mean, sigma) {
   x = (x - mean) / sigma;
   return .5 * (1 + erf(x / Math.SQRT2));
};

//taken from https://github.com/jasondavies/science.js/blob/master/src/stats/erf.js
function erf(x) {
  var a1 =  0.254829592,
      a2 = -0.284496736,
      a3 =  1.421413741,
      a4 = -1.453152027,
      a5 =  1.061405429,
      p  =  0.3275911;

  // Save the sign of x
  var sign = x < 0 ? -1 : 1;
  if (x < 0) {
    sign = -1;
    x = -x;
  }

  // A&S formula 7.1.26
  var t = 1 / (1 + p * x);
  return sign * (
    1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1)
    * t * Math.exp(-x * x));
};