var svgWidth = 960;
var svgHeight = 660;

var chartMargin = {
    top: 30,
    right: 30,
    bottom: 80,
    left: 80
};

var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.bottom - chartMargin.top;

var svg = d3.select("body")
            .append("svg")
            .attr("height", svgHeight)
            .attr("width", svgWidth)

var chartGroup = svg.append("g")
                    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

function xLinearScale(data, chosenXAxis) {
    var xscale = d3.scaleLinear()    
                    .domain([d3.min(data, d => d[chosenXAxis])*0.9, d3.max(data, d => d[chosenXAxis])*1.1])
                    .range([0, chartWidth]);
    return xscale;
};

function yLinearScale(data, chosenYAxis) {
    var yscale = d3.scaleLinear()    
                    .domain([d3.min(data, d => d[chosenYAxis])*0.9, d3.max(data, d => d[chosenYAxis])*1.1])
                    .range([chartHeight, 0]);
    return yscale;
};

function renderXAxis(newXScale, xAxis) {

    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
            .duration(1000)
            .call(bottomAxis);
    return xAxis;
};

function renderYAxis(newYScale, yAxis) {

    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
            .duration(1000)
            .call(leftAxis);
    return yAxis;
};

function renderTextX(textGroup, newXScale, chosenXAxis) {
    textGroup.transition()
             .duration(1000)
             .attr("x", row => newXScale(row[chosenXAxis]))
             .text(row => row.abbr);  
    return textGroup;
};

function renderTextY(textGroup, newYScale, chosenYAxis) {
    textGroup.transition()
             .duration(1000)
             .attr("y", row => newYScale(row[chosenYAxis])+5)
             .text(row => row.abbr);  
    return textGroup;
};

function rendercircleGroupX(circleGroup, newXScale, chosenXAxis) {
    circleGroup.transition()
               .duration(1000)
               .attr("cx", row => newXScale(row[chosenXAxis]))
    return circleGroup;
};

function rendercircleGroupY(circleGroup, newYScale, chosenYAxis) {
    circleGroup.transition()
               .duration(1000)
               .attr("cy", row => newYScale(row[chosenYAxis]));
    return circleGroup;
};

function updateToolTip(chosenXAxis, chosenYAxis, circleGroup) {

    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(data) {
          if (chosenXAxis === 'age') {
              return (`${data["state"]}<br><div>${chosenXAxis} : ${data[chosenXAxis]}</div><div>${chosenYAxis} : ${data[chosenYAxis]}%</div>`);
          }
          else if (chosenXAxis === 'income') {
              return (`${data["state"]}<br><div>${chosenXAxis} : $${data[chosenXAxis]}</div><div>${chosenYAxis} : ${data[chosenYAxis]}%</div>`);
          }
        return (`${data["state"]}<br><div>${chosenXAxis} : ${data[chosenXAxis]}%</div><div>${chosenYAxis} : ${data[chosenYAxis]}%</div>`);
      });
  
      circleGroup.call(toolTip);
  
      circleGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circleGroup;
  }

