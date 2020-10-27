var width = 960,
    height = 580;

var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select('#map').append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g');

var g = svg.append('g');

svg.append('rect')
    .attr('class', 'overlay')
    .attr('width', width)
    .attr('height', height);

var radius,
    zoom;

queue()
    .defer(d3.json, 'us.json')
    .defer(d3.json, 'direct-emitters-top-100.json')
    .await(drawMap);

function drawMap(error, states, facilities) {

    g.append('path')
        .datum(topojson.feature(states, states.objects.counties))
        .attr('d', path)
        .attr('class', 'states');

    var length = facilities.features.length;

    var data = [],
        datum;

    for (var i=0; i<length; i++) {
        datum = facilities.features[i].properties.total_emissions;
        data.push(Number(datum));
    }

    var min = Math.min.apply(Math, data);
    var max = Math.max.apply(Math, data);

    radius = d3.scale.sqrt()
        .domain([min, max])
        .range([2, 30]);

    var facilities = g.selectAll('.facilities')
        .data(facilities.features)
        .enter().append('path')
        .attr('class', 'facilities')
        .attr('d', path.pointRadius(function(d) { return radius(d.properties.total_emissions); }));

    zoom = d3.behavior.zoom()
        .scaleExtent([1, 16])
        .on("zoom", function() {
            g.attr("transform","translate("+
                d3.event.translate.join(",")+")scale("+d3.event.scale+")");
            radius.range([2/d3.event.scale, 30/d3.event.scale]);
            facilities
                .attr('d', path.pointRadius(function(d) {
                    return radius(d.properties.total_emissions);
                }))
                .attr("stroke-width", (1/d3.event.scale)*2+"px");
        });

    svg.call(zoom);

    // Adding chart label
    svg.append("text")
        .attr("class", "chart-label")
        .attr("x",  width / 3)
        .attr("y", 30)
        .text("Top 6 Cities with maximum Green House Emission")

    // Adding chart label
    svg.append("text")
        .attr("class", "chart-label")
        .attr("x",  width / 2)
        .attr("y", 60)
        .text("[Zoomable Proportional Symbols map]")


} // end drawMap
