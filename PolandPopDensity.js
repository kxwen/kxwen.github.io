/*eslint-env es6*/
/*eslint-env browser*/
/*eslint no-console: 0*/
/*global d3 */

        //Width and height
        var width = 900;
        var height = 800;
         
        //prpjection for Poland 
        var projection = d3.geoMercator().center([20, 51.75]).translate([ width/2, height/2 ]).scale(3700);

        //Define default path generator
        var path = d3.geoPath().projection(projection);

        //define color buckets, from the book, added some extra colors
        var color = d3.scaleQuantile().range(["white","rgb(237,248,233)","rgb(186,228,179)","rgb(178,203,184)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)","rgb(0,43,0)"]);

        //Create SVG element
        var svg = d3.select("body")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height);


        //load in csv file with population and density 
        //updated to d3v5 from d3v3 from references below:
        //main references: http://bl.ocks.org/mbaba/78e2c2295c632a1f0985
        //and 05_choropleth.html from the book
        d3.csv("PolandPop.csv").then(function(data){
            
            console.log(data);
            
            //Set input domain for color scale, the + is needed to calculate the min and max of the //entire column, I have no idea how the book does it without the +, might be a d3 v5 thing
            color.domain([
                d3.min(data, function(d) { return +d.density; }), 
                d3.max(data, function(d) { return +d.density; })
            ]);
            
            //console.log(d3.max(data, function(d) {return +d.density; }));
			
            //Load in GeoJSON data
			d3.json("poland.json").then(function(json) {
                
                //loop through all the data in the csv file to parse necessary info, aka population //density, modified from example in book and the link listed above the d3.csv() call
                for (var i = 0; i < data.length; i++) {
				
						var dataWoj = data[i].woj;
						
                        //console.log(dataWoj);
						
						var densityWoj = parseFloat(data[i].density);
				
						//loop thorugh json to check names
						for (var j = 0; j < json.features.length; j++) {
						
							var jsonWoj = json.features[j].properties.NAME_1;
                            
                            //console.log(jsonWoj);
                            
                            //check if names are the same
							if (dataWoj == jsonWoj) {
                                //console.log("got here");
                                
								json.features[j].properties.density = densityWoj;
								
								break;
								
							}
						}		
				}
                
                
                console.log(json.features);
                
                var features = json.features;
                
                //unwind coordinates code from piazza answer
                features.forEach(function(feature) {
                    if(feature.geometry.type == "MultiPolygon") {
                        feature.geometry.coordinates.forEach(function(polygon){
                            
                            polygon.forEach(function(ring){
                                ring.reverse();
                            })
                        })
                    }
                    
                    else if(feature.geometry.type == "Polygon"){
                        feature.geometry.coordinates.forEach(function(ring){
                            ring.reverse();
                        })
                    }
                });
				
				//Bind data and create one path per GeoJSON feature
				svg.selectAll("path")
                    .data(features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("stroke", "black")
                    //file each path based on population density info that we parsed from csv file
                    .style("fill", function(d) {
                        //Get data value aka the density info
                        var value = d.properties.density;
                        if (value) {
                            //If value exist, use the gradient defined earlier called color
                            return color(value);
                        } else {
                             //If value is undefined, return a gray color, from the book
                            return "#ccc";
                        }
                });
                 
                //stuff for the legend past here
                
                //shapes for the Legend 
                svg.append("rect")
                   .attr("x", width - 125)
                   .attr("y", height - 300)
                   .attr("width", 20)
                   .attr("height", 20)
                   .attr("stroke", "black")
                   .style("fill", "white");
                
                svg.append("rect")
                   .attr("x", width - 125)
                   .attr("y", height - 275)
                   .attr("width", 20)
                   .attr("height", 20)
                   .attr("stroke", "black")
                   .style("fill", "rgb(237,248,233)");
                
                svg.append("rect")
                   .attr("x", width - 125)
                   .attr("y", height - 250)
                   .attr("width", 20)
                   .attr("height", 20)
                   .attr("stroke", "black")
                   .style("fill", "rgb(186,228,179)");
                
                svg.append("rect")
                   .attr("x", width - 125)
                   .attr("y", height - 225)
                   .attr("width", 20)
                   .attr("height", 20)
                   .attr("stroke", "black")
                   .style("fill", "rgb(116,196,118)");
                
                svg.append("rect")
                   .attr("x", width - 125)
                   .attr("y", height - 200)
                   .attr("width", 20)
                   .attr("height", 20)
                   .attr("stroke", "black")
                   .style("fill", "rgb(0,43,0)");
     
                //text for the legend
                
                svg.append("text")
                   .attr("x", width - 85)
                   .attr("y", height - 325)
                   .attr("dy", "1em")
                   .style("text-anchor", "middle")
                   .attr("font-size", "14px")
                   .text("Population per sq km (p)")
                   .style("fill", "black"); 
                
                svg.append("text")
                   .attr("x", width - 70)
                   .attr("y", height - 300)
                   .attr("dy", "1em")
                   .style("text-anchor", "middle")
                   .attr("font-size", "14px")
                   .text(" p < 100")
                   .style("fill", "black");
                
                svg.append("text")
                   .attr("x", width - 70)
                   .attr("y", height - 275)
                   .attr("dy", "1em")
                   .style("text-anchor", "middle")
                   .attr("font-size", "14px")
                   .text(" p < 130")
                   .style("fill", "black");
                
                svg.append("text")
                   .attr("x", width - 70)
                   .attr("y", height - 250)
                   .attr("dy", "1em")
                   .style("text-anchor", "middle")
                   .attr("font-size", "14px")
                   .text(" p < 200")
                   .style("fill", "black");
                
                svg.append("text")
                   .attr("x", width - 70)
                   .attr("y", height - 225)
                   .attr("dy", "1em")
                   .style("text-anchor", "middle")
                   .attr("font-size", "14px")
                   .text(" p < 300")
                   .style("fill", "black");
                
                svg.append("text")
                   .attr("x", width - 70)
                   .attr("y", height - 200)
                   .attr("dy", "1em")
                   .style("text-anchor", "middle")
                   .attr("font-size", "14px")
                   .text(" p < 400")
                   .style("fill", "black");
		
			});
                
        });
			