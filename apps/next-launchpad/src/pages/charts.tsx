/* Core */
import { useRef, useEffect } from 'react';
import { NextPage } from 'next';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

/* Components */
import { Layout, Nav } from '@/components';

/* Instruments */
import { bar as options } from '@/lib/charts';

const ChartsPage: NextPage = () => {
    const chartRef = useRef<HighchartsReact.RefObject>(null);

    useEffect(() => {
        setTimeout(() => {
            // chartRef.current.chart.showLoading('loading...');
            chartRef.current.chart.setTitle();
        }, 1000);
    }, []);

    return (
        <Layout>
            <Nav title = 'Charts' />

            <HighchartsReact
                highcharts = { Highcharts }
                options = { options }
                ref = { chartRef }
            />
        </Layout>
    );
};

export default ChartsPage;
