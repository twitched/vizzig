//based on http://bl.ocks.org/phil-pedruco/88cb8a51cdce45f13c7e
var margin = {
        top: 20,
        right: 80,
        bottom: 60,
		left: 80
    },
width = 360 - margin.left - margin.right,
height = 200 - margin.top - margin.bottom;

//z score for determining width of graph
z_limit = 4;

//precision for numbers
var format = d3.format("6.4f")

var x = d3.scaleLinear()
	.range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

var base_rate_scale = d3.scaleLinear()
    .range([height, 0])
    .clamp(true);

var xAxis = d3.axisBottom()
    .scale(x);

var yAxis = d3.axisLeft()
    .scale(y);

var base_rate_axis = d3.axisRight()
    .scale(base_rate_scale);

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

d3.selectAll(".base_rate.axis")
   	.attr("transform", "translate(" + (width + 30) + ", 0)")
   	.call(base_rate_axis);

//position axis labels
d3.selectAll(".normalplot-x-axis-label")
	.attr("transform", "translate(" + (width / 2) + "," + (height + 50) + ")");

d3.selectAll(".normalplot-y-axis-label")
	.attr("transform","translate(" + -50 + "," + (height / 2) +")rotate(-90)");

d3.selectAll(".base-rate-label")
	.attr("transform","translate(" + (width + 60) + "," + (height / 2) +")rotate(90)");

d3.selectAll(".control")
	.attr("r", "5")

d3.select("#threshold-marker")
	.attr("r", "5")

d3.select("#optimal-marker")
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

d3.select("#baseratebox").on("input", function(){
	update(x, y)
});

//make threshold draggable
d3.selectAll(".threshold-line")
	.call(d3.drag()
      .on("drag", move_threshold));

//update the threshold
function update_threshold(duration){
	threshold = Number(d3.select("#thresholdbox").property("value"));
  base_rate = Number(d3.select("#baseratebox").property("value"));
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

  ms = get_means_and_sigmas();
  rates = get_rates(ms.m1, ms.s1, ms.m2, ms.s2, threshold, base_rate)
  update_rates(rates);
  update_threshold_marker(threshold, rates, 0);
  update_false_areas(x, threshold, ms.m1, ms.s1, ms.m2, ms.s2, 0, base_rate);
}

//make the curve controls draggable
var control_drag = d3.drag()
	.on("drag", function(d) {
		move_control(this, d)
    base_rate = Number(d3.select("#baseratebox").property("value"));
    threshold = Number(d3.select("#thresholdbox").property("value"));
    ms = get_means_and_sigmas();
    if(means_and_sigmas_valid(ms) && base_rate != 0 && !isNaN(base_rate)){
      rates = get_rates(ms.m1, ms.s1, ms.m2, ms.s2, threshold, base_rate);
      update_rates(rates);
  		update_curves(ms.m1, ms.s1, ms.m2, ms.s2, x, y, base_rate);
      update_controls(ms.m1, ms.s1, ms.m2, ms.s2, x, y, base_rate, this);
  		update_threshold(0);
      update_false_areas(x, threshold, ms.m1, ms.s1, ms.m2, ms.s2, 0, base_rate);
      update_threshold_marker(threshold, rates, 0);
      roc_data = get_roc_data(base_rate)
    	update_roc(roc_data);
      update_optimal_marker(roc_data)
    } else {
      console.log(ms);
    }
	})
  //subject should be just the x and y of the control instead of the datum's x and y
  .subject(function(){ return {x: d3.event.x, y: d3.event.y}})
	.on("end", function() {update(x,y)});

d3.selectAll(".curvecontrol")
	.call(control_drag);

//move the control
function move_control(control, d){
	d.x = x.invert(d3.event.x);
	d.y = y.invert(d3.event.y);
	d3.select(control)
		.attr("cx", d3.event.x)
		.attr("cy", d3.event.y);

	//update the means
	d3.select("#mean1box").property("value", format(d3.select("#curve1control").datum().x));
	d3.select("#mean2box").property("value", format(d3.select("#curve2control").datum().x));

  base_rate = Number(d3.select("#baseratebox").property("value"));
  d3.select("#sigma1box").property("value",
		format(gaussian_sigma(d3.select("#curve1control").datum().y, 1 - base_rate)));
	d3.select("#sigma2box").property("value",
		format(gaussian_sigma(d3.select("#curve2control").datum().y, base_rate)));
}

