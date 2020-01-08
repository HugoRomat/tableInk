import { guid, mergeRectangles, calculateBB, getTransformation } from "../Helper";
import * as d3 from 'd3';
import textCursor from '../../../../static/cursorText.png'

export class SpeechRecognitionClass { 
    constructor(document) { 
        this.document = document;
        this.init();
    } 
    init() { 
        // var grammar = '#JSGF V1.0; grammar colors; public <color> = aqua | azure | beige | bisque | black | blue | brown | chocolate | coral | crimson | cyan | fuchsia | ghostwhite | gold | goldenrod | gray | green | indigo | ivory | khaki | lavender | lime | linen | magenta | maroon | moccasin | navy | olive | orange | orchid | peru | pink | plum | purple | red | salmon | sienna | silver | snow | tan | teal | thistle | tomato | turquoise | violet | white | yellow ;'
        this.recognition = new webkitSpeechRecognition();
        // var speechRecognitionList = new SpeechGrammarList();
        // speechRecognitionList.addFromString(grammar, 1);
        // recognition.grammars = speechRecognitionList;
        this.recognition.lang = 'en-EN';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 10;
        this.isStop = false;

        this.positionTyping = {'x':0, 'y':0}
    } 
    creatingEvent(texte){
        const eventAwesome = new CustomEvent('speech', {
            bubbles: true,
            detail: { "text": texte}
          });
    }
    animate(){
        var that = this;
        d3.select('#circlefeedBackVoice')
            .transition()
            .ease(d3.easeCubic)   
            .duration(1000).attr("r", 150)
            .transition()
            .ease(d3.easeCubic)   
            .duration(1000)
            .attr("r", 80)
            .on('end', function(d){
                if (that.isStop == false) that.animate()
            })
    }
    setAlphabet(alphabet){
        this.alphabet =  JSON.parse(JSON.stringify(alphabet));
    }
    getSpeechReco(){
        var that = this;
        return new Promise(function(resolve, reject) {
            that.recognition.start();
            that.recognition.onresult = function(event) {
                // console.log(event)
                var texte = event.results[0][0].transcript;
                that.stop();
                resolve(texte)
                // console.log(texte)
                
            }
            setTimeout(function(){
                that.stop();
            }, 10000) 
        })
    }
    start(position){
        console.log('START')
        var that = this;
        this.isStop = false;
        this.recognition.start();
        d3.select('#circlefeedBackVoice')
            .attr('cx', position.x)
            .attr('cy', position.y)
            .attr('r', 80)
            .attr('opacity', 1)
            .on('contextmenu', function(){d3.event.preventDefault();})
            

        this.animate();
            
         setTimeout(function(){
            that.stop();
         }, 10000)       
       
        

        this.recognition.onresult = function(event) {
            var texte = event.results[0][0].transcript;
            console.log(texte)
            // position[0] += 15
            that.addText(texte, position)
            that.stop();
            // that.document.addText({
            //     'id': guid(),
            //     'content': texte.toLowerCase(),
            //     'position': [position.x, position.y]
            // })
        }

    }
    stop(){
        this.isStop = true;
        this.recognition.stop();
        d3.select('#circlefeedBackVoice').attr('opacity', 0)
        .attr('cx', 0)
        .attr('cy', 0)
    }
    setPositionTyping(position){
        this.positionTyping.x = position[0]+20;
        this.positionTyping.y = position[1] -20;
        this.alphabet.forEach((d)=>{
            this.computeLinesPlaceHOlder(d)
        })
        this.oldValue = 0;

        // this.addPointer()
    }
    addPointer(){
        var that = this;
        d3.select('#textCursor').remove();
        var image = d3.select('svg').append("svg:image")
            .attr('x', that.positionTyping.x-40)
            .attr('y', that.positionTyping.y)
            .attr('width', 50)
            .attr('height', 50)
            .attr('id', 'textCursor')
            .attr("xlink:href", textCursor)

        setTimeout(function(){
            d3.select('#textCursor').remove();
        }, 3000)
    }
    addTextTyping(letter){
        
        var simplifiedTexte = letter.toLowerCase();
        var index = this.alphabet.indexOf(this.alphabet.find(x => x.id == simplifiedTexte));
        if (simplifiedTexte == ' '){
            this.positionTyping.x += 20;
        }
        else if (index > -1 && this.alphabet[index]['BBox'] != undefined){
            var BBox = this.alphabet[index]['BBox'];
            this.positionTyping.x += this.oldValue;
            this.oldValue = BBox.width;

            this.alphabet[index].lines.forEach((d)=>{
                var data = {
                    'points': d.points, 
                    'data': {'class':[], 'sizeStroke': this.document.sizePen, 'colorStroke': this.document.colorPen}, 
                    'id': guid(), 
                    'device':this.document.props.UIid,
                    'isAlphabet': true,
                    'position': [this.positionTyping.x,this.positionTyping.y],
                }
                this.document.addStrokeFilledData(data);
            })
        }
    }
    addText(texte, position){
        // console.log(texte)
        this.alphabet.forEach((d)=>{
            this.computeLinesPlaceHOlder(d)
        })
        var bufferX = 0;
        var oldValue = 0;

        var simplifiedTexte = texte.toLowerCase().split('');

        simplifiedTexte.forEach((d)=>{

            // console.log(this.alphabet)
            var index = this.alphabet.indexOf(this.alphabet.find(x => x.id == d));

            if (d == ' '){
                bufferX += 20;
            }
            else if (index > -1 && this.alphabet[index]['BBox'] != undefined){
                var BBox = this.alphabet[index]['BBox'];
                // console.log(letter['BBox'])
                bufferX += oldValue;
                oldValue = BBox.width;

                var transformPan = {'translateX': 0, 'translateY': 0}
                var item = d3.select('#panItems').node()
                if (item != null){
                    transformPan = getTransformation(d3.select('#panItems').attr('transform'));
                } 

                this.alphabet[index].lines.forEach((d)=>{
                    var data = {
                        'points': d.points, 
                        'data': {'class':[], 'sizeStroke': this.document.sizePen, 'colorStroke': this.document.colorPen}, 
                        'id': guid(), 
                        'device':this.document.props.UIid,
                        'isAlphabet': true,
                        'position': [bufferX + position.x - transformPan.translateX,position.y-50 - transformPan.translateY],
                    }
                    // console.log(data)
                    this.document.addStrokeFilledData(data);
                    // console.log(d)
                })
            }
        })
    
    }
    computeLinesPlaceHOlder(data){
        var arrayBBox = [];
        data.lines.forEach(line => {
            var BB = calculateBB(line['points']);
            BB.height = 100;
            BB.y = 0;
            arrayBBox.push(BB)
        });
        var polygon;
        if (arrayBBox.length > 1){
            polygon = mergeRectangles(arrayBBox[0], arrayBBox[1])
            for (var i = 2; i < arrayBBox.length; i++){
                polygon = mergeRectangles(polygon, arrayBBox[i])
            }
        } else polygon = arrayBBox[0]
        
        data.lines.forEach((d)=>{
            d['points'] = d['points'].map((f)=> [f[0] - polygon.x, f[1] - polygon.y])
        })
        // console.log(lines)
        data.BBox = polygon;
    }

    
 } 


