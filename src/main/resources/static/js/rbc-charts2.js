var mapTitles = new Map();
mapTitles.set("EU", 'Europe');
mapTitles.set("AF", 'Africa');
mapTitles.set("AS", 'Asia');
mapTitles.set("NA", 'North America');
mapTitles.set("OC", 'APAC');
mapTitles.set("SA", 'South America');

var mapZoom = {
	world: {scale: 1.4, offsetX: 43, offsetY: 0, detailLevel: 'world'},
	EU: {scale: 2.65, offsetX: -280, offsetY: -50, detailLevel: 'region'}, 	
	NA: {scale: 2.8, offsetX: 20, offsetY: -70, detailLevel: 'region'}, 	
	SA: {scale: 4, offsetX: -180, offsetY: -265, detailLevel: 'region'}, 	
	AS: {scale: 4, offsetX: -370, offsetY: -160, detailLevel: 'region'}, 	
	AF: {scale: 3.5, offsetX: -270, offsetY: -210, detailLevel: 'region'}, 	
	OC: {scale: 5, offsetX: -500, offsetY: -280, detailLevel: 'region'}
}

var detailLevels = ['world', 'region', 'top10', 'country'];	// attention: these constants are used as CSS classes in the html code

var googleChartDisplayTimeInMsec = 200;

var global = {
	worldwideRisk : {
		low : 0,
		medium : 0,
		high: 0
	},
	data : {
		region: null,
		top10: null,
		country: null,
		peps: null
	},
	detailLevel : {
		regionCode: null,
		countryCode: null,
		legalEntitId: null,
		pepsId: null
	},
	resetWorld : function() {
		this.worldwideRisk.low = 0;
		this.worldwideRisk.medium = 0;
		this.worldwideRisk.high = 0;
		this.resetRegion();
	},
	resetRegion : function() {
    	this.detailLevel.regionCode = null;
		this.data.top10 = null;
		this.resetCountry();
	},
	resetCountry : function() {
		this.detailLevel.countryCode = null;
		this.detailLevel.legalEntityId = null;
		this.detailLevel.pepsId = null;
		this.data.country = null;
		this.data.peps = null;
	},
	setRegionData : function(regionData) {
		this.data.region = regionData;
		this.worldwideRisk.low = 0;
		this.worldwideRisk.medium = 0;
		this.worldwideRisk.high = 0;
		var self = this;
	    $.each(regionData, function(index, val ) {
	    	self.worldwideRisk.low += val.low.assetValue;
	    	self.worldwideRisk.medium += val.medium.assetValue;
	    	self.worldwideRisk.high += val.high.assetValue;
	    });
	},
	hasRiskDataForRegion : function(regionCode) {
		return (this.data.region!=null) && (this.data.region[regionCode]!=null);
	},
	hasUsableCountryRiskData : function() {
		var countryData = this.data.country;
		if (countryData) {
			var countryCode = countryData.countryCode;
			var countryName = countryData.countryName;
			return (!((countryName==null) || ((countryData.low.assetValue==0) && (countryData.medium.assetValue==0) && (countryData.high.assetValue==0))));
		} else {
			return false;
		}
	}
};

function clearWorldMapPieCharts(removeUpToDetailLevel) {
	var mustSkip = false;
	for (var i=detailLevels.length; i--; i>=0) {
		if (!mustSkip) {
			$("#donutContainer td." + detailLevels[i]).remove();
			if (detailLevels[i]==removeUpToDetailLevel) {
				mustSkip = true;
			}
		} else {
			break;
		}
	}
}

/**
 * Update the world region data. Typically this function is called when the user
 * changes the fund and that the application received the new region risks from
 * the server side.
 * @param regionData Global risk information on per geographical region basis.
 */
function updateWorldData(regionData) {
	// Clear the UI up to the 'world' level included
	clearWorldMapPieCharts('world');
	// Reset the global data container
	global.resetWorld();
	// Reference the new region risk data in the new global data container
	global.setRegionData(regionData);
	// Refresh the UI
	drawPieCharts();
	// Refresh the map
	colorizeAllRegions();
}