var base_rate_drag = d3.drag()
    .on("drag", function(d) {
      base_rate = base_rate_scale.invert(d3.event.y);
      if(!(base_rate <= 0) && !(base_rate >= 1)){
        threshold = Number(d3.select("#thresholdbox").property("value"));
        d3.select("#baseratebox").property("value", format(base_rate));

        d3.select(this)
          .attr("cy", d3.event.y);

          ms = get_means_and_sigmas();
          if(means_and_sigmas_valid(ms) && base_rate != 0 && !isNaN(base_rate)){
            rates = get_rates(ms.m1, ms.s1, ms.m2, ms.s2, threshold, base_rate);
            update_rates(rates);
        		update_curves(ms.m1, ms.s1, ms.m2, ms.s2, x, y, base_rate);
            update_controls(ms.m1, ms.s1, ms.m2, ms.s2, x, y, base_rate);
        		update_threshold(0);
            update_false_areas(x, threshold, ms.m1, ms.s1, ms.m2, ms.s2, 0, base_rate);
            update_threshold_marker(threshold, rates, 0);
            roc_data = get_roc_data(base_rate)
          	update_roc(roc_data);
            update_optimal_marker(roc_data)
          }
        }
    })
    .on("end", function() {update(x,y)});

d3.select("#baseratecontrol")
    .call(base_rate_drag);

