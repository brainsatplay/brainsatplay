// Awesome d3 chart stuff done by Florian Winkler (https://github.com/Fju), thanks for the contribution!

import * as d3 from 'd3';

const svg_width = 1600;
const svg_height = 1200;
const padding_y = 10;

export default class Graph {
  constructor() {
    // time scale for x coordinates
    this.x_scale = d3.scaleTime().range([0, svg_width]);
    // linear scale for y coordinates
    this.y_scale = d3.scaleLinear().range([svg_height - padding_y, padding_y]);

    // this will set the coordinates of a line's data points according
    // to the corresponding values
    this.line = d3
      .line()
      .x(
        function(d) {
          return this.x_scale(d.timestamp);
        }.bind(this)
      )
      .y(
        function(d) {
          return this.y_scale(d.value);
        }.bind(this)
      );

    this.bisectDate = d3.bisector(d => {
      return d.timestamp;
    }).left;

    // set viewBox so that the line gets stretched to whole screen without
    // updating the data points of the line
    this.graph_svg = d3
      .select('#graph')
      .attr('viewBox', '0 0 ' + svg_width + ' ' + svg_height)
      .attr('preserveAspectRatio', 'none');

    this.graph_g = this.graph_svg.append('g');

    this.overlay_svg = d3.select('#overlay');

    this.overlay_g = this.overlay_svg.append('g');

    this.overlay_svg.on('mousemove', this.onMousemove.bind(this));

    this.legend = this.overlay_g
      .append('g')
      .attr('class', 'legend')
      .attr('visibility', 'hidden');

    this.legend.append('rect').attr('class', 'legend__title');
    this.legend.append('rect').attr('class', 'legend__body');

    this.date_lbl = this.legend
      .append('text')
      .attr('y', 18)
      .attr('x', 10);

    this.trend_lbl = this.legend
      .append('text')
      .attr('y', 51)
      .attr('x', 30);

    this.cycle_lbl = this.legend
      .append('text')
      .attr('y', 79)
      .attr('x', 30);

    this.dashed_line = this.overlay_g
      .append('line')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5, 5')
      .attr('stroke', 'currentColor')
      .attr('x1', -2)
      .attr('x2', -2);

    window.addEventListener('resize', this.updateSize.bind(this));
    this.updateSize();

    this.lines = {
      trend: { color: '#278b85' },
      cycle: { color: '#4ecdc4' },
    };

    var i = 0;
    for (var n in this.lines) {
      this.lines[n].line = this.graph_g
        .append('path')
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('fill', 'none')
        .attr('stroke', this.lines[n].color)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 5);

      this.lines[n].current = this.overlay_g
        .append('circle')
        .attr('r', 6)
        .attr('fill', this.lines[n].color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('class', 'current')
        // hide
        .attr('cx', -50)
        .attr('cy', -50);

      this.legend
        .append('circle')
        .attr('cy', 49 + i++ * 28)
        .attr('class', 'legend__color')
        .attr('fill', this.lines[n].color);
    }
  }

  formatDate(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if (month < 10) month = '0' + month;

    var day = date.getDate();
    if (day < 10) day = '0' + day;

    return year + '-' + month + '-' + day;
  }

  updateSize() {
    var w = window.innerWidth,
      h = window.innerHeight;
    this.overlay_svg.attr('width', w).attr('height', h);
    this.graph_svg.attr('width', w).attr('height', h);

    this.dashed_line.attr('y1', 0).attr('y2', h);
  }

  setData(data) {
    this.data = Object.keys(data).map(function(date) {
      return {
        timestamp: new Date(date),
        trend: data[date].trend,
        cycle: data[date].cycle,
      };
    });
    var time_domain = d3.extent(
      this.data.map(function(d) {
        return d.timestamp;
      })
    );
    // set domain and scaling of x axis
    this.x_scale.domain(time_domain);

    var lines = this.lines;
    var value_domain = [
      // obtain minimum of data points that will be plotted
      d3.min(
        this.data.map(function(d) {
          return d3.min(
            Object.keys(lines).map(function(name) {
              return d[name];
            })
          );
        })
      ),
      // obtain maximum of data points that will be plotted
      d3.max(
        this.data.map(function(d) {
          return d3.max(
            Object.keys(lines).map(function(name) {
              return d[name];
            })
          );
        })
      ),
    ];
    // set domain and scaling of y axis
    this.y_scale.domain(value_domain);

    for (var n in this.lines) {
      var line_data = this.data.map(function(d) {
        return { timestamp: d.timestamp, value: d[n] };
      });
      this.lines[n].line.datum(line_data).attr('d', this.line);
    }
  }

  onMousemove() {
    if (!this.data) return;

    var mouse_x = this.x_scale.invert(d3.mouse(this.graph_g.node())[0]);

    var index = this.bisectDate(this.data, mouse_x, 1),
      d0 = this.data[index - 1],
      d1 = this.data[index];

    // pick the data point that is closest to the current mouse position
    var d = mouse_x - d0.timestamp > d1.timestamp - mouse_x ? d1 : d0;

    this.date_lbl.text(this.formatDate(mouse_x));
    this.trend_lbl.text('CO2 trend: ' + d.trend.toFixed(2) + ' ppm');
    this.cycle_lbl.text('CO2 cycle: ' + d.cycle.toFixed(2) + ' ppm');

    var dx = (this.x_scale(d.timestamp) * window.innerWidth) / svg_width;
    var dy = (this.y_scale(d.trend) * window.innerHeight) / svg_height;

    for (var n in this.lines) {
      this.lines[n].current.attr('cx', dx).attr('cy', (this.y_scale(d[n]) * window.innerHeight) / svg_height);
    }
    // show legend to the left of data points if the mouse is in the right half of the screen
    // otherwise to the right of data points
    var lx = dx < window.innerWidth / 2 ? dx + 25 : dx - 208 - 25;
    var ly = dy - (99 * dy) / window.innerHeight;

    this.legend.attr('visibility', 'visible').attr('transform', 'translate(' + lx + ',' + ly + ')');

    this.dashed_line.attr('x1', dx).attr('x2', dx);
  }
}
