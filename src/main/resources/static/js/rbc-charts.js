var mapTitles = new Map();
mapTitles.set("EU", 'Europe');
mapTitles.set("AF", 'Africa');
mapTitles.set("AS", 'Asia');
mapTitles.set("NA", 'North America');
mapTitles.set("OC", 'Oceania');
mapTitles.set("SA", 'South America');

function drawWorldMapPieCharts(regionData) {
    $("#donutchart-AF").html('');
    $("#donutchart-NA").html('');
    $("#donutchart-OC").html('');
    $("#donutchart-AS").html('');
    $("#donutchart-EU").html('');
    $("#donutchart-SA").html('');


    $.each( regionData, function( key, val ) {
        var r = regionData[key];
        drawPieChart( "donutchart-" + r.regionCode,
                      mapTitles.get(r.regionCode),
                      r.low.assetValue,
                      r.medium.assetValue,
                      r.high.assetValue
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
           title: title,
           width: 180,
           height: 180,
           titleTextStyle: { fontSize: 13 },
           pieHole: 0.6,
           colors: [ '#aaba0a', '#fca311', 'c71D06'],
           pieSliceText: 'none',
           backgroundColor: 'none',
           //reverseCategories: true,
           chartArea: {left:10, top:40, 'width': '100%', 'height': '100%'}
         };

         var chart = new google.visualization.PieChart(document.getElementById(chartID));
         chart.draw(data, options);
       }
 }

 function selectedFund() {
    return $('#fund-selection').val();
 }

 function getAndDrawColumnChart(countryCode) {
    //$.getJSON( "../jsonfiles/Country" + countryCode + '.json', function( data ) {
    $.getJSON( "/api/funds/" + selectedFund() + "/countries/" + countryCode , function( data ) {
        drawColumnChart(data);
    });
  };





function drawColumnChart(countryData) {
    function drawChart() {
        var data = google.visualization.arrayToDataTable([
            ['Rank', 'Acc', 'Cty', 'Total'],
            ['Low', countryData.low.assetValue, countryData.low.percentagePerAssetValue, countryData.low.percentagePerTotalAssetValue],
            ['Medium', countryData.medium.assetValue, countryData.medium.percentagePerAssetValue, countryData.medium.percentagePerTotalAssetValue],
            ['High', countryData.high.assetValue, countryData.high.percentagePerAssetValue, countryData.high.percentagePerTotalAssetValue]
        ]);

        var options = {
            chart: {
                title: 'Bar chart for ' + countryData.countryName
            },
            animation: {
                duration: 1000,
                easing: 'out',
                startup: true
            },
            colors: [ '#aaba0a', '#fca311', 'c71D06']
        };

        var chart = new google.charts.Bar(document.getElementById('country-chart-' + countryData.countryCode));

        chart.draw(data, options);
    }

    google.charts.load('current', {'packages':['bar', 'corechart']});

    var cID = 'country-chart-' + countryData.countryCode;
    var chartDiv  = "<div id='c-" + cID + "' style=\"position:relative\">"
        chartDiv += "<div id='" + cID + "' style='width: 100%; height: 100%'>"
        chartDiv += "</div>"

    $('#country-charts').append(chartDiv);

    google.charts.setOnLoadCallback(drawChart);

    $('#c-' + cID).append("<button onClick=\"$('#c-" + cID + "').remove()\" style='position:absolute; top:0; right:0'>Delete</button>")
}



function loadPieCharts() {
    drawPieChart('donutchart-NA', 'North America', 666, 1234, 235);
    drawPieChart('donutchart-EU', 'Europe', 123, 543, 34);
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