// Custom per-tick axis label styling via decorate.
//
// Demonstrates:
// - Conditionally styling individual tick labels with badge backgrounds
// - Appending SVG elements (rect, text) to tick groups via .decorate()
// - Multiple visual states: highlighted (blue badge), flagged (gold badge), plain

var container = document.querySelector('d3fc-svg');
var margin = 10;

// Define which ticks get special treatment
var highlighted = [44]; // blue badge
var flagged = [60]; // gold badge with flag marker

var scale = d3
    .scaleLinear()
    .domain([40, 70]);

var axis = fc.axisBottom(scale)
    .tickValues([44, 50, 55, 60, 65])
    .decorate(function(s) {
        // On enter, insert a rect behind the text for badge backgrounds
        s.enter()
            .insert('rect', 'text')
            .attr('class', 'label-bg')
            .attr('rx', 4)
            .attr('ry', 4);

        // Style the badge background based on tick value
        s.select('.label-bg')
            .attr('fill', function(d) {
                if (highlighted.indexOf(d) !== -1) return '#4a90d9';
                if (flagged.indexOf(d) !== -1) return '#e8b84b';
                return 'none';
            })
            .attr('opacity', function(d) {
                if (highlighted.indexOf(d) !== -1 || flagged.indexOf(d) !== -1) return 1;
                return 0;
            });

        // Style the text color — white on colored badges, grey otherwise
        s.select('text')
            .style('fill', function(d) {
                if (highlighted.indexOf(d) !== -1 || flagged.indexOf(d) !== -1) return '#ffffff';
                return '#999999';
            })
            .style('font-weight', function(d) {
                if (highlighted.indexOf(d) !== -1 || flagged.indexOf(d) !== -1) return 'bold';
                return 'normal';
            });

        // Set final text content BEFORE measuring — flag marker must be
        // included in the bbox so the badge rect covers the full label
        s.select('text')
            .text(function(d) {
                if (flagged.indexOf(d) !== -1) return d + ' \u2691';
                return d;
            });

        // Now measure text and size the badge rect to fit
        s.each(function(d) {
            var g = d3.select(this);
            var text = g.select('text').node();
            if (!text) return;
            var bbox = text.getBBox();
            var padX = 12;
            var padY = 6;
            g.select('.label-bg')
                .attr('x', bbox.x - padX / 2)
                .attr('y', bbox.y - padY / 2)
                .attr('width', bbox.width + padX)
                .attr('height', bbox.height + padY);
        });
    });

d3.select(container)
    .on('draw', function() {
        d3.select(container)
            .select('svg')
            .append('g')
            .attr('transform', 'translate(0, 10)')
            .call(axis);
    })
    .on('measure', function(event) {
        var width = event.detail.width;
        scale.range([margin + 40, width - margin - 40]);
    });

container.requestRedraw();
