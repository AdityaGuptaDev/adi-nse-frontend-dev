"use client";

import React from "react";
import ReactECharts from 'echarts-for-react';

function DashboardOverview(props: any) {

    const options = {
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        yAxis: {
            type: 'value',
        },
        series: [
            {
                name: 'Sales',
                type: 'bar',
                data: [120, 200, 150, 80, 70, 110, 130],
                itemStyle: {
                    color: '#73C0DE',
                },
            },
        ],
    };

    return (
        <>
          {/* <Card className="border border-gray">
                <CardBody>
                    <div className="mb-1 flex items-center justify-between">
                        <Typography variant="h5" color="blue-gray" className="">
                            Overview
                        </Typography>
                    </div>
                    <div>
                        <Typography
                            variant="small"
                            className="font-bold"
                        >
                            You made 265 sales this month.
                        </Typography>
                    </div>
                    <div className="divide-y divide-gray-200 w-full">
                        <ReactECharts option={options} />
                    </div>
                </CardBody>
            </Card>   */}
        </>
    );
}

export default DashboardOverview;
