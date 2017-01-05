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
        drawPieChart( "donutchart-" + r.entityId,
                      mapTitles.get(r.entityId),
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
           reverseCategories: true,
           chartArea: {left:10, top:40, 'width': '100%', 'height': '100%'}
         };

         var chart = new google.visualization.PieChart(document.getElementById(chartID));
         chart.draw(data, options);
       }
 }


 function drawColumnChart('countryCode')
$.getJSON( "../jsonfiles/", function( data ) {
    regionsMap = data.reduce(function(map, obj) {
        map[obj.entityId] = obj;
        return map;
    }, {});
    drawMap(data);
    drawWorldMapPieCharts(data);
});





function drawColumnChart(countryCode) {
    google.charts.load('current', {'packages':['bar', 'corechart']});
    google.charts.setOnLoadCallback(drawChart);

    $('#country-chart').html('');

    function drawChart() {
        var data = google.visualization.arrayToDataTable([
            ['Rank', 'Acc', 'Cty', 'Total'],
            ['Low', 1000, 400, 200],
            ['Medium', 1170, 460, 250],
            ['High', 660, 1120, 300],
        ]);

        var options = {
            chart: {
                title: 'Bar chart for ' + countryCode
            }
        };

        var chart = new google.charts.Bar(document.getElementById('country-chart'));

        chart.draw(data, options);
    }
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