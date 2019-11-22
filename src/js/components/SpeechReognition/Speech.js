import { guid } from "../Helper";
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
        this.recognition.lang = 'fr-FR';
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
            console.log(texte)
            that.document.addText({
                'id': guid(),
                'content': texte.toLowerCase(),
                'position': [position.x, position.y]
            })
        }

    }
    stop(){
        this.isStop = true;
        this.recognition.stop();
        d3.select('#circlefeedBackVoice').attr('opacity', 0)
        .attr('cx', 0)
        .attr('cy', 0)
    }
    
 } 