function drawPieCharts() {
	if ($("#donutContainer td.world").size()==0) {
		// Case : no worldwide donut chart displayed
		// Action : display one if the data are available
		if (global.data.region) {
			// Case : world level
			// Action : display the worldwide donut chart
			drawWorldDonutChart();
		}
	} else {
		// Case : worldwide donut chart displayed
		// Action : check if the action button is still compatible with the current application state
		if (global.detailLevel.regionCode==null) {
			//####################################################################
			//removeButton("donutchart-WORLD-action");
		}
	}
	if ($("#donutContainer td.region").size()==0) {
		// Case : no region donutchart displayed
		// Action : if region data is available then display either all the region risks or the risk of a specific region if the user previously selected a region
		if (global.data.region) {
			if (global.detailLevel.regionCode==null) {
				// Case : the user did not selected a specific region
				// Action : display a donut chart for each geographic region for which data is available. The regions are displayed one after the other at regular time intervals
			    setTimeout(function() {
				    var i = 0;
				    $.each(global.data.region, function(regionCode, region) {
				    	i++;
				    	drawRegionsDonutChart(region, i * 200, "detail");
				    });
			    }, 0);
			} else {
				// Case : the user selected a specific region
				// Action : display the donut chart of that specific geographic region and query the top10 countries for that region
				drawRegionsDonutChart(global.data.region[global.detailLevel.regionCode], 0, null);
			    
				getAndDisplayTopTen();
				
				setTimeout(function(){
					// Append a back button on the region level. This will close the details of that region
					//####################################################################
				    drawButton("donutchart-" + global.detailLevel.regionCode + "-action", "back", function(){
				    	// Case : the user clicked on the back button of the worldwide donut chart. That button is visible when the user selected a specific region to see the risks of the countries that are part of that region
				    	// Action : remove the detail display of that selected region and display back the worldwide chart followed by a chart for each geographic region

				    	var currentRegionCode = global.detailLevel.regionCode;
				    	// Clear the UI up to the 'world' level included
				    	clearWorldMapPieCharts('region');
				    	// Unselect the currently selected region and clear any detail data about that region
				    	global.resetRegion();
				    	// Refresh the UI
				    	drawPieCharts();
				    	// Refresh the colorization of the countries in the map
				    	colorizeRegion(currentRegionCode, false);
				    	// Update the map: zoom out to redisplay the world map
				    	zoomAnimate(currentRegionCode, 'world');
				    });
				}, googleChartDisplayTimeInMsec);
			}
			
		}
	}
	if ($("#donutContainer td.top10").size()==0) {
		if (!global.detailLevel.countryCode) {
			// Case : the top 10 countries chart is not displayed and the user has not yet request the details of a country
			// Action : display that chart if the data is available
			if (global.data.top10) {
	            drawTopTenColumnChart();
	            
	            // Remove the 'back' button on the region donut chart. That button is only visible if details about a specific country is displayed which is not the case when the top 10 country ranking is displayed
				//####################################################################
				//removeButton("donutchart-" + global.detailLevel.regionCode + "-action");
			}
		}
	} else {
		// Case : the top 10 countries chart is displayed
		// Action : if the user requested the details of a specific country then remove the top 10 chart
		if (global.detailLevel.countryCode) {
			$("#donutContainer td.top10").remove();
		}		
	}
	
	var mustDrawCountry = false;
	var donutContainerCountryElem = $("#donutContainer td.country"); 
	if (donutContainerCountryElem.size()==0) {
		mustDrawCountry = true;
	} else {
		var currentDisplayedCountryCode = $("#donutContainerCountry", donutContainerCountryElem).data("id");
		if ((global.data.country) && (currentDisplayedCountryCode!=global.data.country)) {
			mustDrawCountry = true;
			clearWorldMapPieCharts('country');
		}
	}	
	
	if (mustDrawCountry) {
		// Case : no country chart is displayed
		// Action : display that chart if the data is available
		if (global.data.country) {
			drawCountryDonutChart();

			if (global.hasUsableCountryRiskData()) {
				setTimeout(function(){
					// Append a back button on the selected country level. This will close the details of that country
					//####################################################################
				    drawButton("donutchart-" + global.detailLevel.countryCode + "-action", "back", function(){
				    	// Case : the user clicked on the back button of a region donut chart. That button is visible when the user selected a specific country
				    	// Action : remove the detail display of that selected country and display back the worldwide chart followed by a chart for the selected region followed by the top 10 chart

				    	// Clear the UI up to the 'world' level included
				    	clearWorldMapPieCharts('country');
				    	// Unselect the currently selected country and clear any detail data about that country
				    	global.resetCountry();
				    	// Refresh the UI
				    	drawPieCharts();	    	
				    });
				}, googleChartDisplayTimeInMsec);
			}
		}
	}
	
	// Action : display (or redraw) the legal entity list and the peps list if the data is available
	var legalEntityContainerElem = $("#legalEntityContainer");
	var pepsContainerElem = $("#pepsContainer");
	
	// Clear the displayed legal entities and the displayed peps
	legalEntityContainerElem.children().remove();
	pepsContainerElem.children().remove();
	
	if (global.data.peps!=null) {
		drawPepsTable();
		$("#pepsPanel").show();
	} else {
		$("#pepsPanel").hide();
	}
}

function drawWorldDonutChart() {
	var elemStr = 
		'<td class="world">' +
			'<div class="donutContainer">' +
				'<div id="donutchart-WORLD-title" class="donutContainerTitle">Worldwide</div>' +
				'<div id="donutchart-WORLD" class="donutContainerContent"></div>' +
				'<div id="donutchart-WORLD-action" class="donutContainerActions">' +
				'</div>' +
	    	'</div>' +
	    '</td>"';

	var elem = $(elemStr);
	$("#donutContainer").append(elem);
	
    drawDonutChart("donutchart-WORLD", "Worldwide", global.worldwideRisk.low, global.worldwideRisk.medium, global.worldwideRisk.high);
}

