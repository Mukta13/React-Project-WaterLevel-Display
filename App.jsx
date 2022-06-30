import React, { useState } from 'react';
import './App.css';
import useAsyncFetch from './useAsyncFetch'; // a custom hook
import { Chart, registerables } from 'chart.js';
import { Bar } from "react-chartjs-2";
import MonthYearPicker from 'react-month-year-picker';

Chart.register(...registerables);

const months_array = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function App() {
  const possibleButtonTexts = ["See more", "See less"];
  const [showChart, setShowChart] = useState(false);
  const [buttonName, setButtonName] = useState(0);

  function buttonAction() {
    setShowChart(!showChart);// see more = true, see less = false
    setButtonName((buttonName + 1) % 2); // choosing name of button from array based on the current state
  }
  
  return (
    <main>
      <hr id = "blue_stripe"></hr>
      <div id = "container">
        <div id = "title">Water storage in California reservoirs</div>
        <div>
          <div id = "allBody">
            <div id = "textDiv">
              <p id = "textbody">
                California's reservoirs are part of a <a href="https://www.ppic.org/wp-content/uploads/californias-water-storing-water-november-2018.pdf">complex water storage system</a>.  The State has very variable weather, both seasonally and from year-to-year, so storage and water management is essential.  Natural features - the Sierra snowpack and vast underground aquifers - provide more storage capacity,  but reservoirs are the part of the system that people control on a day-to-day basis.  Managing the flow of surface water through rivers and aqueducts, mostly from North to South, reduces flooding and attempts to provide a steady flow of water to cities and farms, and to maintain natural riparian habitats.  Ideally, it also transfers some water from the seasonal snowpack into long-term underground storage.  Finally, hydro-power from the many dams provides carbon-free electricity. 
              </p>
              <p>
                California's water managers monitor the reservoirs carefully, and the state publishes daily data on reservoir storage.
              </p>
              <button id = "seeMore" onClick = { buttonAction }>{ possibleButtonTexts[buttonName] }</button>
            </div>
            <div id = "imageDiv">
              <img src="https://cdn.theatlantic.com/thumbor/HYdYHLTb9lHl5ds-IB0URvpSut0=/900x583/media/img/photo/2014/09/dramatic-photos-of-californias-historic-drought/c01_53834006/original.jpg
" id="WaterImg" />
              <div id = "caption">
                Lake Oroville in the 2012-2014 drought. Image credit: Justin Sullivan, from <i>The Atlantic</i> article "Dramatic Photos of California's Historic Drought."
              </div>
            </div>
          </div>
          { (showChart) ? <ChartDisplay /> : <div></div> }
        </div>
      </div>
    </main>
  );
}

// To initate Chart Display
function ChartDisplay(props) {
  const [visible, setVisible] = useState(false);
  const [waterDataChart, setWaterDataChart] = useState([]);
  //Displaying chart for April 2022 initially
  const [ChosenMonth, setChosenMonth] = useState(4);
  const [ChosenYear, setChosenYear] = useState(2022);

  function thenFunc(result) {
    setWaterDataChart(result);
    setVisible(false);
  }
//sending a post request
  useAsyncFetch("/query/WaterData", {}, thenFunc, () => {}, ChosenMonth, ChosenYear );
  //returning chart
  return(
    <div id = "chartDisplay">
      <div className = "ChartDisplayArea" id = "chartArea"><BarDisplay month = { ChosenMonth } year = { ChosenYear } data = { waterDataChart } /></div>
      <div className = "ChartDisplayArea" id = "datePickerArea"><DateChoose ChosenYear = { ChosenYear } ChosenMonth = { ChosenMonth }  setChosenYear = { setChosenYear } setChosenMonth = { setChosenMonth } visible = { visible } setVisible = { setVisible } /></div>
    </div>
  )
}


// bar chart display function
function BarDisplay(props) {
  let water_data = []
  for (const i in props.data) {
    water_data.push(props.data[i]);    
  }
  console.log("data", water_data);

  let Storage = {label: "Storage", data: water_data.map(item => item.waterStorage / 100000), backgroundColor: ["rgb(66, 145, 152)"]};
  let Capacity = {label: "Capacity", data: water_data.map(item => item.waterCapacity / 100000), backgroundColor: "rgb(120, 199, 227)"}

  let waterData = {};
  waterData.labels = Object.keys(props.data);//labels for the data
  waterData.datasets = [Storage, Capacity];// data for the chart
//bar chart features
  let options = {
    plugins: {
      title: {
        display: true,
        text: '',
      },
      legend: {
        display: false
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: {
          display:false
        }
      },
      y: {
        stacked: false,
        grid: {
          display:false
        }
      }
    },
  };

  
  
  return(
    <Bar options={options} data={waterData} />
  )
}

// choosing the date 
function DateChoose(props) {
  const setChosenMonth = props.setChosenMonth;
  const setChosenYear = props.setChosenYear;
  const ChosenMonth = props.ChosenMonth;
  const ChosenYear = props.ChosenYear;
  const visible = props.visible;
  const setVisible = props.setVisible;

  
  
  return(
    <div>
      Here's a quick look at some of the data on reservoirs from the <a href="https://cdec.water.ca.gov/index.html">California Data Exchange Center</a>, which consolidates climate and water data from multiple federal and state government agencies, and  electric utilities.  Select a month and year to see storage levels in the eleven largest in-state reservoirs.
      <br /><br />
      <div className="MonthText">Change month:</div>
      { (visible) ? <PickMonth ChosenMonth = { ChosenMonth } ChosenYear = { ChosenYear } setChosenMonth = { setChosenMonth } setChosenYear = { setChosenYear } /> : <div id = "dateDisplay" onClick = { () => { setVisible(true); } }>{months_array[ChosenMonth - 1]} {ChosenYear}</div> }
    </div>
  )
}

function PickMonth(props) {
  const setChosenMonth = props.setChosenMonth;
  const setChosenYear = props.setChosenYear;
  const ChosenMonth = props.ChosenMonth;
  const ChosenYear = props.ChosenYear;

 
  
  return(
    <MonthYearPicker
      ChosenMonth={ChosenMonth}
      ChosenYear={ChosenYear}
      onChangeYear={(year) => { setChosenYear(year); }}
      onChangeMonth={(month) => { setChosenMonth(month); }}
    />
  )
}

export default App;