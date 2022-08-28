import { useState } from 'react';
import './App.css';
import { rowA, rowB, weight, dataKeys, urbanData, ruralData } from './Survey.js';


// Plots data in the table
const PlotData = ({ startIndex = 1, type, dataKeys, data, weight, filter }) => {
    let isTypeSet = 0;

    return data.map((item, index) => {
        let c = calculateC(dataKeys, item, weight);

        if (filter === 'poor' && c < 0.33) return;
        if (filter === 'wealthy' && c >= 0.33) return;

        const row = (
            <tr key={index}>
                <td>{isTypeSet ? '' : type}</td>
                <td>{startIndex++}</td>
                <td>{item.hhsize}</td>
                <td>{item.sc}</td>
                <td>{item.at}</td>
                <td>{item.n}</td>
                <td>{item.m}</td>
                <td>{item.e}</td>
                <td>{item.s}</td>
                <td>{item.w}</td>
                <td>{item.f}</td>
                <td>{item.c}</td>
                <td>{item.a}</td>
                <td>{c}</td>
                <td>{c < 0.33 ? 'No' : 'Yes'}</td>
                <td>{c < 0.33 ? 0 : c}</td>
            </tr>
        );

        if (!isTypeSet) isTypeSet = 1;

        return row;
    })

}

const parseWeight = (dataKeys, weight) => {
    let w = [];

    for (let i = 1; i < Object.keys(dataKeys).length; i++) {
        w.push(eval(weight[dataKeys[i]]));
    }

    return w;
}

// Calculate c by using the formula: 
const calculateC = (dataKeys, item, weight) => {
    let c = 0;

    for (let i = 1; i < Object.keys(dataKeys).length; i++) {
        c += item[dataKeys[i]] * eval(weight[dataKeys[i]]);
    }

    return c.toFixed(2);
}

const calculateM0 = (dataKeys, data, weight) => {
    // get total size
    let totalSize = 0;
    let hxck = 0;

    data.forEach(item => {
        let c = calculateC(dataKeys, item, weight);
        let ck = c < 0.33 ? 0 : c;
        hxck += item.hhsize * ck;
        totalSize += item.hhsize;
    })

    return hxck / totalSize;
}

const percentageContribution = (dataKeys, data, weight) => {
    let pc = [];
    let m0 = calculateM0(dataKeys, data, weight);
    let hc = headCount(dataKeys, data, weight, true);
    let w = parseWeight(dataKeys, weight);

    hc.forEach((item, i) => {
        let currentPC = item * w[i] / m0;

        pc.push(currentPC.toFixed(2));
    });

    return pc;
};

const PercentageContribution = ({ dataKeys, data, weight }) => {
    let pc = percentageContribution(dataKeys, data, weight);
    return <>
        {
            pc.map((item, index) => {
                return <td key={item + index}>{item}</td>
            })
        }
    </>;
}

// Same as calculateM0
const mpiCalculation = (dataKeys, data, weight) => {
    // get total size
    let totalSize = 0;
    let sumOfSizeXCk = 0;

    data.forEach(item => {
        let c = calculateC(dataKeys, item, weight);
        let ck = c < 0.33 ? 0 : c;
        sumOfSizeXCk += item.hhsize * ck;
        totalSize += item.hhsize;
    })

    return sumOfSizeXCk / totalSize;
}

const MPI = ({ dataKeys, data, weight }) => {
    let mpi = mpiCalculation(dataKeys, data, weight);
    return <td>{mpi.toFixed(2)}</td>;
}

const headCount = (dataKeys, data, weight, isCensored) => {
    // get total size
    let totalSize = 0;
    data.forEach(item => {
        totalSize += item.hhsize;
    })

    let headCount = [];
    for (let i = 1; i < 11; i++) {
        let currentHeadCount = 0;

        data.forEach(item => {
            let c = calculateC(dataKeys, item, weight);
            if (isCensored && c < 0.33) {
                return;
            };

            currentHeadCount += item.hhsize * item[dataKeys[i]];
        });

        headCount.push((currentHeadCount / totalSize).toFixed(2));
    }

    return headCount;
}

const HeadCount = ({ dataKeys, data, weight, isCensored = false }) => {
    let hc = headCount(dataKeys, data, weight, isCensored);
    return <>
        {
            hc.map((item, index) => {
                return <td key={item + index}>{item}</td>
            })
        }
    </>;
}

