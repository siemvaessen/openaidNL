var geoLocationVis = null;
ZzLocationVis = (function() {

  function ZzLocationVis(id) {
    this.init(id);
    geoLocationVis = this;
  }

  function shadeBlend(p,c0,c1) {
    var n=p<0?p*-1:p,u=Math.round,w=parseInt;
    if(c0.length>7){
        var f=c0.split(","),t=(c1?c1:p<0?"rgb(0,0,0)":"rgb(255,255,255)").split(","),R=w(f[0].slice(4)),G=w(f[1]),B=w(f[2]);
        return "rgb("+(u((w(t[0].slice(4))-R)*n)+R)+","+(u((w(t[1])-G)*n)+G)+","+(u((w(t[2])-B)*n)+B)+")"
    }else{
        var f=w(c0.slice(1),16),t=w((c1?c1:p<0?"#000000":"#FFFFFF").slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF;
        return "#"+(0x1000000+(u(((t>>16)-R1)*n)+R1)*0x10000+(u(((t>>8&0x00FF)-G1)*n)+G1)*0x100+(u(((t&0x0000FF)-B1)*n)+B1)).toString(16).slice(1)
    }
  }

  // INIT
  ZzLocationVis.prototype.init = function(id) {

    this.vis = null;
    this.vis_id = id;
    this.layout_gravity = 0;
    this.charge = -40;
    this.damper = 0.05;
    this.friction = 0.8;
    this.forces = d3.layout.force();
    this.circles = [];
    this.nodes = [];
    this.tooltip = CustomTooltip("sunburst_tooltip", 300);
    this.mapping = d3.layout.tree();
    this.mappingData = null;

    this.group_centers = {
      "89": { x: 350, y: 750, 'color': '#F6A000'},
      "298": { x: 350, y: 150, 'color': '#5598B5'},
      "189": { x: 350, y: 150, 'color': '#5598B5'},
      "289": { x: 350, y: 150, 'color': '#A6E4F4'},
      "498": { x: 350, y: 350, 'color': '#00BA96'},
      "380": { x: 350, y: 350, 'color': '#14EFC5'},
      "389": { x: 350, y: 350, 'color': '#C2FFF3'},
      "489": { x: 350, y: 350, 'color': '#C2FFF3'},
      "798": { x: 350, y: 550, 'color': '#4A671E'},
      "589": { x: 350, y: 550, 'color': '#8DB746'},
      "619": { x: 350, y: 550, 'color': '#C1F460'},
      "689": { x: 350, y: 550, 'color': '#ABDD1F'},
      "679": { x: 350, y: 550, 'color': '#EDFFC5'},
      "789": { x: 350, y: 550, 'color': '#EDFFC5'},
      "889": { x: 350, y: 950, 'color': '#EDFFC5'},
      "998": { x: 350, y: 950, 'color': '#FF7373'},
    };

    // init vis
    this.vis = d3.select('#' + id).append('svg')
        .attr('width', 1000)
        .attr('height', 2000)
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('version', '1.1')
        .attr('viewBox', '0 0 1000 500')
      .append('g')
        .attr('transform', 'translate(0,0)')
        .on('click', function(d){          
          geoLocationVis.tooltip.hideTooltip();
        });

    // init top
    var tophead = this.vis.append('rect')
      .attr('width', 740)
      .attr('height', 40)
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', '#fff')
      .attr('fill-opacity', 0.3);  

    // var left = this.vis.append('rect')
    //   .attr('width', 520)
    //   .attr('height', 1900)
    //   .attr('x', 0)
    //   .attr('y', 50)
    //   .attr('fill', '#fff')
    //   .attr('fill-opacity', 0.3);

    // // init mid
    // var mid = this.vis.append('rect')
    //   .attr('width', 210)
    //   .attr('height', 1900)
    //   .attr('x', 530)
    //   .attr('y', 50)
    //   .attr('fill', '#fff')
    //   .attr('fill-opacity', 0.3);

    // init right
    var righthead = this.vis.append('rect')
      .attr('width', 250)
      .attr('height', 40)
      .attr('x', 750)
      .attr('y', 0)
      .attr('fill', '#fff')
      .attr('fill-opacity', 0.3);
    var right = this.vis.append('rect')
      .attr('width', 250)
      .attr('height', 990)
      .attr('x', 750)
      .attr('y', 50)
      .attr('fill', '#fff')
      .attr('fill-opacity', 0.3);

    // top labels
    var leftText = this.vis.append('text')
      .attr('x', 260)
      .attr('y', 27)
      .attr('font-size', '19px')
      .attr('fill', '#444')
      .attr('style', 'text-anchor: start;')
      .text('Expenditure per region');

    var midText = this.vis.append('text')
      .attr('x', 545)
      .attr('y', 27)
      .attr('font-size', '19px')
      .attr('fill', '#444')
      .attr('style', 'text-anchor: start;')
      .text('Unspecified per region');

    var rightText = this.vis.append('text')
      .attr('x', 780)
      .attr('y', 27)
      .attr('font-size', '19px')
      .attr('fill', '#444')
      .attr('style', 'text-anchor: start;')
      .text('Worldwide unspecified');

    // this.direct = this.vis.append('g')
    //   .attr('class', 'direct')
    //   .attr('transform', 'translate(10,0)');
    // this.direct.append('text')
    //   .attr('x', 55)
    //   .attr('y', 25)
    //   .attr('font-size', '14px')
    //   .attr('fill', '#444')
    //   .attr('style', 'text-anchor: start;')
    //   .style('cursor', 'pointer')
    //   .text('Direct expenditure')
    //   .on('click', this.toggleDirect);
    // this.direct.append('rect')
    //   .attr('width', 30)
    //   .attr('height', 17)
    //   .attr('x', 15)
    //   .attr('y', 13)
    //   .attr('rx', 9)
    //   .attr('ry', 9)
    //   .attr('fill', '#fff')
    //   .attr('fill-opacity', 1)
    //   .attr('stroke', '#aaa')
    //   .attr('stroke-width', 1);
    // this.direct.append('circle')
    //   .attr('class', 'directCircle')
    //   .attr('cx', 23)
    //   .attr('cy', 22)
    //   .attr('r', 9)
    //   .attr('fill', '#000')
    //   .attr('fill-opacity', 1)
    //   .attr('stroke-width', 0);

    this.indirect = this.vis.append('g')
      .attr('class', 'direct')
      .attr('transform', 'translate(0,0)')
      .style('cursor', 'pointer')
      .on('click', this.toggleIndirect);
    this.indirect.append('text')
      .attr('x', 55)
      .attr('y', 25)
      .attr('font-size', '14px')
      .attr('fill', '#444')
      .attr('style', 'text-anchor: start;')
      .text('Indirect expenditure');
    this.indirect.append('rect')
      .attr('width', 30)
      .attr('height', 17)
      .attr('x', 15)
      .attr('y', 12)
      .attr('rx', 9)
      .attr('ry', 9)
      .attr('fill', '#fff')
      .attr('fill-opacity', 1)
      .attr('stroke', '#aaa')
      .attr('stroke-width', 1);
    this.indirect.append('circle')
      .attr('class', 'indirectCircle')
      .attr('cx', 38)
      .attr('cy', 21)
      .attr('r', 9)
      .attr('fill', '#00a99d')
      .attr('fill-opacity', 1)
      .attr('stroke-width', 0);

    this.regions_wrap = this.vis.append('g')
      .attr('class', 'regions-wrap')
      .attr('transform', 'translate(0,-20)');

    this.countries = this.vis.append('g')
      .attr('class', 'countries')
      .attr('transform', 'translate(0,-30)');
  };
  

  // FLOW
  ZzLocationVis.prototype.updateLegend = function(d) {

    var that = this;

    function setHiddenChildrenPosition(d, i){
      if(d._children){
        for (var y = 0;y < d._children.length;y++){
          that.group_centers[d._children[y].id]['y'] = 180 + (i * 190);
          setHiddenChildrenPosition(d._children[y], i);
        }
      }
    }

    // Compute the new tree layout.
    var nodes = that.mapping(that.mappingData).slice(1);

    // Update the nodes…
    var node = this.regions_wrap.selectAll("g.region")
        .data(nodes, function(d) { return d.id; });

    
    // Enter any new nodes
    var nodeEnter = node.enter().append("g")
        .attr("class", "region");

    //white bg
    var nodeEnterBg = nodeEnter.append('g')
      .attr("class", "background");

    nodeEnterBg
      .insert('rect')
      .attr('class','bg')
      .attr('width', 740)
      .attr('height', 200)
      .attr('x', -15)
      .attr('y', -130)
      .attr('fill', '#fff')
      .attr('fill-opacity', 0.3);

    //region name, clickable

    var nodeEnterClick = nodeEnter.append('g')
        .attr('class','clickme')
        .on("click", that.clickRegion);    

      nodeEnterClick
        .append('text')
        .attr('x', function(d){ return 10 + ((d.depth - 1) * 15); })
        .attr('y', -54)
        .attr('font-size', '17px')
        .attr('fill', '#444')
        .attr('style', 'text-anchor: start;')
        .text(function(d){ return d.name; })
        .each(function(d){ d.textWidth = this.getBBox().width; });

      nodeEnterClick
        .append("svg:path")
        .attr("d", d3.svg.symbol().type("triangle-up"))
        .attr("transform", function(d) { return "translate(" +  (((d.depth - 1) * 15) + d.textWidth + 24) + ","+ -59 + ") rotate(90)"; })
        .style("fill", "#444")
        .attr('fill-opacity',function(d){
          if(d._children) {
            return "1";
          }
          else {
            return "0";
          }
        });

      nodeEnterClick
        .insert('rect', ':first-child')
        .attr('width', function(d){ 
          if(d._children) {
            return d.textWidth + 36;
          }
          else {
            return d.textWidth + 22;
          } 
        })
        .attr('height', 26)
        .attr('x', function(d){ return 0 + ((d.depth - 1) * 15); })
        .attr('y', -72)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('fill', '#fff');

      //legend stuff level 1
      var nodeEnterLegend = nodeEnter.append('g')
        .attr('class','legend');

      nodeEnterLegend
        .append('circle')
        .attr('cx', function(d){ return 12 + ((d.depth - 1) * 15); })
        .attr('cy', -29)
        .attr('r', 4)
        .attr('fill', function(d){return d.color; });
      nodeEnterLegend
        .append('text')
        .attr('x', function(d){ return 25 + ((d.depth - 1) * 15); })
        .attr('y', -24)
        .attr('font-size', '15px')
        .attr('fill', '#444')
        .attr('style', 'text-anchor: start;')
        .text('Direct expenditure')
        .each(function(d){ d.textWidth = this.getBBox().width; });
      nodeEnterLegend
        .insert('rect', ':first-child')
        .attr('width', function(d){ return d.textWidth + 37; })
        .attr('height', 20)
        .attr('x', function(d){ return 0 + ((d.depth - 1) * 15); })
        .attr('y', -39)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('fill', '#fff');
    //legend stuff level 2
      nodeEnterLegend
        .append('circle')
        .attr('cx', function(d){ return 12 + ((d.depth - 1) * 15); })
        .attr('cy', -4)
        .attr('r', 6)
        .attr('fill', function(d){return shadeBlend(-0.6,d.color); });
      nodeEnterLegend
        .append('text')
        .attr('x', function(d){ return 25 + ((d.depth - 1) * 15); })
        .attr('y', 1)
        .attr('font-size', '15px')
        .attr('fill', '#444')
        .attr('style', 'text-anchor: start;')
        .text('Indirect expenditure')
        .each(function(d){ d.textWidth = this.getBBox().width; });
      nodeEnterLegend
        .insert('rect', ':first-child')
        .attr('width', function(d){ return d.textWidth + 37; })
        .attr('height', 20)
        .attr('x', function(d){ return 0 + ((d.depth - 1) * 15); })
        .attr('y', -14)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('fill', '#fff');


    var lastDepth = 0;
    var y = 0;


    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
      .duration(750)

      .attr("transform", function(d, i) { 
          
          if( ( d.depth != 1 && lastDepth == 1 ) || ( d.depth == 3 && lastDepth == 2) ) {
            y += 60;
          } else {
            y += 200;
          }

          lastDepth = d.depth;

          d.groupHeight = y;
          console.log(d.groupHeight);
        return "translate(15," + y + ")"; 
      })
      .each(function(d,i){ 
        that.group_centers[d.id]['y'] = d.groupHeight - 20;
        setHiddenChildrenPosition(d, i);
        console.log(d.groupHeight);
      });

    nodeUpdate.select("circle")
        .attr('r', 6)
        .attr('fill', function(d){return d.color; });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    //bg adjust on expanded
    nodeUpdate.select("rect.bg")
        .attr('height', function(d,i) {
          if( 
            ( d.id == 298 ||
              d.id == 498 ||
              d.id == 798) && !d._children ) {
            return "90";
          }
          else if ( 
            d.id == 189 ||
            d.id == 380 ||
            d.id == 589 ||
            d.id == 689 ) {
            return "170";
          }
          else if ((d.id == 619 && d._children) || d.id == 489) {
            return "200";
          }
          else if (d.id == 619 && !d._children) {
            return "100";
          }
          else {
            return "190";
          }
        })
        .attr('y', function(d,i){
          if ( 
            d.id == 189 ||
            d.id == 380 ||
            d.id == 589 ||
            d.id == 689 ) {
            return "-100";
          }
          else if (d.id == 619 || d.id == 489 ) {
            return "-140";
          }
          else {
            return "-130";
          }
        });

    //hide legend if expanded with children
    nodeUpdate.select("g.legend")
        .attr("opacity", function(d, i) { 
          if( 
            ( d.id == 298 ||
              d.id == 498 ||
              d.id == 798 ||
              d.id == 619) && !d._children ) {
            return "0";
          }

        });        

    // Transition exiting nodes to the parent's position.
    var nodeExit = node.exit().transition()
        .duration(750)
        .attr("opacity", 1e-6)
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

  }

  ZzLocationVis.prototype.updateData = function(data){
    if(!data) return false;

    var that = this;
    that.mappingData = data.mapping;
    that.data = data.data.countries;
    that.regionData = data.data.regions;

    var maxvalue = d3.max(that.data, function(d) { return d.value + d.value2; });
    this.radius_scale = d3.scale.pow().exponent(0.5).domain([0, maxvalue]).range([2, 20]);

    that.data.forEach(function(d) {
      d.fill = d.color;
      d.x = that.group_centers[d.group]['x'] + ((Math.random() * 40) - 20);
      d.y = that.group_centers[d.group]['y'] + ((Math.random() * 40) - 20);
      d.radius = that.radius_scale(d.value + d.value2);
      d.stroke = shadeBlend(-0.6,d.color);
      d.stroke_width = that.radius_scale(d.value2);
      d._stroke_width = d.stroke_width; 
      d._value2 = d.value2; 
    });

    that.nodes = that.data;

    that.force = d3.layout.force().nodes(that.nodes);


    
    // create / update bubbles, group them by region
    that.circles = that.countries.selectAll(".node")
      .data(that.nodes);
    
    that.circles.enter().append("circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", 0)
      .style("fill", function(d) { return d.fill; })
      .style("stroke", function(d) { return d.stroke; })
      .style("stroke-width", 0)
      .on("mouseover", that.mouseOver)
      .on('mouseout', that.mouseOut)
      .on('click', that.mouseClick)
      .call(that.force.drag);

    that.circles.transition()
      .attr("r", function(d) { return d.radius; })
      .style("fill", function(d) { return d.fill; })
      .style("stroke", function(d) { return d.stroke; })
      .style("stroke-width", function(d) { return d.stroke_width; });

    that.circles.exit()
      .remove();
    

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    this.mappingData.children.forEach(collapse);
    this.updateLegend(this.mappingData);
    this.update(); 
    this.updateRegionData();
  }


  ZzLocationVis.prototype.updateRegionData = function() {

    var that = this;

    var previousY = 0;

    that.regionData.forEach(function(d) {
      
      d.fill = that.group_centers[d.id].color;
      d.color = d.fill;
      d.x = 640;
      d.y = that.group_centers[d.id].y;
      // if(d.y == previousY){
        // d.radius = 0;
      // } else {
        d.radius = that.radius_scale(d.value);
      // }
      
      previousY = d.y;

      if(d.id == 998){
        d.x = 870;
        d.y = 501;
      }
    });

    var regionCircles = that.vis.selectAll(".regionNode")
      .data(that.regionData, function(d) { return d.id; });

    regionCircles.enter().append("circle")
      .attr("class", "regionNode")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", 0)
      .style("fill", function(d) { return d.fill; })
      .style("stroke", function(d) { return d.stroke; })
      .style("stroke-width", function(d) { return d.stroke_width; })
      .on('click', that.mouseClick);

    regionCircles.exit()
      .attr("r", 0)
      .remove();

    regionCircles.transition()
      .duration(750)
      .attr("r", function(d) { return d.radius; })
      .attr("cy", function(d) { return d.y; })
      .style("fill", function(d) { return d.fill; })
      .style("stroke", function(d) { return d.stroke; })
      .style("stroke-width", function(d) { return d.stroke_width; });
  }


  ZzLocationVis.prototype.update = function() {

    var that = this;
    that.force
      .gravity(this.layout_gravity)
      .charge(this.charge)
      .friction(this.friction)
      .chargeDistance(0)
      .on("tick", (function(_this) {
      return function(e) {
        return _this.circles
        .each(_this.move_towards_group(e.alpha)).attr("cx", function(d) {
          return d.x;
        }).attr("cy", function(d) {
          return d.y;
        });
      };
    })(this));

    that.force.start();
    
  }

  // HELPERS

  ZzLocationVis.prototype.charge = function(d) {
    return -Math.pow(d.radius + d.stroke_width, 2) / 12;
  };

  ZzLocationVis.prototype.move_towards_group = function(alpha) {
    return (function(_this) {
      return function(d) {
        var target = _this.group_centers[d.group];    
        d.x = d.x + (target.x - d.x) * _this.damper * alpha * 1.1;
        return d.y = d.y + (target.y - d.y) * _this.damper * alpha * 1.5;
      };
    })(this);
  };





  // LISTENERS
  ZzLocationVis.prototype.clickRegion = function(d){
    
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    geoLocationVis.updateLegend(d);
    geoLocationVis.update();
    geoLocationVis.updateRegionData();
  }

  ZzLocationVis.prototype.mouseOver = function(e){

    // show country id of all countries within this region
    var circlesInRegion = geoLocationVis.countries.selectAll(".nodeText")
      .data(geoLocationVis.nodes)
    .enter().append("text")
      .filter(function(d) { return d.group == e.group; })
      .attr("class", "nodeText")
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .attr('style', 'text-anchor: middle;')
      .attr("dominant-baseline", "central")
      .attr('font-size', function(d){ return Math.round(d.radius + (d.stroke_width / 2)); })
      .attr('fill', '#fff')
      .attr("pointer-events", "none")
      .text(function(d){ return d.id; });

  };

  ZzLocationVis.prototype.mouseOut = function(d){
    // hide country id's
    geoLocationVis.countries.selectAll('.nodeText').remove();
  };

  ZzLocationVis.prototype.mouseClick = function(d){
    // how details within the pop-up
    geoLocationVis.tooltip.showTooltip(d);
    d3.event.stopPropagation();
  }

  ZzLocationVis.prototype.toggleIndirect = function() {

    if (geoLocationVis.indirect.select('circle').attr('fill') != '#000000') {

        geoLocationVis.indirect.select('circle')
        .attr('cx', 23)
        .attr('fill', '#000000');

      // Update the nodes
      var node = geoLocationVis.vis.selectAll(".node")
        .data(geoLocationVis.data, function(d) { return d.id; });

      // Transition nodes to their new position.
      var nodeUpdate = node.transition()
        .duration(750)
        .each(function(d){ 
          d.value2 = 0;
          d.radius = geoLocationVis.radius_scale(d.value + d.value2)
        })
        .style("r", function(d){
          return d.radius;
        })
        .style("stroke-width", function(d){
          return d.value2;
        });

    }

    else {
        geoLocationVis.indirect.select('circle')
        .attr('cx', 38)
        .attr('fill', '#00a99d');

      geoLocationVis.vis.selectAll('g.direct circle')
        .transition()
        .attr('x', 40);

      // Update the nodes…
      var node = geoLocationVis.vis.selectAll(".node")
        .data(geoLocationVis.data, function(d) { return d.id; });

      // Transition nodes to their new position.
      var nodeUpdate = node.transition()
        .duration(750)
        .each(function(d){ 
          d.value2 = d._value2;
          d.stroke_width = geoLocationVis.radius_scale(d.value2);
          d.radius = geoLocationVis.radius_scale(d.value + d.value2)

        })
        .style("r", function(d){
          return d.radius;
        })
        .style("stroke-width", function(d){
          return d.stroke_width;
        });
    }

    

  }

  ZzLocationVis.prototype.toggleDirect = function() {
    geoLocationVis.indirect.select('circle')
      .attr('cx', 38)
      .attr('fill', '#00a99d');

    geoLocationVis.vis.selectAll('g.direct circle')
      .transition()
      .attr('x', 40);

    // Update the nodes…
    var node = geoLocationVis.vis.selectAll(".node")
      .data(geoLocationVis.data, function(d) { return d.id; });

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
      .duration(750)
      .each(function(d){ 
        d.value2 = d._value2;
        d.stroke_width = geoLocationVis.radius_scale(d.value2);
        d.radius = geoLocationVis.radius_scale(d.value + d.value2)

      })
      .style("r", function(d){
        return d.radius;
      })
      .style("stroke-width", function(d){
        return d.stroke_width;
      });



  }



  // TOOPTIP
  function CustomTooltip(tooltipId, width){
    var tooltipId = tooltipId;
    $("body").append("<div class='zz_tooltip geovis' id='"+tooltipId+"'></div>");
    
    if(width){
      $("#"+tooltipId).css("width", width);
    }
    
    hideTooltip();

    

    
    function showTooltip(d){
      function abbreviatedValue(input){

        var out = '';
        var addDot = false;

        if(input > 999999999){
          out = (input / 1000000000).toFixed(2) + ' mld';
        } else if(input > 999999){
          out = (input / 1000000).toFixed(2) + ' mln';
        } else if(input > 1000){
          addDot = true;
        }else {
          out = input.toFixed(0); 
        }
        // openaid -> comma's
        out = out.replace('.', ',');

        if(addDot == true){
          input = input.toString();
          out = input.substring(0, (input.length - 3)) + '.' + input.substring((input.length - 3), input.length);
        }

        return '€ ' + out;
      }


      if (d.id === parseInt(d.id, 10))
          $("#"+tooltipId).html('<div class="tt-header" style="background-color:'+d.color+';">'+d.name+'</div><div class="tt-text">Non-country related expenditure: '+abbreviatedValue(d.value)+'</div>');
      else
          $("#"+tooltipId).html('<div class="tt-header" style="background-color:'+d.color+';">'+d.name+'</div><div class="tt-text">Direct expenditure: '+abbreviatedValue(d.value)+'<br>Indirect expenditure: '+abbreviatedValue(d.value2)+'</div>');
      
      $("#"+tooltipId).show(0);
      
      updatePosition(d3.event);
    }
    
    function hideTooltip(){
      $("#"+tooltipId).hide();
    }
    
    function updatePosition(event){
      var ttid = "#"+tooltipId;
      var xOffset = 20;
      var yOffset = 10;
      
      var ttw = $(ttid).width();
      var tth = $(ttid).height();
      var wscrY = $(window).scrollTop();
      var wscrX = $(window).scrollLeft();
      var curX = (document.all) ? event.clientX + wscrX : event.pageX;
      var curY = (document.all) ? event.clientY + wscrY : event.pageY;
      var ttleft = ((curX - wscrX + xOffset*2 + ttw) > $(window).width()) ? curX - ttw - xOffset*2 : curX + xOffset;
      if (ttleft < wscrX + xOffset){
        ttleft = wscrX + xOffset;
      } 
      var tttop = ((curY - wscrY + yOffset*2 + tth) > $(window).height()) ? curY - tth - yOffset*2 : curY + yOffset;
      if (tttop < wscrY + yOffset){
        tttop = curY + yOffset;
      } 

      tttop = tttop - 140;
      ttleft = ttleft - 150;
      $(ttid).css('top', tttop + 'px').css('left', ttleft + 'px');
    }
    
    return {
      showTooltip: showTooltip,
      hideTooltip: hideTooltip,
      updatePosition: updatePosition
    }
  }

  return ZzLocationVis;
})();














