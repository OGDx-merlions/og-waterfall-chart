'use strict';function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true})}else{obj[key]=value}return obj}(function(){var _Polymer;Polymer((_Polymer={is:'og-waterfall-chart',properties:{data:{type:Array,value:[],observer:'_dataChanged'},startingValue:{type:Object,value:{label:'Clean',value:97505}},floorValue:{type:Number,value:96000},ceilingValue:{type:Number,value:0},yAxisTicks:{type:Number,value:5},yTickInterval:{type:Number,value:500},yAxisLabel:{type:String,value:''//LNG mass flow in kg/h"
},isChartBuilt:{type:Boolean,value:false,readOnly:true},innerDimensions:{type:Object,readOnly:true,value:{width:960,height:500}},legends:{type:Array,value:[{label:'Increase',color:'#d43875'},{label:'Decrease',color:'#e2913b'},{label:'Total',color:'#5fbcf8'}]},//chart appearance related properties
width:{type:String,value:'100%'},height:{type:String,value:'300px'},barPadding:{type:Number,value:0.3},barMaxWidth:{type:Number,value:50},chartMargins:{type:Object,value:{top:40,right:10,bottom:100,left:50}},notResponsive:{type:Boolean,value:false}},listeners:{'barClick':'barClick'},barClick:function barClick(d,i){this.fire('bar-click',{data:d,index:i},{bubbles:false})},ready:function ready(){this.scopeSubtree(this.$.waterSVG,true);this.scopeSubtree(this.$.legendWrap,true)},attached:function attached(){this.draw()},draw:function draw(){var d3=Px.d3,me=this,data=this.data;var margin={top:20,right:20,bottom:30,left:50},width=this.width-margin.left-margin.right,height=this.height-margin.top-margin.bottom;var svg=d3.select(this.$.waterSVG).attr('viewBox','0 0 '+this.width+' '+this.height).attr('preserveAspectRatio','xMidYMid meet').append('g').attr('transform','translate('+margin.left+','+margin.top+')');var cumulative=+this.startingValue;//process data
data.forEach(function(d){if(d.isComputed){d.class='total';d.start=me.floorValue;d.end=cumulative}else{d.start=cumulative<me.floorValue?me.floorValue:cumulative;d.class=d.value<0?'decrease':'increase'}cumulative+=d.value;if(d.isStarting){d.end=+me.startingValue;d.start=me.floorValue;d.class='total';cumulative=+me.startingValue}else{if(!d.isComputed)d.end=cumulative}d.label=d.label?d.label:d.name});//set ranges
var ceilDiff=+this.ceilingValue-d3.max(data,function(d){return d.end}),intervalMultiplier=Math.ceil(ceilDiff/me.yTickInterval),ceilAdd=intervalMultiplier*me.yTickInterval,ceiling=d3.max(data,function(d){return d.end})+(+me.ceilingValue==0?me.yTickInterval:ceilAdd);// console.log(d3.max(data, (d) => { return d.end; }));
var x=d3.scaleBand().rangeRound([0,width]).paddingInner(0.05);var y=d3.scaleLinear().range([height,0]).clamp(true);x.domain(data.map(function(d){return d.name}));//y column domain, from 0 to the biggest end value
//if this chart is going to display negatives then it should use d3.min(data, function(d){ return d.start })
y.domain([me.floorValue,ceiling]);svg.append('g').attr('class','container');var g=svg.select('.container');//build axes
//to display the X axis on the chart
var barWidth=x.bandwidth()>me.barMaxWidth?me.barMaxWidth:x.bandwidth();var xAxis=d3.axisBottom(x).tickFormat(function(d){//fetch the label field
//TODO: need to refactor this
for(var l=0;l<data.length;l++){if(data[l].name==d)return data[l].label}});var yAxis=d3.axisLeft(y).ticks(me.yAxisTicks).tickFormat(function(d){return d}).tickValues(d3.range(me.floorValue,ceiling,me.yTickInterval));// console.log(data);
g.append('g').attr('class','x axis').attr('transform','translate(-20,'+(me.height-50)+')').call(xAxis).selectAll('text').attr('y',15).attr('x',0).attr('dy','.35em').call(me._wrapText,barWidth);//to display the Y axis on the chart
g.append('g').attr('class','y axis').call(yAxis);//this is for the grid
g.append('g').attr('class','grid').call(yAxis.tickSize(-me.width).tickFormat(''));var formatComma=d3.format(',');//
// //adding each bar from the data
// //this are the columns. the gaps between them are based on the x() function created above
var bar=g.selectAll('.bar').data(data).enter().append('g').attr('class',function(d){return'bar '+d.class}).attr('transform',function(d){return'translate('+x(d.name)+',0)'}).on('click',me.barClick.bind(me));//on each column we add the actual bars that will appear
//the position("y") is based on either the start or end (whichever is bigger of the 2)
//the height of the bar is based on the difference of start and end (no negatives)
bar.append('rect').attr('y',function(d){return y(Math.max(d.start,d.end))}).attr('height',function(d){return Math.abs(y(d.start)-y(d.end))}).attr('width',barWidth).attr('class',function(d){return d.color?'':'no-color'}).attr('fill',function(d){if(d.color)return d.color});// //this is text that appears on the bar
bar.append('text').attr('x',barWidth/2).attr('y',function(d){return d.class=='decrease'?y(d.end):y(d.end)-10}).attr('dy',function(d){return(d.class=='negative'?'-':'')+'.75em'}).text(function(d){return d.class=='total'?formatComma(d.end):formatComma(d.end-d.start)});//
bar.filter(function(d){return d.class!='total'}).append('line').attr('class','connector').attr('x1',barWidth).attr('y1',function(d){return y(d.end)}).attr('x2',x.bandwidth()/(1-me.barPadding)-5).attr('y2',function(d){return y(d.end)});me._addLegend()}},_defineProperty(_Polymer,'barClick',function barClick(d,i){this.fire('bar-click',{data:d,index:i},{bubbles:false})}),_defineProperty(_Polymer,'_wrapText',function _wrapText(text,width){text.each(function(){var text=d3.select(this),words=text.text().split(/\s+/).reverse(),word,line=[],lineNumber=0,lineHeight=1.1,// ems
y=text.attr('y'),dy=parseFloat(text.attr('dy')),tspan=text.text(null).append('tspan').attr('x',0).attr('y',y).attr('dy',dy+'em');while(word=words.pop()){line.push(word);tspan.text(line.join(' '));if(tspan.node().getComputedTextLength()>width||tspan.node().getComputedTextLength()==0){line.pop();tspan.text(line.join(' '));line=[word];tspan=text.append('tspan').attr('x',0).attr('y',y).attr('dy',++lineNumber*lineHeight+dy+'em').text(word)}}})}),_defineProperty(_Polymer,'_addLegend',function _addLegend(){if(!this.legends||this.legends.length==0)return false;for(var i=0;i<this.legends.length;i++){var legWrap=d3.select(this.$.legendWrap).append('span').attr('class','legend-wrap');legWrap.append('span').attr('class','leg-text').attr('style','border-left: .3rem solid '+this.legends[i].color).text(this.legends[i].label)}//
//   var leg = svg.append("g").attr("class", "legend");
//
//   for(var i=0; i<this.legends.length; i++){
//     leg.append("rect")
//     .attr("class", "leg-rect")
//     .attr("x", i * 100)
//     .attr("y", 0)
//     .attr("width", 3)
//     .attr("height", 20)
//     .style("fill", this.legends[i].color);
//
//     leg.append("text")
//       .attr("x", (i * 100) + 12)
//       .attr("y", 0)
//       .attr("dy", "1em")
//       .text(this.legends[i].label)
//     // .attr("x", (this.width / 2))
//       // .style("text-anchor", "middle");
//   }
//
//   // leg.attr("transform", "translate(" + ((this.innerDimensions.width / 2) - ((this.legends.length*100 + 15*this.legends.length) / 2)) + ",0)");
//   leg.attr("transform", "translate(" + (this.innerDimensions.width - (this.legends.length*100 - 35*this.legends.length)) + ",5)");
}),_Polymer))})();
//# sourceMappingURL=og-waterfall-chart.js.map