d3.csv("assets/data/data.csv").then(function(data, err) {
    if (err) throw err;

    data.forEach(row => {
        row.poverty = +row.poverty;
        row.healthcare = +row.healthcare;
        row.age = +row.age;
        row.income = +row.income;
        row.obesity = +row.obesity;
        row.smokes = +row.smokes;
    });

    var xScale = xLinearScale(data, chosenXAxis);
    var yScale = yLinearScale(data, chosenYAxis);

    var bottomAxis = d3.axisBottom(xScale);
    var leftAxis = d3.axisLeft(yScale);

    var xAxis = chartGroup.append("g")
                          .attr("transform", `translate(0, ${chartHeight})`)
                          .call(bottomAxis);
    
    var yAxis = chartGroup.append("g")
                          .call(leftAxis);

    var circleGroup = chartGroup.append("g");                      
    
    circleGroup = circleGroup.selectAll("circle").data(data).enter().append("circle")
               .attr("class", "stateCircle")
               .attr("cx", row => xScale(row[chosenXAxis]))
               .attr("cy", row => yScale(row[chosenYAxis]))
               .attr("r", "14");

    var textGroup = chartGroup.append("g");
    textGroup = textGroup.selectAll("text").data(data).enter()
             .append('text')
             .attr("class", 'stateText')
             .attr("x", row => xScale(row[chosenXAxis]))
             .attr("y", row => yScale(row[chosenYAxis])+5)
             .text(row => row.abbr);

    var xlabelsGroup = chartGroup.append('g')
                                .attr("transform", `translate(${chartWidth/2}, ${chartHeight+20})`);
    var povertyLabel = xlabelsGroup.append('text')
                                  .attr("x", 0)
                                  .attr("y", 20)
                                  .attr("value", "poverty")
                                  .classed("active", true)
                                  .classed("xlabel", true)
                                  .text("In Poverty (%)");
    var ageLabel = xlabelsGroup.append('text')
                                 .attr("x", 0)
                                 .attr("y", 40)
                                 .attr("value", "age")
                                 .classed("inactive", true)
                                 .classed("xlabel", true)
                                 .text("Age (median)");
    var incomeLabel = xlabelsGroup.append('text')
                                 .attr("x", 0)
                                 .attr("y", 60)
                                 .attr("value", "income")
                                 .classed("inactive", true)
                                 .classed("xlabel", true)
                                 .text("Household Income (median)");

    var ylabelsGroup = chartGroup.append('g')
                                 .attr("transform", `translate(0, ${chartHeight/2})`);

    var povertyLabel = ylabelsGroup.append('text')
                                   .attr("transform", "rotate(-90)")
                                   .attr("x", 0)
                                   .attr("y", -25)
                                   .attr("value", "healthcare")
                                   .classed("active", true)
                                   .classed("ylabel", true)
                                   .text("Lacks Healthcare (%)");

    var obesityLabel = ylabelsGroup.append('text')
                                  .attr("transform", "rotate(-90)")
                                  .attr("x", 0)
                                  .attr("y", -45)
                                  .attr("value", "obesity")
                                  .classed("inactive", true)
                                  .classed("ylabel", true)
                                  .text("Obesity (%)");
    var smokesLabel = ylabelsGroup.append('text')
                                  .attr("transform", "rotate(-90)")
                                  .attr("x", 0)
                                  .attr("y", -65)
                                  .attr("value", "smokes")
                                  .classed("inactive", true)
                                  .classed("ylabel", true)
                                  .text("Smokes (%)");

    textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);
                
    xlabelsGroup.selectAll('text')
                .on("click", function() {
                    var value = d3.select(this).attr("value");
                    if (value !== chosenXAxis) {
                        chosenXAxis = value;
                        xScale = xLinearScale(data, chosenXAxis);
                        yScale = yLinearScale(data, chosenYAxis);
                        xAxis = renderXAxis(xScale, xAxis);
                        circleGroup = rendercircleGroupX(circleGroup, xScale, chosenXAxis);
                        textGroup = renderTextX(textGroup, xScale, chosenXAxis);
                        textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);
                    }
                    d3.selectAll(".xlabel")
                        .classed("active", false)
                        .classed("inactive", true);
                    d3.select(this)
                      .classed("active", true)
                      .classed("inactive", false);
                });
    ylabelsGroup.selectAll('text')
                .on("click", function() {
                    var value = d3.select(this).attr("value");
                    if (value !== chosenYAxis) {
                        chosenYAxis = value;
                        xScale = xLinearScale(data, chosenXAxis);
                        yScale = yLinearScale(data, chosenYAxis);
                        yAxis = renderYAxis(yScale, yAxis);
                        circleGroup = rendercircleGroupY(circleGroup, yScale, chosenYAxis);
                        textGroup = renderTextY(textGroup, yScale, chosenYAxis);
                        textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);
                    }
                    d3.selectAll(".ylabel")
                        .classed("active", false)
                        .classed("inactive", true);
                    d3.select(this)
                      .classed("active", true)
                      .classed("inactive", false);
                });    
})