//update the curves, controls, and threshold
function update(x, y){
	ms = get_means_and_sigmas();
  base_rate = Number(d3.select("#baseratebox").property("value"));
  threshold = Number(d3.select("#thresholdbox").property("value"));
  duration = 250
  if(means_and_sigmas_valid(ms) && base_rate != 0 && !isNaN(base_rate)){
    rates = get_rates(ms.m1, ms.s1, ms.m2, ms.s2, threshold, base_rate)
    update_rates(rates);
  	update_curves(ms.m1, ms.s1, ms.m2, ms.s2, x, y, base_rate);
  	update_controls(ms.m1, ms.s1, ms.m2, ms.s2, x, y, base_rate);
    update_base_rate_control(base_rate);
  	update_threshold(duration);
    update_false_areas(x, threshold, ms.m1, ms.s1, ms.m2, ms.s2, duration, base_rate);
    update_threshold_marker(threshold, rates, duration);
    roc_data = get_roc_data(base_rate)
  	update_roc(roc_data);
    update_optimal_marker(roc_data)
  } else {
    console.log(ms)
  }
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

function means_and_sigmas_valid(ms){
  return !isNaN(ms.m1)
      && !isNaN(ms.m2)
      && !isNaN(ms.s1)
      && !isNaN(ms.s2)
      && ms.s1 != 0
      && ms.s2 != 0
}

//update the curves
function update_curves(m1, s1, m2, s2, x, y, base_rate){
	if(d3.select("#axisscalecheck").property("checked")){
		update_x_axis(m1, s1, m2, s2, x);
	}

	data1 = get_data(m1, s1, x, 0, width, 1 - base_rate);
	data2 = get_data(m2, s2, x, 0, width, base_rate);

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

//update the location of the controls
function update_controls(m1, s1, m2, s2, x, y, base_rate, exclude_control){
  id = null;
  if(exclude_control != null){
    id = d3.select(exclude_control).attr("id");
  }
  if(d3.select("#curve1control").attr("id") != id) {
    control_y1 = gaussian_pdf(m1, m1, s1, 1 - base_rate);
  	d3.select("#curve1control")
  		.datum({x: m1, y: control_y1})
  		.attr("cx", x(m1))
  		.attr("cy", y(control_y1));
  }

  if(d3.select("#curve2control").attr("id") != id) {
  	control_y2 = gaussian_pdf(m2, m2, s2, base_rate);
  	d3.select("#curve2control")
  		.datum({x: m2, y: control_y2})
  		.attr("cx", x(m2))
  		.attr("cy", y(control_y2));
  }
}

function update_base_rate_control(base_rate){
  d3.select("#baseratecontrol")
    .attr("cx", width + 30)
    .attr("cy", base_rate_scale(base_rate));
}

//update the confustion matrix
function update_rates(r){
	d3.select("#tp").html(format(r.tp));
	d3.select("#tn").html(format(r.tn));
	d3.select("#fp").html(format(r.fp));
  d3.select("#fn").html(format(r.fn));
  d3.select("#sensitivity").html(format(r.tpr));
  d3.select("#specificity").html(format(r.tnr));
  d3.select("#fallout").html(format(r.fpr));
  d3.select("#precision").html(format(r.precision));
  d3.select("#npv").html(format(r.npv));
  d3.select("#accuracy").html(format(r.accuracy));
  d3.select("#f1").html(format(r.f1));
  d3.select("#dprime").html(format(r.dprime));
}

//update the areas that show the errors
function update_false_areas(x_scale, threshold, m1, s1, m2, s2, duration, base_rate){
	false_positive_data = get_data(m1, s1, x_scale, x(threshold), width, 1 - base_rate);
	false_negative_data = get_data(m2, s2, x_scale, 0, x(threshold), base_rate);

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

//given a mean, sigma, a linear x scale, start and ends,
//and a scaling factor return a an array
//representing the y points of a normal distribution
function get_data(mean, sigma, x, startx, endx, scale){
	data = []; //erase current data

	//populate the data
	for (i = startx; i < endx; i++) {
		q = x.invert(i);
	    p = gaussian_pdf(q, mean, sigma, scale); // calc prob of each point
	    el = {
	        "q": q,
	        "p": p
	    }
		//console.log(el);
	    data.push(el);
	}
	return data
}

function get_rates(m1, s1, m2, s2, threshold, base_rate){
	fn = gaussian_cdf(threshold, m2, s2, base_rate);
	tn = gaussian_cdf(threshold, m1, s1, 1 - base_rate);
  tp = base_rate - fn;
  fp = 1 - base_rate - tn;
  n = fn + tn + tp + fp;
	return {
		"fn":fn,
		"tp":tp,
		"tn":tn,
		"fp":fp,
    "fnr":fn / (fn + tp),
    "tpr":tp / (fn + tp),
    "tnr":tn / (fp + tn),
    "fpr":fp / (fp + tn),
    "precision": tp / (tp + fp),
    "npv": tn / (tn + fn),
    "accuracy": (tp + tn) / n,
    "f1": 2 * tp / (2 * tp + fp + fn),
    "dprime": (m2 - m1) / Math.sqrt(0.5 * (s2 * s2 + s1 * s2))
	}
}

//taken from Jason Davies science library with scale added
// https://github.com/jasondavies/science.js/blob/master/src/stats/distribution/gaussian.js
function gaussian_pdf(x, mean, sigma, scale = 1) {
	var gaussianConstant = 1 / Math.sqrt(2 * Math.PI),
    x = (x - mean) / sigma;
    return (gaussianConstant * Math.exp(-.5 * x * x) / sigma) * scale;
};

//return sigma (standard deviation) given the probability at the mean
function gaussian_sigma(p, scale = 1){
  return 1 / (p / scale * Math.sqrt(2 * Math.PI))
}

//taken from Jason Davies science library
// https://github.com/jasondavies/science.js/blob/master/src/stats/distribution/gaussian.js
function gaussian_cdf(x, mean, sigma, scale = 1) {
   x = (x - mean) / sigma;
   return (.5 * (1 + erf(x / Math.SQRT2))) * scale;
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

function update_roc(roc_data){

	d3.selectAll(".roc-curve")
		.datum(roc_data.points)
		.attr("d", roc_line);

  d3.select("#auc").html(format(roc_data.AUC));
}

//update the threshold
function update_threshold_marker(threshold, rates, duration){
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

//update the threshold
function update_optimal_marker(roc_data){
	d3.selectAll("#optimal-horiz")
		.attr("x1", 0 - margin.left)
		.attr("y1", ry(roc_data.optimaltpr))
		.attr("x2", rwidth + rmargin.right)
		.attr("y2", ry(roc_data.optimaltpr))

	d3.selectAll("#optimal-vert")
		.attr("x1", rx(roc_data.optimalfpr))
		.attr("y1", 0 - rmargin.top)
		.attr("x2", rx(roc_data.optimalfpr))
		.attr("y2", rheight + rmargin.bottom)

	d3.select("#optimal-marker")
		.attr("cx", rx(roc_data.optimalfpr))
		.attr("cy", ry(roc_data.optimaltpr))
}

//return AUC points for ROC curve
function get_roc_data(base_rate){
	data = [];
  auc = 0;

	ms = get_means_and_sigmas();

  priortpr = 0;
  priorfpr = 1;
  optimalfpr = 0;
  optimaltpr = 0;
  optimalslope = get_roc_slope(optimaltpr, optimalfpr, base_rate)
  optimalthreshold = 0;
	for (i = 0; i < rwidth; i++){
		threshold = roc_scale.invert(i);
		rates = get_rates(ms.m1, ms.s1, ms.m2, ms.s2, threshold, base_rate);
	    el = {
	        "tpr": rates.tpr,
	        "fpr": rates.fpr
	    }
      data.push(el);
      auc = auc + ((rates.tpr) * (priorfpr - rates.fpr)) + .5 * ((priortpr - rates.tpr) * (priorfpr - rates.fpr));
      priortpr = rates.tpr;
      priorfpr = rates.fpr;
      //the first time slope is less than tpr/fpr is the optimal slope

      if(get_roc_slope(rates.tpr, rates.fpr, base_rate) > optimalslope){
        optimalslope = get_roc_slope(optimaltpr, optimalfpr, base_rate);
        optimaltpr = rates.tpr;
        optimalfpr = rates.fpr;
        optimalthreshold = threshold;
      }
	}
	return {"AUC": auc, "points": data, "optimaltpr": optimaltpr, "optimalfpr": optimalfpr, "optimalthreshold": threshold};
}

function get_roc_slope(tpr, fpr, base_rate = 0.5, cost_ratio = 1){
  return tpr - (1 - base_rate)/base_rate * cost_ratio * fpr;
}
