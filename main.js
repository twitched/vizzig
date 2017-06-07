//based on http://bl.ocks.org/phil-pedruco/88cb8a51cdce45f13c7e
var margin = {
        top: 20,
        right: 20,
        bottom: 60,
		left: 80
    },
width = 300 - margin.left - margin.right,
height = 200 - margin.top - margin.bottom;

//z score for determining width of graph
z_limit = 4;

//precision for numbers
var format = d3.format("6.4f")

var x = d3.scaleLinear()
	.range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

var xAxis = d3.axisBottom()
    .scale(x);

var yAxis = d3.axisLeft()
    .scale(y);

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

//position axis labels
d3.selectAll(".normalplot-x-axis-label")
	.attr("transform", "translate(" + (width / 2) + "," + (height + 50) + ")");

d3.selectAll(".normalplot-y-axis-label")
	.attr("transform","translate(" + -50 + "," + (height / 2) +")rotate(-90)");

d3.selectAll(".control")
	.attr("r", "5")

d3.select("#threshold-marker")
	.attr("r", "5")

var rmargin = {
        top: 20,
        right: 20,
        bottom: 50,
        left: 70
    },
rwidth = 420 - rmargin.left - rmargin.right,
rheight = 400 - rmargin.top - rmargin.bottom;

var rx = d3.scaleLinear()
	.domain([0, 1])
	.range([0, rwidth]);

var ry = d3.scaleLinear()
	.domain([0,1])
    .range([rheight, 0]);

var roc_scale = d3.scaleLinear()
	.domain(x.domain())
	.range([0, rwidth])

var rxAxis = d3.axisBottom()
    .scale(rx);

var ryAxis = d3.axisLeft()
    .scale(ry);

var topAxis = d3.axisTop()
	.scale(rx)
	.ticks(0);

var rightAxis = d3.axisRight()
	.scale(ry)
	.ticks(0);

d3.selectAll(".roc-x-axis-label")
	.attr("transform", "translate(" + (rwidth / 2) + "," + (rheight + 50) + ")");

d3.selectAll(".roc-y-axis-label")
	.attr("transform","translate(" + -50 + "," + (rheight / 2) +")rotate(-90)");

d3.selectAll(".roc-svg")
    .attr("width", rwidth + rmargin.left + rmargin.right)
    .attr("height", rheight + rmargin.top + rmargin.bottom)

d3.selectAll(".roc-container")
 	.attr("transform", "translate(" + rmargin.left + "," + rmargin.top + ")")

d3.selectAll(".roc-x-axis")
   	.attr("transform", "translate(0," + rheight + ")")
   	.call(rxAxis);

d3.selectAll(".roc-y-axis")
    .call(ryAxis);

d3.selectAll(".roc-top-axis")
	.call(topAxis);

d3.selectAll(".roc-right-axis")
	.attr("transform", "translate(" + rwidth + ",0)")
	.call(rightAxis);

d3.selectAll(".roc-diagonal")
	.attr("x1", 0)
	.attr("y1", rheight)
	.attr("x2", rwidth)
	.attr("y2", 0);


//function for creating lines with data in the form of q, p
var line = d3.line()
    .x(function(d) {
        return x(d.q);
    })
    .y(function(d) {
        return y(d.p);
    });

//function for creating filled areas with data in the form of q, p
var fill = d3.area()
    .x(function(d) {
        return x(d.q);
    })
    .y1(function(d) {
        return y(d.p);
    })
    .y0(function(d) {
 		return y(0);
    });

var roc_line = d3.line()
    .x(function(d) {
        return rx(d.fpr);
    })
    .y(function(d) {
		return ry(d.tpr);
    });

update(x, y);

//attach event
d3.selectAll(".inputbox").on("input", function(){
	update(x, y)
});

d3.select("#axisscalecheck").on("change", function(){
	update(x, y)
});

//make threshold draggable
d3.selectAll(".threshold-line")
	.call(d3.drag()
      .on("drag", move_threshold));

//update the threshold
function update_threshold(duration){
	threshold = Number(d3.select("#thresholdbox").property("value"));
	d3.selectAll(".threshold-line")
		.datum(threshold)
		.transition()
		.attr("x1", x(threshold))
		.attr("y1", 0 - margin.top)
		.attr("x2", x(threshold))
		.attr("y2", height + margin.bottom / 2)
		.duration(duration);

	d3.select("#thresholdcontrol")
		.datum(threshold)
		.transition()
		.attr("cx", x(threshold))
		.attr("cy", height / 2)
		.duration(duration);

	update_rates(threshold, duration);
}

