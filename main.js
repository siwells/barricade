//
//  main.js
//
//  A project template for using arbor.js
//

(function($){

  var Renderer = function(canvas){
    var canvas = $(canvas).get(0)
    var ctx = canvas.getContext("2d");
    var particleSystem
    var cnt = 0

    var that = {
      init:function(system){
        //
        // the particle system will call the init function once, right before the
        // first frame is to be drawn. it's a good place to set up the canvas and
        // to pass the canvas size to the particle system
        //
        // save a reference to the particle system for use in the .redraw() loop
        particleSystem = system

        // inform the system of the screen dimensions so it can map coords for us.
        // if the canvas is ever resized, screenSize should be called again with
        // the new dimensions
        particleSystem.screenSize(canvas.width, canvas.height) 
        particleSystem.screenPadding(80) // leave an extra 80px of whitespace per side
        
        // set up some event handlers to allow for node-dragging
        that.initMouseHandling()
      },
      
      redraw:function(){
        // 
        // redraw will be called repeatedly during the run whenever the node positions
        // change. the new positions for the nodes can be accessed by looking at the
        // .p attribute of a given node. however the p.x & p.y values are in the coordinates
        // of the particle system rather than the screen. you can either map them to
        // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
        // which allow you to step through the actual node objects but also pass an
        // x,y point in the screen's coordinate system
        // 



        ctx.fillStyle = "grey"
        ctx.fillRect(0,0, canvas.width, canvas.height)

        var nodecontent = false
        var edgecontent = true
        var nodelabel = true
        var edgelabel = true
        var directed = true
//        var schemes = false
        
        ctx.font = '15pt Verdana';


        particleSystem.eachEdge(function(edge, pt1, pt2){
          // edge: {source:Node, target:Node, length:#, data:{}}
          // pt1:  {x:#, y:#}  source position in screen coords
          // pt2:  {x:#, y:#}  target position in screen coords

          // draw a line from pt1 to pt2
            var nodeWidth = ctx.measureText(edge.target.data.label);
            var nodePadding = 10
            var nodeRadius = (nodeWidth.width/2) + nodePadding


            var headlen = 20;   // length of head in pixels
            var angle = Math.atan2(pt2.y-pt1.y, pt2.x-pt1.x);

            ctx.beginPath();
          ctx.strokeStyle = "white"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(pt1.x, pt1.y)
          ctx.lineTo(pt2.x, pt2.y)
           //var ctl1x = pt1.x+20
           //var ctl1y = pt1.y+20
           //var ctl2x = pt2.x+20
           //var ctl2y = pt2.y+20
          //ctx.bezierCurveTo( ctl1x, ctl1y, ctl2x, ctl2y, pt2.x, pt2.y);
            
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            var w = 10

            // ARROW HEADS
            if(directed)
            {
                var headlen = 20;   // length of head in pixels
                var angle = Math.atan2(pt2.y-pt1.y, pt2.x-pt1.x);
                var arrowPt2X = pt2.x
                var arrowPt2Y = pt2.y
  
                var dX = pt2.x - pt1.x
                var dY = pt2.y - pt1.y
                var hypo = Math.sqrt((dX*dX)+(dY*dY))
                var distance = hypo-(nodeRadius)

                var headX = pt1.x+distance*Math.cos(angle)
                var headY = pt1.y+distance*Math.sin(angle)

                ctx.beginPath();
                ctx.fillStyle = "white"
                ctx.moveTo(headX, headY);
                ctx.lineTo(headX-headlen*Math.cos(angle-Math.PI/6), headY-headlen*Math.sin(angle-Math.PI/6));
                ctx.lineTo(headX-headlen*Math.cos(angle+Math.PI/6), headY-headlen*Math.sin(angle+Math.PI/6));
                ctx.moveTo(headX-headlen*Math.cos(angle-Math.PI/6), headY-headlen*Math.sin(angle-Math.PI/6));
                ctx.lineTo(headX-headlen*Math.cos(angle+Math.PI/6), headY-headlen*Math.sin(angle+Math.PI/6));
                ctx.closePath();
                ctx.fill();
            }

            ctx.stroke()

        })

        particleSystem.eachNode(function(node, pt){
          // node: {mass:#, p:{x,y}, name:"", data:{}}
          // pt:   {x:#, y:#}  node position in screen coords

            var labelWidth = ctx.measureText(node.data.label);
            var padding = 8
            var radius = (labelWidth.width/2)+padding
   //         ctx.fillStyle = (node.data.alone) ? "orange" : "black"

            if(node.data.type == "conclusion")
            {
                ctx.fillStyle = "grey"
                ctx.strokeStyle = "white"
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, radius, 0, Math.PI*2, true);
                ctx.closePath();
            }
            else if (node.data.type == "scheme")
            {
                ctx.fillStyle = "orange"
                ctx.strokeStyle = "white"
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.arc(pt.x, pt.y, radius, 0, Math.PI*2, true);
                ctx.closePath();


            }
            else if (node.data.type == "premise")
            {
                ctx.fillStyle = "grey"
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.arc(pt.x, pt.y, radius, 0, Math.PI*2, true);
                ctx.closePath();
                
            }
            else
            {
                ctx.fillStyle = "white"
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 1, 0, Math.PI*2, true);
                ctx.closePath();
                
            }
            ctx.fill();
//ctx.fillText("hello", 25, 25);
            if(nodelabel)
            {
                var wdt = ctx.measureText(node.data.label);
                var offs = wdt.width/2
                ctx.fillStyle = "black"
                ctx.fillText(node.data.label, pt.x-offs, pt.y);
                ctx.textBaseline = "middle";
            }

            if(nodecontent)
            {
                var label = node.data.content
                ctx.fillStyle = "black"
                ctx.fillText(label, pt.x+radius, pt.y+radius);
            }
//            ctx.fill();
            ctx.stroke();
  
        })    			
      },
      
      initMouseHandling:function(){
        // no-nonsense drag and drop (thanks springy.js)
        var dragged = null;
        

        // set up a handler object that will initially listen for mousedowns then
        // for moves and mouseups while dragging
        var handler = {

            over:function(e){
                var pos = $(canvas).offset();
                _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
                dragged = particleSystem.nearest(_mouseP);

/*                if(dragged.node.data.type == "conclusion")
                {
                    document.getElementById("demo").innerHTML=dragged.node.data.content
                    document.getElementById("demo").style.background ='#00ff00';

                }
                else if(dragged.node.data.type == "premise")
                {
                    document.getElementById("demo").innerHTML=dragged.node.data.content
                    document.getElementById("demo").style.background ='#0000ff';
                }
                else
                {
                    document.getElementById("demo").innerHTML=dragged.node.data.content
                    document.getElementById("demo").style.background ='#dedede';
                }*/

//                document.getElementById("arg_content").innerHTML=dragged.node.data.content
//                document.getElementById("arg_content").style.background ='#00ff00';
                document.getElementById("concl").innerHTML=dragged.node.data.content
                
                return false
            },


          clicked:function(e){
            var pos = $(canvas).offset();
            _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
            dragged = particleSystem.nearest(_mouseP);

            if (dragged && dragged.node !== null){
              // while we're dragging, don't let physics move the node
              dragged.node.fixed = true
            }

            $(canvas).bind('mousemove', handler.dragged)
            $(window).bind('mouseup', handler.dropped)

            return false
          },

          dragged:function(e){
            var pos = $(canvas).offset();
            var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)

            if (dragged && dragged.node !== null){
              var p = particleSystem.fromScreen(s)
              dragged.node.p = p
            }

            return false
          },

          dropped:function(e){

            if (dragged===null || dragged.node===undefined) return
            
            if (dragged.node !== null) dragged.node.fixed = false
            dragged.node.tempMass = 1000
            dragged = null
            $(canvas).unbind('mousemove', handler.dragged)
            $(window).unbind('mouseup', handler.dropped)
            _mouseP = null
            return false
          }
        }
        
        // start listening
        $(canvas).mousemove(handler.over);
        $(canvas).mousedown(handler.clicked);


      },
      
    }
    return that
  }    

  $(document).ready(function(){

    var sys = arbor.ParticleSystem(500, 150, 0.75) // create the system with sensible repulsion/stiffness/friction
    sys.parameters({gravity:true}) // use center-gravity to make the graph settle nicely (ymmv)
    sys.renderer = Renderer("#viewport") // our newly created renderer will have its .init() method called shortly by sys...

    // add some nodes to the graph and watch it go...
    sys.addNode('a', {"type":"conclusion", "label":"C1", "content":"conc", alone:true, mass:.95})
    sys.addNode('b', {"type":"scheme", "label":"S1", "content":"DEFAULT SCHEME", alone:true, mass:.95})
    sys.addNode('c', {"type":"premise", "label":"P1", "content":"prem 1", alone:true, mass:.25})
    sys.addNode('d', {"type":"premise", "label":"P2", "content":"prem 2", alone:true, mass:.25})
    sys.addNode('e', {"type":"premise", "label":"P3", "content":"prem 3", alone:true, mass:.25})

    sys.addNode('B_C', {"type":"conclusion", "label":"P3", "content":"prem 3", alone:true, mass:.25})
    sys.addNode('B_S', {"type":"scheme", "label":"S2", "content":"Scheme 2", alone:true, mass:.25})
    sys.addNode('B_P1', {"type":"premise", "label":"P3", "content":"prem 3", alone:true, mass:.25})
    sys.addNode('B_P2', {"type":"premise", "label":"P3", "content":"prem 3", alone:true, mass:.25})

    sys.addNode('C_S', {"type":"scheme", "label":"S3", "content":"scheme 3", alone:true, mass:.25})

    sys.addEdge('b','a')
    sys.addEdge('c','b')
    sys.addEdge('d','b')
    sys.addEdge('e','b')

    sys.addEdge('B_S','B_C')
    sys.addEdge('B_P1','B_S')
    sys.addEdge('B_P2','B_S')

    sys.addEdge('B_C','C_S')
    sys.addEdge('C_S','c')

    // or, equivalently:
    //
    // sys.graft({
    //   nodes:{
    //     f:{alone:true, mass:.25}
    //   }, 
    //   edges:{
    //     a:{ b:{},
    //         c:{},
    //         d:{},
    //         e:{}
    //     }
    //   }
    // })

    
  })

})(this.jQuery)
