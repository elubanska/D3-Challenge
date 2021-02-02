var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  //.select(".chart")
  .select(".article")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
console.log("chart: ", chartGroup);
// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";
//console.log("XAxis:", chosenXAxis);
// function used for updating x-scale var upon click on axis label
function xScale(povertyData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(povertyData, d => d[chosenXAxis]) * 0.8,
      d3.max(povertyData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0,width]);

  return xLinearScale;

}
//console.log("XAxis:", chosenXAxis);
///1---------------
// function used for updating y-scale var upon click on axis label
function yScale(povertyData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(povertyData, d => d[chosenYAxis]) * 0.5,
        d3.max(povertyData, d => d[chosenYAxis]) *1.1
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  }
///2---------------
// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }
  
//console.log("XAxis:", chosenXAxis);

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function renderLabels(circleLabels, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circleLabels.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

  return circleLabels;
}
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xlabel;
  var ylabel;

  if (chosenXAxis === "poverty") {
    xlabel = "In Powerty (%)";
  }
  else if (chosenXAxis === "age") {
    xlabel = "Age (Median)";
  }
  else {
    xlabel = "Income (Median)";
  }

  if (chosenYAxis === "healthcare") {
    ylabel = "No Healthcare (%)";
  }
  else if (chosenXAxis === "smokes") {
    ylabel = "Smokes (%)";
  }
  else {
    ylabel = "Obese (%)";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });

    chartGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(povertyData, err) {
  if (err) throw err;

  // parse data
  povertyData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income = +data.income;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
  });
  console.log("poverty:",povertyData);
  //console.log("poverty:",povertyData.poverty);
  // xLinearScale function above csv import
  var xLinearScale = xScale(povertyData, chosenXAxis);

  var yLinearScale = yScale(povertyData, chosenYAxis);
  ///------------------
  // Create y scale function
///  var yLinearScale = d3.scaleLinear()
///   .domain([0, d3.max(povertyData, d => d.healthcare)])
///   .range([height, 0]);
  ///------------------
  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(povertyData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "steelblue")
    .attr("opacity", ".5");

    //circlesGroup.append("text")
    //.attr("dx", function(d){return -20})
    

  // Create group for x-axis labels
  var circleLabels = chartGroup.selectAll(".stateText")
    .data(povertyData)
    .enter()
    .append("text")
    .classed("stateText",true)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .text(d => d.abbr)


  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  //var labelsYGroup = chartGroup.append("g")
  //  .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
  var healthcareLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", height/1.8)
    .attr("y", 0 - (width/1.85 ))
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", height/1.8 )
    .attr("y", 0 - (width/1.75) )
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  var obesityLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", height/1.8 )
    .attr("y", 0 - (width/1.65) )
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");

 /* // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left/2)
    .attr("x", 0 - (height / 1.6))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");
*/
  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value === "poverty" || value === "age" || value === "income") {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(povertyData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x,y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        circleLabels = renderLabels(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
      else {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(povertyData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x,y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        circleLabels = renderLabels(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
        }
        else {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
