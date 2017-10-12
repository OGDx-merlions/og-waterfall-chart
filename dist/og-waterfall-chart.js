'use strict';(function(){Polymer({is:'og-waterfall-chart',properties:{data:{type:Array,value:[],observer:'_dataChanged'},startingValue:{type:Object,value:{label:'Clean',value:97505}},floorValue:{type:Number,value:96000},yAxisTicks:{type:Number,value:5},yTickInterval:{type:Number,value:500},yAxisLabel:{type:String,value:''//LNG mass flow in kg/h
},isChartBuilt:{type:Boolean,value:false,readOnly:true},innerDimensions:{type:Object,readOnly:true,value:{width:960,height:500}},legends:{type:Array,value:[{label:'Increase',color:'#d43875'},{label:'Decrease',color:'#e2913b'},{label:'Total',color:'#5fbcf8'}]},//chart appearance related properties
width:{type:String,value:'100%'},height:{type:String,value:'300px'},barPadding:{type:Number,value:0.3},barMaxWidth:{type:Number,value:50},chartMargins:{type:Object,value:{top:40,right:30,bottom:100,left:50}},notResponsive:{type:Boolean,value:false}},listeners:{'barClick':'barClick'},barClick:function barClick(d,i){this.fire('bar-click',{data:d,index:i},{bubbles:false})},redrawChart:function redrawChart(){// window.setTimeout(function(){
var svg=d3.select('#waterSVG'),compStyles=d3.select('#chart').node(),width=parseInt(compStyles.clientWidth),height=parseInt(this.height),margin=this.chartMargins;// console.log(d3.select("#chart").node().clientWidth);
if(compStyles.clientWidth>0){this._setInnerDimensions({width:width-margin.left-margin.right,height:height-margin.top-margin.bottom});svg.select('.container').remove();svg.select('.legend').remove();this._buildChart(svg)}},ready:function ready(){this.scopeSubtree(this.$.waterSVG,true)},attached:function attached(){//if data is just empty then we can't continue building the chart
if(!this.data||this.data.length==0)return false;//TODO: remove this and just add a default height and width, let the window resize take care of this.
var compStyles=d3.select(this.$.chart).node()//window.getComputedStyle(d3.select("#chart").node())
,clientWidth=compStyles.clientWidth==0?960:compStyles.clientWidth,width=!this.notResponsive?parseInt(clientWidth):this.width,height=this.height;var svg=d3.select(this.$.waterSVG);var margin=this.chartMargins;this._setInnerDimensions({width:width-margin.left-margin.right,height:this.height-margin.top-margin.bottom});if(this.yAxisLabel!='')margin.left+=50;this._buildChart(svg);if(!this.notResponsive)d3.select(window).on('resize',this._resize.bind(this))},_processData:function _processData(){if(!this.data||this.data.length==0)return[];var data=[],cumulative=+this.startingValue,currentGrp=this.data[0].groupName;// console.log(this.startingValue);
// data.push({
//   name: this.data[0].groupName+'Total',
//   end: this.startingValue.value,
//   start: this.floorValue,
//   class: 'total',
//   label: 'Clean' //TODO: need to make this as a property
// });
for(var i=0;i<this.data.length;i++){for(var g=0;g<this.data[i].values.length;g++){var currBar=this.data[i].values[g];currBar.name=currBar.name+this.data[i].groupName;currBar.color=this.data[i].values[g].color;if(this.data[i].values[g].isComputed){currBar.class='total';currBar.start=this.floorValue;currBar.end=cumulative}else{currBar.start=cumulative<this.floorValue?this.floorValue:cumulative;currBar.class=this.data[i].groupName}cumulative+=this.data[i].values[g].value;if(this.data[i].values[g].isStarting){currBar.end=+this.startingValue;currBar.start=this.floorValue;currBar.class='total';cumulative=+this.startingValue}else{if(!this.data[i].values[g].isComputed)currBar.end=cumulative}currBar.label=this.data[i].values[g].label;currBar.isStarting=this.data[i].values[g].isStarting;currBar.isComputed=this.data[i].values[g].isComputed;data.push(currBar)}currentGrp=this.data[i].groupName;// if(currentGrp != this.data[i].groupNament){//create a total column
//   data.push({
//     name: 'Total' + i,
//     end: cumulative,
//     start: this.floorValue,
//     class: 'total',
//     //TODO: Need to find a better way to set the middle label
//     label: i==0 ? 'all degraded' : 'Clean'
//   });
// }
}return data},_xyBounds:function _xyBounds(data){var bounds={ceiling:d3.max(data,function(d){return d.end})+this.yTickInterval,x:d3.scaleBand().rangeRound([0,this.innerDimensions.width]).paddingInner(0.05),y:d3.scaleLinear().rangeRound([this.innerDimensions.height,0])//x column domain
};bounds.x.domain(data.map(function(d){return d.name}));//y column domain, from 0 to the biggest end value
//if this chart is going to display negatives then it should use d3.min(data, function(d){ return d.start })
bounds.y.domain([this.floorValue,bounds.ceiling]);return bounds},_axes:function _axes(data,bounds){var axes={xAxis:d3.axisBottom(bounds.x).tickFormat(function(d){//fetch the label field
//TODO: need to refactor this
for(var l=0;l<data.length;l++){if(data[l].name==d)return data[l].label}}),yAxis:d3.axisLeft(bounds.y).ticks(this.yAxisTicks).tickFormat(function(d){return d}).tickValues(d3.range(this.floorValue,bounds.ceiling,this.yTickInterval))};return axes},_buildAxes:function _buildAxes(axes,g,x){//to display the X axis on the chart
var barWidth=x.bandwidth()>this.barMaxWidth?this.barMaxWidth:x.bandwidth();g.append('g').attr('class','x axis').attr('transform','translate(-20,'+this.innerDimensions.height+')').call(axes.xAxis).selectAll('text').attr('y',20).attr('x',-20).attr('dy','.35em').call(this._wrapText,barWidth);// .attr("transform", "rotate(-60)")
// .style("text-anchor", "end");
//to display the Y axis on the chart
g.append('g').attr('class','y axis').call(axes.yAxis);g.append('g').attr('class','grid').call(axes.yAxis.tickSize(-this.innerDimensions.width).tickFormat(''))},_wrapText:function _wrapText(text,width){text.each(function(){var text=d3.select(this),words=text.text().split(/\s+/).reverse(),word,line=[],lineNumber=0,lineHeight=1.1,// ems
y=text.attr('y'),dy=parseFloat(text.attr('dy')),tspan=text.text(null).append('tspan').attr('x',0).attr('y',y).attr('dy',dy+'em');while(word=words.pop()){line.push(word);tspan.text(line.join(' '));if(tspan.node().getComputedTextLength()>width||tspan.node().getComputedTextLength()==0){line.pop();tspan.text(line.join(' '));line=[word];tspan=text.append('tspan').attr('x',0).attr('y',y).attr('dy',++lineNumber*lineHeight+dy+'em').text(word)}}})},_buildBars:function _buildBars(data,g,x,y){var formatComma=d3.format(',');//adding each bar from the data
//this are the columns. the gaps between them are based on the x() function created above
var bar=g.selectAll('.bar').data(data).enter().append('g').attr('class',function(d){return'bar '+d.class}).attr('transform',function(d){return'translate('+x(d.name)+',0)'}).on('click',this.barClick.bind(this));//on each column we add the actual bars that will appear
//the position("y") is based on either the start or end (whichever is bigger of the 2)
//the height of the bar is based on the difference of start and end (no negatives)
var barWidth=x.bandwidth()>this.barMaxWidth?this.barMaxWidth:x.bandwidth();bar.append('rect').attr('y',function(d){return y(Math.max(d.start,d.end))}).attr('height',function(d){return Math.abs(y(d.start)-y(d.end))}).attr('width',barWidth).attr('class',function(d){return d.color?'':'no-color'}).attr('fill',function(d){if(d.color)return d.color});// if()
//     .attr("fill");
//this is text that appears on the bar
bar.append('text').attr('x',barWidth/2).attr('y',function(d){return d.class=='decrease'?y(d.end):y(d.end)-10}).attr('dy',function(d){return(d.class=='negative'?'-':'')+'.75em'}).text(function(d){return d.class=='total'?formatComma(d.end):formatComma(d.end-d.start)});bar.filter(function(d){return d.class!='total'}).append('line').attr('class','connector').attr('x1',barWidth).attr('y1',function(d){return y(d.end)}).attr('x2',x.bandwidth()/(1-this.barPadding)-5).attr('y2',function(d){return y(d.end)})},_buildChart:function _buildChart(svg){var margin=this.chartMargins;//transform the data that the start and end properties are added
//the start of each data should be the value of the cumulative value so far
var data=this._processData();//setting x and y scales based on the dimensions of the SVG
var bounds=this._xyBounds(data),axes=this._axes(data,bounds);var x=bounds.x,y=bounds.y;svg.attr('width',this.innerDimensions.width+margin.left+margin.right).attr('height',this.innerDimensions.height+margin.top+margin.bottom)//this.innerDimensions.height + margin.top + margin.bottom)
.append('g').attr('class','container').attr('transform','translate('+margin.left+','+margin.top+')');var g=svg.select('.container');this._buildAxes(axes,g,x);this._buildBars(data,g,x,y);this._addLegend(svg);// text label for the y axis
if(this.yAxisLabel!='')g.append('text').attr('transform','rotate(-90)').attr('y',10-margin.left).attr('x',50-this.height/2).attr('dy','1em').style('text-anchor','middle').text(this.yAxisLabel);this._setIsChartBuilt(true)},_addLegend:function _addLegend(svg){if(!this.legends||this.legends.length==0)return false;var leg=svg.append('g').attr('class','legend');for(var i=0;i<this.legends.length;i++){leg.append('rect').attr('class','leg-rect').attr('x',i*100).attr('y',0).attr('width',3).attr('height',20).style('fill',this.legends[i].color);leg.append('text').attr('x',i*100+12).attr('y',0).attr('dy','1em').text(this.legends[i].label);// .attr("x", (this.width / 2))
// .style("text-anchor", "middle");
}// leg.attr("transform", "translate(" + ((this.innerDimensions.width / 2) - ((this.legends.length*100 + 15*this.legends.length) / 2)) + ",0)");
leg.attr('transform','translate('+(this.innerDimensions.width-(this.legends.length*100-35*this.legends.length))+',5)')},_dataChanged:function _dataChanged(){if(this.isChartBuilt){var svg=d3.select(this.$.waterSVG);svg.select('.container').remove();this._buildChart(svg)}},_resize:function _resize(){var svg=d3.select('#waterSVG'),compStyles=d3.select(this.$.chart).node(),width=parseInt(compStyles.clientWidth),height=parseInt(this.height),margin=this.chartMargins;this._setInnerDimensions({width:width-margin.left-margin.right,height:height-margin.top-margin.bottom});svg.select('.container').remove();svg.select('.legend').remove();this._buildChart(svg)}})})();
//# sourceMappingURL=og-waterfall-chart.js.map
