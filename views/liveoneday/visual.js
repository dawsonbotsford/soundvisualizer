var margin = {top: 50, right: 50, bottom: 50, left: 50};

//set screen width here
width = 1260 - margin.left - margin.right,
height = 360 - margin.top - margin.bottom;

var parseDate = d3.time.format("%d-%b-%y").parse;

var x = d3.time.scale()
.range([0, width]);

var y = d3.scale.linear()
.range([height, 0]);

var xAxis = d3.svg.axis()
.scale(x)
.ticks(8)
.orient("bottom");

var yAxis = d3.svg.axis()
.scale(y)
.ticks(0)
.orient("left");

var line = d3.svg.line()
.x(function(d) { return x(d.timestamp); })
.y(function(d) { return y(d.value); });

// Create SVG element with padding
var svg = d3.select("body").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var data = [];
var sum = 0;
var points = 60;//average every one hour
$.ajax({url: "/testdata",async:"false",success: function(response){
  $(response).each(function(index, value){
    var myDate = new Date(value._id.q).getTime();
    var myVolume = value.avg;
    sum = sum + myVolume;
    //append on hour data points to data object
    if ((index % points) == 1){
      var tuple = {
        "timestamp" : myDate + (1000 * 60 * (new Date()).getTimezoneOffset()),
        "value" : sum / points
      };
      data.push(tuple);
      sum = 0;
    }
  });
  data.shift();//pop off garbage last averaged point

  x.domain(d3.extent(data, function(d) { return d.timestamp; }));
  y.domain(d3.extent(data, function(d) { return d.value; }));

  svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

  svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -25)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("Loudness");

  svg.append("path")
  .datum(data)
  .attr("class", "line")
  .attr("d", line);
}
});