//handle threshold drag event along x axis
function move_threshold(d) {
	threshold = x.invert(d3.event.x);
	d3.selectAll(".threshold-line")
		.datum(threshold)
	    .attr("x1", Math.max(0, Math.min(width, d3.event.x)))
		.attr("x2", Math.max(0, Math.min(width, d3.event.x)));

	d3.select("#thresholdcontrol")
		.datum(threshold)
		.attr("cx", d3.event.x)
		.attr("cy", height / 2)

	d3.select("#thresholdbox").attr("value", format(threshold));

	update_rates(threshold, 0);
}

//make the curve controls draggable
var control_drag = d3.drag()
	.on("drag", function(d) {
		move_control(this, d)
		ms = get_means_and_sigmas();
		update_curves(ms.m1, ms.s1, ms.m2, ms.s2, x, y);
		update_threshold(0);
		update_roc();
	})
  //subject should be just the x and y of the control instead of the datum's x and y
  .subject(function(){ return {x: d3.event.x, y: d3.event.y}})
	.on("end", function() {update(x,y)});

d3.selectAll(".curvecontrol")
	.call(control_drag);

//move the control
function move_control(control, d){
	d.x = x.invert(d3.event.x);
	d.y = y.invert(d3.event.y)
	d3.select(control)
		.attr("cx", d3.event.x)
		.attr("cy", d3.event.y);

	//update the means
	d3.select("#mean1box").attr("value", format(d3.select("#curve1control").datum().x));
	d3.select("#mean2box").attr("value", format(d3.select("#curve2control").datum().x));
	d3.select("#sigma1box").attr("value",
		format(gaussian_sigma(d3.select("#curve1control").datum().y)));
	d3.select("#sigma2box").attr("value",
		format(gaussian_sigma(d3.select("#curve2control").datum().y)));
}

//update the curves, controls, and threshold
function update(x, y){
	ms = get_means_and_sigmas();
	update_curves(ms.m1, ms.s1, ms.m2, ms.s2, x, y);
	update_controls(ms.m1, ms.s1, ms.m2, ms.s2, x, y);
	update_threshold(250);
	update_roc();
}

//get the means and sigmas from their input boxes
function get_means_and_sigmas(){
	return {
		m1:Number(d3.select("#mean1box").property("value")),
		s1:Number(d3.select("#sigma1box").property("value")),
		m2:Number(d3.select("#mean2box").property("value")),
		s2:Number(d3.select("#sigma2box").property("value")),
	}
}
//update the curves
function update_curves(m1, s1, m2, s2, x, y){

	if(!isNaN(m1)
			&& !isNaN(m2)
			&& !isNaN(s1)
			&& !isNaN(s2)
			&& s1 != 0
			&& s2 != 0){
		if(d3.select("#axisscalecheck").property("checked")){
			update_x_axis(m1, s1, m2, s2, x);
		}

		data1 = get_data(m1, s1, x, 0, width);
		data2 = get_data(m2, s2, x, 0, width);

		if(d3.select("#axisscalecheck").property("checked")){
			update_y_axis(data1.concat(data2), y);
		}

		d3.selectAll(".curve1")
			.datum(data1)
			.attr("d", line);

		d3.selectAll(".curve2")
			.datum(data2)
			.attr("d", line);

		d3.selectAll(".curve1-filled")
			.datum(data1)
			.attr("d", fill);

		d3.selectAll(".curve2-filled")
			.datum(data2)
			.attr("d", fill);
	}
}

//update the location of the controls
function update_controls(m1, s1, m2, s2, x, y){
	control_y1 = gaussian_pdf(m1, m1, s1);
	d3.select("#curve1control")
		.datum({x: m1, y: control_y1})
		.attr("cx", x(m1))
		.attr("cy", y(control_y1));

	control_y2 = gaussian_pdf(m2, m2, s2);
	d3.select("#curve2control")
		.datum({x: m2, y: control_y2})
		.attr("cx", x(m2))
		.attr("cy", y(control_y2));
}

//update the confustion matrix
function update_rates(threshold, duration){
	ms = get_means_and_sigmas()

	r = get_rates(ms.m1, ms.s1, ms.m2, ms.s2, threshold)

	d3.select("#tpr").html(format(r.tpr));
	d3.select("#tnr").html(format(r.tnr));
	d3.select("#fpr").html(format(r.fpr));
	d3.select("#fnr").html(format(r.fnr));

	update_false_areas(x, threshold, ms.m1, ms.s1, ms.m2, ms.s2, duration);

	update_threshold_marker(r, duration);
}