function drawRegionsDonutChart(val, timeout, detailActionButtonType) {
	var drawFunction = function() {		
		var regionCode = val.regionCode;
		var regionLabel = mapTitles.get(regionCode);
		var actionDivElemId = 'donutchart-' + regionCode + '-action';
		var elemStr = 
			'<td class="region">' +
				'<div class="donutContainer">' +
					'<div id="donutchart-' + regionCode + '-title" class="donutContainerTitle">' + regionLabel + '</div>' +
					'<div class="worldOverlay">' +
						'<div id="donutchart-' + regionCode + '-WORLD" style="width: 100%; height: 100%;"></div>' +
						'<div class="regionOverlay">' +
							'<div id="donutchart-' + regionCode + '" style="width: 100%; height: 100%;"></div>' +
						'</div>' +
					'</div>' +
					'<div id="' + actionDivElemId +'" class="donutContainerActions">' +
					'</div>' +
		    	'</div>' +
		    '</td>"';
	
		var elem = $(elemStr);
		$("#donutContainer").append(elem);
		
	    drawOuterDonutChart( "donutchart-" + regionCode + "-WORLD",
	        regionLabel,
	        val.low.assetValue,
	        global.worldwideRisk.low,
	        val.medium.assetValue,
	        global.worldwideRisk.medium,
	        val.high.assetValue,
	        global.worldwideRisk.high
	    );
	    drawDonutChart( "donutchart-" + regionCode,
	        regionLabel,
	        val.low.assetValue,
	        val.medium.assetValue,
	        val.high.assetValue
	    );
	    if ("detail"==detailActionButtonType) {
	    	// Case : associate the donut chart of a region with a 'detail' button
			//####################################################################
		    drawButton(actionDivElemId, "detail", function(){
		    	// Case : the user clicked on the detail button of a region donut chart
		    	// Action : drill down to the selected region. That is display that region donut chart next at the right of the worldwide chart and query the server for the top 10 countries of that region
		    	regionDetailActionHandlerEvent(regionCode);
		    });
	    }
	};
	
	if (timeout==0) {
		drawFunction();
	} else {
		setTimeout(drawFunction, timeout);
	}
}

/**
 * Handler for the event triggered by the user that clicked on the detail button
 * of a region donut chart. This function drill downs to the selected region.
 * That is display that region donut chart next at the right of the worldwide 
 * chart and query the server for the top 10 countries of that region.
 */
function regionDetailActionHandlerEvent(regionCode) {
	// Clear the UI up to the region level included
	clearWorldMapPieCharts('region');
	// Set the region to focus on
	global.detailLevel.regionCode = regionCode;
	// Refresh the UI
	drawPieCharts();
	// Refresh the colorization of the countries in the map
	colorizeRegion(regionCode, false);
	// Update the map: zoom to the selected region
	zoomAnimate('world', regionCode);
}

function drawCountryDonutChart() {
	var countryData = global.data.country;
	var countryCode = countryData.countryCode;
	var countryName = countryData.countryName;

	var hasCountryData = global.hasUsableCountryRiskData();
	
	var actionDivElemId = 'donutchart-' + countryCode + '-action';
	var regionData = global.data.region[global.detailLevel.regionCode];
	
	if (hasCountryData) {
		var elemStr = 
			'<td class="country">' +
				'<div class="donutContainer donutContainerCountry" data-id="' + countryCode + '">' +
					'<div id="donutchart-' + countryCode + '-title" class="donutContainerTitle">' + countryName + '</div>' +
					'<div class="worldOverlay">' +
						'<div id="donutchart-' + countryCode + '-WORLD" style="width: 100%; height: 100%;"></div>' +
						'<div class="regionOverlay">' +
							'<div id="donutchart-' + countryCode + '-REGION" style="width: 100%; height: 100%;"></div>' +
							'<div class="countryOverlay">' +
								'<div id="donutchart-' + countryCode + '" style="width: 100%; height: 100%;"></div>' +
							'</div>' +
						'</div>' +
					'</div>' +
					'<div id="' + actionDivElemId +'" class="donutContainerActions">' +
					'</div>' +
		    	'</div>' +
		    '</td>"';

		var elem = $(elemStr);
		$("#donutContainer").append(elem);
		
	    drawOuterDonutChart( "donutchart-" + countryCode + "-WORLD",
	    	countryName,
	    	countryData.low.assetValue,
	        global.worldwideRisk.low,
	        countryData.medium.assetValue,
	        global.worldwideRisk.medium,
	        countryData.high.assetValue,
	        global.worldwideRisk.high
	    );
	    drawOuterDonutChart( "donutchart-" + countryCode + "-REGION",
	    	countryName,
	    	countryData.low.assetValue,
	    	regionData.low.assetValue,
	        countryData.medium.assetValue,
	        regionData.medium.assetValue,
	        countryData.high.assetValue,
	        regionData.high.assetValue
	    );
	    drawDonutChart( "donutchart-" + countryCode,
	    	countryName,
	        countryData.low.assetValue,
	        countryData.medium.assetValue,
	        countryData.high.assetValue
	    );
	    
		// Case : associate the donut chart with a 'back' button
		//####################################################################
	    drawButton(actionDivElemId, "back", function(){
	    	// Case : the user clicked on the back button of a country donut chart
	    	// Action : remove all country level information
	    	
	    });
	} else {
		// Case : no data available for the currently selected country
		// Action : display a warning message that will be displayed for a limited amount time
		var elemStr = 
			'<td class="country">' +
				'<div class="donutContainer donutContainerCountry">' +
					'<div id="donutchart-' + countryCode + '-title" class="donutContainerTitle">&nbsp;</div>' +
					'<div class="worldOverlay countryNoData">No data is available for the selected country</div>' +
					'<div id="' + actionDivElemId +'" class="donutContainerActions">' +
					'</div>' +
		    	'</div>' +
		    '</td>"';

		var elem = $(elemStr);
		$("#donutContainer").append(elem);
		setTimeout(function(){
			elem.remove();
		}, 1500);
	}   
}