const overallHeadCountCalculation = (dataKeys, data, weight) => {
    // get total size
    let totalSize = 0;
    let sumOfSizeOfPoor = 0;

    data.forEach(item => {
        let c = calculateC(dataKeys, item, weight);
        let ck = c < 0.33 ? 0 : c;
        if (ck) {
            sumOfSizeOfPoor += item.hhsize;
        }
        totalSize += item.hhsize;
    })

    return sumOfSizeOfPoor / totalSize;
}

const OverallHeadCount = ({ dataKeys, data, weight }) => {
    let ohc = overallHeadCountCalculation(dataKeys, data, weight);
    return <td>{ohc.toFixed(2)}</td>;
}

const intensityCalculation = (dataKeys, data, weight) => {
    let mpi = mpiCalculation(dataKeys, data, weight);
    let overallHeadCount = overallHeadCountCalculation(dataKeys, data, weight);

    return mpi.toFixed(2) / overallHeadCount.toFixed(2);
}

const Intensity = ({ dataKeys, data, weight }) => {
    let intensity = intensityCalculation(dataKeys, data, weight);
    return <td>{intensity.toFixed(2)}</td>;
}

const App = () => {
    //const simulatedUrbanData = urbanData.concat(urbanData).concat(urbanData);
    const simulatedUrbanData = urbanData;
    const simulatedRuralData = ruralData;
    const allData = simulatedUrbanData.concat(ruralData);
    const ruralStartIndex = Object.keys(simulatedUrbanData).length + 1;
    const [filter, setFilter] = useState('');

    return (
        <div className="App">
            <header className="app-header">
                <h1>The Deprivation Matrix</h1>
            </header>
            <div className="main">
                <div className="filter">
                    <button className={filter === '' ? 'active' : ''} onClick={() => setFilter('')}>All</button>
                    <button className={filter === 'poor' ? 'active' : ''} onClick={() => setFilter('poor')}>Poor</button>
                    <button className={filter === 'wealthy' ? 'active' : ''} onClick={() => setFilter('wealthy')}>Wealthy</button>
                </div>
                <table>
                    <tbody>
                        <tr>
                            {
                                rowA.map((item, index) => {
                                    return <th key={item + index}>{item}</th>
                                })
                            }
                        </tr>
                        <tr>
                            <th colSpan={3}></th>
                            <th colSpan={2}>Education</th>
                            <th colSpan={2}>Health</th>
                            <th colSpan={6}>Standard of living</th>
                        </tr>
                        <tr>
                            {
                                rowB.map((item, index) => {
                                    return <th key={item + index}>{item}</th>
                                })
                            }
                        </tr>
                        <PlotData
                            type='Urban'
                            dataKeys={dataKeys}
                            data={simulatedUrbanData}
                            weight={weight}
                            filter={filter}
                        />
                        <PlotData
                            startIndex={ruralStartIndex}
                            type='Rural'
                            dataKeys={dataKeys}
                            data={simulatedRuralData}
                            weight={weight}
                            filter={filter}
                        />
                        <tr>
                            <td colSpan={3}>Weight(w)</td>
                            {
                                dataKeys.slice(1).map((item, index) => {
                                    return <td key={item + index}>{weight[item]}</td>
                                })
                            }
                        </tr>
                        <tr>
                            <td colSpan={3}>Uncensored Headcount Ratio</td>
                            <HeadCount
                                dataKeys={dataKeys}
                                data={allData}
                                weight={weight}
                            />
                        </tr>
                        <tr>
                            <td colSpan={3}>Censored Headcount Ratio</td>
                            <HeadCount
                                dataKeys={dataKeys}
                                data={allData}
                                weight={weight}
                                isCensored={true}
                            />
                        </tr>
                        <tr>
                            <td colSpan={3}>Percentage Contribution (in %)</td>
                            <PercentageContribution
                                dataKeys={dataKeys}
                                data={allData}
                                weight={weight}
                            />
                        </tr>
                        <tr>
                            <td colSpan={3}>MPI (in %)</td>
                            <MPI
                                dataKeys={dataKeys}
                                data={allData}
                                weight={weight}
                            />
                        </tr>
                        <tr>
                            <td colSpan={3}>Overall Headcount (in %)</td>
                            <OverallHeadCount
                                dataKeys={dataKeys}
                                data={allData}
                                weight={weight}
                            />
                        </tr>
                        <tr>
                            <td colSpan={3}>Intensity (in %)</td>
                            <Intensity
                                dataKeys={dataKeys}
                                data={allData}
                                weight={weight}
                            />
                        </tr>

                    </tbody>
                </table>
            </div>
        </div >
    );
}

export default App;
