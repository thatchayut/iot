$(function() {

    let HIGH = 100
    let MED = 50
    let LOW = 0
    Morris.Line({
        element: 'morris-area-chart',
        data: [{
            period: '2017-1-1',
            high_temp: 30,
            low_temp: 28
        }, {
            period: '2017-2-1',
            high_temp: 32,
            low_temp: 31
        }, {
            period: '2017-3-1',
            high_temp: 29,
            low_temp: 27
        }, {
            period: '2017-4-1',
            high_temp: 29,
            low_temp: 27
        }, {
            period: '2017-5-1',
            high_temp: 25,
            low_temp: 23
        }, {
            period: '2017-6-1',
            high_temp: 22,
            low_temp: 21
        }, {
            period: '2017-7-1',
            high_temp: 22,
            low_temp: 19
        }, {
            period: '2017-8-1',
            high_temp: 17,
            low_temp: 16
        }, {
            period: '2017-9-1',
            high_temp: 17,
            low_temp: 16
        }, {
            period: '2017-10-1',
            high_temp: 16,
            low_temp: 15
        }],
        xkey: 'period',
        ykeys: ['high_temp', 'low_temp'],
        labels: ['Highest Temperature(°C)', 'Lowest Temperature(°C)'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });

    Morris.Donut({
        element: 'morris-donut-chart',
        data: [{
            label: "Download Sales",
            value: 12
        }, {
            label: "In-Store Sales",
            value: 30
        }, {
            label: "Mail-Order Sales",
            value: 20
        }],
        resize: true
    });

    Morris.Bar({
        element: 'morris-bar-chart',
        data: [{
            y: '2006',
            a: 100,
            b: 90
        }, {
            y: '2007',
            a: 75,
            b: 65
        }, {
            y: '2008',
            a: 50,
            b: 40
        }, {
            y: '2009',
            a: 75,
            b: 65
        }, {
            y: '2010',
            a: 50,
            b: 40
        }, {
            y: '2011',
            a: 75,
            b: 65
        }, {
            y: '2012',
            a: 100,
            b: 90
        }],
        xkey: 'y',
        ykeys: ['a', 'b'],
        labels: ['Series A', 'Series B'],
        hideHover: 'auto',
        resize: true
    });
    
});