function getAndDisplayTopTen() {
    $.getJSON( "/api/funds/" + selectedFund() + '/regions/'+ global.detailLevel.regionCode +'/topcountries/10', function( data ) {
        countriesMap = data.countries.reduce(function(map, obj) {
            map[obj.countryCode] = obj;
            return map;
        }, {});

        // Reference the top 10 countries by the global data structure
        global.data.top10 = countriesMap;
        // Refresh the UI
        drawPieCharts();
    });
};

function drawTopTenChart(countryCode){
    $.each( countryCode, function( key, val ) {
        var r = countryCode[key];
        var cID = 'topdonutchart-' + r.countryCode;
        var tableDiv = "<TD><div id='" + cID + "' style='width: 100%; height: 100%'>"
        tableDiv += "</div></TD>"
        $("#topten").append(tableDiv);
        drawPieChart( cID,
            r.countryName + " (" + r.TotalAssetNumber + ")",
            r.Low.assetValue,
            r.Medium.assetValue,
            r.High.assetValue
        );
    });
}

function drawPieChart(chartID, title, l, m, h) {
    google.charts.load("current", {packages:["corechart"]});
    google.charts.setOnLoadCallback(drawChart);

       function drawChart() {
         var data = google.visualization.arrayToDataTable([
           ['Rank'  , 'Percent'],
           ['Low'   ,  l],
           ['Medium',  m],
           ['High'  ,  h]
         ]);

         var options = {
             legend: {position: "none"},
           title: title,
           width: 150,
           height: 150,
           titleTextStyle: { fontSize: 13 },
           pieHole: 0.6,
           colors: [ '#aaba0a', '#fca311', 'c71D06'],
           pieSliceText: 'none',
           backgroundColor: 'none',
           chartArea: {left:10, top:40, 'width': '100%', 'height': '100%'}
         };

         var chart = new google.visualization.PieChart(document.getElementById(chartID));
         chart.draw(data, options);
       }
 }


function drawDonutChart(elemId, title, lowRisk, mediumRisk, highRisk) {
    google.charts.load("current", {packages:["corechart"]});
    google.charts.setOnLoadCallback(drawChart);

       function drawChart() {
         var data = google.visualization.arrayToDataTable([
           ['Rank'  , 'Percent'],
           ['Low'   ,  lowRisk],
           ['Medium',  mediumRisk],
           ['High'  ,  highRisk]
         ]);

         var options = {
           legend: {position: "none"},
           pieHole: 0.4,
           colors: ['rgb(23,160,94)', 'rgb(255,206,66)', 'rgb(219,72,60)'],
           pieSliceText: 'none',
		   pieStartAngle: 90,
 		   backgroundColor: { fill:'transparent' },
		   chartArea:{left:'auto',top:'auto', right:'auto',width:"80%",height:"80%"}
         };

         var chart = new google.visualization.PieChart(document.getElementById(elemId));
         chart.draw(data, options);
       }
 }


function drawOuterDonutChart(elemId, title, lowRisk, globalLowRisk, mediumRisk, globalMediumRisk, highRisk, globalHighRisk) {
	var containerElem = document.getElementById(elemId);
	if (containerElem!=null) {
	    google.charts.load("current", {packages:["corechart"]});
	    google.charts.setOnLoadCallback(drawChart);
	
       function drawChart() {
    	  var tot = lowRisk + mediumRisk + highRisk;
    	  
         var data = google.visualization.arrayToDataTable([
           ['Rank'  , 'Percent'],
           ['Low'   ,  (lowRisk/tot)*(lowRisk*100/globalLowRisk)],
           ['Global Low'   ,  (lowRisk/tot)*((globalLowRisk-lowRisk)*100/globalLowRisk)],
           ['Medium',  (mediumRisk/tot)*(mediumRisk*100/globalMediumRisk)],
           ['Global medium',  (mediumRisk/tot)*((globalMediumRisk-mediumRisk)*100/globalMediumRisk)],
           ['High'  ,  (highRisk/tot)*(highRisk*100/globalHighRisk)],
           ['Global high'  ,  (highRisk/tot)*((globalHighRisk-highRisk)*100/globalHighRisk)]
         ]);

         var options = {
           legend: {position: "none"},
           pieHole: 0.9,
           colors: ['rgb(23,160,94)', 'rgb(185,227,207)', 'rgb(255,206,66)', 'rgb(255,240,199)', 'rgb(219,72,60)', 'rgb(244,200,197)'],
           pieSliceText: 'none',
		   pieStartAngle: 90,
 		   backgroundColor: { fill:'transparent' },
		   chartArea:{left:'auto',top:'auto', right:'auto',width:"80%",height:"80%"}
         };

         var chart = new google.visualization.PieChart(containerElem);
         chart.draw(data, options);
       }
	}
 }

