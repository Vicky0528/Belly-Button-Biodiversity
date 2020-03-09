// Belly Button Biodiversity - Plotly.js

function buildMetadata(sample) {

  // @TODO: Complete the Following Function that Builds the Metadata Panel

  // Use `d3.json` to Fetch the Metadata for a Sample
    d3.json(`/metadata/${sample}`).then((data) => {
        // Use d3 to Select the Panel with id of `#sample-metadata`
        var PANEL = d3.select("#sample-metadata");
        // Use `.html("") to Clear any Existing Metadata
        PANEL.html("");
        // Use `Object.entries` to Add Each Key & Value Pair to the Panel
        // Hint: Inside the Loop, Use d3 to Append New Tags for Each Key-Value in the Metadata
        Object.entries(data).forEach(([key, value]) => {
          PANEL.append("h6").text(`${key}:${value}`);
        })
        // BONUS: Build the Gauge Chart
          buildGauge(data.wfreq);
    })
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to Fetch the Sample Data for the Plots
  d3.json(`/samples/${sample}`).then((data) => {
    // @TODO: Build a Bubble Chart Using the Sample Data

    const otu_id = data.otu_ids;
    const otu_label = data.otu_labels;
    const sample_value = data.sample_values;

    var otu_ids = otu_id.split(',');
    var otu_labels = otu_label.split(';');
    var sample_values = sample_value.split(",");
    var otu_ids_lables = otu_ids.map(x => 'OTU '+ x);

    console.log(otu_ids);
    console.log(otu_labels);
    console.log(sample_values);

    // @TODO: Build a Pie Chart
    let bubbleLayout = {
      margin: { t: 0 },
      hovermode: "closests",
      xaxis: { title: "OTU ID"}
    }

    let bubbleData = [
      {
        x: otu_ids,
        y: sample_values,
        text: otu_labels,
        mode: "markers",
        marker: {
          size: sample_values,
          color: otu_ids,
          colorscale: "Earth"
        }
      }
    ]

    Plotly.plot("bubble", bubbleData, bubbleLayout);

    //Create the Trace
    var trace = {
      x: sample_values.slice(0,10).reverse(),
      y: otu_ids_lables.slice(0,10).reverse(),
      hovertext: otu_labels.slice(0,10).reverse(),
      hoverinfo: "hovertext",
      type: "bar",
      orientation: "h"
    };
    //Create the data array for the plot
    var bardata = [trace];
    //Create layout
    var barlayout = {
      margin: {
          l: 100,
          // r: 20,
          t: 0
          // b: 20
      },
      width:400,
      height:500,
  };

  //console.log(data);
  Plotly.newPlot("bar", bardata, barlayout);

    // HINT: Use slice() to Grab the Top 10 sample_values,
    // otu_ids, and otu_labels (10 Each)
    // let pieData = [
    //   {
    //     values: sample_values.slice(0, 10),
    //     labels: otu_ids.slice(0, 10),
    //     hovertext: otu_labels.slice(0, 10),
    //     hoverinfo: "hovertext",
    //     type: "pie"
    //   }
    // ];
    
    // let pieLayout = {
    //   margin: { t: 0, l: 0 }
    // };

    // Plotly.plot("pie", pieData, pieLayout)
})
}

function init() {
  // Grab a Reference to the Dropdown Select Element
  var selector = d3.select("#selDataset");

  // Use the List of Sample Names to Populate the Select Options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the First Sample from the List to Build Initial Plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);

  });
}

function optionChanged(newSample) {
  // Fetch New Data Each Time a New Sample is Selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the Dashboard
init();