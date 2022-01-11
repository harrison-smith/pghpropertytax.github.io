	// TODO:
	// modify color scheme of map
	// animate text
	// constrain body to middle
	// add links	
	
	// establish: map, with starting view; mapbox access token variable; geojson variable (so it's established before listeners)
	var mymap = L.map('mapid').setView([40.435, -79.98], 12);
	var accessToken = 'pk.eyJ1IjoiY2xhaXJlZ28iLCJhIjoiY2t0N294enM4MHVkejJvcXdveTl5djBjMiJ9.qkz4dm7hwhIacYJDfe3Tkw';
	var geojson;
	var info = L.control();
	var legend = L.control({position: 'bottomright'});

	// ------------ CONSTRUCT MAP ELEMENTS-------------
	// https://leafletjs.com/examples/choropleth/

	function getmedian(saleyear) {
		return saleyear == 2013 ? 0.908 :
				saleyear == 2014 ? 0.920 :
				saleyear == 2015 ? 0.871 : 
				saleyear == 2016 ? 0.874 :
				saleyear == 2017 ? 0.875 : 
				saleyear == 2018 ? 0.862 : 
				saleyear == 2019 ? 0.875 : 
				saleyear == 2020 ? 0.811 :
					"unknown";
	}

	// Assessment etc. ratio calculator
	function calcratio() {
		assessmentvalue = document.getElementById("Assessment Value").value;
		saleprice = document.getElementById("Sale Price").value;
		saleyear = document.getElementById("Sale Year").value;

		// error handling
		if (saleyear > 2020 | saleyear < 2013) {
			console.log("invalid sale year :");
			console.log(saleyear)
			return;
		}

		// get info
		ratio = Math.round(((assessmentvalue / saleprice) + Number.EPSILON) * 1000) / 1000;
		median = getmedian(saleyear);

		// display info
		document.getElementById("ratio").innerHTML = ratio;
		document.getElementById("clr").innerHTML = median;

		// display interpretation
		if (ratio > median) {
			document.getElementById("overunder").innerHTML = "OVERTAXED";
			document.getElementById("greaterless").innerHTML = "GREATER than";
		}
		else if (ratio < median) {
			document.getElementById("overunder").innerHTML = "UNDERTAXED";
			document.getElementById("greaterless").innerHTML = "LESS than";
		}
		else {
			document.getElementById("overunder").innerHTML = "Fairly taxed";
			document.getElementById("greaterless").innerHTML = "equal to";
		}

	}

	// assign color of polygon (hex) according to population density
	function getColor(ass_ratio) {
    return ass_ratio > 1 ? '#7d0000' :
		   ass_ratio >= 1 ? '#BD0026' :
           ass_ratio >= 0.80  ? '#E31A1C' :
           ass_ratio >= 0.70 ? '#FC4E2A' :
           ass_ratio >= 0.60  ? '#FD8D3C' :
           ass_ratio >= 0.50   ? '#FEB24C' :
           ass_ratio >= 0.40  ? '#FED976' :
           ass_ratio >= 0.30   ? '#8a8a8a' :
                      '#8a8a8a';
	}

	// use getColor color to create leaflet map style for element
	function style(feature) {
    	return {
        	fillColor: getColor(feature.properties.ass_ratio),
			color: getColor(feature.properties.ass_ratio),
			weight: 1,
        	fillOpacity: 0.8
    	};
	}

	// add information to each element in the map: create a div with a class "info"
	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	// update the info control with the features passed to it
	info.update = function (props) {

		// if a state is hovered (has props), fill in props.name and props.density; otherwise show "hover over a state"
		this._div.innerHTML = '<h5> Assessment Ratio:  </h5> <br>' +  (props ?
			'<b> tract no. ' + props.tractce10 + '</b><br/> ratio: ' + props.ass_ratio
			: ' </b><br /> Hover over a census tract');
	};
	
	// add legend to map (density to color correspondence)
	var legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend'),
			grades = [0, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 1],
			labels = [];

		// loop through density intervals and generate a label with color assigned to each interval
		for (var i = 0; i < grades.length; i++) {
			div.innerHTML +=
				'<i style="background:' + getColor(grades[i]) + '"></i> ' +
				grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
			}
		return div;
	};

	// ------------ EVENT LISTENERS -------------

	// when mousing over element, change style to highlight
	function highlightFeature(e) {
    	var layer = e.target;

		layer.setStyle({
			fillColor: '#00fffb',
			fillOpacity: 0.7
		});

		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			layer.bringToFront();
		}

		info.update(layer.feature.properties);
	}

	// when mousing off element, revert style to basic (set by style function)
	function resetHighlight(e) {
		geojson.resetStyle(e.target);
		info.update();
	}

	// zoom to feature when clicked
	function zoomToFeature(e) {
		mymap.fitBounds(e.target.getBounds());
	}

	// aggregate mouse / click functions for each feature, so these attributes can be assigned to the layer
	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: zoomToFeature
		});
	}
	// ---------------- COMPILE MAP, ADD ELEMENTS ----------------------
	// mapbox://styles/clairego/puoi835xw18n18vj177tg
	// create mapbox map, with custom style
	L.mapbox.accessToken = 'pk.eyJ1IjoiY2xhaXJlZ28iLCJhIjoiY2t0N294enM4MHVkejJvcXdveTl5djBjMiJ9.qkz4dm7hwhIacYJDfe3Tkw';
	L.mapbox.styleLayer('mapbox://styles/clairego/ckt7puoi835xw18n18vj177tg').addTo(mymap)
	
	// add geoJSON data to map, with style and event listeners established above 
	//ORIGINAL: geojson = L.geoJson(statesData, {style: style, onEachFeature: onEachFeature}).addTo(mymap);
	// MINE:
	geojson = L.geoJson(censusData, {style: style, onEachFeature: onEachFeature}).addTo(mymap);

	// add hover info and permanent legend to map
	info.addTo(mymap);
	legend.addTo(mymap);

	// ----------------- CHART 1: FIG 1.2 ASSR X PROPVAL ---------------------------

		// year = property value
		// popularity = assessment ratio
		// no idea why it won't let me change this, but it stops working when I change the names
		const data = [
			{
			  year: 21201.5556,
			  popularity: 1.9531
			},
			{
			  year: 48496.3409,
			  popularity: 1.1095
			},
			{
			  year: 77198.3914,
			  popularity: 0.8714
			},
			{
			  year: 106700.168,
			  popularity: 0.7497
			},
			{
			  year: 134342.1452,
			  popularity: 0.6781
			},
			{
			  year: 161551.3716,
			  popularity: 0.6412
			},
			{
			  year: 195455.4114,
			  popularity: 0.6331
			},
			{
			  year: 246584.0489,
			  popularity: 0.5984
			},
			{
			  year: 330157.9035,
			  popularity: 0.633
			},
			{
			  year: 593413.767,
			  popularity: 0.6548
			},
		  ];
		  const svg = d3
		  .select("#chart1")
		  .append("svg")
		  .attr("height", 400)
		  .attr("width", document.getElementById('report').getBoundingClientRect().width);
			const margin = { top: 0, bottom: 50, left: 40, right: 20 };
			const chart = svg.append("g").attr("transform", `translate(${margin.left},0)`);
			const width = +svg.attr("width") - margin.left - margin.right;
			const height = +svg.attr("height") - margin.top - margin.bottom;
			const grp = chart
		  .append("g")
		  .attr("transform", `translate(-${margin.left},-${margin.top})`);

		  // X axis label
		svg.append("text")
    		.attr("class", "x label")
    		.attr("text-anchor", "end")
    		.attr("x", width)
    		.attr("y", height - 6)
    		.text("Property Value (USD)");

			// Y axis label
		svg.append("text")
			.attr("class", "y label")
			.attr("text-anchor", "end")
			.attr("y", 0)
			.attr("dy", ".75em")
			.attr("transform", "rotate(-90)")
			.text("Mean Assessment Ratio");

		// Create scales
		const yScale = d3
		  .scaleLinear()
		  .range([height, 0])
		  .domain([0.5, d3.max(data, dataPoint => dataPoint.popularity)]);
		const xScale = d3
		  .scaleLinear()
		  .range([0, width])
		  .domain(d3.extent(data, dataPoint => dataPoint.year));
		
		const line = d3
		  .line()
		  .x(dataPoint => xScale(dataPoint.year))
		  .y(dataPoint => yScale(dataPoint.popularity));
		
		// Add path
		const path = grp
		  .append("path")
		  .attr("transform", `translate(${margin.left},0)`)
		  .datum(data)
		  .attr("fill", "none")
		  .attr("stroke", "#eb1000")
		  .attr("stroke-linejoin", "round")
		  .attr("stroke-linecap", "round")
		  .attr("stroke-width", 1.5)
		  .attr("d", line);
		
		const pathLength = path.node().getTotalLength();
		// D3 provides lots of transition options, have a play around here:
		// https://github.com/d3/d3-transition
		const transitionPath = d3
		  .transition()
		  .ease(d3.easeSinIn)
		  .duration(2500);
		
		path
		  .attr("stroke-dashoffset", pathLength)
		  .attr("stroke-dasharray", pathLength)
		  .transition(transitionPath)
		  .attr("stroke-dashoffset", 0);
		
		// Add the X Axis
		chart
		  .append("g")
		  .attr("transform", `translate(0,${height})`)
		  .call(d3.axisBottom(xScale).ticks(data.length))
			.selectAll("text")	
        	.style("text-anchor", "end")
        	.attr("dx", "-.8em")
        	.attr("dy", ".15em")
        	.attr("transform", "rotate(-65)");

		// Add the Y Axis
		chart
		  .append("g")
		  .attr("transform", `translate(0, 0)`)
		  .call(d3.axisLeft(yScale));

