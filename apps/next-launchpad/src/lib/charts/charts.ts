/* Core */
import Highcharts from 'highcharts';

const styles = {
    backgroundColor: {
        linearGradient: [ 0, 0, 500, 500 ],
        stops:          [
            [ 0, 'rgb(255, 0, 0)' ],
            [ 1, 'rgb(17, 0, 255)' ],
        ],
    },
    borderWidth:         2,
    plotBackgroundColor: '#00000050',
    plotShadow:          true,
    plotBorderWidth:     1,
};

export const gradient1: Highcharts.Options = {
    chart: {
        ...styles,
    },
    xAxis: {
        type: 'datetime',
    },
    series: [
        {
            data: [
                29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4,
                194.1, 95.6, 54.4,
            ],
            pointStart:    Date.UTC(2010, 0, 1),
            pointInterval: 3600 * 1000, // one hour
        },
    ],
};

export const gradient2: Highcharts.Options = {
    chart: {
        type: 'column',
    },
    xAxis: {
        type: 'datetime',
    },
    series: [
        {
            data: [
                29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4,
                194.1, 95.6, 54.4,
            ],
            pointStart:    Date.UTC(2010, 0, 1),
            pointInterval: 3600 * 1000, // one hour
        },
    ],
};

export const bar: Highcharts.Options = {
    chart: {
        type: 'bar',
    },
    title: {
        text: 'Fruit Consumption',
    },
    subtitle: {
        text: 'By quantity',
    },
    xAxis: {
        categories: [ 'Apples', 'Bananas', 'Oranges' ],
    },
    yAxis: {
        title: { text: 'Fruit eaten' },
    },
    series: [
        {
            name: 'Jane',
            data: [ 1, 0, 4 ],
        },
        {
            name: 'John',
            data: [ 5, 7, 3 ],
        },
    ],
};
