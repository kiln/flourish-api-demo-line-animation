// Add your API key
const API_KEY = "<ADD YOUR API KEY HERE>";

// Hide replay button until viz has run
const elementToHide = document.getElementById("replayButton");
elementToHide.hidden = true;
const csvURL = "data.csv";

// Load CSV
d3.csv(csvURL, function (dataCSV) {
  // debugger;

  // get the list of dates/lines in this case that we want the graphic to load one by one
  const headers = Object.keys(dataCSV[0]).slice(0, -1);

  // Set up function to run the loading of lines with delay
  async function loopWithDelay(arr) {
    const colorP = [];
    for (let i = 0; i < arr.length; i++) {
      // As the data loads grey color gets darker through time
      const greyStart = 180;
      const stepSize = Math.round(greyStart / (arr.length - 1)); // Calculate step size for even distribution of greys through time
      if (i > 0) {
        const grayValue =
          greyStart + stepSize + (255 - greyStart) - i * stepSize;
        const shade = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        //if it is the most recent line put it in highlight color otherwise use the grey
        colorP[i - 1] = shade;
        colorP.push("#c02942");
      } else {
        colorP.push("#c02942");
      }

      //update data with next header
      opts.bindings = {
        data: {
          label: "Year",
          value: headers.slice(0, i + 1),
          metadata: [],
        },
      };

      const currentMonth = headers[i];
      //set the transition speed for how long the lines take to animate in.
      const transitionSpeed = 500;
      opts.state = {
        color: { categorical_palette: colorP },
        data_trans_duration: transitionSpeed,
        //set the line labels to just show the current month plus end of decades
        line_labels: {
          show_only_labels:
            "1960\n1970\n1980\n1990\n2000\n2010\n2020\n2023\n" +
            String(currentMonth),
        },
        layout: {
          subtitle: arr[i],
          subtitle_size_custom: 3,
        },
      };

      flourish_visualization.update(opts);

      await new Promise((resolve) => setTimeout(resolve, transitionSpeed)); // Pause for the transitionSpeed
    }
    elementToHide.hidden = false;
  }

  // pull in base viz chart
  const opts = {
    container: "#chart",
    api_key: API_KEY,
    base_visualisation_id: "18992411",
    // set up the bindings to match the data which comes in as an array-of-objects
    bindings: {
      data: {
        label: "Year",
        value: ["1950"],
        metadata: [],
      },
    },
    // use the loaded in data to populate the chart
    data: {
      data: dataCSV,
    },
  };

  const flourish_visualization = new Flourish.Live(opts);

  // Run the loop initially
  loopWithDelay(headers);

  // Replay button
  document.querySelector("button").addEventListener("click", function () {
    opts.bindings = {
      data: {
        label: "Year",
        value: ["1950"],
        metadata: [],
      },
    };
    flourish_visualization.update(opts);
    loopWithDelay(headers);
  });
});