// ----------------- CHART 2: FIG 1.3 ASSR X PROPVAL ---------------------------

		// year = property value
		// popularity = assessment ratio
		// no idea why it won't let me change this, but it stops working when I change the names
		const data2 = [
			{
			  year: 1,
			  popularity: 0.8518
			},
			{
			  year: 2,
			  popularity: 0.7719
			},
			{
			  year: 3,
			  popularity: 0.7388
			},
			{
			  year: 4,
			  popularity: 0.7298
			},
			{
			  year: 5,
			  popularity: 0.7157
			},
			{
			  year: 6,
			  popularity: 0.6766
			},
			{
			  year: 7,
			  popularity: 0.6856
			},
			{
			  year: 8,
			  popularity: 0.6688
			},
			{
			  year: 9,
			  popularity: 0.6549
			},
			{
			  year: 10,
			  popularity: 0.6636
			},
		  ];
		  const svg2 = d3
		  .select("#chart2")
		  .append("svg")
		  .attr("height", 400)
		  .attr("width", document.getElementById('report').getBoundingClientRect().width);
			const margin2 = { top: 10, bottom: 20, left: 50, right: 20 };
			const chart2 = svg2.append("g").attr("transform", `translate(${margin2.left},0)`);
			const width2 = +svg2.attr("width") - margin2.left - margin2.right;
			const height2 = +svg2.attr("height") - margin2.top - margin2.bottom;
			const grp2 = chart2
		  .append("g")
		  .attr("transform", `translate(-${margin2.left},-${margin2.top})`);

		  // X axis label
		svg2.append("text")
    		.attr("class", "x label")
    		.attr("text-anchor", "end")
    		.attr("x", width2)
    		.attr("y", height2 - 6)
    		.text("Income Decile");

			// Y axis label
		svg2.append("text")
			.attr("class", "y label")
			.attr("text-anchor", "end")
			.attr("y", 0)
			.attr("dy", ".75em")
			.attr("transform", "rotate(-90)")
			.text("Mean Assessment Ratio");

		// Create scales
		const yScale2 = d3
		  .scaleLinear()
		  .range([height2, 0])
		  .domain([0.6, d3.max(data2, dataPoint => dataPoint.popularity)]);
		const xScale2 = d3
		  .scaleLinear()
		  .range([0, width2])
		  .domain([1, 10]);
		
		const line2 = d3
		  .line()
		  .x(dataPoint => xScale2(dataPoint.year))
		  .y(dataPoint => yScale2(dataPoint.popularity));
		
		// Add path
		const path2 = grp2
		  .append("path")
		  .attr("transform", `translate(${margin2.left},0)`)
		  .datum(data2)
		  .attr("fill", "none")
		  .attr("stroke", "#eb1000")
		  .attr("stroke-linejoin", "round")
		  .attr("stroke-linecap", "round")
		  .attr("stroke-width", 1.5)
		  .attr("d", line2);
		
		const pathLength2 = path.node().getTotalLength();
		// D3 provides lots of transition options, have a play around here:
		// https://github.com/d3/d3-transition
		const transitionPath2 = d3
		  .transition()
		  .ease(d3.easeSin)
		  .duration(2500);
		
		path2
		  .attr("stroke-dashoffset", pathLength2)
		  .attr("stroke-dasharray", pathLength2)
		  .transition(transitionPath2)
		  .attr("stroke-dashoffset", 0);
		
		// Add the X Axis
		chart2
		  .append("g")
		  .attr("transform", `translate(0,${height2})`)
		  .call(d3.axisBottom(xScale2).ticks(data2.length));

		// Add the Y Axis
		chart2
		  .append("g")
		  .attr("transform", `translate(0, 0)`)
		  .call(d3.axisLeft(yScale2));