function removeButton(containerElemId) {
	$("#" + containerElemId).children().remove();
}

function drawButton(containerElemId, buttonType, mouseClickHandler) {
	 var elemStr = 
		'<button class="actionButton" type="button">' +
			'<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 18 18" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">'; 
	 if ("back"==buttonType) {
		 elemStr += '<path d="M 2 12 h15 v-4 h-15 v4 z    M 2 8 l7 -7 h4 l-7 7 h-4 z     M 2 12 l7 7 h4 l-7 -7 h-4 z"></path>';
	 } else if ("detail"==buttonType) {
		 elemStr += '<path d="M 12 2 v15 h-4 v-15 h4 z    M 8 17 l-7 -7 v-4 l7 7 v4 z     M 12 17 l7 -7 v-4 l-7 7 v4 z"></path>';
	 }
	 
	 elemStr +=			
		 	'</svg>' +
		 '</button>';
	 var elem = $(elemStr);
	 if (mouseClickHandler) {
		 elem.on("click", mouseClickHandler);
	 }
	 var containerElem = $("#" + containerElemId);
	 containerElem.children().remove();
	 containerElem.append(elem);
	 
 }

 function selectedFund() {
    return $('#fund-selection').val();
 }

function drawTopTenColumnChart(){
	var elemStr = 
		'<td class="top10">' +
			'<div class="chartContainer">' +
				'<div id="donutchart-TOP10-title" class="donutContainerTitle">Top 10 highest risk countries</div>' +
				'<div id="donutchart-TOP10" style="height:140px; width:100%"></div>' +
				'<div id="donutchart-TOP10-action" class="donutContainerActions" style="position:relative; height:34px;">' +
				'</div>' +
	    	'</div>' +
	    '</td>"';

	var elem = $(elemStr);
	$("#donutContainer").append(elem);
	
	
    google.charts.load('current', {'packages':['bar']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {

        var data = new google.visualization.DataTable()
        data.addColumn('string', 'Countries');
        data.addColumn('number', 'Asset Value');
        data.addColumn('number', 'World %');

        $.each(global.data.top10, function(countryCode, top10Data) {
            data.addRow([countryCode, top10Data.high.assetValue, (top10Data.high.assetValue/top10Data.high.globalAssetValue)*100]);
        });


        var options = {
            //chartArea:{left:20,top:0,width:'100%',height:'100%'},
        	legend: {
        		position: "none",
        		txtStyle: {
            		bold: true
            	}
        			},
   		   	backgroundColor: { fill:'transparent' },
            axisTitlesPosition : 'none',
            hAxis: {
            	textPosition: 'none',
            	title: 'Hello',
            	titleTextStyle: {
            		bold: true,
            		fontSize: '20px',
            	    color: '#FF0000'
            	},
            	textStyle: {
            		bold: true
            	}},
   		   	chartArea:{left:'auto',top:'auto', right:'auto',width:"80%",height:"80%"},
            series: {
                0: { axis: 'assetNum', visibleInLegend:false }, // Bind series 0 to an axis named 'distance'.
                1: { axis: 'compWorld', visibleInLegend: false } // Bind series 1 to an axis named 'brightness'.
            },
            axes: {
                y: {
                    assetNum: {label: 'Asset Number'}, // Left y-axis.
                    compWorld: {side: 'right', label: '%'} // Right y-axis.
                }
            },
            colors: [ 'red', 'blue', 'blue']
        };
               
        var chart = new google.charts.Bar(document.getElementById('donutchart-TOP10'));
        chart.draw(data, options);
        
        // Find in the chart all the X axis data (so the countries that compose the top 10) and for each of them add a button that a user can press to obtain country data
        // This operation is done asynchronously because google chart is not yet rendered
        setTimeout(function() {
	        var svgChartTextContainer = $("#donutchart-TOP10 svg").find("g").get(4);
	        
	        var refY = null; var count = 0;
	        $("text", svgChartTextContainer).each(function(index, value){
	        	// Extract the x position of the country label so as to position the button just underneath it
	        	var x = value.x.baseVal[0].value;
	        	var y = value.y.baseVal[0].value;
        		var countryCode = value.textContent;
	        	if ((!refY) || (y==refY)) {
	        		refY = y;
	        		
		        	var buttonContainerId = "country-detail-" + countryCode;
		        	var offset = x - 14; 	// Substract the half size of button width 
		        	var buttonContainerElem = $('<div id="' + buttonContainerId + '" style="width=34px; height:34px; position: absolute; top:0px; left:' + offset + 'px"></div>');
		        	$("#donutchart-TOP10-action").append(buttonContainerElem);
		        	// Add the button to request the country detail information
					//####################################################################
			        drawButton(buttonContainerId, "detail", function(){
			        	// Case : the user clicked on the button to get details about a country that is part of the top 10 ranking
			        	// Action : request the server for the country risk information and for the list of legal entities / peps
			        	countryDetailActionHandlerEvent(countryCode);
			        });
			        count++;
	        	}
	        });
        }, googleChartDisplayTimeInMsec);
    }
}

/**
 * Handler for the event triggered by the user who clicked on the detail button
 * of a country displayed in the top 10 ranking . This function drill downs to 
 * the selected country. Concretely this function requests the server for the 
 * country risk information and for the list of legal entities / peps. 
 */
function countryDetailActionHandlerEvent(countryCode) {
	getAndDisplayCountryDetails(countryCode);
	getAndDisplayPeps(countryCode, 'H');
}


function getAndDisplayCountryDetails(countryCode) {
   $.getJSON( "/api/funds/" + selectedFund() + "/countries/" + countryCode , function( data ) {
	   // Reference the obtained data by the global data structure
	   global.data.country = data;
	   global.detailLevel.countryCode = countryCode;
	   // Refresh the UI
	   drawPieCharts();
   });
};


function drawColumnChart(countryData) {

    function drawChart() {

        var data = new google.visualization.arrayToDataTable([
            ['Rank', 'Low', 'Medium', 'High'],
            ['% Investor', countryData.low.investorCount, countryData.medium.investorCount, countryData.high.investorCount],
            ['Country (asset)' , countryData.low.assetValue   , countryData.medium.assetValue, countryData.high.assetValue],
            ['World (asset)'  , countryData.low.globalAssetValue , countryData.medium.globalAssetValue , countryData.high.globalAssetValue]
        ]);

        var options = {
            legend: {position: "none"},
            isStacked: 'percent',
            titleTextStyle: { fontSize: 13 },
            title: 'Distribution of risk ' + countryData.countryName,
            colors: [ '#aaba0a', '#fca311', '#c71D06']
        };

        var chart = new google.visualization.ColumnChart(document.getElementById('country-chart-' + countryData.countryCode));

        google.visualization.events.addListener(chart, 'select', function(e) {
            var selectedItem = chart.getSelection()[0];
            var countryCode = chart.ga.id.replace("country-chart-", "");
            var columnIndex = selectedItem.column;
            var riskMap = {"0": "low", "1": "medium", "2": "high"};
            getAndDisplayPeps(countryCode, riskMap[columnIndex]);
        });

        chart.draw(data, options);
    }

    google.charts.load('current', {'packages':['bar', 'corechart']});

    var cID = 'country-chart-' + countryData.countryCode;
    var chartDiv  = "<div id='c-" + cID + "' style=\"position:relative\">"
        chartDiv += "<div id='" + cID + "' style='width: 100%; height: 100%'>"
        chartDiv += "</div>"

    $('#country-charts').append(chartDiv);


    google.charts.setOnLoadCallback(drawChart);

    var btn = "<a class=\"btn btn-default\" type=\"button\" onclick=\"$('#c-" + cID + "').remove()\" style='position:absolute; top:0; right:0'>";
        btn += "<i class=\"fa fa-trash\"></i> ";
        btn += "</a>";

    $('#c-' + cID).append(btn);
}

function getAndDisplayPeps(countryCode, riskLevel) {
    $.getJSON("/api/funds/" + selectedFund() + "/countries/" + countryCode+ "/legalEntities/rads/" + riskLevel, function(data) {
 	   // Reference the obtained data by the global data structure
 	   global.data.peps = data;
 	   // Refresh the UI
 	   drawPieCharts();
    });
};

function drawPepsTable() {
	var legalEntityContainerElem = $("#legalEntityContainer");
	var pepsContainerElem = $("#pepsContainer");
		
	// Find the legal entities and the peps to be displayed
	var toDisplayLegalEntities = []; var toDisplayPeps = [];
	var isLegalEntitySelectable = false; var isPepsSelectable = false;
	
	var selectedLegalEntityId = global.detailLevel.legalEntityId;
	var selectedPepsId = global.detailLevel.pepsId;
	
	if (selectedLegalEntityId) {
		// Case : the user selected a legal entity
		global.data.peps.legalEntities.forEach(function(legalEntity){
			if (legalEntity.id==selectedLegalEntityId) {
				toDisplayLegalEntities.push(legalEntity);
				toDisplayPeps = legalEntity.peps;
			}
		});
		isLegalEntitySelectable = true;
		isPepsSelectable = false;
	} else if (selectedPepsId) {
		// Case : the user selected a peps
		global.data.peps.legalEntities.forEach(function(legalEntity){
			legalEntity.peps.forEach(function(peps){
				if (peps.id==selectedPepsId) {
					if (toDisplayPeps.length==0) {
						toDisplayPeps.push(peps);
					}
					toDisplayLegalEntities.push(legalEntity);
				}
			});
		});
		isLegalEntitySelectable = false;
		isPepsSelectable = true;
	} else {
		toDisplayLegalEntities = global.data.peps.legalEntities;
		var mapPepsAccumulator = new Map();
		global.data.peps.legalEntities.forEach(function(legalEntity){
			legalEntity.peps.forEach(function(peps){
				mapPepsAccumulator.set(peps.id, peps);
			})
		});
		mapPepsAccumulator.forEach(function(value, key){
			toDisplayPeps.push(value);
		});
		isLegalEntitySelectable = true;
		isPepsSelectable = true;
	}
	
	// Draw the legal entities
	toDisplayLegalEntities.forEach(function(legalEntity){
		var elemStr = 
	    	'<div class="legalEntity" id="'+ legalEntity.id + '">' +
	    		'<div style="font-weight: bold;">' + legalEntity.name + '</div>' +
    			'<div>' +
    				'<div style="width:50%; display: inline-block">' + legalEntity.type + '</div>' +
    				'<div style="width:50%; display: inline-block">' + legalEntity.nature + '</div>' +
    			'</div>' +
    		'</div>';
		var elem = $(elemStr);
		if (global.detailLevel.legalEntityId==legalEntity.id) {
			elem.addClass("selected");
		}
		if (isLegalEntitySelectable) {
			elem.addClass("selectable-legalEntity");
		}
		legalEntityContainerElem.append(elem);
	});
	
	// Draw the peps
	toDisplayPeps.forEach(function(peps, pepsId){
		var elemStr = 
	    	'<div class="peps" id="' + peps.id + '">' +
	    		'<div style="font-weight: bold;">' + peps.firstName + " " + peps.lastName + '</div>' +
    			'<div>' +
    				'<div style="width:33%; display: inline-block">' + peps.role + '</div>' +
    				'<div style="width:33%; display: inline-block">' + peps.country + '</div>' +
    				'<div style="width:34%; display: inline-block">' + peps.country + '</div>' +
    			'</div>' +
    		'</div>';
		var elem = $(elemStr);
		if (global.detailLevel.pepsId==peps.id) {
			elem.addClass("selected");
		}
		if (isPepsSelectable) {
			elem.addClass("selectable-peps");
		}
		pepsContainerElem.append(elem);
	});
}

function legalEntityClickedHandler(event) {
	// Case : the user clicked onto a legal entity
	var legalEntityElem = $(event.target).closest(".legalEntity");
	if (global.detailLevel.legalEntityId) {
		// Case : a legal entity is currently selected
		// Action : unselect that entity and redraw the legal entity and peps tables
		global.detailLevel.legalEntityId = null;
	} else {
		// Case : a legal entity is not yet currently selected
		// Action : filter the peps list to display only those items that are linked to the selected legal entity
		if (!global.detailLevel.pepsId) {
			var legalEntityId = legalEntityElem.get(0).id;
			global.detailLevel.legalEntityId = legalEntityId; 
		} else {
			return;
		}
	}
    // Refresh the UI
    drawPieCharts();
}

function pepsClickedHandler(event) {
	// Case : the user clicked onto a peps
	var pepsElem = $(event.target).closest(".peps");
	if (global.detailLevel.pepsId) {
		// Case : a peps is currently selected
		// Action : unselect that peps and redraw the legal entity and peps tables
		global.detailLevel.pepsId = null; 
	} else {
		// Case : a peps is not yet currently selected
		// Action : filter the legal entity list to display only those that owns the peps
		if (!global.detailLevel.legalEntityId) {
			var pepsId = pepsElem.get(0).id;
			global.detailLevel.pepsId = pepsId; 
		} else {
			return;
		}
	}
    // Refresh the UI
    drawPieCharts();
}


function loadFundDropdown() {
    $.getJSON("/api/funds", function (funds) {
        funds.forEach(function (fund) {
            var option = $('<option/>');
            option.attr({'value': fund.id}).text(fund.name);
            $('#fund-selection').append(option);
        });
    });
}


















// The list of all the possible geographical regions
var regions = []; 
mapTitles.forEach(function(value, key){
	regions.push(key);
});

// The current detail level in the map
var mapCurrentDetailLevel = 'world';

function extractRegion(elem) {
	var elemClasses = elem.getAttribute("class");
	if (elemClasses!=null) {
		for (var i=0; i<regions.length; i++) {
			if (elemClasses.indexOf(regions[i]+" ")>-1) {
				return regions[i];
			}
		}
	}
	return null;
}

function extractCountry(elem) {
	var elemClasses = elem.getAttribute("class");
	if (elemClasses!=null) {
		var pos = elemClasses.indexOf("country-");
		if (pos>-1) {
			return elemClasses.substring(pos+8, pos+10); 
		}
	}
	return null;
}

function colorizeAllRegions() {
	regions.forEach(function(regionCode){
		colorizeRegion(regionCode);
	});
}

function colorizeRegion(regionCode, isMouseOver) {
	if (!isMouseOver) {
		var isSelectedRegion = (global.detailLevel.regionCode!=null) ? (global.detailLevel.regionCode==regionCode) : false; 

		if (isSelectedRegion) {
			// Case : the user selected this region
			jQuery("." + regionCode).each(function(index, elem){
				elem.classList.remove("mapRegionData");
				elem.classList.add("mapRegionDataSelected");
				elem.classList.remove("mapRegionNoData");
				elem.classList.remove("mapRegionMouseOver");
			});
		} else {
			if (global.hasRiskDataForRegion(regionCode)) {
				// Case : the user did not selected this region but risk data is available for that region
				jQuery("." + regionCode).each(function(index, elem){
					elem.classList.add("mapRegionData");
					elem.classList.remove("mapRegionDataSelected");
					elem.classList.remove("mapRegionNoData");
					elem.classList.remove("mapRegionMouseOver");
				});
			} else {
				// Case : the user did not selected this region and no risk data is available for that region
				jQuery("." + regionCode).each(function(index, elem){
					elem.classList.remove("mapRegionData");
					elem.classList.remove("mapRegionDataSelected");
					elem.classList.add("mapRegionNoData");
					elem.classList.remove("mapRegionMouseOver");
				});
			}
		}
	} else {
		jQuery("." + regionCode).each(function(index, elem){
			elem.classList.remove("mapRegionData");
			elem.classList.remove("mapRegionDataSelected");
			elem.classList.remove("mapRegionNoData");
			elem.classList.add("mapRegionMouseOver");
		});
	}	
}

function colorizeCountry(countryCode, regionCode, isMouseOver) {
	if (!isMouseOver) {
		var isSelectedCountry = (global.detailLevel.countryCode!=null) ? (global.detailLevel.countryCode==countryCode) : false; 

		if (isSelectedCountry) {
			// Case : the user selected this country
			jQuery(".country-" + countryCode).each(function(index, elem){
				elem.classList.remove("mapRegionData");
				elem.classList.add("mapRegionDataSelected");
				elem.classList.remove("mapRegionMouseOver");
			});
		} else {
			// Case : the user did not selected this region
			var isSelectedRegion = (global.detailLevel.regionCode!=null) ? (global.detailLevel.regionCode==regionCode) : false;
			if (isSelectedRegion) {
				// Case : the country under focus is part of the currently selected region
				jQuery(".country-" + countryCode).each(function(index, elem){
					elem.classList.remove("mapRegionData");
					elem.classList.add("mapRegionDataSelected");
					elem.classList.remove("mapRegionMouseOver");
				});
			} else {
				// Case : the country under focus is not part of the currently selected region
				jQuery(".country-" + countryCode).each(function(index, elem){
					elem.classList.add("mapRegionData");
					elem.classList.remove("mapRegionDataSelected");
					elem.classList.remove("mapRegionMouseOver");
				});
			}
		}
	} else {
		if (global.detailLevel.regionCode==regionCode) {
			jQuery(".country-" + countryCode).each(function(index, elem){
				elem.classList.remove("mapRegionData");
				elem.classList.remove("mapRegionDataSelected");
				elem.classList.add("mapRegionMouseOver");
			});
		}
	}
	
}

function animate(i, scale, offsetX, offsetY, mapElem) {
	window.setTimeout(function(){
		mapElem.setAttribute("transform", "translate(" + offsetX + "," + offsetY + ") scale(" + scale + ","+ scale + ")");
	}, 40*i)
}

function zoomAnimate(startZoomKey, endZoomKey) {
	if ((mapZoom[startZoomKey].detailLevel=='region') && (mapZoom[endZoomKey].detailLevel=='region')) {
		_zoomAnimateHelper(startZoomKey, 'world');
		_zoomAnimateHelper('world', endZoomKey);
	} else {
		_zoomAnimateHelper(startZoomKey, endZoomKey);
	}
}

function _zoomAnimateHelper(startZoomKey, endZoomKey) {
	var steps = 10;
	
	var startScale = mapZoom[startZoomKey].scale;
	var startOffsetX = mapZoom[startZoomKey].offsetX;
	var startOffsetY = mapZoom[startZoomKey].offsetY;
	startOffsetX *= startScale; startOffsetY *= startScale; 
	
	var endScale = mapZoom[endZoomKey].scale;
	var endOffsetX = mapZoom[endZoomKey].offsetX;
	var endOffsetY = mapZoom[endZoomKey].offsetY;
	endOffsetX *= endScale; endOffsetY *= endScale; 
	
	isWorldVisible = false;
	
	var scaleStep = (endScale - startScale)/steps;
	var offsetXStep = (endOffsetX - startOffsetX)/steps;
	var offsetYStep = (endOffsetY - startOffsetY)/steps;
	
	mapCurrentDetailLevel = mapZoom[endZoomKey].detailLevel;
	var mapElem = document.getElementById("world");
	for (var i=0; i<steps; i++) {
		animate(i, startScale + (scaleStep*i), startOffsetX + (offsetXStep*i), startOffsetY + (offsetYStep*i), mapElem);
	}
	animate(steps, endScale, endOffsetX, endOffsetY, mapElem);
}

function zoomStatic(zoomKey) {
	var zoomData = mapZoom[zoomKey];
	var mapElem = document.getElementById("world");
	mapCurrentDetailLevel = zoomData.detailLevel;
	mapElem.setAttribute("transform", "translate(" + zoomData.offsetX + "," + zoomData.offsetY + ") scale(" + zoomData.scale + " " + zoomData.scale + ")");
}