//update the areas that show the errors
function update_false_areas(x_scale, threshold, m1, s1, m2, s2, duration){
	false_positive_data = get_data(m1, s1, x_scale, x(threshold), width);
	false_negative_data = get_data(m2, s2, x_scale, 0, x(threshold));


		d3.selectAll(".false-positive-curve")
			.datum(false_positive_data)
			.transition()
			.attr("d", fill)
			.duration(duration);

		d3.selectAll(".false-negative-curve")
			.datum(false_negative_data)
			.transition()
			.attr("d", fill)
			.duration(duration);
}

//make the x axis min and max scale with the data
//needed before data generation
function update_x_axis(m1, s1, m2, s2, x){
	x.domain(d3.extent([m1 - (z_limit * s1), m2 - (z_limit * s2), m1 + (z_limit * s1), m2 + (z_limit * s2)]));
	roc_scale.domain(x.domain()); //update the roc scale, too
	d3.selectAll(".x.axis").transition().call(xAxis);
}

//make the y axis min and max scale with the data
//needed after data generation
function update_y_axis(data, y){
	y.domain(d3.extent(data, function(d) {
	    return d.p;
	}));
	d3.selectAll(".y.axis").transition().call(yAxis);
}

//given a mean, sigma, and an x scale, return a an array
//representing the y points of a normal distribution
function get_data(mean, sigma, x, startx, endx){
	data = []; //erase current data

	//populate the data
	for (i = startx; i < endx; i++) {
		q = x.invert(i);
	    p = gaussian_pdf(q, mean, sigma); // calc prob of each point
	    el = {
	        "q": q,
	        "p": p
	    }
		//console.log(el);
	    data.push(el);
	}
	return data
}

function get_rates(m1, s1, m2, s2, threshold){
	fnr = gaussian_cdf(threshold, m2, s2);
	tnr = gaussian_cdf(threshold, m1, s1);
	return {
		"fnr":fnr,
		"tpr":1 - fnr,
		"tnr":tnr,
		"fpr":1 - tnr
	}
}

//taken from Jason Davies science library
// https://github.com/jasondavies/science.js/blob/master/src/stats/distribution/gaussian.js
function gaussian_pdf(x, mean, sigma) {
	var gaussianConstant = 1 / Math.sqrt(2 * Math.PI),
    x = (x - mean) / sigma;
    return gaussianConstant * Math.exp(-.5 * x * x) / sigma;
};

//return sigma (standard deviation) given the probability at the mean
function gaussian_sigma(p){
	return 1 / (p * Math.sqrt(2 * Math.PI))
}

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

//////////////////////////// ROC ////////////////////////////////

//function for creating lines with data in the form of q, p
function update_roc(){
	data = get_roc_data();

	d3.selectAll(".roc-curve")
		.datum(data)
		.attr("d", roc_line);
}

//update the threshold
function update_threshold_marker(rates, duration){
	threshold = Number(d3.select("#thresholdbox").property("value"));
	d3.selectAll("#threshold-horiz")
		.datum(threshold)
		// .transition()
		.attr("x1", 0 - margin.left)
		.attr("y1", ry(rates.tpr))
		.attr("x2", rwidth + rmargin.right)
		.attr("y2", ry(rates.tpr))
		// .duration(duration);

	d3.selectAll("#threshold-vert")
		.datum(threshold)
		// .transition()
		.attr("x1", rx(rates.fpr))
		.attr("y1", 0 - rmargin.top)
		.attr("x2", rx(rates.fpr))
		.attr("y2", rheight + rmargin.bottom)
		// .duration(duration);


	d3.select("#threshold-marker")
		.datum(threshold)
		//.transition()
		.attr("cx", rx(rates.fpr))
		.attr("cy", ry(rates.tpr))
		//.duration(duration);
}

function get_roc_data(){
	data = [];

	ms = get_means_and_sigmas();

	for (i = 0; i < rwidth; i++){
		threshold = roc_scale.invert(i);
		rates = get_rates(ms.m1, ms.s1, ms.m2, ms.s2, threshold);
	    el = {
	        "tpr": rates.tpr,
	        "fpr": rates.fpr
	    }
	    data.push(el);
	}
	return data;
}