// ----------------- DISTRIBUTION 1: PROPVAL By RACE -----------------------------------------------------

// set the dimensions and margins of the graph
const margin3 = {top: 30, right: 30, bottom: 50, left: 50},
    width3 = document.getElementById('report').getBoundingClientRect().width - margin3.left - margin3.right,
    height3 = 500 - margin3.top - margin3.bottom;

// append the svg object to the body of the page
const svg3 = d3.select("#chart3")
  .append("svg")
    .attr("width", width3 + margin3.left + margin3.right)
    .attr("height", height3 + margin3.top + margin3.bottom)
  .append("g")
    .attr("transform", `translate(${margin3.left},${margin3.top})`);

// get the data
d3.csv("./property_distribution.csv").then(function(data) {

  // add the x Axis
  const x = d3.scaleLinear()
      .domain([0,500000])
      .range([0, width3]);
  svg3.append("g")
      .attr("transform", `translate(0, ${height3})`)
	  .attr("class", "xaxis")
      .call(d3.axisBottom(x))
	  	.selectAll("text")	
	  		.style("text-anchor", "end")
	  		.attr("dx", "-.8em")
	  		.attr("dy", ".15em")
	  		.attr("transform", "rotate(-65)");

  // add the y Axis
  const y = d3.scaleLinear()
            .range([height3, 0])
            .domain([0, 0.002]);
  svg3.append("g")
	  .attr("class", "yaxis")
      .call(d3.axisLeft(y).tickFormat(""));

  // Compute kernel density estimation
  const kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(30))
  const density1 =  kde( data
      .filter( function(d){return d.Race === "Black or African American"} )
      .map(function(d){  return d.TRANSFER_VAL; }) )
  const density2 =  kde( data
      .filter( function(d){return d.Race === "White"} )
      .map(function(d){  return d.TRANSFER_VAL; }) )

	  var propdata = data.map(function(d) { return d.TRANSFER_VAL })
	  console.log(propdata)
	  console.log(density1)
	  console.log(density2)
	  
   // Plot the area
  svg3.append("path")
      .attr("class", "mypath1")
      .datum(density1)
      .attr("fill", "#eb1000")
      .attr("opacity", "0")
      .attr("stroke", "#000")
      .attr("stroke-width", 0)
      .attr("stroke-linejoin", "round")
      .attr("d",  d3.line()
        .curve(d3.curveBasis)
          .x(function(d) { return x(d[0]); })
          .y(function(d) { return y(d[1]); })
      );

	  // Plot the area-- White (density 2) first, so it's in the back
  svg3.append("path")
  .attr("class", "mypath2")
  .datum(density2)
  .attr("fill", "#8a8a8a")
  .attr("opacity", "0")
  .attr("stroke", "#000")
  .attr("stroke-width", 0)
  .attr("stroke-linejoin", "round")
  .attr("d",  d3.line()
	.curve(d3.curveBasis)
	  .x(function(d) { return x(d[0]); })
	  .y(function(d) { return y(d[1]); })
  );

// Handmade legend
svg3.append("circle").attr("class", "circle1").attr("cx",width3/2).attr("cy",30).attr("r", 6).attr("opacity", "0").style("fill", "#eb1000")
svg3.append("circle").attr("class", "circle2").attr("cx",width3/2).attr("cy",60).attr("r", 6).attr("opacity", "0").style("fill", "#8a8a8a")
svg3.append("text").attr("class", "legend1").attr("x", width3/2+20).attr("y", 30).text("Black Homeowners").attr("opacity", "0").style("font-size", "15px").attr("alignment-baseline","middle")
svg3.append("text").attr("class", "legend2").attr("x", width3/2+20).attr("y", 60).text("White Homeowners").attr("opacity", "0").style("font-size", "15px").attr("alignment-baseline","middle")

// Animate curves and legend, all together
svg3.selectAll(".mypath1")
  .transition()
	.duration(1500)
	.attr("opacity", 0.8)
	.delay(500)

svg3.selectAll(".circle1")
  .transition()
	.duration(1500)
	.attr("opacity", 0.8)
	.delay(500)

svg3.selectAll(".legend1")
	.transition()
	  .duration(1500)
	  .attr("opacity", 0.8)
	  .delay(500)
	  
 svg3.selectAll(".mypath2")
  .transition()
  	.duration(1500)
  	.attr("opacity", 0.6)
  	.delay(2500)

svg3.selectAll(".circle2")
  .transition()
	.duration(1500)
	.attr("opacity", 0.6)
	.delay(2500)

svg3.selectAll(".legend2")
	.transition()
	.duration(1500)
	.attr("opacity", 0.6)
	.delay(2500)

});

