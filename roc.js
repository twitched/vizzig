var rmargin = {
        top: 20,
        right: 20,
        bottom: 50,
        left: 70
    },
rwidth = 400 - rmargin.left - rmargin.right,
rheight = 300 - rmargin.top - rmargin.bottom;

//precision for numbers
precision = 4;

var rx = d3.scale.linear()
	.domain([0, 1])
	.range([0, rwidth]);

var ry = d3.scale.linear()
	.domain([0,1])
    .range([rheight, 0]);
	
var roc_scale = d3.scale.linear()
	.domain(x.domain);
	.range([0, rwidth])

var rxAxis = d3.svg.axis()
    .scale(rx)
    .orient("bottom");

var ryAxis = d3.svg.axis()
    .scale(ry)
    .orient("left");

var topAxis = d3.svg.axis()
	.scale(rx)
	.ticks(0)
	.orient("top");

var rightAxis = d3.svg.axis()
	.scale(ry)
	.ticks(0)
	.orient("right");
	
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
	
function get_roc_data(){

	for(int x = roc_scale.range)
		
}