import { Component } from 'react';

declare module 'react-plotly.js' {
    interface PlotData {
        x?: any;
        y?: any;
        type: 'scatter' | 'bar' | 'line' | 'scatter3d' | 'surface' | 'histogram' | 'box' | 'violin' | 'pie' | 'heatmap' | 'contour' | 'scattergl' | 'scattermapbox' | 'choropleth' | 'scattergeo' | 'scatterpolar' | 'scatterternary' | 'scattercarpet' | 'scattercone' | 'scatterstreamtube' | 'scattervolume' | 'scattermesh3d';
        mode?: 'lines' | 'markers' | 'lines+markers' | 'text' | 'text+lines' | 'text+markers' | 'text+lines+markers' | 'none';
        name?: string;
        line?: {
            color?: string;
            dash?: 'solid' | 'dot' | 'dash' | 'longdash' | 'dashdot' | 'longdashdot';
            width?: number;
        };
        marker?: {
            color?: string;
            size?: number;
        };
        hoverinfo?: 'all' | 'none' | 'skip' | 'x' | 'y' | 'x+y' | 'x+y+z' | 'x+y+z+text' | 'x+y+z+text+name' | 'x+y+z+text+name+text';
        showlegend?: boolean;
    }

    interface PlotLayout {
        title?: string;
        autosize?: boolean;
        yaxis?: {
            title?: string;
        };
        xaxis?: {
            title?: string;
        };
        legend?: {
            x?: number;
            y?: number;
        };
    }

    interface PlotParams {
        data: PlotData[];
        layout?: PlotLayout;
        useResizeHandler?: boolean;
        className?: string;
        style?: React.CSSProperties;
    }

    class Plot extends Component<PlotParams> {}
    
    export default Plot;
}