// Function to compute density
function kernelDensityEstimator(kernel, X) {
  return function(V) {
    return X.map(function(x) {
      return [x, d3.mean(V, function(v) { return kernel(x - v); })];
    });
  };
}
function kernelEpanechnikov(k) {
  return function(v) {
    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
}


// ----------------- DISTRIBUTION 2: ASSESSMENT VAL By RACE -----------------------------------------------------

// set the dimensions and margins of the graph
const margin4 = {top: 30, right: 30, bottom: 30, left: 50},
    width4 = document.getElementById('report').getBoundingClientRect().width - margin4.left - margin4.right,
    height4 = 500 - margin4.top - margin4.bottom;

// append the svg object to the body of the page
const svg4 = d3.select("#chart4")
.classed("svg-container", true) //container class to make it responsive
  .append("svg")
    .attr("width", width4 + margin4.left + margin4.right)
    .attr("height", height4 + margin4.top + margin4.bottom)
  .append("g")
    .attr("transform", `translate(${margin4.left},${margin4.top})`);

// get the data
d3.csv("./property_distribution.csv").then(function(data) {

  // add the x Axis
  const x = d3.scaleLinear()
      .domain([0,300])
      .range([0, width4]);
  svg4.append("g")
      .attr("transform", `translate(0, ${height4})`)
      .call(d3.axisBottom(x));

  // add the y Axis
  const y = d3.scaleLinear()
            .range([height4, 0])
            .domain([0, 0.02]);
  svg4.append("g")
      .call(d3.axisLeft(y).tickFormat(""));

  // Compute kernel density estimation
  const kde2 = kernelDensityEstimator2(kernelEpanechnikov2(7), x.ticks(30))
  const density3 =  kde2( data
      .filter( function(d){return d.Race === "Black or African American"} )
      .map(function(d){  return d.ASS_100; }) )
  const density4 =  kde2( data
      .filter( function(d){return d.Race === "White"} )
      .map(function(d){  return d.ASS_100; }) )

	  // debugging
	  var assdata = data.map(function(d) { return d.ASS_100 })
	  console.log(assdata)
	  console.log(density3)
	  console.log(density4)
	
 // Plot the area
  svg4.append("path")
      .attr("class", "mypath1")
      .datum(density3)
      .attr("fill", "#eb1000")
      .attr("opacity", "0")
      .attr("stroke", "#000")
      .attr("stroke-width", 0)
      .attr("stroke-linejoin", "round")
      .attr("d",  d3.line()
        .curve(d3.curveBasis)
          .x(function(d) { return x(d[0]); })
          .y(function(d) { return y(d[1]); })
      );

	// Plot the area-- White (density 4) first, so it's in the back
	svg4.append("path")
	.attr("class", "mypath2")
	.datum(density4)
	.attr("fill", "#8a8a8a")
  	.attr("opacity", "0")
  	.attr("stroke", "#000")
  	.attr("stroke-width", 0)
	.attr("stroke-linejoin", "round")
	.attr("d",  d3.line()
	.curve(d3.curveBasis)
		.x(function(d) { return x(d[0]); })
		.y(function(d) { return y(d[1]); })
	);

	// Handmade legend
svg4.append("circle").attr("class", "circle1").attr("cx",width4/2).attr("cy",30).attr("r", 6).attr("opacity", "0").style("fill", "#eb1000")
svg4.append("circle").attr("class", "circle2").attr("cx",width4/2).attr("cy",60).attr("r", 6).attr("opacity", "0").style("fill", "#8a8a8a")
svg4.append("text").attr("class", "legend1").attr("x", width4/2+20).attr("y", 30).text("Black Homeowners").attr("opacity", "0").style("font-size", "15px").attr("alignment-baseline","middle")
svg4.append("text").attr("class", "legend2").attr("x", width4/2+20).attr("y", 60).text("White Homeowners").attr("opacity", "0").style("font-size", "15px").attr("alignment-baseline","middle")

// Animate curves and legend, all together
svg4.selectAll(".mypath1")
  .transition()
	.duration(1500)
	.attr("opacity", 0.8)
	.delay(500)

svg4.selectAll(".circle1")
  .transition()
	.duration(1500)
	.attr("opacity", 0.8)
	.delay(500)

svg4.selectAll(".legend1")
	.transition()
	  .duration(1500)
	  .attr("opacity", 0.8)
	  .delay(500)
	  
 svg4.selectAll(".mypath2")
  .transition()
  	.duration(1500)
  	.attr("opacity", 0.6)
  	.delay(2500)

svg4.selectAll(".circle2")
  .transition()
	.duration(1500)
	.attr("opacity", 0.6)
	.delay(2500)

svg4.selectAll(".legend2")
	.transition()
	.duration(1500)
	.attr("opacity", 0.8)
	.delay(2500)

});

// Function to compute density
function kernelDensityEstimator2(kernel, X) {
	return function(V) {
	  return X.map(function(x) {
		return [x, d3.mean(V, function(v) { return kernel(x - v); })];
	  });
	};
  }
  function kernelEpanechnikov2(k) {
	return function(v) {
	  return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
	};
  }

	d3.graphScroll()
	.sections(d3.selectAll("#report > div"))
	.on("active", function(i) {
		if (i == 4) {
			console.log("TRANSITION CHARTS 1&2");
			// note: "path" is a class, so this calls both of them. could use "svg" and "svg2" instead of "d3" for separation
			// de-transition: retract line of graph to y axis
			d3.selectAll("path")
				.transition()
				.delay(100)
				.attr("stroke-dashoffset", 800)
				.ease(d3.easeSin)
				.duration(2000);
			
			// re-transition: bring 
			d3.selectAll("path")
				.transition()
				.delay(3100)
				.attr("stroke-dashoffset", 0)
				.ease(d3.easeSin)
				.duration(2500);
		} 
		else if (i == 16) {
			console.log("TRANSITION CHARTS 3&4")
			
			// de-transition white components
			d3.selectAll(".mypath2")
				.transition()
				.duration(1500)
				.attr("opacity", 0)
				.delay(100)

			d3.selectAll(".circle2")
				.transition()
				.duration(1500)
				.attr("opacity", 0)
				.delay(100)

			d3.selectAll(".legend2")
				.transition()
				.duration(1500)
				.attr("opacity", 0)
				.delay(100)

			//----------------------------------
			
			// re-transition white components
			d3.selectAll(".mypath2")
				.transition()
				.duration(1500)
				.attr("opacity", 0.6)
				.delay(2500)

			d3.selectAll(".circle2")
				.transition()
				.duration(1500)
				.attr("opacity", 0.6)
				.delay(2500)

			d3.selectAll(".legend2")
				.transition()
				.duration(1500)
				.attr("opacity", 0.8)
				.delay(2500)
		}
		else {
			console.log(i + "th section active")
		}
	})

/*
	// set dimensions and margins of bar chart
	var margin = {top: 10, right: 50, bottom: 90, left: 40},
   		width = 460 - margin.left - margin.right,
    	height = 450 - margin.top - margin.bottom;

	// append svg object to the body of page
	var svg = d3.select("#my_dataviz") // select element by id
  	.append("svg") // create svg "area" (this is not a file)
    	.attr("width", width + margin.left + margin.right) // set dimensions using vars above
    	.attr("height", height + margin.top + margin.bottom)
  	.append("g") // append element to group shapes together
    	.attr("transform",
          "translate(" + margin.left + "," + margin.top + ")"); // place graphic within svg

	// get the data
	d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv", function(data) {

		// create x axis of bar chart
		var x = d3.scaleBand()
		.range([ 0, width ]) // go across the whole band
		.domain(data.map(function(d) { return d.Country; }))
		.padding(0.2);
		svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.attr("stroke", "#69b3a2")
		.call(d3.axisBottom(x))
		.selectAll("text")
			.attr("transform", "translate(-10,0)rotate(-45)")
			.style("text-anchor", "end");

		// add y axis to bar chart
		var y = d3.scaleLinear()
		.domain([0, 13000])
		.range([ height, 0]);
		svg.append("g")
		.attr("stroke", "#69b3a2")
		.call(d3.axisLeft(y));


		// Bars
		svg.selectAll("mybar")
		.data(data)
		.enter()
		.append("rect")
			.attr("x", function(d) { return x(d.Country); })
			.attr("width", x.bandwidth())
			.attr("fill", "#69b3a2")
		// no bar at the beginning
			.attr("height", function(d) { return height - y(0); }) // always equal to 0
			.attr("y", function(d) { return y(0); })	


		// Animation
		svg.selectAll("rect")
		.transition()
		.duration(800)
		.attr("y", function(d) { return y(d.Value); })
		.attr("height", function(d) { return height - y(d.Value); })
		.delay(function(d,i){console.log(i) ; return(i*100)})

	})
	*/