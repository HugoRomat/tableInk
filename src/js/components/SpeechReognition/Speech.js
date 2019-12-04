import { guid, mergeRectangles, calculateBB } from "../Helper";
import * as d3 from 'd3';

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
            
            
       
        

        this.recognition.onresult = function(event) {
            var texte = event.results[0][0].transcript;
            // console.log(texte)
            // position[0] += 15
            that.addText(texte, position)
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
    addText(texte, position){
        console.log(texte)
        this.alphabet.forEach((d)=>{
            this.computeLinesPlaceHOlder(d)
        })
        var bufferX = 0;
        var oldValue = 0;

        var simplifiedTexte = texte.toLowerCase().split('');

        simplifiedTexte.forEach((d)=>{
            var index = this.alphabet.indexOf(this.alphabet.find(x => x.id == d));

            if (d == ' '){
                bufferX += 20;
            }
            else if (index > -1 && this.alphabet[index]['BBox'] != undefined){
                var BBox = this.alphabet[index]['BBox'];
                // console.log(letter['BBox'])
                bufferX += oldValue;
                oldValue = BBox.width;
                this.alphabet[index].lines.forEach((d)=>{
                    var data = {
                        'points': d.points, 
                        'data': {'class':[], 'sizeStroke': this.document.sizePen, 'colorStroke': this.document.colorPen}, 
                        'id': guid(), 
                        'isAlphabet': true,
                        'position': [bufferX + position.x,position.y-50],
                    }
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


