var cy;
var mt = Mousetrap();
var slideout;

var selected = [];
var position = null;
var layout = null;
var running = false;

var cola_params = {
    name: 'cola',
    animate: true,
    randomize: true,
    maxSimulationTime: 1500
};


cy = cytoscape({
    container: document.getElementById('cy'),
    ready: function(){},
    elements:{
        nodes: [
        { data: { id: 'a1', content: 'Every person is going to die', 
            type: 'atom', typeshape: 'roundrectangle' }, 
            classes: 'atom-label' },
        { data: { id: 'a2', content: 'You are a person', 
            type: 'atom', typeshape: 'roundrectangle' },
            classes: 'atom-label' },
        { data: { id: 'a3', content: 'If you are going to die then you should treasure every moment',
            type: 'atom', typeshape: 'roundrectangle' }, 
            classes: 'atom-label' },
        { data: { id: 'a4', content: 'You are going to die', 
            type: 'atom', typeshape: 'roundrectangle' }, 
            classes: 'atom-label' },
        { data: { id: 'a5', content: 'You should treasure every moment', 
            type: 'atom', typeshape: 'roundrectangle' },
            classes: 'atom-label' },

        { data: { id: 's1', content: 'Default\nSupport', type: 'scheme', typeshape: 'diamond'  },
            classes: 'scheme-label' },
        { data: { id: 's2', content: 'Default\nSupport', type: 'scheme', typeshape: 'diamond'  },
            classes: 'scheme-label'},
        ],
        edges: [

        { data: { id: 'a1s1', source: 'a1', target: 's1' } },
        { data: { id: 'a2s1', source: 'a2', target: 's1' } },
        { data: { id: 'a3s2', source: 'a3', target: 's2' } },
        { data: { id: 's2a5', source: 's2', target: 'a5' } },
        { data: { id: 's1a4', source: 's1', target: 'a4' } },
        { data: { id: 'a4s2', source: 'a4', target: 's2' } },
        ]
        },
    style:[
        { selector: 'node', style: { 
            'content': 'data(content)', 
            'text-opacity': 0.8, 
            'width' : 'auto',
            'height' : 'auto',
            'text-valign': 'bottom', 
            'text-halign': 'right',
            'shape':'data(typeshape)'
            }
        },
        { selector: 'edge', style: { 
            'line-color': '#9dbaea',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#9dbaea', 
            'curve-style': 'bezier' 
            }
        },
        { selector: ':selected', style: {
            'border-width':'3',
            'border-color':'#333333'
            }
        },
        {
            selector: '.atom-label', style:{
                'text-wrap': 'wrap',
                'text-max-width': 80,
            }
        },
        {
            selector: '.scheme-label', style:{
                'text-wrap': 'wrap',
            }
        }                        
        ],
        boxSelectionEnabled: false,
        autounselectify: false,
        selectionType: 'single'
    });
  
    layout = build_cola_layout();
    layout.run();

    cy.on('cxttap', function (e)
    {
        console.log(e);
        position = e.renderedPosition;
        document.getElementById("sel1").options.selectedIndex=0;
        $('#newAtomModal').modal('show');
    });

    cy.on('taphold', function (e)
    { 
        position = e.renderedPosition;
        document.getElementById("sel1").options.selectedIndex=0;
        $('#newSchemeModal').modal('show');
    });

    cy.on('select', 'node', function (e)
    {
        selected.push(this.id());
        console.log(selected);
        if(selected.length == 2)
        {
            console.log(selected.length)
            cy.add([
                {group: "edges", data: {id: selected[0]+selected[1], source: selected[0], target: selected[1]}},
            ]);
            var s1 = cy.getElementById(selected[0]);
            console.log(s1.selected());
            var s2 = cy.getElementById(selected[1]);
            console.log(s2.selected());
            selected = [];
        }
    });

    cy.on('unselect', 'node', function (e)
    {
        selected.pop(this.id());
        console.log(selected);
    });

    cy.on('tap', 'node', function (e)
    { 
    }); 

    cy.on('layoutstart', function(){
        running = true;
    });
    
    cy.on('layoutstop', function(){
        running = false;
    });

/*
 *
 * Model Manipulation Functions
 *
 * */

    function add_new_atom_node() {
        var new_content = document.getElementById("new_atom_content").value; 
        cy.add([
            {group: "nodes", data: {id: Math.floor(Math.random() * 1024).toString(), 
                content: new_content, typeshape: 'roundrectangle' }, renderedPosition: position},
        ]);
        layout.stop();
        layout.run();
    }

    function add_new_scheme_node() {
        var scheme_idx = document.getElementById("sel1").options.selectedIndex;
        var scheme = document.getElementById("sel1").options[scheme_idx].text;
        cy.add([
            {group: "nodes", data: {id: Math.floor(Math.random() * 1024).toString(), 
                content: scheme, typeshape: 'diamond' }, renderedPosition: position},
        ]);
    };

    function delete_nodes() {    
        cy.remove( cy.getElementById(selected[0]) );
        selected = []
    };

    function download(text, name, type) {
        var a = document.getElementById("a");
        var file = new Blob([text], {type: type});
        a.href = URL.createObjectURL(file);
        a.download = name;
    };


/*
 *
 * Slideout functions
 *
 * */

    slideout = new Slideout( {
        'panel': document.getElementById('panel'),
        'menu': document.getElementById('menu'),
        'fx': 'ease',
        'side': 'right',
        'duration': 500,
        'padding': 256,
        'tolerance': 70
    });

    slideout.on('close', function() { cy.resize(); } );
    slideout.on('open', function() { cy.resize(); } );

/*
 *
 * Onload Query Selector Functions
 *
 * */

    window.onload = function() {

        document.querySelector('.toggle-button').addEventListener('click', function() {
            if(slideout.isOpen()) { slideout.close(); }
            else { slideout.open(); }
        });

        document.querySelector('.menu').addEventListener('click', function(eve) {
            if (eve.target.nodeName === 'A') { slideout.close(); }
        });
        
    };

/*
 *
 * Cola Layout Functions
 *
 *
 * */

function build_cola_layout( opts )
{
    for( var i in opts )
    {
        cola_params[i] = opts[i];
    }
        
    return cy.makeLayout( cola_params );
}


/* 
 *
 * Mousetrap - keypboard handler functions
 *
 * */

mt.bind('a', function() {
    console.log("ADD NODE OR EDGE");
});

mt.bind('d', function() { 
    console.log("DELETE SELECTED NODE");
    delete_nodes()
});

mt.bind('f', function() {
    console.log("FIX NODE PLACEMENT");
});

mt.bind('s', function() {
    console.log("SCALE SELECTED NODE");
});

mt.bind('t', function() {
    console.log("TOGGLE TEXT LABEL VISIBILITY");
});


/*
 *
 * Modal Dialog Functions
 *
 * */

$('.modal').on('hidden.bs.modal', function(e) { });



